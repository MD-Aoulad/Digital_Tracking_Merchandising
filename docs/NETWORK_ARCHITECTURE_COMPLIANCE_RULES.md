# Network Architecture Compliance Rules
## Digital Tracking Merchandising Platform

### 🚨 **MANDATORY COMPLIANCE REQUIREMENTS**

**ALL AGENTS MUST FOLLOW THESE RULES WITHOUT EXCEPTION**

---

## 📋 **Rule 1: Port Assignment Compliance**

### **CRITICAL: Never Change Assigned Ports**

| Service | External Port | Internal Port | **MANDATORY** |
|---------|---------------|---------------|---------------|
| Frontend | 3000 | 3000 | ✅ **NEVER CHANGE** |
| API Gateway | 8080 | 3000 | ✅ **NEVER CHANGE** |
| Auth Service | 3010 | 3001 | ✅ **NEVER CHANGE** |
| User Service | 3002 | 3002 | ✅ **NEVER CHANGE** |
| Chat Service | 3003 | 3003 | ✅ **NEVER CHANGE** |
| Attendance Service | 3007 | 3007 | ✅ **NEVER CHANGE** |
| Todo Service | 3005 | 3005 | ✅ **NEVER CHANGE** |
| Report Service | 3006 | 3006 | ✅ **NEVER CHANGE** |
| Approval Service | 3011 | 3011 | ✅ **NEVER CHANGE** |
| Workplace Service | 3008 | 3008 | ✅ **NEVER CHANGE** |
| Notification Service | 3009 | 3009 | ✅ **NEVER CHANGE** |
| Mobile App | 3003 | 3002 | ✅ **NEVER CHANGE** |
| Grafana | 3002 | 3000 | ✅ **NEVER CHANGE** |
| Prometheus | 9090 | 9090 | ✅ **NEVER CHANGE** |
| Redis | 6379 | 6379 | ✅ **NEVER CHANGE** |

### **Database Ports (MANDATORY)**
| Database | External Port | Internal Port | **MANDATORY** |
|----------|---------------|---------------|---------------|
| Auth DB | 5432 | 5432 | ✅ **NEVER CHANGE** |
| User DB | 5433 | 5432 | ✅ **NEVER CHANGE** |
| Chat DB | 5434 | 5432 | ✅ **NEVER CHANGE** |
| Attendance DB | 5435 | 5432 | ✅ **NEVER CHANGE** |
| Todo DB | 5436 | 5432 | ✅ **NEVER CHANGE** |
| Report DB | 5437 | 5432 | ✅ **NEVER CHANGE** |
| Approval DB | 5438 | 5432 | ✅ **NEVER CHANGE** |
| Workplace DB | 5439 | 5432 | ✅ **NEVER CHANGE** |
| Notification DB | 5440 | 5432 | ✅ **NEVER CHANGE** |

---

## 📋 **Rule 2: Service Architecture Compliance**

### **MANDATORY Service Dependencies**
```
API Gateway (8080) → Routes to all microservices
Auth Service (3010) → Required for all authentication
User Service (3002) → Required for user management
Attendance Service (3007) → Required for attendance features
Todo Service (3005) → Required for task management
Report Service (3006) → Required for reporting
Approval Service (3011) → Required for approvals
Workplace Service (3008) → Required for workplace management
Notification Service (3009) → Required for notifications
Chat Service (3003) → Required for messaging
Mobile App (3003) → Requires API Gateway (8080)
Frontend (3000) → Requires API Gateway (8080)
```

### **MANDATORY Network Patterns**
- **All external requests MUST go through API Gateway (8080)**
- **No direct access to microservices from external clients**
- **All services MUST be in the same Docker network**
- **Database connections MUST use internal container names**

---

## 📋 **Rule 3: Configuration Compliance**

### **MANDATORY Environment Variables**
```bash
# API Gateway
PORT=3000
EXTERNAL_PORT=8080

# Auth Service
PORT=3001
EXTERNAL_PORT=3010
AUTH_DB_URL=postgresql://auth_user:auth_password@auth-db:5432/auth_db

# Attendance Service
PORT=3007
EXTERNAL_PORT=3007
DATABASE_URL=postgresql://attendance_user:attendance_password@attendance-db:5432/attendance_db

# Mobile App
API_BASE_URL=http://localhost:8080/api  # MANDATORY
```

### **MANDATORY API Endpoints**
```
POST /api/auth/login → Auth Service (3010)
GET /api/attendance/current → Attendance Service (3007)
GET /api/todos → Todo Service (3005)
GET /api/users → User Service (3002)
```

---

## 📋 **Rule 4: Before Any Change - MANDATORY Checks**

### **Step 1: Run Architecture Validation**
```bash
./scripts/network-architecture-enforcer.sh validate
```

### **Step 2: Check Port Availability**
```bash
./scripts/check-ports.sh
```

### **Step 3: Verify Service Health**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### **Step 4: Test Critical Endpoints**
```bash
# Test API Gateway
curl -f http://localhost:8080/health

# Test Auth Service
curl -f http://localhost:3010/health

# Test Attendance Service
curl -f http://localhost:3007/health
```

---

## 📋 **Rule 5: Change Approval Process**

### **BEFORE Making ANY Changes:**

1. **Identify the Agent Role** - Which agent is making the change?
2. **Check Architecture Impact** - Will this change affect network architecture?
3. **Run Validation Script** - `./scripts/network-architecture-enforcer.sh validate`
4. **Document the Change** - What, why, and how?
5. **Test After Change** - Run validation again

### **MANDATORY Documentation for Changes:**
```markdown
## Change Request
- **Agent**: [Agent Role]
- **Change**: [Description]
- **Impact**: [Network Architecture Impact]
- **Validation**: [Pre/Post validation results]
- **Approval**: [Required]
```

---

## 📋 **Rule 6: Error Prevention**

### **NEVER DO THESE:**
- ❌ Change assigned ports
- ❌ Skip API Gateway for external requests
- ❌ Use different database connection strings
- ❌ Modify service dependencies
- ❌ Change Docker network configuration
- ❌ Skip validation before changes
- ❌ Ignore architecture documentation

### **ALWAYS DO THESE:**
- ✅ Run validation scripts before changes
- ✅ Follow port assignments exactly
- ✅ Use API Gateway for all external requests
- ✅ Test endpoints after changes
- ✅ Document all changes
- ✅ Check service health after changes

---

## 📋 **Rule 7: Monitoring and Alerts**

### **MANDATORY Health Checks**
```bash
# Daily health check
./scripts/network-architecture-enforcer.sh validate

# Weekly report
./scripts/network-architecture-enforcer.sh report

# Monthly compliance audit
./scripts/network-architecture-enforcer.sh audit
```

### **MANDATORY Alerts**
- Port conflicts detected
- Service health failures
- Network connectivity issues
- Architecture violations
- Configuration mismatches

---

## 📋 **Rule 8: Recovery Procedures**

### **When Architecture Violations Are Detected:**

1. **Immediate Action**
   ```bash
   ./scripts/network-architecture-enforcer.sh fix
   ```

2. **Manual Recovery**
   ```bash
   # Restart affected services
   docker-compose restart [service-name]
   
   # Check service health
   docker ps --format "table {{.Names}}\t{{.Status}}"
   
   # Validate architecture
   ./scripts/network-architecture-enforcer.sh validate
   ```

3. **Documentation**
   - Record the violation
   - Document the fix
   - Update procedures if needed

---

## 📋 **Rule 9: Agent-Specific Responsibilities**

### **Network Engineer (Primary)**
- ✅ Enforce all network architecture rules
- ✅ Monitor port assignments
- ✅ Validate service connectivity
- ✅ Maintain network documentation

### **DevOps Engineer**
- ✅ Ensure Docker configuration compliance
- ✅ Monitor service health
- ✅ Maintain deployment scripts
- ✅ Validate infrastructure changes

### **Backend Developer**
- ✅ Follow service port assignments
- ✅ Use correct database connections
- ✅ Implement proper API endpoints
- ✅ Test service integration

### **Frontend Developer**
- ✅ Use API Gateway endpoints only
- ✅ Follow mobile app configuration
- ✅ Test API integration
- ✅ Validate client-side requests

---

## 📋 **Rule 10: Compliance Verification**

### **Daily Verification Checklist:**
- [ ] All services running on correct ports
- [ ] API Gateway routing correctly
- [ ] Database connections working
- [ ] Service health checks passing
- [ ] No port conflicts detected
- [ ] Network connectivity verified
- [ ] Architecture documentation current

### **Weekly Verification Checklist:**
- [ ] Run full architecture validation
- [ ] Generate compliance report
- [ ] Review service dependencies
- [ ] Check configuration consistency
- [ ] Validate security settings
- [ ] Test disaster recovery procedures

---

## 🚨 **ENFORCEMENT**

### **Violation Consequences:**
1. **Immediate Rollback** - Changes violating architecture will be reverted
2. **Documentation** - All violations will be documented
3. **Review Process** - Violations trigger architecture review
4. **Training** - Agents involved in violations require additional training

### **Compliance Rewards:**
1. **Faster Development** - Compliant changes are approved faster
2. **System Stability** - Reduced downtime and issues
3. **Team Recognition** - Agents following rules are recognized
4. **Career Growth** - Architecture compliance is a key skill

---

## 📞 **Support and Escalation**

### **When in Doubt:**
1. **Check Documentation** - `docs/NETWORK_ARCHITECTURE.md`
2. **Run Validation** - `./scripts/network-architecture-enforcer.sh validate`
3. **Consult Network Engineer** - Primary authority on architecture
4. **Escalate to DevOps** - For infrastructure issues
5. **Document Everything** - All decisions and actions

### **Emergency Contacts:**
- **Network Engineer**: Primary architecture authority
- **DevOps Engineer**: Infrastructure and deployment
- **Backend Developer**: Service integration
- **Frontend Developer**: Client-side integration

---

**Remember: Network Architecture Compliance is NOT optional. It's MANDATORY for system stability, security, and performance.**

**Last Updated: July 23, 2025**
**Network Engineer: Senior Network Engineer (8+ Years Experience)** 