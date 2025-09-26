import * as duckdb from '@duckdb/duckdb-wasm';
import { SHADERS } from './duckdb_wasm_shaders.js';
import * as d3 from 'd3';
import { flamegraph } from 'd3-flame-graph';

/**
 * Implements the Engine interface for DuckDB-WASM.
 */
class DuckDBWasmEngine {
  constructor() {
    this.db = null;
    this.connection = null;
  }

  /**
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
   * @returns {Promise<any>} A handle to the prepared query.
   */
  async prepare(sql) {
    return await this.connection.prepare(sql);
  }

  /**
   * Runs a query with profiling enabled and returns the structured profile data.
   * @param {string} sql The raw SQL of the shader to profile.
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
   * Renders the profile data into an HTML string.
   * @param {object} profileData The profile data object from the profile() method.
   * @param {object} containers The DOM elements to render into.
   * @returns {Promise<void>}
   */
  async renderProfile(profileData, containers) {
    const { rawContainer, structuredContainer, flamegraphContainer, tabs } = containers;
    rawContainer.innerHTML = this.renderRawProfile(profileData.raw);

    if (profileData.json) {
      structuredContainer.innerHTML = this.parsePlanToHtml(profileData.json);
      this.renderFlamegraph(profileData.json, flamegraphContainer);
      if (tabs.structured) {
        tabs.structured.style.display = 'block';
        document.querySelector('.profiler-tab[data-tab="flamegraph"]').style.display = 'block';
      }
    } else if (containers.tabs.structured) {
        tabs.structured.style.display = 'none';
        document.querySelector('.profiler-tab[data-tab="flamegraph"]').style.display = 'none';
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

    // Convert DuckDB plan to the format d3-flame-graph expects
    function transformToFlamegraphData(node) {
      return {
        name: (node.operator_name || 'UNNAMED').replace(/_/g, ' '),
        value: node.operator_timing * 1000, // Use milliseconds for value
        children: (node.children || []).map(transformToFlamegraphData)
      };
    }

    const flamegraphData = transformToFlamegraphData(rootNode);

    // Clear previous chart and render the new one
    container.innerHTML = '';
    const flamegraphChart = flamegraph()
      .width(container.clientWidth)
      .cellHeight(18)
      .transitionDuration(300)
      .selfValue(false); // Value is inclusive of children

    d3.select(container).datum(flamegraphData).call(flamegraphChart);
  }

  /**
   * @returns {Array<{name: string, sql: string}>}
   */
  getShaders() {
    return SHADERS;
  }
}

export const engine = new DuckDBWasmEngine();