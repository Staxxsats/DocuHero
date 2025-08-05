// Minimal server for fast development startup
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API endpoints
app.get('/api/auth/me', (req, res) => {
  res.json({ user: null, authenticated: false });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, token: 'demo-token', user: { id: 1, name: 'Demo User' } });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: 'User registered successfully' });
});

// Document endpoints
app.get('/api/documents', (req, res) => {
  res.json({ documents: [], total: 0 });
});

app.post('/api/documents', (req, res) => {
  res.json({ success: true, id: Date.now() });
});

// Service plan endpoints
app.get('/api/service-plans', (req, res) => {
  res.json({ plans: [], total: 0 });
});

// Compliance endpoints
app.get('/api/compliance/check', (req, res) => {
  res.json({ compliant: true, issues: [] });
});

// Voice documentation endpoints
app.post('/api/voice/transcribe', (req, res) => {
  res.json({ transcript: 'Demo transcription', confidence: 0.95 });
});

// Dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalDocuments: 42,
    pendingReviews: 5,
    complianceScore: 98,
    activeUsers: 12
  });
});

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
  res.json({ users: [], total: 0 });
});

// Blockchain endpoints
app.get('/api/blockchain/balance', (req, res) => {
  res.json({ balance: '1000', token: 'DOCU' });
});

// Catch all
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
    app.listen(PORT + 1, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT + 1}`);
      console.log(`📊 Health check: http://localhost:${PORT + 1}/api/health`);
    });
  } else {
    console.error('Server error:', err);
  }
});