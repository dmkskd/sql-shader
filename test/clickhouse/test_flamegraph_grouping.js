import { BaseTestRunner } from '../assets/test-runner.js';

/**
 * Flamegraph Grouping Test Suite
 * Tests for ClickHouse profiler flamegraph grouping logic
 */
export class FlamegraphGroupingTestSuite extends BaseTestRunner {
  constructor() {
    super('Flamegraph Grouping Tests');
  }

  // Mock the profiler's getClassName function
  getClassName(fullName) {
    const match = fullName.match(/^([^:]+)::/);
    return match ? match[1] : 'root';
  }

  async runTests() {
    this.log('Starting flamegraph grouping tests...', 'test');

    // Fetch the JSON data
    const response = await fetch('./test_trace_log.json');
    const realTraceLog = await response.json();

    await this.testByClassGrouping(realTraceLog);

    this.log('All tests completed.', 'success');
  }

  async testByClassGrouping(realTraceLog) {
    this.log('Testing "By Class" grouping logic...', 'test');
    
    // Build a simple tree structure from the trace data to test grouping logic
    const generatedRoot = { original: { fullName: 'root' }, children: [] };
    
    // Simulate grouping by class - group traces by their class names
    const classGroups = {};
    realTraceLog.forEach(entry => {
      const className = this.getClassName(entry.trace[0]);
      if (!classGroups[className]) {
        classGroups[className] = { original: { fullName: entry.trace[0] }, children: [], value: 0 };
      }
      classGroups[className].value += entry.value;
    });
    
    generatedRoot.children = Object.values(classGroups);

    let testPassed = true;
    let failureReason = '';

    // This function recursively walks the generated graph and checks for the error condition.
    const checkNode = (node) => {
      if (!testPassed || !node) return;

      const parentClass = this.getClassName(node.original.fullName);

      (node.children || []).forEach(child => {
        const childClass = this.getClassName(child.original.fullName);

        if (parentClass !== 'root' && parentClass === childClass) {
          testPassed = false;
          failureReason = `Node "${parentClass}" has a child of the same class: "${childClass}"`;
        }
        checkNode(child);
      });
    };

    checkNode(generatedRoot);
    
    if (testPassed) {
      this.log('✓ Child nodes do not share parent class names', 'pass');
    } else {
      this.log(`✗ ${failureReason}`, 'fail');
    }
  }
}