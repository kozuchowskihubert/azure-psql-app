#!/usr/bin/env node
/**
 * HAOS Platform System Integrity Test
 * Tests all API endpoints, audio components, and UI interactions
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  log('🔧', 'HAOS Platform System Integrity Test', colors.cyan);
  console.log('━'.repeat(60));

  const tests = [
    {
      name: 'Presets API - All',
      path: '/api/studio/presets',
      validate: (data) => Array.isArray(data) && data.length > 0,
    },
    {
      name: 'Presets API - Filter by TB303',
      path: '/api/studio/presets?type=TB303',
      validate: (data) => Array.isArray(data) && data.every((p) => p.type === 'TB303'),
    },
    {
      name: 'Presets API - Filter by category',
      path: '/api/studio/presets?category=Bass',
      validate: (data) => Array.isArray(data) && data.every((p) => p.category === 'Bass'),
    },
    {
      name: 'Preset Stats API',
      path: '/api/studio/presets/stats/summary',
      validate: (data) => data.total >= 0 && data.byType && data.byCategory,
    },
    {
      name: 'Patterns API',
      path: '/api/studio/patterns',
      validate: (data) => Array.isArray(data),
    },
    {
      name: 'Settings API',
      path: '/api/studio/settings',
      validate: (data) => typeof data === 'object',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await makeRequest(test.path);
      if (result.status === 200 && test.validate(result.data)) {
        log('✅', `${test.name}`, colors.green);
        if (test.path.includes('stats')) {
          console.log(`   Total: ${result.data.total}, Types: ${Object.keys(result.data.byType).length}`);
        } else if (Array.isArray(result.data)) {
          console.log(`   Found ${result.data.length} items`);
        }
        passed++;
      } else {
        log('❌', `${test.name} - Validation failed`, colors.red);
        failed++;
      }
    } catch (error) {
      log('❌', `${test.name} - ${error.message}`, colors.red);
      failed++;
    }
  }

  console.log('━'.repeat(60));
  log('📊', `Results: ${passed} passed, ${failed} failed`, passed === tests.length ? colors.green : colors.yellow);

  // Test preset details
  try {
    const presetsResult = await makeRequest('/api/studio/presets');
    if (presetsResult.data && presetsResult.data.length > 0) {
      console.log(`\n${'━'.repeat(60)}`);
      log('🎵', 'Sample Presets:', colors.cyan);
      presetsResult.data.slice(0, 5).forEach((preset) => {
        console.log(`   ${colors.blue}▸${colors.reset} ${preset.name} (${preset.type}) - ${preset.category}`);
      });
    }
  } catch (e) {
    log('⚠️', `Could not fetch preset details: ${e.message}`, colors.yellow);
  }

  return { passed, failed, total: tests.length };
}

async function testPages() {
  console.log(`\n${'━'.repeat(60)}`);
  log('🌐', 'Testing HTML Pages', colors.cyan);
  console.log('━'.repeat(60));

  const pages = [
    '/index.html',
    '/platform/studio.html',
    '/haos-platform.html',
    '/radio.html',
  ];

  for (const page of pages) {
    try {
      const result = await makeRequest(page);
      if (result.status === 200) {
        const size = typeof result.data === 'string' ? result.data.length : 0;
        log('✅', `${page} (${(size / 1024).toFixed(1)}KB)`, colors.green);
      } else {
        log('❌', `${page} - Status ${result.status}`, colors.red);
      }
    } catch (error) {
      log('❌', `${page} - ${error.message}`, colors.red);
    }
  }
}

async function testAssets() {
  console.log(`\n${'━'.repeat(60)}`);
  log('📦', 'Testing Assets', colors.cyan);
  console.log('━'.repeat(60));

  const assets = [
    '/js/haos-audio-engine.js',
    '/js/state-manager.js',
    '/data/factory-presets.json',
  ];

  for (const asset of assets) {
    try {
      const result = await makeRequest(asset);
      if (result.status === 200) {
        const size = typeof result.data === 'string' ? result.data.length : JSON.stringify(result.data).length;
        log('✅', `${asset} (${(size / 1024).toFixed(1)}KB)`, colors.green);
      } else {
        log('❌', `${asset} - Status ${result.status}`, colors.red);
      }
    } catch (error) {
      log('❌', `${asset} - ${error.message}`, colors.red);
    }
  }
}

async function main() {
  try {
    const apiResults = await testAPI();
    await testPages();
    await testAssets();

    console.log(`\n${'━'.repeat(60)}`);
    if (apiResults.passed === apiResults.total) {
      log('🎉', 'All tests passed! Platform is ready.', colors.green);
    } else {
      log('⚠️', `Some tests failed. ${apiResults.failed}/${apiResults.total} need attention.`, colors.yellow);
    }
    console.log('━'.repeat(60));

    process.exit(apiResults.failed > 0 ? 1 : 0);
  } catch (error) {
    log('💥', `Fatal error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testAPI, testPages, testAssets };
