import * as d3 from 'd3';
import mermaid from 'mermaid';
// Use a namespace import to robustly handle this non-standard module.
import { createApp } from 'vue';
import * as d3_flame_graph from 'd3-flame-graph';
import * as duckdbExplainVisualizer from 'duckdb-explain-visualizer';

export class DuckDBWasmProfiler {
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Runs a query with profiling enabled and returns the raw and JSON profile data.
   * @param {string} sql The raw SQL of the shader to profile.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<object>} The parsed JSON profile output.
   */
  async profile(sql, params) {
    console.log('[engine.profile] Profiling with stable text-only strategy.');
    // The EXPLAIN ANALYZE command cannot use parameters directly.
    // We must manually substitute the '?' placeholders in the SQL string.
    // This is safe here because the parameters are all numbers controlled by our app.
    let explainedSql = `EXPLAIN ANALYZE ${sql}`;
    for (const param of params) {
      explainedSql = explainedSql.replace('?', param);
    }
    
    // Use the default, stable 'query_tree' profiler output.
    // This avoids the JSON-related crashes.
    try {
      await this.connection.query("PRAGMA enable_profiling = 'query_tree'");
      const rawResult = await this.connection.query(explainedSql);
      // The result of EXPLAIN is a table with one row and one column: 'explain_value'.
      // We access it by getting the column vector first, then the first element.
      const rawPlan = rawResult.getChild('explain_value').get(0);
      console.log('[engine.profile] Successfully retrieved text query plan.');

      // Now, get the JSON plan for the structured view
      let jsonPlan = null;
      let fullJsonPlan = null;
      try {
        await this.connection.query("PRAGMA enable_profiling = 'json'");
        const jsonResult = await this.connection.query(explainedSql);
        const fullJsonString = jsonResult.getChild('explain_value').get(0);
        
        console.log('[engine.profile] Raw JSON string length:', fullJsonString?.length);
        console.log('[engine.profile] First 200 chars of JSON:', fullJsonString?.substring(0, 200));
        
        fullJsonPlan = JSON.parse(fullJsonString);

        console.log('[engine.profile] Parsed JSON keys:', Object.keys(fullJsonPlan || {}));
        console.log('[engine.profile] Full JSON plan structure:', JSON.stringify(fullJsonPlan, null, 2).substring(0, 1000));

        // The actual plan is nested. Extract the root node for our rendering functions.
        // DuckDB v1.4.0 (in duckdb-wasm 1.31.0) may have changed the structure vs v1.3.2, so we need to be flexible
        
        // Try the old structure first (v1.3.2): children[0].children[0]
        if (fullJsonPlan?.children?.[0]?.children?.[0]) {
          jsonPlan = fullJsonPlan.children[0].children[0];
          console.log('[engine.profile] ✓ Using DuckDB v1.3.2 JSON structure (children[0].children[0])');
        }
        // Try direct children[0] (possible v1.4.0 structure)
        else if (fullJsonPlan?.children?.[0]) {
          jsonPlan = fullJsonPlan.children[0];
          console.log('[engine.profile] ✓ Using DuckDB v1.4.0 JSON structure (children[0])');
        }
        // Use the full plan if no children found
        else if (fullJsonPlan) {
          jsonPlan = fullJsonPlan;
          console.log('[engine.profile] ✓ Using root JSON structure (no nesting)');
        }

        console.log('[engine.profile] Final jsonPlan keys:', Object.keys(jsonPlan || {}));
        console.log('[engine.profile] Successfully retrieved and extracted JSON query plan.');
      } catch (jsonError) {
        console.error('[engine.profile] Error getting JSON plan:', jsonError);
        console.error('[engine.profile] Stack:', jsonError.stack);
        // Continue without JSON plan - the raw plan will still work
        jsonPlan = null;
        fullJsonPlan = null;
      }
      
      // Return both the raw text, extracted plan (for our renders), and full plan (for visualizer)
      return { raw: rawPlan, json: jsonPlan, fullJson: fullJsonPlan };
    } finally {
      // Disable profiling to restore normal connection behavior for the render loop.
      await this.connection.query("PRAGMA disable_profiling");
      console.log('[engine.profile] Profiling disabled, connection restored to normal state.');
    }
  }

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The profile data object from the profile() method.
   * @param {HTMLElement} mainContainer The single container element for the profiler UI.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, mainContainer) {
    const tabsConfig = [
      { id: 'raw-plan', title: 'Raw Plan', content: this.renderRawProfile(profileData.raw), header: "Generated via: <code>EXPLAIN ANALYZE</code> with <code>PRAGMA enable_profiling = 'query_tree'</code>" },
    ];

    if (profileData.json) {
      tabsConfig.push(
        { id: 'structured-plan', title: 'Structured Plan', content: this.parsePlanToHtml(profileData.json), header: "Generated from the JSON output of <code>EXPLAIN ANALYZE</code>" },
        { id: 'graph-plan', title: 'Graph Plan', content: '', header: "Generated from the JSON output of <code>EXPLAIN ANALYZE</code>" },
        { id: 'flamegraph', title: 'FlameGraph', content: '', header: "Generated from the timing information in the JSON output of <code>EXPLAIN ANALYZE</code>" },
        { id: 'visualizer', title: 'Visualizer', content: '<div id="duckdb-visualizer-app"></div>', header: "Powered by duckdb-explain-visualizer" }
      );
    }

    let tabsHtml = '<div class="profiler-tabs">';
    let contentHtml = '';

    tabsConfig.forEach((tab, index) => {
      const activeClass = index === 0 ? 'active' : '';
      tabsHtml += `<button class="profiler-tab ${activeClass}" data-tab="${tab.id}">${tab.title}</button>`;
      contentHtml += `<div id="profile-content-${tab.id}" class="profiler-tab-content ${activeClass}">
                        <h3>${tab.title}</h3>
                        <p>${tab.header}</p>`;
      if (tab.id === 'graph-plan') {
        contentHtml += `<div class="graph-controls" data-for-tab="graph-plan"><button id="ddb-switch-graph-direction-button" title="Switch Graph Direction">Switch Direction</button></div>`;
      }
      contentHtml += `  <div class="tab-inner-content">${tab.content || ''}</div>
                      </div>`;
    });
    tabsHtml += '</div>';

    mainContainer.innerHTML = tabsHtml + contentHtml;

    // --- Post-render logic for dynamic content ---

    // Re-attach tab switching logic
    const profilerTabs = mainContainer.querySelectorAll('.profiler-tab');
    const profilerTabContents = mainContainer.querySelectorAll('.profiler-tab-content');
    profilerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        profilerTabs.forEach(t => t.classList.remove('active'));
        profilerTabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const activeContent = mainContainer.querySelector(`#profile-content-${tab.dataset.tab}`);
        activeContent.classList.add('active');
      });
    });

    if (profileData.json) {
      const graphPlanContainer = mainContainer.querySelector('#profile-content-graph-plan .tab-inner-content');
      const flamegraphContainer = mainContainer.querySelector('#profile-content-flamegraph .tab-inner-content');

      // Render the graph plan
      this.renderMermaidGraph(profileData.json, graphPlanContainer, 'data-flow');
      this.setupGraphDirectionToggle(profileData.json, graphPlanContainer);

      // Set up on-demand rendering for the flame graph
      const flamegraphTab = mainContainer.querySelector('.profiler-tab[data-tab="flamegraph"]');
      if (flamegraphTab) {
        const renderFlamegraphOnFirstClick = () => {
          requestAnimationFrame(() => {
            console.log(`[Debug] Rendering DuckDB flame graph in container with width: ${flamegraphContainer.clientWidth}px`);
            this.renderFlamegraph(profileData.json, flamegraphContainer);
            flamegraphTab.removeEventListener('click', renderFlamegraphOnFirstClick);
          });
        };
        flamegraphTab.addEventListener('click', renderFlamegraphOnFirstClick);
      }

      // Mount the DuckDB Explain Visualizer Vue app
      const visualizerContainer = mainContainer.querySelector('#duckdb-visualizer-app');
      if (visualizerContainer) {
        // Add CSS isolation for the visualizer to prevent conflicts
        visualizerContainer.style.cssText = `
          position: relative !important;
          overflow: hidden !important;
          height: 80vh !important;
          min-height: 800px !important;
          max-height: 90vh !important;
          contain: layout style !important;
        `;
        
        // Add scoped CSS to prevent the visualizer from growing infinitely
        if (!document.getElementById('duckdb-visualizer-isolation-styles')) {
          const styleEl = document.createElement('style');
          styleEl.id = 'duckdb-visualizer-isolation-styles';
          styleEl.textContent = `
            #duckdb-visualizer-app {
              height: 80vh !important;
              min-height: 800px !important;
              max-height: 90vh !important;
              overflow: hidden !important;
            }
            #duckdb-visualizer-app .overflow-auto {
              max-height: calc(80vh - 100px) !important;
              overflow-y: auto !important;
            }
            #duckdb-visualizer-app .flex-grow-1 {
              flex-grow: 1 !important;
              max-height: calc(80vh - 100px) !important;
            }
            #duckdb-visualizer-app .tab-content {
              height: calc(80vh - 150px) !important;
              max-height: calc(80vh - 150px) !important;
              overflow: hidden !important;
            }
            #duckdb-visualizer-app .d-flex {
              max-height: inherit !important;
            }
            /* Allow the left panel resizer to work */
            #duckdb-visualizer-app .resizable,
            #duckdb-visualizer-app [style*="resize"],
            #duckdb-visualizer-app .split-pane {
              height: 100% !important;
              max-height: none !important;
            }
            /* Prevent infinite card scrolling in right panel */
            #duckdb-visualizer-app .card {
              position: static !important;
              transform: none !important;
              margin-bottom: 10px !important;
            }
            /* Ensure right panel has proper scrolling */
            #duckdb-visualizer-app .overflow-auto:not(.flex-grow-1) {
              overflow-y: auto !important;
              max-height: calc(80vh - 200px) !important;
            }
          `;
          document.head.appendChild(styleEl);
        }
        
        // The visualizer expects the full JSON structure, not the extracted plan
        const planSource = JSON.stringify(profileData.fullJson || profileData.json);

        const app = createApp({
          data() {
            return {
              plan: planSource,
            }
          },
          template: `<duckdb-explain-visualizer :plan-source="plan" plan-query="" />`
        });
        app.component("duckdb-explain-visualizer", duckdbExplainVisualizer.Plan);
        app.mount(visualizerContainer);
      }
    }
  }

  /**
   * Renders the raw, color-coded profile data.
   * @param {string} planText The raw query plan text.
   * @returns {string} A string containing formatted HTML for the raw view.
   */
  renderRawProfile(planText) {
      const colorCoded = planText.replace(/(\(actual time: ([\d.]+)s|\(([\d.]+)s\))/g, (match, _, timeStr1, timeStr2) => {
          const time = parseFloat(timeStr1 || timeStr2);
          let colorClass = 'time-good';
          if (time > 0.1) {
              colorClass = 'time-hot';
          } else if (time > 0.01) {
              colorClass = 'time-warm';
          }
          return `<span class="${colorClass}">${match}</span>`;
      });
      return `<pre>${colorCoded}</pre>`;
  }

  /**
   * Parses the DuckDB EXPLAIN ANALYZE output into a structured, collapsible HTML view.
   * @param {object} planNode The root node of the JSON query plan (already extracted).
   * @returns {string} An HTML string representing the structured view.
   */
  parsePlanToHtml(planNode) {
    const rootNode = planNode;
    if (!rootNode) return 'No structured plan available.';

    // First, calculate the total time by summing up all operator timings in the tree.
    // This is more accurate than assuming the root node's time is the total.
    let totalQueryTime = 0;
    function sumTimings(node) {
        totalQueryTime += node.operator_timing;
        if (node.children) {
            node.children.forEach(sumTimings);
        }
    }
    sumTimings(rootNode);

    // Recursively build the HTML for the tree
    function buildHtml(node) {
        // Use the correct property names from the JSON
        const timeMs = (node.operator_timing * 1000).toFixed(2); // Convert seconds to ms
        const rows = node.operator_cardinality;
        const operatorName = (node.operator_name || 'UNNAMED_NODE').replace(/_/g, ' ');
        const timePercent = totalQueryTime > 0 ? ((node.operator_timing / totalQueryTime) * 100) : 0;

        let percentColorClass = 'time-good'; // < 5%
        if (timePercent >= 50) {
            percentColorClass = 'time-hot'; // >= 50%
        } else if (timePercent >= 5) {
            percentColorClass = 'time-warm'; // >= 5% and < 50%
        }
        let summary = `<strong>${operatorName}</strong> - ${rows} Rows (${timeMs}ms) <span class="${percentColorClass}" style="font-weight: bold;">[${timePercent.toFixed(1)}%]</span>`;

        // The 'extra_info' field often contains useful details.
        // It's an object with various properties, so we format it nicely.
        let infoLines = [];
        if (node.extra_info && typeof node.extra_info === 'object') {
            for (const [key, value] of Object.entries(node.extra_info)) {
                if (Array.isArray(value)) {
                    infoLines.push(`${key}: ${value.join(', ')}`);
                } else {
                    infoLines.push(`${key}: ${value}`);
                }
            }
        }
        const details = infoLines.filter(line => line).map(line => `<div>${line}</div>`).join('');

        const childrenHtml = (node.children || []).map(buildHtml).join('');

        return `<div class="profiler-node"><details open><summary>${summary}</summary><div style="padding-left: 20px;">${details}${childrenHtml}</div></details></div>`;
    }

    return buildHtml(rootNode);
  }

  /**
   * Renders a FlameGraph from the DuckDB JSON query plan.
   * @param {object} planNode The root node of the JSON query plan (already extracted).
   * @param {HTMLElement} container The DOM element to render the chart into.
   */
  renderFlamegraph(planNode, container) {
    const rootNode = planNode;
    if (!rootNode) return;

    const flamegraphHeaderText = `<h3>CPU FlameGraph</h3><p>Generated from the timing information in the JSON output of <code>EXPLAIN ANALYZE</code></p>`;
    // container.innerHTML = flamegraphHeaderText; // This is now handled by the main render function

    // Calculate total time to use for percentages in tooltips
    let totalQueryTime = 0;
    function sumTimings(node) {
        totalQueryTime += node.operator_timing;
        if (node.children) node.children.forEach(sumTimings);
    }
    sumTimings(rootNode);

    // Create a color scale from "cold" (green) to "hot" (red) based on time.
    // We use a sqrt scale to better differentiate the smaller values.
    const maxTime = rootNode.operator_timing * 1000;
    const colorScale = d3.scaleSequential(d3.interpolateRgb("hsl(120, 50%, 35%)", "hsl(0, 80%, 45%)")).domain([0, Math.sqrt(maxTime)]);


    // Convert DuckDB plan to the format d3-flame-graph expects
    function transformToFlamegraphData(node) {
      return {
        name: (node.operator_name || 'UNNAMED').replace(/_/g, ' '),
        value: node.operator_timing * 1000, // Use milliseconds for value
        children: (node.children || []).map(transformToFlamegraphData),
        original: node, // Keep a reference to the original node for tooltips
      };
    }

    const flamegraphData = transformToFlamegraphData(rootNode);

    // Define a function to create rich HTML tooltips
    const labelHandler = (d) => {
      const node = d.data.original;
      const timeMs = (node.operator_timing * 1000).toFixed(2);
      const percent = totalQueryTime > 0 ? ((node.operator_timing / totalQueryTime) * 100).toFixed(1) : 0;
      return `<strong>${d.data.name}</strong><br>
              Time: ${timeMs} ms (${percent}%)<br>
              Rows: ${node.operator_cardinality.toLocaleString()}`;
    };

    // Clear previous chart and render the new one
    container.innerHTML = ''; // Clear the container before rendering the chart
    const flamegraphChart = d3_flame_graph.flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .transitionDuration(300)
      .selfValue(false) // Value is inclusive of children
      .setColorMapper(d => colorScale(Math.sqrt(d.data.value))) // Color by execution time
      .label(labelHandler); // Use our custom tooltip function

    d3.select(container).datum(flamegraphData).call(flamegraphChart);
  }

  /**
   * Renders a Mermaid.js graph from the DuckDB JSON query plan.
   * @param {object} planNode The root node of the JSON query plan (already extracted).
   * @param {HTMLElement} container The DOM element to render the chart into.
   * @param {string} direction The Mermaid graph direction ('TD' or 'BT').
   */
  async renderMermaidGraph(planNode, container, direction = 'TD') {
    const rootNode = planNode;
    if (!rootNode) return;

    container.innerHTML = ''; // Clear the container before rendering

    // First, calculate the total time by summing up all operator timings in the tree.
    let totalQueryTime = 0;
    function sumTimings(node) {
        totalQueryTime += node.operator_timing;
        if (node.children) {
            node.children.forEach(sumTimings);
        }
    }
    sumTimings(rootNode);

    let mermaidSyntax = 'graph TD;\n'; // Always use Top-Down graph orientation
    let nodeCounter = 0;
    const nodeInfoMap = new Map();

    // Define CSS classes for Mermaid node styling based on performance
    mermaidSyntax += 'classDef timeHot fill:#5c2828,stroke:#ff8080,stroke-width:2px,color:#fff;\n';
    mermaidSyntax += 'classDef timeWarm fill:#5a4e3a,stroke:#ffc980,stroke-width:2px,color:#fff;\n';
    mermaidSyntax += 'classDef timeGood fill:#2a4a3a,stroke:#80ff80,stroke-width:2px,color:#fff;\n';

    const jsonToMermaid = (node) => {
      const nodeId = `n${nodeCounter++}`;
      const operatorName = (node.operator_name || 'UNNAMED').replace(/_/g, ' ');
      const timeMs = (node.operator_timing * 1000).toFixed(2);
      const rows = node.operator_cardinality;

      // Define the node's text content
      let nodeText = `<strong>${operatorName}</strong><br/>${rows.toLocaleString()} rows<br/>${timeMs} ms`;
      
      // Escape quotes for Mermaid syntax
      nodeText = nodeText.replace(/"/g, '#quot;');

      // Store extra info for the tooltip
      let extraInfoHtml = '';
      if (node.extra_info && typeof node.extra_info === 'object') {
          for (const [key, value] of Object.entries(node.extra_info)) {
              const valStr = Array.isArray(value) ? value.join(', ') : value;
              extraInfoHtml += `<strong>${key}:</strong> ${valStr}<br>`;
          }
      }
      if (extraInfoHtml) nodeInfoMap.set(nodeId, extraInfoHtml);

      mermaidSyntax += `    ${nodeId}["${nodeText}"];\n`;

      // Assign a class to the node based on its percentage of total time
      const timePercent = totalQueryTime > 0 ? ((node.operator_timing / totalQueryTime) * 100) : 0;
      if (timePercent >= 50) {
        mermaidSyntax += `    class ${nodeId} timeHot;\n`;
      } else if (timePercent >= 5) {
        mermaidSyntax += `    class ${nodeId} timeWarm;\n`;
      } else {
        mermaidSyntax += `    class ${nodeId} timeGood;\n`;
      }

      if (node.children) {
        node.children.forEach(child => {
          const childId = jsonToMermaid(child);
          // Reverse the arrow direction for a top-down logical view
          if (direction === 'data-flow') { // The default "bottom-up" view
            mermaidSyntax += `    ${childId} --> ${nodeId};\n`;
          } else {
            mermaidSyntax += `    ${nodeId} --> ${childId};\n`; // The flipped "top-down" view
          }
        });
      }
      return nodeId;
    };

    jsonToMermaid(rootNode);
    const { svg } = await mermaid.render('duckdb-mermaid-graph', mermaidSyntax);
    container.innerHTML = svg;

    // --- Add Tooltip Logic ---
    const tooltipEl = document.getElementById('graph-tooltip');
    container.querySelectorAll('.node').forEach(nodeEl => {
      const nodeId = nodeEl.id;
      const extraInfo = nodeInfoMap.get(nodeId);
      if (extraInfo) {
        nodeEl.addEventListener('mouseover', () => {
          tooltipEl.innerHTML = extraInfo;
          tooltipEl.style.display = 'block';
        });
        nodeEl.addEventListener('mousemove', (e) => {
          // Position tooltip near the cursor
          tooltipEl.style.left = `${e.clientX + 15}px`;
          tooltipEl.style.top = `${e.clientY + 15}px`;
        });
        nodeEl.addEventListener('mouseout', () => {
          tooltipEl.style.display = 'none';
        });
      }
    });
  }

  /**
   * Sets up the event listener for the graph direction toggle button.
   * @param {object} planNode The root node of the JSON query plan.
   * @param {HTMLElement} container The DOM element where the chart is rendered.
   */
  setupGraphDirectionToggle(planNode, container) {
    const button = document.getElementById('ddb-switch-graph-direction-button');
    if (!button) return;

    let currentLayout = 'data-flow'; // Default is the "bottom-up" data flow view (leaves at top)

    const updateButtonText = () => {
      button.textContent = (currentLayout === 'data-flow') ? 'Switch to Top Down' : 'Switch to Bottom Up';
      button.title = (currentLayout === 'data-flow') ? 'View as a logical plan (root at top)' : 'View as a data flow plan (leaves at top)';
    };

    // Remove any old listener before adding a new one to prevent conflicts on re-profiling.
    if (button.handler) {
      button.removeEventListener('click', button.handler);
    }

    button.handler = () => {
      currentLayout = (currentLayout === 'data-flow') ? 'logical' : 'data-flow';
      this.renderMermaidGraph(planNode, container, currentLayout);
      updateButtonText();
    };
    updateButtonText(); // Set initial button text
    button.addEventListener('click', button.handler);
  }
}