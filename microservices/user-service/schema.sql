-- =============================================
-- USER SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE USER PROFILE TABLES
-- =============================================

-- Core User Profile Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL, -- Reference to auth service
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    avatar_url VARCHAR(500),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address JSONB, -- {street, city, state, country, postal_code, lat, lng}
    emergency_contact JSONB, -- {name, phone, relationship}
    employee_id VARCHAR(100) UNIQUE,
    hire_date DATE,
    termination_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizational Structure Tables
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    assigned_by UUID REFERENCES user_profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id, department_id)
);

-- User Preferences Table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);

-- User Skills & Certifications Table
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
    certified BOOLEAN DEFAULT FALSE,
    certification_date DATE,
    expiry_date DATE,
    verified_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Tracking Table
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    activity_type VARCHAR(100) NOT NULL,
    activity_details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User Profiles Indexes
CREATE INDEX idx_user_profiles_auth_id ON user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_employee_id ON user_profiles(employee_id);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX idx_user_profiles_name ON user_profiles(first_name, last_name);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- Departments Indexes
CREATE INDEX idx_departments_parent ON departments(parent_department_id);
CREATE INDEX idx_departments_manager ON departments(manager_id);
CREATE INDEX idx_departments_active ON departments(is_active);
CREATE INDEX idx_departments_name ON departments(name);

-- Roles Indexes
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_system ON roles(is_system_role);

-- User Roles Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_department_id ON user_roles(department_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- User Preferences Indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);

-- User Skills Indexes
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_name ON user_skills(skill_name);
CREATE INDEX idx_user_skills_certified ON user_skills(certified);

-- Activity Log Indexes
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(100),
    p_activity_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO user_activity_log (user_id, activity_type, activity_details, ip_address, user_agent)
    VALUES (p_user_id, p_activity_type, p_activity_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's full name
CREATE OR REPLACE FUNCTION get_user_full_name(p_user_id UUID)
RETURNS VARCHAR(255) AS $$
DECLARE
    full_name VARCHAR(255);
BEGIN
    SELECT CONCAT(first_name, ' ', last_name) INTO full_name
    FROM user_profiles
    WHERE id = p_user_id;
    
    RETURN full_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's department hierarchy
CREATE OR REPLACE FUNCTION get_user_department_hierarchy(p_user_id UUID)
RETURNS TABLE(department_id UUID, department_name VARCHAR(255), level INTEGER) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE dept_hierarchy AS (
        -- Base case: user's direct department
        SELECT 
            d.id as department_id,
            d.name as department_name,
            1 as level
        FROM departments d
        JOIN user_roles ur ON d.id = ur.department_id
        WHERE ur.user_id = p_user_id AND ur.is_active = TRUE
        
        UNION ALL
        
        -- Recursive case: parent departments
        SELECT 
            d.id as department_id,
            d.name as department_name,
            dh.level + 1 as level
        FROM departments d
        JOIN dept_hierarchy dh ON d.id = dh.department_id
        WHERE d.parent_department_id IS NOT NULL
    )
    SELECT * FROM dept_hierarchy
    ORDER BY level;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(permission VARCHAR(255)) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT jsonb_array_elements_text(r.permissions) as permission
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id 
      AND ur.is_active = TRUE 
      AND r.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DATA SEEDING
-- =============================================

-- Insert default departments
INSERT INTO departments (name, description, is_active) VALUES
('IT', 'Information Technology Department', TRUE),
('Sales', 'Sales and Marketing Department', TRUE),
('HR', 'Human Resources Department', TRUE),
('Operations', 'Operations and Logistics Department', TRUE),
('Finance', 'Finance and Accounting Department', TRUE)
ON CONFLICT DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_system_role) VALUES
('admin', 'System Administrator', '["*"]'::jsonb, TRUE),
('manager', 'Department Manager', '["read:users", "write:users", "read:reports", "write:reports"]'::jsonb, TRUE),
('supervisor', 'Team Supervisor', '["read:users", "read:reports", "write:reports"]'::jsonb, TRUE),
('employee', 'Regular Employee', '["read:own_profile", "write:own_profile"]'::jsonb, TRUE),
('hr_manager', 'HR Manager', '["read:users", "write:users", "read:hr_reports", "write:hr_reports"]'::jsonb, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert default user profiles (will be linked to auth users)
INSERT INTO user_profiles (
    auth_user_id,
    first_name,
    last_name,
    display_name,
    employee_id,
    hire_date,
    is_active
) VALUES 
-- Admin user (auth_user_id will be set after auth user creation)
('00000000-0000-0000-0000-000000000001', 'Admin', 'User', 'Admin User', 'EMP001', CURRENT_DATE, TRUE),
-- Employee user (auth_user_id will be set after auth user creation)
('00000000-0000-0000-0000-000000000002', 'Richard', 'Johnson', 'Richard Johnson', 'EMP002', CURRENT_DATE, TRUE)
ON CONFLICT DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, department_id, assigned_by) 
SELECT 
    up.id,
    r.id,
    d.id,
    up.id
FROM user_profiles up
CROSS JOIN roles r
CROSS JOIN departments d
WHERE 
    (up.employee_id = 'EMP001' AND r.name = 'admin' AND d.name = 'IT')
    OR (up.employee_id = 'EMP002' AND r.name = 'employee' AND d.name = 'Sales')
ON CONFLICT DO NOTHING;

-- Insert default user preferences
INSERT INTO user_preferences (user_id, preference_key, preference_value) 
SELECT 
    up.id,
    'theme',
    '"light"'::jsonb
FROM user_profiles up
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- User Profile Summary View
CREATE VIEW v_user_profile_summary AS
SELECT 
    up.id,
    up.auth_user_id,
    up.first_name,
    up.last_name,
    up.display_name,
    up.employee_id,
    up.is_active,
    up.hire_date,
    d.name as department_name,
    r.name as role_name,
    COUNT(us.id) as skills_count,
    COUNT(CASE WHEN us.certified = TRUE THEN 1 END) as certifications_count
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN departments d ON ur.department_id = d.id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN user_skills us ON up.id = us.user_id
GROUP BY up.id, up.auth_user_id, up.first_name, up.last_name, up.display_name, 
         up.employee_id, up.is_active, up.hire_date, d.name, r.name;

-- Department Hierarchy View
CREATE VIEW v_department_hierarchy AS
WITH RECURSIVE dept_tree AS (
    -- Base case: root departments
    SELECT 
        id,
        name,
        parent_department_id,
        0 as level,
        ARRAY[name] as path
    FROM departments
    WHERE parent_department_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child departments
    SELECT 
        d.id,
        d.name,
        d.parent_department_id,
        dt.level + 1,
        dt.path || d.name
    FROM departments d
    JOIN dept_tree dt ON d.parent_department_id = dt.id
)
SELECT 
    id,
    name,
    parent_department_id,
    level,
    path,
    array_to_string(path, ' > ') as full_path
FROM dept_tree
ORDER BY path;

-- User Activity Summary View
CREATE VIEW v_user_activity_summary AS
SELECT 
    up.id,
    up.first_name,
    up.last_name,
    up.employee_id,
    ual.activity_type,
    COUNT(*) as activity_count,
    MIN(ual.created_at) as first_activity,
    MAX(ual.created_at) as last_activity
FROM user_profiles up
JOIN user_activity_log ual ON up.id = ual.user_id
WHERE ual.created_at >= NOW() - INTERVAL '30 days'
GROUP BY up.id, up.first_name, up.last_name, up.employee_id, ual.activity_type
ORDER BY activity_count DESC;

-- =============================================
-- SECURITY POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on activity log table
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for activity log access (users can only see their own activity)
CREATE POLICY activity_log_access_policy ON user_activity_log
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup old activity logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_user_activity_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_activity_log 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate terminated users
CREATE OR REPLACE FUNCTION deactivate_terminated_users()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE user_profiles
    SET is_active = FALSE
    WHERE termination_date IS NOT NULL 
      AND termination_date <= CURRENT_DATE
      AND is_active = TRUE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED CLEANUP (PostgreSQL Cron Extension)
-- =============================================

-- Note: These would be set up using pg_cron extension in production
-- SELECT cron.schedule('cleanup-old-activity-logs', '0 2 * * 0', 'SELECT cleanup_old_user_activity_logs();');
-- SELECT cron.schedule('deactivate-terminated-users', '0 6 * * *', 'SELECT deactivate_terminated_users();');

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
VALUES ('1.0.0', 'Initial User Service schema with profiles, departments, roles, and activity tracking');

-- =============================================
-- END OF USER SERVICE SCHEMA
-- ============================================= 