const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3005;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Database connection
const pool = new Pool({
  connectionString: process.env.TODO_DB_URL || 'postgresql://todo_user:todo_password@todo-db:5432/todo_db',
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
    service: 'Todo Management',
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
    name: 'Todo Management Service',
    version: '1.0.0',
    description: 'Complete todo management with assignment for Workforce Management Platform',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /todos': 'Get user todos',
      'GET /todos/:id': 'Get todo by ID',
      'POST /todos': 'Create new todo',
      'PUT /todos/:id': 'Update todo',
      'DELETE /todos/:id': 'Delete todo',
      'GET /todos/assigned': 'Get assigned todos',
      'GET /todos/created': 'Get created todos',
      'POST /todos/:id/assign': 'Assign todo to user',
      'POST /todos/:id/complete': 'Mark todo as complete',
      'POST /todos/:id/reopen': 'Reopen completed todo',
      'GET /todos/search': 'Search todos',
      'GET /todos/stats': 'Todo statistics',
      'GET /todos/categories': 'Get todo categories',
      'POST /todos/bulk-assign': 'Bulk assign todos'
    }
  });
});

// Complete Todo Management API Endpoints

// 1. GET USER TODOS (assigned to current user)
app.get('/todos', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, category, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.category,
        t.due_date,
        t.completed_at,
        t.created_at,
        t.updated_at,
        t.user_id,
        t.assigned_to,
        t.assigned_by,
        t.assigned_at,
        u.email as assigned_to_email,
        u.first_name as assigned_to_first_name,
        u.last_name as assigned_to_last_name,
        c.email as created_by_email,
        c.first_name as created_by_first_name,
        c.last_name as created_by_last_name
      FROM todos t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.user_id = c.id
      WHERE t.assigned_to = $1
    `;
    
    const queryParams = [req.user.id];
    let paramCount = 2;
    
    // Add filters
    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramCount++}`;
      queryParams.push(priority);
    }
    
    if (category) {
      query += ` AND t.category = $${paramCount++}`;
      queryParams.push(category);
    }
    
    if (search) {
      query += ` AND (t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    // Add pagination
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM todos WHERE assigned_to = $1';
    const countParams = [req.user.id];
    paramCount = 2;
    
    if (status) {
      countQuery += ` AND status = $${paramCount++}`;
      countParams.push(status);
    }
    
    if (priority) {
      countQuery += ` AND priority = $${paramCount++}`;
      countParams.push(priority);
    }
    
    if (category) {
      countQuery += ` AND category = $${paramCount++}`;
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({
      todos: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ 
      error: 'Failed to get todos',
      details: error.message 
    });
  }
});

// 2. GET TODO BY ID
app.get('/todos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.category,
        t.due_date,
        t.completed_at,
        t.created_at,
        t.updated_at,
        t.user_id,
        t.assigned_to,
        t.assigned_by,
        t.assigned_at,
        u.email as assigned_to_email,
        u.first_name as assigned_to_first_name,
        u.last_name as assigned_to_last_name,
        c.email as created_by_email,
        c.first_name as created_by_first_name,
        c.last_name as created_by_last_name
      FROM todos t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.user_id = c.id
      WHERE t.id = $1 AND (t.assigned_to = $2 OR t.user_id = $2 OR $3 = 'admin')`,
      [id, req.user.id, req.user.role]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ todo: result.rows[0] });
    
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ 
      error: 'Failed to get todo',
      details: error.message 
    });
  }
});

// 3. CREATE NEW TODO
app.post('/todos', verifyToken, async (req, res) => {
  try {
    const { title, description, priority = 'medium', category, dueDate, assignedTo } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        error: 'Title is required' 
      });
    }
    
    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority. Must be: low, medium, high, urgent' 
      });
    }
    
    // Check if assignedTo exists (if provided)
    if (assignedTo) {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [assignedTo]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(400).json({ 
          error: 'Assigned user not found or inactive' 
        });
      }
    }
    
    // Create todo
    const result = await pool.query(
      `INSERT INTO todos (
        title, 
        description, 
        priority, 
        category, 
        due_date, 
        status, 
        user_id, 
        assigned_to, 
        assigned_by, 
        assigned_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id, title, description, priority, category, due_date, status, created_at`,
      [
        title,
        description || null,
        priority,
        category || null,
        dueDate || null,
        'pending',
        req.user.id,
        assignedTo || req.user.id,
        req.user.id,
        new Date()
      ]
    );
    
    res.status(201).json({
      message: 'Todo created successfully',
      todo: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ 
      error: 'Failed to create todo',
      details: error.message 
    });
  }
});

// 4. UPDATE TODO
app.put('/todos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, category, dueDate, status } = req.body;
    
    // Check if user can update this todo
    const todoResult = await pool.query(
      'SELECT user_id, assigned_to FROM todos WHERE id = $1',
      [id]
    );
    
    if (todoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoResult.rows[0];
    const canUpdate = req.user.role === 'admin' || 
                     todo.user_id === req.user.id || 
                     todo.assigned_to === req.user.id;
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Validate priority if provided
    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
          error: 'Invalid priority. Must be: low, medium, high, urgent' 
        });
      }
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status. Must be: pending, in_progress, completed, cancelled' 
        });
      }
    }
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (title) {
      updateFields.push(`title = $${paramCount++}`);
      updateValues.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }
    
    if (priority) {
      updateFields.push(`priority = $${paramCount++}`);
      updateValues.push(priority);
    }
    
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount++}`);
      updateValues.push(category);
    }
    
    if (dueDate !== undefined) {
      updateFields.push(`due_date = $${paramCount++}`);
      updateValues.push(dueDate);
    }
    
    if (status) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
      
      // Set completed_at if status is completed
      if (status === 'completed') {
        updateFields.push(`completed_at = NOW()`);
      } else if (status !== 'completed') {
        updateFields.push(`completed_at = NULL`);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: 'No fields to update' 
      });
    }
    
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);
    
    const result = await pool.query(
      `UPDATE todos SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );
    
    res.json({
      message: 'Todo updated successfully',
      todo: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ 
      error: 'Failed to update todo',
      details: error.message 
    });
  }
});

// 5. DELETE TODO
app.delete('/todos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can delete this todo
    const todoResult = await pool.query(
      'SELECT user_id FROM todos WHERE id = $1',
      [id]
    );
    
    if (todoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoResult.rows[0];
    const canDelete = req.user.role === 'admin' || todo.user_id === req.user.id;
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    
    res.json({
      message: 'Todo deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ 
      error: 'Failed to delete todo',
      details: error.message 
    });
  }
});

// 6. GET ASSIGNED TODOS (todos assigned to current user)
app.get('/todos/assigned', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.category,
        t.due_date,
        t.completed_at,
        t.created_at,
        t.updated_at,
        t.user_id,
        t.assigned_to,
        t.assigned_by,
        t.assigned_at,
        c.email as created_by_email,
        c.first_name as created_by_first_name,
        c.last_name as created_by_last_name
      FROM todos t
      LEFT JOIN users c ON t.user_id = c.id
      WHERE t.assigned_to = $1 AND t.user_id != $1
    `;
    
    const queryParams = [req.user.id];
    let paramCount = 2;
    
    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramCount++}`;
      queryParams.push(priority);
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      todos: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length,
        pages: Math.ceil(result.rows.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Get assigned todos error:', error);
    res.status(500).json({ 
      error: 'Failed to get assigned todos',
      details: error.message 
    });
  }
});

// 7. GET CREATED TODOS (todos created by current user)
app.get('/todos/created', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.category,
        t.due_date,
        t.completed_at,
        t.created_at,
        t.updated_at,
        t.user_id,
        t.assigned_to,
        t.assigned_by,
        t.assigned_at,
        u.email as assigned_to_email,
        u.first_name as assigned_to_first_name,
        u.last_name as assigned_to_last_name
      FROM todos t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.user_id = $1
    `;
    
    const queryParams = [req.user.id];
    let paramCount = 2;
    
    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramCount++}`;
      queryParams.push(priority);
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      todos: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length,
        pages: Math.ceil(result.rows.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Get created todos error:', error);
    res.status(500).json({ 
      error: 'Failed to get created todos',
      details: error.message 
    });
  }
});

// 8. ASSIGN TODO TO USER (Admin only)
app.post('/todos/:id/assign', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    
    if (!assignedTo) {
      return res.status(400).json({ 
        error: 'assignedTo is required' 
      });
    }
    
    // Check if todo exists
    const todoResult = await pool.query(
      'SELECT id FROM todos WHERE id = $1',
      [id]
    );
    
    if (todoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    // Check if assignedTo user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [assignedTo]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Assigned user not found or inactive' 
      });
    }
    
    // Update assignment
    const result = await pool.query(
      `UPDATE todos SET 
        assigned_to = $1, 
        assigned_by = $2, 
        assigned_at = NOW(),
        updated_at = NOW()
      WHERE id = $3 RETURNING *`,
      [assignedTo, req.user.id, id]
    );
    
    res.json({
      message: 'Todo assigned successfully',
      todo: result.rows[0]
    });
    
  } catch (error) {
    console.error('Assign todo error:', error);
    res.status(500).json({ 
      error: 'Failed to assign todo',
      details: error.message 
    });
  }
});

// 9. MARK TODO AS COMPLETE
app.post('/todos/:id/complete', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can complete this todo
    const todoResult = await pool.query(
      'SELECT assigned_to, status FROM todos WHERE id = $1',
      [id]
    );
    
    if (todoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoResult.rows[0];
    
    if (todo.assigned_to !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    if (todo.status === 'completed') {
      return res.status(400).json({ error: 'Todo is already completed' });
    }
    
    // Mark as complete
    const result = await pool.query(
      `UPDATE todos SET 
        status = 'completed', 
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 RETURNING *`,
      [id]
    );
    
    res.json({
      message: 'Todo marked as complete',
      todo: result.rows[0]
    });
    
  } catch (error) {
    console.error('Complete todo error:', error);
    res.status(500).json({ 
      error: 'Failed to complete todo',
      details: error.message 
    });
  }
});

// 10. REOPEN COMPLETED TODO
app.post('/todos/:id/reopen', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can reopen this todo
    const todoResult = await pool.query(
      'SELECT assigned_to, status FROM todos WHERE id = $1',
      [id]
    );
    
    if (todoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoResult.rows[0];
    
    if (todo.assigned_to !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    if (todo.status !== 'completed') {
      return res.status(400).json({ error: 'Todo is not completed' });
    }
    
    // Reopen todo
    const result = await pool.query(
      `UPDATE todos SET 
        status = 'pending', 
        completed_at = NULL,
        updated_at = NOW()
      WHERE id = $1 RETURNING *`,
      [id]
    );
    
    res.json({
      message: 'Todo reopened successfully',
      todo: result.rows[0]
    });
    
  } catch (error) {
    console.error('Reopen todo error:', error);
    res.status(500).json({ 
      error: 'Failed to reopen todo',
      details: error.message 
    });
  }
});

// 11. SEARCH TODOS
app.get('/todos/search', verifyToken, async (req, res) => {
  try {
    const { q, status, priority, category, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.category,
        t.due_date,
        t.completed_at,
        t.created_at,
        t.assigned_to,
        u.email as assigned_to_email,
        u.first_name as assigned_to_first_name,
        u.last_name as assigned_to_last_name
      FROM todos t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE (t.title ILIKE $1 OR t.description ILIKE $1)
    `;
    
    const queryParams = [`%${q}%`];
    let paramCount = 2;
    
    // Add user filter (only show todos assigned to or created by user)
    query += ` AND (t.assigned_to = $${paramCount++} OR t.user_id = $${paramCount++})`;
    queryParams.push(req.user.id, req.user.id);
    
    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramCount++}`;
      queryParams.push(priority);
    }
    
    if (category) {
      query += ` AND t.category = $${paramCount++}`;
      queryParams.push(category);
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++}`;
    queryParams.push(parseInt(limit));
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      todos: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Search todos error:', error);
    res.status(500).json({ 
      error: 'Failed to search todos',
      details: error.message 
    });
  }
});

// 12. TODO STATISTICS
app.get('/todos/stats', verifyToken, async (req, res) => {
  try {
    // Get total todos for user
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM todos WHERE assigned_to = $1',
      [req.user.id]
    );
    const total = parseInt(totalResult.rows[0].total);
    
    // Get todos by status
    const statusResult = await pool.query(
      'SELECT status, COUNT(*) as count FROM todos WHERE assigned_to = $1 GROUP BY status',
      [req.user.id]
    );
    
    // Get todos by priority
    const priorityResult = await pool.query(
      'SELECT priority, COUNT(*) as count FROM todos WHERE assigned_to = $1 GROUP BY priority',
      [req.user.id]
    );
    
    // Get completed todos this week
    const weeklyResult = await pool.query(
      `SELECT COUNT(*) as count FROM todos 
       WHERE assigned_to = $1 AND status = 'completed' 
       AND completed_at >= NOW() - INTERVAL '7 days'`,
      [req.user.id]
    );
    const weeklyCompleted = parseInt(weeklyResult.rows[0].count);
    
    // Get overdue todos
    const overdueResult = await pool.query(
      `SELECT COUNT(*) as count FROM todos 
       WHERE assigned_to = $1 AND status != 'completed' 
       AND due_date < NOW()`,
      [req.user.id]
    );
    const overdue = parseInt(overdueResult.rows[0].count);
    
    res.json({
      total,
      byStatus: statusResult.rows,
      byPriority: priorityResult.rows,
      weeklyCompleted,
      overdue
    });
    
  } catch (error) {
    console.error('Todo stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get todo statistics',
      details: error.message 
    });
  }
});

// 13. GET TODO CATEGORIES
app.get('/todos/categories', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM todos WHERE category IS NOT NULL ORDER BY category'
    );
    
    const categories = result.rows.map(row => row.category);
    
    res.json({
      categories,
      count: categories.length
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      error: 'Failed to get categories',
      details: error.message 
    });
  }
});

// 14. BULK ASSIGN TODOS (Admin only)
app.post('/todos/bulk-assign', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { todoIds, assignedTo } = req.body;
    
    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
      return res.status(400).json({ 
        error: 'todoIds array is required' 
      });
    }
    
    if (!assignedTo) {
      return res.status(400).json({ 
        error: 'assignedTo is required' 
      });
    }
    
    // Check if assignedTo user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [assignedTo]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Assigned user not found or inactive' 
      });
    }
    
    // Update all todos
    const result = await pool.query(
      `UPDATE todos SET 
        assigned_to = $1, 
        assigned_by = $2, 
        assigned_at = NOW(),
        updated_at = NOW()
      WHERE id = ANY($3) RETURNING id`,
      [assignedTo, req.user.id, todoIds]
    );
    
    res.json({
      message: `${result.rows.length} todos assigned successfully`,
      assignedCount: result.rows.length,
      todoIds: result.rows.map(row => row.id)
    });
    
  } catch (error) {
    console.error('Bulk assign todos error:', error);
    res.status(500).json({ 
      error: 'Failed to bulk assign todos',
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
  console.log(`🚀 Todo Management running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/docs`);
});
