-- ============================================================================
-- Enhanced Database Schema for Calendar, Meetings, Rooms & User Management
-- ============================================================================
-- This schema extends the existing notes app with:
-- - Single Sign-On (SSO) user management
-- - Calendar events and synchronization
-- - Meeting scheduling and management
-- - Room booking system
-- - Integration with external calendar providers
-- ============================================================================

-- ============================================================================
-- USER MANAGEMENT (SSO-based)
-- ============================================================================

-- Users table - supports multiple SSO providers
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    
    -- SSO Provider information
    sso_provider VARCHAR(50) NOT NULL, -- 'azure-ad', 'google', 'okta', 'auth0', etc.
    sso_provider_id VARCHAR(255) NOT NULL, -- Unique ID from SSO provider
    sso_tenant_id VARCHAR(255), -- For Azure AD multi-tenant
    
    -- User preferences
    timezone VARCHAR(100) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(20) DEFAULT 'HH:mm',
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on SSO provider + provider ID
    CONSTRAINT unique_sso_user UNIQUE (sso_provider, sso_provider_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_sso_provider ON users(sso_provider, sso_provider_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- User sessions for SSO token management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    id_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Session metadata
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- User roles and permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'manager', 'user', 'guest'
    description TEXT,
    permissions JSONB, -- {"notes": ["read", "write"], "meetings": ["schedule", "view"]}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_role_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- CALENDAR & EVENTS
-- ============================================================================

-- Calendar providers for external sync
CREATE TABLE IF NOT EXISTS calendar_providers (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Provider details
    provider_type VARCHAR(50) NOT NULL, -- 'google', 'outlook', 'apple', 'caldav'
    provider_account_id VARCHAR(255), -- Email or account identifier
    
    -- OAuth tokens for sync
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Sync settings
    is_primary BOOLEAN DEFAULT FALSE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_interval_minutes INTEGER DEFAULT 15,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider_type, provider_account_id)
);

CREATE INDEX idx_calendar_providers_user ON calendar_providers(user_id);
CREATE INDEX idx_calendar_providers_sync ON calendar_providers(sync_enabled) WHERE sync_enabled = TRUE;

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    is_all_day BOOLEAN DEFAULT FALSE,
    
    -- Recurrence
    recurrence_rule TEXT, -- iCalendar RRULE format
    recurrence_exception_dates JSONB, -- Array of exception dates
    parent_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    
    -- Event type and status
    event_type VARCHAR(50) DEFAULT 'event', -- 'event', 'meeting', 'reminder', 'task'
    status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
    
    -- External sync
    external_calendar_id VARCHAR(255), -- ID from external calendar provider
    calendar_provider_id INTEGER REFERENCES calendar_providers(id) ON DELETE SET NULL,
    sync_status VARCHAR(50) DEFAULT 'synced', -- 'synced', 'pending', 'conflict', 'error'
    
    -- Visibility and privacy
    visibility VARCHAR(50) DEFAULT 'private', -- 'public', 'private', 'confidential'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_event_times CHECK (end_time > start_time)
);

CREATE INDEX idx_events_user ON calendar_events(user_id);
CREATE INDEX idx_events_time_range ON calendar_events(start_time, end_time);
CREATE INDEX idx_events_type ON calendar_events(event_type);
CREATE INDEX idx_events_external ON calendar_events(external_calendar_id);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    
    -- Attendee information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- Attendance status
    status VARCHAR(50) DEFAULT 'pending', -- 'accepted', 'declined', 'tentative', 'pending'
    is_organizer BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Notifications
    notification_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_attendees_user ON event_attendees(user_id);
CREATE INDEX idx_attendees_status ON event_attendees(status);

-- Link notes to calendar events
CREATE TABLE IF NOT EXISTS note_calendar_links (
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    linked_by UUID REFERENCES users(id),
    PRIMARY KEY (note_id, event_id)
);

-- ============================================================================
-- MEETING MANAGEMENT
-- ============================================================================

-- Meeting rooms
CREATE TABLE IF NOT EXISTS meeting_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Room details
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    building VARCHAR(100),
    floor VARCHAR(50),
    room_number VARCHAR(50),
    
    -- Capacity and features
    capacity INTEGER NOT NULL DEFAULT 1,
    features JSONB, -- ["projector", "whiteboard", "video-conference", "phone"]
    
    -- Equipment
    equipment JSONB, -- {"monitors": 2, "chairs": 10, "tables": 1}
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    working_hours JSONB, -- {"monday": {"start": "09:00", "end": "17:00"}, ...}
    
    -- Booking settings
    min_booking_minutes INTEGER DEFAULT 15,
    max_booking_minutes INTEGER DEFAULT 480,
    booking_increment_minutes INTEGER DEFAULT 15,
    
    -- Metadata
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rooms_active ON meeting_rooms(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_rooms_capacity ON meeting_rooms(capacity);

-- Meeting bookings
CREATE TABLE IF NOT EXISTS meeting_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Meeting details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    agenda TEXT,
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    
    -- Room booking
    room_id UUID REFERENCES meeting_rooms(id) ON DELETE SET NULL,
    
    -- Organizer
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Meeting type
    meeting_type VARCHAR(50) DEFAULT 'in-person', -- 'in-person', 'virtual', 'hybrid'
    virtual_meeting_url TEXT, -- Zoom, Teams, Meet link
    virtual_meeting_id VARCHAR(255),
    virtual_meeting_password VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'started', 'completed', 'cancelled'
    cancellation_reason TEXT,
    
    -- Link to calendar event
    calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
    
    -- Notifications
    send_reminder BOOLEAN DEFAULT TRUE,
    reminder_minutes_before INTEGER DEFAULT 15,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_meeting_times CHECK (end_time > start_time)
);

CREATE INDEX idx_bookings_room ON meeting_bookings(room_id);
CREATE INDEX idx_bookings_organizer ON meeting_bookings(organizer_id);
CREATE INDEX idx_bookings_time_range ON meeting_bookings(start_time, end_time);
CREATE INDEX idx_bookings_status ON meeting_bookings(status);

-- Meeting participants
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meeting_bookings(id) ON DELETE CASCADE,
    
    -- Participant
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- Participation status
    status VARCHAR(50) DEFAULT 'invited', -- 'invited', 'accepted', 'declined', 'tentative', 'attended'
    is_required BOOLEAN DEFAULT TRUE,
    is_presenter BOOLEAN DEFAULT FALSE,
    
    -- Check-in tracking
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX idx_participants_user ON meeting_participants(user_id);

-- Meeting notes and minutes
CREATE TABLE IF NOT EXISTS meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meeting_bookings(id) ON DELETE CASCADE,
    
    -- Content
    minutes TEXT,
    action_items JSONB, -- [{"task": "...", "assignee": "...", "due_date": "..."}]
    decisions JSONB, -- [{"decision": "...", "decided_by": "..."}]
    
    -- Author
    created_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_minutes_meeting ON meeting_minutes(meeting_id);

-- Link notes to meetings
CREATE TABLE IF NOT EXISTS note_meeting_links (
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meeting_bookings(id) ON DELETE CASCADE,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    linked_by UUID REFERENCES users(id),
    PRIMARY KEY (note_id, meeting_id)
);

-- ============================================================================
-- NOTIFICATIONS & REMINDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(500) NOT NULL,
    message TEXT,
    notification_type VARCHAR(50) NOT NULL, -- 'meeting_reminder', 'event_update', 'booking_confirmed'
    
    -- Related entities
    related_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    related_meeting_id UUID REFERENCES meeting_bookings(id) ON DELETE CASCADE,
    
    -- Delivery
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery channels
    channels JSONB, -- ["email", "push", "in-app"]
    email_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ============================================================================
-- UPDATE EXISTING NOTES TABLE TO LINK WITH USERS
-- ============================================================================

-- Add user_id to existing notes table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX idx_notes_user ON notes(user_id);
    END IF;
END $$;

-- Add sharing and permissions
CREATE TYPE note_permission_level AS ENUM ('viewer', 'commenter', 'editor', 'owner');

CREATE TABLE IF NOT EXISTS note_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Permissions
    permission_level note_permission_level NOT NULL DEFAULT 'viewer',
    
    -- Timestamps
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_note_share UNIQUE (note_id, shared_with_user_id)
);

CREATE INDEX idx_note_shares_user ON note_shares(shared_with_user_id);
CREATE INDEX idx_note_shares_note ON note_shares(note_id);

-- Comments on notes
CREATE TABLE IF NOT EXISTS note_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES note_comments(id) ON DELETE CASCADE, -- For threaded comments
    
    content TEXT NOT NULL,
    
    -- Status
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_note_comments_note ON note_comments(note_id);
CREATE INDEX idx_note_comments_user ON note_comments(user_id);

-- Activity log for notes
CREATE TYPE note_activity_type AS ENUM (
    'created', 'updated', 'deleted', 
    'shared', 'unshared', 'permissions_changed',
    'comment_added', 'comment_deleted'
);

CREATE TABLE IF NOT EXISTS note_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    activity_type note_activity_type NOT NULL,
    details JSONB, -- e.g., {"old_title": "...", "new_title": "..."} or {"shared_with": "..."}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_note_activity_note ON note_activity(note_id);
CREATE INDEX idx_note_activity_user ON note_activity(user_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for upcoming meetings
CREATE OR REPLACE VIEW upcoming_meetings AS
SELECT 
    mb.*,
    mr.name AS room_name,
    mr.location AS room_location,
    u.display_name AS organizer_name,
    u.email AS organizer_email,
    COUNT(DISTINCT mp.id) AS participant_count,
    COUNT(DISTINCT CASE WHEN mp.status = 'accepted' THEN mp.id END) AS accepted_count
FROM meeting_bookings mb
LEFT JOIN meeting_rooms mr ON mb.room_id = mr.id
LEFT JOIN users u ON mb.organizer_id = u.id
LEFT JOIN meeting_participants mp ON mb.id = mp.meeting_id
WHERE mb.start_time > NOW()
    AND mb.status = 'scheduled'
GROUP BY mb.id, mr.name, mr.location, u.display_name, u.email
ORDER BY mb.start_time ASC;

-- View for available rooms
CREATE OR REPLACE VIEW available_rooms AS
SELECT 
    mr.*,
    COUNT(mb.id) AS upcoming_bookings
FROM meeting_rooms mr
LEFT JOIN meeting_bookings mb ON mr.id = mb.room_id 
    AND mb.start_time > NOW() 
    AND mb.status = 'scheduled'
WHERE mr.is_active = TRUE
GROUP BY mr.id
ORDER BY mr.name;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'users', 'calendar_providers', 'calendar_events', 'event_attendees',
            'meeting_rooms', 'meeting_bookings', 'meeting_minutes'
        ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert default roles
INSERT INTO user_roles (role_name, description, permissions) VALUES
    ('admin', 'System administrator with full access', 
     '{"notes": ["read", "write", "delete", "share"], "meetings": ["schedule", "view", "edit", "cancel"], "rooms": ["manage", "book"], "users": ["manage"]}'::jsonb),
    ('manager', 'Team manager with extended permissions', 
     '{"notes": ["read", "write", "share"], "meetings": ["schedule", "view", "edit"], "rooms": ["book"]}'::jsonb),
    ('user', 'Standard user', 
     '{"notes": ["read", "write"], "meetings": ["schedule", "view"], "rooms": ["book"]}'::jsonb),
    ('guest', 'Guest with limited access', 
     '{"notes": ["read"], "meetings": ["view"], "rooms": []}'::jsonb)
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts with SSO integration support';
COMMENT ON TABLE user_sessions IS 'Active user sessions with SSO tokens';
COMMENT ON TABLE calendar_providers IS 'External calendar provider connections (Google, Outlook, etc.)';
COMMENT ON TABLE calendar_events IS 'Calendar events with external sync support';
COMMENT ON TABLE meeting_rooms IS 'Physical meeting rooms available for booking';
COMMENT ON TABLE meeting_bookings IS 'Meeting reservations with room and participant management';
COMMENT ON TABLE notifications IS 'User notifications for events, meetings, and reminders';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
