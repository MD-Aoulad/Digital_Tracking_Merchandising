# Agent Quick Reference Card

## 🚨 **DAILY DEVELOPMENT CHECKLIST**

### **Before Starting Work (MANDATORY)**
```bash
# 1. Check port availability
./scripts/check-ports.sh

# 2. Start Docker services
./scripts/docker-service-manager.sh start

# 3. Verify services are running
./scripts/docker-service-manager.sh status
```

### **Before Committing (MANDATORY)**
```bash
# 1. Check UI compliance
./scripts/ui-compliance-checker.sh

# 2. Run tests
docker-compose run --rm service-name npm test

# 3. Verify port usage
./scripts/check-ports.sh
```

---

## 🔧 **Common Commands**

### **Port Management**
```bash
# Check all ports
./scripts/check-ports.sh

# Kill process on specific port
./scripts/port-killer.sh 3000

# Check specific port
lsof -i :3000
```

### **Docker Management**
```bash
# Start all services
./scripts/docker-service-manager.sh start

# Start specific service
./scripts/docker-service-manager.sh start frontend

# Stop all services
./scripts/docker-service-manager.sh stop

# Check status
./scripts/docker-service-manager.sh status

# View logs
./scripts/docker-service-manager.sh logs

# Restart services
./scripts/docker-service-manager.sh restart
```

### **Development Workflow**
```bash
# Work in container
docker-compose exec service-name bash

# Run tests
docker-compose run --rm service-name npm test

# Run specific test
docker-compose run --rm service-name npm test -- --testNamePattern="test name"

# Build service
docker-compose build service-name
```

---

## 📋 **Designated Ports**

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| API Gateway | 8000 | http://localhost:8000 |
| Auth Service | 8001 | http://localhost:8001 |
| User Service | 8002 | http://localhost:8002 |
| Todo Service | 8003 | http://localhost:8003 |
| Chat Service | 8004 | http://localhost:8004 |
| Notification Service | 8005 | http://localhost:8005 |
| Approval Service | 8006 | http://localhost:8006 |
| Report Service | 8007 | http://localhost:8007 |
| Attendance Service | 8008 | http://localhost:8008 |
| Workplace Service | 8009 | http://localhost:8009 |
| Mobile App | 19000 | http://localhost:19000 |
| Database | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Grafana | 3001 | http://localhost:3001 |
| Prometheus | 9090 | http://localhost:9090 |

---

## 🚨 **CRITICAL RULES**

### **NEVER DO THESE**
- ❌ Change existing UI components
- ❌ Use random ports
- ❌ Suggest new technologies
- ❌ Develop outside Docker
- ❌ Modify existing CSS/styling
- ❌ Change navigation structure

### **ALWAYS DO THESE**
- ✅ Check ports before starting
- ✅ Work in Docker containers
- ✅ Use designated ports only
- ✅ Test before committing
- ✅ Check UI compliance
- ✅ Follow existing patterns

---

## 🆘 **Troubleshooting**

### **Port Already in Use**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
./scripts/port-killer.sh 3000

# Verify port is free
lsof -i :3000
```

### **Docker Issues**
```bash
# Check Docker status
docker info

# Restart Docker services
./scripts/docker-service-manager.sh restart

# Clean up Docker resources
./scripts/docker-service-manager.sh clean

# View service logs
./scripts/docker-service-manager.sh logs service-name
```

### **UI Compliance Issues**
```bash
# Check UI changes
./scripts/ui-compliance-checker.sh

# Check against specific commit
./scripts/ui-compliance-checker.sh HEAD~5

# Get help
./scripts/ui-compliance-checker.sh help
```

---

## 📚 **Documentation**

### **Essential Reading**
- `docs/AGENT_DEVELOPMENT_STANDARDS.md` - Complete standards
- `docs/AGENT_ENFORCEMENT_GUIDE.md` - How to enforce standards
- `docs/PRODUCT_OWNER_ROADMAP.md` - Product direction

### **Script Help**
```bash
# Get help for any script
./scripts/check-ports.sh --help
./scripts/port-killer.sh --help
./scripts/docker-service-manager.sh help
./scripts/ui-compliance-checker.sh help
```

---

## 🎯 **Success Checklist**

### **Before Starting Work**
- [ ] Ports are available
- [ ] Docker is running
- [ ] Services are started
- [ ] Environment is ready

### **During Development**
- [ ] Working in Docker container
- [ ] Following existing patterns
- [ ] Not modifying existing UI
- [ ] Using designated ports

### **Before Committing**
- [ ] UI compliance check passed
- [ ] Tests are passing
- [ ] Port usage is correct
- [ ] Changes are documented

---

## 📞 **Emergency Contacts**

### **When Standards Are Violated**
1. **Stop all development immediately**
2. **Document the violation**
3. **Revert changes if necessary**
4. **Contact Product Owner**

### **When Help is Needed**
- **Product Owner**: Business decisions, standards updates
- **DevOps Engineer**: Infrastructure, deployment issues
- **Team Lead**: Process, coordination issues

---

**This quick reference ensures consistent development practices across all agents. Keep this handy for daily use!** 