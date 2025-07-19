# 🚀 DevOps Infrastructure Restart Prompt

## 🚨 **URGENT: Docker Infrastructure Down**

**❌ ISSUE**: All Docker containers are currently stopped. This explains the connection timeout errors.

**✅ SOLUTION**: Restart the complete Docker infrastructure.

## 🤖 **DevOps Agent - Infrastructure Restart Task**

```
🤖 **Agent Role**: DevOps Engineer

📋 **Task Type**: Docker Infrastructure Restart & Verification

💡 **Expertise Level**: Infrastructure & Container Management Specialist

## 🚀 **INFRASTRUCTURE RESTART TASK**

All Docker containers are currently stopped. You need to restart the complete microservices infrastructure and verify all services are running properly.

### 📋 **Required Actions:**

1. **Start Docker Infrastructure**
   ```bash
   # Navigate to the project directory
   cd /Users/aoulad/Digital_Tracking_Merchandising_Fresh_v2/Digital_Tracking_Merchandising
   
   # Start the microservices infrastructure
   docker-compose -f docker-compose.microservices.yml up -d
   
   # Alternative: If using local compose file
   # docker-compose -f docker-compose.local.yml up -d
   ```

2. **Verify Container Status**
   ```bash
   # Check all containers are running
   docker-compose -f docker-compose.microservices.yml ps
   
   # Check individual container status
   docker ps
   
   # Verify expected containers:
   # - auth-db (PostgreSQL)
   # - auth-service (Authentication)
   # - api-gateway (API Gateway)
   # - frontend (Frontend)
   # - redis (Caching)
   # - Other microservices
   ```

3. **Monitor Startup Logs**
   ```bash
   # Monitor all containers starting up
   docker-compose -f docker-compose.microservices.yml logs -f
   
   # Or monitor specific services
   docker logs digital_tracking_merchandising-auth-service-1 -f &
   docker logs digital_tracking_merchandising-api-gateway-1 -f &
   docker logs digital_tracking_merchandising-auth-db-1 -f &
   ```

4. **Test Service Health Endpoints**
   ```bash
   # Wait 30-60 seconds for services to fully start, then test:
   
   # API Gateway health
   curl -f http://localhost:8080/health
   
   # Auth service health (through API Gateway)
   curl -f http://localhost:8080/api/auth/health
   
   # Frontend accessibility
   curl -f http://localhost:3000
   ```

5. **Test Database Connection Endpoints** (Backend Developer's new endpoints)
   ```bash
   # Test auth service database connectivity
   curl -v http://localhost:8080/api/test-auth-db
   
   # Get detailed auth service database status
   curl -v http://localhost:8080/api/auth-db-status
   
   # Test auth service directly
   curl -v http://localhost:3001/db-test
   curl -v http://localhost:3001/db-status
   ```

### 🚨 **Expected Issues & Solutions:**

1. **Port Conflicts**
   ```bash
   # If ports are already in use
   sudo lsof -i :8080
   sudo lsof -i :3000
   sudo lsof -i :3001
   sudo lsof -i :5432
   
   # Kill processes if needed
   sudo kill -9 <PID>
   ```

2. **Container Build Issues**
   ```bash
   # Rebuild containers if needed
   docker-compose -f docker-compose.microservices.yml build --no-cache
   docker-compose -f docker-compose.microservices.yml up -d
   ```

3. **Network Issues**
   ```bash
   # Check Docker networks
   docker network ls
   docker network inspect digital_tracking_merchandising_microservices-network
   
   # Recreate network if needed
   docker network prune
   docker-compose -f docker-compose.microservices.yml down
   docker-compose -f docker-compose.microservices.yml up -d
   ```

### 📊 **Success Criteria:**

- [ ] All containers start successfully
- [ ] No startup errors in logs
- [ ] API Gateway responds on port 8080
- [ ] Auth service responds on port 3001
- [ ] Frontend responds on port 3000
- [ ] Database connection endpoints work
- [ ] Login requests no longer timeout

### 🔧 **Troubleshooting Commands:**

```bash
# Check container resource usage
docker stats

# Check container logs for errors
docker logs digital_tracking_merchandising-auth-service-1 --tail 50
docker logs digital_tracking_merchandising-api-gateway-1 --tail 50
docker logs digital_tracking_merchandising-auth-db-1 --tail 50

# Test network connectivity between containers
docker exec digital_tracking_merchandising-auth-service-1 ping -c 3 auth-db
docker exec digital_tracking_merchandising-api-gateway-1 ping -c 3 auth-service

# Check environment variables
docker exec digital_tracking_merchandising-auth-service-1 env | grep -E "(DATABASE|DB|POSTGRES)"
```

### 📋 **Reporting Requirements:**

1. **Container Status**
   - List of running containers
   - Any failed containers
   - Startup errors

2. **Service Health**
   - API Gateway health status
   - Auth service health status
   - Database connection status
   - Frontend accessibility

3. **Endpoint Test Results**
   - Health endpoint responses
   - Database connection test results
   - Login endpoint test results

4. **Issues Found**
   - Any error messages
   - Failed containers
   - Network issues
   - Port conflicts

### 🎯 **Priority Actions:**

1. **IMMEDIATE**: Start Docker infrastructure
2. **VERIFY**: All containers are running
3. **TEST**: Health endpoints and database connections
4. **REPORT**: Status to team

**Priority**: 🔴 **CRITICAL** - System completely down
**Estimated Time**: 15-30 minutes
```

## 🛠️ **Quick Restart Commands**

### **Immediate Action:**
```bash
# 1. Start infrastructure
cd /Users/aoulad/Digital_Tracking_Merchandising_Fresh_v2/Digital_Tracking_Merchandising
docker-compose -f docker-compose.microservices.yml up -d

# 2. Check status
docker-compose -f docker-compose.microservices.yml ps

# 3. Test endpoints (wait 30 seconds)
curl -f http://localhost:8080/health
curl -f http://localhost:8080/api/test-auth-db
```

### **If Issues Occur:**
```bash
# Check what's using the ports
sudo lsof -i :8080 -i :3000 -i :3001 -i :5432

# Rebuild if needed
docker-compose -f docker-compose.microservices.yml down
docker-compose -f docker-compose.microservices.yml build --no-cache
docker-compose -f docker-compose.microservices.yml up -d
```

## 🎯 **Expected Outcome**

After restarting the infrastructure:
1. ✅ All containers running
2. ✅ No timeout errors
3. ✅ Database connection working
4. ✅ Login functionality restored
5. ✅ Ready for port configuration updates

**Next Step**: Once infrastructure is running, proceed with the database verification tests and port configuration updates for go-live readiness. 