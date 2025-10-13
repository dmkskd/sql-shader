/**
 * ClickHouse Explain AST Module
 * Handles rendering of EXPLAIN AST data with raw and diagram views.
 */
export class ClickHouseProfilerExplainAST {
  constructor() {
    this.data = null; // Will store { astGraph: 'DOT string', astRaw: 'raw text' }
  }

  /**
   * Fetches EXPLAIN AST data from ClickHouse and stores it internally.
   * 
   * @param {ClickHouseClient} client - The ClickHouse client instance
   * @param {string} queryId - The unique query ID (unused for EXPLAIN queries)
   * @param {string} cleanedSql - The SQL query with placeholders replaced
   * @param {function} statusCallback - Progress callback function
   * @returns {Promise<void>}
   */
  async fetchData(client, queryId, cleanedSql, statusCallback = () => {}) {
    statusCallback('Fetching AST...');
    
    try {
      // EXPLAIN AST returns plain text, not structured rows
      // Fetch AST with graph output
      const astGraphSql = `EXPLAIN AST graph = 1 ${cleanedSql}`;
      const astGraphResultSet = await client.query({ query: astGraphSql });
      const astGraph = await astGraphResultSet.text();

      // Fetch raw AST (no graph parameter)
      const astRawSql = `EXPLAIN AST ${cleanedSql}`;
      const astRawResultSet = await client.query({ query: astRawSql });
      const astRaw = await astRawResultSet.text();

      this.data = { astGraph, astRaw };
    } catch (e) {
      console.error('[ExplainAST] Error fetching AST:', e.message);
      this.data = { 
        astGraph: `Error: ${e.message}`,
        astRaw: `Error: ${e.message}`
      };
    }
  }

  /**
   * Renders the AST with inner tabs for raw and diagram views.
   * @returns {string} HTML representation with inner tabs.
   */
  render() {
    const astGraph = this.data?.astGraph || '';
    const astRaw = this.data?.astRaw || 'No data.';
    
    // Validate that we have a proper DOT graph
    if (!astGraph || !astGraph.trim().startsWith('digraph')) {
      return `<p>Could not generate AST graph.</p><pre>${astGraph || 'No data.'}</pre>`;
    }
    
    return `
      <div class="inner-tabs">
        <button class="inner-tab active" data-inner-tab="raw-ast">Raw</button>
        <button class="inner-tab" data-inner-tab="diagram-ast">Diagram</button>
      </div>
      <div id="inner-content-raw-ast" class="inner-tab-content active">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN AST</code></div>
        <pre>${astRaw}</pre>
      </div>
      <div id="inner-content-diagram-ast" class="inner-tab-content">
        <div class="inner-tab-info">Generated via: <code>EXPLAIN AST graph = 1</code></div>
        <div style="display: flex; justify-content: flex-start; gap: 8px; margin-bottom: 15px;">
          <button id="ast-zoom-in-button" title="Zoom In" style="background: #333; color: #fff; padding: 6px 12px; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">+</button>
          <button id="ast-zoom-out-button" title="Zoom Out" style="background: #333; color: #fff; padding: 6px 12px; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">−</button>
          <button id="ast-zoom-reset-button" title="Reset Zoom" style="background: #333; color: #fff; padding: 6px 12px; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;">1:1</button>
        </div>
        <div id="ast-graph-container" style="min-height: 400px; border-radius: 3px; padding: 20px; overflow: auto;">
          <!-- AST graph will be rendered here -->
        </div>
      </div>
    `;
  }

  /**
   * Sets up event handlers for inner tabs and graph rendering.
   * @param {string} containerId The ID of the container element.
   */
  setupEventHandlers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

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

    // Render the AST graph when the diagram tab is active or becomes active
    this.setupGraphRendering(container);
    this.setupZoomControls(container);
  }

  /**
   * Sets up the AST graph rendering using viz.js.
   * @param {HTMLElement} container The container element.
   */
  setupGraphRendering(container) {
    const graphContainer = container.querySelector('#ast-graph-container');
    if (!graphContainer) return;

    const dotString = this.data?.astGraph || '';
    if (!dotString || !dotString.trim().startsWith('digraph')) return;

    // Use viz.js to render DOT to SVG
    import('https://cdn.jsdelivr.net/npm/@viz-js/viz@3.7.0/+esm').then(({ instance }) => {
      instance().then(viz => {
        const svg = viz.renderSVGElement(dotString);
        graphContainer.innerHTML = '';
        
        // Wrap SVG in a container for better zoom/pan control
        const wrapper = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflow = 'auto';
        wrapper.style.position = 'relative';
        wrapper.appendChild(svg);
        graphContainer.appendChild(wrapper);
        
        // Apply SVG styling for dark theme
        svg.style.maxWidth = 'none';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        
        // Fix colors for dark theme
        // Remove white backgrounds
        svg.querySelectorAll('polygon').forEach(poly => {
          const fill = poly.getAttribute('fill');
          if (fill === 'white' || fill === '#ffffff' || fill === '#FFFFFF') {
            poly.setAttribute('fill', 'none');
          }
        });
        
        // Make all text white for dark theme
        svg.querySelectorAll('text').forEach(text => {
          text.setAttribute('fill', '#ffffff');
        });
        
        // Make edges visible (white/light gray)
        svg.querySelectorAll('path, polyline').forEach(path => {
          const stroke = path.getAttribute('stroke');
          if (stroke === 'black' || stroke === '#000000' || stroke === '#000') {
            path.setAttribute('stroke', '#aaaaaa');
          }
        });
        
        // Initialize zoom state
        this.currentScale = 1;
        this.svgElement = svg;
        
        this.setupSimpleZoom(wrapper, svg);
      });
    });
  }

  /**
   * Sets up zoom and pan functionality.
   * @param {HTMLElement} wrapper The wrapper container.
   * @param {SVGElement} svg The SVG element.
   */
  setupSimpleZoom(wrapper, svg) {
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
    
    // Mouse wheel zoom
    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.currentScale *= delta;
      this.currentScale = Math.max(0.5, Math.min(3, this.currentScale));
      this.updateSVGTransform(svg);
    });

    // Pan with drag
    svg.style.cursor = 'grab';
    
    svg.addEventListener('mousedown', (e) => {
      this.isPanning = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateSVGTransform(svg);
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        svg.style.cursor = 'grab';
      }
    });
  }

  /**
   * Updates the SVG scale and translation using CSS transform.
   * @param {SVGElement} svg The SVG element.
   */
  updateSVGTransform(svg) {
    svg.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentScale})`;
    svg.style.transformOrigin = 'top left';
  }

  /**
   * Sets up zoom control buttons.
   * @param {HTMLElement} container The container element.
   */
  setupZoomControls(container) {
    const zoomInBtn = container.querySelector('#ast-zoom-in-button');
    const zoomOutBtn = container.querySelector('#ast-zoom-out-button');
    const zoomResetBtn = container.querySelector('#ast-zoom-reset-button');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        this.currentScale *= 1.2;
        this.currentScale = Math.min(3, this.currentScale);
        if (this.svgElement) this.updateSVGTransform(this.svgElement);
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.currentScale *= 0.8;
        this.currentScale = Math.max(0.5, this.currentScale);
        if (this.svgElement) this.updateSVGTransform(this.svgElement);
      });
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => {
        this.currentScale = 1;
        this.translateX = 0;
        this.translateY = 0;
        if (this.svgElement) this.updateSVGTransform(this.svgElement);
      });
    }
  }
}
