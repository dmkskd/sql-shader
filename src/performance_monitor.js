const engineStatsTitle = document.getElementById('engine-stats-title');
const engineStatsContent = document.getElementById('engine-stats-content');

/**
 * Manages the real-time performance monitoring graphs.
 */
export class PerformanceMonitor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.historySize = canvas.width; // One pixel per frame history
        this.metrics = {
            query: { color: '#ffc980', data: [], max: 0, visible: true }, // Orange
            draw: { color: '#80bfff', data: [], max: 0, visible: true },  // Blue
            network: { color: '#ff8080', data: [], max: 0, visible: true }, // Red
            processing: { color: '#80ff80', data: [], max: 0, visible: true }, // Green
        };
        this.totalMax = 0;
        this.recalcInterval = 2000; // Recalculate max value every 2 seconds for stability.
        this.lastRecalcTime = performance.now();
        this.engineStatHistories = new Map();
        this.tooltip = {
            visible: false,
            x: 0,
            metric: null,
            value: 0,
        };

        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseout', this.handleMouseOut.bind(this));
        this.canvas.addEventListener('click', this.handleMouseClick.bind(this));
    }

    /**
     * Adds a new set of metrics for the current frame and redraws the graph.
     * @param {object} newMetrics - An object with keys like 'query', 'draw', etc.
     */
    update(newMetrics) {
        // Add new data points and maintain history size
        let currentFrameTotal = 0;
        for (const key in this.metrics) {
            const metric = this.metrics[key];
            const value = newMetrics[key] || 0;
            currentFrameTotal += value;
            metric.data.push(value);
            if (metric.data.length > this.historySize) {
                metric.data.shift();
            }
        }

        // --- More Efficient Max Value Calculation ---
        // If the new frame's total is a new peak, update the max immediately.
        if (currentFrameTotal > this.totalMax) {
            this.totalMax = currentFrameTotal;
        }

        this.draw();
    }

    /**
     * Renders engine-specific statistics into the performance bar.
     * @param {Array<{label: string, value: string, rawValue: number}>} stats - An array of stat objects.
     */
    updateEngineStats(engineName, stats) {
        const cpuCoreTitleEl = document.getElementById('cpu-core-stats-title');
        const cpuCoreStat = stats.find(s => s.type === 'cpu_cores');
        const otherStats = stats.filter(s => s.type !== 'cpu_cores');

        if (cpuCoreStat) {
            document.getElementById('cpu-core-stats-container').style.display = 'flex';
            cpuCoreTitleEl.title = cpuCoreStat.description;
            cpuCoreTitleEl.textContent = `${engineName} CPU Cores`;
            this.drawCpuCoreChart(cpuCoreStat);
        } else {
            document.getElementById('cpu-core-stats-container').style.display = 'none';
        }

        engineStatsTitle.textContent = `${engineName} Stats`;
        engineStatsContent.innerHTML = ''; // Clear previous content, including the "Loading..." message.
        stats = otherStats; // Process the remaining stats

        stats.forEach((stat, index) => {
            const { label, value, rawValue, description } = stat;
            const historyKey = `stat-${index}`;

            // Update history for this stat
            // --- New Logic to Prime the History ---
            // If this is the 'Compile Time' metric and it's the first time we're seeing it,
            // we can "prime" its history with the initial, potentially slow, prepare time.
            // This makes the initial compilation cost visible on the sparkline.
            if (label === 'Compile Time' && !this.engineStatHistories.has(historyKey) && window.initialPrepareTime) {
                history.data.push(window.initialPrepareTime);
                // Clear the global variable after use to prevent it from being used again.
                delete window.initialPrepareTime;
            }
            if (!this.engineStatHistories.has(historyKey)) {
                this.engineStatHistories.set(historyKey, { data: [], max: 0 });
            }
            const history = this.engineStatHistories.get(historyKey);
            history.data.push(rawValue);
            if (history.data.length > 60) history.data.shift(); // Keep 60 data points

            // Find or create DOM elements
            let itemEl = document.getElementById(`engine-stat-item-${index}`);
            if (!itemEl) {
                itemEl = document.createElement('div');
                itemEl.id = `engine-stat-item-${index}`;
                itemEl.className = 'engine-stat-item';
                if (description) itemEl.title = description; // Set the tooltip
                itemEl.innerHTML = `
                    <div class="stat-text">
                        <span class="stat-label">${label}:</span>
                        <span class="stat-value" id="stat-value-${index}"></span>
                    </div>
                    <canvas class="sparkline-canvas" id="sparkline-canvas-${index}" width="60" height="20"></canvas>
                `;
                engineStatsContent.appendChild(itemEl);
            }

            // Update text value
            document.getElementById(`stat-value-${index}`).textContent = value;

            // Draw sparkline
            const canvas = document.getElementById(`sparkline-canvas-${index}`);
            // Only draw a sparkline if the rawValue is a number and not always zero,
            // which indicates it's a dynamic metric worth graphing.
            if (typeof rawValue === 'number' && rawValue > 0) {
                this.drawSparkline(canvas, history.data);
            }
        });
    }

    /**
     * Draws a simple sparkline graph on a given canvas.
     * @param {HTMLCanvasElement} canvas The canvas to draw on.
     * @param {number[]} data The historical data to plot.
     */
    drawSparkline(canvas, data) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

        if (data.length < 2) return;

        const max = Math.max(...data) * 1.1 || 1; // Add 10% padding, avoid division by zero
        const step = width / (data.length - 1);

        ctx.beginPath();
        ctx.moveTo(0, height - (data[0] / max) * height);
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(i * step, height - (data[i] / max) * height);
        }
        ctx.strokeStyle = '#ffc980'; // Use the same color as the 'query' metric
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    /**
     * Draws a stacked bar chart for per-core CPU usage.
     * @param {object} cpuCoreStat The special stat object for CPU cores.
     */
    drawCpuCoreChart(cpuCoreStat) {
        const canvas = document.getElementById('cpu-core-chart-canvas');
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

        const cores = cpuCoreStat.cores;
        if (!cores || cores.length === 0) return;

        // Dynamically adjust canvas width based on number of cores
        const barWidth = 15;
        const barMargin = 5;
        canvas.width = cores.length * (barWidth + barMargin);

        const colors = {
            'User': '#80bfff',      // Blue
            'System': '#ff8080',    // Red
            'Idle': '#444444',      // Dark Gray
            'SoftIrq': '#ffc980',   // Orange
            'IOWait': '#c080ff',    // Purple
            'Other': '#80ff80',     // Green
        };

        // Define the stacking order from bottom to top to ensure a consistent chart.
        const stackOrder = ['SoftIrq', 'IOWait', 'System', 'User', 'Other', 'Idle'];

        cores.forEach((core, index) => {
            const x = index * (barWidth + barMargin);
            let currentY = height;

            // Draw background for the total bar
            ctx.fillStyle = '#282828';
            ctx.fillRect(x, 0, barWidth, height);

            // Iterate in the defined stack order to ensure consistent rendering.
            for (const type of stackOrder) {
                if (!core.breakdown.hasOwnProperty(type)) continue;

                const percentageValue = core.breakdown[type];
                const barHeight = percentageValue * height;

                // Only draw if the segment is large enough to be visible
                if (barHeight > 0) {
                    ctx.fillStyle = colors[type] || colors['Other'];
                    ctx.fillRect(x, currentY - barHeight, barWidth, barHeight);
                    currentY -= barHeight;
                }
            }

            // Draw core number label
            ctx.fillStyle = '#aaa';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(core.id, x + barWidth / 2, height - 2);
        });

        // --- Render Legend ---
        const legendContainer = document.getElementById('cpu-core-chart-legend');
        // Only render the legend if it hasn't been rendered before to avoid redraws.
        if (legendContainer && legendContainer.children.length === 0) {
            legendContainer.innerHTML = ''; // Clear any previous content
            for (const type in colors) {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `
                    <div class="legend-color-box" style="background-color: ${colors[type]};"></div>
                    <span>${type}</span>
                `;
                legendContainer.appendChild(item);
            }
        }
    }

    /**
     * Handles mouse movement over the canvas to display tooltips.
     * @param {MouseEvent} event
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const dataLength = this.metrics.query.data.length;
        const historyIndex = Math.floor(mouseX - (this.canvas.width - dataLength));

        if (historyIndex < 0 || historyIndex >= dataLength) {
            this.tooltip.visible = false;
            this.draw();
            return;
        }

        const scale = Math.max(16.67, this.totalMax);
        let yPos = this.canvas.height;
        let foundMetric = null;

        // Iterate from the bottom of the stack up to find the hovered metric
        for (const key of Object.keys(this.metrics)) {
            const value = this.metrics[key].data[historyIndex] || 0;
            const barHeight = (value / scale) * this.canvas.height;

            if (mouseY >= yPos - barHeight && mouseY <= yPos) {
                foundMetric = {
                    key,
                    value,
                    color: this.metrics[key].color,
                };
                break; // Found it, no need to check further
            }
            yPos -= barHeight;
        }

        if (foundMetric) {
            this.tooltip.visible = true;
            this.tooltip.x = mouseX;
            this.tooltip.metric = foundMetric.key;
            this.tooltip.value = foundMetric.value;
            this.tooltip.color = foundMetric.color;
        } else {
            this.tooltip.visible = false;
        }

        this.draw(); // Redraw to show/hide tooltip
    }

    /** Handles the mouse leaving the canvas area. */
    handleMouseOut() {
        this.tooltip.visible = false;
        this.draw();
    }

    /**
     * Handles clicks on the canvas, specifically for toggling legend items.
     * @param {MouseEvent} event 
     */
    handleMouseClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check if the click was within the legend area
        const legendX = 15;
        let legendY = 14;
        const itemHeight = 14;
        const boxSize = 8;
        const boxTextGap = 5;

        for (const key in this.metrics) {
            const textWidth = this.ctx.measureText(key).width;
            const itemWidth = legendX + boxSize + boxTextGap + textWidth;

            // Define the clickable area for this legend item
            if (mouseX >= legendX && mouseX <= itemWidth &&
                mouseY >= legendY - itemHeight / 2 && mouseY <= legendY + itemHeight / 2) {
                
                this.metrics[key].visible = !this.metrics[key].visible;
                this.draw(); // Redraw with the updated visibility
                return; // Stop after handling the click
            }

            legendY += itemHeight;
        }
    }

    /**
     * Draws the stacked area chart on the canvas.
     */
    draw() {
        const { ctx, canvas, metrics, historySize } = this;
        const { width, height } = canvas;

        ctx.clearRect(0, 0, width, height);

        // --- Periodic Max Value Recalculation for Stability ---
        // To prevent the scale from fluctuating wildly, we only recalculate the
        // maximum value from the history buffer every few seconds.
        const now = performance.now();
        if (now - this.lastRecalcTime > this.recalcInterval) {
            let currentHistoryMax = 0;
            // This loop is now only run periodically, not on every frame.
            for (let i = 0; i < metrics.query.data.length; i++) {
                let frameTotal = 0;
                for (const key in metrics) {
                    if (metrics[key].visible) {
                        frameTotal += metrics[key].data[i] || 0;
                    }
                }
                if (frameTotal > currentHistoryMax) {
                    currentHistoryMax = frameTotal;
                }
            }
            this.totalMax = currentHistoryMax;
            this.lastRecalcTime = now;
        }

        // --- Draw Stacked Area Chart ---
        const dataLength = metrics.query.data.length;
        const metricKeys = Object.keys(metrics);

        // Start drawing from the bottom metric up
        for (let i = 0; i < dataLength; i++) {
            let currentY = height;
            for (const key of metricKeys) {
                const metric = metrics[key];
                if (metric.visible && metric.data[i] > 0) {
                    const value = metric.data[i];
                    // Use a minimum value of ~16.67ms (60fps) for the scale.
                    const barHeight = (value / Math.max(16.67, this.totalMax)) * height;
                    
                    ctx.fillStyle = metric.color;
                    ctx.fillRect(width - dataLength + i, currentY - barHeight, 1, barHeight);
                    currentY -= barHeight;
                }
            }
        }

        // --- Draw Background Grid and Y-Axis Labels ---
        // This is drawn AFTER the main graph so the text appears on top.
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';

        const gridLines = 4;
        const scale = Math.max(16.67, this.totalMax);
        const outlineOffset = 1;

        for (let i = 1; i <= gridLines; i++) {
            const y = height - (i / gridLines) * height;
            const value = (scale / gridLines) * i;
            const labelText = `${value.toFixed(0)}ms`;

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();

            // Draw the Y-axis label with a strong outline
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillText(labelText, width - 5 - outlineOffset, y - 2);
            ctx.fillText(labelText, width - 5 + outlineOffset, y - 2);
            ctx.fillText(labelText, width - 5, y - 2 - outlineOffset);
            ctx.fillText(labelText, width - 5, y - 2 + outlineOffset);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(labelText, width - 5, y - 2);
        }

        // --- Draw Tooltip ---
        // Drawn before the legend so the legend always appears on top.
        if (this.tooltip.visible) {
            const { x, metric, value, color } = this.tooltip;

            // Draw vertical line at the hover position
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            // Draw the tooltip text
            ctx.textAlign = 'left'; // Set alignment for the tooltip text
            const tooltipText = `${metric}: ${value.toFixed(2)}ms`;
            const textWidth = ctx.measureText(tooltipText).width;
            const tooltipX = Math.min(Math.max(10, x - textWidth / 2), width - textWidth - 10);
            const tooltipY = 30;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(tooltipX - 5, tooltipY - 15, textWidth + 10, 20);
            
            ctx.fillStyle = color;
            ctx.fillText(tooltipText, tooltipX, tooltipY);
        }

        // --- Draw Legend and Max Value ---
        ctx.textAlign = 'left'; // Ensure legend text is left-aligned.
        ctx.font = '12px monospace';
        const legendX = 15; // Constant X position for the legend column
        let legendY = 14;   // Starting Y position
        const itemHeight = 14; // Vertical space for each legend item
        const boxSize = 8;  // Smaller box size for vertical layout
        const boxTextGap = 5; // Gap between color swatch and text

        for (const key of metricKeys) {
            const metric = metrics[key];
            // Vertically center the box with the text's baseline
            const boxY = legendY - boxSize + 1;

            // Dim the legend item if it's not visible
            ctx.globalAlpha = metric.visible ? 1.0 : 0.4;

            ctx.fillStyle = metric.color;
            ctx.fillRect(legendX, boxY, boxSize, boxSize);

            // Draw a strong outline by stroking the text in black from all sides.
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            const outlineOffset = 1;
            ctx.fillText(key, legendX + boxSize + boxTextGap - outlineOffset, legendY);
            ctx.fillText(key, legendX + boxSize + boxTextGap + outlineOffset, legendY);
            ctx.fillText(key, legendX + boxSize + boxTextGap, legendY - outlineOffset);
            ctx.fillText(key, legendX + boxSize + boxTextGap, legendY + outlineOffset);

            // Draw the main white text on top
            ctx.fillStyle = '#eee';
            ctx.fillText(key, legendX + boxSize + boxTextGap, legendY);

            legendY += itemHeight; // Move down for the next item

            ctx.globalAlpha = 1.0; // Reset alpha for the next item
        }
    }
}