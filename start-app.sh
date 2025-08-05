#!/bin/bash

# DocuHero Platform Start Script
# This script starts the complete DocuHero platform including backend, frontend, and blockchain services

echo "🚀 Starting DocuHero Platform..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i :$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if ! command_exists npx; then
    echo -e "${RED}❌ npx is not installed. Please install npx and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"

# Create necessary directories
echo -e "${BLUE}Creating necessary directories...${NC}"
mkdir -p uploads
mkdir -p logs
mkdir -p cache
mkdir -p artifacts
mkdir -p deployments

# Check for and kill existing processes on our ports
echo -e "${BLUE}Checking for existing processes...${NC}"
if port_in_use 3001; then
    echo -e "${YELLOW}Backend server is already running on port 3001${NC}"
    kill_port 3001
fi

if port_in_use 5173; then
    echo -e "${YELLOW}Frontend server is already running on port 5173${NC}"
    kill_port 5173
fi

if port_in_use 8545; then
    echo -e "${YELLOW}Blockchain node is running on port 8545${NC}"
    # Don't kill blockchain node as it might be external
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please update .env file with your configuration${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found. Creating basic .env file...${NC}"
        cat > .env << EOL
# Database Configuration
DATABASE_URL="postgresql://docuhero:password@localhost:5432/docuhero_dev"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Blockchain Configuration
SEPOLIA_URL=""
MAINNET_URL=""
POLYGON_URL=""
MUMBAI_URL=""
PRIVATE_KEY=""
ETHERSCAN_API_KEY=""
POLYGONSCAN_API_KEY=""

# External Services
OPENAI_API_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""

# Email Configuration
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# File Upload
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="./uploads"

# Logging
LOG_LEVEL="info"
NODE_ENV="development"
EOL
    fi
fi

# Check if database is configured
echo -e "${BLUE}Checking database configuration...${NC}"
if grep -q "postgresql://docuhero:password@localhost:5432/docuhero_dev" .env; then
    echo -e "${YELLOW}⚠️  Using default database URL. Make sure PostgreSQL is running or update .env${NC}"
fi

# Start the application based on user choice
echo ""
echo -e "${BLUE}Choose startup option:${NC}"
echo "1) Full platform (Backend + Frontend + Database)"  
echo "2) Backend only"
echo "3) Frontend only"
echo "4) Full platform + Blockchain development node"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Starting full DocuHero platform...${NC}"
        
        # Check if database is needed
        if command_exists prisma; then
            echo -e "${BLUE}Initializing database...${NC}"
            npx prisma generate 2>/dev/null || echo -e "${YELLOW}⚠️  Prisma generate failed or not configured${NC}"
            npx prisma db push 2>/dev/null || echo -e "${YELLOW}⚠️  Database push failed or not configured${NC}"
        fi
        
        # Start both frontend and backend
        npm run dev
        ;;
    2)
        echo -e "${GREEN}🔧 Starting backend server only...${NC}"
        npm run dev:backend
        ;;
    3)
        echo -e "${GREEN}🎨 Starting frontend only...${NC}"
        npm run dev:frontend
        ;;
    4)
        echo -e "${GREEN}🚀 Starting full platform with blockchain...${NC}"
        
        # Start local blockchain node in background
        echo -e "${BLUE}Starting local blockchain node...${NC}"
        npx hardhat node > logs/blockchain.log 2>&1 &
        BLOCKCHAIN_PID=$!
        
        # Wait for blockchain to start
        sleep 5
        
        # Compile and deploy contracts
        echo -e "${BLUE}Compiling smart contracts...${NC}"
        npm run blockchain:compile
        
        if [ $? -eq 0 ]; then
            echo -e "${BLUE}Deploying smart contracts...${NC}"
            npm run blockchain:deploy -- --network localhost
        fi
        
        # Start full platform
        npm run dev
        
        # Cleanup function
        cleanup() {
            echo -e "\n${YELLOW}Shutting down...${NC}"
            kill $BLOCKCHAIN_PID 2>/dev/null
            exit 0
        }
        trap cleanup INT TERM
        ;;
    5)
        echo -e "${BLUE}Goodbye! 👋${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

# Wait for user input to keep the script running
if [ "$choice" = "4" ]; then
    echo ""
    echo -e "${GREEN}✅ DocuHero platform is running!${NC}"
    echo -e "${BLUE}📊 Frontend: http://localhost:5173${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:3001${NC}"
    echo -e "${BLUE}⛓️  Blockchain: http://localhost:8545${NC}"
    echo -e "${BLUE}📋 Health Check: http://localhost:3001/health${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    wait
fi