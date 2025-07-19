-- =============================================
-- WORKPLACE SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- Enterprise-Grade Workplace Management System
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE WORKPLACE MANAGEMENT TABLES
-- =============================================

-- Core Workplaces Table
CREATE TABLE workplaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    workplace_type VARCHAR(100) NOT NULL, -- 'office', 'warehouse', 'retail_store', 'factory', 'distribution_center'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'maintenance', 'closed'
    parent_workplace_id UUID REFERENCES workplaces(id), -- For hierarchical structure
    address JSONB NOT NULL, -- {street, city, state, country, postal_code, lat, lng}
    contact_info JSONB, -- {phone, email, manager_name, manager_phone}
    operating_hours JSONB, -- {monday: {open: "09:00", close: "17:00"}, ...}
    capacity INTEGER, -- Maximum number of employees
    current_occupancy INTEGER DEFAULT 0,
    square_footage DECIMAL(10,2),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workplace Departments Table
CREATE TABLE workplace_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_code VARCHAR(50),
    manager_id UUID, -- Reference to user service
    parent_department_id UUID REFERENCES workplace_departments(id),
    floor_number INTEGER,
    room_number VARCHAR(50),
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workplace Assets Table
CREATE TABLE workplace_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    department_id UUID REFERENCES workplace_departments(id),
    asset_type VARCHAR(100) NOT NULL, -- 'equipment', 'furniture', 'technology', 'vehicle', 'machinery'
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    serial_number VARCHAR(255) UNIQUE,
    manufacturer VARCHAR(255),
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    current_value DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'operational', -- 'operational', 'maintenance', 'repair', 'retired', 'lost'
    location_details JSONB, -- {floor, room, section, coordinates}
    specifications JSONB, -- Technical specifications
    warranty_expiry DATE,
    assigned_to UUID, -- Reference to user service
    assigned_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Maintenance Table
CREATE TABLE workplace_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES workplace_assets(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'emergency', 'inspection'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    performed_by UUID, -- Reference to user service
    cost DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    notes TEXT,
    attachments JSONB, -- Array of maintenance reports, photos, etc.
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety Incidents Table
CREATE TABLE workplace_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    incident_type VARCHAR(100) NOT NULL, -- 'injury', 'near_miss', 'property_damage', 'security', 'environmental'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reported_by UUID NOT NULL, -- Reference to user service
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    incident_date TIMESTAMP WITH TIME ZONE,
    location_details JSONB, -- {floor, room, coordinates, description}
    involved_persons JSONB, -- Array of person IDs and roles
    injuries JSONB, -- Details of any injuries
    property_damage JSONB, -- Details of property damage
    root_cause TEXT,
    corrective_actions JSONB, -- Array of actions taken
    status VARCHAR(50) DEFAULT 'reported', -- 'reported', 'investigating', 'resolved', 'closed'
    assigned_investigator UUID, -- Reference to user service
    investigation_completed_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB, -- Photos, reports, witness statements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety Inspections Table
CREATE TABLE workplace_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    inspection_type VARCHAR(100) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'special'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    inspector_id UUID NOT NULL, -- Reference to user service
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    template_id UUID, -- Reference to inspection template
    findings JSONB, -- Inspection findings and results
    violations JSONB, -- Any violations found
    recommendations JSONB, -- Recommendations for improvement
    attachments JSONB, -- Photos, reports, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Templates Table
CREATE TABLE inspection_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    inspection_type VARCHAR(100) NOT NULL,
    category VARCHAR(100), -- 'safety', 'compliance', 'quality', 'maintenance'
    checklist_items JSONB NOT NULL, -- Array of checklist items
    required_fields JSONB, -- Required fields for the inspection
    estimated_duration INTEGER, -- Estimated duration in minutes
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID, -- Reference to user service
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workplace Zones Table
CREATE TABLE workplace_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workplace_id UUID NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    zone_type VARCHAR(100), -- 'production', 'storage', 'office', 'common', 'restricted'
    floor_number INTEGER,
    coordinates JSONB, -- Polygon coordinates for zone boundaries
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    safety_requirements JSONB, -- Safety requirements for the zone
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Workplaces Indexes
CREATE INDEX idx_workplaces_parent ON workplaces(parent_workplace_id);
CREATE INDEX idx_workplaces_type ON workplaces(workplace_type);
CREATE INDEX idx_workplaces_status ON workplaces(status);
CREATE INDEX idx_workplaces_active ON workplaces(is_active);
CREATE INDEX idx_workplaces_code ON workplaces(code);

-- Workplace Departments Indexes
CREATE INDEX idx_workplace_departments_workplace_id ON workplace_departments(workplace_id);
CREATE INDEX idx_workplace_departments_parent ON workplace_departments(parent_department_id);
CREATE INDEX idx_workplace_departments_manager ON workplace_departments(manager_id);
CREATE INDEX idx_workplace_departments_active ON workplace_departments(is_active);

-- Workplace Assets Indexes
CREATE INDEX idx_workplace_assets_workplace_id ON workplace_assets(workplace_id);
CREATE INDEX idx_workplace_assets_department_id ON workplace_assets(department_id);
CREATE INDEX idx_workplace_assets_type ON workplace_assets(asset_type);
CREATE INDEX idx_workplace_assets_status ON workplace_assets(status);
CREATE INDEX idx_workplace_assets_assigned_to ON workplace_assets(assigned_to);
CREATE INDEX idx_workplace_assets_serial_number ON workplace_assets(serial_number);
CREATE INDEX idx_workplace_assets_active ON workplace_assets(is_active);

-- Maintenance Indexes
CREATE INDEX idx_workplace_maintenance_asset_id ON workplace_maintenance(asset_id);
CREATE INDEX idx_workplace_maintenance_type ON workplace_maintenance(maintenance_type);
CREATE INDEX idx_workplace_maintenance_status ON workplace_maintenance(status);
CREATE INDEX idx_workplace_maintenance_scheduled_date ON workplace_maintenance(scheduled_date);
CREATE INDEX idx_workplace_maintenance_performed_by ON workplace_maintenance(performed_by);

-- Incidents Indexes
CREATE INDEX idx_workplace_incidents_workplace_id ON workplace_incidents(workplace_id);
CREATE INDEX idx_workplace_incidents_type ON workplace_incidents(incident_type);
CREATE INDEX idx_workplace_incidents_severity ON workplace_incidents(severity);
CREATE INDEX idx_workplace_incidents_status ON workplace_incidents(status);
CREATE INDEX idx_workplace_incidents_reported_by ON workplace_incidents(reported_by);
CREATE INDEX idx_workplace_incidents_incident_date ON workplace_incidents(incident_date);
CREATE INDEX idx_workplace_incidents_assigned_investigator ON workplace_incidents(assigned_investigator);

-- Inspections Indexes
CREATE INDEX idx_workplace_inspections_workplace_id ON workplace_inspections(workplace_id);
CREATE INDEX idx_workplace_inspections_type ON workplace_inspections(inspection_type);
CREATE INDEX idx_workplace_inspections_status ON workplace_inspections(status);
CREATE INDEX idx_workplace_inspections_inspector_id ON workplace_inspections(inspector_id);
CREATE INDEX idx_workplace_inspections_scheduled_date ON workplace_inspections(scheduled_date);
CREATE INDEX idx_workplace_inspections_template_id ON workplace_inspections(template_id);

-- Inspection Templates Indexes
CREATE INDEX idx_inspection_templates_type ON inspection_templates(inspection_type);
CREATE INDEX idx_inspection_templates_category ON inspection_templates(category);
CREATE INDEX idx_inspection_templates_active ON inspection_templates(is_active);
CREATE INDEX idx_inspection_templates_created_by ON inspection_templates(created_by);

-- Workplace Zones Indexes
CREATE INDEX idx_workplace_zones_workplace_id ON workplace_zones(workplace_id);
CREATE INDEX idx_workplace_zones_type ON workplace_zones(zone_type);
CREATE INDEX idx_workplace_zones_active ON workplace_zones(is_active);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_workplaces_updated_at
    BEFORE UPDATE ON workplaces
    FOR EACH ROW
    EXECUTE FUNCTION update_workplace_updated_at();

CREATE TRIGGER trigger_update_workplace_departments_updated_at
    BEFORE UPDATE ON workplace_departments
    FOR EACH ROW
    EXECUTE FUNCTION update_workplace_updated_at();

CREATE TRIGGER trigger_update_workplace_assets_updated_at
    BEFORE UPDATE ON workplace_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_workplace_updated_at();

CREATE TRIGGER trigger_update_workplace_maintenance_updated_at
    BEFORE UPDATE ON workplace_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_workplace_updated_at();

CREATE TRIGGER trigger_update_workplace_incidents_updated_at
    BEFORE UPDATE ON workplace_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_workplace_updated_at();

CREATE TRIGGER trigger_update_workplace_inspections_updated_at
    BEFORE UPDATE ON workplace_inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_workplace_updated_at();

CREATE TRIGGER trigger_update_inspection_templates_updated_at
    BEFORE UPDATE ON inspection_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_workplace_updated_at();

-- Function to calculate workplace hierarchy level
CREATE OR REPLACE FUNCTION get_workplace_hierarchy_level(p_workplace_id UUID)
RETURNS INTEGER AS $$
DECLARE
    level INTEGER := 0;
    current_workplace_id UUID := p_workplace_id;
BEGIN
    WHILE current_workplace_id IS NOT NULL LOOP
        SELECT parent_workplace_id INTO current_workplace_id
        FROM workplaces
        WHERE id = current_workplace_id;
        
        level := level + 1;
    END LOOP;
    
    RETURN level;
END;
$$ LANGUAGE plpgsql;

-- Function to get workplace hierarchy path
CREATE OR REPLACE FUNCTION get_workplace_hierarchy_path(p_workplace_id UUID)
RETURNS TABLE(workplace_id UUID, workplace_name VARCHAR(255), level INTEGER) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE workplace_hierarchy AS (
        -- Base case: the workplace itself
        SELECT 
            w.id as workplace_id,
            w.name as workplace_name,
            0 as level
        FROM workplaces w
        WHERE w.id = p_workplace_id
        
        UNION ALL
        
        -- Recursive case: parent workplaces
        SELECT 
            w.id as workplace_id,
            w.name as workplace_name,
            wh.level + 1 as level
        FROM workplaces w
        JOIN workplace_hierarchy wh ON w.id = wh.workplace_id
        WHERE w.parent_workplace_id IS NOT NULL
    )
    SELECT * FROM workplace_hierarchy
    ORDER BY level DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate asset depreciation
CREATE OR REPLACE FUNCTION calculate_asset_depreciation(p_asset_id UUID)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    asset_record RECORD;
    years_owned DECIMAL(5,2);
    depreciation_rate DECIMAL(5,4) := 0.20; -- 20% annual depreciation
    current_value DECIMAL(12,2);
BEGIN
    -- Get asset details
    SELECT * INTO asset_record FROM workplace_assets WHERE id = p_asset_id;
    
    IF asset_record.purchase_date IS NULL OR asset_record.purchase_cost IS NULL THEN
        RETURN asset_record.current_value;
    END IF;
    
    -- Calculate years owned
    years_owned := EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM asset_record.purchase_date);
    
    -- Calculate current value using straight-line depreciation
    current_value := asset_record.purchase_cost * POWER((1 - depreciation_rate), years_owned);
    
    -- Ensure value doesn't go below 0
    IF current_value < 0 THEN
        current_value := 0;
    END IF;
    
    -- Update asset current value
    UPDATE workplace_assets
    SET current_value = current_value
    WHERE id = p_asset_id;
    
    RETURN current_value;
END;
$$ LANGUAGE plpgsql;

-- Function to check if maintenance is overdue
CREATE OR REPLACE FUNCTION check_maintenance_overdue(p_asset_id UUID)
RETURNS TABLE(maintenance_id UUID, days_overdue INTEGER, priority VARCHAR(20)) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wm.id as maintenance_id,
        CURRENT_DATE - wm.scheduled_date as days_overdue,
        wm.priority
    FROM workplace_maintenance wm
    WHERE wm.asset_id = p_asset_id
      AND wm.status = 'scheduled'
      AND wm.scheduled_date < CURRENT_DATE
    ORDER BY days_overdue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate workplace occupancy
CREATE OR REPLACE FUNCTION calculate_workplace_occupancy(p_workplace_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_occupancy INTEGER;
BEGIN
    -- Calculate total occupancy from all zones
    SELECT COALESCE(SUM(current_occupancy), 0) INTO total_occupancy
    FROM workplace_zones
    WHERE workplace_id = p_workplace_id AND is_active = TRUE;
    
    -- Update workplace occupancy
    UPDATE workplaces
    SET current_occupancy = total_occupancy
    WHERE id = p_workplace_id;
    
    RETURN total_occupancy;
END;
$$ LANGUAGE plpgsql;

-- Function to get safety statistics
CREATE OR REPLACE FUNCTION get_safety_statistics(p_workplace_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    total_incidents INTEGER,
    injury_incidents INTEGER,
    near_miss_incidents INTEGER,
    property_damage_incidents INTEGER,
    days_since_last_incident INTEGER,
    incident_rate DECIMAL(10,4)
) AS $$
DECLARE
    total_incidents INTEGER;
    injury_incidents INTEGER;
    near_miss_incidents INTEGER;
    property_damage_incidents INTEGER;
    days_since_last_incident INTEGER;
    incident_rate DECIMAL(10,4);
    total_days INTEGER;
BEGIN
    -- Count incidents by type
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN incident_type = 'injury' THEN 1 END) as injuries,
        COUNT(CASE WHEN incident_type = 'near_miss' THEN 1 END) as near_misses,
        COUNT(CASE WHEN incident_type = 'property_damage' THEN 1 END) as property_damage
    INTO total_incidents, injury_incidents, near_miss_incidents, property_damage_incidents
    FROM workplace_incidents
    WHERE workplace_id = p_workplace_id
      AND incident_date >= p_start_date
      AND incident_date <= p_end_date;
    
    -- Calculate days since last incident
    SELECT COALESCE(CURRENT_DATE - MAX(incident_date), 0) INTO days_since_last_incident
    FROM workplace_incidents
    WHERE workplace_id = p_workplace_id;
    
    -- Calculate incident rate (incidents per 100,000 hours)
    total_days := p_end_date - p_start_date + 1;
    incident_rate := (total_incidents * 100000.0) / (total_days * 24.0);
    
    RETURN QUERY SELECT 
        total_incidents,
        injury_incidents,
        near_miss_incidents,
        property_damage_incidents,
        days_since_last_incident,
        incident_rate;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DATA SEEDING
-- =============================================

-- Insert default workplaces
INSERT INTO workplaces (name, code, description, workplace_type, address, contact_info, operating_hours, capacity) VALUES
('Main Office', 'HQ-001', 'Corporate headquarters and main office', 'office',
 '{"street": "123 Business Ave", "city": "New York", "state": "NY", "country": "USA", "postal_code": "10001", "lat": 40.7128, "lng": -74.0060}'::jsonb,
 '{"phone": "+1-555-0123", "email": "hq@company.com", "manager_name": "John Smith", "manager_phone": "+1-555-0124"}'::jsonb,
 '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}}'::jsonb,
 200),
('Warehouse Alpha', 'WH-001', 'Primary distribution warehouse', 'warehouse',
 '{"street": "456 Industrial Blvd", "city": "Chicago", "state": "IL", "country": "USA", "postal_code": "60601", "lat": 41.8781, "lng": -87.6298}'::jsonb,
 '{"phone": "+1-555-0125", "email": "warehouse@company.com", "manager_name": "Sarah Johnson", "manager_phone": "+1-555-0126"}'::jsonb,
 '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "18:00"}}'::jsonb,
 150)
ON CONFLICT DO NOTHING;

-- Insert default departments
INSERT INTO workplace_departments (workplace_id, name, description, department_code, floor_number) VALUES
((SELECT id FROM workplaces WHERE code = 'HQ-001'), 'IT Department', 'Information Technology Department', 'IT', 2),
((SELECT id FROM workplaces WHERE code = 'HQ-001'), 'HR Department', 'Human Resources Department', 'HR', 1),
((SELECT id FROM workplaces WHERE code = 'WH-001'), 'Shipping', 'Shipping and receiving department', 'SHIP', 1),
((SELECT id FROM workplaces WHERE code = 'WH-001'), 'Storage', 'Storage and inventory management', 'STOR', 1)
ON CONFLICT DO NOTHING;

-- Insert default inspection templates
INSERT INTO inspection_templates (name, description, inspection_type, category, checklist_items, estimated_duration) VALUES
('Daily Safety Walk', 'Daily safety inspection of workplace areas', 'daily', 'safety',
 '["Check emergency exits", "Inspect fire extinguishers", "Verify first aid kits", "Check for trip hazards", "Inspect lighting", "Check ventilation"]'::jsonb,
 30),
('Weekly Equipment Check', 'Weekly inspection of critical equipment', 'weekly', 'maintenance',
 '["Check equipment operation", "Inspect for wear and tear", "Verify safety guards", "Check fluid levels", "Test emergency stops"]'::jsonb,
 60),
('Monthly Compliance Audit', 'Monthly compliance and safety audit', 'monthly', 'compliance',
 '["Review safety procedures", "Check compliance documentation", "Inspect safety equipment", "Verify training records", "Check incident reports"]'::jsonb,
 120)
ON CONFLICT DO NOTHING;

-- Insert default workplace zones
INSERT INTO workplace_zones (workplace_id, name, description, zone_type, floor_number, capacity) VALUES
((SELECT id FROM workplaces WHERE code = 'HQ-001'), 'Main Lobby', 'Main entrance and reception area', 'common', 1, 50),
((SELECT id FROM workplaces WHERE code = 'HQ-001'), 'IT Server Room', 'Server room and IT equipment', 'restricted', 2, 10),
((SELECT id FROM workplaces WHERE code = 'WH-001'), 'Loading Dock', 'Loading and unloading area', 'production', 1, 30),
((SELECT id FROM workplaces WHERE code = 'WH-001'), 'Storage Area A', 'Primary storage area', 'storage', 1, 100)
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Workplace Summary View
CREATE VIEW v_workplace_summary AS
SELECT 
    w.id,
    w.name,
    w.code,
    w.workplace_type,
    w.status,
    w.capacity,
    w.current_occupancy,
    w.square_footage,
    COUNT(wd.id) as department_count,
    COUNT(wa.id) as asset_count,
    COUNT(CASE WHEN wa.status = 'operational' THEN 1 END) as operational_assets,
    COUNT(CASE WHEN wa.status = 'maintenance' THEN 1 END) as assets_in_maintenance
FROM workplaces w
LEFT JOIN workplace_departments wd ON w.id = wd.workplace_id AND wd.is_active = TRUE
LEFT JOIN workplace_assets wa ON w.id = wa.workplace_id AND wa.is_active = TRUE
GROUP BY w.id, w.name, w.code, w.workplace_type, w.status, w.capacity, w.current_occupancy, w.square_footage;

-- Asset Performance View
CREATE VIEW v_asset_performance AS
SELECT 
    wa.id,
    wa.name,
    wa.asset_type,
    wa.status,
    wa.purchase_date,
    wa.purchase_cost,
    wa.current_value,
    w.name as workplace_name,
    wd.name as department_name,
    COUNT(wm.id) as maintenance_count,
    COUNT(CASE WHEN wm.status = 'completed' THEN 1 END) as completed_maintenance,
    MAX(wm.completed_date) as last_maintenance_date,
    MIN(wm.scheduled_date) as next_scheduled_maintenance
FROM workplace_assets wa
LEFT JOIN workplaces w ON wa.workplace_id = w.id
LEFT JOIN workplace_departments wd ON wa.department_id = wd.id
LEFT JOIN workplace_maintenance wm ON wa.id = wm.asset_id
WHERE wa.is_active = TRUE
GROUP BY wa.id, wa.name, wa.asset_type, wa.status, wa.purchase_date, wa.purchase_cost, wa.current_value, w.name, wd.name;

-- Safety Performance View
CREATE VIEW v_safety_performance AS
SELECT 
    w.id as workplace_id,
    w.name as workplace_name,
    COUNT(wi.id) as total_incidents,
    COUNT(CASE WHEN wi.severity = 'critical' THEN 1 END) as critical_incidents,
    COUNT(CASE WHEN wi.severity = 'high' THEN 1 END) as high_severity_incidents,
    COUNT(CASE WHEN wi.incident_type = 'injury' THEN 1 END) as injury_incidents,
    COUNT(CASE WHEN wi.incident_type = 'near_miss' THEN 1 END) as near_miss_incidents,
    MAX(wi.incident_date) as last_incident_date,
    CURRENT_DATE - MAX(wi.incident_date) as days_since_last_incident
FROM workplaces w
LEFT JOIN workplace_incidents wi ON w.id = wi.workplace_id
WHERE w.is_active = TRUE
GROUP BY w.id, w.name;

-- Maintenance Schedule View
CREATE VIEW v_maintenance_schedule AS
SELECT 
    wm.id,
    wm.title,
    wm.maintenance_type,
    wm.scheduled_date,
    wm.status,
    wm.priority,
    wa.name as asset_name,
    wa.asset_type,
    w.name as workplace_name,
    wd.name as department_name,
    wm.performed_by,
    CASE 
        WHEN wm.scheduled_date < CURRENT_DATE AND wm.status = 'scheduled' THEN 'overdue'
        WHEN wm.scheduled_date = CURRENT_DATE AND wm.status = 'scheduled' THEN 'due_today'
        WHEN wm.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'due_this_week'
        ELSE 'scheduled'
    END as urgency
FROM workplace_maintenance wm
JOIN workplace_assets wa ON wm.asset_id = wa.id
JOIN workplaces w ON wa.workplace_id = w.id
LEFT JOIN workplace_departments wd ON wa.department_id = wd.id
WHERE wa.is_active = TRUE
ORDER BY wm.scheduled_date ASC;

-- =============================================
-- SECURITY POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on workplaces table
ALTER TABLE workplaces ENABLE ROW LEVEL SECURITY;

-- Policy for workplaces (users can see workplaces they have access to)
CREATE POLICY workplaces_access_policy ON workplaces
    FOR ALL
    USING (is_active = TRUE);

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup old incidents (older than 7 years)
CREATE OR REPLACE FUNCTION cleanup_old_incidents()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM workplace_incidents 
    WHERE incident_date < CURRENT_DATE - INTERVAL '7 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old maintenance records (older than 5 years)
CREATE OR REPLACE FUNCTION cleanup_old_maintenance_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM workplace_maintenance 
    WHERE completed_date < CURRENT_DATE - INTERVAL '5 years'
      AND status = 'completed';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update asset depreciation monthly
CREATE OR REPLACE FUNCTION update_asset_depreciation()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
    asset_record RECORD;
BEGIN
    FOR asset_record IN 
        SELECT id FROM workplace_assets 
        WHERE purchase_date IS NOT NULL AND is_active = TRUE
    LOOP
        PERFORM calculate_asset_depreciation(asset_record.id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED CLEANUP (PostgreSQL Cron Extension)
-- =============================================

-- Note: These would be set up using pg_cron extension in production
-- SELECT cron.schedule('cleanup-old-incidents', '0 2 1 1 *', 'SELECT cleanup_old_incidents();');
-- SELECT cron.schedule('cleanup-old-maintenance', '0 2 1 1 *', 'SELECT cleanup_old_maintenance_records();');
-- SELECT cron.schedule('update-asset-depreciation', '0 0 1 * *', 'SELECT update_asset_depreciation();');

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
VALUES ('1.0.0', 'Initial Workplace Service schema with comprehensive workplace management, asset tracking, maintenance, safety, and compliance');

-- =============================================
-- END OF WORKPLACE SERVICE SCHEMA
-- ============================================= 