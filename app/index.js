/**
 * Legacy Entry Point (Backwards Compatibility)
 * 
 * This file exists for backwards compatibility only.
 * The actual server entry point is server.js
 * 
 * @deprecated Use server.js instead
 * @see server.js
 */

console.warn('⚠️  Warning: index.js is deprecated. Please use server.js as the entry point.');
console.warn('   This file will be removed in a future version.');

module.exports = require('./server');
