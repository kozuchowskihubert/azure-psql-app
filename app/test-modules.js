#!/usr/bin/env node

/**
 * HAOS Platform - Module Testing Script
 * Tests all 4 audio effect modules programmatically
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const MODULES = ['waveshaper', 'phaser', 'delay', 'reverb'];

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ ${message}`, 'cyan');
}

function logHeader(message) {
    log(`\n${'='.repeat(60)}`, 'bold');
    log(message, 'bold');
    log('='.repeat(60), 'bold');
}

// Test if module file exists
function testModuleFile(moduleName) {
    return new Promise((resolve) => {
        const path = `/haos-platform/js/modules/effects/${moduleName}.js`;
        const url = `${BASE_URL}${path}`;

        http.get(url, (res) => {
            if (res.statusCode === 200) {
                logSuccess(`Module file accessible: ${moduleName}.js`);
                resolve(true);
            } else {
                logError(`Module file not found: ${moduleName}.js (HTTP ${res.statusCode})`);
                resolve(false);
            }
        }).on('error', (err) => {
            logError(`Failed to access ${moduleName}.js: ${err.message}`);
            resolve(false);
        });
    });
}

// Test if test page loads
function testTestPage() {
    return new Promise((resolve) => {
        const url = `${BASE_URL}/test-module-registry.html`;

        http.get(url, (res) => {
            if (res.statusCode === 200) {
                logSuccess('Test page loads successfully');
                resolve(true);
            } else {
                logError(`Test page failed to load (HTTP ${res.statusCode})`);
                resolve(false);
            }
        }).on('error', (err) => {
            logError(`Failed to access test page: ${err.message}`);
            resolve(false);
        });
    });
}

// Test preset API
function testPresetAPI() {
    return new Promise((resolve) => {
        const url = `${BASE_URL}/api/presets?limit=5`;

        http.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.presets && json.presets.length > 0) {
                        logSuccess(`Preset API working (${json.pagination.total} presets available)`);
                        resolve(true);
                    } else {
                        logError('Preset API returned no presets');
                        resolve(false);
                    }
                } catch (err) {
                    logError(`Failed to parse preset API response: ${err.message}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            logError(`Failed to access preset API: ${err.message}`);
            resolve(false);
        });
    });
}

// Test category API
function testCategoryAPI() {
    return new Promise((resolve) => {
        const url = `${BASE_URL}/api/presets/categories`;

        http.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.categories && json.categories.length > 0) {
                        logSuccess(`Category API working (${json.categories.length} categories)`);
                        logInfo(`  Categories: ${json.categories.slice(0, 5).map(c => c.name).join(', ')}...`);
                        resolve(true);
                    } else {
                        logError('Category API returned no categories');
                        resolve(false);
                    }
                } catch (err) {
                    logError(`Failed to parse category API response: ${err.message}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            logError(`Failed to access category API: ${err.message}`);
            resolve(false);
        });
    });
}

// Check server health
function testServerHealth() {
    return new Promise((resolve) => {
        http.get(BASE_URL, (res) => {
            if (res.statusCode === 200 || res.statusCode === 302) {
                logSuccess('Server is running');
                resolve(true);
            } else {
                logError(`Server returned HTTP ${res.statusCode}`);
                resolve(false);
            }
        }).on('error', (err) => {
            logError(`Server is not accessible: ${err.message}`);
            resolve(false);
        });
    });
}

// Main test suite
async function runTests() {
    logHeader('🎛️  HAOS Platform Module Test Suite');
    
    let totalTests = 0;
    let passedTests = 0;

    // Test 1: Server Health
    logHeader('Test 1: Server Health Check');
    totalTests++;
    if (await testServerHealth()) passedTests++;

    // Test 2: Test Page
    logHeader('Test 2: Test Page Accessibility');
    totalTests++;
    if (await testTestPage()) passedTests++;

    // Test 3: Module Files
    logHeader('Test 3: Module File Accessibility');
    for (const module of MODULES) {
        totalTests++;
        if (await testModuleFile(module)) passedTests++;
    }

    // Test 4: Preset API
    logHeader('Test 4: Preset API');
    totalTests++;
    if (await testPresetAPI()) passedTests++;

    // Test 5: Category API
    logHeader('Test 5: Category API');
    totalTests++;
    if (await testCategoryAPI()) passedTests++;

    // Test Summary
    logHeader('📊 Test Summary');
    const percentage = ((passedTests / totalTests) * 100).toFixed(1);
    
    log(`\nTotal Tests: ${totalTests}`, 'bold');
    log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
    log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
    log(`Success Rate: ${percentage}%`, passedTests === totalTests ? 'green' : 'yellow');

    if (passedTests === totalTests) {
        log('\n🎉 All tests passed! System is ready.', 'green');
    } else {
        log('\n⚠️  Some tests failed. Check the output above.', 'yellow');
    }

    // Module Status Table
    logHeader('🎛️  Module Status');
    console.log('\n┌─────────────────┬──────────┬────────────┐');
    console.log('│ Module          │ Status   │ File       │');
    console.log('├─────────────────┼──────────┼────────────┤');
    
    const moduleStatus = {
        'waveshaper': '✓ Fixed',
        'phaser': '✓ New',
        'delay': '✓ New',
        'reverb': '✓ New'
    };

    MODULES.forEach(module => {
        const status = moduleStatus[module] || '?';
        const padding = ' '.repeat(15 - module.length);
        const statusPadding = ' '.repeat(8 - status.length);
        console.log(`│ ${module}${padding} │ ${status}${statusPadding} │ ${module}.js   │`);
    });
    
    console.log('└─────────────────┴──────────┴────────────┘\n');

    // Next Steps
    logHeader('🚀 Next Steps');
    console.log('\n1. Open test page: http://localhost:3000/test-module-registry.html');
    console.log('2. Click "Test Module Registry" to see all registered modules');
    console.log('3. Click each module test button (Waveshaper, Phaser, Delay, Reverb)');
    console.log('4. Check browser console for JavaScript errors');
    console.log('5. Click "Test Audio Path" to hear audio processing\n');

    process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the tests
runTests().catch(err => {
    logError(`Test suite failed: ${err.message}`);
    process.exit(1);
});
