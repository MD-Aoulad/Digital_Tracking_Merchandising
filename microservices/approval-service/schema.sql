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
