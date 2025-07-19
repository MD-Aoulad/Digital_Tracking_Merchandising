const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3009;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Notification System',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/docs', (req, res) => {
  res.json({
    name: 'Notification System',
    version: '1.0.0',
    description: 'Notification System for Workforce Management',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /': 'Service info'
    }
  });
});

// Service info
app.get('/', (req, res) => {
  res.json({
    message: 'Notification System Service',
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
