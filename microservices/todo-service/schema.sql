-- =============================================
-- TODO SERVICE DATABASE SCHEMA
-- Digital Tracking Merchandising Platform
-- Enterprise-Grade Task Management System
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TASK MANAGEMENT TABLES
-- =============================================

-- Core Tasks Table
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled', 'on_hold'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    task_type VARCHAR(50) DEFAULT 'task', -- 'task', 'project', 'milestone', 'subtask'
    assigned_to UUID, -- Reference to user service
    assigned_by UUID, -- Reference to user service
    workplace_id UUID, -- Reference to workplace service
    due_date TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    progress_percentage INTEGER DEFAULT 0,
    tags TEXT[], -- Array of tags for categorization
    location JSONB, -- {lat, lng, address} for location-based tasks
    attachments JSONB, -- Array of file attachments
    custom_fields JSONB, -- Flexible custom field storage
    is_recurring BOOLEAN DEFAULT FALSE,
    parent_task_id UUID REFERENCES todos(id), -- For subtasks
    template_id UUID, -- Reference to task template
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Templates Table
CREATE TABLE todo_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'task',
    priority VARCHAR(20) DEFAULT 'medium',
    estimated_hours DECIMAL(5,2),
    checklist_items JSONB, -- Array of default checklist items
    required_fields JSONB, -- Array of required custom fields
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID, -- Reference to user service
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Dependencies Table
CREATE TABLE todo_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start', -- 'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'
    lag_days INTEGER DEFAULT 0, -- Days to wait after dependency completion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id)
);

-- Task Comments Table
CREATE TABLE todo_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Reference to user service
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes vs. visible comments
    parent_comment_id UUID REFERENCES todo_comments(id), -- For threaded comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Tracking Table
CREATE TABLE todo_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Reference to user service
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    description TEXT,
    billable BOOLEAN DEFAULT FALSE,
    hourly_rate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Checklist Items Table
CREATE TABLE todo_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by UUID, -- Reference to user service
    completed_at TIMESTAMP WITH TIME ZONE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Task Patterns Table
CREATE TABLE todo_recurring_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'custom'
    interval_value INTEGER DEFAULT 1, -- Every X days/weeks/months
    days_of_week INTEGER[], -- For weekly patterns: {1,2,3,4,5} for Mon-Fri
    day_of_month INTEGER, -- For monthly patterns: 1-31
    month_of_year INTEGER, -- For yearly patterns: 1-12
    end_date DATE, -- When to stop recurring
    max_occurrences INTEGER, -- Maximum number of occurrences
    current_occurrence INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Categories Table
CREATE TABLE todo_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    parent_category_id UUID REFERENCES todo_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task-Category Relationships Table
CREATE TABLE todo_task_categories (
    task_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES todo_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, category_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Todos Indexes
CREATE INDEX idx_todos_assigned_to ON todos(assigned_to);
CREATE INDEX idx_todos_assigned_by ON todos(assigned_by);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_todos_workplace_id ON todos(workplace_id);
CREATE INDEX idx_todos_parent_task_id ON todos(parent_task_id);
CREATE INDEX idx_todos_template_id ON todos(template_id);
CREATE INDEX idx_todos_created_at ON todos(created_at);
CREATE INDEX idx_todos_completed_at ON todos(completed_at);
CREATE INDEX idx_todos_status_priority ON todos(status, priority);
CREATE INDEX idx_todos_assigned_status ON todos(assigned_to, status);

-- Task Templates Indexes
CREATE INDEX idx_todo_templates_active ON todo_templates(is_active);
CREATE INDEX idx_todo_templates_task_type ON todo_templates(task_type);
CREATE INDEX idx_todo_templates_created_by ON todo_templates(created_by);

-- Task Dependencies Indexes
CREATE INDEX idx_todo_dependencies_task_id ON todo_dependencies(task_id);
CREATE INDEX idx_todo_dependencies_depends_on ON todo_dependencies(depends_on_task_id);

-- Task Comments Indexes
CREATE INDEX idx_todo_comments_task_id ON todo_comments(task_id);
CREATE INDEX idx_todo_comments_user_id ON todo_comments(user_id);
CREATE INDEX idx_todo_comments_created_at ON todo_comments(created_at);
CREATE INDEX idx_todo_comments_parent ON todo_comments(parent_comment_id);

-- Time Tracking Indexes
CREATE INDEX idx_todo_time_entries_task_id ON todo_time_entries(task_id);
CREATE INDEX idx_todo_time_entries_user_id ON todo_time_entries(user_id);
CREATE INDEX idx_todo_time_entries_start_time ON todo_time_entries(start_time);
CREATE INDEX idx_todo_time_entries_status ON todo_time_entries(status);

-- Checklist Items Indexes
CREATE INDEX idx_todo_checklist_items_task_id ON todo_checklist_items(task_id);
CREATE INDEX idx_todo_checklist_items_completed ON todo_checklist_items(is_completed);
CREATE INDEX idx_todo_checklist_items_order ON todo_checklist_items(task_id, order_index);

-- Recurring Patterns Indexes
CREATE INDEX idx_todo_recurring_patterns_task_id ON todo_recurring_patterns(task_id);
CREATE INDEX idx_todo_recurring_patterns_active ON todo_recurring_patterns(is_active);

-- Categories Indexes
CREATE INDEX idx_todo_categories_parent ON todo_categories(parent_category_id);
CREATE INDEX idx_todo_categories_active ON todo_categories(is_active);

-- Task-Category Relationships Indexes
CREATE INDEX idx_todo_task_categories_task_id ON todo_task_categories(task_id);
CREATE INDEX idx_todo_task_categories_category_id ON todo_task_categories(category_id);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_todo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_todo_updated_at();

CREATE TRIGGER trigger_update_todo_templates_updated_at
    BEFORE UPDATE ON todo_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_todo_updated_at();

CREATE TRIGGER trigger_update_todo_comments_updated_at
    BEFORE UPDATE ON todo_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_todo_updated_at();

CREATE TRIGGER trigger_update_todo_time_entries_updated_at
    BEFORE UPDATE ON todo_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_todo_updated_at();

CREATE TRIGGER trigger_update_todo_checklist_items_updated_at
    BEFORE UPDATE ON todo_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_todo_updated_at();

-- Function to calculate task progress based on checklist completion
CREATE OR REPLACE FUNCTION calculate_task_progress(p_task_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Count total checklist items
    SELECT COUNT(*) INTO total_items
    FROM todo_checklist_items
    WHERE task_id = p_task_id;
    
    -- Count completed checklist items
    SELECT COUNT(*) INTO completed_items
    FROM todo_checklist_items
    WHERE task_id = p_task_id AND is_completed = TRUE;
    
    -- Calculate percentage
    IF total_items > 0 THEN
        progress_percentage := (completed_items * 100) / total_items;
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Update task progress
    UPDATE todos
    SET progress_percentage = progress_percentage
    WHERE id = p_task_id;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to check task dependencies
CREATE OR REPLACE FUNCTION check_task_dependencies(p_task_id UUID)
RETURNS TABLE(dependency_id UUID, depends_on_task_id UUID, dependency_type VARCHAR(50), is_ready BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        td.id as dependency_id,
        td.depends_on_task_id,
        td.dependency_type,
        CASE 
            WHEN t.status = 'completed' THEN TRUE
            ELSE FALSE
        END as is_ready
    FROM todo_dependencies td
    JOIN todos t ON td.depends_on_task_id = t.id
    WHERE td.task_id = p_task_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total time spent on task
CREATE OR REPLACE FUNCTION calculate_task_total_time(p_task_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_minutes INTEGER;
    total_hours DECIMAL(10,2);
BEGIN
    -- Calculate total minutes from time entries
    SELECT COALESCE(SUM(duration_minutes), 0) INTO total_minutes
    FROM todo_time_entries
    WHERE task_id = p_task_id AND status = 'completed';
    
    -- Convert to hours
    total_hours := total_minutes / 60.0;
    
    -- Update task actual hours
    UPDATE todos
    SET actual_hours = total_hours
    WHERE id = p_task_id;
    
    RETURN total_hours;
END;
$$ LANGUAGE plpgsql;

-- Function to create recurring task instances
CREATE OR REPLACE FUNCTION create_recurring_task_instance(p_task_id UUID)
RETURNS UUID AS $$
DECLARE
    task_record RECORD;
    pattern_record RECORD;
    new_task_id UUID;
    next_due_date DATE;
BEGIN
    -- Get task details
    SELECT * INTO task_record FROM todos WHERE id = p_task_id;
    
    -- Get recurring pattern
    SELECT * INTO pattern_record FROM todo_recurring_patterns WHERE task_id = p_task_id AND is_active = TRUE;
    
    IF pattern_record IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calculate next due date based on pattern
    CASE pattern_record.pattern_type
        WHEN 'daily' THEN
            next_due_date := COALESCE(task_record.due_date, CURRENT_DATE) + (pattern_record.interval_value || ' days')::interval;
        WHEN 'weekly' THEN
            next_due_date := COALESCE(task_record.due_date, CURRENT_DATE) + (pattern_record.interval_value || ' weeks')::interval;
        WHEN 'monthly' THEN
            next_due_date := COALESCE(task_record.due_date, CURRENT_DATE) + (pattern_record.interval_value || ' months')::interval;
        WHEN 'yearly' THEN
            next_due_date := COALESCE(task_record.due_date, CURRENT_DATE) + (pattern_record.interval_value || ' years')::interval;
        ELSE
            RETURN NULL;
    END CASE;
    
    -- Check if we've reached the end date or max occurrences
    IF (pattern_record.end_date IS NOT NULL AND next_due_date > pattern_record.end_date) OR
       (pattern_record.max_occurrences IS NOT NULL AND pattern_record.current_occurrence >= pattern_record.max_occurrences) THEN
        RETURN NULL;
    END IF;
    
    -- Create new task instance
    INSERT INTO todos (
        title, description, status, priority, task_type, assigned_to, assigned_by,
        workplace_id, due_date, estimated_hours, tags, location, attachments,
        custom_fields, is_recurring, parent_task_id, template_id
    ) VALUES (
        task_record.title, task_record.description, 'pending', task_record.priority,
        task_record.task_type, task_record.assigned_to, task_record.assigned_by,
        task_record.workplace_id, next_due_date, task_record.estimated_hours,
        task_record.tags, task_record.location, task_record.attachments,
        task_record.custom_fields, TRUE, task_record.parent_task_id, task_record.template_id
    ) RETURNING id INTO new_task_id;
    
    -- Update occurrence count
    UPDATE todo_recurring_patterns
    SET current_occurrence = current_occurrence + 1
    WHERE id = pattern_record.id;
    
    RETURN new_task_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress when checklist item is completed
CREATE OR REPLACE FUNCTION update_task_progress_on_checklist_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate progress when checklist item status changes
    PERFORM calculate_task_progress(COALESCE(NEW.task_id, OLD.task_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_progress_on_checklist_change
    AFTER INSERT OR UPDATE OR DELETE ON todo_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_task_progress_on_checklist_change();

-- Trigger to update actual hours when time entry is completed
CREATE OR REPLACE FUNCTION update_task_hours_on_time_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate total time when time entry status changes to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        PERFORM calculate_task_total_time(NEW.task_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_hours_on_time_entry
    AFTER UPDATE ON todo_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_task_hours_on_time_entry();

-- =============================================
-- DATA SEEDING
-- =============================================

-- Insert default task categories
INSERT INTO todo_categories (name, description, color, icon) VALUES
('General', 'General tasks and activities', '#2196F3', 'task'),
('Maintenance', 'Equipment and facility maintenance', '#FF9800', 'wrench'),
('Safety', 'Safety inspections and compliance', '#F44336', 'shield'),
('Training', 'Employee training and development', '#4CAF50', 'graduation-cap'),
('Inventory', 'Inventory management and stock control', '#9C27B0', 'package'),
('Customer Service', 'Customer support and service tasks', '#00BCD4', 'users'),
('Quality Control', 'Quality assurance and control tasks', '#795548', 'check-circle'),
('Administrative', 'Administrative and paperwork tasks', '#607D8B', 'file-text')
ON CONFLICT DO NOTHING;

-- Insert default task templates
INSERT INTO todo_templates (name, description, task_type, priority, estimated_hours, checklist_items, tags) VALUES
('Daily Safety Check', 'Perform daily safety inspection of assigned area', 'task', 'high', 0.5, 
 '["Check emergency exits", "Inspect fire extinguishers", "Verify first aid kit", "Check for hazards"]'::jsonb,
 '{"safety", "daily", "inspection"}'::text[]),
('Equipment Maintenance', 'Perform routine maintenance on equipment', 'task', 'medium', 2.0,
 '["Clean equipment", "Check for wear and tear", "Lubricate moving parts", "Test functionality", "Update maintenance log"]'::jsonb,
 '{"maintenance", "equipment", "routine"}'::text[]),
('Inventory Count', 'Conduct inventory count for assigned section', 'task', 'medium', 1.5,
 '["Count items", "Check expiration dates", "Update inventory system", "Report discrepancies"]'::jsonb,
 '{"inventory", "counting", "stock"}'::text[]),
('Customer Training', 'Train customer on new product features', 'task', 'medium', 1.0,
 '["Prepare training materials", "Conduct training session", "Answer questions", "Provide documentation", "Follow up"]'::jsonb,
 '{"training", "customer", "education"}'::text[])
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO todos (title, description, status, priority, assigned_to, due_date, estimated_hours, tags) VALUES
('Complete Safety Training Module', 'Complete the quarterly safety training module', 'pending', 'high', 
 '00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '7 days', 2.0, '{"training", "safety"}'::text[]),
('Inventory Audit - Electronics Section', 'Conduct monthly inventory audit for electronics section', 'in_progress', 'medium',
 '00000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '3 days', 4.0, '{"inventory", "audit"}'::text[]),
('Equipment Maintenance - Checkout System', 'Perform routine maintenance on checkout system', 'pending', 'medium',
 '00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '1 day', 1.5, '{"maintenance", "equipment"}'::text[])
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Task Summary View
CREATE VIEW v_task_summary AS
SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    t.task_type,
    t.assigned_to,
    t.due_date,
    t.estimated_hours,
    t.actual_hours,
    t.progress_percentage,
    t.created_at,
    t.completed_at,
    COUNT(tc.id) as comment_count,
    COUNT(tci.id) as checklist_item_count,
    COUNT(CASE WHEN tci.is_completed = TRUE THEN 1 END) as completed_checklist_items,
    COUNT(tt.id) as time_entry_count,
    COALESCE(SUM(tt.duration_minutes), 0) as total_time_minutes
FROM todos t
LEFT JOIN todo_comments tc ON t.id = tc.task_id
LEFT JOIN todo_checklist_items tci ON t.id = tci.task_id
LEFT JOIN todo_time_entries tt ON t.id = tt.task_id AND tt.status = 'completed'
GROUP BY t.id, t.title, t.status, t.priority, t.task_type, t.assigned_to, t.due_date,
         t.estimated_hours, t.actual_hours, t.progress_percentage, t.created_at, t.completed_at;

-- Task Performance Analytics View
CREATE VIEW v_task_performance_analytics AS
SELECT 
    DATE_TRUNC('week', t.created_at) as week_start,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 END) as overdue_tasks,
    AVG(t.estimated_hours) as avg_estimated_hours,
    AVG(t.actual_hours) as avg_actual_hours,
    AVG(t.progress_percentage) as avg_progress_percentage
FROM todos t
WHERE t.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', t.created_at)
ORDER BY week_start DESC;

-- Time Tracking Summary View
CREATE VIEW v_time_tracking_summary AS
SELECT 
    t.id as task_id,
    t.title as task_title,
    t.assigned_to,
    DATE_TRUNC('day', tte.start_time) as work_date,
    COUNT(tte.id) as time_entries,
    SUM(tte.duration_minutes) as total_minutes,
    SUM(tte.duration_minutes) / 60.0 as total_hours,
    SUM(CASE WHEN tte.billable = TRUE THEN tte.duration_minutes * COALESCE(tte.hourly_rate, 0) / 60 ELSE 0 END) as billable_amount
FROM todos t
JOIN todo_time_entries tte ON t.id = tte.task_id
WHERE tte.status = 'completed'
GROUP BY t.id, t.title, t.assigned_to, DATE_TRUNC('day', tte.start_time)
ORDER BY work_date DESC, total_hours DESC;

-- =============================================
-- SECURITY POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on todos table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policy for todos (users can see tasks assigned to them or tasks they created)
CREATE POLICY todos_access_policy ON todos
    FOR ALL
    USING (assigned_to = current_setting('app.current_user_id')::UUID OR 
           assigned_by = current_setting('app.current_user_id')::UUID);

-- =============================================
-- CLEANUP FUNCTIONS
-- =============================================

-- Function to cleanup old completed tasks (older than 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_completed_tasks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM todos 
    WHERE status = 'completed' 
      AND completed_at < CURRENT_DATE - INTERVAL '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old time entries (older than 3 years)
CREATE OR REPLACE FUNCTION cleanup_old_time_entries()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM todo_time_entries 
    WHERE start_time < CURRENT_DATE - INTERVAL '3 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old comments (older than 1 year)
CREATE OR REPLACE FUNCTION archive_old_comments()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- In a real implementation, this would move data to an archive table
    -- For now, we'll just mark them as internal
    UPDATE todo_comments
    SET is_internal = TRUE
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year'
      AND is_internal = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED CLEANUP (PostgreSQL Cron Extension)
-- =============================================

-- Note: These would be set up using pg_cron extension in production
-- SELECT cron.schedule('cleanup-old-completed-tasks', '0 2 1 1 *', 'SELECT cleanup_old_completed_tasks();');
-- SELECT cron.schedule('cleanup-old-time-entries', '0 2 1 1 *', 'SELECT cleanup_old_time_entries();');
-- SELECT cron.schedule('archive-old-comments', '0 2 1 * *', 'SELECT archive_old_comments();');

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
VALUES ('1.0.0', 'Initial Todo Service schema with comprehensive task management, templates, dependencies, time tracking, and analytics');

-- =============================================
-- END OF TODO SERVICE SCHEMA
-- ============================================= 