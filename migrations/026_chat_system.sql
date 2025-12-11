-- Migration: Add secure chat system tables
-- Date: 2025-01-20

-- Chat Channels table
CREATE TABLE IF NOT EXISTS chat_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'voice', 'announcement')),
    is_private BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel Members table (for tracking membership and read status)
CREATE TABLE IF NOT EXISTS channel_members (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notifications_enabled BOOLEAN DEFAULT true,
    UNIQUE(channel_id, user_id)
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_type VARCHAR(20) CHECK (attachment_type IN ('image', 'audio', 'file', NULL)),
    reply_to_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);

-- Insert default channels
INSERT INTO chat_channels (name, description, type, is_private) VALUES
    ('general-chat', 'General discussion for all HAOS.fm members', 'text', false),
    ('production-tips', 'Share and discuss music production techniques', 'text', false),
    ('modular-synth', 'Modular synthesis discussions and patch sharing', 'text', false),
    ('collaborations', 'Find collaborators for your projects', 'text', false),
    ('showcase', 'Share your finished tracks and get feedback', 'text', false),
    ('announcements', 'Official HAOS.fm announcements', 'announcement', false)
ON CONFLICT (name) DO NOTHING;

-- Add comment
COMMENT ON TABLE chat_channels IS 'Community chat channels for HAOS.fm';
COMMENT ON TABLE chat_messages IS 'Secure chat messages with JWT authentication';
