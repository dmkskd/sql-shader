/**
 * Tests for ShaderStateManager
 */

import { TestLogger } from '../assets/test-logger.js';
import { BaseTestRunner } from '../assets/test-runner.js';

// Load ShaderStateManager (non-module script)
const script = document.createElement('script');
script.src = '../../src/shader_state_manager.js';
await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
});

class ShaderStateManagerTests extends BaseTestRunner {
    constructor() {
        super('ShaderStateManager Tests');
    }

    async runTests() {
        await this.test1_Initialize();
        await this.test2_SaveUserCreated();
        await this.test3_SaveBuiltInModified();
        await this.test4_GetUserShaders();
        await this.test5_NameUniqueness();
        await this.test6_UpdateShader();
        await this.test7_StorageLimit();
        await this.test8_DeleteShader();
        await this.test9_GetById();
        await this.test10_CheckModified();
        await this.test11_RestoreBuiltIn();
        await this.test12_StorageStats();
        await this.test13_EngineIsolation();
        await this.test14_ClearAll();
        await this.test15_Validation();
        await this.test16_DuplicateShaderState();
        await this.test17_BuiltInModificationTracking();
    }

    // Clean up before tests
    cleanupStorage() {
        localStorage.removeItem('sqlshader.user-shaders');
    }

    // Test 1: Initialize ShaderStateManager
    async test1_Initialize() {
        this.log('Test 1: Initialize with engine name', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            if (stateManager.engineName !== 'duckdb_wasm') throw new Error('Engine name mismatch');
            if (stateManager.maxShadersPerEngine !== 20) throw new Error('Max shaders should be 20');
            
            this.addResult('Initialize with engine name', 'PASS');
            this.log('✓ ShaderStateManager initialized correctly', 'success');
        } catch (error) {
            this.addResult('Initialize with engine name', 'FAIL', null, error.message);
            this.log('✗ Test 1 failed: ' + error.message, 'error');
        }
    }

    // Test 2: Save user-created shader
    async test2_SaveUserCreated() {
        this.log('Test 2: Save user-created shader', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            const result = stateManager.saveShader({
                name: 'My First Shader',
                sql: 'SELECT 255 AS r, 0 AS g, 0 AS b FROM pixels;',
                type: 'user-created'
            });
            
            if (!result.success) throw new Error('Save should succeed');
            if (!result.shader.id.startsWith('user-')) throw new Error('Should generate user ID');
            if (result.shader.name !== 'My First Shader') throw new Error('Name mismatch');
            if (result.shader.type !== 'user-created') throw new Error('Type should be user-created');
            
            this.addResult('Save user-created shader', 'PASS');
            this.log('✓ User shader saved successfully', 'success');
        } catch (error) {
            this.addResult('Save user-created shader', 'FAIL', null, error.message);
            this.log('✗ Test 2 failed: ' + error.message, 'error');
        }
    }

    // Test 3: Save built-in-modified shader
    async test3_SaveBuiltInModified() {
        this.log('Test 3: Save built-in-modified shader', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            const result = stateManager.saveShader({
                name: 'Mandelbrot (Modified)',
                sql: 'SELECT 128 AS r, 128 AS g, 128 AS b FROM pixels;',
                type: 'built-in-modified',
                originalName: 'Mandelbrot'
            });
            
            if (!result.success) throw new Error('Save should succeed');
            if (result.shader.type !== 'built-in-modified') throw new Error('Type mismatch');
            if (result.shader.originalName !== 'Mandelbrot') throw new Error('Original name not set');
            
            this.addResult('Save built-in-modified shader', 'PASS');
            this.log('✓ Modified built-in saved successfully', 'success');
        } catch (error) {
            this.addResult('Save built-in-modified shader', 'FAIL', null, error.message);
            this.log('✗ Test 3 failed: ' + error.message, 'error');
        }
    }

    // Test 4: Get user shaders
    async test4_GetUserShaders() {
        this.log('Test 4: Get user shaders', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            stateManager.saveShader({ name: 'Shader 1', sql: 'SELECT 1;', type: 'user-created' });
            stateManager.saveShader({ name: 'Shader 2', sql: 'SELECT 2;', type: 'user-created' });
            
            const shaders = stateManager.getUserShaders();
            if (shaders.length !== 2) throw new Error(`Expected 2 shaders, got ${shaders.length}`);
            if (shaders[0].name !== 'Shader 1') throw new Error('First shader name mismatch');
            if (shaders[1].name !== 'Shader 2') throw new Error('Second shader name mismatch');
            
            this.addResult('Get user shaders', 'PASS');
            this.log('✓ Retrieved shaders successfully', 'success');
        } catch (error) {
            this.addResult('Get user shaders', 'FAIL', null, error.message);
            this.log('✗ Test 4 failed: ' + error.message, 'error');
        }
    }

    // Test 5: Name uniqueness validation
    async test5_NameUniqueness() {
        this.log('Test 5: Prevent duplicate shader names', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            const result1 = stateManager.saveShader({
                name: 'Unique Name',
                sql: 'SELECT 1;',
                type: 'user-created'
            });
            if (!result1.success) throw new Error('First save should succeed');
            
            const result2 = stateManager.saveShader({
                name: 'Unique Name',
                sql: 'SELECT 2;',
                type: 'user-created'
            });
            if (result2.success) throw new Error('Second save should fail');
            if (!result2.error.includes('already exists')) throw new Error('Error should mention duplicate');
            
            this.addResult('Prevent duplicate shader names', 'PASS');
            this.log('✓ Name uniqueness enforced', 'success');
        } catch (error) {
            this.addResult('Prevent duplicate shader names', 'FAIL', null, error.message);
            this.log('✗ Test 5 failed: ' + error.message, 'error');
        }
    }

    // Test 6: Update existing shader
    async test6_UpdateShader() {
        this.log('Test 6: Update existing shader', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            const result1 = stateManager.saveShader({
                name: 'Original Name',
                sql: 'SELECT 1;',
                type: 'user-created'
            });
            
            const shaderId = result1.shader.id;
            const createdAt = result1.shader.createdAt;
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const result2 = stateManager.saveShader({
                id: shaderId,
                name: 'Updated Name',
                sql: 'SELECT 2;',
                type: 'user-created',
                createdAt: createdAt
            });
            
            if (!result2.success) throw new Error('Update should succeed');
            if (result2.shader.name !== 'Updated Name') throw new Error('Name not updated');
            if (result2.shader.sql !== 'SELECT 2;') throw new Error('SQL not updated');
            if (result2.shader.createdAt !== createdAt) throw new Error('createdAt changed');
            if (result2.shader.modifiedAt === createdAt) throw new Error('modifiedAt not updated');
            
            const shaders = stateManager.getUserShaders();
            if (shaders.length !== 1) throw new Error('Should still have 1 shader');
            
            this.addResult('Update existing shader', 'PASS');
            this.log('✓ Shader updated successfully', 'success');
        } catch (error) {
            this.addResult('Update existing shader', 'FAIL', null, error.message);
            this.log('✗ Test 6 failed: ' + error.message, 'error');
        }
    }

    // Test 7: Storage limit enforcement
    async test7_StorageLimit() {
        this.log('Test 7: Enforce storage limit', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            stateManager.setMaxShaders(3);
            
            for (let i = 1; i <= 3; i++) {
                const result = stateManager.saveShader({
                    name: `Shader ${i}`,
                    sql: `SELECT ${i};`,
                    type: 'user-created'
                });
                if (!result.success) throw new Error(`Shader ${i} should save`);
            }
            
            const result = stateManager.saveShader({
                name: 'Shader 4',
                sql: 'SELECT 4;',
                type: 'user-created'
            });
            if (result.success) throw new Error('Should fail when limit reached');
            if (!result.error.includes('Maximum')) throw new Error('Error should mention limit');
            
            this.addResult('Enforce storage limit', 'PASS');
            this.log('✓ Storage limit enforced', 'success');
        } catch (error) {
            this.addResult('Enforce storage limit', 'FAIL', null, error.message);
            this.log('✗ Test 7 failed: ' + error.message, 'error');
        }
    }

    // Test 8: Delete shader
    async test8_DeleteShader() {
        this.log('Test 8: Delete shader', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            const saveResult = stateManager.saveShader({
                name: 'To Delete',
                sql: 'SELECT 1;',
                type: 'user-created'
            });
            
            const deleteResult = stateManager.deleteShader(saveResult.shader.id);
            if (!deleteResult.success) throw new Error('Delete should succeed');
            
            const shaders = stateManager.getUserShaders();
            if (shaders.length !== 0) throw new Error('Should have no shaders');
            
            this.addResult('Delete shader', 'PASS');
            this.log('✓ Shader deleted successfully', 'success');
        } catch (error) {
            this.addResult('Delete shader', 'FAIL', null, error.message);
            this.log('✗ Test 8 failed: ' + error.message, 'error');
        }
    }

    // Test 9: Get shader by ID and name
    async test9_GetById() {
        this.log('Test 9: Get shader by ID and name', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            const result = stateManager.saveShader({
                name: 'Test Shader',
                sql: 'SELECT 1;',
                type: 'user-created'
            });
            
            const byId = stateManager.getShaderById(result.shader.id);
            if (!byId) throw new Error('Should find shader by ID');
            if (byId.name !== 'Test Shader') throw new Error('Name mismatch');
            
            const byName = stateManager.getShaderByName('Test Shader');
            if (!byName) throw new Error('Should find shader by name');
            if (byName.id !== result.shader.id) throw new Error('ID mismatch');
            
            this.addResult('Get shader by ID and name', 'PASS');
            this.log('✓ Found shader by ID and name', 'success');
        } catch (error) {
            this.addResult('Get shader by ID and name', 'FAIL', null, error.message);
            this.log('✗ Test 9 failed: ' + error.message, 'error');
        }
    }

    // Test 10: Check if built-in is modified
    async test10_CheckModified() {
        this.log('Test 10: Check if built-in is modified', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            if (stateManager.isBuiltInModified('Mandelbrot')) {
                throw new Error('Should not be modified initially');
            }
            
            stateManager.saveShader({
                name: 'Mandelbrot (Custom)',
                sql: 'SELECT 1;',
                type: 'built-in-modified',
                originalName: 'Mandelbrot'
            });
            
            if (!stateManager.isBuiltInModified('Mandelbrot')) {
                throw new Error('Should be modified now');
            }
            
            const modified = stateManager.getModifiedBuiltIn('Mandelbrot');
            if (!modified) throw new Error('Should find modified version');
            if (modified.originalName !== 'Mandelbrot') throw new Error('Original name mismatch');
            
            this.addResult('Check if built-in is modified', 'PASS');
            this.log('✓ Built-in modification tracking works', 'success');
        } catch (error) {
            this.addResult('Check if built-in is modified', 'FAIL', null, error.message);
            this.log('✗ Test 10 failed: ' + error.message, 'error');
        }
    }

    // Test 11: Restore built-in shader
    async test11_RestoreBuiltIn() {
        this.log('Test 11: Restore built-in shader', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            stateManager.saveShader({
                name: 'Mandelbrot (Custom)',
                sql: 'SELECT 1;',
                type: 'built-in-modified',
                originalName: 'Mandelbrot'
            });
            
            if (!stateManager.isBuiltInModified('Mandelbrot')) {
                throw new Error('Should be modified');
            }
            
            const result = stateManager.restoreBuiltIn('Mandelbrot');
            if (!result.success) throw new Error('Restore should succeed');
            
            if (stateManager.isBuiltInModified('Mandelbrot')) {
                throw new Error('Should not be modified after restore');
            }
            
            this.addResult('Restore built-in shader', 'PASS');
            this.log('✓ Built-in restored successfully', 'success');
        } catch (error) {
            this.addResult('Restore built-in shader', 'FAIL', null, error.message);
            this.log('✗ Test 11 failed: ' + error.message, 'error');
        }
    }

    // Test 12: Storage stats
    async test12_StorageStats() {
        this.log('Test 12: Get storage statistics', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            stateManager.saveShader({ name: 'Shader 1', sql: 'SELECT 1;', type: 'user-created' });
            stateManager.saveShader({ name: 'Shader 2', sql: 'SELECT 2;', type: 'user-created' });
            
            const stats = stateManager.getStorageStats();
            if (stats.shadersCount !== 2) throw new Error('Should count 2 shaders');
            if (stats.maxShaders !== 20) throw new Error('Max should be 20');
            if (stats.percentUsed !== 10) throw new Error('Should be 10% used');
            if (stats.engineName !== 'duckdb_wasm') throw new Error('Engine name mismatch');
            if (parseFloat(stats.storageKB) <= 0) throw new Error('Should have storage used');
            
            this.addResult('Get storage statistics', 'PASS');
            this.log(`✓ Storage stats: ${stats.shadersCount}/${stats.maxShaders} (${stats.storageKB}KB)`, 'success');
        } catch (error) {
            this.addResult('Get storage statistics', 'FAIL', null, error.message);
            this.log('✗ Test 12 failed: ' + error.message, 'error');
        }
    }

    // Test 13: Engine isolation
    async test13_EngineIsolation() {
        this.log('Test 13: Shaders are isolated per engine', 'test');
        try {
            this.cleanupStorage();
            const stateManager1 = new ShaderStateManager('duckdb_wasm');
            const stateManager2 = new ShaderStateManager('clickhouse');
            
            stateManager1.saveShader({ name: 'DuckDB Shader', sql: 'SELECT 1;', type: 'user-created' });
            stateManager2.saveShader({ name: 'ClickHouse Shader', sql: 'SELECT 2;', type: 'user-created' });
            
            const shaders1 = stateManager1.getUserShaders();
            const shaders2 = stateManager2.getUserShaders();
            
            if (shaders1.length !== 1) throw new Error('DuckDB should have 1 shader');
            if (shaders2.length !== 1) throw new Error('ClickHouse should have 1 shader');
            if (shaders1[0].name !== 'DuckDB Shader') throw new Error('DuckDB shader name mismatch');
            if (shaders2[0].name !== 'ClickHouse Shader') throw new Error('ClickHouse shader name mismatch');
            
            this.addResult('Shaders are isolated per engine', 'PASS');
            this.log('✓ Engine isolation works', 'success');
        } catch (error) {
            this.addResult('Shaders are isolated per engine', 'FAIL', null, error.message);
            this.log('✗ Test 13 failed: ' + error.message, 'error');
        }
    }

    // Test 14: Clear all shaders
    async test14_ClearAll() {
        this.log('Test 14: Clear all shaders for engine', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            stateManager.saveShader({ name: 'S1', sql: 'SELECT 1;', type: 'user-created' });
            stateManager.saveShader({ name: 'S2', sql: 'SELECT 2;', type: 'user-created' });
            stateManager.saveShader({ name: 'S3', sql: 'SELECT 3;', type: 'user-created' });
            
            if (stateManager.getUserShaders().length !== 3) throw new Error('Should have 3 shaders');
            
            const result = stateManager.clearAllShaders();
            if (!result.success) throw new Error('Clear should succeed');
            if (stateManager.getUserShaders().length !== 0) throw new Error('Should have no shaders');
            
            this.addResult('Clear all shaders for engine', 'PASS');
            this.log('✓ All shaders cleared', 'success');
        } catch (error) {
            this.addResult('Clear all shaders for engine', 'FAIL', null, error.message);
            this.log('✗ Test 14 failed: ' + error.message, 'error');
        }
    }

    // Test 15: Validation - missing required fields
    async test15_Validation() {
        this.log('Test 15: Validate required fields', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');
            
            const result1 = stateManager.saveShader({ sql: 'SELECT 1;', type: 'user-created' });
            if (result1.success) throw new Error('Should fail without name');
            
            const result2 = stateManager.saveShader({ name: 'Test', type: 'user-created' });
            if (result2.success) throw new Error('Should fail without sql');
            
            const result3 = stateManager.saveShader({ name: 'Test', sql: 'SELECT 1;' });
            if (result3.success) throw new Error('Should fail without type');
            
            const result4 = stateManager.saveShader({ name: 'Test', sql: 'SELECT 1;', type: 'invalid' });
            if (result4.success) throw new Error('Should fail with invalid type');
            
            this.addResult('Validate required fields', 'PASS');
            this.log('✓ Field validation works', 'success');
        } catch (error) {
            this.addResult('Validate required fields', 'FAIL', null, error.message);
            this.log('✗ Test 15 failed: ' + error.message, 'error');
        }
    }

    // Test 16: Duplicate shader and verify state
    async test16_DuplicateShaderState() {
        this.log('Test 16: Duplicate shader creates correct state', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');

            // Save original shader
            const original = stateManager.saveShader({
                name: 'Original',
                sql: 'SELECT 1;',
                type: 'user-created'
            });

            // Duplicate should create new shader with same SQL
            const duplicate = stateManager.saveShader({
                name: 'Original (Copy)',
                sql: 'SELECT 1;',
                type: 'user-created'
            });

            if (!duplicate.success) throw new Error('Duplicate save should succeed');
            if (duplicate.shader.id === original.shader.id) {
                throw new Error('Duplicate should have different ID');
            }
            if (duplicate.shader.sql !== original.shader.sql) {
                throw new Error('Duplicate should have same SQL');
            }

            const allShaders = stateManager.getUserShaders();
            if (allShaders.length !== 2) {
                throw new Error(`Expected 2 shaders, got ${allShaders.length}`);
            }

            this.addResult('Duplicate shader creates correct state', 'PASS');
            this.log('✓ Duplicate state verified', 'success');
        } catch (error) {
            this.addResult('Duplicate shader creates correct state', 'FAIL', null, error.message);
            this.log('✗ Test 16 failed: ' + error.message, 'error');
        }
    }

    // Test 17: Built-in modification tracking
    async test17_BuiltInModificationTracking() {
        this.log('Test 17: Track built-in modifications correctly', 'test');
        try {
            this.cleanupStorage();
            const stateManager = new ShaderStateManager('duckdb_wasm');

            // Simulate modifying a built-in shader
            const result = stateManager.saveShader({
                name: 'Mandelbrot',
                sql: 'SELECT modified;',
                type: 'built-in-modified',
                originalName: 'Mandelbrot'
            });

            if (!result.success) throw new Error('Save should succeed');

            // Check if it's tracked as modified
            const isModified = stateManager.isBuiltInModified('Mandelbrot');
            if (!isModified) throw new Error('Shader should be marked as modified');

            // Restore should remove the modification
            const restored = stateManager.restoreBuiltIn('Mandelbrot');
            if (!restored.success) throw new Error('Restore should succeed');

            const isStillModified = stateManager.isBuiltInModified('Mandelbrot');
            if (isStillModified) throw new Error('Shader should not be marked as modified after restore');

            this.addResult('Track built-in modifications correctly', 'PASS');
            this.log('✓ Built-in modification tracking works', 'success');
        } catch (error) {
            this.addResult('Track built-in modifications correctly', 'FAIL', null, error.message);
            this.log('✗ Test 17 failed: ' + error.message, 'error');
        }
    }
}

// Initialize and run tests when page loads
document.addEventListener('DOMContentLoaded', async () => {
        }
    }
}

// Wire up UI
const logger = new TestLogger('testOutput');
const testSuite = new ShaderStateManagerTests();
testSuite.setLogger(logger);

document.getElementById('runTests').addEventListener('click', async () => {
    logger.clear();
    logger.log('Starting ShaderStateManager tests...', 'info');
    await testSuite.execute();
    logger.log(`\nTests complete: ${testSuite.results.passed}/${testSuite.results.total} passed`, 
               testSuite.results.failed > 0 ? 'error' : 'success');
    
    // Cleanup after tests
    testSuite.cleanupStorage();
    logger.log('🧹 Cleaned up test data from localStorage', 'info');
});

document.getElementById('clearResults').addEventListener('click', () => {
    logger.clear();
});

logger.log('Ready to run tests. Click "Run Tests" button.', 'info');
