/**
 * Example Test Suite
 * Demonstrates how to write tests that work in browser AND CLI
 */

import { BaseTestRunner } from '../assets/test-runner.js';

export class ExampleTestSuite extends BaseTestRunner {
    constructor() {
        super('Example Test Suite');
    }

    async runTests() {
        // Test 1: Simple validation
        this.log('Running Test 1: Basic validation', 'test');
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
            const value = 42;
            if (value === 42) {
                this.addResult('Basic validation', 'PASS', 'Value is correct');
                this.log('✓ Test 1 passed', 'success');
            } else {
                throw new Error('Value mismatch');
            }
        } catch (error) {
            this.addResult('Basic validation', 'FAIL', null, error.message);
            this.log('✗ Test 1 failed: ' + error.message, 'error');
        }

        // Test 2: Data processing
        this.log('Running Test 2: Data processing', 'test');
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            const data = [1, 2, 3, 4, 5];
            const sum = data.reduce((a, b) => a + b, 0);
            if (sum === 15) {
                this.addResult('Data processing', 'PASS', `Sum is ${sum}`);
                this.log('✓ Test 2 passed', 'success');
            } else {
                throw new Error(`Expected 15, got ${sum}`);
            }
        } catch (error) {
            this.addResult('Data processing', 'FAIL', null, error.message);
            this.log('✗ Test 2 failed: ' + error.message, 'error');
        }

        // Test 3: Error handling
        this.log('Running Test 3: Error handling', 'test');
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            try {
                throw new Error('Intentional error');
            } catch (e) {
                // Successfully caught the error
                this.addResult('Error handling', 'PASS', 'Error caught correctly');
                this.log('✓ Test 3 passed', 'success');
            }
        } catch (error) {
            this.addResult('Error handling', 'FAIL', null, error.message);
            this.log('✗ Test 3 failed: ' + error.message, 'error');
        }
    }
}

// For CLI usage - Only run if executed directly (not imported)
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('example-test.js')) {
    const suite = new ExampleTestSuite();
    suite.execute().then(results => {
        // Clean exit - run-tests.js handles the display
        process.exit(results.failed > 0 ? 1 : 0);
    });
}
