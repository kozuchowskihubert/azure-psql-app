-- ============================================================================
-- DAW Studio User Data Tables (Modified for Existing Schema)
-- Stores user projects, tracks, patterns, and ADSR settings
-- ============================================================================

-- DAW Projects
CREATE TABLE IF NOT EXISTS daw_projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    bpm INTEGER DEFAULT 120,
    time_signature VARCHAR(10) DEFAULT '4/4',
    key_signature VARCHAR(10) DEFAULT 'C',
    duration_bars INTEGER DEFAULT 16,
    master_volume DECIMAL(3,2) DEFAULT 0.8,
    project_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_daw_projects_user_id ON daw_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_daw_projects_created_at ON daw_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daw_projects_is_public ON daw_projects(is_public);

-- DAW Tracks
CREATE TABLE IF NOT EXISTS daw_tracks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES daw_projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_number INTEGER NOT NULL,
    track_name VARCHAR(255) NOT NULL DEFAULT 'Track',
    instrument_type VARCHAR(50) NOT NULL, -- kick, snare, hihat, bass, synth, pad, etc
    volume DECIMAL(3,2) DEFAULT 0.8,
    pan DECIMAL(3,2) DEFAULT 0.5, -- 0 = left, 0.5 = center, 1 = right
    is_muted BOOLEAN DEFAULT FALSE,
    is_solo BOOLEAN DEFAULT FALSE,
    is_armed BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) DEFAULT '#FF6B35',
    
    -- ADSR Envelope Settings
    adsr_attack DECIMAL(5,3) DEFAULT 0.01, -- in seconds
    adsr_decay DECIMAL(5,3) DEFAULT 0.2,
    adsr_sustain DECIMAL(3,2) DEFAULT 0.7, -- 0-1
    adsr_release DECIMAL(5,3) DEFAULT 0.3,
    
    -- Effects Settings
    reverb_amount DECIMAL(3,2) DEFAULT 0.0,
    delay_amount DECIMAL(3,2) DEFAULT 0.0,
    distortion_amount DECIMAL(3,2) DEFAULT 0.0,
    filter_cutoff INTEGER DEFAULT 5000,
    filter_resonance DECIMAL(3,2) DEFAULT 0.0,
    
    -- Oscillator Settings
    oscillator_type VARCHAR(20) DEFAULT 'sawtooth', -- sine, square, sawtooth, triangle
    oscillator_detune INTEGER DEFAULT 0,
    
    track_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daw_tracks_project_id ON daw_tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_daw_tracks_user_id ON daw_tracks(user_id);

-- DAW Patterns (16-step sequencer data)
CREATE TABLE IF NOT EXISTS daw_patterns (
    id SERIAL PRIMARY KEY,
    track_id INTEGER NOT NULL REFERENCES daw_tracks(id) ON DELETE CASCADE,
    pattern_name VARCHAR(255) DEFAULT 'Pattern 1',
    pattern_length INTEGER DEFAULT 16,
    pattern_data JSONB NOT NULL, -- Array of 0s and 1s: [0,1,0,1,0,1,0,1,...]
    velocity_data JSONB DEFAULT '[]', -- Array of velocity values: [0.8, 1.0, 0.5, ...]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daw_patterns_track_id ON daw_patterns(track_id);

-- User Activity Log
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'project_created', 'track_added', 'preset_saved', etc
    activity_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- User Statistics (aggregated)
CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_projects INTEGER DEFAULT 0,
    total_tracks INTEGER DEFAULT 0,
    total_presets INTEGER DEFAULT 0,
    total_play_time_seconds BIGINT DEFAULT 0,
    total_exports INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Project Collaborators
CREATE TABLE IF NOT EXISTS project_collaborators (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES daw_projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) DEFAULT 'view', -- 'view', 'edit', 'admin'
    invited_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- ============================================================================
-- Triggers for automatic statistics updates
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize statistics if not exists
    INSERT INTO user_statistics (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Update statistics based on trigger
    IF TG_TABLE_NAME = 'daw_projects' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_statistics 
            SET total_projects = total_projects + 1,
                last_activity = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_statistics 
            SET total_projects = GREATEST(total_projects - 1, 0),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = OLD.user_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'daw_tracks' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_statistics 
            SET total_tracks = total_tracks + 1,
                last_activity = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_statistics 
            SET total_tracks = GREATEST(total_tracks - 1, 0),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = OLD.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_project_statistics ON daw_projects;
DROP TRIGGER IF EXISTS trigger_update_track_statistics ON daw_tracks;

-- Create triggers
CREATE TRIGGER trigger_update_project_statistics
AFTER INSERT OR DELETE ON daw_projects
FOR EACH ROW
EXECUTE FUNCTION update_user_statistics();

CREATE TRIGGER trigger_update_track_statistics
AFTER INSERT OR DELETE ON daw_tracks
FOR EACH ROW
EXECUTE FUNCTION update_user_statistics();

-- ============================================================================
-- Trigger for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_daw_projects_timestamp ON daw_projects;
DROP TRIGGER IF EXISTS trigger_update_daw_tracks_timestamp ON daw_tracks;
DROP TRIGGER IF EXISTS trigger_update_daw_patterns_timestamp ON daw_patterns;

-- Create update triggers
CREATE TRIGGER trigger_update_daw_projects_timestamp
BEFORE UPDATE ON daw_projects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_daw_tracks_timestamp
BEFORE UPDATE ON daw_tracks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_daw_patterns_timestamp
BEFORE UPDATE ON daw_patterns
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ DAW Studio tables created successfully!';
    RAISE NOTICE '   - daw_projects';
    RAISE NOTICE '   - daw_tracks';
    RAISE NOTICE '   - daw_patterns';
    RAISE NOTICE '   - user_activity';
    RAISE NOTICE '   - user_statistics';
    RAISE NOTICE '   - project_collaborators';
    RAISE NOTICE '✅ Triggers created for automatic statistics and timestamps';
END $$;
