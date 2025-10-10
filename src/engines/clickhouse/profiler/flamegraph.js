import * as d3 from 'd3';
import * as d3_flame_graph from 'd3-flame-graph';

/**
 * FlameGraph rendering module for ClickHouse profiler.
 * Handles flame graph visualization from trace log data.
 */
export class ClickHouseProfilerFlamegraph {
  constructor() {
    // Module owns its data - profiler doesn't need to know about it
    this.data = null;
  }

  /**
   * Fetches trace log data from ClickHouse and stores it internally.
   * This is the new pull-based interface where the module owns its data fetching logic.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID for filtering trace_log
   * @param {string} cleanedSql - The SQL query (unused for trace_log)
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching trace log...');
    
    this.data = [];
    
    try {
      const traceQuery = `
        SELECT arrayStringConcat(arrayMap(x -> demangle(addressToSymbol(x)), trace), ';') AS stack, 
               count() AS value
        FROM system.trace_log
        WHERE query_id = '${queryId}' AND trace_type = 'CPU'
        GROUP BY trace
      `;
      
      const traceResultSet = await client.query({
        query: traceQuery,
        format: 'JSONEachRow',
        clickhouse_settings: { allow_introspection_functions: 1 }
      });
      
      const resolvedTraces = await traceResultSet.json();
      
      if (resolvedTraces.length > 0) {
        this.data = resolvedTraces.map(row => ({ 
          trace: row.stack.split(';'), 
          value: row.value 
        }));
      }
    } catch (e) {
      console.error('[Flamegraph] Error fetching trace log:', e.message);
      this.data = [];
    }
  }

  /**
   * Simple interface: returns HTML for flamegraph container and controls.
   * Note: Flamegraph requires complex D3.js DOM manipulation, so this returns a placeholder.
   * Use renderFlamegraph() for actual rendering.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML container for flamegraph.
   */
  render() {
    return `
      <div class="tab-inner-content">
        <div id="flamegraph-container" style="min-height: 400px;">
          <!-- Flamegraph will be rendered here via renderFlamegraph() -->
        </div>
      </div>
    `;
  }

  /**
   * Simple interface: sets up event handlers for flamegraph panel.
   * Module uses its internal data from fetchData().
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const graphContainer = container.querySelector('#flamegraph-container');
    const groupBySelect = container.querySelector('#ch-flamegraph-group-by');
    const speedscopeBtn = container.querySelector('#ch-speedscope-export-button');
    const perfettoBtn = container.querySelector('#ch-perfetto-export-button');

    // Set up grouping dropdown
    if (groupBySelect && graphContainer) {
      groupBySelect.addEventListener('change', () => {
        this.renderFlamegraph(this.data, graphContainer, groupBySelect.value);
      });
    }

    // Set up export buttons
    if (speedscopeBtn) {
      speedscopeBtn.addEventListener('click', () => {
        this.exportTraceToSpeedscope(this.data, 'query-from-module');
      });
    }

    if (perfettoBtn) {
      perfettoBtn.addEventListener('click', (e) => e.preventDefault());
    }

    // Render the actual flamegraph into the container
    if (graphContainer && this.data && this.data.length > 0) {
      // Check if the tab is currently active
      const tabContent = container.closest('.profiler-tab-content');
      const isTabActive = tabContent && tabContent.classList.contains('active');
      
      const renderGraph = () => {
        // Use requestAnimationFrame for proper rendering
        requestAnimationFrame(() => {
          console.log(`[Debug] Rendering ClickHouse flame graph in container with width: ${graphContainer.clientWidth}px`);
          this.renderFlamegraph(this.data, graphContainer, 'none');
        });
      };

      if (isTabActive) {
        // Tab is active, render immediately
        renderGraph();
      } else {
        // Tab is not active, set up one-time listener for when it becomes active
        const flamegraphTab = document.querySelector('.profiler-tab[data-tab="flamegraph"]');
        if (flamegraphTab) {
          const onTabClick = () => {
            renderGraph();
            flamegraphTab.removeEventListener('click', onTabClick);
          };
          flamegraphTab.addEventListener('click', onTabClick);
        }
      }
    }
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

    // Properly clean up any existing flamegraph to prevent memory leaks
    if (container._flamegraphChart) {
      try {
        container._flamegraphChart.destroy();
      } catch (e) {
        console.warn('[Flamegraph] Could not destroy chart:', e);
      }
      container._flamegraphChart = null;
    }
    d3.select(container).selectAll('*').remove();
    container.innerHTML = '';
    container.style.paddingTop = ''; // Reset padding

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

    // Get inverted preference from localStorage (default: true)
    const storageKey = 'flamegraph-inverted';
    let isInverted = localStorage.getItem(storageKey) !== 'false'; // Default to true

    // Add top padding to container
    container.style.paddingTop = '15px';

    const flamegraphChart = d3_flame_graph.flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .inverted(isInverted)
      .transitionDuration(750)
      .transitionEase(d3.easeCubic)
      .label(labelHandler);

    d3.select(container).datum(root).call(flamegraphChart);
    
    // Store reference to chart for cleanup
    container._flamegraphChart = flamegraphChart;
    
    // Override text styles after rendering to make text more readable
    setTimeout(() => {
      container.querySelectorAll('text').forEach(text => {
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-weight', '600');
        text.setAttribute('stroke', '#000');
        text.setAttribute('stroke-width', '3');
        text.setAttribute('stroke-linejoin', 'round');
        text.setAttribute('paint-order', 'stroke fill');
      });
    }, 100);
    
    // Add controls container
    const controlsDiv = document.createElement('div');
    controlsDiv.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 10; display: flex; gap: 10px;';
    
    // Add invert toggle button
    const invertButton = document.createElement('button');
    invertButton.textContent = isInverted ? '⇅ Normal' : '⇅ Inverted';
    invertButton.style.cssText = 'padding: 8px 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s ease;';
    invertButton.onmouseover = () => { 
      invertButton.style.transform = 'translateY(-2px)'; 
      invertButton.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
    };
    invertButton.onmouseout = () => { 
      invertButton.style.transform = 'translateY(0)'; 
      invertButton.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    };
    invertButton.onclick = () => {
      isInverted = !isInverted;
      localStorage.setItem(storageKey, isInverted);
      // Re-render the flamegraph with new orientation
      this.renderFlamegraph(traceLog, container, groupBy);
    };
    
    // Add reset zoom button
    const resetButton = document.createElement('button');
    resetButton.textContent = '↻ Reset';
    resetButton.style.cssText = 'padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: all 0.2s ease;';
    resetButton.onmouseover = () => { 
      resetButton.style.transform = 'translateY(-2px)'; 
      resetButton.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
    };
    resetButton.onmouseout = () => { 
      resetButton.style.transform = 'translateY(0)'; 
      resetButton.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    };
    resetButton.onclick = () => {
      flamegraphChart.resetZoom();
    };
    
    controlsDiv.appendChild(invertButton);
    controlsDiv.appendChild(resetButton);
    container.style.position = 'relative';
    container.appendChild(controlsDiv);

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

  /**
   * Generates HTML controls for the flamegraph tab.
   * @returns {string} HTML string for flamegraph controls.
   */
  getControlsHtml() {
    return `<div class="graph-controls" style="display: none;" data-for-tab="flamegraph">
              <label for="ch-flamegraph-group-by">Group By: </label>
              <select id="ch-flamegraph-group-by">
                <option value="none" selected>None</option>
                <option value="method">Method Name</option>
                <option value="class">By Class</option>
                <option value="system">By System</option>
              </select>
              <span style="font-size: 0.8em; color: #ffc980;"> (Experimental)</span>
              <div class="export-buttons" style="margin-left: 20px;">
                <button id="ch-speedscope-export-button" class="export-btn flamegraph-btn" title="Open CPU trace in Speedscope">Open in Speedscope</button>
                <button id="ch-perfetto-export-button" class="export-btn flamegraph-btn" title="Perfetto integration is temporarily disabled as it's not working." disabled style="background-color: #555; cursor: not-allowed;">Open in Perfetto</button>
              </div>
           </div>
           <style>
           .flamegraph-btn {
             background: #0066cc;
             color: white;
             border: none;
             padding: 4px 8px;
             margin: 0 3px;
             border-radius: 2px;
             cursor: pointer;
             font-size: 11px;
             font-weight: 500;
           }
           .flamegraph-btn:hover:not(:disabled) {
             background: #0088ff;
           }
           .flamegraph-btn:disabled {
             opacity: 0.6;
           }
           </style>`;
  }
}