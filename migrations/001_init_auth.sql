-- ============================================================================
-- HAOS.FM Authentication Database Schema
-- ============================================================================
-- Creates the necessary tables for user authentication and session management
-- ============================================================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- bcrypt hashed password (NULL for OAuth-only users)
    name VARCHAR(255),
    bio TEXT,
    
    -- OAuth provider IDs
    google_id VARCHAR(255) UNIQUE,
    azure_id VARCHAR(255) UNIQUE,
    
    -- User preferences
    default_workspace VARCHAR(100) DEFAULT 'haos-platform',
    theme VARCHAR(50) DEFAULT 'dark',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_azure_id ON users(azure_id) WHERE azure_id IS NOT NULL;

-- Session table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- User projects/presets metadata (optional - can store in blob storage too)
CREATE TABLE IF NOT EXISTS user_presets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    preset_type VARCHAR(50) NOT NULL, -- 'synth', 'pattern', 'track'
    preset_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_presets_user_id ON user_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presets_type ON user_presets(preset_type);
CREATE INDEX IF NOT EXISTS idx_user_presets_public ON user_presets(is_public) WHERE is_public = TRUE;

-- Track metadata (synced with Azure Blob Storage)
CREATE TABLE IF NOT EXISTS user_tracks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    blob_url TEXT NOT NULL, -- Azure Blob Storage URL
    blob_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    duration INTEGER, -- seconds
    plays INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tracks_user_id ON user_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracks_public ON user_tracks(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_tracks_genre ON user_tracks(genre);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presets_updated_at BEFORE UPDATE ON user_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tracks_updated_at BEFORE UPDATE ON user_tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test user (optional - comment out in production)
-- Password is 'test123' hashed with bcrypt
-- INSERT INTO users (email, password, name) VALUES 
-- ('test@haos.fm', '$2b$10$ZK9K6gqYYqYYqYYqYYqYYuK7E5XKZ6gqYYqYYqYYqYYq', 'Test User');

-- Verify tables were created
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('users', 'session', 'user_presets', 'user_tracks')
ORDER BY table_name;
