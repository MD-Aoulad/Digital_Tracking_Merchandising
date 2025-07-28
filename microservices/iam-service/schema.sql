-- Enterprise IAM Database Schema
-- Digital Tracking Merchandising Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE IAM TABLES
-- =============================================

-- Users table with enhanced security
CREATE TABLE IF NOT EXISTS iam_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_expires_at TIMESTAMP,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~* '^\+?[1-9]\d{1,14}$' OR phone IS NULL)
);

-- Roles table
CREATE TABLE IF NOT EXISTS iam_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS iam_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    is_system_permission BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_resource_action UNIQUE(resource, action)
);

-- Role-Permission mapping
CREATE TABLE IF NOT EXISTS iam_role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES iam_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES iam_permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES iam_users(id),
    UNIQUE(role_id, permission_id)
);

-- User-Role mapping
CREATE TABLE IF NOT EXISTS iam_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES iam_users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES iam_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES iam_users(id),
    UNIQUE(user_id, role_id)
);

-- Groups table for organizational hierarchy
CREATE TABLE IF NOT EXISTS iam_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_group_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP,
    FOREIGN KEY (parent_group_id) REFERENCES iam_groups(id),
    FOREIGN KEY (created_by) REFERENCES iam_users(id),
    FOREIGN KEY (updated_by) REFERENCES iam_users(id)
);

-- User-Group mapping
CREATE TABLE IF NOT EXISTS iam_user_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    group_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES iam_users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES iam_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES iam_users(id),
    UNIQUE(user_id, group_id)
);

-- =============================================
-- SECURITY & COMPLIANCE TABLES
-- =============================================

-- Session management
CREATE TABLE IF NOT EXISTS iam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES iam_users(id) ON DELETE CASCADE
);

-- Password history for compliance
CREATE TABLE IF NOT EXISTS iam_password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID,
    FOREIGN KEY (user_id) REFERENCES iam_users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES iam_users(id)
);

-- MFA backup codes
CREATE TABLE IF NOT EXISTS iam_mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES iam_users(id) ON DELETE CASCADE
);

-- =============================================
-- AUDIT & COMPLIANCE TABLES
-- =============================================

-- Comprehensive audit log
CREATE TABLE IF NOT EXISTS iam_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES iam_users(id),
    FOREIGN KEY (session_id) REFERENCES iam_sessions(id)
);

-- Login attempts tracking
CREATE TABLE IF NOT EXISTS iam_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- POLICY & COMPLIANCE TABLES
-- =============================================

-- Password policies
CREATE TABLE IF NOT EXISTS iam_password_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    min_length INTEGER DEFAULT 8,
    require_uppercase BOOLEAN DEFAULT true,
    require_lowercase BOOLEAN DEFAULT true,
    require_numbers BOOLEAN DEFAULT true,
    require_special_chars BOOLEAN DEFAULT true,
    prevent_common_passwords BOOLEAN DEFAULT true,
    max_age_days INTEGER DEFAULT 90,
    history_count INTEGER DEFAULT 5,
    lockout_threshold INTEGER DEFAULT 5,
    lockout_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (created_by) REFERENCES iam_users(id),
    FOREIGN KEY (updated_by) REFERENCES iam_users(id)
);

-- Access policies
CREATE TABLE IF NOT EXISTS iam_access_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (created_by) REFERENCES iam_users(id),
    FOREIGN KEY (updated_by) REFERENCES iam_users(id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_iam_users_email ON iam_users(email);
CREATE INDEX IF NOT EXISTS idx_iam_users_username ON iam_users(username);
CREATE INDEX IF NOT EXISTS idx_iam_users_active ON iam_users(is_active);
CREATE INDEX IF NOT EXISTS idx_iam_users_created_at ON iam_users(created_at);

-- Role indexes
CREATE INDEX IF NOT EXISTS idx_iam_roles_name ON iam_roles(name);
CREATE INDEX IF NOT EXISTS idx_iam_roles_active ON iam_roles(is_active);

-- Permission indexes
CREATE INDEX IF NOT EXISTS idx_iam_permissions_resource ON iam_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_iam_permissions_action ON iam_permissions(action);
CREATE INDEX IF NOT EXISTS idx_iam_permissions_resource_action ON iam_permissions(resource, action);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_iam_sessions_user_id ON iam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_iam_sessions_token ON iam_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_iam_sessions_expires_at ON iam_sessions(expires_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_iam_audit_log_user_id ON iam_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_iam_audit_log_action ON iam_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_iam_audit_log_created_at ON iam_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_iam_audit_log_resource_type ON iam_audit_log(resource_type);

-- Login attempts indexes
CREATE INDEX IF NOT EXISTS idx_iam_login_attempts_email ON iam_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_iam_login_attempts_ip ON iam_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_iam_login_attempts_created_at ON iam_login_attempts(created_at);

-- =============================================
-- TRIGGERS FOR AUTOMATION
-- =============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_iam_users_updated_at BEFORE UPDATE ON iam_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_iam_roles_updated_at BEFORE UPDATE ON iam_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_iam_permissions_updated_at BEFORE UPDATE ON iam_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_iam_groups_updated_at BEFORE UPDATE ON iam_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert default system roles
INSERT INTO iam_roles (name, display_name, description, is_system_role, priority) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', true, 1000),
('admin', 'Administrator', 'System administration with most permissions', true, 900),
('manager', 'Manager', 'Department and team management', true, 800),
('supervisor', 'Supervisor', 'Team supervision and oversight', true, 700),
('employee', 'Employee', 'Standard employee access', true, 600),
('viewer', 'Viewer', 'Read-only access to assigned resources', true, 500)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions for retail operations
INSERT INTO iam_permissions (name, display_name, description, resource, action, is_system_permission) VALUES
-- User Management
('user:create', 'Create Users', 'Create new user accounts', 'user', 'create', true),
('user:read', 'Read Users', 'View user information', 'user', 'read', true),
('user:update', 'Update Users', 'Modify user information', 'user', 'update', true),
('user:delete', 'Delete Users', 'Remove user accounts', 'user', 'delete', true),

-- Role Management
('role:create', 'Create Roles', 'Create new roles', 'role', 'create', true),
('role:read', 'Read Roles', 'View role information', 'role', 'read', true),
('role:update', 'Update Roles', 'Modify role information', 'role', 'update', true),
('role:delete', 'Delete Roles', 'Remove roles', 'role', 'delete', true),

-- Permission Management
('permission:assign', 'Assign Permissions', 'Assign permissions to roles', 'permission', 'assign', true),
('permission:revoke', 'Revoke Permissions', 'Remove permissions from roles', 'permission', 'revoke', true),

-- Todo Management
('todo:create', 'Create Todos', 'Create new tasks', 'todo', 'create', true),
('todo:read', 'Read Todos', 'View task information', 'todo', 'read', true),
('todo:update', 'Update Todos', 'Modify task information', 'todo', 'update', true),
('todo:delete', 'Delete Todos', 'Remove tasks', 'todo', 'delete', true),
('todo:assign', 'Assign Todos', 'Assign tasks to users', 'todo', 'assign', true),

-- Attendance Management
('attendance:read', 'Read Attendance', 'View attendance records', 'attendance', 'read', true),
('attendance:update', 'Update Attendance', 'Modify attendance records', 'attendance', 'update', true),
('attendance:approve', 'Approve Attendance', 'Approve attendance submissions', 'attendance', 'approve', true),

-- Reports and Analytics
('report:read', 'Read Reports', 'View reports and analytics', 'report', 'read', true),
('report:create', 'Create Reports', 'Generate new reports', 'report', 'create', true),
('report:export', 'Export Reports', 'Export report data', 'report', 'export', true),

-- System Administration
('system:admin', 'System Administration', 'Full system administration access', 'system', 'admin', true),
('system:audit', 'System Audit', 'Access audit logs and security information', 'system', 'audit', true)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to super_admin role
INSERT INTO iam_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam_roles r, iam_permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create default password policy
INSERT INTO iam_password_policies (name, min_length, require_uppercase, require_lowercase, require_numbers, require_special_chars, prevent_common_passwords, max_age_days, history_count, lockout_threshold, lockout_duration_minutes)
VALUES ('default', 8, true, true, true, true, true, 90, 5, 5, 30)
ON CONFLICT (name) DO NOTHING;

-- Create default admin user (password: Admin@123)
INSERT INTO iam_users (email, username, password_hash, salt, first_name, last_name, is_active, is_verified, mfa_enabled)
VALUES (
    'admin@digitaltracking.com',
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O', -- Admin@123
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCO',
    'System',
    'Administrator',
    true,
    true,
    false
)
ON CONFLICT (email) DO NOTHING;

-- Assign super_admin role to admin user
INSERT INTO iam_user_roles (user_id, role_id)
SELECT u.id, r.id
FROM iam_users u, iam_roles r
WHERE u.email = 'admin@digitaltracking.com' AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING; 