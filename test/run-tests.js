#!/usr/bin/env node

/**
 * SQL Shader Test Runner - CLI
 * 
 * Simple convention: folder name = category
 * Discovers test files by pattern: *-test.js or test_*.js
 * 
 * Usage:
 *   node run-tests.js              # Run all tests
 *   node run-tests.js example      # Run tests in example/ folder
 *   node run-tests.js clickhouse   # Run tests in clickhouse/ folder
 *   node run-tests.js --json       # Output JSON for automation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for JSON output mode
const jsonOutput = process.argv.includes('--json');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    brightGreen: '\x1b[92m',
    brightRed: '\x1b[91m',
    brightYellow: '\x1b[93m',
    brightCyan: '\x1b[96m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function logBold(message, color = 'reset') {
    console.log(colors.bold + colors[color] + message + colors.reset);
}

/**
 * Discover test files - SIMPLE:
 * - If filter provided: only scan test/<filter>/ folder
 * - If no filter: scan all test/* folders
 * - Find files ending in -test.js or test_*.js
 * - Folder name = category
 */
async function discoverTests(baseDir, filter = '') {
    const tests = [];
    const excludeDirs = ['assets', 'templates', 'node_modules', '.venv', 'dist', '.git'];
    
    // If filter provided, only scan that specific folder
    if (filter) {
        const targetDir = path.join(baseDir, filter);
        try {
            await fs.access(targetDir);
            await scanFolder(targetDir, filter, tests);
        } catch (e) {
            // Folder doesn't exist, return empty
            return tests;
        }
    } else {
        // No filter: scan all subdirectories
        const entries = await fs.readdir(baseDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
                const fullPath = path.join(baseDir, entry.name);
                await scanFolder(fullPath, entry.name, tests);
            }
        }
    }
    
    return tests;
}

/**
 * Recursively scan a folder for test files
 */
async function scanFolder(dir, category, tests) {
    const excludeDirs = ['assets', 'templates', 'node_modules', '.venv', 'dist', '.git'];
    
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(__dirname, fullPath);
            
            if (entry.isDirectory()) {
                // Skip excluded directories
                if (!excludeDirs.includes(entry.name)) {
                    // Recurse into subdirectories
                    await scanFolder(fullPath, category, tests);
                }
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                // Check if it's a test file: *-test.js or test_*.js
                if (entry.name.endsWith('-test.js') || entry.name.startsWith('test_')) {
                    tests.push({
                        path: fullPath,
                        relativePath,
                        name: entry.name.replace(/\.js$/, ''),
                        category
                    });
                }
            }
        }
    } catch (e) {
        // Ignore errors (e.g., permission denied)
    }
}

async function runAllTests() {
    // Get filter from command line args
    const args = process.argv.slice(2); // Skip node and script path
    const filter = args.find(arg => !arg.startsWith('--')) || '';
    
    if (!jsonOutput) {
        logBold('\n SQL Shader Test Suite', 'cyan');
        log('', 'reset');
    }
    
    // Discover tests from file system
    const tests = await discoverTests(__dirname, filter);
    
    if (tests.length === 0) {
        if (jsonOutput) {
            console.log(JSON.stringify({ error: 'No tests found', filter }, null, 2));
        } else {
            log(`No tests found${filter ? ` matching filter: "${filter}"` : ''}`, 'red');
            log('Tests must end with -test.js or start with test_', 'gray');
        }
        process.exit(1);
    }
    
    if (!jsonOutput) {
        log(`Found ${tests.length} test${tests.length > 1 ? 's' : ''}${filter ? ` (filter: "${filter}")` : ''}`, 'dim');
        log('', 'reset');
    }

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0,
        suites: []
    };

    const startTime = performance.now();

    for (const test of tests) {
        if (!jsonOutput) {
            logBold(`\n► ${test.name}`, 'cyan');
            log(`  ${test.category}`, 'dim');
        }

        try {
            // Dynamically import the test file
            const module = await import(test.path);
            
            // Get the test class (convention: export as named export or default)
            const TestClass = module.default || Object.values(module).find(exp => 
                typeof exp === 'function' && exp.prototype && exp.prototype.execute
            );
            
            if (!TestClass) {
                throw new Error('No test class exported (must extend BaseTestRunner)');
            }

            // Run the test
            const testRunner = new TestClass();
            const result = await testRunner.execute();

            results.suites.push({
                name: test.name,
                category: test.category,
                ...result
            });

            results.total += result.total;
            results.passed += result.passed;
            results.failed += result.failed;

            if (!jsonOutput) {
                if (result.failed === 0) {
                    log(`  ${colors.brightGreen}✓${colors.reset} ${colors.green}${result.passed}/${result.total} passed${colors.reset} ${colors.dim}(${result.duration.toFixed(0)}ms)${colors.reset}`);
                } else {
                    log(`  ${colors.brightRed}✗${colors.reset} ${colors.red}${result.failed} failed${colors.reset}, ${colors.green}${result.passed} passed${colors.reset} ${colors.dim}(${result.duration.toFixed(0)}ms)${colors.reset}`);
                }
            }
        } catch (error) {
            if (!jsonOutput) {
                log(`  ${colors.brightRed}✗${colors.reset} ${colors.red}Failed to run: ${error.message}${colors.reset}`);
            }
            results.suites.push({
                name: test.name,
                category: test.category,
                total: 1,
                passed: 0,
                failed: 1,
                duration: 0,
                tests: [{ name: 'Test execution', status: 'FAIL', error: error.message }]
            });
            results.total += 1;
            results.failed += 1;
        }
    }

    results.duration = performance.now() - startTime;

    // Print summary
    if (jsonOutput) {
        // JSON output for automation
        console.log(JSON.stringify(results, null, 2));
    } else {
        // Human-friendly output
        console.log('');
        log('─'.repeat(50), 'dim');
        console.log('');

        if (results.failed === 0) {
            logBold(`✓ All tests passed!`, 'brightGreen');
            log(`  ${results.passed} test${results.passed > 1 ? 's' : ''} in ${results.duration.toFixed(0)}ms`, 'green');
        } else {
            logBold(`✗ Some tests failed`, 'brightRed');
            log(`  ${colors.green}${results.passed} passed${colors.reset}, ${colors.red}${results.failed} failed${colors.reset} ${colors.dim}(${results.duration.toFixed(0)}ms)${colors.reset}`);
            
            // Show failed test details
            console.log('');
            log('Failed tests:', 'red');
            results.suites.forEach(suite => {
                if (suite.failed > 0) {
                    log(`\n  ${suite.name}`, 'yellow');
                    suite.tests.filter(t => t.status === 'FAIL').forEach(test => {
                        log(`    ✗ ${test.name}`, 'red');
                        if (test.error) {
                            log(`      ${test.error}`, 'dim');
                        }
                    });
                }
            });
        }

        console.log('');
    }

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
SQL Shader Test Runner

Usage:
  node test/run-tests.js [filter] [options]
  just test [filter]

Examples:
  just test              # Run all automated tests
  just test example      # Run only tests with "example" in path or category
  just test duckdb       # Run only DuckDB tests
  just test clickhouse   # Run only ClickHouse tests

Options:
  --json                 # Output results as JSON (for automation)
  --help, -h            # Show this help message

Filter matches:
  - Test category (e.g., "duckdb", "clickhouse", "core", "audio")
  - Test file path (e.g., "example", "parameter", "strudel")
`);
    process.exit(0);
}

// Run tests
runAllTests().catch(error => {
    log(`\nFatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
