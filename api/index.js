/**
 * Vercel Serverless Function Handler
 * 
 * This file exports the Express app for Vercel's serverless platform.
 * Vercel will handle the HTTP server creation automatically.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../app/.env') });

// Import the Express app from the app directory
const app = require('../app/app');

// Export the Express app for Vercel
module.exports = app;
