const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

// Database connection
const pool = new Pool({
  connectionString: process.env.REPORT_DB_URL || 'postgresql://report_user:report_password@localhost:5432/report_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
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
  try {
    const client = await pool.connect();
    client.release();
    
    res.json({
      status: 'OK',
      service: 'Report Generation',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      service: 'Report Generation',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'Report Generation Service',
    version: '1.0.0',
    description: 'Comprehensive reporting and analytics for Workforce Management',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /': 'Service info',
      'GET /api/reports/templates': 'Get report templates',
      'POST /api/reports/templates': 'Create report template',
      'PUT /api/reports/templates/:id': 'Update report template',
      'DELETE /api/reports/templates/:id': 'Delete report template',
      'GET /api/reports': 'Get generated reports',
      'POST /api/reports': 'Generate new report',
      'GET /api/reports/:id': 'Get specific report',
      'DELETE /api/reports/:id': 'Delete report',
      'GET /api/reports/:id/download': 'Download report file',
      'POST /api/reports/:id/comments': 'Add report comment',
      'GET /api/reports/:id/comments': 'Get report comments',
      'GET /api/reports/scheduled': 'Get scheduled reports',
      'POST /api/reports/scheduled': 'Create scheduled report',
      'PUT /api/reports/scheduled/:id': 'Update scheduled report',
      'DELETE /api/reports/scheduled/:id': 'Delete scheduled report',
      'GET /api/reports/analytics': 'Get report analytics',
      'GET /api/reports/analytics/user/:userId': 'Get user report analytics',
      'GET /api/reports/analytics/template/:templateId': 'Get template analytics',
      'POST /api/reports/export': 'Export reports data',
      'GET /api/reports/dashboard': 'Get reporting dashboard data'
    }
  });
});

// Service info
app.get('/', (req, res) => {
  res.json({
    message: 'Report Generation Service',
    status: 'running',
    port: PORT,
    version: '1.0.0'
  });
});

// =============================================
// REPORT TEMPLATES ENDPOINTS
// =============================================

// 1. GET ALL REPORT TEMPLATES
app.get('/api/reports/templates', verifyToken, async (req, res) => {
  try {
    const { 
      templateType, 
      category, 
      isActive = true,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = `
      SELECT 
        rt.*,
        u.first_name as created_by_name
      FROM report_templates rt
      LEFT JOIN users u ON rt.created_by = u.id
      WHERE rt.is_active = $1
    `;
    
    const queryParams = [isActive];
    let paramCount = 2;
    
    if (templateType) {
      query += ` AND rt.template_type = $${paramCount++}`;
      queryParams.push(templateType);
    }
    
    if (category) {
      query += ` AND rt.category = $${paramCount++}`;
      queryParams.push(category);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY rt.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM report_templates rt
      WHERE rt.is_active = $1
    `;
    
    const countParams = [isActive];
    let countParamCount = 2;
    
    if (templateType) {
      countQuery += ` AND rt.template_type = $${countParamCount++}`;
      countParams.push(templateType);
    }
    
    if (category) {
      countQuery += ` AND rt.category = $${countParamCount++}`;
      countParams.push(category);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      templates: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get report templates error:', error);
    res.status(500).json({ 
      error: 'Failed to get report templates',
      details: error.message 
    });
  }
});

// 2. CREATE REPORT TEMPLATE (Admin only)
app.post('/api/reports/templates', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      templateType,
      category,
      templateConfig,
      dataSource,
      permissions
    } = req.body;
    
    // Validate required fields
    if (!name || !templateType || !templateConfig) {
      return res.status(400).json({ 
        error: 'Name, template type, and template configuration are required' 
      });
    }
    
    const query = `
      INSERT INTO report_templates (
        name, description, template_type, category, 
        template_config, data_source, permissions, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      name,
      description,
      templateType,
      category,
      JSON.stringify(templateConfig),
      dataSource ? JSON.stringify(dataSource) : null,
      permissions ? JSON.stringify(permissions) : null,
      req.user.id
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Report template created successfully',
      template: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create report template error:', error);
    res.status(500).json({ 
      error: 'Failed to create report template',
      details: error.message 
    });
  }
});

// 3. UPDATE REPORT TEMPLATE (Admin only)
app.put('/api/reports/templates/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      templateType,
      category,
      templateConfig,
      dataSource,
      permissions,
      isActive
    } = req.body;
    
    const query = `
      UPDATE report_templates 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        template_type = COALESCE($3, template_type),
        category = COALESCE($4, category),
        template_config = COALESCE($5, template_config),
        data_source = COALESCE($6, data_source),
        permissions = COALESCE($7, permissions),
        is_active = COALESCE($8, is_active),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      name,
      description,
      templateType,
      category,
      templateConfig ? JSON.stringify(templateConfig) : null,
      dataSource ? JSON.stringify(dataSource) : null,
      permissions ? JSON.stringify(permissions) : null,
      isActive,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report template not found' });
    }
    
    res.json({
      message: 'Report template updated successfully',
      template: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update report template error:', error);
    res.status(500).json({ 
      error: 'Failed to update report template',
      details: error.message 
    });
  }
});

// 4. DELETE REPORT TEMPLATE (Admin only)
app.delete('/api/reports/templates/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template is being used by any reports
    const usageCheck = await pool.query(
      'SELECT COUNT(*) as count FROM reports WHERE template_id = $1',
      [id]
    );
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete template that has associated reports' 
      });
    }
    
    const result = await pool.query(
      'DELETE FROM report_templates WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report template not found' });
    }
    
    res.json({
      message: 'Report template deleted successfully',
      template: result.rows[0]
    });
    
  } catch (error) {
    console.error('Delete report template error:', error);
    res.status(500).json({ 
      error: 'Failed to delete report template',
      details: error.message 
    });
  }
});

// =============================================
// REPORT GENERATION ENDPOINTS
// =============================================

// 5. GET ALL REPORTS
app.get('/api/reports', verifyToken, async (req, res) => {
  try {
    const { 
      templateId, 
      status, 
      generatedBy,
      startDate,
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = `
      SELECT 
        r.*,
        rt.name as template_name,
        rt.template_type,
        u.first_name,
        u.last_name,
        u.email
      FROM reports r
      LEFT JOIN report_templates rt ON r.template_id = rt.id
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (templateId) {
      query += ` AND r.template_id = $${paramCount++}`;
      queryParams.push(templateId);
    }
    
    if (status) {
      query += ` AND r.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (generatedBy) {
      query += ` AND r.generated_by = $${paramCount++}`;
      queryParams.push(generatedBy);
    }
    
    if (startDate) {
      query += ` AND DATE(r.generated_at) >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND DATE(r.generated_at) <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY r.generated_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM reports r
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 1;
    
    if (templateId) {
      countQuery += ` AND r.template_id = $${countParamCount++}`;
      countParams.push(templateId);
    }
    
    if (status) {
      countQuery += ` AND r.status = $${countParamCount++}`;
      countParams.push(status);
    }
    
    if (generatedBy) {
      countQuery += ` AND r.generated_by = $${countParamCount++}`;
      countParams.push(generatedBy);
    }
    
    if (startDate) {
      countQuery += ` AND DATE(r.generated_at) >= $${countParamCount++}`;
      countParams.push(startDate);
    }
    
    if (endDate) {
      countQuery += ` AND DATE(r.generated_at) <= $${countParamCount++}`;
      countParams.push(endDate);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      reports: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      error: 'Failed to get reports',
      details: error.message 
    });
  }
});

// 6. GENERATE NEW REPORT
app.post('/api/reports', verifyToken, async (req, res) => {
  try {
    const {
      templateId,
      title,
      description,
      reportData,
      expiresAt
    } = req.body;
    
    // Validate required fields
    if (!templateId || !title) {
      return res.status(400).json({ 
        error: 'Template ID and title are required' 
      });
    }
    
    // Verify template exists and is active
    const templateCheck = await pool.query(
      'SELECT * FROM report_templates WHERE id = $1 AND is_active = true',
      [templateId]
    );
    
    if (templateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found or inactive' });
    }
    
    const query = `
      INSERT INTO reports (
        template_id, title, description, generated_by, 
        report_data, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      templateId,
      title,
      description,
      req.user.id,
      reportData ? JSON.stringify(reportData) : null,
      expiresAt
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Report generated successfully',
      report: result.rows[0]
    });
    
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      details: error.message 
    });
  }
});

// 7. GET SPECIFIC REPORT
app.get('/api/reports/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        r.*,
        rt.name as template_name,
        rt.template_type,
        rt.category,
        u.first_name,
        u.last_name,
        u.email
      FROM reports r
      LEFT JOIN report_templates rt ON r.template_id = rt.id
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE r.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Track report view
    await pool.query(
      'INSERT INTO report_analytics (report_id, user_id, action) VALUES ($1, $2, $3)',
      [id, req.user.id, 'viewed']
    );
    
    res.json({
      report: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ 
      error: 'Failed to get report',
      details: error.message 
    });
  }
});

// 8. DELETE REPORT (Owner or Admin only)
app.delete('/api/reports/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can delete this report
    const reportCheck = await pool.query(
      'SELECT generated_by FROM reports WHERE id = $1',
      [id]
    );
    
    if (reportCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = reportCheck.rows[0];
    if (report.generated_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const result = await pool.query(
      'DELETE FROM reports WHERE id = $1 RETURNING *',
      [id]
    );
    
    res.json({
      message: 'Report deleted successfully',
      report: result.rows[0]
    });
    
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ 
      error: 'Failed to delete report',
      details: error.message 
    });
  }
});

// 9. DOWNLOAD REPORT FILE
app.get('/api/reports/:id/download', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT r.*, rt.name as template_name
      FROM reports r
      LEFT JOIN report_templates rt ON r.template_id = rt.id
      WHERE r.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = result.rows[0];
    
    if (!report.file_path) {
      return res.status(404).json({ error: 'Report file not available' });
    }
    
    // Track download
    await pool.query(
      'INSERT INTO report_analytics (report_id, user_id, action) VALUES ($1, $2, $3)',
      [id, req.user.id, 'downloaded']
    );
    
    // In a real implementation, you would serve the actual file
    // For now, we'll return the file info
    res.json({
      message: 'Report download initiated',
      filePath: report.file_path,
      fileName: `${report.title}.pdf`,
      fileSize: report.file_size
    });
    
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ 
      error: 'Failed to download report',
      details: error.message 
    });
  }
});

// =============================================
// REPORT COMMENTS ENDPOINTS
// =============================================

// 10. ADD REPORT COMMENT
app.post('/api/reports/:id/comments', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }
    
    // Verify report exists
    const reportCheck = await pool.query(
      'SELECT id FROM reports WHERE id = $1',
      [id]
    );
    
    if (reportCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const query = `
      INSERT INTO report_comments (report_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, req.user.id, comment]);
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: result.rows[0]
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      error: 'Failed to add comment',
      details: error.message 
    });
  }
});

// 11. GET REPORT COMMENTS
app.get('/api/reports/:id/comments', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Verify report exists
    const reportCheck = await pool.query(
      'SELECT id FROM reports WHERE id = $1',
      [id]
    );
    
    if (reportCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const query = `
      SELECT 
        rc.*,
        u.first_name,
        u.last_name,
        u.email
      FROM report_comments rc
      LEFT JOIN users u ON rc.user_id = u.id
      WHERE rc.report_id = $1
      ORDER BY rc.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const offset = (page - 1) * limit;
    const result = await pool.query(query, [id, limit, offset]);
    
    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM report_comments WHERE report_id = $1',
      [id]
    );
    
    res.json({
      comments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      error: 'Failed to get comments',
      details: error.message 
    });
  }
});

// =============================================
// SCHEDULED REPORTS ENDPOINTS
// =============================================

// 12. GET SCHEDULED REPORTS
app.get('/api/reports/scheduled', verifyToken, async (req, res) => {
  try {
    const { 
      templateId, 
      isActive = true,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = `
      SELECT 
        sr.*,
        rt.name as template_name,
        rt.template_type,
        u.first_name as created_by_name
      FROM scheduled_reports sr
      LEFT JOIN report_templates rt ON sr.template_id = rt.id
      LEFT JOIN users u ON sr.created_by = u.id
      WHERE sr.is_active = $1
    `;
    
    const queryParams = [isActive];
    let paramCount = 2;
    
    if (templateId) {
      query += ` AND sr.template_id = $${paramCount++}`;
      queryParams.push(templateId);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY sr.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM scheduled_reports sr
      WHERE sr.is_active = $1
    `;
    
    const countParams = [isActive];
    let countParamCount = 2;
    
    if (templateId) {
      countQuery += ` AND sr.template_id = $${countParamCount++}`;
      countParams.push(templateId);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      scheduledReports: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get scheduled reports error:', error);
    res.status(500).json({ 
      error: 'Failed to get scheduled reports',
      details: error.message 
    });
  }
});

// 13. CREATE SCHEDULED REPORT (Admin only)
app.post('/api/reports/scheduled', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      templateId,
      name,
      scheduleType,
      scheduleConfig,
      recipients,
      deliveryMethod = 'email'
    } = req.body;
    
    // Validate required fields
    if (!templateId || !name || !scheduleType || !scheduleConfig) {
      return res.status(400).json({ 
        error: 'Template ID, name, schedule type, and schedule configuration are required' 
      });
    }
    
    // Verify template exists
    const templateCheck = await pool.query(
      'SELECT id FROM report_templates WHERE id = $1 AND is_active = true',
      [templateId]
    );
    
    if (templateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found or inactive' });
    }
    
    const query = `
      INSERT INTO scheduled_reports (
        template_id, name, schedule_type, schedule_config, 
        recipients, delivery_method, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      templateId,
      name,
      scheduleType,
      JSON.stringify(scheduleConfig),
      recipients ? JSON.stringify(recipients) : null,
      deliveryMethod,
      req.user.id
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      message: 'Scheduled report created successfully',
      scheduledReport: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create scheduled report error:', error);
    res.status(500).json({ 
      error: 'Failed to create scheduled report',
      details: error.message 
    });
  }
});

// 14. UPDATE SCHEDULED REPORT (Admin only)
app.put('/api/reports/scheduled/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      scheduleType,
      scheduleConfig,
      recipients,
      deliveryMethod,
      isActive
    } = req.body;
    
    const query = `
      UPDATE scheduled_reports 
      SET 
        name = COALESCE($1, name),
        schedule_type = COALESCE($2, schedule_type),
        schedule_config = COALESCE($3, schedule_config),
        recipients = COALESCE($4, recipients),
        delivery_method = COALESCE($5, delivery_method),
        is_active = COALESCE($6, is_active)
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      name,
      scheduleType,
      scheduleConfig ? JSON.stringify(scheduleConfig) : null,
      recipients ? JSON.stringify(recipients) : null,
      deliveryMethod,
      isActive,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scheduled report not found' });
    }
    
    res.json({
      message: 'Scheduled report updated successfully',
      scheduledReport: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update scheduled report error:', error);
    res.status(500).json({ 
      error: 'Failed to update scheduled report',
      details: error.message 
    });
  }
});

// 15. DELETE SCHEDULED REPORT (Admin only)
app.delete('/api/reports/scheduled/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM scheduled_reports WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scheduled report not found' });
    }
    
    res.json({
      message: 'Scheduled report deleted successfully',
      scheduledReport: result.rows[0]
    });
    
  } catch (error) {
    console.error('Delete scheduled report error:', error);
    res.status(500).json({ 
      error: 'Failed to delete scheduled report',
      details: error.message 
    });
  }
});

// =============================================
// REPORT ANALYTICS ENDPOINTS
// =============================================

// 16. GET REPORT ANALYTICS
app.get('/api/reports/analytics', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let dateFilter = '';
    const queryParams = [];
    let paramCount = 1;
    
    if (startDate && endDate) {
      dateFilter = `WHERE ra.created_at >= $${paramCount++} AND ra.created_at <= $${paramCount++}`;
      queryParams.push(startDate, endDate);
    }
    
    const query = `
      SELECT 
        DATE(ra.created_at) as date,
        ra.action,
        COUNT(*) as count
      FROM report_analytics ra
      ${dateFilter}
      GROUP BY DATE(ra.created_at), ra.action
      ORDER BY date DESC, ra.action
    `;
    
    const result = await pool.query(query, queryParams);
    
    // Group by date
    const analytics = {};
    result.rows.forEach(row => {
      if (!analytics[row.date]) {
        analytics[row.date] = {};
      }
      analytics[row.date][row.action] = parseInt(row.count);
    });
    
    res.json({
      analytics,
      filters: { startDate, endDate, groupBy }
    });
    
  } catch (error) {
    console.error('Get report analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get report analytics',
      details: error.message 
    });
  }
});

// 17. GET USER REPORT ANALYTICS
app.get('/api/reports/analytics/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Check if user can access this data
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    let query = `
      SELECT 
        ra.action,
        COUNT(*) as count,
        DATE(ra.created_at) as date
      FROM report_analytics ra
      WHERE ra.user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND ra.created_at >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND ra.created_at <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    query += ` GROUP BY ra.action, DATE(ra.created_at) ORDER BY date DESC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      userAnalytics: result.rows,
      filters: { startDate, endDate }
    });
    
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get user analytics',
      details: error.message 
    });
  }
});

// 18. GET TEMPLATE ANALYTICS
app.get('/api/reports/analytics/template/:templateId', verifyToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        ra.action,
        COUNT(*) as count,
        DATE(ra.created_at) as date
      FROM report_analytics ra
      WHERE ra.template_id = $1
    `;
    
    const queryParams = [templateId];
    let paramCount = 2;
    
    if (startDate) {
      query += ` AND ra.created_at >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND ra.created_at <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    query += ` GROUP BY ra.action, DATE(ra.created_at) ORDER BY date DESC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      templateAnalytics: result.rows,
      filters: { startDate, endDate }
    });
    
  } catch (error) {
    console.error('Get template analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get template analytics',
      details: error.message 
    });
  }
});

// =============================================
// EXPORT AND DASHBOARD ENDPOINTS
// =============================================

// 19. EXPORT REPORTS DATA
app.post('/api/reports/export', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      format = 'json',
      filters = {},
      startDate,
      endDate
    } = req.body;
    
    let query = `
      SELECT 
        r.*,
        rt.name as template_name,
        rt.template_type,
        u.first_name,
        u.last_name,
        u.email
      FROM reports r
      LEFT JOIN report_templates rt ON r.template_id = rt.id
      LEFT JOIN users u ON r.generated_by = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (startDate) {
      query += ` AND DATE(r.generated_at) >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ` AND DATE(r.generated_at) <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    if (filters.status) {
      query += ` AND r.status = $${paramCount++}`;
      queryParams.push(filters.status);
    }
    
    if (filters.templateType) {
      query += ` AND rt.template_type = $${paramCount++}`;
      queryParams.push(filters.templateType);
    }
    
    query += ` ORDER BY r.generated_at DESC`;
    
    const result = await pool.query(query, queryParams);
    
    // In a real implementation, you would generate the actual file
    // For now, we'll return the data
    res.json({
      message: 'Export completed successfully',
      format,
      recordCount: result.rows.length,
      data: result.rows,
      exportDate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Export reports error:', error);
    res.status(500).json({ 
      error: 'Failed to export reports',
      details: error.message 
    });
  }
});

// 20. GET REPORTING DASHBOARD DATA
app.get('/api/reports/dashboard', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get total reports count
    let totalReportsQuery = 'SELECT COUNT(*) as total FROM reports';
    const totalReportsResult = await pool.query(totalReportsQuery);
    
    // Get reports by status
    let statusQuery = `
      SELECT status, COUNT(*) as count
      FROM reports
      GROUP BY status
    `;
    const statusResult = await pool.query(statusQuery);
    
    // Get reports by template type
    let templateQuery = `
      SELECT rt.template_type, COUNT(*) as count
      FROM reports r
      LEFT JOIN report_templates rt ON r.template_id = rt.id
      GROUP BY rt.template_type
    `;
    const templateResult = await pool.query(templateQuery);
    
    // Get recent reports
    let recentQuery = `
      SELECT 
        r.*,
        rt.name as template_name,
        u.first_name,
        u.last_name
      FROM reports r
      LEFT JOIN report_templates rt ON r.template_id = rt.id
      LEFT JOIN users u ON r.generated_by = u.id
      ORDER BY r.generated_at DESC
      LIMIT 10
    `;
    const recentResult = await pool.query(recentQuery);
    
    // Get analytics summary
    let analyticsQuery = `
      SELECT action, COUNT(*) as count
      FROM report_analytics
      GROUP BY action
    `;
    const analyticsResult = await pool.query(analyticsQuery);
    
    res.json({
      dashboard: {
        totalReports: parseInt(totalReportsResult.rows[0].total),
        reportsByStatus: statusResult.rows,
        reportsByTemplate: templateResult.rows,
        recentReports: recentResult.rows,
        analyticsSummary: analyticsResult.rows
      },
      filters: { startDate, endDate }
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard data',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Report Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
