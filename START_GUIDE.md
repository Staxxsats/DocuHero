# DocuHero Platform - Quick Start Guide

## Welcome to DocuHero! 🚀

This guide will help you get the complete DocuHero platform up and running in minutes. DocuHero is a comprehensive healthcare documentation platform with blockchain integration, AI-powered features, and enterprise-grade compliance tools.

## System Requirements

### Minimum Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux Ubuntu 20.04+

### Recommended for Full Features
- **Node.js**: Version 20.x (LTS)
- **PostgreSQL**: Version 14+ (for production database)
- **RAM**: 8GB or more
- **Storage**: 10GB free space for development

## Quick Start (5 Minutes)

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/docuhero.git
cd docuhero

# Make start script executable (Linux/Mac)
chmod +x start-app.sh

# Start the platform
./start-app.sh        # Linux/Mac
# OR
start-app.bat         # Windows
```

### Step 2: Choose Your Setup
The start script will present you with options:

1. **Full Platform** (Recommended for first-time users)
   - Includes frontend, backend, and database
   - Perfect for testing all features

2. **Backend Only**
   - For API development and testing

3. **Frontend Only**
   - For UI development (requires separate backend)

4. **Full Platform + Blockchain**
   - Complete setup with local blockchain node
   - Includes smart contract deployment

### Step 3: Access the Platform
Once started, access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Blockchain** (if enabled): http://localhost:8545

## Detailed Setup Instructions

### Prerequisites Installation

#### Install Node.js
**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer and follow prompts
3. Verify: Open Command Prompt and run `node --version`

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install PostgreSQL (Optional - for production)
**Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/)
2. Run installer with default settings
3. Remember your password for 'postgres' user

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Environment Configuration

#### 1. Environment Variables
The start script will create a `.env` file for you, but you may want to customize:

```env
# Database (use SQLite for development, PostgreSQL for production)
DATABASE_URL="postgresql://docuhero:password@localhost:5432/docuhero_dev"

# JWT Secret (change this!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Blockchain Configuration (optional)
SEPOLIA_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
PRIVATE_KEY="your-wallet-private-key-for-deployment"
ETHERSCAN_API_KEY="your-etherscan-api-key"

# External Services (optional)
OPENAI_API_KEY="your-openai-api-key-for-ai-features"
```

#### 2. Database Setup
**For Development (SQLite - Automatic):**
No additional setup required. SQLite database will be created automatically.

**For Production (PostgreSQL):**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE docuhero_dev;
CREATE USER docuhero WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE docuhero_dev TO docuhero;
\q

# Initialize database
npm run db:migrate
npm run db:seed
```

## Platform Features Overview

### 🏥 Healthcare Documentation
- **HIPAA-compliant** document creation and storage
- **Multi-state compliance** checking and validation
- **Voice-to-text** documentation with medical terminology
- **AI-powered** content enhancement and suggestions
- **Template library** for various healthcare specialties

### 🔗 Blockchain Integration
- **Smart contracts** for document verification and tokenized incentives
- **DOCU tokens** for rewarding quality documentation
- **Immutable audit trails** for compliance and legal purposes
- **Decentralized storage** with IPFS integration
- **Web3 wallet** integration (MetaMask, WalletConnect)

### 👥 User Management
- **Role-based access** (Admin, Provider, Client, Viewer)
- **Multi-factor authentication** with TOTP support
- **Agency management** with client/staff relationships
- **Audit logging** for all user activities

### 📊 Analytics & Reporting
- **Real-time dashboards** with key performance indicators
- **Compliance scoring** and improvement recommendations
- **Financial analytics** with revenue tracking
- **Client satisfaction** monitoring and reporting

### 🎙️ Voice Intelligence
- **Speech-to-text** with medical vocabulary recognition
- **Voice command** navigation and control
- **Automated transcription** with speaker identification
- **Audio quality** enhancement and noise reduction

## Common Workflows

### 1. Creating Your First Document
1. **Sign Up**: Create admin account at http://localhost:5173/signup
2. **Agency Setup**: Complete agency information and compliance settings
3. **Add Users**: Invite staff members with appropriate roles
4. **Create Document**: Use templates or start from scratch
5. **Voice Input**: Use voice recording for faster documentation
6. **Compliance Check**: Review automated compliance suggestions
7. **Submit**: Submit for review and approval workflow

### 2. Setting Up Blockchain Features
1. **Install MetaMask**: Browser extension for Web3 interaction
2. **Connect Wallet**: Link your wallet to the platform
3. **Get Test Tokens**: Use faucet for testnet tokens (development)
4. **Deploy Contracts**: Use built-in deployment tools
5. **Mint Tokens**: Earn DOCU tokens for quality documentation
6. **Verify Documents**: Use blockchain verification features

### 3. Configuring Compliance
1. **Select States**: Choose operational states for compliance
2. **Set Regulations**: Configure relevant healthcare regulations
3. **Upload Templates**: Add organization-specific templates
4. **Test Validation**: Create test documents to verify compliance
5. **Train Staff**: Use built-in training materials and workflows

## Development Workflow

### File Structure
```
docuhero/
├── src/
│   ├── components/          # React components
│   ├── backend/            # Express.js backend
│   ├── services/           # Business logic services
│   ├── data/              # Static data and configurations
│   └── hooks/             # React hooks
├── contracts/             # Smart contracts
├── scripts/              # Deployment and utility scripts
├── uploads/              # File storage directory
└── docs/                 # Documentation
```

### Available Scripts
```bash
# Development
npm run dev                    # Start full platform
npm run dev:frontend          # Frontend only
npm run dev:backend           # Backend only

# Database
npm run db:generate           # Generate Prisma client
npm run db:migrate           # Run database migrations
npm run db:seed              # Seed database with sample data
npm run db:studio            # Open Prisma Studio

# Blockchain
npm run blockchain:compile    # Compile smart contracts
npm run blockchain:deploy    # Deploy contracts to network
npm run blockchain:test      # Run contract tests
npm run blockchain:node      # Start local blockchain node

# Production
npm run build                # Build for production
npm run start               # Start production server
```

### Code Quality
```bash
# Linting
npm run lint                 # Check code style
npm run lint:fix            # Fix auto-fixable issues

# Testing
npm run test                # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on ports (Linux/Mac)
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

#### Database Connection Error
1. Check PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -l`
3. Check connection string in `.env`
4. Try with SQLite for development

#### Blockchain Connection Issues
1. Check if Hardhat node is running: `npx hardhat node`
2. Verify MetaMask network settings
3. Ensure sufficient test tokens in wallet
4. Check contract deployment addresses

#### Voice Features Not Working
1. Check microphone permissions in browser
2. Ensure HTTPS for production (voice requires secure context)
3. Verify speech recognition API availability
4. Check browser compatibility (Chrome recommended)

### Performance Optimization

#### Frontend Performance
- Enable React strict mode for development
- Use React DevTools for component profiling
- Implement lazy loading for large components
- Optimize bundle size with tree shaking

#### Backend Performance
- Use connection pooling for database
- Implement caching for frequently accessed data
- Enable compression for API responses
- Monitor memory usage and optimize queries

#### Database Performance
- Add indexes for frequently queried fields
- Use database connection pooling
- Implement query optimization
- Regular database maintenance and cleanup

## Security Considerations

### Development Security
- Never commit real API keys or secrets
- Use environment variables for sensitive configuration
- Enable CORS only for trusted origins
- Implement rate limiting on API endpoints

### Production Security
- Use HTTPS everywhere
- Implement proper authentication and authorization
- Regular security updates and patches
- Monitor for unusual activity and potential breaches
- Backup data regularly and test restore procedures

### HIPAA Compliance
- Encrypt all PHI (Protected Health Information)
- Implement access controls and audit logging
- Sign Business Associate Agreements (BAAs)
- Train staff on HIPAA requirements
- Regular compliance audits and assessments

## Getting Help

### Documentation
- **API Documentation**: http://localhost:3001/api-docs (when running)
- **Component Library**: Built-in Storybook documentation
- **Blockchain Docs**: Contract documentation in `/contracts`

### Support Channels
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: Connect with other developers
- **Email Support**: support@docuhero.com
- **Live Chat**: Available during business hours

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Next Steps

### For Healthcare Providers
1. **Complete Setup**: Finish agency configuration and user setup
2. **Import Data**: Migrate existing patient data and templates
3. **Train Staff**: Use built-in training materials and workflows
4. **Go Live**: Start using for daily documentation needs

### For Developers
1. **Explore Codebase**: Understand the architecture and patterns
2. **Read Documentation**: Study API docs and component guides
3. **Set Up Development**: Configure your development environment
4. **Start Contributing**: Pick up issues and submit pull requests

### For Organizations
1. **Evaluate Features**: Test all functionality in development
2. **Plan Deployment**: Design production architecture
3. **Security Review**: Conduct security assessment
4. **Staff Training**: Develop training programs for end users

Welcome to DocuHero! We're excited to see what you'll build with our platform. 🎉