import mermaid from 'mermaid';

/**
 * ClickHouse Profiler Call Graph Module
 * 
 * Handles rendering of aggregated call graphs from trace data using Mermaid.js.
 * Provides interactive zoom, direction switching, and tooltip functionality.
 */
export class ClickHouseProfilerCallGraph {
  constructor() {
    this.data = null;
  }

  /**
   * Simplifies C++ function names by removing template arguments and truncating.
   * @param {string} name The full function name.
   * @returns {string} The simplified function name.
   */
  simplifyFunctionName(name) {
    if (!name) return 'unknown';
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
   * Fetches trace log data from ClickHouse and stores it internally.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID for filtering trace_log
   * @param {string} cleanedSql - The SQL query (unused for trace_log)
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching trace log for call graph...');
    
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
      console.error('[CallGraph] Error fetching trace log:', e.message);
      this.data = [];
    }
  }

  /**
   * Simple interface: returns HTML for call graph container and controls.
   * Note: Call graph requires async DOM manipulation, so this returns a placeholder.
   * Use renderCallGraph() for actual rendering.
   * Module uses its internal data from fetchData().
   * @returns {string} HTML container for call graph.
   */
  render() {
    return `
      <div class="tab-inner-content">
        <div id="call-graph-container" style="min-height: 800px; height: 800px;">
          <!-- Call graph will be rendered here via renderCallGraph() -->
        </div>
      </div>
    `;
  }

  /**
   * Simple interface: sets up event handlers for call graph panel.
   * Module uses its internal data from fetchData().
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Use internal data
    const traceLog = this.data || [];

    // Set up zoom controls
    const zoomInBtn = container.querySelector('#cg-zoom-in-button');
    const zoomOutBtn = container.querySelector('#cg-zoom-out-button');
    const zoomResetBtn = container.querySelector('#cg-zoom-reset-button');
    const switchDirectionBtn = container.querySelector('#cg-switch-direction-button');
    
    const graphContainer = container.querySelector('#call-graph-container');
    
    if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
      let currentGraphZoom = 1.0;
      const zoomStep = 0.4;
      
      let panX = 0;
      let panY = 0;
      
      const updateGraphZoom = () => {
        const svg = graphContainer?.querySelector('svg');
        if (svg) {
          svg.style.transform = `translate(${panX}px, ${panY}px) scale(${currentGraphZoom})`;
          svg.style.transformOrigin = 'top left';
        }
      };

      zoomInBtn.addEventListener('click', () => {
        currentGraphZoom += zoomStep;
        updateGraphZoom();
      });

      zoomOutBtn.addEventListener('click', () => {
        currentGraphZoom = Math.max(0.05, currentGraphZoom - zoomStep); // Matching min zoom with wheel
        updateGraphZoom();
      });

      zoomResetBtn.addEventListener('click', () => {
        currentGraphZoom = 1.0;
        panX = 0;
        panY = 0;
        updateGraphZoom();
      });
      
      // Add mouse wheel zoom (increased max zoom to 30x for detailed inspection)
      graphContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = -Math.sign(e.deltaY) * 0.15; // Increased sensitivity from 0.1 to 0.15
        currentGraphZoom = Math.max(0.05, Math.min(30, currentGraphZoom + delta)); // Max zoom 30x, min 0.05x
        updateGraphZoom();
      });
      
      // Add click-drag panning
      let isDragging = false;
      let startX, startY;
      
      graphContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        graphContainer.style.cursor = 'grabbing';
      });
      
      graphContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateGraphZoom();
      });
      
      graphContainer.addEventListener('mouseup', () => {
        isDragging = false;
        graphContainer.style.cursor = 'grab';
      });
      
      graphContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        graphContainer.style.cursor = 'grab';
      });
      
      graphContainer.style.cursor = 'grab';
      graphContainer.style.overflow = 'hidden'; // Prevent graph from overlapping buttons above
      graphContainer.style.position = 'relative'; // Establish positioning context
    }

    // Set up direction switching
    if (switchDirectionBtn && graphContainer) {
      let currentLayout = 'TD'; // Top-Down

      const updateButtonText = () => {
        switchDirectionBtn.textContent = (currentLayout === 'TD') ? 'Switch to Bottom Up' : 'Switch to Top Down';
      };

      // Remove any old listener before adding a new one
      if (switchDirectionBtn.handler) {
        switchDirectionBtn.removeEventListener('click', switchDirectionBtn.handler);
      }

      switchDirectionBtn.handler = () => {
        currentLayout = (currentLayout === 'TD') ? 'BT' : 'TD';
        this.renderCallGraph(traceLog, graphContainer, currentLayout);
        updateButtonText();
      };

      updateButtonText();
      switchDirectionBtn.addEventListener('click', switchDirectionBtn.handler);
    }

    // Render the actual call graph into the container
    if (graphContainer && traceLog && traceLog.length > 0) {
      this.renderCallGraph(traceLog, graphContainer, 'TD'); // Initial render is Top-Down
    }
  }

  /**
   * Renders a Mermaid.js call graph from the ClickHouse trace log data.
   * @param {Array<object>} traceLog The data from system.trace_log.
   * @param {HTMLElement} container The DOM element to render the chart into.
   * @param {string} direction The graph direction: 'TD' (top-down) or 'BT' (bottom-up).
   */
  async renderCallGraph(traceLog, container, direction = 'TD') {
    if (!traceLog || traceLog.length === 0) {
      container.innerHTML = '<p>No data to render call graph.</p>';
      return;
    }

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

    // Aggregate the hierarchical data into a flat list of nodes and edges for the graph.
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

    // Generate edge definitions with safety limits
    let edgeCount = 0;
    const maxEdges = 400; // Conservative limit to avoid Mermaid edge limit issues
    
    for (const [edgeKey, value] of aggregatedEdges.entries()) {
        if (edgeCount >= maxEdges) {
          mermaidSyntax += `    note["Graph truncated - ${aggregatedEdges.size - maxEdges} more edges not shown"];\n`;
          break;
        }
        
        const [parentName, childName] = edgeKey.split('|');
        const parentId = nameToId.get(parentName);
        const childId = nameToId.get(childName);
        if (parentId && childId) {
            mermaidSyntax += `    ${parentId} --> ${childId};\n`;
            edgeCount++;
        }
    }

    // Log the size of the generated graph definition for debugging.
    console.log(`[Profiler] Generated Call Graph Mermaid syntax size: ${mermaidSyntax.length} characters.`);

    try {
      const { svg } = await mermaid.render('ch-call-graph', mermaidSyntax);
      container.innerHTML = svg;
    } catch (error) {
      console.error('Mermaid call graph rendering failed:', error.message);
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666; font-family: monospace;">
          <h4>Call Graph Too Complex</h4>
          <p>Call graph has too many nodes/edges to display.</p>
          <p>Error: ${error.message}</p>
          <details>
            <summary>Raw Mermaid Graph</summary>
            <pre style="text-align: left; font-size: 10px; max-height: 300px; overflow: auto;">${mermaidSyntax}</pre>
          </details>
        </div>`;
      return;
    }

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
   * Generates HTML controls for the call graph tab.
   * @returns {string} HTML string for call graph controls.
   */
  getControlsHtml() {
    return `<div class="graph-controls" style="display: none;" data-for-tab="call-graph">
              <button id="cg-zoom-in-button" title="Zoom In">+</button>
              <button id="cg-zoom-out-button" title="Zoom Out">-</button>
              <button id="cg-zoom-reset-button" title="Reset Zoom">1:1</button>
              <button id="cg-switch-direction-button" title="Switch Graph Direction">Switch Direction</button>
           </div>`;
  }
}