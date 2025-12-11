/**
 * Migration: Modern Authentication System
 * Creates tables for:
 * - User sessions (anonymous + authenticated)
 * - Magic links (passwordless auth)
 * - OAuth accounts (Google, Apple, Facebook)
 */

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('anonymous', 'authenticated')),
    tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium', 'pro')),
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Magic Links Table (Passwordless Authentication)
CREATE TABLE IF NOT EXISTS magic_links (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);

-- OAuth Accounts Table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'apple', 'facebook', 'github')),
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_provider (provider, provider_user_id)
);

-- Update users table to support new auth system
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'pro')),
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create index on subscription_tier for faster queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Clean up expired sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    DELETE FROM magic_links WHERE expires_at < NOW() AND used_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_accounts_updated_at BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO haos_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON magic_links TO haos_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON oauth_accounts TO haos_user;
GRANT USAGE, SELECT ON SEQUENCE user_sessions_id_seq TO haos_user;
GRANT USAGE, SELECT ON SEQUENCE magic_links_id_seq TO haos_user;
GRANT USAGE, SELECT ON SEQUENCE oauth_accounts_id_seq TO haos_user;

-- Migration complete
COMMENT ON TABLE user_sessions IS 'Unified session management for anonymous and authenticated users';
COMMENT ON TABLE magic_links IS 'Passwordless authentication tokens sent via email';
COMMENT ON TABLE oauth_accounts IS 'OAuth provider account linkages for social login';
