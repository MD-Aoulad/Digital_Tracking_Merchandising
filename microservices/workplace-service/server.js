const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.WORKPLACE_DB_URL || 'postgresql://workplace_user:workplace_password@localhost:5439/workplace_db',
  ssl: false
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Workplace Management',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'Workplace Management',
    version: '1.0.0',
    description: 'Workplace Management for Workforce Management',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /': 'Service info',
      'GET /workplaces': 'List workplaces',
      'GET /workplaces/:id': 'Get a single workplace',
      'POST /workplaces': 'Create a new workplace (JSON: name, code, workplace_type, address, stateId, cityId)'
    }
  });
});

// GET /workplaces - list
app.get('/workplaces', async (req, res) => {
  try {
    const { isActive } = req.query;
    let query = `SELECT id, name, code, address, state_id, city_id, district, type,
      is_active, is_default, location_lat, location_lng, created_at, updated_at
      FROM workplaces WHERE 1=1`;
    const params = [];

    if (isActive !== undefined) {
      params.push(isActive === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json({ workplaces: result.rows, count: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /workplaces/:id - single lookup
app.get('/workplaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, code, address, state_id, city_id, district, type,
        is_active, is_default, location_lat, location_lng, created_at, updated_at
      FROM workplaces WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workplace not found' });
    }

    res.json({ workplace: result.rows[0] });
  } catch (err) {
    if (err.code === '22P02') { // invalid_text_representation (bad uuid)
      return res.status(404).json({ error: 'Workplace not found' });
    }
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Add POST /workplaces endpoint
app.post('/workplaces', async (req, res) => {
  const { name, code, workplace_type, address, stateId, cityId } = req.body;
  if (!name || !code || !workplace_type || !address || !stateId || !cityId) {
    return res.status(400).json({ error: 'Missing required fields: name, code, workplace_type, address, stateId, cityId' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO workplaces (name, code, type, address, state_id, city_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, code, type, address, state_id, city_id;`,
      [name, code, workplace_type, address, stateId, cityId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      res.status(409).json({ error: 'Workplace code already exists' });
    } else {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  }
});

// Service info
app.get('/', (req, res) => {
  res.json({
    message: 'Workplace Management Service',
    status: 'running',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log();
  console.log();
  console.log();
});
