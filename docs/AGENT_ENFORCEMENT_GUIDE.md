# Agent Enforcement Guide - Making All Agents Follow Standards

## 🚨 **CRITICAL: How to Enforce Standards Across All Agents**

This guide explains how to ensure ALL agents follow the development standards consistently.

---

## 📋 **Pre-Development Checklist (MANDATORY)**

### **Before ANY Agent Starts Work**

Every agent MUST run these commands before starting any development:

```bash
# 1. Check port availability
./scripts/check-ports.sh

# 2. If ports are busy, stop processes
./scripts/port-killer.sh <port_number>

# 3. Start Docker services
./scripts/docker-service-manager.sh start

# 4. Verify services are running
./scripts/docker-service-manager.sh status
```

### **Before ANY Commit**

Every agent MUST run these commands before committing:

```bash
# 1. Check UI compliance
./scripts/ui-compliance-checker.sh

# 2. Run tests in Docker
docker-compose run --rm service-name npm test

# 3. Verify port usage
./scripts/check-ports.sh
```

---

## 🔧 **Agent-Specific Enforcement Procedures**

### **Frontend Developer Enforcement**

#### **Before Starting Work**
```bash
# 1. Check if frontend port (3000) is available
./scripts/check-ports.sh

# 2. Start frontend service only
./scripts/docker-service-manager.sh start frontend

# 3. Verify frontend is running
curl http://localhost:3000
```

#### **During Development**
```bash
# 1. Work ONLY in Docker container
docker-compose exec frontend bash

# 2. Run tests frequently
docker-compose run --rm frontend npm test

# 3. Check UI compliance before any commit
./scripts/ui-compliance-checker.sh
```

#### **Before Committing**
```bash
# 1. Stop frontend service
./scripts/docker-service-manager.sh stop frontend

# 2. Check UI compliance
./scripts/ui-compliance-checker.sh

# 3. Run full test suite
docker-compose run --rm frontend npm run test:all

# 4. Commit only if all checks pass
git add .
git commit -m "feat: add new feature without UI changes"
```

### **Backend Developer Enforcement**

#### **Before Starting Work**
```bash
# 1. Check if backend ports are available
./scripts/check-ports.sh

# 2. Start specific backend service
./scripts/docker-service-manager.sh start auth-service

# 3. Verify service is running
curl http://localhost:8001/health
```

#### **During Development**
```bash
# 1. Work ONLY in Docker container
docker-compose exec auth-service bash

# 2. Run tests frequently
docker-compose run --rm auth-service npm test

# 3. Check API documentation
docker-compose run --rm auth-service npm run docs
```

#### **Before Committing**
```bash
# 1. Stop backend service
./scripts/docker-service-manager.sh stop auth-service

# 2. Run integration tests
docker-compose run --rm auth-service npm run test:integration

# 3. Check API compatibility
docker-compose run --rm auth-service npm run test:api

# 4. Commit only if all checks pass
git add .
git commit -m "feat: add new API endpoint"
```

### **Web App Tester Enforcement**

#### **Before Starting Work**
```bash
# 1. Check if test ports are available
./scripts/check-ports.sh

# 2. Start all services for testing
./scripts/docker-service-manager.sh start

# 3. Verify all services are running
./scripts/docker-service-manager.sh status
```

#### **During Testing**
```bash
# 1. Run tests in Docker environment
docker-compose run --rm frontend npm run test:e2e

# 2. Run performance tests
docker-compose run --rm frontend npm run test:performance

# 3. Run security tests
docker-compose run --rm frontend npm run test:security
```

#### **Before Reporting Issues**
```bash
# 1. Document test environment
./scripts/docker-service-manager.sh status > test-environment.txt

# 2. Capture test logs
docker-compose logs > test-logs.txt

# 3. Document port usage
./scripts/check-ports.sh > port-status.txt
```

### **DevOps Engineer Enforcement**

#### **Before Starting Work**
```bash
# 1. Check all ports and services
./scripts/check-ports.sh

# 2. Verify Docker environment
./scripts/docker-service-manager.sh status

# 3. Check resource usage
docker stats --no-stream
```

#### **During Infrastructure Work**
```bash
# 1. Work ONLY with Docker configurations
# 2. Never modify host system directly
# 3. Always test in isolated containers
# 4. Maintain service boundaries
```

#### **Before Deploying**
```bash
# 1. Run full system test
./scripts/docker-service-manager.sh restart

# 2. Verify all services work together
docker-compose run --rm frontend npm run test:integration

# 3. Check monitoring
curl http://localhost:3001  # Grafana
curl http://localhost:9090  # Prometheus
```

---

## 🚨 **Violation Detection and Correction**

### **Automatic Violation Detection**

#### **1. Git Pre-commit Hooks**
Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Pre-commit hook to enforce standards
echo "🔍 Running pre-commit checks..."

# Check UI compliance
./scripts/ui-compliance-checker.sh
if [ $? -ne 0 ]; then
    echo "❌ UI compliance check failed"
    exit 1
fi

# Check port usage
./scripts/check-ports.sh
if [ $? -ne 0 ]; then
    echo "❌ Port check failed"
    exit 1
fi

# Run tests
docker-compose run --rm frontend npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo "✅ All pre-commit checks passed"
```

#### **2. CI/CD Pipeline Enforcement**
Add to `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  standards-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Check UI Compliance
        run: |
          chmod +x scripts/ui-compliance-checker.sh
          ./scripts/ui-compliance-checker.sh
      
      - name: Check Port Usage
        run: |
          chmod +x scripts/check-ports.sh
          ./scripts/check-ports.sh
      
      - name: Run Tests in Docker
        run: |
          docker-compose up -d
          docker-compose run --rm frontend npm test
          docker-compose down

  docker-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and Test Docker
        run: |
          docker-compose build
          docker-compose up -d
          docker-compose run --rm frontend npm run test:all
          docker-compose down
```

### **Manual Violation Detection**

#### **1. Daily Standards Check**
Run this script daily:

```bash
#!/bin/bash
# scripts/daily-standards-check.sh

echo "🔍 Daily Standards Check"
echo "========================"

# Check all ports
./scripts/check-ports.sh

# Check UI compliance for recent commits
./scripts/ui-compliance-checker.sh HEAD~10

# Check Docker services
./scripts/docker-service-manager.sh status

# Check for tech stack violations
echo "Checking for tech stack violations..."
git log --oneline --since="1 day ago" | grep -i -E "(vue|angular|svelte|next|nuxt|gatsby|vite|webpack|rollup|parcel)"
```

#### **2. Weekly Compliance Report**
Run this script weekly:

```bash
#!/bin/bash
# scripts/weekly-compliance-report.sh

echo "📊 Weekly Compliance Report"
echo "=========================="

# UI compliance summary
echo "UI Compliance:"
./scripts/ui-compliance-checker.sh HEAD~50

# Port usage summary
echo "Port Usage:"
./scripts/check-ports.sh

# Docker health summary
echo "Docker Health:"
./scripts/docker-service-manager.sh status

# Tech stack violations
echo "Tech Stack Violations:"
git log --oneline --since="1 week ago" | grep -i -E "(vue|angular|svelte|next|nuxt|gatsby|vite|webpack|rollup|parcel)"
```

---

## 📚 **Training and Onboarding**

### **New Agent Onboarding**

#### **1. Standards Training**
```bash
# 1. Read all documentation
cat docs/AGENT_DEVELOPMENT_STANDARDS.md
cat docs/AGENT_ENFORCEMENT_GUIDE.md

# 2. Run all scripts to understand them
./scripts/check-ports.sh --help
./scripts/port-killer.sh --help
./scripts/docker-service-manager.sh help
./scripts/ui-compliance-checker.sh help

# 3. Practice with test environment
./scripts/docker-service-manager.sh start
./scripts/docker-service-manager.sh status
./scripts/docker-service-manager.sh stop
```

#### **2. First Development Session**
```bash
# 1. Check environment
./scripts/check-ports.sh

# 2. Start required services
./scripts/docker-service-manager.sh start frontend

# 3. Make a small change
# 4. Test the change
docker-compose run --rm frontend npm test

# 5. Check UI compliance
./scripts/ui-compliance-checker.sh

# 6. Commit the change
git add .
git commit -m "feat: add new feature (first development session)"
```

### **Ongoing Training**

#### **1. Weekly Standards Review**
- Review recent violations
- Discuss improvement opportunities
- Update standards if needed

#### **2. Monthly Compliance Assessment**
- Review all agents' compliance
- Identify patterns in violations
- Provide additional training if needed

---

## 🎯 **Success Metrics**

### **Compliance Metrics**
- **UI Compliance Rate**: Target 100%
- **Port Usage Compliance**: Target 100%
- **Docker Usage Rate**: Target 100%
- **Tech Stack Compliance**: Target 100%

### **Quality Metrics**
- **Test Pass Rate**: Target 95%+
- **Build Success Rate**: Target 98%+
- **Deployment Success Rate**: Target 99%+
- **Bug Rate**: Target <5% of changes

### **Productivity Metrics**
- **Development Velocity**: Maintain or improve
- **Code Review Time**: <2 hours average
- **Deployment Time**: <30 minutes average
- **Issue Resolution Time**: <4 hours average

---

## 🚨 **Escalation Procedures**

### **When Standards Are Violated**

#### **1. Immediate Action**
```bash
# Stop all development
./scripts/docker-service-manager.sh stop

# Document the violation
echo "VIOLATION: $(date) - $(whoami) - $(git log -1 --oneline)" >> violations.log

# Revert changes if necessary
git reset --hard HEAD~1
```

#### **2. Investigation**
```bash
# Check what went wrong
./scripts/check-ports.sh
./scripts/ui-compliance-checker.sh
./scripts/docker-service-manager.sh status

# Document findings
echo "INVESTIGATION: $(date) - $(whoami)" >> investigation.log
```

#### **3. Correction**
```bash
# Fix the violation
# Follow proper procedures
# Test the fix
# Document the correction
```

#### **4. Prevention**
```bash
# Update training materials
# Improve automation
# Add additional checks
# Review and update standards
```

---

## 📞 **Support and Resources**

### **When Agents Need Help**

#### **1. Documentation**
- `docs/AGENT_DEVELOPMENT_STANDARDS.md` - Complete standards
- `docs/AGENT_ENFORCEMENT_GUIDE.md` - This guide
- `docs/PRODUCT_OWNER_ROADMAP.md` - Product direction

#### **2. Scripts**
- `scripts/check-ports.sh` - Port availability checker
- `scripts/port-killer.sh` - Port process killer
- `scripts/docker-service-manager.sh` - Docker service manager
- `scripts/ui-compliance-checker.sh` - UI compliance checker

#### **3. Escalation Contacts**
- **Product Owner**: For business decisions and standards updates
- **DevOps Engineer**: For infrastructure and deployment issues
- **Team Lead**: For process and coordination issues

---

**This enforcement guide ensures that ALL agents follow the same standards consistently, maintaining a stable, reliable, and high-quality development environment.** 