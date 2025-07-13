#!/bin/bash

# Quick Deployment Script - Free Tier Startup Edition
# 
# This script provides FREE deployment options for startups:
# - Vercel: 100GB bandwidth/month (frontend)
# - Render: 750 hours/month (backend)
# - Supabase: 500MB database
# - GitHub Actions: 2000 minutes/month (CI/CD)
# - Expo: Free mobile app builds
#
# Total cost: $0/month

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in the correct directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
        log_error "Please run this script from the project root directory"
        exit 1
    fi
}

# Show menu
show_menu() {
    echo ""
    echo "🚀 Workforce Management Platform - Free Tier Deployment"
    echo "======================================================"
    echo ""
    echo "💰 All options are FREE for startups:"
    echo ""
    echo "1) 🐳 Docker Deployment (Local - FREE)"
    echo "2) ☁️  Free Cloud Deployment (Vercel + Render)"
    echo "3) 📱 Mobile App Deployment (Expo - FREE)"
    echo "4) 🔧 Development Setup (FREE)"
    echo "5) 📊 Local Monitoring Setup (FREE)"
    echo "6) 🗄️  Database Setup (Supabase - FREE)"
    echo "7) 🧹 Clean Up (FREE)"
    echo "8) 📖 Show Help & Free Resources"
    echo "9) 🔑 Setup GitHub Secrets (FREE)"
    echo "0) ❌ Exit"
    echo ""
    echo "💡 Recommended for startups: Option 2 (Free Cloud Deployment)"
    echo ""
}

# Docker deployment (local - free)
docker_deploy() {
    log_info "Starting Docker deployment (Local - FREE)..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        log_info "Download from: https://docker.com"
        return 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        return 1
    fi
    
    log_info "Building and starting Docker containers (FREE)..."
    docker-compose up -d --build
    
    log_success "Docker deployment completed! (FREE)"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:5000/api"
    log_info "View logs: docker-compose logs -f"
    log_info "💡 This is local deployment - no cloud costs!"
}

# Free cloud deployment
free_cloud_deploy() {
    echo ""
    echo "☁️  Free Cloud Deployment Options"
    echo "================================="
    echo ""
    echo "💰 All options are FREE:"
    echo ""
    echo "1) Deploy to Vercel (Frontend - FREE - 100GB/month)"
    echo "2) Deploy to Render (Backend - FREE - 750 hours/month)"
    echo "3) Deploy to Supabase (Database - FREE - 500MB)"
    echo "4) Deploy All (Complete setup)"
    echo "5) Back to main menu"
    echo ""
    read -p "Choose an option: " cloud_choice
    
    case $cloud_choice in
        1)
            log_info "Deploying frontend to Vercel (FREE)..."
            if command -v vercel &> /dev/null; then
                vercel --prod
            else
                log_info "Installing Vercel CLI (FREE)..."
                npm install -g vercel
                vercel --prod
            fi
            log_success "Frontend deployed to Vercel! (FREE)"
            log_info "💡 You get 100GB bandwidth/month free"
            ;;
        2)
            log_info "Deploying backend to Render (FREE)..."
            log_info "Please follow these steps:"
            echo "1. Go to https://render.com (FREE signup)"
            echo "2. Create new Web Service"
            echo "3. Connect your GitHub repository"
            echo "4. Set build command: npm install"
            echo "5. Set start command: npm start"
            echo "6. Choose FREE plan"
            log_info "💡 You get 750 hours/month free"
            ;;
        3)
            log_info "Setting up Supabase database (FREE)..."
            log_info "Please follow these steps:"
            echo "1. Go to https://supabase.com (FREE signup)"
            echo "2. Create new project"
            echo "3. Get connection string from Settings → Database"
            echo "4. Add to your environment variables"
            log_info "💡 You get 500MB database free"
            ;;
        4)
            log_info "Setting up complete free deployment..."
            log_info "This will guide you through all free services"
            
            # Vercel
            log_info "Step 1: Deploy frontend to Vercel (FREE)"
            if command -v vercel &> /dev/null; then
                vercel --prod
            else
                npm install -g vercel
                vercel --prod
            fi
            
            # Render
            log_info "Step 2: Deploy backend to Render (FREE)"
            log_info "Please manually set up Render as described in option 2"
            
            # Supabase
            log_info "Step 3: Set up Supabase database (FREE)"
            log_info "Please manually set up Supabase as described in option 3"
            
            log_success "Complete free deployment guide completed!"
            log_info "💡 Total cost: $0/month"
            ;;
        5)
            return
            ;;
        *)
            log_error "Invalid option"
            return 1
            ;;
    esac
}

# Mobile app deployment (free)
mobile_deploy() {
    log_info "Starting mobile app deployment (Expo - FREE)..."
    
    if [ ! -d "mobile" ]; then
        log_error "Mobile app directory not found"
        return 1
    fi
    
    cd mobile
    
    if ! command -v npx &> /dev/null; then
        log_error "npx not found. Please install Node.js and npm."
        return 1
    fi
    
    log_info "Building Android app (FREE)..."
    npx expo build:android --non-interactive
    
    log_info "Building iOS app (FREE)..."
    npx expo build:ios --non-interactive
    
    cd ..
    log_success "Mobile app deployment completed! (FREE)"
    log_info "💡 Expo provides free builds for mobile apps"
}

# Development setup (free)
dev_setup() {
    log_info "Setting up development environment (FREE)..."
    
    log_info "Installing dependencies (FREE)..."
    npm install
    cd backend && npm install && cd ..
    cd mobile && npm install && cd ..
    
    log_info "Setting up environment files (FREE)..."
    if [ ! -f ".env" ]; then
        cp .env.example .env 2>/dev/null || echo "NODE_ENV=development" > .env
    fi
    
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env 2>/dev/null || echo "NODE_ENV=development" > backend/.env
    fi
    
    log_success "Development setup completed! (FREE)"
    log_info "Start development servers:"
    log_info "  Frontend: npm start"
    log_info "  Backend: cd backend && npm start"
    log_info "💡 All development tools are free"
}

# Monitoring setup (free)
monitoring_setup() {
    log_info "Setting up monitoring (Local - FREE)..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is required for monitoring setup"
        log_info "Download from: https://docker.com (FREE)"
        return 1
    fi
    
    docker-compose --profile monitoring up -d
    
    log_success "Monitoring setup completed! (FREE)"
    log_info "Grafana: http://localhost:3001 (admin/admin)"
    log_info "Prometheus: http://localhost:9090"
    log_info "💡 Local monitoring is completely free"
}

# Database setup (free)
database_setup() {
    log_info "Setting up database (Supabase - FREE)..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is required for local database setup"
        log_info "Download from: https://docker.com (FREE)"
        return 1
    fi
    
    docker-compose --profile database up -d
    
    log_success "Database setup completed! (FREE)"
    log_info "PostgreSQL: localhost:5432"
    log_info "Database: workforce_db"
    log_info "Username: workforce_user"
    log_info "Password: workforce_password"
    log_info "💡 Local database is free, Supabase cloud is also free (500MB)"
}

# Clean up (free)
cleanup() {
    log_info "Cleaning up (FREE)..."
    
    if command -v docker &> /dev/null; then
        log_info "Stopping Docker containers (FREE)..."
        docker-compose down -v --remove-orphans
        
        log_info "Removing unused Docker images (FREE)..."
        docker image prune -f
    fi
    
    if command -v pm2 &> /dev/null; then
        log_info "Stopping PM2 processes (FREE)..."
        pm2 delete all 2>/dev/null || true
    fi
    
    log_success "Cleanup completed! (FREE)"
}

# Show help and free resources
show_help() {
    echo ""
    echo "📖 Free Deployment Help & Resources"
    echo "==================================="
    echo ""
    echo "💰 All resources mentioned are FREE:"
    echo ""
    echo "📚 Documentation:"
    echo "  - DEPLOYMENT_GUIDE.md (included)"
    echo "  - GitHub README (free)"
    echo "  - Stack Overflow (free)"
    echo ""
    echo "🆓 Free Services:"
    echo "  - Vercel: 100GB bandwidth/month"
    echo "  - Render: 750 hours/month"
    echo "  - Supabase: 500MB database"
    echo "  - GitHub Actions: 2000 minutes/month"
    echo "  - Expo: Free mobile builds"
    echo "  - Let's Encrypt: Free SSL certificates"
    echo ""
    echo "🚀 Quick Commands:"
    echo "  npm run deploy:vercel      # Frontend to Vercel (FREE)"
    echo "  npm run deploy:render      # Backend to Render (FREE)"
    echo "  npm run deploy:mobile      # Mobile apps (FREE)"
    echo "  npm start                  # Frontend dev server"
    echo "  cd backend && npm start    # Backend dev server"
    echo ""
    echo "💡 Cost Breakdown:"
    echo "  - Frontend: $0/month (Vercel free)"
    echo "  - Backend: $0/month (Render free)"
    echo "  - Database: $0/month (Supabase free)"
    echo "  - Domain: $0/month (Freenom free)"
    echo "  - SSL: $0/month (Let's Encrypt free)"
    echo "  - Total: $0/month"
    echo ""
    echo "🔗 Free Resources:"
    echo "  - GitHub Issues: Free issue tracking"
    echo "  - Stack Overflow: Free community support"
    echo "  - Discord/Slack: Free developer communities"
    echo ""
}

# Setup GitHub secrets (free)
setup_github_secrets() {
    echo ""
    echo "🔑 GitHub Secrets Setup (FREE)"
    echo "=============================="
    echo ""
    echo "Follow these steps to set up FREE CI/CD:"
    echo ""
    echo "1. Go to your GitHub repository"
    echo "2. Settings → Secrets and variables → Actions"
    echo "3. Add these secrets (all free services):"
    echo ""
    echo "Vercel (Frontend - FREE):"
    echo "  VERCEL_TOKEN=your_vercel_token"
    echo "  VERCEL_ORG_ID=your_vercel_org_id"
    echo "  VERCEL_PROJECT_ID=your_vercel_project_id"
    echo ""
    echo "Render (Backend - FREE):"
    echo "  RENDER_SERVICE_ID=your_render_service_id"
    echo "  RENDER_API_KEY=your_render_api_key"
    echo ""
    echo "Expo (Mobile - FREE):"
    echo "  EXPO_USERNAME=your_expo_username"
    echo "  EXPO_PASSWORD=your_expo_password"
    echo ""
    echo "Application URLs:"
    echo "  REACT_APP_API_URL=https://your-backend-url.onrender.com/api"
    echo "  STAGING_URL=https://your-staging-url.vercel.app"
    echo ""
    echo "💡 How to get free tokens:"
    echo "  - Vercel: vercel.com → Settings → Tokens"
    echo "  - Render: render.com → Account → API Keys"
    echo "  - Expo: expo.dev → Account → Access Tokens"
    echo ""
    log_info "All these services are completely FREE for startups!"
}

# Main function
main() {
    check_directory
    
    while true; do
        show_menu
        read -p "Enter your choice: " choice
        
        case $choice in
            1)
                docker_deploy
                ;;
            2)
                free_cloud_deploy
                ;;
            3)
                mobile_deploy
                ;;
            4)
                dev_setup
                ;;
            5)
                monitoring_setup
                ;;
            6)
                database_setup
                ;;
            7)
                cleanup
                ;;
            8)
                show_help
                ;;
            9)
                setup_github_secrets
                ;;
            0)
                log_info "Goodbye! Remember: All deployment options are FREE! 🆓"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main 