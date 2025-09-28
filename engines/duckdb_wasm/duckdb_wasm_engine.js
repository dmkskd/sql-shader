import * as duckdb from '@duckdb/duckdb-wasm';
import { SHADERS } from './duckdb_wasm_shaders.js';
import * as d3 from 'd3';
import mermaid from 'mermaid';
// Use a namespace import to robustly handle this non-standard module.
import * as d3_flame_graph from 'd3-flame-graph';

/**
 * Implements the Engine interface for DuckDB-WASM.
 */
class DuckDBWasmEngine {
  constructor() {
    this.db = null;
    this.connection = null;
  }

  /**
   * Initializes the DuckDB-WASM instance, worker, and database connection.
   * This is a required method for the engine interface.
   * @param {function(string): void} statusCallback A function to report progress updates.
   * @returns {Promise<void>}
   */
  async initialize(statusCallback) {
    statusCallback('Initializing DuckDB-WASM...');
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
    );
    const worker = new Worker(workerUrl);
    // Use a VoidLogger to prevent excessive console output during complex queries.
    const logger = new duckdb.VoidLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);

    statusCallback('Connecting to database...');
    this.connection = await this.db.connect();

  }

  /**
   * @param {string} sql
   * This is a required method for the engine interface.
   * @returns {Promise<import('@duckdb/duckdb-wasm').PreparedStatement>} A handle to the prepared query.
   * @returns {Promise<any>} A handle to the prepared query.
   */
  async prepare(sql) {
    return await this.connection.prepare(sql);
  }

  /**
   * Runs a query with profiling enabled and returns the raw and JSON profile data.
   * @param {string} sql The raw SQL of the shader to profile.
   * This is a required method for the engine interface.
   * @param {Array<any>} params The parameters for the query.
   * @returns {Promise<object>} The parsed JSON profile output.
   */
  profile = async (sql, params) => {
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
      await this.connection.query("PRAGMA enable_profiling = 'json'");
      const jsonResult = await this.connection.query(explainedSql);
      const jsonString = jsonResult.getChild('explain_value').get(0);
      const jsonPlan = JSON.parse(jsonString);
      console.log('[engine.profile] Successfully retrieved JSON query plan.');
      
      // Return the raw text for the first tab, and null for the structured one for now.
      return { raw: rawPlan, json: jsonPlan };
    } finally {
      // CRITICAL: Disable profiling to restore normal connection behavior for the render loop.
      await this.connection.query("PRAGMA disable_profiling");
      console.log('[engine.profile] Profiling disabled, connection restored to normal state.');
    }
  };

  /**
   * Renders the multi-faceted profile data into the modal.
   * @param {object} profileData The profile data object from the profile() method.
   * This is a required method for the engine interface.
   * @param {object} containers The DOM elements to render into.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, containers) {
    const { rawPlanContainer, structuredPlanContainer, graphPlanContainer, flamegraphContainer, querySummaryContainer, tabs } = containers;
    const rawHeaderText = `<h3>Raw Plan Output</h3><p>Generated via: <code>EXPLAIN ANALYZE</code> with <code>PRAGMA enable_profiling = 'query_tree'</code></p>`;
    rawPlanContainer.innerHTML = rawHeaderText + this.renderRawProfile(profileData.raw);
    tabs.rawPlan.style.display = 'block';

    if (profileData.json) {
      const structuredHeaderText = `<h3>Structured Plan View</h3><p>Generated from the JSON output of <code>EXPLAIN ANALYZE</code></p>`;
      structuredPlanContainer.innerHTML = structuredHeaderText + this.parsePlanToHtml(profileData.json);

      // The flamegraph is now rendered on-demand by a listener in main.js
      // to ensure the container is visible and has a width.
      // this.renderFlamegraph(profileData.json, flamegraphContainer);
      // Render the graph with the default 'data-flow' (bottom-up) view
      this.renderMermaidGraph(profileData.json, graphPlanContainer, 'data-flow');
      
      // Show DuckDB-specific tabs
      tabs.structuredPlan.style.display = 'block';
      tabs.flamegraph.style.display = 'block';
      tabs.graphPlan.style.display = 'block';
      
      // Hide ClickHouse-specific tabs
      tabs.querySummary.style.display = 'none';

      this.setupGraphDirectionToggle(profileData.json, graphPlanContainer);
    } else if (containers.tabs.structuredPlan) {
        tabs.structuredPlan.style.display = 'none';
        tabs.flamegraph.style.display = 'none';
        tabs.graphPlan.style.display = 'none';
        tabs.querySummary.style.display = 'none';
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
   * @param {object} planNode The root node of the JSON query plan.
   * @returns {string} An HTML string representing the structured view.
   */
  parsePlanToHtml(planNode) {
    // The actual query plan is nested inside the top-level object and an EXPLAIN_ANALYZE node.
    const rootNode = planNode?.children?.[0]?.children?.[0];
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
   * @param {object} planNode The root node of the JSON query plan.
   * @param {HTMLElement} container The DOM element to render the chart into.
   */
  renderFlamegraph(planNode, container) {
    const rootNode = planNode?.children?.[0]?.children?.[0];
    if (!rootNode) return;

    const flamegraphHeaderText = `<h3>CPU FlameGraph</h3><p>Generated from the timing information in the JSON output of <code>EXPLAIN ANALYZE</code></p>`;
    container.innerHTML = flamegraphHeaderText;

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
    // container.innerHTML = ''; // Header is now added, so we append.
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
   * @param {object} planNode The root node of the JSON query plan.
   * @param {HTMLElement} container The DOM element to render the chart into.
   * @param {string} direction The Mermaid graph direction ('TD' or 'BT').
   */
  async renderMermaidGraph(planNode, container, direction = 'TD') {
    const rootNode = planNode?.children?.[0]?.children?.[0];
    if (!rootNode) return;

    const graphHeaderText = `<h3>Query Graph</h3><p>Generated from the JSON output of <code>EXPLAIN ANALYZE</code></p>`;
    container.innerHTML = graphHeaderText;

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
    container.innerHTML += svg; // Append the graph after the header

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
    const button = document.getElementById('switch-graph-direction-button');
    let currentLayout = 'data-flow'; // Default is the "bottom-up" data flow view (leaves at top)

    const updateButtonText = () => {
      button.textContent = (currentLayout === 'data-flow') ? 'Switch to Top Down' : 'Switch to Bottom Up';
      button.title = (currentLayout === 'data-flow') ? 'View as a logical plan (root at top)' : 'View as a data flow plan (leaves at top)';
    };

    const toggle = () => {
      currentLayout = (currentLayout === 'data-flow') ? 'logical' : 'data-flow';
      this.renderMermaidGraph(planNode, container, currentLayout);
      updateButtonText();
    };
    updateButtonText(); // Set initial button text
    button.onclick = toggle; // Use onclick to easily replace the handler on re-profile
  }

  /**
   * Returns the list of example shaders available for this engine.
   * This is a required method for the engine interface.
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }
}

export const engine = new DuckDBWasmEngine();