-- =============================================
-- ATTENDANCE SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE ATTENDANCE TABLES
-- =============================================

-- Core Attendance Records Table
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to user service
    workplace_id UUID, -- Reference to workplace service
    date DATE NOT NULL,
    clock_in_time TIMESTAMP WITH TIME ZONE,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    break_start_time TIMESTAMP WITH TIME ZONE,
    break_end_time TIMESTAMP WITH TIME ZONE,
    total_work_hours DECIMAL(5,2),
    total_break_hours DECIMAL(5,2),
    net_work_hours DECIMAL(5,2),
    clock_in_location JSONB, -- {lat, lng, address, accuracy}
    clock_out_location JSONB, -- {lat, lng, address, accuracy}
    clock_in_method VARCHAR(50), -- 'mobile', 'web', 'biometric', 'manual'
    clock_out_method VARCHAR(50), -- 'mobile', 'web', 'biometric', 'manual'
    status VARCHAR(50) DEFAULT 'present', -- 'present', 'absent', 'late', 'early_departure', 'half_day'
    notes TEXT,
    approved_by UUID, -- Reference to user service
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Work Schedules Table
CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to user service
    workplace_id UUID, -- Reference to workplace service
    schedule_type VARCHAR(50) DEFAULT 'regular', -- 'regular', 'flexible', 'shift', 'custom'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 60, -- in minutes
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
    effective_from DATE NOT NULL,
    effective_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave Types Table
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_balance DECIMAL(5,2) DEFAULT 0,
    accrual_rate DECIMAL(5,2) DEFAULT 0, -- per month
    max_balance DECIMAL(5,2),
    is_paid BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE,
    color VARCHAR(7), -- hex color code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Leave Balances Table
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to user service
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    initial_balance DECIMAL(5,2) DEFAULT 0,
    accrued_balance DECIMAL(5,2) DEFAULT 0,
    used_balance DECIMAL(5,2) DEFAULT 0,
    current_balance DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, leave_type_id, year)
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to user service
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    total_days DECIMAL(5,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID, -- Reference to user service
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Overtime Records Table
CREATE TABLE overtime_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to user service
    attendance_record_id UUID REFERENCES attendance_records(id),
    date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5,2) NOT NULL,
    overtime_type VARCHAR(50) DEFAULT 'regular', -- 'regular', 'holiday', 'weekend', 'night'
    rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID, -- Reference to user service
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workplace Geofences Table
CREATE TABLE workplace_geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID NOT NULL, -- Reference to workplace service
    name VARCHAR(255) NOT NULL,
    center_lat DECIMAL(10,8) NOT NULL,
    center_lng DECIMAL(11,8) NOT NULL,
    radius_meters INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Attendance Records Indexes
CREATE INDEX idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_attendance_records_workplace_id ON attendance_records(workplace_id);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_records_clock_in_time ON attendance_records(clock_in_time);
CREATE INDEX idx_attendance_records_user_date ON attendance_records(user_id, date);

-- Work Schedules Indexes
CREATE INDEX idx_work_schedules_user_id ON work_schedules(user_id);
CREATE INDEX idx_work_schedules_workplace_id ON work_schedules(workplace_id);
CREATE INDEX idx_work_schedules_active ON work_schedules(is_active);
CREATE INDEX idx_work_schedules_effective_from ON work_schedules(effective_from);

-- Leave Types Indexes
CREATE INDEX idx_leave_types_active ON leave_types(is_active);
CREATE INDEX idx_leave_types_name ON leave_types(name);

-- Leave Balances Indexes
CREATE INDEX idx_leave_balances_user_id ON leave_balances(user_id);
CREATE INDEX idx_leave_balances_leave_type_id ON leave_balances(leave_type_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
CREATE INDEX idx_leave_balances_user_type_year ON leave_balances(user_id, leave_type_id, year);

-- Leave Requests Indexes
CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_leave_type_id ON leave_requests(leave_type_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_date_range ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_approved_by ON leave_requests(approved_by);

-- Overtime Records Indexes
CREATE INDEX idx_overtime_records_user_id ON overtime_records(user_id);
CREATE INDEX idx_overtime_records_attendance_record_id ON overtime_records(attendance_record_id);
CREATE INDEX idx_overtime_records_date ON overtime_records(date);
CREATE INDEX idx_overtime_records_status ON overtime_records(status);

-- Workplace Geofences Indexes
CREATE INDEX idx_workplace_geofences_workplace_id ON workplace_geofences(workplace_id);
CREATE INDEX idx_workplace_geofences_active ON workplace_geofences(is_active);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

CREATE TRIGGER trigger_update_work_schedules_updated_at
    BEFORE UPDATE ON work_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

CREATE TRIGGER trigger_update_leave_balances_updated_at
    BEFORE UPDATE ON leave_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

-- Function to calculate work hours
CREATE OR REPLACE FUNCTION calculate_work_hours(
    p_clock_in TIMESTAMP WITH TIME ZONE,
    p_clock_out TIMESTAMP WITH TIME ZONE,
    p_break_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_break_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE(total_hours DECIMAL(5,2), break_hours DECIMAL(5,2), net_hours DECIMAL(5,2)) AS $$
DECLARE
    total_hours DECIMAL(5,2);
    break_hours DECIMAL(5,2);
    net_hours DECIMAL(5,2);
BEGIN
    -- Calculate total hours
    IF p_clock_in IS NOT NULL AND p_clock_out IS NOT NULL THEN
        total_hours := EXTRACT(EPOCH FROM (p_clock_out - p_clock_in)) / 3600;
    ELSE
        total_hours := 0;
    END IF;
    
    -- Calculate break hours
    IF p_break_start IS NOT NULL AND p_break_end IS NOT NULL THEN
        break_hours := EXTRACT(EPOCH FROM (p_break_end - p_break_start)) / 3600;
    ELSE
        break_hours := 0;
    END IF;
    
    -- Calculate net hours
    net_hours := total_hours - break_hours;
    
    RETURN QUERY SELECT total_hours, break_hours, net_hours;
END;
$$ LANGUAGE plpgsql;

-- Function to determine attendance status
CREATE OR REPLACE FUNCTION determine_attendance_status(
    p_clock_in_time TIMESTAMP WITH TIME ZONE,
    p_clock_out_time TIMESTAMP WITH TIME ZONE,
    p_scheduled_start TIME,
    p_scheduled_end TIME,
    p_work_hours DECIMAL(5,2)
)
RETURNS VARCHAR(50) AS $$
DECLARE
    status VARCHAR(50);
    late_threshold INTEGER := 15; -- minutes
    early_departure_threshold INTEGER := 60; -- minutes
    min_work_hours DECIMAL(5,2) := 4.0; -- minimum hours for half day
BEGIN
    -- Check if present
    IF p_clock_in_time IS NOT NULL AND p_clock_out_time IS NOT NULL THEN
        -- Check if late
        IF p_clock_in_time::time > (p_scheduled_start + (late_threshold || ' minutes')::interval)::time THEN
            status := 'late';
        -- Check if early departure
        ELSIF p_clock_out_time::time < (p_scheduled_end - (early_departure_threshold || ' minutes')::interval)::time THEN
            status := 'early_departure';
        -- Check if half day
        ELSIF p_work_hours < min_work_hours THEN
            status := 'half_day';
        ELSE
            status := 'present';
        END IF;
    ELSE
        status := 'absent';
    END IF;
    
    RETURN status;
END;
$$ LANGUAGE plpgsql;

-- Function to check if location is within geofence
CREATE OR REPLACE FUNCTION is_within_geofence(
    p_lat DECIMAL(10,8),
    p_lng DECIMAL(11,8),
    p_workplace_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    distance_meters DECIMAL(10,2);
    geofence_record RECORD;
BEGIN
    -- Get the geofence for the workplace
    SELECT * INTO geofence_record
    FROM workplace_geofences
    WHERE workplace_id = p_workplace_id AND is_active = TRUE
    LIMIT 1;
    
    IF geofence_record IS NULL THEN
        RETURN TRUE; -- No geofence defined, allow any location
    END IF;
    
    -- Calculate distance using Haversine formula
    distance_meters := (
        6371000 * acos(
            cos(radians(geofence_record.center_lat)) * 
            cos(radians(p_lat)) * 
            cos(radians(p_lng) - radians(geofence_record.center_lng)) + 
            sin(radians(geofence_record.center_lat)) * 
            sin(radians(p_lat))
        )
    );
    
    RETURN distance_meters <= geofence_record.radius_meters;
END;
$$ LANGUAGE plpgsql;

-- Function to update leave balance when request is approved
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process when status changes to approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Update leave balance
        UPDATE leave_balances
        SET 
            used_balance = used_balance + NEW.total_days,
            current_balance = current_balance - NEW.total_days,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
          AND leave_type_id = NEW.leave_type_id 
          AND year = EXTRACT(YEAR FROM NEW.start_date);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leave balance on approval
CREATE TRIGGER trigger_update_leave_balance_on_approval
    AFTER UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance_on_approval();

-- =============================================
-- DATA SEEDING
-- =============================================

-- Insert default leave types
INSERT INTO leave_types (name, description, default_balance, accrual_rate, max_balance, is_paid, requires_approval, color) VALUES
('Annual Leave', 'Regular annual vacation leave', 20.0, 1.67, 30.0, TRUE, TRUE, '#4CAF50'),
('Sick Leave', 'Medical and health-related leave', 10.0, 0.83, 15.0, TRUE, FALSE, '#FF9800'),
('Personal Leave', 'Personal and family matters', 5.0, 0.42, 10.0, FALSE, TRUE, '#2196F3'),
('Maternity Leave', 'Maternity and parental leave', 90.0, 0.0, 90.0, TRUE, TRUE, '#E91E63'),
('Bereavement Leave', 'Funeral and bereavement leave', 3.0, 0.0, 5.0, TRUE, FALSE, '#9C27B0'),
('Study Leave', 'Educational and training leave', 5.0, 0.0, 10.0, FALSE, TRUE, '#607D8B')
ON CONFLICT DO NOTHING;

-- Insert default work schedules
INSERT INTO work_schedules (user_id, schedule_type, start_time, end_time, break_duration, days_of_week, effective_from) VALUES
('00000000-0000-0000-0000-000000000001', 'regular', '09:00:00', '17:00:00', 60, '{1,2,3,4,5}', CURRENT_DATE),
('00000000-0000-0000-0000-000000000002', 'regular', '08:00:00', '16:00:00', 60, '{1,2,3,4,5}', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert default leave balances for current year
INSERT INTO leave_balances (user_id, leave_type_id, year, initial_balance, current_balance)
SELECT 
    '00000000-0000-0000-0000-000000000001' as user_id,
    lt.id as leave_type_id,
    EXTRACT(YEAR FROM CURRENT_DATE) as year,
    lt.default_balance as initial_balance,
    lt.default_balance as current_balance
FROM leave_types lt
WHERE lt.is_active = TRUE
ON CONFLICT DO NOTHING;

INSERT INTO leave_balances (user_id, leave_type_id, year, initial_balance, current_balance)
SELECT 
    '00000000-0000-0000-0000-000000000002' as user_id,
    lt.id as leave_type_id,
    EXTRACT(YEAR FROM CURRENT_DATE) as year,
    lt.default_balance as initial_balance,
    lt.default_balance as current_balance
FROM leave_types lt
WHERE lt.is_active = TRUE
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Attendance Summary View
CREATE VIEW v_attendance_summary AS
SELECT 
    ar.user_id,
    ar.date,
    ar.clock_in_time,
    ar.clock_out_time,
    ar.total_work_hours,
    ar.net_work_hours,
    ar.status,
    ws.start_time as scheduled_start,
    ws.end_time as scheduled_end,
    CASE 
        WHEN ar.clock_in_time::time > ws.start_time THEN 
            EXTRACT(EPOCH FROM (ar.clock_in_time::time - ws.start_time)) / 60
        ELSE 0 
    END as late_minutes
FROM attendance_records ar
LEFT JOIN work_schedules ws ON ar.user_id = ws.user_id 
    AND ar.date BETWEEN ws.effective_from AND COALESCE(ws.effective_until, '9999-12-31'::date)
    AND EXTRACT(DOW FROM ar.date) = ANY(ws.days_of_week)
WHERE ws.is_active = TRUE;

-- Leave Balance Summary View
CREATE VIEW v_leave_balance_summary AS
SELECT 
    lb.user_id,
    lt.name as leave_type_name,
    lt.color as leave_type_color,
    lb.year,
    lb.initial_balance,
    lb.accrued_balance,
    lb.used_balance,
    lb.current_balance,
    lt.max_balance,
    CASE 
        WHEN lt.max_balance IS NOT NULL AND lb.current_balance >= lt.max_balance THEN TRUE
        ELSE FALSE
    END as is_capped
FROM leave_balances lb
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lt.is_active = TRUE;

-- Overtime Summary View
CREATE VIEW v_overtime_summary AS
SELECT 
    or.user_id,
    or.date,
    or.total_hours,
    or.overtime_type,
    or.rate_multiplier,
    (or.total_hours * or.rate_multiplier) as effective_hours,
    or.status,
    ar.clock_in_time,
    ar.clock_out_time
FROM overtime_records or
LEFT JOIN attendance_records ar ON or.attendance_record_id = ar.id
ORDER BY or.date DESC;

-- =============================================
-- SECURITY POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on attendance records
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Policy for attendance records (users can only see their own records, managers can see team records)
CREATE POLICY attendance_records_access_policy ON attendance_records
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup old attendance records (older than 7 years)
CREATE OR REPLACE FUNCTION cleanup_old_attendance_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM attendance_records 
    WHERE date < CURRENT_DATE - INTERVAL '7 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old overtime records (older than 3 years)
CREATE OR REPLACE FUNCTION cleanup_old_overtime_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM overtime_records 
    WHERE date < CURRENT_DATE - INTERVAL '3 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to accrue leave balances monthly
CREATE OR REPLACE FUNCTION accrue_leave_balances()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    UPDATE leave_balances lb
    SET 
        accrued_balance = accrued_balance + lt.accrual_rate,
        current_balance = LEAST(
            lb.initial_balance + lb.accrued_balance + lt.accrual_rate - lb.used_balance,
            COALESCE(lt.max_balance, lb.initial_balance + lb.accrued_balance + lt.accrual_rate - lb.used_balance)
        ),
        updated_at = NOW()
    FROM leave_types lt
    WHERE lb.leave_type_id = lt.id 
      AND lb.year = current_year
      AND lt.accrual_rate > 0;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED CLEANUP (PostgreSQL Cron Extension)
-- =============================================

-- Note: These would be set up using pg_cron extension in production
-- SELECT cron.schedule('cleanup-old-attendance', '0 2 1 1 *', 'SELECT cleanup_old_attendance_records();');
-- SELECT cron.schedule('cleanup-old-overtime', '0 2 1 1 *', 'SELECT cleanup_old_overtime_records();');
-- SELECT cron.schedule('accrue-leave-balances', '0 0 1 * *', 'SELECT accrue_leave_balances();');

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
VALUES ('1.0.0', 'Initial Attendance Service schema with attendance tracking, schedules, leave management, and overtime');

-- =============================================
-- END OF ATTENDANCE SERVICE SCHEMA
-- ============================================= 