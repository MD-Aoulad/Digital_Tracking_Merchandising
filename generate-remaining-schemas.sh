#!/bin/bash

# =============================================
# GENERATE REMAINING MICROSERVICE SCHEMAS
# Digital Tracking Merchandising Platform
# =============================================

echo "🚀 Generating remaining microservice database schemas..."

# Create directories for remaining services
mkdir -p microservices/{report-service,approval-service,notification-service,chat-service}

# Generate Report Service Schema
cat > microservices/report-service/schema.sql << 'EOF'
-- =============================================
-- REPORT SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Report Templates Table
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL, -- 'form', 'report', 'dashboard', 'analytics'
    category VARCHAR(100), -- 'attendance', 'performance', 'safety', 'inventory', 'financial'
    template_config JSONB NOT NULL, -- Template configuration and fields
    data_source JSONB, -- Data source configuration
    permissions JSONB, -- Required permissions to access
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    generated_by UUID NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_snapshot JSONB, -- Snapshot of data at generation time
    report_data JSONB, -- Actual report data
    file_path VARCHAR(500), -- Path to generated file
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'generated', -- 'generating', 'generated', 'failed'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Comments Table
CREATE TABLE report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Reports Table
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES report_templates(id),
    name VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    schedule_config JSONB NOT NULL, -- Cron-like schedule configuration
    recipients JSONB, -- Array of recipient user IDs
    delivery_method VARCHAR(50) DEFAULT 'email', -- 'email', 'system', 'api'
    is_active BOOLEAN DEFAULT TRUE,
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Analytics Table
CREATE TABLE report_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id),
    template_id UUID REFERENCES report_templates(id),
    user_id UUID,
    action VARCHAR(50), -- 'viewed', 'downloaded', 'shared', 'commented'
    action_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_report_templates_type ON report_templates(template_type);
CREATE INDEX idx_report_templates_category ON report_templates(category);
CREATE INDEX idx_report_templates_active ON report_templates(is_active);
CREATE INDEX idx_reports_template_id ON reports(template_id);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_scheduled_reports_template_id ON scheduled_reports(template_id);
CREATE INDEX idx_scheduled_reports_active ON scheduled_reports(is_active);
CREATE INDEX idx_report_analytics_report_id ON report_analytics(report_id);
CREATE INDEX idx_report_analytics_user_id ON report_analytics(user_id);

-- Schema version
CREATE TABLE IF NOT EXISTS schema_version (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial Report Service schema');
EOF

# Generate Approval Service Schema
cat > microservices/approval-service/schema.sql << 'EOF'
-- =============================================
-- APPROVAL SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Approval Workflows Table
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100) NOT NULL, -- 'leave_request', 'expense', 'purchase', 'policy_change'
    steps JSONB NOT NULL, -- Array of approval steps
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Requests Table
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
    requester_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    request_data JSONB NOT NULL, -- Request-specific data
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Steps Table
CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    approver_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'delegated'
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Delegations Table
CREATE TABLE approval_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegator_id UUID NOT NULL,
    delegate_id UUID NOT NULL,
    workflow_type VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_approval_workflows_type ON approval_workflows(workflow_type);
CREATE INDEX idx_approval_workflows_active ON approval_workflows(is_active);
CREATE INDEX idx_approval_requests_workflow_id ON approval_requests(workflow_id);
CREATE INDEX idx_approval_requests_requester_id ON approval_requests(requester_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_requested_at ON approval_requests(requested_at);
CREATE INDEX idx_approval_steps_request_id ON approval_steps(request_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);
CREATE INDEX idx_approval_steps_status ON approval_steps(status);
CREATE INDEX idx_approval_delegations_delegator_id ON approval_delegations(delegator_id);
CREATE INDEX idx_approval_delegations_delegate_id ON approval_delegations(delegate_id);
CREATE INDEX idx_approval_delegations_active ON approval_delegations(is_active);

-- Schema version
CREATE TABLE IF NOT EXISTS schema_version (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial Approval Service schema');
EOF

# Generate Notification Service Schema
cat > microservices/notification-service/schema.sql << 'EOF'
-- =============================================
-- NOTIFICATION SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notification Templates Table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB, -- Template variables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES notification_templates(id),
    recipient_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_attempts INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB, -- Additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Notification Preferences Table
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type, channel)
);

-- Notification Subscriptions Table
CREATE TABLE notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_type VARCHAR(100) NOT NULL, -- 'task_updates', 'safety_alerts', 'system_notifications'
    channel VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_user_notification_preferences_type ON user_notification_preferences(notification_type);
CREATE INDEX idx_notification_subscriptions_user_id ON notification_subscriptions(user_id);
CREATE INDEX idx_notification_subscriptions_type ON notification_subscriptions(subscription_type);

-- Schema version
CREATE TABLE IF NOT EXISTS schema_version (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial Notification Service schema');
EOF

# Generate Chat Service Schema
cat > microservices/chat-service/schema.sql << 'EOF'
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
EOF

echo "✅ All remaining microservice schemas generated successfully!"
echo ""
echo "📋 Generated schemas:"
echo "  • Report Service (microservices/report-service/schema.sql)"
echo "  • Approval Service (microservices/approval-service/schema.sql)"
echo "  • Notification Service (microservices/notification-service/schema.sql)"
echo "  • Chat Service (microservices/chat-service/schema.sql)"
echo ""
echo "🎯 Next steps:"
echo "  1. Review and customize schemas as needed"
echo "  2. Add comprehensive functions, triggers, and views"
echo "  3. Create data seeding scripts"
echo "  4. Implement security policies"
echo "  5. Test database migrations" 