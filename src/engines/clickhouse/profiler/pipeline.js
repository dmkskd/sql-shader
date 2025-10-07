import mermaid from 'mermaid';

/**
 * ClickHouse Profiler Pipeline Graph Module
 * 
 * Handles rendering of pipeline execution graphs from DOT format using Mermaid.js.
 * Provides interactive zoom, box selection, and graph filtering functionality.
 */
export class ClickHouseProfilerPipelineGraph {
  constructor() {
    // No dependencies needed for pipeline graph
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
    let mermaidString = 'graph LR;\n'; // LR = Left to Right
    
    // Add styling classes for dark theme compatibility
    mermaidString += 'classDef default fill:#333,stroke:#777,stroke-width:2px,color:#eee;\n';
    mermaidString += 'classDef nodeClass fill:#2a2a2a,stroke:#ffc980,stroke-width:2px,color:#eee;\n';
    
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

    // First, define all nodes that will be included
    finalNodes.forEach(nodeId => {
      const label = nodeLabels.get(nodeId) || nodeId;
      mermaidString += `    ${nodeId}["${label}"];\n`;
      mermaidString += `    class ${nodeId} nodeClass;\n`;
    });

    // Then add the edges between included nodes
    edges.forEach(({ from: fromNode, to: toNode }) => {
      if (finalNodes.has(fromNode) && finalNodes.has(toNode)) {
        mermaidString += `    ${fromNode} --> ${toNode};\n`;
      }
    });
    return mermaidString;
  }
}