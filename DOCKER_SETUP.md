# 🐳 Docker Development Environment Setup

## Overview

This project now includes a **professional multi-container Docker setup** that runs alongside your local development environment without conflicts. The Docker environment uses different ports to ensure your current working system remains unaffected.

## 🎯 **Key Benefits**

- ✅ **No conflicts** with your local development (ports 3000, 5000)
- ✅ **Production-like environment** for testing
- ✅ **Complete infrastructure** (database, cache, monitoring)
- ✅ **Easy management** with automated scripts
- ✅ **Health checks** and monitoring
- ✅ **Professional deployment** ready

## 🚀 **Quick Start**

### 1. Start Docker Environment
```bash
./docker-dev.sh start
```

### 2. Check Status
```bash
./docker-dev.sh status
```

### 3. View Logs
```bash
./docker-dev.sh logs backend-dev
```

### 4. Stop Environment
```bash
./docker-dev.sh stop
```

## 📊 **Service Ports & URLs**

| Service | Docker Port | Local Port | URL | Status |
|---------|-------------|------------|-----|---------|
| **Frontend (React)** | 3000 | 3001 | http://localhost:3001 | ✅ Working |
| **Backend (API)** | 5000 | 5001 | http://localhost:5001 | ✅ Working |
| **Mobile App** | 3002 | 3003 | http://localhost:3003 | 🔄 Starting |
| **Nginx Proxy** | 80 | 8081 | http://localhost:8081 | 🔄 Starting |
| **Grafana Dashboard** | 3000 | 3004 | http://localhost:3004 | ✅ Working |
| **Prometheus** | 9090 | 9091 | http://localhost:9091 | 🔄 Starting |
| **PostgreSQL** | 5432 | 5433 | localhost:5433 | ✅ Working |
| **Redis** | 6379 | 6380 | localhost:6380 | ✅ Working |

## 🛠 **Management Commands**

### Available Commands
```bash
./docker-dev.sh start      # Start all services
./docker-dev.sh stop       # Stop all services
./docker-dev.sh restart    # Restart all services
./docker-dev.sh status     # Show service status
./docker-dev.sh logs       # Show all logs
./docker-dev.sh logs <service>  # Show specific service logs
./docker-dev.sh exec <service> <command>  # Execute command in container
./docker-dev.sh cleanup    # Remove all containers and volumes
./docker-dev.sh help       # Show help
```

### Service Names
- `frontend-dev` - React frontend
- `backend-dev` - Node.js API
- `mobile-app-dev` - Mobile app
- `postgres-dev` - PostgreSQL database
- `redis-dev` - Redis cache
- `nginx-dev` - Nginx reverse proxy
- `prometheus-dev` - Monitoring
- `grafana-dev` - Analytics dashboard
- `db-backup-dev` - Database backup service

## 🔧 **Architecture**

### Multi-Container Setup
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Mobile App    │
│   (React)       │    │   (Node.js)     │    │   (Expo)        │
│   Port: 3001    │    │   Port: 5001    │    │   Port: 3003    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx Proxy   │
                    │   Port: 8081    │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis         │    │   Monitoring    │
│   Port: 5433    │    │   Port: 6380    │    │   Ports: 9091,  │
└─────────────────┘    └─────────────────┘    │   3004          │
                                              └─────────────────┘
```

## 🔒 **Security Features**

- **Rate limiting** on API endpoints
- **Security headers** (XSS protection, CSRF, etc.)
- **Non-root containers** for security
- **Health checks** for all services
- **Network isolation** between services

## 📈 **Monitoring & Analytics**

### Grafana Dashboard
- **URL**: http://localhost:3004
- **Credentials**: admin/admin
- **Features**: 
  - System metrics
  - Application performance
  - Database monitoring
  - Custom dashboards

### Prometheus
- **URL**: http://localhost:9091
- **Features**:
  - Metrics collection
  - Alerting rules
  - Service discovery

## 🗄 **Database Setup**

### PostgreSQL
- **Port**: 5433 (Docker) vs 5432 (Local)
- **Database**: workforce_db
- **User**: workforce_user
- **Password**: workforce_password
- **Auto-initialization**: SQL scripts loaded on startup

### Redis
- **Port**: 6380 (Docker) vs 6379 (Local)
- **Purpose**: Caching, sessions, real-time data
- **Persistence**: Data volumes

## 🔄 **Development Workflow**

### Option 1: Local Development (Current)
```bash
# Your current setup - unchanged
npm start          # Frontend on port 3000
cd backend && npm start  # Backend on port 5000
```

### Option 2: Docker Development
```bash
# New Docker setup
./docker-dev.sh start  # All services on different ports
```

### Option 3: Hybrid Approach
```bash
# Run both simultaneously
npm start          # Local frontend (port 3000)
cd backend && npm start  # Local backend (port 5000)
./docker-dev.sh start    # Docker services (ports 3001, 5001, etc.)
```

## 🚨 **Troubleshooting**

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using a port
lsof -i :3001

# Stop conflicting service or use different port
```

#### 2. Service Not Starting
```bash
# Check logs
./docker-dev.sh logs <service-name>

# Restart specific service
docker-compose -f docker-compose.dev.yml restart <service-name>
```

#### 3. Database Connection Issues
```bash
# Check database health
docker-compose -f docker-compose.dev.yml exec postgres-dev pg_isready

# Reset database
docker-compose -f docker-compose.dev.yml down -v
./docker-dev.sh start
```

#### 4. Memory Issues
```bash
# Check Docker resource usage
docker stats

# Clean up unused resources
./docker-dev.sh cleanup
```

### Health Checks
```bash
# Test backend health
curl http://localhost:5001/api/health

# Test frontend
curl http://localhost:3001

# Test nginx proxy
curl http://localhost:8081/health
```

## 📁 **File Structure**

```
Digital_Tracking_Merchandising/
├── docker-compose.dev.yml      # Development Docker Compose
├── docker-dev.sh              # Management script
├── nginx-dev.conf             # Nginx configuration
├── backend/
│   └── Dockerfile             # Backend container
├── WorkforceMobileExpo/
│   ├── Dockerfile             # Mobile app container
│   └── nginx-mobile.conf      # Mobile nginx config
├── Dockerfile.frontend        # Frontend container
└── monitoring/                # Monitoring configurations
```

## 🔄 **Migration Strategy**

### Phase 1: Parallel Development ✅
- Local development continues unchanged
- Docker environment available for testing
- No conflicts between environments

### Phase 2: Feature Testing
- Test new features in Docker environment
- Validate production-like behavior
- Performance testing with monitoring

### Phase 3: Production Deployment
- Use Docker setup for production
- CI/CD pipeline integration
- Monitoring and alerting

## 📋 **Best Practices**

1. **Always check status** before starting: `./docker-dev.sh status`
2. **Use logs for debugging**: `./docker-dev.sh logs <service>`
3. **Clean up regularly**: `./docker-dev.sh cleanup`
4. **Monitor resources**: Check Docker Desktop resource usage
5. **Backup data**: Database backups run automatically
6. **Test thoroughly**: Use both environments for validation

## 🎉 **Success Indicators**

✅ **Docker environment starts without conflicts**
✅ **All core services (frontend, backend, database) healthy**
✅ **Local development environment unaffected**
✅ **Monitoring and analytics accessible**
✅ **Professional deployment ready**

---

## 🆘 **Need Help?**

If you encounter issues:

1. **Check logs**: `./docker-dev.sh logs`
2. **Verify status**: `./docker-dev.sh status`
3. **Restart services**: `./docker-dev.sh restart`
4. **Clean slate**: `./docker-dev.sh cleanup && ./docker-dev.sh start`

Your local development environment is **completely safe** and will continue working as before! 