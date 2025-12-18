-- ============================================================================
-- DAW Studio User Data Tables
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
    
    track_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daw_tracks_project_id ON daw_tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_daw_tracks_user_id ON daw_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_daw_tracks_track_number ON daw_tracks(project_id, track_number);

-- DAW Patterns (16-step sequencer data)
CREATE TABLE IF NOT EXISTS daw_patterns (
    id SERIAL PRIMARY KEY,
    track_id INTEGER NOT NULL REFERENCES daw_tracks(id) ON DELETE CASCADE,
    pattern_name VARCHAR(255) DEFAULT 'Pattern 1',
    pattern_length INTEGER DEFAULT 16, -- number of steps
    pattern_data JSONB NOT NULL, -- array of 0s and 1s for each step
    velocity_data JSONB DEFAULT '[]', -- velocity for each step (0-127)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daw_patterns_track_id ON daw_patterns(track_id);

-- User Presets (ADSR and Effects)
CREATE TABLE IF NOT EXISTS user_presets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preset_name VARCHAR(255) NOT NULL,
    instrument_type VARCHAR(50) NOT NULL,
    preset_category VARCHAR(50) DEFAULT 'custom', -- bass, lead, pad, drum, fx, custom
    
    -- ADSR Settings
    adsr_attack DECIMAL(5,3) DEFAULT 0.01,
    adsr_decay DECIMAL(5,3) DEFAULT 0.2,
    adsr_sustain DECIMAL(3,2) DEFAULT 0.7,
    adsr_release DECIMAL(5,3) DEFAULT 0.3,
    
    -- Synth Parameters
    oscillator_type VARCHAR(20) DEFAULT 'sawtooth', -- sine, square, sawtooth, triangle
    detune DECIMAL(5,2) DEFAULT 0.0,
    filter_cutoff INTEGER DEFAULT 5000,
    filter_resonance DECIMAL(3,2) DEFAULT 0.0,
    filter_type VARCHAR(20) DEFAULT 'lowpass',
    
    -- Effects
    reverb_amount DECIMAL(3,2) DEFAULT 0.0,
    delay_amount DECIMAL(3,2) DEFAULT 0.0,
    delay_time DECIMAL(4,2) DEFAULT 0.25,
    delay_feedback DECIMAL(3,2) DEFAULT 0.3,
    distortion_amount DECIMAL(3,2) DEFAULT 0.0,
    
    preset_data JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_presets_user_id ON user_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presets_instrument_type ON user_presets(instrument_type);
CREATE INDEX IF NOT EXISTS idx_user_presets_is_public ON user_presets(is_public);

-- User Activity Tracking
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- project_created, track_added, preset_saved, etc
    activity_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);

-- User Statistics
CREATE TABLE IF NOT EXISTS user_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_projects INTEGER DEFAULT 0,
    total_tracks INTEGER DEFAULT 0,
    total_presets INTEGER DEFAULT 0,
    total_play_time_seconds BIGINT DEFAULT 0,
    total_exports INTEGER DEFAULT 0,
    account_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Collaboration (for shared projects)
CREATE TABLE IF NOT EXISTS project_collaborators (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES daw_projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) DEFAULT 'view', -- view, edit, admin
    invited_by INTEGER REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- Functions for automatic statistics updates
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user statistics
    INSERT INTO user_statistics (user_id, total_projects, total_tracks, total_presets, last_active_at)
    VALUES (
        NEW.user_id,
        (SELECT COUNT(*) FROM daw_projects WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM daw_tracks WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM user_presets WHERE user_id = NEW.user_id),
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_projects = (SELECT COUNT(*) FROM daw_projects WHERE user_id = NEW.user_id),
        total_tracks = (SELECT COUNT(*) FROM daw_tracks WHERE user_id = NEW.user_id),
        total_presets = (SELECT COUNT(*) FROM user_presets WHERE user_id = NEW.user_id),
        last_active_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for statistics
CREATE TRIGGER trigger_update_stats_on_project
AFTER INSERT OR DELETE ON daw_projects
FOR EACH ROW EXECUTE FUNCTION update_user_statistics();

CREATE TRIGGER trigger_update_stats_on_track
AFTER INSERT OR DELETE ON daw_tracks
FOR EACH ROW EXECUTE FUNCTION update_user_statistics();

CREATE TRIGGER trigger_update_stats_on_preset
AFTER INSERT OR DELETE ON user_presets
FOR EACH ROW EXECUTE FUNCTION update_user_statistics();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_daw_projects
BEFORE UPDATE ON daw_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_daw_tracks
BEFORE UPDATE ON daw_tracks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_daw_patterns
BEFORE UPDATE ON daw_patterns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_user_presets
BEFORE UPDATE ON user_presets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- Comments for documentation
COMMENT ON TABLE daw_projects IS 'User DAW projects with global settings';
COMMENT ON TABLE daw_tracks IS 'Individual tracks within projects with ADSR and effects settings';
COMMENT ON TABLE daw_patterns IS 'Step sequencer patterns for each track';
COMMENT ON TABLE user_presets IS 'User-created instrument presets with ADSR and effects';
COMMENT ON TABLE user_activity IS 'Activity log for user actions';
COMMENT ON TABLE user_statistics IS 'Aggregated user statistics';
COMMENT ON TABLE project_collaborators IS 'Shared project access control';
