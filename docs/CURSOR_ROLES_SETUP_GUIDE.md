# 🎯 Cursor Roles Setup Guide for Cross-Platform Development

## 📋 **Overview**

This guide provides the optimal Cursor roles configuration for seamless development between **Mac** and **LG Gram laptop** for the Digital Tracking Merchandising Platform. This setup ensures consistent development experience, prevents platform-specific issues, and maximizes productivity across both machines.

---

## 🚀 **Recommended Cursor Roles Configuration**

### **📋 Primary Roles (Essential for Both Machines)**

#### **1. 🎯 Product Owner Role**
```json
{
  "name": "Product Owner",
  "description": "Senior Product Owner with 10+ years retail operations experience",
  "prompt": "You are a Senior Product Owner specializing in retail operations, workforce management, and business strategy. Focus on user needs, business value, and retail industry best practices. Always consider the impact on merchandising professionals and field operations.",
  "context": "docs/agent-prompts/PRODUCT_OWNER_PROMPT.md",
  "focusAreas": [
    "Business Planning",
    "Feature Prioritization", 
    "User Story Development",
    "Stakeholder Management",
    "Retail Operations"
  ]
}
```

#### **2. 👨‍💻 Frontend Developer Role**
```json
{
  "name": "Frontend Developer",
  "description": "Senior Frontend Developer with 15+ years React/TypeScript experience",
  "prompt": "You are a Senior Frontend Developer specializing in React 18+, TypeScript, and modern frontend architecture. Focus on component development, performance optimization, and maintaining the existing UI/UX standards. Always work within Docker containers and follow the established tech stack.",
  "context": "docs/agent-prompts/FRONTEND_DEVELOPER_PROMPT.md",
  "focusAreas": [
    "React Components",
    "TypeScript Development",
    "Performance Optimization",
    "UI Implementation",
    "Docker Development"
  ]
}
```

#### **3. 🎨 UI/UX Expert Role**
```json
{
  "name": "UI/UX Expert",
  "description": "Senior UI/UX Expert with 15+ years design system experience",
  "prompt": "You are a Senior UI/UX Expert specializing in design systems, accessibility, and user experience optimization. Focus on maintaining design consistency, WCAG compliance, and enhancing user interactions without modifying existing UI components.",
  "context": "docs/agent-prompts/UI_UX_EXPERT_PROMPT.md",
  "focusAreas": [
    "Design Systems",
    "Accessibility (WCAG)",
    "User Experience",
    "Visual Design",
    "Interaction Design"
  ]
}
```

#### **4. 🚀 DevOps Engineer Role**
```json
{
  "name": "DevOps Engineer",
  "description": "Senior DevOps Engineer with 15+ years infrastructure experience",
  "prompt": "You are a Senior DevOps Engineer specializing in Docker, microservices, and cross-platform deployment. Focus on infrastructure management, service orchestration, and ensuring consistent deployment across Mac and Windows environments.",
  "context": "docs/AGENT_DEVELOPMENT_STANDARDS.md",
  "focusAreas": [
    "Docker Management",
    "Microservices Architecture",
    "Cross-Platform Deployment",
    "Infrastructure Management",
    "Service Orchestration"
  ]
}
```

---

## 🖥️ **Machine-Specific Role Configurations**

### **🍎 Mac Development Setup**

#### **Primary Focus: Development & Testing**
```json
{
  "machine": "Mac",
  "primaryWorkflow": "Development, testing, and local deployment",
  "recommendedRoles": [
    "Frontend Developer",
    "UI/UX Expert", 
    "JavaScript/Animation Expert",
    "Web App Tester",
    "DevOps Engineer"
  ],
  "specializations": [
    "Component Development",
    "UI/UX Implementation",
    "Performance Optimization",
    "Testing & Quality Assurance",
    "Local Development & Debugging"
  ]
}
```

#### **Mac-Specific Commands & Scripts**
```bash
# Mac-specific port management
./scripts/check-ports.sh
./scripts/port-killer.sh 3000  # Kill AirPlay if needed

# Mac-optimized Docker setup
./scripts/docker-service-manager.sh start --mac

# Mac-specific troubleshooting
./scripts/mac-optimizer.sh

# Mac-specific performance monitoring
./scripts/mac-performance-monitor.sh
```

#### **Mac Development Workflow**
```bash
# 1. Morning Setup
git pull origin main
./scripts/check-ports.sh
./scripts/docker-service-manager.sh start --mac

# 2. Development Tasks
docker-compose exec frontend-app bash
# Work on React components, TypeScript, UI/UX

# 3. Testing
docker-compose run --rm frontend-app npm test
./scripts/ui-compliance-checker.sh

# 4. Evening Cleanup
./scripts/docker-service-manager.sh stop
git add . && git commit -m "[Frontend] Component updates"
git push origin main
```

### **💻 LG Gram Laptop Setup**

#### **Primary Focus: Business & Strategy**
```json
{
  "machine": "LG Gram Laptop",
  "primaryWorkflow": "Business planning, backend development, and deployment",
  "recommendedRoles": [
    "Product Owner",
    "Backend Developer",
    "Network Engineer",
    "Cybersecurity Expert",
    "DevOps Engineer"
  ],
  "specializations": [
    "Business Strategy",
    "API Development",
    "Database Design",
    "Network Infrastructure",
    "Security & Compliance"
  ]
}
```

#### **LG Gram-Specific Commands & Scripts**
```bash
# Windows-specific port management
./scripts/check-ports.sh
./scripts/windows-port-manager.sh

# WSL2 optimization
./scripts/optimize-wsl2.sh

# Windows-specific Docker setup
./scripts/docker-service-manager.sh start --windows

# Windows-specific troubleshooting
./scripts/windows-troubleshooter.sh
```

#### **LG Gram Development Workflow**
```bash
# 1. Morning Setup
git pull origin main
./scripts/check-ports.sh
./scripts/docker-service-manager.sh start --windows

# 2. Business Tasks
# Use Product Owner role for feature planning, user stories
# Use Backend Developer role for API development

# 3. Backend Development
docker-compose exec backend-service bash
# Work on Node.js APIs, database design, microservices

# 4. Evening Cleanup
./scripts/docker-service-manager.sh stop
git add . && git commit -m "[Backend] API updates"
git push origin main
```

---

## 🔄 **Cross-Platform Workflow Strategy**

### **📋 Synchronized Development Process**

#### **1. 🎯 Business Planning (LG Gram)**
```bash
# Use Product Owner role for:
- Feature planning and prioritization
- User story development
- Business requirement documentation
- Stakeholder communication
- Market research and competitive analysis
- Performance metrics and KPI measurement
```

#### **2. 🖥️ Development & Testing (Mac)**
```bash
# Use Frontend/UI/UX roles for:
- Component development and UI implementation
- Design system maintenance and enhancement
- Performance optimization and bundle analysis
- Testing and quality assurance
- Local development and debugging
- Accessibility implementation
```

#### **3. 🚀 Deployment & Infrastructure (Both)**
```bash
# Use DevOps role for:
- Cross-platform deployment orchestration
- Service management and health monitoring
- Infrastructure optimization
- Performance monitoring and alerting
- Security and compliance management
- Backup and disaster recovery
```

---

## 🛠️ **Essential Cursor Settings**

### **📁 Project-Specific Configuration**

#### **1. Workspace Settings**
```json
{
  "cursor.workspace": {
    "projectType": "microservices",
    "techStack": ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL"],
    "architecture": "microservices",
    "deployment": "cross-platform",
    "platforms": ["macOS", "Windows"],
    "developmentMode": "docker-first"
  }
}
```

#### **2. Role-Specific Prompts**
```json
{
  "cursor.roles": {
    "productOwner": {
      "context": "docs/agent-prompts/PRODUCT_OWNER_PROMPT.md",
      "focus": ["business", "retail", "user-needs", "stakeholder-management"],
      "machine": "lg-gram",
      "workflow": "business-planning"
    },
    "frontendDeveloper": {
      "context": "docs/agent-prompts/FRONTEND_DEVELOPER_PROMPT.md", 
      "focus": ["react", "typescript", "ui-components", "performance"],
      "machine": "mac",
      "workflow": "component-development"
    },
    "uiUxExpert": {
      "context": "docs/agent-prompts/UI_UX_EXPERT_PROMPT.md",
      "focus": ["design-system", "accessibility", "user-experience", "visual-design"],
      "machine": "mac",
      "workflow": "ui-ux-design"
    },
    "devOpsEngineer": {
      "context": "docs/AGENT_DEVELOPMENT_STANDARDS.md",
      "focus": ["docker", "microservices", "deployment", "infrastructure"],
      "machine": "both",
      "workflow": "deployment-management"
    }
  }
}
```

#### **3. Cross-Platform Synchronization**
```json
{
  "cursor.sync": {
    "gitWorkflow": "feature-branch",
    "autoSync": true,
    "conflictResolution": "manual",
    "backupStrategy": "automated",
    "deploymentSync": "docker-compose"
  }
}
```

---

## 🎯 **Recommended Development Workflow**

### **📋 Daily Development Process**

#### **1. 🚀 Morning Setup (Both Machines)**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Check port availability
./scripts/check-ports.sh

# 3. Start Docker services
./scripts/docker-service-manager.sh start

# 4. Verify services are running
./scripts/docker-service-manager.sh status

# 5. Check for any platform-specific issues
./scripts/platform-health-check.sh
```

#### **2. 🎯 Role-Specific Tasks**

**LG Gram (Business Focus):**
```bash
# Product Owner Tasks
- Feature planning and prioritization
- User story development and refinement
- Business requirement documentation
- Stakeholder communication and alignment
- Market research and competitive analysis

# Backend Developer Tasks
- API development and database design
- Authentication and authorization
- Business logic implementation
- Data processing and validation
- Backend testing and optimization

# Network Engineer Tasks
- Service discovery and registration
- Load balancing and traffic management
- Network security and segmentation
- Performance optimization and monitoring
```

**Mac (Development Focus):**
```bash
# Frontend Developer Tasks
- Component development and UI implementation
- State management and data flow
- Performance optimization
- Accessibility implementation
- Frontend testing and debugging

# UI/UX Expert Tasks
- User experience design and optimization
- Design system creation and maintenance
- Animation and micro-interaction design
- Accessibility design and implementation
- User research and usability testing

# Web App Tester Tasks
- Test strategy and planning
- Automated test development
- Performance and security testing
- Quality assurance processes
- Bug tracking and reporting
```

#### **3. 🔄 Synchronization Process**
```bash
# 1. Commit changes with role-specific messages
git add .
git commit -m "[ROLE] Description of changes"

# 2. Push to GitHub
git push origin main

# 3. Pull on other machine
git pull origin main

# 4. Restart services if needed
./scripts/docker-service-manager.sh restart

# 5. Verify cross-platform compatibility
./scripts/cross-platform-verifier.sh
```

---

## 🚨 **Critical Cross-Platform Rules**

### **✅ Always Follow These Standards**

#### **1. 🐳 Docker-First Development**
```bash
# ✅ CORRECT: Always work in Docker containers
docker-compose exec service-name bash

# ❌ WRONG: Never develop directly on host
npm start  # Don't do this
```

#### **2. 🔌 Port Management**
```bash
# ✅ CORRECT: Use designated ports only
Frontend: 3000, API Gateway: 8080, Chat: 3012

# ❌ WRONG: Never use random ports
Frontend: 3001, API Gateway: 8081  # Don't do this
```

#### **3. 🎨 UI Immutability**
```bash
# ✅ CORRECT: Add new features without changing existing UI
# ❌ WRONG: Never modify existing components
```

#### **4. 🔄 Git Synchronization**
```bash
# ✅ CORRECT: Always pull before starting work
git pull origin main

# ❌ WRONG: Never work on outdated code
```

#### **5. 🛡️ Cross-Platform Compatibility**
```bash
# ✅ CORRECT: Test on both platforms
./scripts/cross-platform-test.sh

# ❌ WRONG: Assume it works on both platforms
```

---

## 📊 **Role Assignment Matrix**

| Task Type | LG Gram Role | Mac Role | Collaboration Strategy |
|-----------|-------------|----------|----------------------|
| **Business Planning** | Product Owner | - | Product Owner leads, Mac provides feedback |
| **Feature Development** | Backend Developer | Frontend Developer | API-first approach with parallel development |
| **UI/UX Design** | - | UI/UX Expert | Design system consistency across platforms |
| **Testing** | - | Web App Tester | Cross-platform testing with automated validation |
| **Deployment** | DevOps Engineer | DevOps Engineer | Synchronized deployment with health monitoring |
| **Infrastructure** | Network Engineer | DevOps Engineer | Network optimization with platform-specific tuning |
| **Security** | Cybersecurity Expert | - | Security-first approach with compliance validation |

---

## 🎯 **Success Metrics & KPIs**

### **📈 Cross-Platform Efficiency**
- **Zero platform-specific issues** (eliminating problems like chat function failures)
- **Consistent development experience** across both machines
- **Seamless role switching** based on task requirements
- **Automated deployment** that works on both platforms

### **🚀 Development Velocity**
- **Faster feature development** with specialized roles
- **Reduced debugging time** with proper standards
- **Better code quality** with role-specific expertise
- **Improved collaboration** between business and technical teams

### **🛡️ Quality & Reliability**
- **100% cross-platform compatibility** for all features
- **Automated testing** on both platforms
- **Consistent performance** across different environments
- **Zero deployment failures** due to platform differences

---

## 🚨 **Troubleshooting Guide**

### **🔧 Common Cross-Platform Issues**

#### **1. Port Conflicts**
```bash
# Problem: Port already in use on one platform
# Solution: Use platform-specific port management
./scripts/check-ports.sh
./scripts/port-killer.sh <port_number>
```

#### **2. Docker Issues**
```bash
# Problem: Docker behaves differently on platforms
# Solution: Use platform-specific Docker commands
./scripts/docker-service-manager.sh start --mac
./scripts/docker-service-manager.sh start --windows
```

#### **3. File Path Issues**
```bash
# Problem: Different file path conventions
# Solution: Use Docker volumes and relative paths
docker-compose -f docker-compose.yml up -d
```

#### **4. Performance Differences**
```bash
# Problem: Different performance characteristics
# Solution: Platform-specific optimization
./scripts/mac-optimizer.sh
./scripts/windows-optimizer.sh
```

---

## 📚 **Additional Resources**

### **📖 Essential Documentation**
- `docs/AGENT_DEVELOPMENT_STANDARDS.md` - Complete development standards
- `docs/AGENT_ENFORCEMENT_GUIDE.md` - How to enforce standards
- `docs/AGENT_QUICK_REFERENCE.md` - Quick reference for daily use
- `docs/PRODUCT_OWNER_ROADMAP.md` - Product direction and planning

### **🛠️ Useful Scripts**
- `./scripts/check-ports.sh` - Port availability checker
- `./scripts/docker-service-manager.sh` - Docker service management
- `./scripts/ui-compliance-checker.sh` - UI compliance validation
- `./scripts/cross-platform-verifier.sh` - Cross-platform compatibility check

### **🎯 Best Practices**
- Always use designated roles for specific tasks
- Maintain consistent development standards across platforms
- Test features on both machines before deployment
- Use automated scripts for repetitive tasks
- Document platform-specific configurations

---

## 🎉 **Conclusion**

This Cursor roles setup ensures **optimal productivity** and **consistent development experience** across your Mac and LG Gram laptop. By following these guidelines, you'll eliminate platform-specific issues like the chat function problem you experienced and maintain high development standards.

**Key Benefits:**
- ✅ **Eliminates platform-specific issues**
- ✅ **Maximizes role specialization**
- ✅ **Ensures consistent development experience**
- ✅ **Improves collaboration efficiency**
- ✅ **Maintains high code quality standards**

**Remember:** Always use the appropriate role for your current task and follow the established development standards. This setup will significantly improve your development workflow and prevent the deployment issues you encountered.

---

**Last Updated:** July 2025  
**Version:** 1.0  
**Author:** DevOps Engineering Team 