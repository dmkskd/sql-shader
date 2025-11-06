/**
 * QuestDB Profiler - Handles query profiling using EXPLAIN and system statistics
 */

/**
 * Profiles a query using QuestDB's EXPLAIN and system statistics.
 * @param {object} engine The QuestDB engine instance
 * @param {string} sql The SQL query
 * @param {Array} params Uniforms passed to the query ([width, height, time, mouseX, mouseY])
 * @returns {Promise<object>} Profile data including EXPLAIN plan and timing
 */
export async function profileQuery(engine, sql, params) {
  const [width, height, iTime, mouseX, mouseY] = params;
  const totalPixels = width * height;
  
  // Replace placeholders for EXPLAIN query
  const finalSql = sql
    .replace(/{width}/g, width)
    .replace(/{height}/g, height)
    .replace(/{pixels}/g, totalPixels)
    .replace(/{iTime}/g, iTime)
    .replace(/{mouseX}/g, mouseX)
    .replace(/{mouseY}/g, mouseY)
    .replace(/{iFrame}/g, 0) // Use dummy values for profiling
    .replace(/{iTimeDelta}/g, 0.016)
    .replace(/{iFrameRate}/g, 60);
  
  try {
    // Get EXPLAIN plan
    const explainSql = `EXPLAIN ${finalSql}`;
    console.log('[QuestDB] Profiling with EXPLAIN:', explainSql);
    const startExplain = performance.now();
    
    let explainText = '';
    if (engine.protocol === 'http') {
      const explainUrl = `${engine.baseUrl}/exec?query=${encodeURIComponent(explainSql)}`;
      console.log('[QuestDB] EXPLAIN URL:', explainUrl);
      const explainResponse = await fetch(explainUrl);
      const explainData = await explainResponse.json();
      console.log('[QuestDB] EXPLAIN response:', explainData);
      
      // QuestDB returns EXPLAIN results in the 'plan' column
      if (explainData.dataset && explainData.dataset.length > 0) {
        // Check if there's a 'QUERY PLAN' or 'plan' column
        const planColumnIndex = explainData.columns?.findIndex(col => 
          col.name?.toLowerCase().includes('plan')
        ) ?? 0;
        explainText = explainData.dataset.map(row => row[planColumnIndex]).join('\n');
      }
      
      // Fallback: if still empty, try to extract from any string columns
      if (!explainText && explainData.dataset && explainData.dataset.length > 0) {
        explainText = explainData.dataset.map(row => {
          // Find the first string value in the row
          return row.find(val => typeof val === 'string') || '';
        }).filter(Boolean).join('\n');
      }
    } else {
      // PostgreSQL protocol
      const result = await engine.queryViaPg(explainSql);
      console.log('[QuestDB] EXPLAIN PG result:', result);
      
      // PostgreSQL EXPLAIN returns rows as objects with column names
      if (result && result.length > 0) {
        // Each row is an object like {QUERY_PLAN: "..."} or {"QUERY PLAN": "..."}
        explainText = result.map(row => {
          // Find the plan column (could be QUERY_PLAN, QUERY PLAN, or plan)
          const planValue = row['QUERY PLAN'] || row['QUERY_PLAN'] || row['plan'] || row['PLAN'];
          if (planValue) return planValue;
          
          // Fallback: return the first string value in the row
          const firstValue = Object.values(row).find(val => typeof val === 'string');
          return firstValue || '';
        }).filter(Boolean).join('\n');
      }
    }
    const explainTime = performance.now() - startExplain;
    console.log('[QuestDB] EXPLAIN text:', explainText);
    
    // Execute the actual query with timing
    const startQuery = performance.now();
    await engine.query(sql, null, {
      iResolution: [width, height],
      iTime: iTime,
      iMouse: [mouseX, mouseY],
      iFrame: 0,
      iTimeDelta: 0.016,
      iFrameRate: 60
    });
    const queryTime = performance.now() - startQuery;
    
    // Get server parameters for context (HTTP only for simplicity)
    let serverParams = null;
    if (engine.protocol === 'http') {
      const paramsUrl = `${engine.baseUrl}/exec?query=${encodeURIComponent("SHOW PARAMETERS WHERE property_path ILIKE '%worker%' OR property_path ILIKE '%parallel%' OR property_path ILIKE '%jit%'")}`;
      const paramsResponse = await fetch(paramsUrl);
      serverParams = await paramsResponse.json();
    }
    
    return {
      explainPlan: explainText,
      explainTime: explainTime,
      queryTime: queryTime,
      serverParams: serverParams,
      sql: finalSql,
      protocol: engine.protocol
    };
  } catch (e) {
    console.error('[QuestDB] Profiling error:', e);
    return {
      error: e.message,
      sql: finalSql,
      protocol: engine.protocol
    };
  }
}

/**
 * Renders the profile data with EXPLAIN plan and performance metrics.
 * @param {object} profileData The data from profileQuery()
 * @param {HTMLElement} mainContainer The container to render into
 */
export async function renderProfile(profileData, mainContainer) {
  // Check for errors
  if (profileData.error) {
    mainContainer.innerHTML = `
      <div style="padding: 20px; color: #f44336;">
        <h3>Profiling Error</h3>
        <pre style="background: #1e1e1e; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap;">${profileData.error}</pre>
        ${profileData.sql ? `<h4>Query:</h4><pre style="background: #1e1e1e; padding: 15px; border-radius: 4px; overflow-x: auto;">${profileData.sql}</pre>` : ''}
      </div>
    `;
    return;
  }

  // Create tabs for different views
  mainContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 100%;">
      <div style="display: flex; gap: 10px; padding: 10px; background: #2d2d2d; border-bottom: 1px solid #444;">
        <button id="tab-overview" class="profile-tab active" style="padding: 8px 16px; background: #007acc; border: none; color: white; border-radius: 4px; cursor: pointer;">Overview</button>
        <button id="tab-explain" class="profile-tab" style="padding: 8px 16px; background: #3d3d3d; border: none; color: white; border-radius: 4px; cursor: pointer;">Execution Plan</button>
        ${profileData.serverParams ? '<button id="tab-config" class="profile-tab" style="padding: 8px 16px; background: #3d3d3d; border: none; color: white; border-radius: 4px; cursor: pointer;">Server Config</button>' : ''}
        <button id="tab-sql" class="profile-tab" style="padding: 8px 16px; background: #3d3d3d; border: none; color: white; border-radius: 4px; cursor: pointer;">SQL Query</button>
      </div>
      <div style="flex: 1; overflow: auto; padding: 20px;">
        <div id="content-overview" class="profile-content"></div>
        <div id="content-explain" class="profile-content" style="display: none;"></div>
        ${profileData.serverParams ? '<div id="content-config" class="profile-content" style="display: none;"></div>' : ''}
        <div id="content-sql" class="profile-content" style="display: none;"></div>
      </div>
    </div>
  `;

  // Populate Overview tab
  const overviewDiv = mainContainer.querySelector('#content-overview');
  overviewDiv.innerHTML = `
    <h3>Performance Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background: #2d2d2d;">
        <th style="padding: 12px; text-align: left; border: 1px solid #444;">Metric</th>
        <th style="padding: 12px; text-align: right; border: 1px solid #444;">Value</th>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #444;">Protocol</td>
        <td style="padding: 12px; text-align: right; border: 1px solid #444; font-family: monospace;">${profileData.protocol.toUpperCase()}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #444;">Query Execution Time</td>
        <td style="padding: 12px; text-align: right; border: 1px solid #444; font-family: monospace;">${profileData.queryTime.toFixed(2)} ms</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #444;">EXPLAIN Time</td>
        <td style="padding: 12px; text-align: right; border: 1px solid #444; font-family: monospace;">${profileData.explainTime.toFixed(2)} ms</td>
      </tr>
    </table>
    <p style="color: #888; margin-top: 20px; font-size: 0.9em;">
      <strong>Note:</strong> Query time includes data transfer and JavaScript processing. 
      EXPLAIN does not execute the query, it only shows the planned execution strategy.
    </p>
  `;

  // Populate EXPLAIN tab
  const explainDiv = mainContainer.querySelector('#content-explain');
  const formattedPlan = formatExplainPlan(profileData.explainPlan);
  explainDiv.innerHTML = `
    <h3>Query Execution Plan</h3>
    <div style="background: #1e1e1e; padding: 15px; border-radius: 4px; margin: 20px 0; overflow-x: auto;">
      <code style="display: block; margin: 0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6; white-space: pre;">${formattedPlan}</code>
    </div>
    <div style="color: #888; font-size: 0.9em;">
      <h4>Understanding the Plan:</h4>
      <ul style="line-height: 1.8;">
        <li><strong>PageFrame:</strong> Table scan reading data from disk pages</li>
        <li><strong>Async JIT Filter:</strong> Just-In-Time compiled filter with parallel execution</li>
        <li><strong>VirtualRecord:</strong> Projection of columns and expressions</li>
        <li><strong>workers:</strong> Number of parallel threads used</li>
        <li><strong>filter:</strong> WHERE clause conditions being applied</li>
        <li><strong>Interval scan:</strong> Optimized timestamp range query</li>
      </ul>
    </div>
  `;

  // Populate Server Config tab if available
  if (profileData.serverParams) {
    const configDiv = mainContainer.querySelector('#content-config');
    let configTable = '<h3>Relevant Server Parameters</h3><table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
    configTable += '<tr style="background: #2d2d2d;"><th style="padding: 12px; text-align: left; border: 1px solid #444;">Parameter</th><th style="padding: 12px; text-align: left; border: 1px solid #444;">Value</th></tr>';
    
    if (profileData.serverParams.dataset && profileData.serverParams.dataset.length > 0) {
      profileData.serverParams.dataset.forEach(row => {
        configTable += `<tr><td style="padding: 12px; border: 1px solid #444; font-family: monospace;">${row[0]}</td><td style="padding: 12px; border: 1px solid #444; font-family: monospace;">${row[2]}</td></tr>`;
      });
    } else {
      configTable += '<tr><td colspan="2" style="padding: 12px; border: 1px solid #444; color: #888;">No worker/parallel/JIT parameters configured</td></tr>';
    }
    
    configTable += '</table>';
    configDiv.innerHTML = configTable;
  }

  // Populate SQL tab
  const sqlDiv = mainContainer.querySelector('#content-sql');
  sqlDiv.innerHTML = `
    <h3>Executed SQL Query</h3>
    <pre style="background: #1e1e1e; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; line-height: 1.6;">${profileData.sql}</pre>
  `;

  // Add tab switching logic
  const tabs = mainContainer.querySelectorAll('.profile-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update button styles
      tabs.forEach(t => t.style.background = '#3d3d3d');
      tab.style.background = '#007acc';
      
      // Show corresponding content
      const contentId = tab.id.replace('tab-', 'content-');
      mainContainer.querySelectorAll('.profile-content').forEach(c => c.style.display = 'none');
      mainContainer.querySelector(`#${contentId}`).style.display = 'block';
    });
  });
}

/**
 * Formats the EXPLAIN plan output for better readability.
 * @param {string} plan The raw EXPLAIN plan text
 * @returns {string} Formatted HTML string
 */
function formatExplainPlan(plan) {
  if (!plan || plan.trim() === '') {
    return `<span style="color: #f44336;">No execution plan available</span>
<span style="color: #888;">
This could happen if:
- QuestDB doesn't support EXPLAIN for this query type
- The query syntax is invalid
- Check the browser console for error details
</span>`;
  }
  
  // QuestDB's EXPLAIN output appears to come pre-encoded with &nbsp; for spaces
  // We need to decode HTML entities first, then apply syntax highlighting
  const decoded = plan
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  
  // Now escape it properly for HTML (but we'll use actual spaces)
  const escaped = decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Add syntax highlighting for key terms (order matters - do most specific first)
  return escaped
    // Quoted strings
    .replace(/('[^']+'|"[^"]+")/g, '<span style="color: #ce9178;">$1</span>')
    // Numbers (with decimals and type casts like ::double)
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color: #b5cea8;">$1</span>')
    // Property names with colons
    .replace(/\b(workers|filter|limit|keys|symbolFilter|functions|count)\b:/g, '<span style="color: #9cdcfe;">$1</span>:')
    // Execution node types
    .replace(/\b(PageFrame|Async|Filter|JIT|VirtualRecord|GroupBy|Sort|Hash|Join|Interval|Scan|Row|Frame|Cross|SelectedRecord|long_sequence)\b/g, '<span style="color: #4ec9b0;">$1</span>');
}
