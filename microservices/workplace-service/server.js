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
  connectionString: process.env.DATABASE_URL || 'postgresql://workplace_user:workplace_password@localhost:5439/workplace_db',
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
      'POST /workplaces': 'Create a new workplace (JSON: name, code, workplace_type, address)'
    }
  });
});

// Add POST /workplaces endpoint
app.post('/workplaces', async (req, res) => {
  const { name, code, workplace_type, address } = req.body;
  if (!name || !code || !workplace_type || !address) {
    return res.status(400).json({ error: 'Missing required fields: name, code, workplace_type, address' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO workplaces (name, code, workplace_type, address) VALUES ($1, $2, $3, $4) RETURNING id, name, code, workplace_type, address;`,
      [name, code, workplace_type, address]
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
