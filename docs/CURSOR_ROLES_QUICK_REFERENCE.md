# 🎯 Cursor Roles Quick Reference Card

## 🚀 **Daily Development Checklist**

### **Before Starting Work (MANDATORY)**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Check port availability
./scripts/check-ports.sh

# 3. Start Docker services
./scripts/docker-service-manager.sh start

# 4. Verify services are running
./scripts/docker-service-manager.sh status
```

---

## 🖥️ **Machine-Specific Role Selection**

### **🍎 Mac Development (8GB RAM - Lightweight Mode)**
**Primary Roles:**
- **Frontend Developer** - React components, TypeScript, UI implementation
- **UI/UX Expert** - Design systems, accessibility, user experience
- **JavaScript/Animation Expert** - Performance, animations, micro-interactions

**Memory Constraints:**
- **Max Docker Memory**: 4GB
- **Max Containers**: 5 essential services only
- **Excluded**: Monitoring stack, mobile app, non-essential services

**Workflow:**
```bash
# Mac memory-optimized setup
./scripts/mac-memory-optimizer.sh start
docker-compose exec frontend-app bash
# Work on components, UI/UX (lightweight mode)
```

### **💻 LG Gram Laptop**
**Primary Roles:**
- **Product Owner** - Business planning, feature prioritization, user stories
- **Backend Developer** - API development, database design, microservices
- **Network Engineer** - Service discovery, load balancing, connectivity
- **Cybersecurity Expert** - Security, compliance, threat analysis
- **DevOps Engineer** - Infrastructure, deployment, monitoring

**Workflow:**
```bash
# Windows-specific setup
./scripts/docker-service-manager.sh start --windows
docker-compose exec backend-service bash
# Work on APIs, business logic, infrastructure
```

---

## 🎯 **Role-Specific Commands**

### **Product Owner**
```bash
# Business planning tasks
# Use Product Owner role for:
- Feature planning and prioritization
- User story development
- Business requirement documentation
- Stakeholder communication
- Market research and competitive analysis
```

### **Frontend Developer**
```bash
# Component development
docker-compose exec frontend-app bash
npm run dev
npm test
./scripts/ui-compliance-checker.sh
```

### **UI/UX Expert**
```bash
# Design system work
# Focus on:
- Design system maintenance
- Accessibility implementation
- User experience optimization
- Visual design consistency
```

### **Backend Developer**
```bash
# API development
docker-compose exec backend-service bash
npm run dev
npm test
# Work on microservices, APIs, database
```

### **DevOps Engineer**
```bash
# Infrastructure management
./scripts/docker-service-manager.sh status
./scripts/check-ports.sh
./scripts/cross-platform-verifier.sh
```

---

## 🔄 **Cross-Platform Synchronization**

### **Before Committing**
```bash
# 1. Check UI compliance
./scripts/ui-compliance-checker.sh

# 2. Run tests
docker-compose run --rm service-name npm test

# 3. Verify port usage
./scripts/check-ports.sh

# 4. Commit with role-specific message
git add .
git commit -m "[ROLE] Description of changes"

# 5. Push to GitHub
git push origin main
```

### **On Other Machine**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Restart services if needed
./scripts/docker-service-manager.sh restart

# 3. Verify cross-platform compatibility
./scripts/cross-platform-verifier.sh
```

---

## 🚨 **Critical Rules (NO EXCEPTIONS)**

### **✅ Always Do These**
- ✅ Use designated roles for specific tasks
- ✅ Work in Docker containers only
- ✅ Use designated ports (3000, 8080, 3012, etc.)
- ✅ Pull latest changes before starting work
- ✅ Test on both platforms before deployment
- ✅ Follow UI immutability rules

### **❌ Never Do These**
- ❌ Develop outside Docker containers
- ❌ Use random ports
- ❌ Modify existing UI components
- ❌ Work on outdated code
- ❌ Assume cross-platform compatibility
- ❌ Skip role-specific testing

---

## 📊 **Role Assignment Matrix**

| Task | Mac Role | LG Gram Role | Collaboration |
|------|----------|-------------|---------------|
| **Business Planning** | - | Product Owner | Product Owner leads |
| **Frontend Development** | Frontend Developer | - | Mac handles UI |
| **Backend Development** | - | Backend Developer | LG Gram handles APIs |
| **UI/UX Design** | UI/UX Expert | - | Mac handles design |
| **Testing** | Web App Tester | - | Mac handles QA |
| **Deployment** | DevOps Engineer | DevOps Engineer | Both coordinate |
| **Infrastructure** | - | Network Engineer | LG Gram handles network |

---

## 🛠️ **Essential Scripts**

### **Port Management**
```bash
./scripts/check-ports.sh          # Check all ports
./scripts/port-killer.sh 3000     # Kill process on port
```

### **Memory Management (Mac 8GB)**
```bash
./scripts/mac-memory-optimizer.sh start    # Start lightweight mode
./scripts/mac-memory-optimizer.sh monitor  # Monitor memory usage
./scripts/mac-memory-optimizer.sh cleanup  # Cleanup resources
```

### **Docker Management**
```bash
./scripts/docker-service-manager.sh start    # Start all services
./scripts/docker-service-manager.sh status   # Check status
./scripts/docker-service-manager.sh stop     # Stop all services
./scripts/docker-service-manager.sh restart  # Restart services
```

### **Compliance & Testing**
```bash
./scripts/ui-compliance-checker.sh           # UI compliance check
./scripts/cross-platform-verifier.sh         # Cross-platform test
./scripts/platform-health-check.sh           # Platform health
```

---

## 🚨 **Troubleshooting**

### **Port Conflicts**
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
```

### **Cross-Platform Issues**
```bash
# Platform-specific troubleshooting
./scripts/mac-memory-optimizer.sh
./scripts/windows-troubleshooter.sh

# Cross-platform verification
./scripts/cross-platform-verifier.sh
```

---

## 📚 **Quick Links**

### **Essential Documentation**
- `docs/CURSOR_ROLES_SETUP_GUIDE.md` - Complete setup guide
- `docs/AGENT_DEVELOPMENT_STANDARDS.md` - Development standards
- `docs/AGENT_QUICK_REFERENCE.md` - Agent quick reference
- `docs/AGENT_ENFORCEMENT_GUIDE.md` - Standards enforcement

### **Role-Specific Prompts**
- `docs/agent-prompts/PRODUCT_OWNER_PROMPT.md` - Product Owner role
- `docs/agent-prompts/FRONTEND_DEVELOPER_PROMPT.md` - Frontend Developer role
- `docs/agent-prompts/UI_UX_EXPERT_PROMPT.md` - UI/UX Expert role

---

## 🎯 **Success Checklist**

### **Before Starting Work**
- [ ] Pulled latest changes from GitHub
- [ ] Ports are available and checked
- [ ] Docker services are running
- [ ] Selected appropriate role for task
- [ ] Environment is ready for development

### **During Development**
- [ ] Working in Docker container
- [ ] Following existing patterns
- [ ] Not modifying existing UI
- [ ] Using designated ports
- [ ] Testing frequently

### **Before Committing**
- [ ] UI compliance check passed
- [ ] Tests are passing
- [ ] Port usage is correct
- [ ] Cross-platform compatibility verified
- [ ] Changes are documented

---

## 📞 **Emergency Contacts**

### **When Standards Are Violated**
1. **Stop all development immediately**
2. **Document the violation**
3. **Revert changes if necessary**
4. **Contact DevOps Engineer**

### **When Help is Needed**
- **Product Owner**: Business decisions, feature planning
- **DevOps Engineer**: Infrastructure, deployment issues
- **Team Lead**: Process, coordination issues

---

**This quick reference ensures consistent development practices across both machines. Keep this handy for daily use!** 🚀 