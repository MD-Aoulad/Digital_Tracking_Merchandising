#!/bin/bash

# Local Deployment Script for Workforce Management Platform
# This script can be used to deploy to a local server or VPS

set -e  # Exit on any error

# Configuration
APP_NAME="workforce-management-platform"
FRONTEND_PORT=3000
BACKEND_PORT=5000
NODE_ENV="production"

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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. This is not recommended for security reasons."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check PM2 (for process management)
    if ! command -v pm2 &> /dev/null; then
        log_info "PM2 not found. Installing PM2..."
        npm install -g pm2
    fi
    
    # Check nginx (optional)
    if ! command -v nginx &> /dev/null; then
        log_warning "nginx not found. You may want to install nginx for reverse proxy."
    fi
    
    log_success "System requirements check completed."
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    npm ci --production=false
    
    # Install backend dependencies
    cd backend
    npm ci --production=false
    cd ..
    
    # Install mobile dependencies (if needed)
    if [ -d "mobile" ]; then
        cd mobile
        npm ci --production=false
        cd ..
    fi
    
    log_success "Dependencies installed successfully."
}

# Build applications
build_applications() {
    log_info "Building applications..."
    
    # Set environment variables
    export NODE_ENV=$NODE_ENV
    export REACT_APP_API_URL="http://localhost:$BACKEND_PORT/api"
    
    # Build frontend
    log_info "Building frontend..."
    npm run build
    
    # Build backend (if build script exists)
    if [ -f "backend/package.json" ] && grep -q "\"build\"" backend/package.json; then
        log_info "Building backend..."
        cd backend
        npm run build
        cd ..
    fi
    
    log_success "Applications built successfully."
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
NODE_ENV=$NODE_ENV
PORT=$FRONTEND_PORT
REACT_APP_API_URL=http://localhost:$BACKEND_PORT/api
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=sqlite:./database.sqlite
EOF
        log_info "Created .env file with default values."
    fi
    
    # Create backend .env if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
NODE_ENV=$NODE_ENV
PORT=$BACKEND_PORT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=sqlite:./database.sqlite
CORS_ORIGIN=http://localhost:$FRONTEND_PORT
EOF
        log_info "Created backend .env file with default values."
    fi
    
    log_success "Environment setup completed."
}

# Start services with PM2
start_services() {
    log_info "Starting services with PM2..."
    
    # Stop existing processes
    pm2 delete $APP_NAME-backend 2>/dev/null || true
    pm2 delete $APP_NAME-frontend 2>/dev/null || true
    
    # Start backend
    cd backend
    pm2 start server.js --name "$APP_NAME-backend" --env production
    cd ..
    
    # Start frontend (serve static files)
    pm2 start "npx serve -s build -l $FRONTEND_PORT" --name "$APP_NAME-frontend"
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
    
    log_success "Services started successfully."
}

# Setup nginx reverse proxy (optional)
setup_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_warning "nginx not installed. Skipping nginx setup."
        return
    fi
    
    log_info "Setting up nginx reverse proxy..."
    
    # Create nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name localhost;
    
    # Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    sudo nginx -t
    
    # Reload nginx
    sudo systemctl reload nginx
    
    log_success "nginx reverse proxy configured."
}

# Setup SSL with Let's Encrypt (optional)
setup_ssl() {
    if [ -z "$DOMAIN" ]; then
        log_warning "No domain specified. Skipping SSL setup."
        return
    fi
    
    if ! command -v certbot &> /dev/null; then
        log_warning "certbot not installed. Skipping SSL setup."
        return
    fi
    
    log_info "Setting up SSL certificate for $DOMAIN..."
    
    # Update nginx config for SSL
    sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Get SSL certificate
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    log_success "SSL certificate configured for $DOMAIN."
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for services to start
    sleep 5
    
    # Check backend
    if curl -f http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "Health check completed successfully."
}

# Main deployment function
deploy() {
    log_info "Starting deployment of $APP_NAME..."
    
    check_root
    check_requirements
    install_dependencies
    setup_environment
    build_applications
    start_services
    
    if [ "$SETUP_NGINX" = "true" ]; then
        setup_nginx
    fi
    
    if [ "$SETUP_SSL" = "true" ] && [ -n "$DOMAIN" ]; then
        setup_ssl
    fi
    
    health_check
    
    log_success "Deployment completed successfully!"
    log_info "Frontend: http://localhost:$FRONTEND_PORT"
    log_info "Backend API: http://localhost:$BACKEND_PORT/api"
    log_info "PM2 Status: pm2 status"
    log_info "PM2 Logs: pm2 logs"
}

# Usage information
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --nginx          Setup nginx reverse proxy"
    echo "  --ssl DOMAIN     Setup SSL certificate for domain"
    echo "  --help           Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  FRONTEND_PORT    Frontend port (default: 3000)"
    echo "  BACKEND_PORT     Backend port (default: 5000)"
    echo "  NODE_ENV         Node environment (default: production)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Basic deployment"
    echo "  $0 --nginx                           # With nginx reverse proxy"
    echo "  $0 --nginx --ssl example.com         # With nginx and SSL"
}

# Parse command line arguments
SETUP_NGINX=false
SETUP_SSL=false
DOMAIN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --nginx)
            SETUP_NGINX=true
            shift
            ;;
        --ssl)
            SETUP_SSL=true
            DOMAIN="$2"
            shift 2
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run deployment
deploy 