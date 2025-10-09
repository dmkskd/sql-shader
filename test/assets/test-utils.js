/**
 * SQL Shader Test Suite - Shared Utilities
 * Common functions for test infrastructure
 */

/**
 * Button state manager for disabling/enabling during test runs
 */
export class ButtonManager {
    constructor(buttonIds) {
        this.buttons = {};
        buttonIds.forEach(id => {
            this.buttons[id] = document.getElementById(id);
        });
    }

    disable() {
        Object.values(this.buttons).forEach(btn => {
            if (btn) btn.disabled = true;
        });
    }

    enable() {
        Object.values(this.buttons).forEach(btn => {
            if (btn) btn.disabled = false;
        });
    }

    get(id) {
        return this.buttons[id];
    }
}

/**
 * Settings manager for localStorage persistence
 */
export class SettingsManager {
    constructor(settingsKey, defaults = {}) {
        this.key = `sqlshader.${settingsKey}`;
        this.defaults = defaults;
    }

    load() {
        const stored = localStorage.getItem(this.key);
        return stored ? { ...this.defaults, ...JSON.parse(stored) } : this.defaults;
    }

    save(settings) {
        localStorage.setItem(this.key, JSON.stringify(settings));
    }

    clear() {
        localStorage.removeItem(this.key);
    }

    /**
     * Load settings into form inputs
     * @param {Object} inputElements - Map of setting keys to input elements
     */
    loadIntoForm(inputElements) {
        const settings = this.load();
        Object.entries(inputElements).forEach(([key, input]) => {
            if (input && settings[key] !== undefined) {
                input.value = settings[key];
            }
        });
    }

    /**
     * Save settings from form inputs
     * @param {Object} inputElements - Map of setting keys to input elements
     */
    saveFromForm(inputElements) {
        const settings = {};
        Object.entries(inputElements).forEach(([key, input]) => {
            if (input) {
                settings[key] = input.value;
            }
        });
        this.save(settings);
    }
}

/**
 * Standard test result builder
 */
export class TestResultBuilder {
    constructor() {
        this.tests = [];
        this.startTime = null;
    }

    start() {
        this.startTime = performance.now();
        this.tests = [];
    }

    addTest(name, status, message = null, error = null) {
        this.tests.push({
            name,
            status: status.toUpperCase(),
            message,
            error
        });
    }

    pass(name, message = null) {
        this.addTest(name, 'PASS', message);
    }

    fail(name, error) {
        this.addTest(name, 'FAIL', null, error);
    }

    build() {
        const duration = this.startTime ? performance.now() - this.startTime : 0;
        const passed = this.tests.filter(t => t.status === 'PASS').length;
        const failed = this.tests.filter(t => t.status === 'FAIL').length;

        return {
            total: this.tests.length,
            passed,
            failed,
            duration,
            tests: this.tests
        };
    }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms) {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
}

/**
 * Wait for a specified duration
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry(fn, maxAttempts = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            await sleep(delayMs * Math.pow(2, attempt - 1));
        }
    }
}

/**
 * Safely execute a test function and return standardized result
 */
export async function safeTest(name, testFn) {
    try {
        const result = await testFn();
        return {
            name,
            status: 'PASS',
            message: result
        };
    } catch (error) {
        return {
            name,
            status: 'FAIL',
            error: error.message || String(error)
        };
    }
}

/**
 * Check if element exists and is visible
 */
export function isElementVisible(elementId) {
    const el = document.getElementById(elementId);
    return el && el.offsetParent !== null;
}

/**
 * Show/hide element
 */
export function toggleElement(elementId, show) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = show ? 'block' : 'none';
    }
}
