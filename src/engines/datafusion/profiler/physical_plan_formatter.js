/**
 * DataFusion Physical Plan Formatter
 * 
 * Parses and formats the physical execution plan with visual timing information.
 * Creates a visually stunning timeline view showing:
 * - Time spent in each operator
 * - Percentage of total time
 * - Hotspot highlighting (>10% of total time)
 * - Tree structure preservation
 */

/**
 * Parses a time string and returns microseconds.
 * @param {string} timeStr - e.g., "4.386391ms", "60.749µs", "1ns", "542ns"
 * @returns {number} - Time in microseconds
 */
function parseTime(timeStr) {
  if (!timeStr || timeStr === '0') return 0;
  
  const match = timeStr.match(/^([\d.]+)(ms|µs|us|ns|s)$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000000;
    case 'ms': return value * 1000;
    case 'µs':
    case 'us': return value;
    case 'ns': return value / 1000;
    default: return 0;
  }
}

/**
 * Formats microseconds to human-readable string.
 * @param {number} us - Microseconds
 * @returns {string} - Formatted string
 */
function formatTime(us) {
  if (us >= 1000000) return `${(us / 1000000).toFixed(2)}s`;
  if (us >= 1000) return `${(us / 1000).toFixed(2)}ms`;
  if (us >= 1) return `${us.toFixed(1)}µs`;
  return `${(us * 1000).toFixed(0)}ns`;
}

/**
 * Creates a visual progress bar using block characters.
 * @param {number} percent - Percentage (0-100)
 * @param {number} width - Width in characters
 * @returns {string} - Progress bar string
 */
function createProgressBar(percent, width = 50) {
  const blocks = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
  const fullBlocks = Math.floor(percent * width / 100);
  const remainder = (percent * width / 100) - fullBlocks;
  const partialBlock = blocks[Math.floor(remainder * 8)];
  
  return '█'.repeat(fullBlocks) + partialBlock;
}

/**
 * Parses a physical plan line and extracts operator info and metrics.
 * @param {string} line - A line from the physical plan
 * @returns {object|null} - Parsed operator info or null
 */
function parsePlanLine(line) {
  // Match lines like:
  // "  ProjectionExec: expr=[...], metrics=[output_rows=3072, elapsed_compute=542ns]"
  const match = line.match(/^(\s*)(\w+Exec[^:]*):(.*)metrics=\[([^\]]+)\]/);
  
  if (!match) return null;
  
  const [, indent, operator, description, metricsStr] = match;
  
  // Parse metrics
  const metrics = {};
  const metricPairs = metricsStr.split(',');
  for (const pair of metricPairs) {
    const [key, value] = pair.split('=').map(s => s.trim());
    if (key && value) {
      metrics[key] = value;
    }
  }
  
  // Extract elapsed_compute time
  const elapsedCompute = metrics.elapsed_compute || metrics.elapsed_time || '0';
  const timeUs = parseTime(elapsedCompute);
  
  return {
    indent: indent.length,
    operator: operator.trim(),
    description: description.replace(/,\s*metrics=.*$/, '').trim(),
    metrics,
    timeUs,
    line: line.trim()
  };
}

/**
 * Formats the physical plan with visual timing information.
 * @param {string} physicalPlanText - The raw physical plan text
 * @returns {string} - Formatted HTML
 */
export function formatPhysicalPlan(physicalPlanText) {
  if (!physicalPlanText || typeof physicalPlanText !== 'string') {
    return '<pre>No physical plan available</pre>';
  }
  
  const lines = physicalPlanText.split('\n').filter(l => l.trim());
  const parsed = [];
  let totalTimeUs = 0;
  
  // Parse all lines
  for (const line of lines) {
    const info = parsePlanLine(line);
    if (info) {
      parsed.push(info);
      totalTimeUs += info.timeUs;
    }
  }
  
  if (parsed.length === 0) {
    return `<pre>${physicalPlanText}</pre>`;
  }
  
  // Calculate percentages and identify hotspots
  const threshold = totalTimeUs * 0.10; // 10% threshold
  const hotspots = [];
  
  for (const item of parsed) {
    item.percent = totalTimeUs > 0 ? (item.timeUs / totalTimeUs * 100) : 0;
    item.isHotspot = item.timeUs >= threshold;
    
    if (item.isHotspot) {
      hotspots.push(item);
    }
  }
  
  // Build the visual table
  let html = `
<div class="physical-plan-formatted">
  <div class="plan-header">
    <div class="plan-title">DATAFUSION PHYSICAL PLAN - PERFORMANCE TIMELINE</div>
    <div class="plan-total">Total Execution Time: ${formatTime(totalTimeUs)}</div>
  </div>
  
  <div class="plan-table">
    <div class="plan-table-header">
      <div class="col-time">TIME</div>
      <div class="col-percent">%</div>
      <div class="col-operator">OPERATOR</div>
    </div>
`;
  
  // Add rows
  for (const item of parsed) {
    const barWidth = Math.min(item.percent, 100);
    const bar = createProgressBar(barWidth, 40);
    const indentSpaces = '  '.repeat(Math.floor(item.indent / 2));
    
    // Format percentage
    const percentStr = item.percent >= 0.1 
      ? `${item.percent.toFixed(1)}%`
      : `${item.percent.toFixed(2)}%`;
    
    const rowClass = item.isHotspot ? 'plan-row hotspot' : 'plan-row';
    
    html += `
    <div class="${rowClass}">
      <div class="col-time">${formatTime(item.timeUs)}</div>
      <div class="col-percent">
        <div class="percent-bar-container">
          <div class="percent-bar-fill" style="width: ${barWidth}%"></div>
          <div class="percent-bar-text">${percentStr}</div>
        </div>
      </div>
      <div class="col-operator">
        ${indentSpaces}${item.operator}: ${item.description}
      </div>
    </div>
`;
  }
  
  html += `
  </div>
`;
  
  html += `
</div>
`;
  
  return html;
}
