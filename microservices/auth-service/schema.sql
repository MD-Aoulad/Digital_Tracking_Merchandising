-- =============================================
-- AUTH SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE AUTHENTICATION TABLES
-- =============================================

-- Core Authentication Users Table
CREATE TABLE auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password Reset Tokens Table
CREATE TABLE auth_password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-factor Authentication Devices Table
CREATE TABLE auth_mfa_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL, -- 'totp', 'sms', 'email'
    device_name VARCHAR(255),
    secret_key VARCHAR(255),
    phone_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Authentication Audit Log Table
CREATE TABLE auth_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Auth Users Indexes
CREATE INDEX idx_auth_users_email ON auth_users(email);
CREATE INDEX idx_auth_users_active ON auth_users(is_active);
CREATE INDEX idx_auth_users_created_at ON auth_users(created_at);

-- Auth Sessions Indexes
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token_hash);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX idx_auth_sessions_revoked ON auth_sessions(is_revoked);

-- Password Reset Indexes
CREATE INDEX idx_auth_password_resets_user_id ON auth_password_resets(user_id);
CREATE INDEX idx_auth_password_resets_token ON auth_password_resets(token_hash);
CREATE INDEX idx_auth_password_resets_expires_at ON auth_password_resets(expires_at);

-- MFA Devices Indexes
CREATE INDEX idx_auth_mfa_devices_user_id ON auth_mfa_devices(user_id);
CREATE INDEX idx_auth_mfa_devices_type ON auth_mfa_devices(device_type);
CREATE INDEX idx_auth_mfa_devices_enabled ON auth_mfa_devices(is_enabled);

-- Audit Log Indexes
CREATE INDEX idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX idx_auth_audit_log_action ON auth_audit_log(action);
CREATE INDEX idx_auth_audit_log_created_at ON auth_audit_log(created_at);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_auth_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_auth_users_updated_at
    BEFORE UPDATE ON auth_users
    FOR EACH ROW
    EXECUTE FUNCTION update_auth_users_updated_at();

-- Function to log authentication events
CREATE OR REPLACE FUNCTION log_auth_event(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO auth_audit_log (user_id, action, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is locked
CREATE OR REPLACE FUNCTION is_user_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT auth_users.locked_until INTO locked_until
    FROM auth_users
    WHERE id = p_user_id;
    
    RETURN locked_until IS NOT NULL AND locked_until > NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to increment failed login attempts
CREATE OR REPLACE FUNCTION increment_failed_login_attempts(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE auth_users
    SET 
        failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
            WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'
            WHEN failed_login_attempts >= 2 THEN NOW() + INTERVAL '5 minutes'
            ELSE NULL
        END
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE auth_users
    SET 
        failed_login_attempts = 0,
        locked_until = NULL,
        last_login_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DATA SEEDING
-- =============================================

-- Insert default admin user (password: 'password')
INSERT INTO auth_users (
    email, 
    password_hash, 
    salt, 
    is_active, 
    is_verified, 
    email_verified_at
) VALUES (
    'admin@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'password'
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    TRUE,
    TRUE,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert default employee user (password: 'password')
INSERT INTO auth_users (
    email, 
    password_hash, 
    salt, 
    is_active, 
    is_verified, 
    email_verified_at
) VALUES (
    'richard@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'password'
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    TRUE,
    TRUE,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Active Sessions View
CREATE VIEW v_active_sessions AS
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.expires_at,
    s.ip_address,
    s.created_at
FROM auth_sessions s
JOIN auth_users u ON s.user_id = u.id
WHERE s.is_revoked = FALSE AND s.expires_at > NOW();

-- User Login Statistics View
CREATE VIEW v_user_login_stats AS
SELECT 
    u.id,
    u.email,
    u.is_active,
    u.last_login_at,
    u.failed_login_attempts,
    u.created_at,
    COUNT(s.id) as active_sessions_count
FROM auth_users u
LEFT JOIN auth_sessions s ON u.id = s.user_id AND s.is_revoked = FALSE AND s.expires_at > NOW()
GROUP BY u.id, u.email, u.is_active, u.last_login_at, u.failed_login_attempts, u.created_at;

-- Authentication Events Summary View
CREATE VIEW v_auth_events_summary AS
SELECT 
    action,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(created_at) as first_occurrence,
    MAX(created_at) as last_occurrence
FROM auth_audit_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY action
ORDER BY event_count DESC;

-- =============================================
-- SECURITY POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on audit log table
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for audit log access (only system can access)
CREATE POLICY audit_log_access_policy ON auth_audit_log
    FOR ALL
    USING (true); -- In production, this should be more restrictive

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_sessions 
    WHERE expires_at < NOW() OR is_revoked = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired password reset tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_password_resets 
    WHERE expires_at < NOW() OR used_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_audit_log 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED CLEANUP (PostgreSQL Cron Extension)
-- =============================================

-- Note: These would be set up using pg_cron extension in production
-- SELECT cron.schedule('cleanup-expired-sessions', '0 */6 * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('cleanup-expired-resets', '0 */12 * * *', 'SELECT cleanup_expired_password_resets();');
-- SELECT cron.schedule('cleanup-old-audit-logs', '0 2 * * 0', 'SELECT cleanup_old_audit_logs();');

-- =============================================
-- SCHEMA VERSION TRACKING
-- =============================================

-- Create schema version table
CREATE TABLE IF NOT EXISTS schema_version (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

-- Insert current schema version
INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial Auth Service schema with authentication, sessions, MFA, and audit logging');

-- =============================================
-- END OF AUTH SERVICE SCHEMA
-- ============================================= 