# Agent Development Standards & Guidelines

## 🚨 **CRITICAL: ALL AGENTS MUST FOLLOW THESE STANDARDS**

This document defines the **mandatory standards** that ALL agents must follow when working on the Digital Tracking Merchandising platform. **NO EXCEPTIONS** are allowed.

---

## 🎯 **Core Development Principles**

### **1. UI/UX IMMUTABILITY RULE**
```
🚫 NEVER CHANGE THE EXISTING UI
✅ ONLY ADD NEW FEATURES WITHOUT MODIFYING EXISTING UI
✅ MAINTAIN EXACT SAME LOOK AND FEEL
✅ PRESERVE ALL EXISTING USER EXPERIENCES
```

**What this means:**
- **DO NOT** modify existing component layouts
- **DO NOT** change existing styling or CSS
- **DO NOT** alter existing navigation or menu structures
- **DO NOT** modify existing form layouts or input fields
- **ONLY** add new components or features in designated areas
- **ONLY** extend existing functionality without changing the interface

### **2. PORT MANAGEMENT RULE**
```
🚫 NEVER USE RANDOM PORTS
🚫 NEVER JUMP TO OTHER PORTS IF ONE IS BUSY
✅ ALWAYS STOP EXISTING PROCESSES ON REQUIRED PORTS
✅ ALWAYS USE DESIGNATED PORTS FOR EACH SERVICE
✅ ALWAYS VERIFY PORT AVAILABILITY BEFORE STARTING
```

**Designated Ports:**
- **Frontend Web App**: `3000`
- **Backend API Gateway**: `8000`
- **Auth Service**: `8001`
- **User Service**: `8002`
- **Todo Service**: `8003`
- **Chat Service**: `8004`
- **Notification Service**: `8005`
- **Approval Service**: `8006`
- **Report Service**: `8007`
- **Attendance Service**: `8008`
- **Workplace Service**: `8009`
- **Mobile App (Expo)**: `19000`, `19001`, `19002`
- **Database**: `5432`
- **Redis**: `6379`
- **Monitoring (Prometheus)**: `9090`
- **Monitoring (Grafana)**: `3001`

**Port Management Process:**
1. **Check if port is in use**: `lsof -i :PORT_NUMBER`
2. **Stop existing process**: `kill -9 PID` or `docker stop CONTAINER_NAME`
3. **Verify port is free**: `lsof -i :PORT_NUMBER` (should return empty)
4. **Start your service**: Only after confirming port availability

### **3. TECH STACK IMMUTABILITY RULE**
```
🚫 NEVER CHANGE THE TECH STACK
🚫 NEVER SUGGEST NEW TECHNOLOGIES
🚫 NEVER PROPOSE FRAMEWORK CHANGES
✅ ALWAYS USE EXISTING TECHNOLOGIES
✅ ALWAYS WORK WITHIN ESTABLISHED ARCHITECTURE
```

**Current Tech Stack (IMMUTABLE):**
- **Frontend**: React 18+ with TypeScript
- **Mobile**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Containerization**: Docker
- **Architecture**: Microservices
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library, Cypress
- **Monitoring**: Prometheus, Grafana
- **CI/CD**: GitHub Actions

### **4. DOCKER MICROSERVICES RULE**
```
🚫 NEVER DEVELOP OUTSIDE DOCKER
🚫 NEVER MODIFY SERVICES WITHOUT DOCKER
✅ ALWAYS USE DOCKER FOR DEVELOPMENT
✅ ALWAYS WORK WITHIN MICROSERVICES ARCHITECTURE
✅ ALWAYS TEST IN ISOLATED CONTAINERS
```

**Docker Development Process:**
1. **Always use Docker Compose** for local development
2. **Never run services directly** on host machine
3. **Always test in isolated containers**
4. **Always use service discovery** between microservices
5. **Always maintain service boundaries**

---

## 🔧 **Development Workflow Standards**

### **Before Starting Any Work**

#### **1. Environment Setup Check**
```bash
# Check if Docker is running
docker --version
docker-compose --version

# Check if all required ports are available
./scripts/check-ports.sh

# Verify all services are stopped
docker-compose down
```

#### **2. Service-Specific Setup**
```bash
# For Frontend Development
cd frontend/
docker-compose up frontend

# For Backend Development
cd backend/
docker-compose up backend

# For Mobile Development
cd WorkforceMobileExpo/
docker-compose up mobile

# For Full Stack Development
cd ./
docker-compose up
```

#### **3. Port Verification Script**
Create and use this script before starting any service:

```bash
#!/bin/bash
# scripts/check-ports.sh

PORTS=(3000 8000 8001 8002 8003 8004 8005 8006 8007 8008 8009 19000 19001 19002 5432 6379 9090 3001)

echo "Checking port availability..."

for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is in use by:"
        lsof -Pi :$port -sTCP:LISTEN
        echo "Please stop the process using port $port before continuing."
        exit 1
    else
        echo "✅ Port $port is available"
    fi
done

echo "All ports are available. Safe to proceed."
```

### **Development Process**

#### **1. Feature Development**
```bash
# 1. Check out feature branch
git checkout -b feature/your-feature-name

# 2. Verify environment
./scripts/check-ports.sh

# 3. Start required services
docker-compose up -d service-name

# 4. Develop and test
# 5. Commit changes
git add .
git commit -m "feat: add your feature description"

# 6. Stop services
docker-compose down
```

#### **2. Testing Process**
```bash
# 1. Run tests in Docker
docker-compose run --rm service-name npm test

# 2. Run integration tests
docker-compose run --rm service-name npm run test:integration

# 3. Run e2e tests
docker-compose run --rm service-name npm run test:e2e
```

#### **3. Code Review Process**
```bash
# 1. Create pull request
git push origin feature/your-feature-name

# 2. Ensure all tests pass
# 3. Verify no UI changes (screenshots comparison)
# 4. Verify port usage is correct
# 5. Verify Docker compatibility
```

---

## 📋 **Agent-Specific Guidelines**

### **Frontend Developer Standards**
```
✅ DO:
- Add new components in designated areas
- Extend existing functionality
- Maintain existing styling patterns
- Use existing component library
- Follow established TypeScript patterns
- Test in Docker containers

❌ DON'T:
- Modify existing component layouts
- Change existing CSS or styling
- Alter navigation structure
- Introduce new UI frameworks
- Run services outside Docker
```

### **Backend Developer Standards**
```
✅ DO:
- Work within microservices architecture
- Use designated ports for each service
- Follow established API patterns
- Maintain service boundaries
- Test in isolated containers
- Use existing database schemas

❌ DON'T:
- Create monolithic services
- Use random ports
- Modify existing API contracts
- Change database structure without migration
- Run services outside Docker
```

### **Web App Tester Standards**
```
✅ DO:
- Test in Docker environments
- Use designated test ports
- Follow existing test patterns
- Maintain test data consistency
- Test UI without modifying it
- Verify port usage compliance

❌ DON'T:
- Test outside Docker containers
- Use production ports for testing
- Modify UI during testing
- Create test data that conflicts with existing
- Skip port verification
```

### **DevOps Engineer Standards**
```
✅ DO:
- Maintain Docker configurations
- Ensure port isolation
- Monitor service boundaries
- Maintain CI/CD pipelines
- Keep tech stack consistent
- Monitor resource usage

❌ DON'T:
- Change Docker configurations without testing
- Allow port conflicts
- Modify service architecture
- Introduce new deployment methods
- Change monitoring tools
```

---

## 🚨 **Compliance Verification Checklist**

### **Before Every Commit**
- [ ] **UI Check**: No existing UI components modified
- [ ] **Port Check**: All services use designated ports
- [ ] **Tech Stack Check**: No new technologies introduced
- [ ] **Docker Check**: All changes work in Docker containers
- [ ] **Test Check**: All tests pass in Docker environment

### **Before Every Pull Request**
- [ ] **Screenshot Comparison**: UI remains identical
- [ ] **Port Verification**: No port conflicts
- [ ] **Docker Build**: All services build successfully
- [ ] **Integration Test**: All services work together
- [ ] **Documentation**: Changes are documented

### **Before Every Deployment**
- [ ] **Production Port Check**: All production ports available
- [ ] **Docker Production Build**: All containers build successfully
- [ ] **Migration Check**: Database migrations are safe
- [ ] **Rollback Plan**: Rollback strategy is documented
- [ ] **Monitoring Check**: All monitoring is functional

---

## 🔧 **Tools and Scripts**

### **Port Management Scripts**

#### **1. Port Checker**
```bash
#!/bin/bash
# scripts/port-checker.sh

SERVICE_PORTS=(
    "frontend:3000"
    "api-gateway:8000"
    "auth-service:8001"
    "user-service:8002"
    "todo-service:8003"
    "chat-service:8004"
    "notification-service:8005"
    "approval-service:8006"
    "report-service:8007"
    "attendance-service:8008"
    "workplace-service:8009"
    "mobile-expo:19000"
    "mobile-expo-dev:19001"
    "mobile-expo-metro:19002"
    "database:5432"
    "redis:6379"
    "prometheus:9090"
    "grafana:3001"
)

echo "🔍 Checking port availability for all services..."

for service_port in "${SERVICE_PORTS[@]}"; do
    IFS=':' read -r service port <<< "$service_port"
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ $service ($port): IN USE"
        lsof -Pi :$port -sTCP:LISTEN
    else
        echo "✅ $service ($port): AVAILABLE"
    fi
done
```

#### **2. Port Killer**
```bash
#!/bin/bash
# scripts/port-killer.sh

if [ -z "$1" ]; then
    echo "Usage: ./port-killer.sh <port_number>"
    exit 1
fi

PORT=$1

echo "🔫 Killing processes on port $PORT..."

PIDS=$(lsof -ti:$PORT)

if [ -z "$PIDS" ]; then
    echo "✅ Port $PORT is already free"
else
    echo "🔄 Stopping processes: $PIDS"
    kill -9 $PIDS
    echo "✅ Port $PORT is now free"
fi
```

#### **3. Docker Service Manager**
```bash
#!/bin/bash
# scripts/docker-service-manager.sh

case "$1" in
    "start")
        echo "🚀 Starting services..."
        docker-compose up -d
        ;;
    "stop")
        echo "🛑 Stopping services..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Restarting services..."
        docker-compose down
        docker-compose up -d
        ;;
    "status")
        echo "📊 Service status..."
        docker-compose ps
        ;;
    "logs")
        echo "📝 Service logs..."
        docker-compose logs -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
```

### **UI Compliance Checker**
```bash
#!/bin/bash
# scripts/ui-compliance-checker.sh

echo "🎨 Checking UI compliance..."

# Check for UI-related changes
UI_CHANGES=$(git diff --name-only HEAD~1 | grep -E "\.(css|scss|tsx|jsx)$" | grep -v "test")

if [ -n "$UI_CHANGES" ]; then
    echo "⚠️  UI changes detected:"
    echo "$UI_CHANGES"
    echo ""
    echo "Please ensure these changes don't modify existing UI components."
    echo "Only new components or non-visual changes are allowed."
    exit 1
else
    echo "✅ No UI changes detected"
fi
```

---

## 📚 **Documentation Requirements**

### **For Every Feature**
1. **Feature Documentation**: Document in `/docs/features/`
2. **API Documentation**: Update OpenAPI specs
3. **Testing Documentation**: Document test scenarios
4. **Deployment Documentation**: Document deployment steps
5. **Port Documentation**: Document any new port usage

### **For Every Bug Fix**
1. **Root Cause Analysis**: Document the root cause
2. **Fix Documentation**: Document the fix applied
3. **Prevention Measures**: Document how to prevent recurrence
4. **Testing Documentation**: Document test cases

### **For Every Configuration Change**
1. **Change Documentation**: Document what was changed
2. **Impact Analysis**: Document potential impacts
3. **Rollback Plan**: Document rollback procedures
4. **Validation Steps**: Document validation procedures

---

## 🚨 **Violation Consequences**

### **UI Changes Violation**
- **Immediate**: Revert all UI changes
- **Process**: Create new branch with UI-compliant implementation
- **Documentation**: Document why UI changes were attempted

### **Port Violation**
- **Immediate**: Stop all services using wrong ports
- **Process**: Use correct ports and restart services
- **Documentation**: Document port conflict resolution

### **Tech Stack Violation**
- **Immediate**: Revert to existing tech stack
- **Process**: Implement using existing technologies
- **Documentation**: Document why new tech was attempted

### **Docker Violation**
- **Immediate**: Move development to Docker
- **Process**: Test in isolated containers
- **Documentation**: Document Docker migration

---

## 📞 **Support and Escalation**

### **When Standards Are Unclear**
1. **Check this document first**
2. **Review existing codebase patterns**
3. **Ask Product Owner for clarification**
4. **Create documentation for future reference**

### **When Standards Conflict**
1. **Document the conflict**
2. **Escalate to Product Owner**
3. **Get explicit decision**
4. **Update standards document**

### **When Standards Need Updates**
1. **Propose changes to Product Owner**
2. **Get approval from all agents**
3. **Update this document**
4. **Communicate changes to team**

---

**This document is MANDATORY for all agents. Violations will result in immediate reversion and documentation of the violation. The goal is to maintain a stable, consistent, and reliable development environment.** 