-- =============================================
-- CHAT SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Channels Table
CREATE TABLE chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel_type VARCHAR(50) NOT NULL, -- 'direct', 'group', 'department', 'project', 'announcement'
    is_private BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'system', 'reaction'
    content TEXT,
    metadata JSONB, -- For file attachments, reactions, etc.
    parent_message_id UUID REFERENCES chat_messages(id), -- For replies
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Members Table
CREATE TABLE chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(channel_id, user_id)
);

-- Chat Attachments Table
CREATE TABLE chat_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Reactions Table
CREATE TABLE chat_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type VARCHAR(50) NOT NULL, -- 'like', 'love', 'laugh', 'wow', 'sad', 'angry'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Indexes
CREATE INDEX idx_chat_channels_type ON chat_channels(channel_type);
CREATE INDEX idx_chat_channels_created_by ON chat_channels(created_by);
CREATE INDEX idx_chat_channels_archived ON chat_channels(is_archived);
CREATE INDEX idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_parent ON chat_messages(parent_message_id);
CREATE INDEX idx_chat_members_channel_id ON chat_members(channel_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX idx_chat_members_active ON chat_members(is_active);
CREATE INDEX idx_chat_attachments_message_id ON chat_attachments(message_id);
CREATE INDEX idx_chat_reactions_message_id ON chat_reactions(message_id);
CREATE INDEX idx_chat_reactions_user_id ON chat_reactions(user_id);

-- Schema version
CREATE TABLE IF NOT EXISTS schema_version (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial Chat Service schema');
