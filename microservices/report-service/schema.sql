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
