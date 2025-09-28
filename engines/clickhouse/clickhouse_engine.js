import { createClient } from '@clickhouse/client-web';
import { Table, Float32, makeTable } from '@apache/arrow';
import { SHADERS } from './clickhouse_shaders.js';
import { ClickHouseProfiler } from './clickhouse_profiler.js';

/**
 * Implements the Engine interface for ClickHouse.
 */
class ClickHouseEngine {
  constructor() {
    this.client = null;
    this.profiler = null;
  }

  /**
   * Initializes the ClickHouse client and pings the server to ensure connectivity.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Initializing ClickHouse engine...');

    // Default connection details. These can be overridden by URL parameters
    // e.g., http://localhost:8000/?ch_host=...&ch_port=...
    const storedSettings = JSON.parse(localStorage.getItem('pixelql.clickhouse-settings')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    // Priority: 1. Stored Settings, 2. URL Params, 3. Defaults
    const url = storedSettings.url || urlParams.get('ch_host') || 'http://localhost:8123';
    const username = storedSettings.username || urlParams.get('ch_user') || 'default';
    const password = storedSettings.password || urlParams.get('ch_password') || '';

    this.client = createClient({
      url: url, // Deprecated 'host' is replaced by 'url'
      username: username,
      password: password,
    });

    this.profiler = new ClickHouseProfiler(this.client);

    statusCallback(`Pinging ClickHouse server at ${url}...`);
    try {
      const response = await this.client.ping();
      if (!response.success) {
        throw new Error('Ping failed.');
      }
      statusCallback('ClickHouse engine ready.');
    } catch (e) {
      statusCallback(`ClickHouse connection failed: ${e.message}. Is it running at ${url}?`);
      // Instead of throwing, we return a specific error to be handled by the caller.
      throw new Error(`Could not connect to ClickHouse at ${url}. Please check the URL and ensure the server is running.`);
    }
  }

  /**
   * "Prepares" a query by returning an object that can execute it.
   * For the HTTP client, this is a lightweight operation.
   * @param {string} sql The SQL query string.
   * @returns {Promise<{query: function(...any): Promise<Table>}>} An object with a `query` method.
   */
  async prepare(sql) {
    // For the ClickHouse HTTP client, there's no "prepare" step.
    // We return an object that holds the SQL and can execute it.
    return {
      query: async (...args) => this.executeQuery(sql, args),
    };
  }

  /**
   * Executes a "prepared" query with the given parameters.
   * @param {string} sql The SQL query string from the prepare step.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<Table>} An Apache Arrow Table containing the result.
   */
  async executeQuery(sql, params) {
    // New Strategy: Manually substitute parameters to avoid client library issues.
    let finalSql = sql
      .replace('{width:UInt32}', params[0])
      .replace('{height:UInt32}', params[1])
      .replace('{iTime:Float64}', params[2])
      .replace('{mx:Float64}', params[3])
      .replace('{my:Float64}', params[4]);

    const resultSet = await this.client.query({
      query: finalSql,
      format: 'JSONEachRow'
    });
    const rows = await resultSet.json();

    // Convert the JSON result into an Arrow Table, which the renderer expects.
    const r = new Float32Array(rows.length);
    const g = new Float32Array(rows.length);
    const b = new Float32Array(rows.length);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      r[i] = row.r;
      g[i] = row.g;
      b[i] = row.b;
    }

    return makeTable({
      r: r,
      g: g,
      b: b,
    });
  }

  /**
   * Runs the query with profiling enabled and collects various performance metrics.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<object>} A data object containing plans, logs, and traces.
   */
  profile(sql, params) {
    return this.profiler.profile(sql, params);
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The data object from the profile() method.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  renderProfile(profileData, mainContainer) {
    return this.profiler.renderProfile(profileData, mainContainer);
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

    // Clear the container before rendering to prevent drawing on top of the old graph.
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
        const newChildren = [];
        let childrenWereAbsorbed = false;

        for (const child of node.children) {
          const childGroupName = getGroupName(child.original.fullName);
          if (childGroupName === nodeGroupName) {
            // Absorb the child's children into the new list for the parent.
            // The child's value is already included in the parent's total from sumValues.
            newChildren.push(...child.children);
            childrenWereAbsorbed = true;
          } else {
            newChildren.push(child);
          }
        }
        node.children = newChildren;
        // Only update the parent's name to the group name if absorption actually happened.
        if (childrenWereAbsorbed) {
            node.name = nodeGroupName;
        }
      };
      collapseNode(root);
    }

    console.log(`[Debug] Rendering flamegraph with grouping: ${groupBy}.`);

    // container.innerHTML = ''; // Container is now managed by the caller
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
    const parts = name.split('::');
    if (parts.length > 1) {
      // Return everything except the last part (the method name)
      return parts.slice(0, -1).join('::');
    }
    return name; // Not a class method, return as is
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
   * Renders a Mermaid.js call graph from the ClickHouse trace log data.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {HTMLElement} container The DOM element to render the chart into.
   */
  async renderCallGraph(traceLog, container, direction = 'TD') {
    if (!traceLog || traceLog.length === 0) {
      container.innerHTML = '<p>No data to render call graph.</p>';
      return;
    }

    console.log(`[Debug] Building aggregated call graph from ${traceLog.length} unique stacks.`);
    container.innerHTML = ''; // Clear container before rendering
    // First, build the same hierarchical data structure as the flame graph.
    const root = { name: "Total CPU Time", value: 0, children: [] };
    let totalValue = 0;
    traceLog.forEach(row => {
      totalValue += row.value;
      let currentNode = root;
      const stack = row.trace.reverse();
      stack.forEach(fullName => {
        const functionName = this.simplifyFunctionName(fullName);
        let childNode = currentNode.children.find(c => c.name === functionName);
        if (!childNode) {
          childNode = { name: functionName, value: 0, children: [], fullName: fullName };
          currentNode.children.push(childNode);
        }
        childNode.value += row.value;
        currentNode = childNode;
      });
    });
    root.value = totalValue;

    // --- NEW: Aggregation Logic ---
    const aggregatedNodes = new Map();
    const aggregatedEdges = new Map();

    function processNode(node, parentName = null) {
        const simplifiedName = node.name;

        // Aggregate node value
        if (!aggregatedNodes.has(simplifiedName)) {
            aggregatedNodes.set(simplifiedName, { value: 0, fullName: node.fullName });
        }
        aggregatedNodes.get(simplifiedName).value += node.value;

        // Aggregate edge
        if (parentName) {
            const edgeKey = `${parentName}|${simplifiedName}`;
            aggregatedEdges.set(edgeKey, (aggregatedEdges.get(edgeKey) || 0) + node.value);
        }

        (node.children || []).forEach(child => processNode(child, simplifiedName));
    }
    processNode(root);

    // --- Convert aggregated data to Mermaid syntax ---
    let mermaidSyntax = `graph ${direction};\n`;
    mermaidSyntax += 'classDef timeHot fill:#5c2828,stroke:#ff8080,stroke-width:2px,color:#fff;\n';
    mermaidSyntax += 'classDef timeWarm fill:#5a4e3a,stroke:#ffc980,stroke-width:2px,color:#fff;\n';
    mermaidSyntax += 'classDef timeGood fill:#2a4a3a,stroke:#80ff80,stroke-width:2px,color:#fff;\n';

    // Create a unique ID for each function name
    const nameToId = new Map();
    let nodeIdCounter = 0;
    for (const name of aggregatedNodes.keys()) {
        nameToId.set(name, `n${nodeIdCounter++}`);
    }

    // Generate node definitions
    for (const [name, data] of aggregatedNodes.entries()) {
      const nodeId = nameToId.get(name);
      const percent = totalValue > 0 ? ((data.value / totalValue) * 100) : 0;
      let nodeText = `<div title='${data.fullName || name}'><strong>${name}</strong><br/>${data.value.toLocaleString()} samples<br/>${percent.toFixed(1)}%</div>`;
      nodeText = nodeText.replace(/"/g, '#quot;');
      mermaidSyntax += `    ${nodeId}["${nodeText}"];\n`;

      if (percent >= 50) {
        mermaidSyntax += `    class ${nodeId} timeHot;\n`;
      } else if (percent >= 5) {
        mermaidSyntax += `    class ${nodeId} timeWarm;\n`;
      } else {
        mermaidSyntax += `    class ${nodeId} timeGood;\n`;
      }
    }

    // Generate edge definitions
    for (const [edgeKey, value] of aggregatedEdges.entries()) {
        const [parentName, childName] = edgeKey.split('|');
        const parentId = nameToId.get(parentName);
        const childId = nameToId.get(childName);
        if (parentId && childId) {
            mermaidSyntax += `    ${parentId} --> ${childId};\n`;
        }
    }

    console.log(`[Debug] Mermaid diagram size: ${mermaidSyntax.length} characters`);

    const { svg } = await mermaid.render('ch-call-graph', mermaidSyntax);
    container.innerHTML = svg;

    // --- Add Tooltip Logic for the Call Graph ---
    const tooltipEl = document.createElement('div');
    tooltipEl.id = 'ch-call-graph-tooltip';
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.display = 'none';
    tooltipEl.style.background = '#2a2a2a';
    tooltipEl.style.padding = '10px';
    tooltipEl.style.border = '1px solid #777';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.zIndex = '1003'; // Ensure it's on top
    container.appendChild(tooltipEl);

    container.querySelectorAll('.node').forEach(nodeEl => {
      nodeEl.addEventListener('mousemove', (e) => {
        const title = nodeEl.querySelector('div')?.title;
        if (title) {
          tooltipEl.innerHTML = `<strong>Full Name:</strong><br>${title}`;
          tooltipEl.style.display = 'block';
          tooltipEl.style.left = `${e.clientX + 15}px`;
          tooltipEl.style.top = `${e.clientY + 15}px`;
        }
      });
      nodeEl.addEventListener('mouseout', () => {
        tooltipEl.style.display = 'none';
      });
    });

    this.setupSelectionZoom(container, traceLog, direction);
  }

  /**
   * Sets up the event listeners for the Call Graph controls (zoom, direction).
   * @param {Array<object>} traceLog The raw trace log data needed for re-rendering.
   * @param {HTMLElement} container The container for the call graph.
   */
  setupCallGraphControls(traceLog, container) {
    const button = document.getElementById('cg-switch-direction-button');
    if (!button) return;

    let currentLayout = 'TD'; // Top-Down

    const updateButtonText = () => {
      button.textContent = (currentLayout === 'TD') ? 'Switch to Bottom Up' : 'Switch to Top Down';
    };

    // Remove any old listener before adding a new one to prevent conflicts on re-profiling.
    if (button.handler) {
      button.removeEventListener('click', button.handler);
    }

    button.handler = () => {
      currentLayout = (currentLayout === 'TD') ? 'BT' : 'TD';
      this.renderCallGraph(traceLog, container, currentLayout);
      updateButtonText();
    };

    updateButtonText();
    button.addEventListener('click', button.handler);
  }

  /**
   * Sets up the drag-to-select zoom functionality for a Mermaid graph.
   * @param {HTMLElement} container The container holding the SVG graph.
   * @param {Array<object>} traceLog The raw trace log data for re-rendering.
   * @param {string} direction The current graph direction ('TD' or 'BT').
   */
  setupSelectionZoom(container, traceLog, direction) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Force enable mouse events on the SVG, as Mermaid may disable them by default.
    svg.style.pointerEvents = 'auto';

    // Create a selection box element if it doesn't exist
    let selectionBox = document.getElementById('graph-selection-box');
    if (!selectionBox) {
      selectionBox = document.createElement('div');
      selectionBox.id = 'graph-selection-box';
      selectionBox.style.position = 'absolute';
      selectionBox.style.border = '1px dashed #ffc980';
      selectionBox.style.backgroundColor = 'rgba(255, 201, 128, 0.2)';
      selectionBox.style.pointerEvents = 'none';
      selectionBox.style.display = 'none';
      document.body.appendChild(selectionBox);
    }

    let isDragging = false;
    let startX, startY;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.display = 'block';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const width = currentX - startX;
      const height = currentY - startY;

      selectionBox.style.width = `${Math.abs(width)}px`;
      selectionBox.style.height = `${Math.abs(height)}px`;
      selectionBox.style.left = `${width > 0 ? startX : currentX}px`;
      selectionBox.style.top = `${height > 0 ? startY : currentY}px`;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      selectionBox.style.display = 'none';

      const selectionRect = selectionBox.getBoundingClientRect();
      if (selectionRect.width < 10 || selectionRect.height < 10) return; // Ignore tiny selections

      const selectedNodeNames = new Set();
      svg.querySelectorAll('.node').forEach(nodeEl => {
        const nodeRect = nodeEl.getBoundingClientRect();
        // Check for intersection
        if (
          selectionRect.left < nodeRect.right &&
          selectionRect.right > nodeRect.left &&
          selectionRect.top < nodeRect.bottom &&
          selectionRect.bottom > nodeRect.top
        ) {
          // The node's name is stored in the title of the inner div
          const title = nodeEl.querySelector('div[title]')?.title;
          if (title) selectedNodeNames.add(title);
        }
      });

      if (selectedNodeNames.size > 0) {
        const filteredTraceLog = traceLog.filter(row => row.trace.some(funcName => selectedNodeNames.has(funcName)));
        this.renderCallGraph(filteredTraceLog, container, direction);
      }
    });

    // Add a double-click listener to reset the zoom
    svg.addEventListener('dblclick', () => {
      this.renderCallGraph(traceLog, container, direction);
    });
  }

  /**
   * Parses a DOT graph string and converts it to Mermaid syntax.
   * @param {string} dotString The raw DOT graph string.
   * @param {Set<string>} [nodesToRender=null] An optional set of node IDs to filter the graph.
   * @returns {string} A Mermaid graph definition string.
   */
  dotToMermaid(dotString, nodesToRender = null) {
    let mermaidString = 'graph LR;\n'; // LR = Left to Right
    const nodeLabels = new Map();
    const edges = [];

    const nodeRegex = /(\w+)\s+\[label="([^"]+)"\]/g;
    let match;
    while ((match = nodeRegex.exec(dotString)) !== null) {
      nodeLabels.set(match[1], match[2].replace(/"/g, '&quot;'));
    }
    
    const edgeRegex = /^\s*(\w+)\s*->\s*(\w+)/gm;
    while ((match = edgeRegex.exec(dotString)) !== null) {
      edges.push({ from: match[1], to: match[2] });
    }

    let finalNodes = nodesToRender ? new Set(nodesToRender) : new Set(nodeLabels.keys());

    // If filtering, add direct neighbors to make the graph more useful
    if (nodesToRender) {
      edges.forEach(edge => {
        if (nodesToRender.has(edge.from)) finalNodes.add(edge.to);
        if (nodesToRender.has(edge.to)) finalNodes.add(edge.from);
      });
    }

    edges.forEach(({ from: fromNode, to: toNode }) => {
      if (finalNodes.has(fromNode) && finalNodes.has(toNode)) {
      const fromLabel = nodeLabels.get(fromNode) || fromNode;
      const toLabel = nodeLabels.get(toNode) || toNode;
      mermaidString += `    ${fromNode}["${fromLabel}"] --> ${toNode}["${toLabel}"];\n`;
      }
    });

    // If no edges were added (e.g., single selected node), define the node itself.
    if (mermaidString.split('\n').length <= 2 && finalNodes.size > 0) {
        finalNodes.forEach(nodeId => {
            const label = nodeLabels.get(nodeId) || nodeId;
            mermaidString += `    ${nodeId}["${label}"];\n`;
        });
    }
    return mermaidString;
  }

  /**
   * Returns the list of example shaders available for this engine.
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }
}

export const engine = new ClickHouseEngine();