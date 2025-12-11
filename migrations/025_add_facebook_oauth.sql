-- Migration: Add Facebook OAuth support
-- Date: 2025-01-20

-- Add facebook_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE;

-- Create index for faster Facebook ID lookups
CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id) WHERE facebook_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.facebook_id IS 'Facebook OAuth user ID for social login';
