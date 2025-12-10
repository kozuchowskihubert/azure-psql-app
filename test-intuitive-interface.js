/**
 * Automated Test Script for Intuitive Techno Creator
 * Run with: node test-intuitive-interface.js
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TESTS = [
    { name: 'Main Interface', path: '/techno-intuitive.html' },
    { name: 'TB-303 Synth', path: '/js/synths/tb303.js' },
    { name: 'TR-808 Synth', path: '/js/synths/tr808.js' },
    { name: 'ARP-2600 Synth', path: '/js/synths/arp2600.js' },
    { name: 'String Machine', path: '/js/synths/string-machine.js' },
    { name: 'DAW Engine', path: '/js/daw-engine.js' }
];

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

console.log(`${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  🎵 Intuitive Techno Creator - Test Suite    ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

/**
 * Check if server is running
 */
function checkServer() {
    return new Promise((resolve, reject) => {
        const req = http.get(`${BASE_URL}/`, (res) => {
            if (res.statusCode === 200 || res.statusCode === 404) {
                resolve(true);
            } else {
                reject(new Error(`Server returned ${res.statusCode}`));
            }
        });
        req.on('error', () => reject(new Error('Server not running')));
        req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error('Connection timeout'));
        });
    });
}

/**
 * Test if a resource is accessible
 */
function testResource(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${BASE_URL}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    contentLength: data.length,
                    contentType: res.headers['content-type']
                });
            });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

/**
 * Run all tests
 */
async function runTests() {
    console.log(`${colors.blue}📡 Checking server status...${colors.reset}`);
    
    try {
        await checkServer();
        console.log(`${colors.green}✅ Server is running on ${BASE_URL}${colors.reset}\n`);
    } catch (error) {
        console.log(`${colors.red}❌ Server is not accessible: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}💡 Start the server with: cd app && node server.js${colors.reset}\n`);
        process.exit(1);
    }

    console.log(`${colors.blue}🧪 Running resource tests...${colors.reset}\n`);

    let passed = 0;
    let failed = 0;

    for (const test of TESTS) {
        try {
            const result = await testResource(test.path);
            
            if (result.statusCode === 200) {
                console.log(`${colors.green}✅ ${test.name.padEnd(20)}${colors.reset} - ${result.contentLength} bytes (${result.contentType})`);
                passed++;
            } else {
                console.log(`${colors.red}❌ ${test.name.padEnd(20)}${colors.reset} - HTTP ${result.statusCode}`);
                failed++;
            }
        } catch (error) {
            console.log(`${colors.red}❌ ${test.name.padEnd(20)}${colors.reset} - ${error.message}`);
            failed++;
        }
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`\n${colors.cyan}📊 Test Results:${colors.reset}`);
    console.log(`   ${colors.green}✅ Passed: ${passed}${colors.reset}`);
    console.log(`   ${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`   📈 Total: ${TESTS.length}\n`);

    if (failed === 0) {
        console.log(`${colors.green}🎉 All tests passed! Interface is ready.${colors.reset}\n`);
        console.log(`${colors.cyan}🚀 Open in browser: ${BASE_URL}/techno-intuitive.html${colors.reset}\n`);
    } else {
        console.log(`${colors.yellow}⚠️  Some tests failed. Check the server and file paths.${colors.reset}\n`);
        process.exit(1);
    }
}

// Check for specific features in the HTML
async function checkFeatures() {
    console.log(`${colors.blue}🔍 Checking interface features...${colors.reset}\n`);

    try {
        const result = await testResource('/techno-intuitive.html');
        const html = await new Promise((resolve, reject) => {
            http.get(`${BASE_URL}/techno-intuitive.html`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });

        const features = {
            'TB-303 Bass Sounds': html.includes('bass-303') && html.includes('bass-deep'),
            'TR-808 Drums': html.includes('drums-808') && html.includes('drums-industrial'),
            'ARP-2600 Leads': html.includes('arp-lead') && html.includes('arp-sync-lead'),
            'ARP-2600 Bass': html.includes('arp-bass') && html.includes('arp-acid-bass'),
            'ARP-2600 Pads': html.includes('arp-pad') && html.includes('arp-string-pad'),
            'ARP-2600 FX': html.includes('arp-sweep') && html.includes('arp-wobble'),
            'String Machine': html.includes('string-lush') && html.includes('string-pad'),
            'Quick Presets': html.includes('acid-minimal') && html.includes('detroit-classic'),
            'Step Sequencer': html.includes('step-grid'),
            'Transport Controls': html.includes('playBtn') && html.includes('bpmDisplay'),
            'Visualizer': html.includes('visualizer'),
            'Real-time Controls': html.includes('updateControl')
        };

        console.log(`${colors.cyan}Feature Detection:${colors.reset}\n`);
        
        for (const [feature, found] of Object.entries(features)) {
            const status = found ? `${colors.green}✅` : `${colors.red}❌`;
            console.log(`   ${status} ${feature}${colors.reset}`);
        }

        const foundCount = Object.values(features).filter(Boolean).length;
        const totalCount = Object.keys(features).length;

        console.log(`\n${colors.cyan}   Found ${foundCount}/${totalCount} expected features${colors.reset}\n`);

    } catch (error) {
        console.log(`${colors.red}❌ Could not check features: ${error.message}${colors.reset}\n`);
    }
}

// Run the test suite
(async () => {
    try {
        await runTests();
        await checkFeatures();
        
        console.log(`${colors.cyan}═══════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.green}✨ Testing complete! Ready to make music! 🎵${colors.reset}`);
        console.log(`${colors.cyan}═══════════════════════════════════════════════${colors.reset}\n`);
    } catch (error) {
        console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
})();
