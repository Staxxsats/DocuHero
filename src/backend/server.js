// Main server file - Express.js backend for DocuHero
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./auth');
const complianceEngine = require('./compliance');

const app = express();
const PORT = process.env.PORT || 3001;

// Import additional services
const servicePlanProcessor = require('../services/servicePlanProcessor');
const realTimeDashboardService = require('../services/realTimeDashboardService');
const intelligentComplianceEngine = require('../services/intelligentComplianceEngine');
const eventStreamingService = require('../services/eventStreamingService');
const medicalTerminologyService = require('../services/medicalTerminologyService');
const autoSaveService = require('../services/autoSaveService');
const geolocationService = require('../services/geolocationService');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Compliance API routes
app.get('/api/compliance/requirements/:states', (req, res) => {
  try {
    const states = req.params.states.split(',');
    const requirements = complianceEngine.getMergedRequirements(states);
    res.json(requirements);
  } catch (error) {
    console.error('Compliance requirements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/compliance/template/:states/:type', (req, res) => {
  try {
    const states = req.params.states.split(',');
    const documentationType = req.params.type;
    const template = complianceEngine.generateFormTemplate(states, documentationType);
    res.json(template);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/compliance/validate', (req, res) => {
  try {
    const { documentation, states } = req.body;
    const validation = complianceEngine.validateDocumentation(documentation, states);
    res.json(validation);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/compliance/report/:agencyId', (req, res) => {
  try {
    const { agencyId } = req.params;
    const { states, timeRange } = req.query;
    const stateList = states ? states.split(',') : ['GA'];
    const report = complianceEngine.generateComplianceReport(agencyId, stateList, parseInt(timeRange) || 30);
    res.json(report);
  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Agency management routes
app.get('/api/agencies/:agencyId/clients', (req, res) => {
  // Mock client data - replace with database query
  const clients = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1950-01-15'),
      assignedEmployees: ['emp1', 'emp2'],
      guardianIds: [],
      isActive: true
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1945-06-20'),
      assignedEmployees: ['emp1'],
      guardianIds: ['guard1'],
      isActive: true
    }
  ];
  
  res.json(clients);
});

app.get('/api/agencies/:agencyId/employees', (req, res) => {
  // Mock employee data - replace with database query
  const employees = [
    {
      id: '1',
      userId: 'user1',
      agencyId: req.params.agencyId,
      position: 'Registered Nurse',
      licenseNumber: 'RN123456',
      assignedClients: ['1', '2'],
      permissions: [],
      isActive: true
    },
    {
      id: '2',
      userId: 'user2',
      agencyId: req.params.agencyId,
      position: 'Case Manager',
      licenseNumber: null,
      assignedClients: ['1'],
      permissions: [],
      isActive: true
    }
  ];
  
  res.json(employees);
});

app.get('/api/agencies/:agencyId/activity', (req, res) => {
  // Mock activity data - replace with database query
  const activity = [
    {
      id: '1',
      userId: 'user1',
      action: 'completed_documentation',
      resource: 'client:1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: { clientName: 'John Doe' }
    },
    {
      id: '2',
      userId: 'user2',
      action: 'updated_care_plan',
      resource: 'client:2',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      details: { clientName: 'Jane Smith' }
    }
  ];
  
  res.json(activity);
});

// File upload endpoint with security
const multer = require('multer');
const path = require('path');

// Configure multer for secure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production, implement:
    // 1. Virus scanning
    // 2. File encryption
    // 3. Secure storage (AWS S3, etc.)
    // 4. Access control

    res.json({
      fileId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date()
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Service Plan API routes
app.post('/api/service-plans/process', async (req, res) => {
  try {
    const { planData, providerInfo } = req.body;
    const result = await servicePlanProcessor.processServicePlan(planData, providerInfo);
    res.json(result);
  } catch (error) {
    console.error('Service plan processing error:', error);
    res.status(500).json({ error: 'Service plan processing failed' });
  }
});

app.get('/api/service-plans/templates/:category', (req, res) => {
  try {
    const { category } = req.params;
    const template = servicePlanProcessor.getTemplate(category);
    res.json(template);
  } catch (error) {
    console.error('Template retrieval error:', error);
    res.status(500).json({ error: 'Template retrieval failed' });
  }
});

// Real-time dashboard API
app.get('/api/dashboard/metrics/:agencyId', async (req, res) => {
  try {
    const { agencyId } = req.params;
    const metrics = await realTimeDashboardService.getMetrics(agencyId);
    res.json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/api/dashboard/alerts/:agencyId', async (req, res) => {
  try {
    const { agencyId } = req.params;
    const alerts = await realTimeDashboardService.getAlerts(agencyId);
    res.json(alerts);
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Voice documentation API
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Mock transcription - replace with actual speech-to-text service
    const mockTranscription = {
      transcriptId: 'trans_' + Date.now(),
      text: 'Patient appeared alert and oriented. Vital signs stable. No acute distress noted.',
      confidence: 0.95,
      duration: 30,
      processedAt: new Date()
    };

    res.json(mockTranscription);
  } catch (error) {
    console.error('Voice transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.post('/api/voice/enhance', async (req, res) => {
  try {
    const { transcriptId, rawText } = req.body;
    
    // Mock AI enhancement - replace with actual AI service
    const enhanced = {
      originalText: rawText,
      enhancedText: rawText + ' [AI Enhanced: Added proper medical formatting and structure]',
      suggestions: [
        'Consider adding specific vital sign measurements',
        'Include time stamps for better documentation'
      ],
      confidence: 0.89
    };

    res.json(enhanced);
  } catch (error) {
    console.error('Voice enhancement error:', error);
    res.status(500).json({ error: 'Enhancement failed' });
  }
});

// Medical terminology API
app.post('/api/medical/validate-terms', async (req, res) => {
  try {
    const { text } = req.body;
    const validation = await medicalTerminologyService.validateTerms(text);
    res.json(validation);
  } catch (error) {
    console.error('Medical term validation error:', error);
    res.status(500).json({ error: 'Term validation failed' });
  }
});

app.get('/api/medical/suggest/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const suggestions = await medicalTerminologyService.getSuggestions(term);
    res.json(suggestions);
  } catch (error) {
    console.error('Medical term suggestion error:', error);
    res.status(500).json({ error: 'Suggestion failed' });
  }
});

// Auto-save API
app.post('/api/autosave', async (req, res) => {
  try {
    const { documentId, content, userId } = req.body;
    const result = await autoSaveService.saveDocument(documentId, content, userId);
    res.json(result);
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ error: 'Auto-save failed' });
  }
});

app.get('/api/autosave/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await autoSaveService.getDocument(documentId);
    res.json(document);
  } catch (error) {
    console.error('Document retrieval error:', error);
    res.status(500).json({ error: 'Document retrieval failed' });
  }
});

// Geolocation and tracking API
app.post('/api/location/track', async (req, res) => {
  try {
    const { userId, location, timestamp } = req.body;
    const result = await geolocationService.trackLocation(userId, location, timestamp);
    res.json(result);
  } catch (error) {
    console.error('Location tracking error:', error);
    res.status(500).json({ error: 'Location tracking failed' });
  }
});

app.get('/api/location/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const history = await geolocationService.getLocationHistory(userId, startDate, endDate);
    res.json(history);
  } catch (error) {
    console.error('Location history error:', error);
    res.status(500).json({ error: 'Location history retrieval failed' });
  }
});

// Intelligent compliance API
app.post('/api/intelligent-compliance/analyze', async (req, res) => {
  try {
    const { documentation, context } = req.body;
    const analysis = await intelligentComplianceEngine.analyzeCompliance(documentation, context);
    res.json(analysis);
  } catch (error) {
    console.error('Intelligent compliance analysis error:', error);
    res.status(500).json({ error: 'Compliance analysis failed' });
  }
});

// WebSocket for real-time updates
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Initialize event streaming service with Socket.IO
// eventStreamingService.initialize(io); // Event streaming service handles its own initialization

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-agency', (agencyId) => {
    socket.join(`agency_${agencyId}`);
    console.log(`Client ${socket.id} joined agency ${agencyId}`);
  });
  
  socket.on('join-document', (documentId) => {
    socket.join(`document_${documentId}`);
    console.log(`Client ${socket.id} joined document ${documentId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Admin API routes
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Mock admin stats - replace with actual database queries
    const stats = {
      totalUsers: 1247,
      activeAgencies: 89,
      documentsCreated: 15623,
      complianceScore: 94.7,
      monthlyGrowth: 12.3,
      systemHealth: 'excellent',
      lastUpdated: new Date()
    };
    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

app.get('/api/admin/agencies', async (req, res) => {
  try {
    // Mock agency data - replace with database query
    const agencies = [
      {
        id: 'agency_1',
        name: 'Compassionate Care Services',
        contactEmail: 'admin@compassionatecare.com',
        phone: '(555) 123-4567',
        address: '123 Healthcare Blvd, Atlanta, GA 30309',
        clientCount: 45,
        employeeCount: 12,
        complianceScore: 98.2,
        status: 'active',
        createdAt: new Date('2023-01-15'),
        lastActivity: new Date()
      },
      {
        id: 'agency_2',
        name: 'Premier Home Health',
        contactEmail: 'info@premierhomehealth.com',
        phone: '(555) 987-6543',
        address: '456 Wellness Way, Marietta, GA 30060',
        clientCount: 67,
        employeeCount: 18,
        complianceScore: 95.8,
        status: 'active',
        createdAt: new Date('2023-03-22'),
        lastActivity: new Date()
      }
    ];
    res.json(agencies);
  } catch (error) {
    console.error('Admin agencies error:', error);
    res.status(500).json({ error: 'Failed to fetch agencies' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server using HTTP server (for WebSocket support)
server.listen(PORT, () => {
  console.log(`🚀 DocuHero server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 HIPAA-compliant security enabled`);
  console.log(`⚡ WebSocket support enabled`);
  console.log(`🏥 Medical terminology validation ready`);
  console.log(`🎙️  Voice documentation processing ready`);
  console.log(`📋 Service plan processing ready`);
  console.log(`🔄 Real-time dashboard services active`);
});

module.exports = { app, server, io };