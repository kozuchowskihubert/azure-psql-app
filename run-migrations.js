#!/usr/bin/env node
/**
 * Run database migrations on production
 * Usage: node run-migrations.js
 */

// Use pg from app directory
const { Pool } = require('./app/node_modules/pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  console.log('🔄 Connecting to database...');
  
  const connectionString = process.env.DATABASE_URL?.trim();
  
  if (!connectionString) {
    throw new Error('DATABASE_URL not set');
  }
  
  console.log('Using database:', connectionString.split('@')[1]?.split('/')[0]);
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '030_modern_auth_system.sql');
    console.log('📖 Reading migration:', migrationPath);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    console.log('🚀 Running migration...');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_sessions'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ user_sessions table created successfully');
    } else {
      console.log('⚠️  Warning: user_sessions table not found after migration');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

runMigrations();
