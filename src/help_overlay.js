/**
 * Help Overlay System
 * Press Ctrl+/ to toggle help annotations on major UI components
 */

export class HelpOverlay {
  constructor() {
    this.isActive = false;
    this.pendingTimeouts = []; // Track timeouts for cleanup
    this.currentContext = null; // Track current context to detect changes
    
    // Main UI annotations
    this.mainAnnotations = [
      {
        selector: '.CodeMirror',  // Editor is wrapped in CodeMirror
        text: '<strong>Real-time SQL editor:</strong> with syntax highlighting. Auto-compiles on change (300ms debounce).',
        position: 'right'
      },
      {
        selector: '#shader-canvas',  // Canvas has this ID
        text: '<strong>Live rendered SQL shader:</strong> Each pixel is a database row with r,g,b values.',
        position: 'left'
      },
      {
        selector: '#engine-select',  // Select element, not container
        text: '<strong>Switch between database engines:</strong> DuckDB-WASM (browser), ClickHouse (server).',
        position: 'bottom'
      },
      {
        selector: '#settings-button',
        text: '<strong>Engine Settings:</strong> Configure connection URLs, performance options, and debug settings.',
        position: 'bottom'
      },
      {
        selector: '#play-toggle-button',
        text: '<strong>Play/Pause:</strong> Stop/Resume shader execution. Pauses time progression and query execution.',
        position: 'top'
      },
      {
        selector: '#save-shader-button',
        text: '<strong>Save:</strong> Save current shader to browser storage (Ctrl+S / Cmd+S).',
        position: 'top'
      },
      {
        selector: '#autocompile-toggle-button',
        text: '<strong>Auto-Compile:</strong> Toggle auto-compilation of the shader (Ctrl+Shift+A).',
        position: 'top'
      },

      {
        selector: '#shader-select-button',  // Button to open shader library
        text: '<strong>Shader Library:</strong> Pre-built shader examples. Click to open asset manager.',
        position: 'top'
      },
      {
        selector: '#resolution-select',
        text: '<strong>Resolution:</strong> Change canvas resolution. Higher resolutions = more pixels to compute.',
        position: 'top'
      },
      {
        selector: '#zoom-select',
        text: '<strong>Zoom:</strong> Scale the canvas display without changing resolution.',
        position: 'top'
      },

      {
        selector: '#profile-button',
        text: '<strong>Profile:</strong> Log query execution statistics (engine-specific).',
        position: 'bottom'
      },
      {
        selector: '#toggle-perf-button',
        text: '<strong>Stats Toggle:</strong> Show/hide performance statistics panel.',
        position: 'top'
      },
      {
        selector: '#performance-bar',  // Performance stats container
        text: '<strong>Real-time performance metrics:</strong> FPS, query time, CPU usage, and engine stats.',
        position: 'top'
      },

      {
        selector: '#overlay-toggle-button',
        text: '<strong>Overlay Mode:</strong> Overlay editor on top of canvas for simultaneous viewing.',
        position: 'top'
      },
      {
        selector: '#audio-pattern-button',
        text: '<strong>Audio Input:</strong> Enable audio input for FFT-based shader uniforms. Based on strudel.cc',
        position: 'top'
      },
      {
        selector: '#effect-select',
        text: '<strong>Visual Effects:</strong> Apply retro visual effects (CRT, VHS, Terminal).',
        position: 'top'
      },
      {
        selector: '#clear-state-button',
        text: '<strong>Clear State:</strong> Reset all saved settings and shaders from browser storage.',
        position: 'bottom'
      }

    ];
    
    // ClickHouse Profiler annotations
    this.profilerAnnotations = [
      {
        selector: '.profiler-tab[data-tab="query-summary"]',
        text: '<strong>Query Summary:</strong> Overview with execution time, rows processed, and memory usage.',
        position: 'top'
      },
      {
        selector: '.profiler-tab[data-tab="trace-log"]',
        text: '<strong>Trace Log:</strong> Low-level execution trace with detailed timing information.',
        position: 'bottom'
      },
      {
        selector: '.profiler-tab[data-tab="events"]',
        text: '<strong>Events:</strong> Performance counters and ProfileEvents from system.query_log.',
        position: 'top'
      },
      {
        selector: '.profiler-tab[data-tab="explain"]',
        text: '<strong>Explain:</strong> Query analysis with Plan, Pipeline, Query Tree, and AST views.',
        position: 'bottom'
      },
      {
        selector: '.profiler-tab[data-tab="flamegraph"]',
        text: '<strong>FlameGraph:</strong> CPU profiling visualization showing function call hierarchy and hot paths.',
        position: 'top'
      },
      {
        selector: '.profiler-tab[data-tab="call-graph"]',
        text: '<strong>Call Graph:</strong> Aggregated view of all function calls with total time spent.',
        position: 'bottom'
      },
      {
        selector: '.profiler-tab[data-tab="opentelemetry"]',
        text: '<strong>OpenTelemetry:</strong> Distributed tracing spans from system.opentelemetry_span_log.',
        position: 'top'
      }
    ];
    
    // EXPLAIN tab sub-annotations (only shown when EXPLAIN tab is active - ClickHouse)
    this.explainTabAnnotations = [
      {
        selector: '.middle-tab[data-middle-tab="plan"]',
        text: '<strong>Plan:</strong> Shows query execution plan with actions, expressions, and column details.',
        position: 'top',
        requiresTab: 'explain'  // Only show when explain tab is active
      },
      {
        selector: '.middle-tab[data-middle-tab="pipeline"]',
        text: '<strong>Pipeline:</strong> Visual execution pipeline with stages, transforms, and data flow.',
        position: 'bottom',
        requiresTab: 'explain'
      },
      {
        selector: '.middle-tab[data-middle-tab="query-tree"]',
        text: '<strong>Query Tree:</strong> Logical query structure after optimization passes.',
        position: 'top',
        requiresTab: 'explain'
      },
      {
        selector: '.middle-tab[data-middle-tab="ast"]',
        text: '<strong>AST:</strong> Abstract Syntax Tree showing how ClickHouse parses your SQL.',
        position: 'bottom',
        requiresTab: 'explain'
      }
    ];
    
    // DuckDB Profiler annotations (shown when DuckDB profiler modal is open)
    this.duckdbProfilerAnnotations = [
      {
        selector: '.profiler-tab[data-tab="raw-plan"]',
        text: '<strong>Raw Plan:</strong> Text output from <code>EXPLAIN ANALYZE</code> with query tree profiling.',
        position: 'bottom'
      },
      {
        selector: '.profiler-tab[data-tab="structured-plan"]',
        text: '<strong>Structured Plan:</strong> Hierarchical view of query execution plan with timing details.',
        position: 'top'
      },
      {
        selector: '.profiler-tab[data-tab="graph-plan"]',
        text: '<strong>Graph Plan:</strong> Visual graph representation using Mermaid diagrams.',
        position: 'bottom'
      },
      {
        selector: '.profiler-tab[data-tab="flamegraph"]',
        text: '<strong>FlameGraph:</strong> Performance visualization showing time spent in each operation.',
        position: 'top'
      },
      {
        selector: '.profiler-tab[data-tab="visualizer"]',
        text: '<strong>Visualizer:</strong> Interactive plan explorer powered by duckdb-explain-visualizer.',
        position: 'bottom'
      }
    ];
    
    this.setupKeyboardShortcut();
  }

  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+/ or Cmd+/ (macOS)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.toggle();
      }
      
      // Escape to close - stop propagation to prevent closing parent modals
      if (e.key === 'Escape' && this.isActive) {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
      }
    });
    
    // Monitor for context changes (e.g., opening/closing profiler modal)
    this.setupContextMonitor();
  }
  
  setupContextMonitor() {
    // Watch for changes to the profiler modal's display style
    const profilerModal = document.getElementById('profile-modal');
    if (!profilerModal) return;
    
    const observer = new MutationObserver(() => {
      if (this.isActive) {
        const newContext = this.getCurrentContext();
        if (newContext !== this.currentContext) {
          console.log('[HelpOverlay] Context changed from', this.currentContext, 'to', newContext);
          this.refresh();
        }
      }
    });
    
    observer.observe(profilerModal, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
  
  refresh() {
    // Remove existing annotations without fully hiding
    this.pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.pendingTimeouts = [];
    document.querySelectorAll('.help-annotation').forEach(el => el.remove());
    document.querySelectorAll('.help-highlight').forEach(el => el.remove());
    
    // Update context and show new annotations
    const annotations = this.getContextualAnnotations();
    const contextName = this.getCurrentContext();
    this.currentContext = contextName;
    
    // Update banner text
    const banner = document.getElementById('help-overlay-banner');
    if (banner) {
      banner.innerHTML = `
        <span>📖 Help Mode Active${contextName ? ` - ${contextName}` : ''}</span>
        <span style="opacity: 0.7; margin-left: 20px;">Press Ctrl+/ or ESC to close</span>
      `;
    }
    
    // Show new annotations
    annotations.forEach((annotation, index) => {
      const timeoutId = setTimeout(() => {
        this.showAnnotation(annotation);
        this.pendingTimeouts = this.pendingTimeouts.filter(id => id !== timeoutId);
      }, index * 100);
      this.pendingTimeouts.push(timeoutId);
    });
  }

  toggle() {
    if (this.isActive) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    this.isActive = true;
    document.body.classList.add('help-overlay-active');
    
    // Detect context and choose appropriate annotations
    const annotations = this.getContextualAnnotations();
    const contextName = this.getCurrentContext();
    this.currentContext = contextName; // Track initial context
    
    // Add semi-transparent backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'help-overlay-backdrop';
    backdrop.onclick = () => this.hide();
    document.body.appendChild(backdrop);
    
    // Add instruction banner with context
    const banner = document.createElement('div');
    banner.id = 'help-overlay-banner';
    banner.innerHTML = `
      <span>📖 Help Mode Active${contextName ? ` - ${contextName}` : ''}</span>
      <span style="opacity: 0.7; margin-left: 20px;">Press Ctrl+/ or ESC to close</span>
    `;
    document.body.appendChild(banner);
    
    // Show annotations with staggered timing, tracking timeouts for cancellation
    annotations.forEach((annotation, index) => {
      const timeoutId = setTimeout(() => {
        this.showAnnotation(annotation);
        // Remove from pending list after execution
        this.pendingTimeouts = this.pendingTimeouts.filter(id => id !== timeoutId);
      }, index * 100);
      this.pendingTimeouts.push(timeoutId);
    });
  }

  /**
   * Determines the current context based on visible UI elements.
   * @returns {string} Context name for display.
   */
  getCurrentContext() {
    const profilerModal = document.getElementById('profile-modal');
    if (profilerModal && profilerModal.style.display !== 'none') {
      // Detect which engine's profiler is open
      const engineSelect = document.getElementById('engine-select');
      const currentEngine = engineSelect ? engineSelect.value : '';
      
      if (currentEngine === 'clickhouse') {
        return 'ClickHouse Profiler';
      } else if (currentEngine === 'duckdb_wasm' || currentEngine === 'duckdb-wasm') {
        return 'DuckDB Profiler';
      }
      return 'Profiler';
    }
    return '';
  }

  /**
   * Gets annotations based on current context.
   * @returns {Array} Appropriate annotations for the current context.
   */
  getContextualAnnotations() {
    const profilerModal = document.getElementById('profile-modal');
    
    // If profiler is open, show profiler annotations
    if (profilerModal && profilerModal.style.display !== 'none') {
      // Detect which engine's profiler is active
      const engineSelect = document.getElementById('engine-select');
      const currentEngine = engineSelect ? engineSelect.value : '';
      
      console.log('[HelpOverlay] Profiler modal is open, current engine:', currentEngine);
      
      let annotations;
      
      if (currentEngine === 'duckdb_wasm' || currentEngine === 'duckdb-wasm') {
        // Show DuckDB profiler annotations
        console.log('[HelpOverlay] Showing DuckDB profiler annotations');
        annotations = [...this.duckdbProfilerAnnotations];
        
        // Debug: check which tabs exist
        const profilerContainer = document.querySelector('#profiler-content-container');
        console.log('[HelpOverlay] Profiler container exists:', profilerContainer !== null);
        console.log('[HelpOverlay] Profiler container HTML:', profilerContainer ? profilerContainer.innerHTML.substring(0, 500) : 'N/A');
        
        this.duckdbProfilerAnnotations.forEach(ann => {
          const element = document.querySelector(ann.selector);
          console.log(`[HelpOverlay] DuckDB tab ${ann.selector}:`, element ? 'EXISTS' : 'NOT FOUND', element);
        });
        
        // Also check ALL .profiler-tab elements
        const allTabs = document.querySelectorAll('.profiler-tab');
        console.log('[HelpOverlay] Total .profiler-tab elements found:', allTabs.length);
        allTabs.forEach(tab => {
          console.log('[HelpOverlay] Found tab:', tab.dataset.tab, tab.textContent);
        });
      } else if (currentEngine === 'clickhouse') {
        // Check if EXPLAIN tab is active (ClickHouse-specific)
        const explainTab = document.querySelector('.profiler-tab[data-tab="explain"]');
        const isExplainActive = explainTab && explainTab.classList.contains('active');
        
        // If EXPLAIN tab is active, ONLY show EXPLAIN sub-tab annotations (cleaner)
        if (isExplainActive) {
          annotations = [...this.explainTabAnnotations];
        } else {
          // Otherwise show main ClickHouse profiler tab annotations
          annotations = [...this.profilerAnnotations];
        }
      } else {
        // Fallback for other engines
        annotations = [];
      }
      
      // Filter to only show annotations for elements that actually exist and are visible
      return annotations.filter(annotation => {
        const element = document.querySelector(annotation.selector);
        if (!element) return false;
        
        // Check if element is visible (not display:none or hidden)
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    }
    
    // Otherwise show main UI annotations
    let annotations = this.mainAnnotations.filter(annotation => {
      // Only show annotations for elements that actually exist
      return document.querySelector(annotation.selector) !== null;
    });
    
    // Customize profile button annotation based on active engine
    const engineSelect = document.getElementById('engine-select');
    const currentEngine = engineSelect ? engineSelect.value : '';
    
    // Detect OS for keyboard shortcut display
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const profileShortcut = isMac ? '<code>⌘P</code>' : '<code>Ctrl+P</code>';
    
    annotations = annotations.map(annotation => {
      if (annotation.selector === '#profile-button') {
        if (currentEngine === 'clickhouse') {
          return {
            ...annotation,
            text: `<strong>ClickHouse Profiler</strong> ${profileShortcut}<br>Deep query analysis with <em>flamegraphs</em>, trace logs, and explain plans.`
          };
        } else if (currentEngine === 'duckdb_wasm' || currentEngine === 'duckdb-wasm') {
          return {
            ...annotation,
            text: `<strong>DuckDB Profile</strong> ${profileShortcut}<br>Logs query execution statistics to browser console.`
          };
        } else {
          return {
            ...annotation,
            text: `<strong>Profile</strong> ${profileShortcut}<br>Logs query execution statistics to browser console.`
          };
        }
      }
      return annotation;
    });
    
    return annotations;
  }

  hide() {
    this.isActive = false;
    document.body.classList.remove('help-overlay-active');
    
    // Cancel all pending timeouts first to prevent orphaned annotations
    this.pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.pendingTimeouts = [];
    
    // Remove all annotation elements
    document.querySelectorAll('.help-annotation').forEach(el => el.remove());
    document.querySelectorAll('.help-highlight').forEach(el => el.remove());
    document.getElementById('help-overlay-backdrop')?.remove();
    document.getElementById('help-overlay-banner')?.remove();
  }

  showAnnotation(annotation) {
    const target = document.querySelector(annotation.selector);
    if (!target) return;

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'help-annotation';
    tooltip.innerHTML = annotation.text;  // Use innerHTML to support HTML formatting
    
    // Create highlight overlay for target
    const highlight = document.createElement('div');
    highlight.className = 'help-highlight';
    
    document.body.appendChild(tooltip);
    document.body.appendChild(highlight);
    
    // Position elements
    this.positionAnnotation(target, tooltip, highlight, annotation.position);
    
    // Add hover effects to emphasize the highlighted element
    tooltip.addEventListener('mouseenter', () => {
      highlight.classList.add('help-highlight-active');
    });
    
    tooltip.addEventListener('mouseleave', () => {
      highlight.classList.remove('help-highlight-active');
    });
    
    // Click to dismiss individual annotation
    tooltip.onclick = (e) => {
      e.stopPropagation();
      tooltip.remove();
      highlight.remove();
    };
  }

  positionAnnotation(target, tooltip, highlight, preferredPosition) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Position highlight
    highlight.style.top = `${targetRect.top}px`;
    highlight.style.left = `${targetRect.left}px`;
    highlight.style.width = `${targetRect.width}px`;
    highlight.style.height = `${targetRect.height}px`;
    
    // Position tooltip based on preferred position
    const padding = 20;
    let top, left;
    
    switch (preferredPosition) {
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + padding;
        tooltip.classList.add('position-right');
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - padding;
        tooltip.classList.add('position-left');
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        tooltip.classList.add('position-bottom');
        break;
      case 'top':
        top = targetRect.top - tooltipRect.height - padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        tooltip.classList.add('position-top');
        break;
      default:
        top = targetRect.bottom + padding;
        left = targetRect.left;
    }
    
    // Keep tooltip within viewport
    const maxLeft = window.innerWidth - tooltipRect.width - 10;
    const maxTop = window.innerHeight - tooltipRect.height - 10;
    left = Math.max(10, Math.min(left, maxLeft));
    top = Math.max(10, Math.min(top, maxTop));
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }
}
