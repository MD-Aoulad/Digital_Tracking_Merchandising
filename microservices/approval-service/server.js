const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3007;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Database connection
const pool = new Pool({
  connectionString: process.env.APPROVAL_DB_URL || 'postgresql://approval_user:approval_password@approval-db:5432/approval_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  min: 2,
  idleTimeoutMillis: 60000
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// JWT verification middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1 as test');
    client.release();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = error.message;
  }
  
  res.json({
    status: 'OK',
    service: 'Approval System',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      error: dbError
    }
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'Approval System Service',
    version: '1.0.0',
    description: 'Multi-step approval workflows for Workforce Management Platform',
    endpoints: {
      'GET /health': 'Service health check',
      'POST /approval/workflows': 'Create approval workflow (Admin)',
      'GET /approval/workflows': 'Get approval workflows',
      'GET /approval/workflows/:id': 'Get workflow details',
      'PUT /approval/workflows/:id': 'Update workflow (Admin)',
      'DELETE /approval/workflows/:id': 'Delete workflow (Admin)',
      'POST /approval/requests': 'Create approval request',
      'GET /approval/requests': 'Get approval requests',
      'GET /approval/requests/:id': 'Get request details',
      'PUT /approval/requests/:id': 'Update request',
      'POST /approval/requests/:id/approve': 'Approve request',
      'POST /approval/requests/:id/reject': 'Reject request',
      'POST /approval/requests/:id/return': 'Return request for revision',
      'GET /approval/requests/pending': 'Get pending requests',
      'GET /approval/requests/assigned': 'Get assigned requests',
      'GET /approval/requests/created': 'Get created requests',
      'GET /approval/requests/stats': 'Get request statistics',
      'POST /approval/delegations': 'Create approval delegation',
      'GET /approval/delegations': 'Get delegations',
      'PUT /approval/delegations/:id': 'Update delegation',
      'DELETE /approval/delegations/:id': 'Delete delegation',
      'GET /approval/templates': 'Get approval templates',
      'POST /approval/templates': 'Create template (Admin)',
      'PUT /approval/templates/:id': 'Update template (Admin)',
      'DELETE /approval/templates/:id': 'Delete template (Admin)'
    }
  });
});

// Complete Approval Management API Endpoints

// 1. CREATE APPROVAL WORKFLOW (Admin only)
app.post('/approval/workflows', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      steps, 
      isActive = true,
      autoApprove = false,
      maxDuration = null 
    } = req.body;
    
    if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ 
        error: 'Name and steps array are required' 
      });
    }
    
    // Validate steps structure
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.name || !step.approverRole || !step.order) {
        return res.status(400).json({ 
          error: `Step ${i + 1} must have name, approverRole, and order` 
        });
      }
    }
    
    const result = await pool.query(
      `INSERT INTO approval_workflows (
        name, 
        description, 
        steps, 
        is_active,
        auto_approve,
        max_duration,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, name, description, steps, is_active`,
      [
        name,
        description || null,
        JSON.stringify(steps),
        isActive,
        autoApprove,
        maxDuration,
        req.user.id
      ]
    );
    
    res.status(201).json({
      message: 'Approval workflow created successfully',
      workflow: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ 
      error: 'Failed to create approval workflow',
      details: error.message 
    });
  }
});

// 2. GET APPROVAL WORKFLOWS
app.get('/approval/workflows', verifyToken, async (req, res) => {
  try {
    const { active = true, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        id,
        name,
        description,
        steps,
        is_active,
        auto_approve,
        max_duration,
        created_by,
        created_at,
        updated_at
      FROM approval_workflows
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (active === 'true') {
      query += ` AND is_active = true`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM approval_workflows';
    if (active === 'true') {
      countQuery += ' WHERE is_active = true';
    }
    
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      workflows: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ 
      error: 'Failed to get approval workflows',
      details: error.message 
    });
  }
});

// 3. GET WORKFLOW DETAILS
app.get('/approval/workflows/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        id,
        name,
        description,
        steps,
        is_active,
        auto_approve,
        max_duration,
        created_by,
        created_at,
        updated_at
      FROM approval_workflows 
      WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({
      workflow: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ 
      error: 'Failed to get workflow',
      details: error.message 
    });
  }
});

// 4. UPDATE WORKFLOW (Admin only)
app.put('/approval/workflows/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      steps, 
      isActive,
      autoApprove,
      maxDuration 
    } = req.body;
    
    // Check if workflow exists
    const existingResult = await pool.query(
      'SELECT id FROM approval_workflows WHERE id = $1',
      [id]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (name) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    
    if (steps) {
      updateFields.push(`steps = $${paramCount++}`);
      updateValues.push(JSON.stringify(steps));
    }
    
    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(isActive);
    }
    
    if (autoApprove !== undefined) {
      updateFields.push(`auto_approve = $${paramCount++}`);
      updateValues.push(autoApprove);
    }
    
    if (maxDuration !== undefined) {
      updateFields.push(`max_duration = $${paramCount++}`);
      updateValues.push(maxDuration);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update' 
      });
    }
    
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);
    
    const result = await pool.query(
      `UPDATE approval_workflows SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );
    
    res.json({
      message: 'Workflow updated successfully',
      workflow: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ 
      error: 'Failed to update workflow',
      details: error.message 
    });
  }
});

// 5. DELETE WORKFLOW (Admin only)
app.delete('/approval/workflows/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if workflow has active requests
    const requestsResult = await pool.query(
      'SELECT COUNT(*) as count FROM approval_requests WHERE workflow_id = $1 AND status IN (\'pending\', \'in_progress\')',
      [id]
    );
    
    if (parseInt(requestsResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete workflow with active requests' 
      });
    }
    
    await pool.query('DELETE FROM approval_workflows WHERE id = $1', [id]);
    
    res.json({
      message: 'Workflow deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ 
      error: 'Failed to delete workflow',
      details: error.message 
    });
  }
});

// 6. CREATE APPROVAL REQUEST
app.post('/approval/requests', verifyToken, async (req, res) => {
  try {
    const { 
      workflowId, 
      title, 
      description, 
      requestType,
      priority = 'medium',
      dueDate,
      attachments,
      metadata 
    } = req.body;
    
    if (!workflowId || !title || !requestType) {
      return res.status(400).json({ 
        error: 'Workflow ID, title, and request type are required' 
      });
    }
    
    // Verify workflow exists and is active
    const workflowResult = await pool.query(
      'SELECT id, steps, auto_approve FROM approval_workflows WHERE id = $1 AND is_active = true',
      [workflowId]
    );
    
    if (workflowResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid workflow or workflow is inactive' 
      });
    }
    
    const workflow = workflowResult.rows[0];
    const steps = JSON.parse(workflow.steps);
    
    // Determine initial status
    let status = 'pending';
    let currentStep = 1;
    let currentApprover = null;
    
    if (workflow.auto_approve && steps.length === 0) {
      status = 'approved';
      currentStep = null;
    } else if (steps.length > 0) {
      currentApprover = steps[0].approverRole;
    }
    
    const result = await pool.query(
      `INSERT INTO approval_requests (
        workflow_id,
        requester_id,
        title,
        description,
        request_type,
        priority,
        due_date,
        attachments,
        metadata,
        status,
        current_step,
        current_approver,
        steps_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING id, title, status, current_step, current_approver`,
      [
        workflowId,
        req.user.id,
        title,
        description || null,
        requestType,
        priority,
        dueDate || null,
        attachments ? JSON.stringify(attachments) : null,
        metadata ? JSON.stringify(metadata) : null,
        status,
        currentStep,
        currentApprover,
        JSON.stringify(steps)
      ]
    );
    
    const request = result.rows[0];
    
    res.status(201).json({
      message: 'Approval request created successfully',
      request: {
        id: request.id,
        title: request.title,
        status: request.status,
        currentStep: request.current_step,
        currentApprover: request.current_approver
      }
    });
    
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ 
      error: 'Failed to create approval request',
      details: error.message 
    });
  }
});

// 7. GET APPROVAL REQUESTS
app.get('/approval/requests', verifyToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      requestType,
      priority,
      startDate,
      endDate 
    } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        ar.id,
        ar.title,
        ar.description,
        ar.request_type,
        ar.priority,
        ar.status,
        ar.current_step,
        ar.current_approver,
        ar.due_date,
        ar.created_at,
        ar.updated_at,
        aw.name as workflow_name,
        u.first_name,
        u.last_name,
        u.email
      FROM approval_requests ar
      LEFT JOIN approval_workflows aw ON ar.workflow_id = aw.id
      LEFT JOIN users u ON ar.requester_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add filters
    if (status) {
      query += ` AND ar.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (requestType) {
      query += ` AND ar.request_type = $${paramCount++}`;
      queryParams.push(requestType);
    }
    
    if (priority) {
      query += ` AND ar.priority = $${paramCount++}`;
      queryParams.push(priority);
    }
    
    if (startDate) {
      query += ` AND DATE(ar.created_at) >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND DATE(ar.created_at) <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    // Add pagination
    query += ` ORDER BY ar.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM approval_requests ar WHERE 1=1';
    const countParams = [];
    paramCount = 1;
    
    if (status) {
      countQuery += ` AND ar.status = $${paramCount++}`;
      countParams.push(status);
    }
    
    if (requestType) {
      countQuery += ` AND ar.request_type = $${paramCount++}`;
      countParams.push(requestType);
    }
    
    if (priority) {
      countQuery += ` AND ar.priority = $${paramCount++}`;
      countParams.push(priority);
    }
    
    if (startDate) {
      countQuery += ` AND DATE(ar.created_at) >= $${paramCount++}`;
      countParams.push(startDate);
    }
    
    if (endDate) {
      countQuery += ` AND DATE(ar.created_at) <= $${paramCount++}`;
      countParams.push(endDate);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ 
      error: 'Failed to get approval requests',
      details: error.message 
    });
  }
});

// 8. GET REQUEST DETAILS
app.get('/approval/requests/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        ar.*,
        aw.name as workflow_name,
        aw.steps as workflow_steps,
        u.first_name,
        u.last_name,
        u.email
      FROM approval_requests ar
      LEFT JOIN approval_workflows aw ON ar.workflow_id = aw.id
      LEFT JOIN users u ON ar.requester_id = u.id
      WHERE ar.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = result.rows[0];
    
    // Get approval history
    const historyResult = await pool.query(
      `SELECT 
        ah.*,
        u.first_name,
        u.last_name,
        u.email
      FROM approval_history ah
      LEFT JOIN users u ON ah.approver_id = u.id
      WHERE ah.request_id = $1
      ORDER BY ah.created_at ASC`,
      [id]
    );
    
    res.json({
      request: {
        ...request,
        attachments: request.attachments ? JSON.parse(request.attachments) : null,
        metadata: request.metadata ? JSON.parse(request.metadata) : null,
        stepsData: request.steps_data ? JSON.parse(request.steps_data) : null,
        workflowSteps: request.workflow_steps ? JSON.parse(request.workflow_steps) : null
      },
      history: historyResult.rows
    });
    
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ 
      error: 'Failed to get request',
      details: error.message 
    });
  }
});

// 9. APPROVE REQUEST
app.post('/approval/requests/:id/approve', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, nextStep } = req.body;
    
    // Get request details
    const requestResult = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [id]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = requestResult.rows[0];
    
    // Check if user can approve this request
    if (request.status !== 'pending' && request.status !== 'in_progress') {
      return res.status(400).json({ 
        error: 'Request cannot be approved in current status' 
      });
    }
    
    const stepsData = JSON.parse(request.steps_data);
    const currentStepData = stepsData[request.current_step - 1];
    
    if (currentStepData.approverRole !== req.user.role) {
      return res.status(403).json({ 
        error: 'You are not authorized to approve this request' 
      });
    }
    
    // Determine next status
    let newStatus = request.status;
    let newCurrentStep = request.current_step;
    let newCurrentApprover = request.current_approver;
    
    if (request.current_step >= stepsData.length) {
      // Last step - request is approved
      newStatus = 'approved';
      newCurrentStep = null;
      newCurrentApprover = null;
    } else {
      // Move to next step
      newStatus = 'in_progress';
      newCurrentStep = request.current_step + 1;
      newCurrentApprover = stepsData[newCurrentStep - 1].approverRole;
    }
    
    // Update request
    await pool.query(
      `UPDATE approval_requests SET 
        status = $1,
        current_step = $2,
        current_approver = $3,
        updated_at = NOW()
      WHERE id = $4`,
      [newStatus, newCurrentStep, newCurrentApprover, id]
    );
    
    // Add to approval history
    await pool.query(
      `INSERT INTO approval_history (
        request_id,
        approver_id,
        action,
        comments,
        step_number
      ) VALUES ($1, $2, $3, $4, $5)`,
      [id, req.user.id, 'approved', comments || null, request.current_step]
    );
    
    res.json({
      message: 'Request approved successfully',
      request: {
        id: request.id,
        status: newStatus,
        currentStep: newCurrentStep,
        currentApprover: newCurrentApprover
      }
    });
    
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ 
      error: 'Failed to approve request',
      details: error.message 
    });
  }
});

// 10. REJECT REQUEST
app.post('/approval/requests/:id/reject', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    
    if (!comments) {
      return res.status(400).json({ 
        error: 'Comments are required for rejection' 
      });
    }
    
    // Get request details
    const requestResult = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [id]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = requestResult.rows[0];
    
    // Check if user can reject this request
    if (request.status !== 'pending' && request.status !== 'in_progress') {
      return res.status(400).json({ 
        error: 'Request cannot be rejected in current status' 
      });
    }
    
    const stepsData = JSON.parse(request.steps_data);
    const currentStepData = stepsData[request.current_step - 1];
    
    if (currentStepData.approverRole !== req.user.role) {
      return res.status(403).json({ 
        error: 'You are not authorized to reject this request' 
      });
    }
    
    // Update request status
    await pool.query(
      `UPDATE approval_requests SET 
        status = 'rejected',
        current_step = null,
        current_approver = null,
        updated_at = NOW()
      WHERE id = $1`,
      [id]
    );
    
    // Add to approval history
    await pool.query(
      `INSERT INTO approval_history (
        request_id,
        approver_id,
        action,
        comments,
        step_number
      ) VALUES ($1, $2, $3, $4, $5)`,
      [id, req.user.id, 'rejected', comments, request.current_step]
    );
    
    res.json({
      message: 'Request rejected successfully',
      request: {
        id: request.id,
        status: 'rejected'
      }
    });
    
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ 
      error: 'Failed to reject request',
      details: error.message 
    });
  }
});

// 11. RETURN REQUEST FOR REVISION
app.post('/approval/requests/:id/return', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    
    if (!comments) {
      return res.status(400).json({ 
        error: 'Comments are required for return' 
      });
    }
    
    // Get request details
    const requestResult = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [id]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = requestResult.rows[0];
    
    // Check if user can return this request
    if (request.status !== 'pending' && request.status !== 'in_progress') {
      return res.status(400).json({ 
        error: 'Request cannot be returned in current status' 
      });
    }
    
    const stepsData = JSON.parse(request.steps_data);
    const currentStepData = stepsData[request.current_step - 1];
    
    if (currentStepData.approverRole !== req.user.role) {
      return res.status(403).json({ 
        error: 'You are not authorized to return this request' 
      });
    }
    
    // Update request status
    await pool.query(
      `UPDATE approval_requests SET 
        status = 'returned',
        current_step = null,
        current_approver = null,
        updated_at = NOW()
      WHERE id = $1`,
      [id]
    );
    
    // Add to approval history
    await pool.query(
      `INSERT INTO approval_history (
        request_id,
        approver_id,
        action,
        comments,
        step_number
      ) VALUES ($1, $2, $3, $4, $5)`,
      [id, req.user.id, 'returned', comments, request.current_step]
    );
    
    res.json({
      message: 'Request returned for revision successfully',
      request: {
        id: request.id,
        status: 'returned'
      }
    });
    
  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({ 
      error: 'Failed to return request',
      details: error.message 
    });
  }
});

// 12. GET PENDING REQUESTS
app.get('/approval/requests/pending', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT 
        ar.id,
        ar.title,
        ar.description,
        ar.request_type,
        ar.priority,
        ar.status,
        ar.current_step,
        ar.current_approver,
        ar.due_date,
        ar.created_at,
        aw.name as workflow_name,
        u.first_name,
        u.last_name,
        u.email
      FROM approval_requests ar
      LEFT JOIN approval_workflows aw ON ar.workflow_id = aw.id
      LEFT JOIN users u ON ar.requester_id = u.id
      WHERE ar.status IN ('pending', 'in_progress')
      AND ar.current_approver = $1
      ORDER BY ar.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.role, parseInt(limit), offset]
    );
    
    res.json({
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
    
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ 
      error: 'Failed to get pending requests',
      details: error.message 
    });
  }
});

// 13. GET ASSIGNED REQUESTS
app.get('/approval/requests/assigned', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT 
        ar.id,
        ar.title,
        ar.description,
        ar.request_type,
        ar.priority,
        ar.status,
        ar.current_step,
        ar.current_approver,
        ar.due_date,
        ar.created_at,
        aw.name as workflow_name,
        u.first_name,
        u.last_name,
        u.email
      FROM approval_requests ar
      LEFT JOIN approval_workflows aw ON ar.workflow_id = aw.id
      LEFT JOIN users u ON ar.requester_id = u.id
      WHERE ar.current_approver = $1
      ORDER BY ar.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.role, parseInt(limit), offset]
    );
    
    res.json({
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
    
  } catch (error) {
    console.error('Get assigned requests error:', error);
    res.status(500).json({ 
      error: 'Failed to get assigned requests',
      details: error.message 
    });
  }
});

// 14. GET CREATED REQUESTS
app.get('/approval/requests/created', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT 
        ar.id,
        ar.title,
        ar.description,
        ar.request_type,
        ar.priority,
        ar.status,
        ar.current_step,
        ar.current_approver,
        ar.due_date,
        ar.created_at,
        aw.name as workflow_name
      FROM approval_requests ar
      LEFT JOIN approval_workflows aw ON ar.workflow_id = aw.id
      WHERE ar.requester_id = $1
      ORDER BY ar.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );
    
    res.json({
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
    
  } catch (error) {
    console.error('Get created requests error:', error);
    res.status(500).json({ 
      error: 'Failed to get created requests',
      details: error.message 
    });
  }
});

// 15. GET REQUEST STATISTICS
app.get('/approval/requests/stats', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const queryParams = [];
    let paramCount = 1;
    
    if (startDate) {
      dateFilter += ` AND DATE(created_at) >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      dateFilter += ` AND DATE(created_at) <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    // Get total requests
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM approval_requests WHERE 1=1${dateFilter}`,
      queryParams
    );
    
    // Get status breakdown
    const statusResult = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
      FROM approval_requests 
      WHERE 1=1${dateFilter}
      GROUP BY status`,
      queryParams
    );
    
    // Get request type breakdown
    const typeResult = await pool.query(
      `SELECT 
        request_type,
        COUNT(*) as count
      FROM approval_requests 
      WHERE 1=1${dateFilter}
      GROUP BY request_type`,
      queryParams
    );
    
    // Get priority breakdown
    const priorityResult = await pool.query(
      `SELECT 
        priority,
        COUNT(*) as count
      FROM approval_requests 
      WHERE 1=1${dateFilter}
      GROUP BY priority`,
      queryParams
    );
    
    // Get average processing time
    const avgTimeResult = await pool.query(
      `SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
      FROM approval_requests 
      WHERE status IN ('approved', 'rejected')${dateFilter}`,
      queryParams
    );
    
    res.json({
      total: parseInt(totalResult.rows[0].total),
      statusBreakdown: statusResult.rows,
      typeBreakdown: typeResult.rows,
      priorityBreakdown: priorityResult.rows,
      averageProcessingHours: parseFloat(avgTimeResult.rows[0].avg_hours) || 0,
      period: {
        startDate,
        endDate
      }
    });
    
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get request statistics',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Approval System running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
