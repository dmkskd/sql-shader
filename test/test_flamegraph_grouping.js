import { engine as ClickHouseEngine } from '../engines/clickhouse/clickhouse_engine.js';
import { ClickHouseProfiler } from '../engines/clickhouse/clickhouse_profiler.js';

const resultsEl = document.getElementById('results');

function assert(condition, message) {
  const div = document.createElement('div');
  div.className = 'test-case';
  if (condition) {
    div.classList.add('pass');
    div.textContent = `✅ PASS: ${message}`;
  } else {
    div.classList.add('fail');
    div.textContent = `❌ FAIL: ${message}`;
    console.error(`Assertion failed: ${message}`);
  }
  resultsEl.appendChild(div);
}

async function runTests() {
  console.log('Running tests...');

  // Fetch the JSON data using a more compatible method than import assertions.
  const response = await fetch('./test_trace_log.json');
  const realTraceLog = await response.json();

  // We need a mock container for the render function to run.
  const mockContainer = document.createElement('div');

  // In our test, we don't have a real client, but the profiler expects one.
  // We can pass a null client since the flamegraph rendering doesn't use it.
  const profiler = new ClickHouseProfiler(null);

  const testByClassWithRealData = () => {
    const testName = 'Grouping "By Class" with REAL data should not have child nodes of the same class as their parent';
    let generatedRoot;
    const originalRender = profiler.renderFlamegraph;

    // Temporarily modify the profiler's method to return the generated data structure for inspection.
    profiler.renderFlamegraph = function(traceLog, container, groupBy) {
      generatedRoot = originalRender.call(this, traceLog, container, groupBy);
      return generatedRoot;
    };

    // Run the function with the real data and 'class' grouping.
    profiler.renderFlamegraph(realTraceLog, mockContainer, 'class');

    // Restore the original method.
    profiler.renderFlamegraph = originalRender;

    let testPassed = true;
    let failureReason = '';

    // This function recursively walks the generated graph and checks for the error condition.
    function checkNode(node) {
      if (!testPassed || !node) return; // Stop checking if a failure was found or node is null

      // Get the class name of the current (parent) node from its original, un-simplified name.
      const parentClass = profiler.getClassName(node.original.fullName);

      // Check all of its children.
      (node.children || []).forEach(child => {
        const childClass = profiler.getClassName(child.original.fullName);

        // --- DEBUGGING LOG ---
        console.log(`[Test Debug] Comparing Parent Class: "${parentClass}" WITH Child Class: "${childClass}"`);

        // If a child belongs to the same class as its parent, the test fails.
        // If the parent's group name is the same as the child's class, it's a failure.
        if (parentClass !== 'root' && parentClass === childClass) {
          testPassed = false;
          failureReason = `Node "${parentClass}" has a child of the same class: "${childClass}"`;
          console.error(`[Test Debug] FAILURE DETECTED! Parent Class: ${parentClass}, Child Class: ${childClass}`);
        }
        // Continue checking down the tree.
        checkNode(child);
      });
    }

    // Start the check from the root of the generated graph.
    checkNode(generatedRoot);
    assert(testPassed, `${testName}. ${failureReason}`);
  };

  testByClassWithRealData();
}

runTests();