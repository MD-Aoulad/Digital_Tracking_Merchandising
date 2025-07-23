-- Enhanced Attendance System Database Schema
-- This script initializes the complete database schema for the attendance system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enhanced attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    workplace_id UUID NOT NULL,
    punch_in_time TIMESTAMP WITH TIME ZONE,
    punch_out_time TIMESTAMP WITH TIME ZONE,
    punch_in_latitude DECIMAL(10, 8),
    punch_in_longitude DECIMAL(11, 8),
    punch_out_latitude DECIMAL(10, 8),
    punch_out_longitude DECIMAL(11, 8),
    punch_in_accuracy DECIMAL(5, 2),
    punch_out_accuracy DECIMAL(5, 2),
    photo_url TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    date DATE NOT NULL,
    
    -- Enhanced fields
    break_start_time TIMESTAMP WITH TIME ZONE,
    break_end_time TIMESTAMP WITH TIME ZONE,
    total_break_hours DECIMAL(5,2) DEFAULT 0,
    net_work_hours DECIMAL(5,2) DEFAULT 0,
    clock_in_method VARCHAR(50) DEFAULT 'gps',
    clock_out_method VARCHAR(50) DEFAULT 'gps',
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    shift_id UUID,
    geofence_zone_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create breaks table
CREATE TABLE IF NOT EXISTS breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('lunch', 'coffee', 'rest', 'other')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create approval_requests table
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID REFERENCES attendance_records(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL,
    approver_id UUID,
    type VARCHAR(20) NOT NULL CHECK (type IN ('late', 'early_leave', 'overtime', 'break_extension')),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create geofence_zones table
CREATE TABLE IF NOT EXISTS geofence_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workplace_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    center_latitude DECIMAL(10, 8) NOT NULL,
    center_longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    allowed_methods TEXT[] DEFAULT ARRAY['gps', 'qr', 'facial'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workplace_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workplaces table (if not exists)
CREATE TABLE IF NOT EXISTS workplaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
    workplace_id UUID REFERENCES workplaces(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_workplace_date ON attendance_records(workplace_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_punch_in_time ON attendance_records(punch_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_verification_status ON attendance_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_attendance_shift_id ON attendance_records(shift_id);

CREATE INDEX IF NOT EXISTS idx_breaks_attendance ON breaks(attendance_id);
CREATE INDEX IF NOT EXISTS idx_breaks_start_time ON breaks(start_time);
CREATE INDEX IF NOT EXISTS idx_breaks_type ON breaks(type);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON approval_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approval_requests(type);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_at ON approval_requests(requested_at);

CREATE INDEX IF NOT EXISTS idx_geofence_workplace ON geofence_zones(workplace_id);
CREATE INDEX IF NOT EXISTS idx_geofence_active ON geofence_zones(is_active);

CREATE INDEX IF NOT EXISTS idx_shifts_workplace ON shifts(workplace_id);
CREATE INDEX IF NOT EXISTS idx_shifts_active ON shifts(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_attendance_records_updated_at 
    BEFORE UPDATE ON attendance_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workplaces_updated_at 
    BEFORE UPDATE ON workplaces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO workplaces (id, name, address, city, state, country, postal_code, latitude, longitude, timezone) VALUES
    (uuid_generate_v4(), 'Main Office', '123 Main Street', 'New York', 'NY', 'USA', '10001', 40.7128, -74.0060, 'America/New_York'),
    (uuid_generate_v4(), 'Branch Office', '456 Branch Avenue', 'Los Angeles', 'CA', 'USA', '90210', 34.0522, -118.2437, 'America/Los_Angeles')
ON CONFLICT DO NOTHING;

-- Insert sample shifts
INSERT INTO shifts (workplace_id, name, start_time, end_time, break_duration_minutes) 
SELECT 
    w.id,
    'Morning Shift',
    '09:00:00',
    '17:00:00',
    60
FROM workplaces w 
WHERE w.name = 'Main Office'
ON CONFLICT DO NOTHING;

INSERT INTO shifts (workplace_id, name, start_time, end_time, break_duration_minutes) 
SELECT 
    w.id,
    'Evening Shift',
    '17:00:00',
    '01:00:00',
    60
FROM workplaces w 
WHERE w.name = 'Main Office'
ON CONFLICT DO NOTHING;

-- Insert sample geofence zones
INSERT INTO geofence_zones (workplace_id, name, center_latitude, center_longitude, radius_meters, allowed_methods)
SELECT 
    w.id,
    'Main Building',
    40.7128,
    -74.0060,
    100,
    ARRAY['gps', 'qr', 'facial']
FROM workplaces w 
WHERE w.name = 'Main Office'
ON CONFLICT DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
    ar.id,
    ar.user_id,
    ar.workplace_id,
    ar.date,
    ar.punch_in_time,
    ar.punch_out_time,
    ar.total_work_hours,
    ar.net_work_hours,
    ar.total_break_hours,
    ar.overtime_hours,
    ar.status,
    ar.verification_status,
    w.name as workplace_name,
    s.name as shift_name
FROM attendance_records ar
LEFT JOIN workplaces w ON ar.workplace_id = w.id
LEFT JOIN shifts s ON ar.shift_id = s.id;

-- Create view for team status
CREATE OR REPLACE VIEW team_status AS
SELECT 
    ar.user_id,
    u.first_name,
    u.last_name,
    ar.status,
    ar.punch_in_time,
    ar.current_break,
    ar.total_work_hours,
    ar.workplace_id,
    w.name as workplace_name
FROM attendance_records ar
JOIN users u ON ar.user_id = u.id
JOIN workplaces w ON ar.workplace_id = w.id
WHERE ar.date = CURRENT_DATE AND ar.status IN ('active', 'on_break');

-- Grant permissions (adjust as needed for your security requirements)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO attendance_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO attendance_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO attendance_user;

-- Create database statistics
ANALYZE; 