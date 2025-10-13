/**
 * SQL Shader Test Suite - Shared Logger
 * Standardized logging infrastructure for all tests
 */

export class TestLogger {
    constructor(outputElementId = 'testOutput') {
        this.outputEl = document.getElementById(outputElementId);
        if (!this.outputEl) {
            throw new Error(`Output element #${outputElementId} not found`);
        }
    }

    /**
     * Log a message to the UI
     * @param {string} message - The message to log
     * @param {string} type - Log type: 'info', 'test', 'success', 'error', 'warning', 'summary'
     */
    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = message;
        this.outputEl.appendChild(entry);
        this.scrollToBottom();
    }

    info(message) {
        this.log(message, 'info');
    }

    test(message) {
        this.log(message, 'test');
    }

    success(message) {
        this.log(message, 'success');
    }

    error(message) {
        this.log(message, 'error');
    }

    warning(message) {
        this.log(message, 'warning');
    }

    summary(message) {
        this.log(message, 'summary');
    }

    /**
     * Clear all log entries
     */
    clear() {
        this.outputEl.innerHTML = '<p style="color: #888;">Ready to run tests...</p>';
    }

    /**
     * Scroll output to bottom
     */
    scrollToBottom() {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    /**
     * Display a standardized test summary
     * @param {TestResult} results - Standard test result object
     */
    showSummary(results) {
        const summary = document.createElement('div');
        summary.className = 'test-summary';
        
        const { total = 0, passed = 0, failed = 0, duration = 0 } = results;
        const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        summary.innerHTML = `
            <h4>Test Summary</h4>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="label">Total</div>
                    <div class="value">${total}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Passed</div>
                    <div class="value" style="color: #4caf50;">${passed}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Failed</div>
                    <div class="value" style="color: #f44336;">${failed}</div>
                </div>
                <div class="stat-card">
                    <div class="label">Success Rate</div>
                    <div class="value">${successRate}%</div>
                </div>
            </div>
        `;

        if (duration > 0) {
            const durationEl = document.createElement('p');
            durationEl.innerHTML = `<strong>Duration:</strong> ${duration.toFixed(2)}ms`;
            summary.appendChild(durationEl);
        }
        
        // Show detailed results if available
        if (results.tests && results.tests.length > 0) {
            const detailsTitle = document.createElement('h5');
            detailsTitle.textContent = 'Detailed Results:';
            detailsTitle.style.color = '#00d9ff';
            detailsTitle.style.marginTop = '15px';
            detailsTitle.style.marginBottom = '10px';
            summary.appendChild(detailsTitle);
            
            results.tests.forEach(test => {
                const detail = document.createElement('div');
                detail.className = 'test-detail';
                
                const statusClass = test.status === 'PASS' ? 'status-pass' : 'status-fail';
                let content = `
                    <strong>${test.name}:</strong> 
                    <span class="status ${statusClass}">${test.status}</span>
                `;
                
                if (test.message) {
                    content += `<br><small style="color: #aaa;">${test.message}</small>`;
                }
                
                if (test.status === 'FAIL' && test.error) {
                    content += `<br><small style="color: #ff6b6b;">Error: ${test.error}</small>`;
                }
                
                detail.innerHTML = content;
                summary.appendChild(detail);
            });
        }
        
        this.outputEl.appendChild(summary);
        this.scrollToBottom();
    }
}

/**
 * Standard test result structure
 * @typedef {Object} TestResult
 * @property {number} total - Total number of tests
 * @property {number} passed - Number of passed tests
 * @property {number} failed - Number of failed tests
 * @property {number} [duration] - Test execution duration in milliseconds
 * @property {TestCase[]} [tests] - Array of individual test results
 */

/**
 * Individual test case result
 * @typedef {Object} TestCase
 * @property {string} name - Test name
 * @property {string} status - 'PASS' or 'FAIL'
 * @property {string} [message] - Additional info message
 * @property {string} [error] - Error message if failed
 * @property {number} [duration] - Test duration in milliseconds
 */
