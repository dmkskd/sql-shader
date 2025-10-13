import mermaid from 'mermaid';

/**
 * ClickHouse Profiler Pipeline Graph Module
 * 
 * Handles rendering of pipeline execution graphs from DOT format using Mermaid.js.
 * Provides interactive zoom, box selection, and graph filtering functionality.
 */
export class ClickHouseProfilerPipelineGraph {
  constructor() {
    // Module owns its data - profiler doesn't need to know about it
    this.data = null;
  }

  /**
   * Fetches pipeline data from ClickHouse and stores it internally.
   * This is the new pull-based interface where the module owns its data fetching logic.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID (unused for EXPLAIN queries)
   * @param {string} cleanedSql - The SQL query with placeholders replaced
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    this.data = {
      pipelineGraph: null,
      pipelineRaw: null
    };

    // 1. Get EXPLAIN PIPELINE graph (DOT format with detailed processor info)
    statusCallback('Fetching pipeline graph...');
    try {
      const graphSql = `EXPLAIN PIPELINE graph = 1, compact = 0 ${cleanedSql}`;
      const graphResultSet = await client.query({ query: graphSql, format: 'JSONEachRow' });
      const graphRows = await graphResultSet.json();
      this.data.pipelineGraph = graphRows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('[Pipeline] Error fetching graph:', e.message);
      this.data.pipelineGraph = `Error: ${e.message}`;
    }

    // 2. Get EXPLAIN PIPELINE raw text (without graph format)
    statusCallback('Fetching pipeline raw text...');
    try {
      const rawSql = `EXPLAIN PIPELINE ${cleanedSql}`;
      const rawResultSet = await client.query({ query: rawSql, format: 'JSONEachRow' });
      const rawRows = await rawResultSet.json();
      this.data.pipelineRaw = rawRows.map(row => row.explain).join('\n');
    } catch (e) {
      console.error('[Pipeline] Error fetching raw:', e.message);
      this.data.pipelineRaw = `Error: ${e.message}`;
    }
  }

  /**
   * Renders HTML for pipeline graph container with validation.
   * If the pipeline graph is not a valid DOT graph, shows an error message.
   * @returns {string} HTML container for pipeline graph with two tabs.
   */
  render() {
    const dotString = this.data?.pipelineGraph || '';
    const rawText = this.data?.pipelineRaw || 'No data.';
    
    // Validate that we have a proper DOT graph
    if (!dotString || !dotString.trim().startsWith('digraph')) {
      return `<p>Could not generate graph.</p><pre>${dotString || 'No data.'}</pre>`;
    }
    
    return `
      <div class="inner-tabs">
        <button class="inner-tab active" data-inner-tab="raw-pipeline">Raw</button>
        <button class="inner-tab" data-inner-tab="diagram-pipeline">Diagram</button>
      </div>
      <div id="inner-content-raw-pipeline" class="inner-tab-content active">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN PIPELINE graph = 1, compact = 0</code></div>
        <pre>${rawText || 'No data.'}</pre>
      </div>
      <div id="inner-content-diagram-pipeline" class="inner-tab-content">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN PIPELINE graph = 1, compact = 0</code></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
          <div class="graph-controls" data-for-tab="pipeline-plan" style="display: flex; gap: 8px; margin-left: 0 !important;">
            <button id="pipeline-zoom-in-button" title="Zoom In" style="background: #333; color: #fff; padding: 6px 12px; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">+</button>
            <button id="pipeline-zoom-out-button" title="Zoom Out" style="background: #333; color: #fff; padding: 6px 12px; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">−</button>
            <button id="pipeline-zoom-reset-button" title="Reset Zoom" style="background: #333; color: #fff; padding: 6px 12px; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;">1:1</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #999; background: #1a1a1a; padding: 10px; border: 1px solid #333; border-radius: 4px;">
            <div style="font-weight: bold; color: #ccc; margin-bottom: 4px; font-size: 12px;">Legend</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 14px; height: 14px; background: #252035; border: 1px solid #6b4f9e; display: inline-block; border-radius: 2px; flex-shrink: 0;"></span>
              <span style="min-width: 70px; color: #ccc;">Source</span>
              <span style="color: #888;">Data input (e.g., table reads, generators)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 14px; height: 14px; background: #1f2f42; border: 1px solid #4a6fa5; display: inline-block; border-radius: 2px; flex-shrink: 0;"></span>
              <span style="min-width: 70px; color: #ccc;">Transform</span>
              <span style="color: #888;">Data transformation (e.g., expressions, joins)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 14px; height: 14px; background: #233529; border: 1px solid #4a8b5f; display: inline-block; border-radius: 2px; flex-shrink: 0;"></span>
              <span style="min-width: 70px; color: #ccc;">Aggregate</span>
              <span style="color: #888;">Aggregation operations (e.g., GROUP BY, SUM)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 14px; height: 14px; background: #3a2525; border: 1px solid #a85555; display: inline-block; border-radius: 2px; flex-shrink: 0;"></span>
              <span style="min-width: 70px; color: #ccc;">Output</span>
              <span style="color: #888;">Result output (e.g., LIMIT, OFFSET)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 14px; height: 14px; background: #3a3025; border: 1px solid #b8863d; display: inline-block; border-radius: 2px; flex-shrink: 0;"></span>
              <span style="min-width: 70px; color: #ccc;">Filter</span>
              <span style="color: #888;">Filtering operations (e.g., WHERE conditions)</span>
            </div>
          </div>
        </div>
        <div id="pipeline-graph-container" style="min-height: 400px;">
          <!-- Detailed pipeline graph will be rendered here -->
        </div>
      </div>
    `;
  }

  /**
   * Simple interface: sets up event handlers for pipeline graph panel.
   * Module uses its internal data from fetchData().
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    
    const dotString = this.data?.pipelineGraph || '';

    // Tab switching for Raw/Diagram views
    const innerTabs = container.querySelectorAll('.inner-tab');
    innerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-inner-tab');
        
        // Update active tab
        innerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show/hide content
        container.querySelectorAll('.inner-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const targetContent = container.querySelector(`#inner-content-${targetTab}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });

    // Set up zoom controls for the Diagram tab
    this.setupZoomControls(container, dotString);

    // Render the pipeline graph
    const graphContainer = container.querySelector('#pipeline-graph-container');
    if (graphContainer && dotString) {
      this.renderPipelineGraph(dotString, graphContainer);
    }
  }

  /**
   * Sets up zoom controls for the diagram view.
   * @param {HTMLElement} container The container element.
   * @param {string} dotString The DOT graph data for this view.
   */
  setupZoomControls(container, dotString) {
    const zoomInBtn = container.querySelector('#pipeline-zoom-in-button');
    const zoomOutBtn = container.querySelector('#pipeline-zoom-out-button');
    const zoomResetBtn = container.querySelector('#pipeline-zoom-reset-button');
    
    if (zoomInBtn && zoomOutBtn && zoomResetBtn) {
      let currentGraphZoom = 1.0;
      let panX = 0;
      let panY = 0;
      const zoomStep = 0.4;
      const graphContainer = container.querySelector('#pipeline-graph-container');
      
      const updateGraphTransform = () => {
        const svg = graphContainer?.querySelector('svg');
        if (svg) {
          svg.style.transform = `translate(${panX}px, ${panY}px) scale(${currentGraphZoom})`;
          svg.style.transformOrigin = 'top left';
        }
      };

      zoomInBtn.addEventListener('click', () => {
        currentGraphZoom += zoomStep;
        updateGraphTransform();
      });

      zoomOutBtn.addEventListener('click', () => {
        currentGraphZoom = Math.max(0.1, currentGraphZoom - zoomStep);
        updateGraphTransform();
      });

      zoomResetBtn.addEventListener('click', () => {
        currentGraphZoom = 1.0;
        panX = 0;
        panY = 0;
        updateGraphTransform();
      });

      // Add mouse drag panning
      let isPanning = false;
      let startPanX = 0;
      let startPanY = 0;

      graphContainer.addEventListener('mousedown', (e) => {
        // Only pan if clicking on the container or SVG background, not on graph nodes
        if (e.target === graphContainer || e.target.tagName === 'svg' || e.target.classList.contains('edgePath')) {
          isPanning = true;
          startPanX = e.clientX - panX;
          startPanY = e.clientY - panY;
          graphContainer.style.cursor = 'grabbing';
          e.preventDefault();
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateGraphTransform();
      });

      window.addEventListener('mouseup', () => {
        if (isPanning) {
          isPanning = false;
          graphContainer.style.cursor = 'grab';
        }
      });

      // Set initial cursor
      graphContainer.style.cursor = 'grab';

      // Add mouse wheel zoom
      graphContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1; // Scroll down = zoom out, scroll up = zoom in
        currentGraphZoom = Math.max(0.1, Math.min(5, currentGraphZoom + delta)); // Clamp between 0.1 and 5
        updateGraphTransform();
      }, { passive: false });
    }
  }

  /**
   * Renders the Pipeline graph and sets up its interactive features.
   * @param {string} dotString The raw DOT graph string from EXPLAIN.
   * @param {HTMLElement} container The container to render into.
   * @param {Set<string>} [nodesToRender=null] An optional set of node IDs to filter the graph.
   */
  async renderPipelineGraph(dotString, container, nodesToRender = null) {
    try {
      const mermaidGraph = this.dotToMermaid(dotString, nodesToRender);
      const { svg } = await mermaid.render('ch-mermaid-graph', mermaidGraph);
      container.innerHTML = svg;
      this.enhanceGraphWithTooltips(dotString, container);
      this.setupPipelineGraphZoom(dotString, container);
    } catch (error) {
      console.error('Mermaid rendering failed:', error.message);
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #666; font-family: monospace;">
          <h4>Graph Too Complex</h4>
          <p>Pipeline graph has too many connections to display.</p>
          <p>Error: ${error.message}</p>
          <details>
            <summary>Raw DOT Graph</summary>
            <pre style="text-align: left; font-size: 10px; max-height: 300px; overflow: auto;">${dotString}</pre>
          </details>
        </div>
      `;
    }
  }

  /**
   * Get a human-readable explanation for common pipeline node types.
   * @param {string} nodeName The name of the node.
   * @returns {string|null} Explanation or null if not recognized.
   */
  getNodeExplanation(nodeName) {
    const explanations = {
      // Source nodes
      'NumbersRange': 'Generates a sequence of numbers within a specified range',
      'ReadFromStorage': 'Reads data from storage (table or materialized view)',
      'ReadFromMergeTree': 'Reads data from a MergeTree table',
      'Values': 'Represents literal values in the query',
      'Remote': 'Reads data from remote servers in distributed queries',
      
      // Transform nodes
      'Expression': 'Evaluates expressions and computes new columns',
      'ExpressionTransform': 'Transforms rows by evaluating expressions',
      'FillingRightJoin': 'Performs a RIGHT JOIN with null-filling for missing rows',
      'JoiningTransform': 'Joins data streams from multiple sources',
      'MergingTransform': 'Merges multiple sorted data streams',
      'PartialSortingTransform': 'Performs partial sorting of data chunks',
      'MergeSortingTransform': 'Merges pre-sorted data streams into final sorted output',
      'ResizeProcessor': 'Adjusts the number of parallel processing streams',
      'LimitsCheckingTransform': 'Checks and enforces query execution limits',
      
      // Aggregate nodes
      'Aggregating': 'Performs aggregation operations (SUM, AVG, COUNT, etc.)',
      'TotalsHaving': 'Computes TOTALS and applies HAVING conditions',
      'MergingAggregated': 'Merges partially aggregated results from multiple sources',
      'GroupingAggregatedTransform': 'Groups and aggregates data with GROUPING SETS',
      
      // Output nodes  
      'Limit': 'Limits the number of rows returned (LIMIT clause)',
      'LimitTransform': 'Applies row limit during query execution',
      'Offset': 'Skips the first N rows (OFFSET clause)',
      'Extremes': 'Computes minimum and maximum values with extremes mode',
      
      // Filter nodes
      'Filter': 'Filters rows based on WHERE conditions',
      'FilterTransform': 'Applies filtering conditions during transformation',
      'PREWHERE': 'Applies pre-filtering before reading full row data (optimization)'
    };
    
    // Try exact match first
    if (explanations[nodeName]) {
      return explanations[nodeName];
    }
    
    // Try partial matches for node names with suffixes
    for (const [key, value] of Object.entries(explanations)) {
      if (nodeName.startsWith(key)) {
        return value;
      }
    }
    
    return null;
  }

  /**
   * Enhances the rendered graph with custom tooltips and hover effects.
   * @param {string} dotString The original DOT string for extracting node details.
   * @param {HTMLElement} container The container with the rendered SVG.
   */
  enhanceGraphWithTooltips(dotString, container) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Create tooltip element if it doesn't exist
    let tooltip = document.getElementById('pipeline-node-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'pipeline-node-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        background: #2a2a2a;
        border: 1px solid #b89050;
        border-radius: 6px;
        padding: 12px 16px;
        color: #ddd;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        pointer-events: none;
        z-index: 10000;
        display: none;
        max-width: 400px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        line-height: 1.6;
      `;
      document.body.appendChild(tooltip);
    }

    // Extract detailed node information from DOT
    const nodeInfo = new Map();
    // Match both formats: "n0 [label=..." and "n0[label=..." (with or without space)
    const nodeRegex = /(\w+)\s*\[label="([^"]+)"\]/g;
    let match;
    
    while ((match = nodeRegex.exec(dotString)) !== null) {
      const nodeId = match[1];
      const fullLabel = match[2];
      const lines = fullLabel.split('\\n');
      nodeInfo.set(nodeId, {
        name: lines[0] || nodeId,
        details: lines.slice(1).filter(l => l.trim())
      });
    }

    // Add hover effects to all nodes
    const nodes = svg.querySelectorAll('.node');
    
    nodes.forEach(nodeEl => {
      const nodeId = nodeEl.id;
      const info = nodeInfo.get(nodeId);
      
      if (info) {
        // Enhanced hover effect
        nodeEl.style.cursor = 'pointer';
        nodeEl.style.transition = 'all 0.3s ease';
        
        nodeEl.addEventListener('mouseenter', (e) => {
          // Highlight effect
          const rect = nodeEl.querySelector('rect, path');
          if (rect) {
            rect.style.filter = 'brightness(1.3) drop-shadow(0 0 6px rgba(184, 144, 80, 0.5))';
            rect.style.transition = 'all 0.3s ease';
          }
          
          // Build tooltip content
          let tooltipContent = `<strong style="color: #d4a574; font-size: 14px;">📊 ${info.name}</strong>`;
          
          // Add explanation if available
          const explanation = this.getNodeExplanation(info.name);
          if (explanation) {
            tooltipContent += `<div style="margin-top: 8px; padding: 8px; background: rgba(100, 100, 100, 0.2); border-radius: 4px; color: #bbb; font-style: italic; font-size: 11px;">${explanation}</div>`;
          }
          
          if (info.details.length > 0) {
            tooltipContent += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444;">';
            tooltipContent += '<div style="color: #999; font-size: 10px; margin-bottom: 4px;">Details:</div>';
            info.details.forEach(detail => {
              tooltipContent += `<div style="margin: 4px 0; color: #ccc;">• ${detail}</div>`;
            });
            tooltipContent += '</div>';
          }
          tooltipContent += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444; color: #888; font-size: 10px;">Node ID: ${nodeId}</div>`;
          
          tooltip.innerHTML = tooltipContent;
          tooltip.style.display = 'block';
        });
        
        nodeEl.addEventListener('mousemove', (e) => {
          tooltip.style.left = `${e.clientX + 15}px`;
          tooltip.style.top = `${e.clientY + 15}px`;
        });
        
        nodeEl.addEventListener('mouseleave', () => {
          const rect = nodeEl.querySelector('rect, path');
          if (rect) {
            rect.style.filter = 'none';
          }
          tooltip.style.display = 'none';
        });
      }
    });

    // Add glow effect to edges on hover
    svg.querySelectorAll('.edgePath').forEach(edge => {
      edge.style.transition = 'all 0.3s ease';
      edge.addEventListener('mouseenter', () => {
        const path = edge.querySelector('path');
        if (path) {
          path.style.stroke = '#b89050';
          path.style.filter = 'drop-shadow(0 0 4px rgba(184, 144, 80, 0.4))';
          path.style.strokeWidth = '2.5px';
        }
      });
      edge.addEventListener('mouseleave', () => {
        const path = edge.querySelector('path');
        if (path) {
          path.style.stroke = '';
          path.style.filter = '';
          path.style.strokeWidth = '';
        }
      });
    });
  }

  /**
   * Sets up zoom and selection controls for the Pipeline graph.
   * @param {string} dotString The original DOT string for re-rendering.
   * @param {HTMLElement} container The container holding the SVG graph.
   */
  setupPipelineGraphZoom(dotString, container) {
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Force enable mouse events on the SVG
    svg.style.pointerEvents = 'auto';

    // --- Box Selection Logic ---
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

    // Attach the listener to the SVG itself, as it's the element that receives the initial events.
    // The container div might not receive them if the SVG covers it completely.
    svg.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node')) return; // Don't start drag if clicking on a node itself
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
      if (selectionRect.width < 10 || selectionRect.height < 10) return;

      const selectedNodeIds = new Set();
      svg.querySelectorAll('.node').forEach(nodeEl => {
        const nodeRect = nodeEl.getBoundingClientRect();
        if (selectionRect.left < nodeRect.right && selectionRect.right > nodeRect.left &&
            selectionRect.top < nodeRect.bottom && selectionRect.bottom > nodeRect.top) {
          selectedNodeIds.add(nodeEl.id);
        }
      });

      if (selectedNodeIds.size > 0) {
        this.renderPipelineGraph(dotString, container, selectedNodeIds);
      }
    });

    // Double-click to reset zoom
    svg.addEventListener('dblclick', () => {
      this.renderPipelineGraph(dotString, container, null);
    });
  }

  /**
   * Parses a DOT graph string and converts it to Mermaid syntax.
   * @param {string} dotString The raw DOT graph string.
   * @param {Set<string>} [nodesToRender=null] An optional set of node IDs to filter the graph.
   * @returns {string} A Mermaid graph definition string.
   */
  dotToMermaid(dotString, nodesToRender = null) {
    let mermaidString = 'graph TB;\n'; // TB = Top to Bottom (vertical layout)
    
    // Enhanced styling classes with toned-down colors
    mermaidString += 'classDef default fill:#1a1a1a,stroke:#555,stroke-width:1px,color:#ccc;\n';
    mermaidString += 'classDef sourceNode fill:#252035,stroke:#6b4f9e,stroke-width:2px,color:#ddd,rx:6,ry:6;\n';
    mermaidString += 'classDef transformNode fill:#1f2f42,stroke:#4a6fa5,stroke-width:2px,color:#ddd,rx:6,ry:6;\n';
    mermaidString += 'classDef aggregateNode fill:#233529,stroke:#4a8b5f,stroke-width:2px,color:#ddd,rx:6,ry:6;\n';
    mermaidString += 'classDef outputNode fill:#3a2525,stroke:#a85555,stroke-width:2px,color:#ddd,rx:6,ry:6;\n';
    mermaidString += 'classDef filterNode fill:#3a3025,stroke:#b8863d,stroke-width:2px,color:#ddd,rx:6,ry:6;\n';
    mermaidString += 'classDef nodeClass fill:#2a2a2a,stroke:#b89050,stroke-width:2px,color:#ddd,rx:6,ry:6;\n';
    
    const nodeLabels = new Map();
    const nodeDetails = new Map();
    const edges = [];

    // Enhanced regex to capture node information - handles both compact=0 and compact=1 formats
    // compact=1: n5 [label="JoiningTransform"]
    // compact=0: n0[label="NumbersRange_0"]
    const nodeRegex = /(\w+)\s*\[label="([^"]+)"\]/g;
    let match;
    while ((match = nodeRegex.exec(dotString)) !== null) {
      const nodeId = match[1];
      const fullLabel = match[2];
      
      // Extract main label and additional details
      const lines = fullLabel.split('\\n').filter(l => l.trim());
      const mainLabel = lines[0] || nodeId;
      const details = lines.slice(1).join(' | ');
      
      nodeLabels.set(nodeId, mainLabel.replace(/"/g, '&quot;'));
      nodeDetails.set(nodeId, details);
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

    // First, define all nodes that will be included
    finalNodes.forEach(nodeId => {
      const label = nodeLabels.get(nodeId) || nodeId;
      const details = nodeDetails.get(nodeId);
      
      // Create a cleaner, more readable label
      let displayLabel = label;
      if (details) {
        // Add details as a subtitle in the node
        displayLabel = `${label}<br/><small style='opacity:0.7'>${details.substring(0, 50)}${details.length > 50 ? '...' : ''}</small>`;
      }
      
      // Determine node type for styling
      let nodeClass = 'nodeClass';
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('source') || lowerLabel.includes('read') || lowerLabel.includes('scan')) {
        nodeClass = 'sourceNode';
      } else if (lowerLabel.includes('aggregate') || lowerLabel.includes('group')) {
        nodeClass = 'aggregateNode';
      } else if (lowerLabel.includes('filter') || lowerLabel.includes('where')) {
        nodeClass = 'filterNode';
      } else if (lowerLabel.includes('transform') || lowerLabel.includes('expression') || lowerLabel.includes('convert')) {
        nodeClass = 'transformNode';
      } else if (lowerLabel.includes('output') || lowerLabel.includes('result')) {
        nodeClass = 'outputNode';
      }
      
      mermaidString += `    ${nodeId}["${displayLabel}"]:::${nodeClass};\n`;
    });

    // Then add the edges between included nodes with thicker, styled connections
    edges.forEach(({ from: fromNode, to: toNode }) => {
      if (finalNodes.has(fromNode) && finalNodes.has(toNode)) {
        mermaidString += `    ${fromNode} ==> ${toNode};\n`; // Use ==> for thicker arrows
      }
    });
    
    return mermaidString;
  }

  /**
   * Generates HTML controls for the pipeline graph tab.
   * Note: Returns empty string because controls are rendered inside the Diagram inner tab
   * in the render() method, not at the top level like other modules.
   * @returns {string} Empty string (controls are in the inner tab).
   */
  getControlsHtml() {
    return '';
  }
}