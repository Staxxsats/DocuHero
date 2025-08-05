# DocuHero Platform 🏥⛓️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)

A comprehensive healthcare documentation platform with blockchain integration, AI-powered features, and enterprise-grade compliance tools.

## 🏗️ Architecture Overview

### Frontend (React + TypeScript)
- **Multi-tier signup system** (Agency → Employee → Client)
- **State-specific compliance flows** with dynamic form generation
- **Role-based dashboards** with secure access control
- **Responsive design** with modern UI/UX

### Backend (Node.js + Express)
- **HIPAA-compliant security** with end-to-end encryption
- **Two-factor authentication** (TOTP-based)
- **Comprehensive audit logging** for compliance
- **State-specific compliance engine** with validation
- **Secure file upload** with virus scanning
- **JWT-based authentication** with role management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL or MongoDB (for production)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd certifi-ai-platform
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development servers**
```bash
# Frontend (Vite dev server)
npm run dev

# Backend (Express server) - in separate terminal
npm run server
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## 🏢 Account Tiers

### Tier 1: Agency Account
- **Multi-state compliance** configuration
- **Team management** with role-based permissions
- **Client management** with care plan templates
- **Compliance reporting** and audit trails
- **Billing integration** ready

### Tier 2: Employee Account (Invite-only)
- **State-compliant documentation** forms
- **Voice-enabled note-taking** (planned)
- **Assigned client access** only
- **Mobile-responsive** interface

### Tier 3: Client/Guardian Access (View-only)
- **Care plan summaries** viewing
- **Approved documentation** access
- **Visit schedule** information
- **HIPAA-compliant** communication

## 🛡️ Security & HIPAA Compliance

### Data Protection
- **AES-256 encryption** at rest and in transit
- **TLS 1.3** for all communications
- **Blockchain timestamping** for audit trails
- **Secure file storage** with access controls

### Authentication & Authorization
- **Two-factor authentication** (TOTP)
- **JWT-based sessions** with secure refresh
- **Role-based access control** (RBAC)
- **Session management** with automatic timeout

### Audit & Compliance
- **Comprehensive audit logging** of all actions
- **7-year data retention** for HIPAA compliance
- **Automated compliance scoring** and reporting
- **State-specific validation** rules

## 📋 State Compliance Engine

### Supported States
- **Georgia (GA)**: Home Health Logs, OASIS requirements
- **Texas (TX)**: DAP Notes, infection control protocols
- **Florida (FL)**: Comprehensive care plans, hurricane preparedness
- **California (CA)**: Person-centered care, cultural competency
- **New York (NY)**: DOH reporting, interdisciplinary notes

### Dynamic Features
- **Auto-generated forms** based on state requirements
- **Real-time validation** against compliance rules
- **Multi-state operation** support
- **Compliance scoring** and recommendations

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/signup          # Agency registration
POST /api/auth/login           # User login
GET  /api/auth/validate        # Token validation
POST /api/auth/setup-2fa       # Two-factor setup
POST /api/auth/verify-2fa      # Two-factor verification
```

### Compliance
```
GET  /api/compliance/requirements/:states    # Get state requirements
GET  /api/compliance/template/:states/:type  # Generate form template
POST /api/compliance/validate               # Validate documentation
GET  /api/compliance/report/:agencyId       # Compliance report
```

### Agency Management
```
GET  /api/agencies/:id/clients     # List clients
GET  /api/agencies/:id/employees   # List employees
GET  /api/agencies/:id/activity    # Recent activity
POST /api/auth/invite              # Send invitations
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── AuthProvider.tsx     # Authentication context
│   ├── SignupFlow.tsx       # Multi-step signup
│   ├── Dashboard.tsx        # Agency dashboard
│   ├── InviteSystem.tsx     # Team invitations
│   └── SecurityService.ts   # Security utilities
├── backend/             # Express.js backend
│   ├── server.js           # Main server
│   ├── auth.js             # Authentication routes
│   └── compliance.js       # Compliance engine
├── data/
│   └── stateRules.ts       # State compliance rules
└── types/
    └── auth.ts             # TypeScript definitions
```

## 🔐 Security Best Practices

### Development
- **Environment variables** for all secrets
- **Input validation** and sanitization
- **Rate limiting** on all endpoints
- **CORS configuration** for production

### Production Deployment
- **HTTPS only** with valid certificates
- **Database encryption** at rest
- **Regular security audits** and updates
- **Backup encryption** and testing

## 📊 Compliance Features

### Documentation Types
- **SOAP Notes** (Subjective, Objective, Assessment, Plan)
- **IEP Documentation** (Individualized Education Programs)
- **Progress Notes** with goal tracking
- **Incident Reports** with automatic notifications

### Validation Rules
- **Required field checking** per state
- **Signature validation** with timestamps
- **Data completeness scoring** (0-100%)
- **Cross-state compliance** verification

## 🚀 Deployment

### Environment Setup
1. Configure production environment variables
2. Set up HIPAA-compliant database (encrypted)
3. Configure secure file storage (AWS S3 + encryption)
4. Set up monitoring and alerting

### Security Checklist
- [ ] SSL/TLS certificates configured
- [ ] Database encryption enabled
- [ ] Audit logging active
- [ ] 2FA enforced for all users
- [ ] Rate limiting configured
- [ ] File upload security enabled
- [ ] Backup encryption verified

## 📞 Support & Documentation

### Getting Help
- **Technical Issues**: Create GitHub issue
- **Security Concerns**: Email security@certifi.ai
- **Compliance Questions**: Contact compliance team

### Additional Resources
- **HIPAA Compliance Guide**: `/docs/hipaa-compliance.md`
- **State Requirements**: `/docs/state-requirements.md`
- **API Documentation**: `/docs/api-reference.md`
- **Deployment Guide**: `/docs/deployment.md`

---

**Built with ❤️ for healthcare professionals**

*Certifi.ai - "Speak It. Certifi It."*