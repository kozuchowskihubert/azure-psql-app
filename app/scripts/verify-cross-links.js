#!/usr/bin/env node

/**
 * HAOS Cross-Link Verification Tool
 * 
 * Verifies all HTML files have proper cross-linking and
 * state manager integration
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Key pages to verify
const keyPages = [
    'index.html',
    'haos-platform.html',
    'platform/studio.html',
    'techno-workspace.html',
    'synth-2600-studio.html',
    'synth-patch-sequencer.html',
    'radio.html'
];

console.log('🔍 HAOS Cross-Link Verification\n');
console.log('═'.repeat(60));

const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

keyPages.forEach(page => {
    const filePath = path.join(publicDir, page);
    
    if (!fs.existsSync(filePath)) {
        results.total++;
        results.failed++;
        results.details.push({
            page,
            status: '❌ MISSING',
            issues: ['File does not exist']
        });
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const issues = [];
    
    // Check 1: Has home link (except index.html)
    if (page !== 'index.html') {
        const hasHomeLink = /href=["']\/["']|href=["']\/index\.html["']/i.test(content);
        if (!hasHomeLink) {
            issues.push('Missing home link (/)');
        }
    }
    
    // Check 2: Has state-manager.js (for platform pages)
    const isPlatformPage = ['haos-platform.html', 'platform/studio.html'].includes(page);
    if (isPlatformPage) {
        const hasStateManager = /state-manager\.js/.test(content);
        if (!hasStateManager) {
            issues.push('Missing state-manager.js integration');
        }
    }
    
    // Check 3: Has HAOS branding (logo or brand name)
    const hasBranding = /HAOS\.FM|haos-logo|brand-name/i.test(content);
    if (!hasBranding) {
        issues.push('Missing HAOS branding');
    }
    
    // Check 4: Orange theme colors
    const hasOrangeTheme = /#FF6B35|#ff6b35|haos-orange/i.test(content);
    if (!hasOrangeTheme) {
        issues.push('Missing orange theme colors');
    }
    
    results.total++;
    
    if (issues.length === 0) {
        results.passed++;
        results.details.push({
            page,
            status: '✅ PASS',
            issues: []
        });
    } else {
        results.failed++;
        results.details.push({
            page,
            status: '⚠️  ISSUES',
            issues
        });
    }
});

// Print results
results.details.forEach(({ page, status, issues }) => {
    console.log(`\n${status} ${page}`);
    if (issues.length > 0) {
        issues.forEach(issue => {
            console.log(`    └─ ${issue}`);
        });
    }
});

console.log('\n' + '═'.repeat(60));
console.log(`\n📊 Summary: ${results.passed}/${results.total} passed`);

if (results.failed > 0) {
    console.log(`\n⚠️  ${results.failed} files need attention\n`);
    process.exit(1);
} else {
    console.log('\n✅ All cross-links verified!\n');
    process.exit(0);
}
