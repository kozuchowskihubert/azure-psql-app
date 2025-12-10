/**
 * Vercel Serverless Function Handler
 * 
 * This file exports the Express app for Vercel's serverless platform.
 * Vercel will handle the HTTP server creation automatically.
 */

require('dotenv').config();
const app = require('./app');

// Export the Express app for Vercel
module.exports = app;
