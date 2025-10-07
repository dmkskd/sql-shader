import * as d3 from 'd3';
import * as d3_flame_graph from 'd3-flame-graph';

/**
 * FlameGraph rendering module for ClickHouse profiler.
 * Handles flame graph visualization from trace log data.
 */
export class ClickHouseProfilerFlamegraph {
  constructor() {
    // No dependencies needed
  }

  /**
   * Renders a FlameGraph from the ClickHouse trace log.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {HTMLElement} container The DOM element to render the chart into.
   * @param {string} groupBy The grouping strategy ('none', 'method', 'class', 'system').
   */
  renderFlamegraph(traceLog, container, groupBy = 'none') {
    if (!traceLog || traceLog.length === 0) {
      container.innerHTML = '<p>No CPU trace data to render.</p>';
      return;
    }

    container.innerHTML = '';

    // --- Step 1: Build the full, ungrouped flame graph data structure ---
    const root = { name: "root", value: 0, children: [], original: { fullName: "root" } };
    let totalValue = 0;
    traceLog.forEach(row => {
      totalValue += row.value;
      let currentNode = root;
      const stack = row.trace.reverse(); // Build stack from bottom up
      stack.forEach(address => {
        const functionName = address || 'unknown';
        let childNode = currentNode.children.find(c => c.original.fullName === functionName);
        if (!childNode) {
          childNode = {
            name: this.simplifyFunctionName(functionName),
            value: 0, // This is self-time, exclusive of children
            children: [],
            original: { fullName: functionName }
          };
          currentNode.children.push(childNode);
        }
        currentNode = childNode;
      });
      currentNode.value += row.value; // Add sample value to the leaf's self-time
    });

    // After building the tree with self-times, propagate the values up to the parents
    // to get the inclusive time for each node.
    function sumValues(node) {
      const childrenValue = node.children.reduce((sum, child) => sum + sumValues(child), 0);
      // The node's total value is its self-time plus the total time of all its children.
      node.value += childrenValue;
      return node.value; // Return the total inclusive value
    }
    sumValues(root);

    // --- Step 2: If grouping is enabled, collapse the full graph ---
    if (groupBy !== 'none') {
      const getGroupName = (name) => {
        if (!name) return 'unknown';
        if (groupBy === 'method') return this.simplifyFunctionName(name);
        if (groupBy === 'class') return this.getClassName(name);
        if (groupBy === 'system') return this.getSystemCategory(name);
        return name;
      };

      // This recursive function collapses nodes from the bottom up.
      const collapseNode = (node) => {
        if (!node.children || node.children.length === 0) return;

        node.children.forEach(collapseNode); // Recurse to collapse children first (bottom-up)

        const nodeGroupName = getGroupName(node.original.fullName);
        let hasChanged = true;
        // Use a while loop to repeatedly collapse until no more changes are made in one pass.
        // This correctly handles deeply nested stacks of the same group.
        while (hasChanged) {
          hasChanged = false;
          const newChildren = [];
          for (const child of node.children) {
            const childGroupName = getGroupName(child.original.fullName);
            if (childGroupName === nodeGroupName) {
              newChildren.push(...child.children); // Absorb grandchildren
              hasChanged = true;
            } else {
              newChildren.push(child);
            }
          }
          node.children = newChildren;
        }
        node.name = nodeGroupName; // Update the display name to the group name
      };
      collapseNode(root);
    }

    console.log(`[Debug] Rendering flamegraph with grouping: ${groupBy}.`);

    // Create a color scale from "cold" (green) to "hot" (red) based on sample count.
    // We use a sqrt scale to better differentiate the smaller values.
    const colorScale = d3.scaleSequential(d3.interpolateRgb("hsl(120, 50%, 35%)", "hsl(0, 80%, 45%)")).domain([0, Math.sqrt(root.value)]);

    // Define a function to create rich HTML tooltips
    const labelHandler = (d) => {
      const percent = totalValue > 0 ? ((d.data.value / totalValue) * 100).toFixed(2) : 0;
      // Assuming a 1ms sample interval (1,000,000 ns), samples are roughly equivalent to milliseconds.
      const estimatedMs = d.data.value;
      let nameForTooltip = d.data.original.fullName || d.data.name;

      // For grouped views, provide a more descriptive tooltip.
      if (groupBy === 'class' || groupBy === 'system') {
        nameForTooltip = `All methods in: <strong>${d.data.name}</strong>`;
      }

      return `${nameForTooltip}<br>Time (est.): ${estimatedMs.toLocaleString()} ms (${percent}%)<br>Samples: ${d.data.value.toLocaleString()}`;
    };

    const flamegraphChart = d3_flame_graph.flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .setColorMapper(d => colorScale(Math.sqrt(d.data.value))) // Color by sample count
      .label(labelHandler); // Use our custom tooltip function

    d3.select(container).datum(root).call(flamegraphChart);

    return root; // Return the root for testing purposes
  }

  /**
   * Extracts the C++ class/namespace from a full function name.
   * @param {string} name The full function name.
   * @returns {string} The class or namespace.
   */
  getClassName(name) {
    if (!name) return 'unknown';

    // Step 1: Isolate the function signature from its arguments by finding the first '('.
    const openParenIndex = name.indexOf('(');
    const signature = (openParenIndex !== -1) ? name.substring(0, openParenIndex) : name;

    // Step 2: On the signature without arguments, find the last '::'.
    const lastSeparatorIndex = signature.lastIndexOf('::');
    if (lastSeparatorIndex > 0) {
      // Step 3: Return the substring before the last '::' which is the full class/namespace.
      return signature.substring(0, lastSeparatorIndex);
    }
    return signature; // Not a class method (or no namespace), return the signature.
  }

  /**
   * Assigns a high-level system category to a function name.
   * @param {string} name The full function name.
   * @returns {string} The system category.
   */
  getSystemCategory(name) {
    if (!name) return 'Unknown';
    if (name.includes('Parser')) return 'Parsing';
    if (name.includes('Interpreter') || name.includes('Expression')) return 'Execution';
    if (name.includes('Aggregate') || name.includes('Aggregator')) return 'Aggregation';
    if (name.includes('MergeTree') || name.includes('Storage')) return 'Storage & I/O';
    if (name.includes('ReadBuffer') || name.includes('WriteBuffer')) return 'Storage & I/O';
    if (name.includes('Join') || name.includes('HashTable')) return 'Joins';
    if (name.includes('Function')) return 'Functions';
    if (name.includes('Block')) return 'Data Blocks';
    if (name.includes('JIT')) return 'JIT Compilation';
    if (name.includes('Planner') || name.includes('Analyzer')) return 'Query Planning';
    if (name.includes('std::')) return 'Standard Library';
    if (name.includes('DB::')) return 'Database Core';
    if (name.startsWith('n-') || name.startsWith('k-')) return 'Kernel/System'; // Common prefixes for kernel symbols

    return 'Other';
  }

  /**
   * Simplifies a C++ function name by removing template arguments for better display.
   * @param {string} name The full function name.
   * @returns {string} The simplified function name.
   */
  simplifyFunctionName(name) {
    if (!name) return 'unknown';
    // This function is designed to aggressively shorten complex C++ function names.
    let simplified = name;

    // 1. Remove all template arguments <...>
    simplified = simplified.replace(/<[^<>]*>/g, '()');

    // 2. Remove lambda definitions and operator() calls
    simplified = simplified.replace(/::'lambda'.*/, '');
    simplified = simplified.replace(/::operator\(\).*/, '');

    // 3. Truncate if still too long
    if (simplified.length > 60) {
        simplified = simplified.substring(0, 57) + '...';
    }

    return simplified.replace(/std::__1::/g, 'std::');
  }

  /**
   * Converts ClickHouse trace_log data to Perfetto JSON format and opens it in the Perfetto UI.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {string} queryId The ID of the query being profiled.
   */
  exportTraceToPerfetto(traceLog, queryId) {
    if (!traceLog || traceLog.length === 0) {
      alert('No trace data available to export.');
      return;
    }

    const frameMap = new Map();
    const callstackMap = new Map();
    const stackSamples = [];
    let frameIdCounter = 0;
    let callstackIdCounter = 0;
    let currentTimeNs = 0;

    traceLog.forEach(sample => {
      const frameIds = sample.trace.map(funcName => {
        if (!frameMap.has(funcName)) {
          frameMap.set(funcName, { id: frameIdCounter++, name: funcName });
        }
        return frameMap.get(funcName).id;
      });

      const callstackKey = frameIds.join(',');
      if (!callstackMap.has(callstackKey)) {
        // CRITICAL: Perfetto expects the stack from root to leaf.
        // The trace_log from ClickHouse is leaf to root, so we must reverse it.
        const reversedFrameIds = [...frameIds].reverse();
        callstackMap.set(callstackKey, { id: callstackIdCounter++, frame_ids: reversedFrameIds });
      }
      const callstackId = callstackMap.get(callstackKey).id;

      // Add a sample for each count in the value
      for (let i = 0; i < sample.value; i++) {
        stackSamples.push({
          callstack_id: callstackId,
          ts: currentTimeNs,
          utid: 1 // Use a single thread ID
        });
        currentTimeNs += 1000000; // Assume 1ms per sample
      }
    });

    const perfettoData = {
      displayTimeUnit: 'ns',
      // The stackProfile data must be wrapped in a traceEvents array as a metadata event.
      traceEvents: [
        {
          name: 'stack_profile',
          ph: 'M', // Metadata event
          pid: 1,
          tid: 1, // This thread ID is required by the Perfetto UI.
          args: {
            name: `ClickHouse Query: ${queryId}`,
            stack_profile: {
              frame: Array.from(frameMap.values()),
              callstack: Array.from(callstackMap.values()),
              stack_sample: stackSamples
            }
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(perfettoData)], { type: 'application/json' });
    const reader = new FileReader();
    reader.onload = (e) => {
      // The data URL must be encoded to be safely passed as a URL parameter.
      const encodedDataUrl = encodeURIComponent(e.target.result);
      const url = `https://ui.perfetto.dev/#!/?url=${encodedDataUrl}`;
      window.open(url, '_blank');
    };
    reader.readAsDataURL(blob);
  }

  /**
   * Converts ClickHouse trace_log data to Speedscope's file format and triggers a download.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {string} queryId The ID of the query being profiled.
   */
  exportTraceToSpeedscope(traceLog, queryId) {
    if (!traceLog || traceLog.length === 0) {
      alert('No trace data available to export.');
      return;
    }

    const frames = [];
    const frameMap = new Map();
    const samples = []; // This will be an array of stack arrays
    const weights = []; // This will be an array of numbers (sample counts)
    let totalWeight = 0;

    traceLog.forEach(sample => {
      const stackFrameIndices = sample.trace.map(fullName => {
        if (!frameMap.has(fullName)) {
          frameMap.set(fullName, frames.length);
          frames.push({ name: this.simplifyFunctionName(fullName) });
        }
        return frameMap.get(fullName);
      }).reverse(); // Speedscope expects stack from root (bottom) to leaf (top)

      samples.push(stackFrameIndices);
      weights.push(sample.value); // The weight is the sample count from trace_log
      totalWeight += sample.value;
    });

    const speedscopeData = {
      '$schema': 'https://www.speedscope.app/file-format-schema.json',
      profiles: [{ type: 'sampled', name: `ClickHouse Query: ${queryId}`, unit: 'milliseconds', startValue: 0, endValue: totalWeight, samples, weights }],
      shared: { frames }
    };

    // Convert the JSON to a base64 data URL and open in Speedscope directly.
    const jsonString = JSON.stringify(speedscopeData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = `https://www.speedscope.app/#profileURL=${encodeURIComponent(e.target.result)}`;
      window.open(url, '_blank');
    };
    reader.readAsDataURL(blob);
  }
}