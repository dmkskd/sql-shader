/**
 * SQL Shader Test Suite - Base Test Runner
 * Provides interface for running tests in browser or CLI
 */

export class BaseTestRunner {
    constructor(name) {
        this.name = name;
        this.logger = null;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            duration: 0,
            tests: []
        };
    }

    /**
     * Set logger (for browser) or null (for CLI)
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Log message (works in both browser and CLI)
     */
    log(message, type = 'info') {
        if (this.logger) {
            // Browser: use TestLogger
            this.logger[type](message);
        }
        // CLI: silent when run through test runner (it handles display)
        // Individual tests can still log when run directly
    }

    /**
     * Add test result
     */
    addResult(name, status, message = null, error = null) {
        this.results.tests.push({
            name,
            status: status.toUpperCase(),
            message,
            error
        });
        
        if (status.toUpperCase() === 'PASS') {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
        this.results.total++;
    }

    /**
     * Main test execution - MUST be implemented by subclass
     */
    async runTests() {
        throw new Error('runTests() must be implemented by subclass');
    }

    /**
     * Execute and return standardized results
     */
    async execute() {
        const startTime = performance.now();
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            duration: 0,
            tests: []
        };

        try {
            await this.runTests();
        } catch (error) {
            this.addResult('Test Suite', 'FAIL', null, error.message);
        }

        this.results.duration = performance.now() - startTime;
        
        // Only show summary in browser (when logger is set)
        if (this.logger) {
            this.log(`\nCompleted: ${this.results.passed}/${this.results.total} tests passed (${this.results.duration.toFixed(2)}ms)`, 'summary');
            this.logger.showSummary(this.results);
        }

        return this.results;
    }
}

/**
 * Helper to run test in both environments
 */
export async function runTestSuite(TestClass, logger = null) {
    const suite = new TestClass();
    suite.setLogger(logger);
    return await suite.execute();
}
