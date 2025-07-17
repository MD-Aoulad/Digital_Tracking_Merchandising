-- Enterprise Chat System Database Schema
-- Comprehensive chat system with compliance, GDPR, and management oversight

-- Chat Channels Table
CREATE TABLE IF NOT EXISTS chat_channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'general', -- general, project, department, private, announcement
    is_private BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 1000,
    created_by INTEGER NOT NULL REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Chat Channel Members Table
CREATE TABLE IF NOT EXISTS chat_channel_members (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, moderator, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(channel_id, user_id)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES members(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, file, system, announcement
    reply_to_id INTEGER REFERENCES chat_messages(id),
    thread_id INTEGER REFERENCES chat_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    flagged_by INTEGER REFERENCES members(id),
    flagged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Chat Message Attachments Table
CREATE TABLE IF NOT EXISTS chat_message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    file_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Message Reactions Table
CREATE TABLE IF NOT EXISTS chat_message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES members(id),
    reaction_type VARCHAR(50) NOT NULL, -- emoji or reaction name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Chat Message Reads Table
CREATE TABLE IF NOT EXISTS chat_message_reads (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES members(id),
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Direct Messages Table
CREATE TABLE IF NOT EXISTS chat_direct_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES members(id),
    recipient_id INTEGER NOT NULL REFERENCES members(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- User Status Table
CREATE TABLE IF NOT EXISTS chat_user_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'offline', -- online, offline, away, busy, invisible
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_typing BOOLEAN DEFAULT FALSE,
    typing_in_channel INTEGER REFERENCES chat_channels(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User Chat Settings Table
CREATE TABLE IF NOT EXISTS chat_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    desktop_notifications BOOLEAN DEFAULT TRUE,
    mobile_notifications BOOLEAN DEFAULT TRUE,
    theme VARCHAR(50) DEFAULT 'light', -- light, dark, auto
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Content Moderation Table
CREATE TABLE IF NOT EXISTS chat_content_moderation (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    flagged_by INTEGER NOT NULL REFERENCES members(id),
    reason TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_by INTEGER REFERENCES members(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    action_taken VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS chat_audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL, -- message_sent, message_deleted, user_joined, etc.
    user_id INTEGER REFERENCES members(id),
    channel_id INTEGER REFERENCES chat_channels(id),
    message_id INTEGER REFERENCES chat_messages(id),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GDPR Requests Table
CREATE TABLE IF NOT EXISTS chat_gdpr_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES members(id),
    request_type VARCHAR(50) NOT NULL, -- data_export, data_deletion, data_correction
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    requested_data JSONB DEFAULT '{}',
    processed_data JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Analytics Table
CREATE TABLE IF NOT EXISTS chat_analytics (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES chat_channels(id),
    date DATE NOT NULL,
    total_messages INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_members INTEGER DEFAULT 0,
    messages_per_hour JSONB DEFAULT '[]',
    peak_hour INTEGER,
    avg_message_length INTEGER DEFAULT 0,
    file_shares INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    flagged_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, date)
);

-- User Activity Table
CREATE TABLE IF NOT EXISTS chat_user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES members(id),
    channel_id INTEGER REFERENCES chat_channels(id),
    date DATE NOT NULL,
    messages_sent INTEGER DEFAULT 0,
    messages_read INTEGER DEFAULT 0,
    reactions_given INTEGER DEFAULT 0,
    files_shared INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, channel_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_channels_created_by ON chat_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_channels_last_activity ON chat_channels(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_channel_id ON chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_user_id ON chat_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_attachments_message_id ON chat_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reactions_message_id ON chat_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_reads_message_id ON chat_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_direct_messages_sender_recipient ON chat_direct_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_status_user_id ON chat_user_status(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_content_moderation_message_id ON chat_content_moderation(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_log_user_id ON chat_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_log_created_at ON chat_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_gdpr_requests_user_id ON chat_gdpr_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_channel_date ON chat_analytics(channel_id, date);
CREATE INDEX IF NOT EXISTS idx_chat_user_activity_user_channel_date ON chat_user_activity(user_id, channel_id, date);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_chat_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_channels_updated_at
    BEFORE UPDATE ON chat_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_channels_updated_at();

CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_messages_updated_at();

-- Function to update channel last activity
CREATE OR REPLACE FUNCTION update_channel_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_channels 
    SET last_activity_at = NOW() 
    WHERE id = NEW.channel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_channel_last_activity
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_channel_last_activity();

-- Insert some sample data for testing (using actual user IDs from the database)
INSERT INTO chat_channels (name, description, type, created_by, settings) VALUES
('general', 'General company chat', 'general', 21, '{"allowFileSharing": true, "allowReactions": true}'),
('operations', 'Operations team chat', 'department', 21, '{"allowFileSharing": true, "allowReactions": true}'),
('hr', 'HR and compliance', 'department', 21, '{"allowFileSharing": false, "allowReactions": true}'),
('announcements', 'Company announcements', 'announcement', 21, '{"allowFileSharing": true, "allowReactions": false, "isReadonly": true}');

-- Add current user to all channels
INSERT INTO chat_channel_members (channel_id, user_id, role) VALUES
(1, 21, 'owner'),
(2, 21, 'owner'),
(3, 21, 'owner'),
(4, 21, 'owner'),
(1, 22, 'member'),
(2, 22, 'member'),
(3, 22, 'member'),
(4, 22, 'member'); 