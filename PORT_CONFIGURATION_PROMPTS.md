# 🚀 Port Configuration & Service Startup Prompts

## 📊 **Current Status Assessment**

**Backend Team Achievement**: ✅ **Database connections fixed successfully!**
**Remaining Issues**: Port configuration and service startup order need optimization
**Go-Live Readiness**: ⚠️ **NEEDS FRONTEND PORT UPDATES**

## 🎯 **Tester's Recommendations**

### **Required Port Configuration:**
- **API Gateway**: Port 8080 ✅ (Currently correct)
- **Frontend**: Port 3000 ✅ (Currently correct)
- **Auth Service**: Port 3001 ✅ (Currently correct)

### **Required Service Startup Order:**
1. **Redis** (for caching)
2. **Auth Service** (for authentication)
3. **API Gateway** (for routing)
4. **Frontend** (for user interface)

## 📋 **Prompt for Frontend Agent**

```
🚨 FRONTEND AGENT - PORT CONFIGURATION UPDATE REQUIRED

**Current Status:**
✅ Backend team has successfully fixed database connections
✅ All services are running on correct ports
⚠️ Frontend needs to update API endpoint configuration

**Required Actions:**

1. **Update API Endpoint Configuration:**
   - Verify REACT_APP_API_URL is set to: http://localhost:8080/api
   - Ensure frontend is connecting to API Gateway (port 8080), not directly to auth service
   - Check that all API calls go through the API Gateway

2. **Update Environment Variables:**
   ```bash
   # Check current environment variables
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_AUTH_SERVICE_URL=http://localhost:8080/api/auth
   ```

3. **Test API Connectivity:**
   - Test API Gateway health: curl http://localhost:8080/health
   - Test login endpoint: curl -X POST http://localhost:8080/api/auth/login
   - Verify frontend can reach API Gateway

4. **Update Service Dependencies:**
   - Ensure frontend waits for API Gateway to be ready
   - Add health check for API Gateway before starting frontend
   - Implement retry logic for API Gateway connection

**Files to Update:**
- src/config/api.ts
- src/services/auth.ts
- .env files
- Docker configuration for startup order

**Expected Behavior After Fix:**
- Frontend connects to API Gateway on port 8080
- Login requests go through API Gateway → Auth Service
- No direct frontend-to-auth-service communication
- Proper service startup order maintained

**Debug Commands:**
- Check frontend environment variables
- Test API Gateway connectivity from frontend
- Monitor network requests in browser
- Verify service startup order in Docker logs
```

## 📋 **Prompt for Backend Agent**

```
🚨 BACKEND AGENT - SERVICE STARTUP ORDER OPTIMIZATION

**Current Status:**
✅ Database connections are working perfectly
✅ Auth service is responding correctly
⚠️ Service startup order needs optimization

**Required Actions:**

1. **Implement Proper Service Startup Order:**
   ```yaml
   # Docker Compose dependencies
   redis:
     # Start first - no dependencies
   
   auth-service:
     depends_on:
       - redis
       - auth-db
   
   api-gateway:
     depends_on:
       - redis
       - auth-service
   
   frontend-app:
     depends_on:
       - api-gateway
   ```

2. **Add Health Checks:**
   - Redis: Check if Redis is accepting connections
   - Auth Service: Verify /health endpoint responds
   - API Gateway: Ensure it can reach auth service
   - Frontend: Wait for API Gateway to be ready

3. **Optimize Service Configuration:**
   - Ensure auth service starts before API Gateway
   - Verify API Gateway waits for auth service health
   - Add proper timeout and retry mechanisms
   - Implement graceful shutdown handling

4. **Update Docker Compose Configuration:**
   ```yaml
   services:
     redis:
       healthcheck:
         test: ["CMD", "redis-cli", "ping"]
         interval: 10s
         timeout: 5s
         retries: 5
   
     auth-service:
       depends_on:
         redis:
           condition: service_healthy
         auth-db:
           condition: service_healthy
   
     api-gateway:
       depends_on:
         auth-service:
           condition: service_healthy
   
     frontend-app:
       depends_on:
         api-gateway:
           condition: service_healthy
   ```

**Files to Update:**
- docker-compose.microservices.yml
- Service health check configurations
- Startup scripts and dependencies

**Expected Behavior After Fix:**
- Services start in correct order: Redis → Auth → API Gateway → Frontend
- Health checks ensure services are ready before dependent services start
- No timeout issues during startup
- Proper error handling for service dependencies

**Debug Commands:**
- docker-compose -f docker-compose.microservices.yml up -d
- Monitor startup logs for each service
- Check health check status
- Verify service dependencies are working
```

## 🛠️ **DevOps Commands for Verification**

### **Check Current Port Configuration:**
```bash
# Check which ports are currently in use
docker-compose -f docker-compose.microservices.yml ps

# Check port mappings
docker port digital_tracking_merchandising-api-gateway-1
docker port digital_tracking_merchandising-frontend-app-1
docker port digital_tracking_merchandising-auth-service-1
```

### **Test Service Connectivity:**
```bash
# Test API Gateway
curl -f http://localhost:8080/health

# Test Auth Service directly
curl -f http://localhost:3010/health

# Test Frontend
curl -f http://localhost:3000

# Test login through API Gateway
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password"}'
```

### **Check Service Startup Order:**
```bash
# Monitor startup logs
docker-compose -f docker-compose.microservices.yml logs --tail=50

# Check service dependencies
docker-compose -f docker-compose.microservices.yml config
```

## 🎯 **Go-Live Readiness Checklist**

### **✅ Completed:**
- [x] Database connections fixed
- [x] Auth service responding
- [x] API Gateway running
- [x] Frontend serving

### **⚠️ Pending (Frontend Agent):**
- [ ] Update API endpoint configuration
- [ ] Verify frontend connects to API Gateway
- [ ] Test login flow through API Gateway
- [ ] Update environment variables

### **⚠️ Pending (Backend Agent):**
- [ ] Implement proper service startup order
- [ ] Add health checks for dependencies
- [ ] Optimize Docker Compose configuration
- [ ] Test service dependency chain

### **🚀 Ready for Go-Live When:**
- [ ] Frontend connects to API Gateway (port 8080)
- [ ] Services start in correct order
- [ ] Login flow works end-to-end
- [ ] All health checks pass

## 📊 **Current vs Required Configuration**

| Service | Current Port | Required Port | Status |
|---------|-------------|---------------|--------|
| API Gateway | 8080 | 8080 | ✅ Correct |
| Frontend | 3000 | 3000 | ✅ Correct |
| Auth Service | 3010 | 3001 | ⚠️ Needs Update |
| Redis | 6379 | 6379 | ✅ Correct |

## 🚀 **Next Steps**

1. **Frontend Agent**: Update API endpoint configuration to use API Gateway
2. **Backend Agent**: Fix auth service port and implement proper startup order
3. **DevOps**: Verify all services start correctly and in order
4. **Testing**: End-to-end login flow verification

**Estimated Time to Go-Live**: 1-2 hours after frontend and backend updates
**Priority**: 🔴 **HIGH** - Critical for production readiness 