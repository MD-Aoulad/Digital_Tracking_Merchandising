# 🏢 Complete Microservices Management Guide

## 🚀 **Quick Start Commands**

### **Start ALL Microservices:**
```cmd
start-all-microservices.bat
```

### **Stop ALL Microservices:**
```cmd
stop-all-microservices.bat
```

### **Start Only Brand Website:**
```cmd
cd microservices/brand-website
docker-start.bat
```

---

## 📋 **Complete Microservices Architecture**

### **🌐 Frontend Services:**
- **Brand Website** (Port 3013) - Enterprise brand website
- **API Gateway** (Port 8080) - Single entry point for all APIs

### **🔐 Authentication & User Management:**
- **Auth Service** (Port 3010) - JWT authentication, login/logout
- **User Service** (Port 3002) - User profiles, management

### **💬 Communication Services:**
- **Chat Service** (Port 3003) - Real-time messaging, channels
- **Notification Service** (Port 3009) - Push notifications, alerts

### **📊 Business Logic Services:**
- **Todo Service** (Port 3005) - Task management, assignments
- **Attendance Service** (Port 3007) - Time tracking, GPS verification
- **Approval Service** (Port 3011) - Workflow management, approvals
- **Workplace Service** (Port 3008) - Area management, resources
- **Report Service** (Port 3006) - Analytics, reporting

### **🗄️ Infrastructure Services:**
- **PostgreSQL Databases** - Multiple databases for each service
- **Redis Cache** - Session management, caching

---

## 🎯 **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Brand Website** | http://localhost:3013 | Enterprise brand website |
| **API Gateway** | http://localhost:8080 | Main API entry point |
| **Auth Service** | http://localhost:3010 | Authentication API |
| **User Service** | http://localhost:3002 | User management API |
| **Chat Service** | http://localhost:3003 | Messaging API |
| **Todo Service** | http://localhost:3005 | Task management API |
| **Attendance Service** | http://localhost:3007 | Time tracking API |
| **Report Service** | http://localhost:3006 | Analytics API |
| **Approval Service** | http://localhost:3011 | Workflow API |
| **Workplace Service** | http://localhost:3008 | Area management API |
| **Notification Service** | http://localhost:3009 | Notifications API |

---

## 🐳 **Docker Management Commands**

### **View All Services:**
```cmd
docker-compose ps
```

### **View Service Logs:**
```cmd
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f brand-website
```

### **Restart Services:**
```cmd
# All services
docker-compose restart

# Specific service
docker-compose restart auth-service
```

### **Stop All Services:**
```cmd
docker-compose down
```

### **View Running Containers:**
```cmd
docker ps
```

---

## 🔧 **Troubleshooting**

### **If Services Won't Start:**
1. **Check Docker is running**: `docker info`
2. **Check available ports**: `netstat -ano | findstr :8080`
3. **Clear Docker cache**: `docker system prune -f`
4. **Rebuild services**: `docker-compose build --no-cache`

### **If Brand Website Won't Load:**
1. **Check container status**: `docker ps | findstr brand-website`
2. **View logs**: `docker logs brand-website`
3. **Restart container**: `docker restart brand-website`
4. **Check port**: `netstat -ano | findstr :3013`

### **If API Gateway Won't Respond:**
1. **Check all services are running**: `docker-compose ps`
2. **View gateway logs**: `docker-compose logs api-gateway`
3. **Test individual services**: `curl http://localhost:3010/health`

---

## 📊 **Monitoring & Health Checks**

### **Service Health Status:**
```cmd
docker-compose ps
```

### **Resource Usage:**
```cmd
docker stats
```

### **Service Logs:**
```cmd
# Real-time logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f auth-service
docker-compose logs -f brand-website
```

---

## 🎯 **Development Workflow**

### **1. Start All Services:**
```cmd
start-all-microservices.bat
```

### **2. Access Applications:**
- **Brand Website**: http://localhost:3013
- **API Gateway**: http://localhost:8080
- **Individual Services**: Use the URLs in the table above

### **3. Monitor Services:**
```cmd
docker-compose ps
docker-compose logs -f
```

### **4. Stop All Services:**
```cmd
stop-all-microservices.bat
```

---

## 🚨 **Important Notes**

### **Port Requirements:**
- Ensure ports 8080, 3010-3013, 3002-3009 are available
- Check for conflicts with other applications

### **Resource Requirements:**
- **RAM**: Minimum 8GB recommended
- **CPU**: 4+ cores recommended
- **Storage**: 10GB+ free space

### **Network Requirements:**
- All services communicate via Docker network
- External access through API Gateway (port 8080)
- Brand website accessible directly (port 3013)

---

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
- ✅ **All containers running**: `docker ps` shows all services
- ✅ **Brand website accessible**: http://localhost:3013 loads
- ✅ **API Gateway responding**: http://localhost:8080/health returns 200
- ✅ **No error logs**: `docker-compose logs` shows no errors
- ✅ **Health checks passing**: `docker-compose ps` shows healthy status

---

**🏆 Your complete microservices platform is ready for enterprise development!** 