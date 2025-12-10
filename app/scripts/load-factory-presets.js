#!/usr/bin/env node
/**
 * Load Factory Presets into Studio API
 * Imports all presets from factory-presets.js into the API storage
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Loading Factory Presets into API...\n');

// Read factory presets
const factoryPresetsPath = path.join(__dirname, '../public/js/factory-presets.js');
const factoryPresetsContent = fs.readFileSync(factoryPresetsPath, 'utf8');

// Extract FACTORY_PRESETS object
const match = factoryPresetsContent.match(/const FACTORY_PRESETS = ({[\s\S]*?});/);
if (!match) {
    console.error('❌ Could not parse FACTORY_PRESETS');
    process.exit(1);
}

// Evaluate the presets object
const FACTORY_PRESETS = eval(`(${match[1]})`);

// Transform to API format
const apiPresets = [];
let idCounter = 1;

// Process TB-303 presets
if (FACTORY_PRESETS.tb303) {
    FACTORY_PRESETS.tb303.forEach(preset => {
        apiPresets.push({
            id: `tb303-${idCounter++}`,
            name: preset.name,
            type: 'tb303',
            category: preset.category,
            description: preset.description,
            parameters: preset.data.params,
            pattern: preset.data.pattern || null,
            bpm: preset.bpm || 128,
            createdAt: new Date().toISOString(),
            tags: [preset.category.toLowerCase(), 'tb-303', 'acid', 'bass']
        });
    });
}

// Process TR-909 presets
if (FACTORY_PRESETS.tr909) {
    FACTORY_PRESETS.tr909.forEach(preset => {
        apiPresets.push({
            id: `tr909-${idCounter++}`,
            name: preset.name,
            type: 'tr909',
            category: preset.category,
            description: preset.description,
            parameters: preset.data.params,
            pattern: preset.data.pattern || null,
            bpm: preset.bpm || 128,
            createdAt: new Date().toISOString(),
            tags: [preset.category.toLowerCase(), 'tr-909', 'drums', 'techno']
        });
    });
}

// Process TR-808 presets
if (FACTORY_PRESETS.tr808) {
    FACTORY_PRESETS.tr808.forEach(preset => {
        apiPresets.push({
            id: `tr808-${idCounter++}`,
            name: preset.name,
            type: 'tr808',
            category: preset.category,
            description: preset.description,
            parameters: preset.data.params,
            pattern: preset.data.pattern || null,
            bpm: preset.bpm || 128,
            createdAt: new Date().toISOString(),
            tags: [preset.category.toLowerCase(), 'tr-808', 'drums', 'hip-hop']
        });
    });
}

// Write to presets data file
const outputPath = path.join(__dirname, '../data/factory-presets.json');
const outputDir = path.dirname(outputPath);

// Create data directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(apiPresets, null, 2));

// Statistics
const stats = {
    total: apiPresets.length,
    byType: {},
    byCategory: {}
};

apiPresets.forEach(preset => {
    stats.byType[preset.type] = (stats.byType[preset.type] || 0) + 1;
    stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;
});

console.log('✅ Factory Presets Loaded Successfully!\n');
console.log(`📊 Total Presets: ${stats.total}`);
console.log('\n🎹 By Instrument Type:');
Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`   ${type.toUpperCase()}: ${count} presets`);
});

console.log('\n📂 By Category:');
Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} presets`);
});

console.log(`\n💾 Presets saved to: ${outputPath}`);
console.log('\n🔌 Next step: Update studio-api.js to load from this file on startup');
