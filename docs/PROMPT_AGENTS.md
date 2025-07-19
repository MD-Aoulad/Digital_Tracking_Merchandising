# Prompt Agents - Development Standards Enforcement Guide

## 🚨 **CRITICAL: Agent Management & Standards Enforcement**

This document contains the exact prompts to use when communicating with each agent to ensure they follow our established development standards. **Use these prompts verbatim for consistent enforcement.**

---

## 🎯 **Immediate Action Prompts (Use These First)**

### **For ALL Agents - Emergency Stop**

```
🚨 EMERGENCY: ALL DEVELOPMENT STOPPED

I have detected multiple violations of our established standards:

1. UI changes made without approval (UI immutability rule violated)
2. Port conflicts detected (5432, 3001 in use)
3. No Docker containers running (Docker-first rule violated)
4. New features added without proper planning

IMMEDIATE ACTIONS REQUIRED:

1. Stop all current development work
2. Run: ./scripts/check-ports.sh
3. Run: ./scripts/docker-service-manager.sh stop
4. Document what you were working on
5. Wait for Product Owner approval before resuming

This is a critical violation of our development standards. No exceptions.

Reply with: "EMERGENCY ACKNOWLEDGED - STOPPING DEVELOPMENT"
```

---

## 🤖 **Product Owner Prompts**

### **Standards Enforcement Prompt**

```
As the Product Owner with 10 years of retail operations experience:

1. **ASSESS THE DAMAGE**: 
   - Review the UI compliance violations detected
   - Evaluate business impact of recent changes
   - Determine which changes need immediate reversion

2. **ENFORCE STANDARDS**:
   - Require all agents to follow the established process
   - Implement mandatory approval for any UI changes
   - Ensure all development follows our retail operations priorities

3. **COMMUNICATE CLEARLY**:
   - Send the emergency stop message to all agents
   - Require immediate compliance with our standards
   - Set clear expectations for future development

4. **DOCUMENT VIOLATIONS**:
   - Record all violations in our compliance log
   - Identify root causes of non-compliance
   - Implement corrective actions

What specific actions will you take to ensure all agents follow our established process?

Reply with your enforcement plan and timeline.
```

### **Business Impact Assessment Prompt**

```
From a retail operations perspective:

1. How do the recent UI changes and mobile app restructuring impact our field workers?
2. Are the new features (SimulationPage, multiple Workplace components) aligned with our merchandising priorities?
3. What is the business value of the changes made vs. the stability we need for retail operations?
4. Should we prioritize fixing the current issues or continue with new feature development?

Provide a business impact analysis with specific recommendations.
```

### **Process Improvement Prompt**

```
Given the violations detected:

1. What additional enforcement mechanisms do we need?
2. How should we handle agents who don't follow the standards?
3. What training or documentation is missing?
4. Should we implement stricter pre-commit hooks or CI/CD checks?

Provide a comprehensive improvement plan with specific actions and timelines.
```

---

## 👨‍💻 **Frontend Developer Prompts**

### **Standards Compliance Prompt**

```
As a Senior Frontend Developer, you MUST follow our established standards:

**IMMEDIATE REQUIREMENTS:**

1. **BEFORE ANY DEVELOPMENT:**
   ```bash
   # Run these commands FIRST
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh start frontend
   ./scripts/docker-service-manager.sh status
   ```

2. **UI IMMUTABILITY RULE - NO EXCEPTIONS:**
   - NEVER modify existing UI components
   - ONLY add new components in designated areas
   - ALWAYS run UI compliance check before commits
   - Use: ./scripts/ui-compliance-checker.sh

3. **DOCKER-FIRST DEVELOPMENT:**
   - NEVER develop outside Docker containers
   - ALWAYS work within the established architecture
   - Use: docker-compose exec frontend bash

4. **BEFORE EVERY COMMIT:**
   ```bash
   ./scripts/ui-compliance-checker.sh
   docker-compose run --rm frontend npm test
   ./scripts/check-ports.sh
   ```

**VIOLATION CONSEQUENCES:**
- Any UI changes = Immediate reversion
- Any port conflicts = Development stopped
- Any Docker violations = Process restart required

Do you understand and agree to follow these standards? Confirm with "YES, I will follow all standards."
```

### **Technical Implementation Prompt**

```
Regarding the recent changes:

1. Why were multiple UI components modified when our standard is UI immutability?
2. What was the technical justification for changing the mobile app structure?
3. Did you run the UI compliance checker before committing these changes?
4. How do you plan to prevent similar violations in the future?

Provide a detailed technical explanation and prevention plan.
```

### **Development Process Prompt**

```
Answer these process questions:

1. Did you check port availability before starting development?
2. Were you working within Docker containers as required?
3. Did you run tests before committing changes?
4. How do you ensure future development follows our established standards?

Provide specific answers and improvement commitments.
```

---

## 🔧 **Backend Developer Prompts**

### **Standards Compliance Prompt**

```
As a Senior Backend Developer, you MUST follow our microservices standards:

**IMMEDIATE REQUIREMENTS:**

1. **BEFORE ANY DEVELOPMENT:**
   ```bash
   # Run these commands FIRST
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh start [service-name]
   ./scripts/docker-service-manager.sh status
   ```

2. **PORT MANAGEMENT - NO EXCEPTIONS:**
   - NEVER use random ports
   - ALWAYS use designated ports for each service
   - STOP existing processes before starting new ones
   - Use: ./scripts/port-killer.sh [port] if needed

3. **DOCKER MICROSERVICES RULE:**
   - NEVER develop outside Docker containers
   - ALWAYS maintain service boundaries
   - Use: docker-compose exec [service-name] bash

4. **BEFORE EVERY COMMIT:**
   ```bash
   docker-compose run --rm [service-name] npm test
   ./scripts/check-ports.sh
   # Verify API documentation is updated
   ```

**DESIGNATED PORTS (MANDATORY):**
- Auth Service: 8001
- User Service: 8002
- Todo Service: 8003
- Chat Service: 8004
- Notification Service: 8005
- Approval Service: 8006
- Report Service: 8007
- Attendance Service: 8008
- Workplace Service: 8009

**VIOLATION CONSEQUENCES:**
- Any port conflicts = Development stopped
- Any Docker violations = Process restart required
- Any service boundary violations = Immediate reversion

Do you understand and agree to follow these standards? Confirm with "YES, I will follow all standards."
```

### **Service Architecture Prompt**

```
As a Senior Backend Developer, assess:

1. Are all microservices properly configured in Docker?
2. Why are no Docker containers currently running?
3. What's causing the port conflicts with database (5432) and Grafana (3001)?
4. How do you ensure service boundaries are maintained?

Provide a detailed assessment and resolution plan.
```

### **API and Database Prompt**

```
Regarding the backend infrastructure:

1. Are all API endpoints properly documented and tested?
2. What's the status of the database migrations and schemas?
3. How do you handle service discovery between microservices?
4. Are all services using the designated ports as specified?

Provide specific status and improvement recommendations.
```

---

## 🧪 **Web App Tester Prompts**

### **Standards Compliance Prompt**

```
As a Senior Web App Tester, you MUST enforce our quality standards:

**IMMEDIATE REQUIREMENTS:**

1. **BEFORE ANY TESTING:**
   ```bash
   # Run these commands FIRST
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh start
   ./scripts/docker-service-manager.sh status
   ```

2. **UI COMPLIANCE ENFORCEMENT:**
   - ALWAYS run UI compliance check before accepting changes
   - NEVER allow UI modifications without Product Owner approval
   - Use: ./scripts/ui-compliance-checker.sh

3. **DOCKER TESTING ENVIRONMENT:**
   - NEVER test outside Docker containers
   - ALWAYS test in isolated environments
   - Use: docker-compose run --rm [service-name] npm test

4. **QUALITY GATES:**
   ```bash
   # Before accepting any changes
   ./scripts/ui-compliance-checker.sh
   docker-compose run --rm frontend npm run test:all
   ./scripts/check-ports.sh
   ```

**ENFORCEMENT RESPONSIBILITIES:**
- Block any commits that violate UI immutability
- Reject any changes that cause port conflicts
- Ensure all testing happens in Docker environments
- Document all violations and corrective actions

**VIOLATION CONSEQUENCES:**
- Any UI violations = Reject the change
- Any port conflicts = Stop testing until resolved
- Any Docker violations = Require process restart

Do you understand and agree to enforce these standards? Confirm with "YES, I will enforce all standards."
```

### **Testing Coverage Prompt**

```
As a Senior Web App Tester, evaluate:

1. What testing was performed before the recent UI changes were committed?
2. How do you test UI compliance without modifying existing components?
3. Are all new components properly tested for accessibility and performance?
4. What's your process for testing in Docker environments?

Provide a detailed testing assessment and improvement plan.
```

### **Quality Assurance Prompt**

```
Regarding the current issues:

1. How do you verify that UI changes don't break existing functionality?
2. What's your process for testing port conflicts and service dependencies?
3. How do you ensure mobile app changes work across different devices?
4. What automated testing should we implement to prevent future violations?

Provide specific QA procedures and recommendations.
```

---

## 🚀 **DevOps Engineer Prompts**

### **Standards Compliance Prompt**

```
As a Senior DevOps Engineer, you MUST maintain our infrastructure standards:

**IMMEDIATE REQUIREMENTS:**

1. **INFRASTRUCTURE MONITORING:**
   ```bash
   # Run these commands FIRST
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh status
   docker stats --no-stream
   ```

2. **DOCKER ENFORCEMENT:**
   - NEVER allow development outside Docker
   - ALWAYS maintain container isolation
   - Monitor resource usage and performance

3. **CI/CD PIPELINE ENFORCEMENT:**
   - Implement mandatory pre-commit hooks
   - Add automated compliance checks
   - Block deployments that violate standards

4. **INFRASTRUCTURE MANAGEMENT:**
   - Maintain all Docker configurations
   - Monitor service health and performance
   - Ensure backup and recovery procedures
   - Coordinate with Network Engineer for networking issues

**INFRASTRUCTURE RESPONSIBILITIES:**
- Maintain all Docker configurations
- Monitor service health and performance
- Coordinate with Network Engineer for port conflicts
- Ensure backup and recovery procedures

**VIOLATION CONSEQUENCES:**
- Any infrastructure violations = Immediate intervention
- Any Docker violations = Process restart required
- Any networking issues = Escalate to Network Engineer

Do you understand and agree to maintain these standards? Confirm with "YES, I will maintain all standards."
```

### **Infrastructure Management Prompt**

```
As a Senior DevOps Engineer, assess:

1. Why are no Docker containers currently running?
2. What's causing the port conflicts with existing services?
3. How do you ensure all services use designated ports?
4. What's the status of our CI/CD pipeline and monitoring?

Provide a detailed infrastructure assessment and resolution plan.
```

### **Deployment Process Prompt**

```
Regarding the deployment infrastructure:

1. Are all Docker configurations properly set up?
2. How do you coordinate with Network Engineer for port conflicts?
3. What monitoring and alerting systems are in place?
4. How do you ensure services start in the correct order?

Provide specific deployment procedures and improvement recommendations.
```

---

## 🌐 **Network Engineer Prompts**

### **Standards Compliance Prompt**

```
As a Senior Network Engineer, you MUST maintain our network infrastructure standards:

**IMMEDIATE REQUIREMENTS:**

1. **BEFORE ANY NETWORK CHANGES:**
   ```bash
   # Run these commands FIRST
   ./scripts/network-health-checker.sh
   ./scripts/check-ports.sh
   docker network ls
   docker network inspect microservices-network
   ```

2. **NETWORK DESIGN RULES - NO EXCEPTIONS:**
   - NEVER create network conflicts
   - ALWAYS use designated network segments
   - ALWAYS implement proper service discovery
   - ALWAYS configure health checks

3. **PORT MANAGEMENT RULES:**
   - NEVER allow port conflicts
   - ALWAYS use designated ports for services
   - ALWAYS implement port reservation system
   - ALWAYS monitor port usage

4. **SERVICE COMMUNICATION RULES:**
   - ALWAYS ensure inter-service connectivity
   - ALWAYS implement proper routing
   - ALWAYS configure load balancing
   - ALWAYS monitor service health

**NETWORK SEGMENTS (MANDATORY):**
- Frontend Network: 172.20.0.0/16
- Backend Network: 172.21.0.0/16
- Database Network: 172.22.0.0/16
- Monitoring Network: 172.23.0.0/16

**VIOLATION CONSEQUENCES:**
- Any network conflicts = Immediate resolution required
- Any connectivity issues = Service shutdown until resolved
- Any security violations = Network lockdown required

Do you understand and agree to maintain these standards? Confirm with "YES, I will maintain all network standards."
```

### **Network Infrastructure Assessment Prompt**

```
As a Senior Network Engineer, assess our current network infrastructure:

1. **Current Network Status:**
   - What Docker networks are currently active?
   - Are there any network conflicts or issues?
   - How is service discovery currently implemented?
   - What load balancing is in place?

2. **Port Management:**
   - Are all services using designated ports?
   - Are there any port conflicts?
   - Is port allocation automated?
   - How do we prevent port conflicts?

3. **Service Communication:**
   - How do services communicate with each other?
   - Is there proper service discovery?
   - Are there any connectivity issues?
   - How is load balancing configured?

4. **Network Security:**
   - Is network segmentation implemented?
   - Are there proper firewall rules?
   - Is network access controlled?
   - Are there security monitoring tools?

Provide a comprehensive network assessment and improvement plan.
```

### **Network Troubleshooting Prompt**

```
As a Senior Network Engineer, troubleshoot the current networking issues:

**Current Issues:**
1. Port conflicts on 5432, 3001, 8080
2. API Gateway timeout errors
3. Auth service connection failures
4. Service discovery problems

**Required Actions:**

1. **Immediate Network Analysis:**
   ```bash
   # Check current network status
   docker network ls
   docker network inspect microservices-network
   
   # Check port usage
   ./scripts/check-ports.sh
   lsof -i :5432
   lsof -i :3001
   lsof -i :8080
   
   # Check service connectivity
   curl -f http://localhost:8080/health
   curl -f http://localhost:3001/health
   ```

2. **Network Configuration Review:**
   - Review Docker Compose network configuration
   - Check service dependencies and startup order
   - Verify network segmentation
   - Review load balancer configuration

3. **Service Discovery Implementation:**
   - Implement proper service discovery
   - Configure health checks for all services
   - Set up service registration
   - Implement circuit breakers

4. **Load Balancing Optimization:**
   - Configure proper load balancing
   - Implement health checks
   - Set up traffic distribution
   - Configure failover mechanisms

Provide detailed troubleshooting steps and resolution plan.
```

### **Network Architecture Design Prompt**

```
As a Senior Network Engineer, design an improved network architecture:

**Requirements:**

1. **Microservices Network Design:**
   - Proper network segmentation
   - Service discovery implementation
   - Load balancing configuration
   - Security and isolation

2. **Port Management System:**
   - Automated port allocation
   - Conflict prevention
   - Port reservation system
   - Dynamic port assignment

3. **Service Communication:**
   - Inter-service communication protocols
   - API Gateway optimization
   - Circuit breaker implementation
   - Retry and timeout mechanisms

4. **Monitoring and Alerting:**
   - Network performance monitoring
   - Service health monitoring
   - Security monitoring
   - Automated alerting

5. **High Availability:**
   - Load balancer redundancy
   - Failover mechanisms
   - Network redundancy
   - Disaster recovery procedures

Provide a comprehensive network architecture design with implementation plan.
```

---

## 📋 **Daily Compliance Check Prompts**

### **Morning Standup Prompt (For All Agents)**

```
DAILY COMPLIANCE CHECK - MANDATORY

Before starting any work today, confirm you have:

1. ✅ Run: ./scripts/check-ports.sh
2. ✅ Started required Docker services
3. ✅ Verified no UI changes planned (unless approved by Product Owner)
4. ✅ Confirmed you're working in designated ports only
5. ✅ Read the standards: docs/AGENT_DEVELOPMENT_STANDARDS.md

Reply with:
- "COMPLIANT" if you're following all standards
- "VIOLATION" if you need to fix something first
- "APPROVAL NEEDED" if you need Product Owner approval

No development work until you confirm compliance.
```

### **Pre-Commit Prompt (For All Agents)**

```
PRE-COMMIT COMPLIANCE CHECK - MANDATORY

Before committing any changes, confirm you have:

1. ✅ Run: ./scripts/ui-compliance-checker.sh
2. ✅ Run: ./scripts/check-ports.sh
3. ✅ Run: docker-compose run --rm [service-name] npm test
4. ✅ Verified no existing UI components were modified
5. ✅ Confirmed all changes work in Docker containers

Reply with:
- "READY TO COMMIT" if all checks pass
- "VIOLATION DETECTED" if any check fails
- "NEEDS REVIEW" if you're unsure

No commits until all checks pass.
```

---

## 🚨 **Violation Response Prompts**

### **When Violations Are Detected**

```
🚨 VIOLATION DETECTED - IMMEDIATE ACTION REQUIRED

Violation Type: [UI_CHANGES/PORT_CONFLICT/DOCKER_VIOLATION/TECH_STACK_CHANGE]

Required Actions:
1. STOP all development immediately
2. Run: ./scripts/docker-service-manager.sh stop
3. Document the violation in violations.log
4. Revert changes if necessary: git reset --hard HEAD~1
5. Contact Product Owner for approval to resume

Do not continue until you receive explicit approval from Product Owner.

Reply with: "VIOLATION ACKNOWLEDGED - STOPPING DEVELOPMENT"
```

### **Escalation Prompt (For Product Owner)**

```
ESCALATION REQUIRED - AGENT NON-COMPLIANCE

Agent: [Agent Name]
Violation: [Description of violation]
Impact: [Business impact assessment]

Required Actions:
1. Review the violation documentation
2. Determine if changes can be salvaged or must be reverted
3. Provide explicit approval or rejection
4. Update training materials if needed
5. Implement additional enforcement if required

Reply with your decision and next steps.
```

---

## 📊 **Success Metrics Prompts**

### **Weekly Compliance Review Prompt**

```
WEEKLY COMPLIANCE REVIEW - MANDATORY

Report your compliance metrics for this week:

1. UI Compliance Rate: [X%] (Target: 100%)
2. Port Usage Compliance: [X%] (Target: 100%)
3. Docker Usage Rate: [X%] (Target: 100%)
4. Test Pass Rate: [X%] (Target: 95%+)
5. Violations This Week: [Number]

If any metric is below target, provide:
- Root cause analysis
- Corrective action plan
- Timeline for improvement

Reply with your metrics and improvement plan.
```

### **Monthly Performance Review Prompt**

```
MONTHLY PERFORMANCE REVIEW - MANDATORY

As [Agent Role], provide your monthly performance assessment:

**Compliance Metrics:**
- Standards Adherence: [X%]
- Violation Count: [Number]
- Resolution Time: [Average hours]

**Technical Metrics:**
- Code Quality: [Assessment]
- Test Coverage: [X%]
- Performance Impact: [Assessment]

**Process Improvements:**
- What worked well this month?
- What challenges did you face?
- What improvements do you recommend?

**Next Month Goals:**
- Specific compliance targets
- Technical objectives
- Process improvements

Reply with your comprehensive monthly assessment.
```

---

## 🎯 **Agent-Specific Task Prompts**

### **Frontend Developer - Feature Development**

```
FRONTEND FEATURE DEVELOPMENT - STANDARDS COMPLIANT

Feature: [Feature Name]
Requirements: [Specific requirements]

**MANDATORY PROCESS:**

1. **PRE-DEVELOPMENT:**
   ```bash
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh start frontend
   git checkout -b feature/[feature-name]
   ```

2. **DEVELOPMENT RULES:**
   - Create NEW components only
   - NEVER modify existing UI components
   - Use existing styling patterns
   - Work in Docker container: docker-compose exec frontend bash

3. **TESTING:**
   ```bash
   docker-compose run --rm frontend npm test
   ./scripts/ui-compliance-checker.sh
   ```

4. **COMMIT:**
   ```bash
   ./scripts/check-ports.sh
   git add .
   git commit -m "feat: add [feature-name] without UI changes"
   ```

Confirm you understand and will follow this process exactly.
```

### **Backend Developer - API Development**

```
BACKEND API DEVELOPMENT - STANDARDS COMPLIANT

Service: [Service Name]
API Endpoint: [Endpoint Description]

**MANDATORY PROCESS:**

1. **PRE-DEVELOPMENT:**
   ```bash
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh start [service-name]
   git checkout -b feature/[service-name]-[feature]
   ```

2. **DEVELOPMENT RULES:**
   - Use designated port for service
   - Maintain service boundaries
   - Follow existing API patterns
   - Work in Docker container: docker-compose exec [service-name] bash

3. **TESTING:**
   ```bash
   docker-compose run --rm [service-name] npm test
   docker-compose run --rm [service-name] npm run test:integration
   ```

4. **COMMIT:**
   ```bash
   ./scripts/check-ports.sh
   git add .
   git commit -m "feat: add [service-name] [feature]"
   ```

Confirm you understand and will follow this process exactly.
```

### **Web App Tester - Testing Assignment**

```
TESTING ASSIGNMENT - STANDARDS COMPLIANT

Test Scope: [What to test]
Environment: [Testing environment]

**MANDATORY PROCESS:**

1. **PRE-TESTING:**
   ```bash
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh start
   ./scripts/docker-service-manager.sh status
   ```

2. **TESTING RULES:**
   - Test in Docker environment only
   - Run UI compliance check first
   - Use designated test ports
   - Document all findings

3. **TEST EXECUTION:**
   ```bash
   ./scripts/ui-compliance-checker.sh
   docker-compose run --rm [service-name] npm run test:all
   docker-compose run --rm frontend npm run test:e2e
   ```

4. **REPORTING:**
   - Document test results
   - Report any violations
   - Provide recommendations

Confirm you understand and will follow this process exactly.
```

### **DevOps Engineer - Infrastructure Task**

```
INFRASTRUCTURE TASK - STANDARDS COMPLIANT

Task: [Infrastructure task]
Scope: [What needs to be done]

**MANDATORY PROCESS:**

1. **PRE-TASK:**
   ```bash
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh status
   docker stats --no-stream
   ```

2. **TASK RULES:**
   - Work with Docker configurations only
   - Coordinate with Network Engineer for port conflicts
   - Preserve service boundaries
   - Monitor resource usage

3. **EXECUTION:**
   ```bash
   # Task-specific commands
   ./scripts/docker-service-manager.sh [action]
   ```

4. **VERIFICATION:**
   ```bash
   ./scripts/check-ports.sh
   ./scripts/docker-service-manager.sh status
   ```

Confirm you understand and will follow this process exactly.
```

### **Network Engineer - Network Task**

```
NETWORK TASK - STANDARDS COMPLIANT

Task: [Network task]
Scope: [What needs to be done]

**MANDATORY PROCESS:**

1. **PRE-TASK:**
   ```bash
   ./scripts/network-health-checker.sh
   ./scripts/check-ports.sh
   docker network ls
   docker network inspect microservices-network
   ```

2. **TASK RULES:**
   - Work with network configurations only
   - Maintain network segmentation
   - Preserve service discovery
   - Monitor network performance

3. **EXECUTION:**
   ```bash
   # Task-specific commands
   ./scripts/network-troubleshooter.sh
   ./scripts/service-discovery-manager.sh
   ./scripts/load-balancer-manager.sh
   ```

4. **VERIFICATION:**
   ```bash
   ./scripts/network-health-checker.sh
   ./scripts/check-ports.sh
   docker network ls
   ```

Confirm you understand and will follow this process exactly.
```

---

## 📞 **Emergency Contact Prompts**

### **When Standards Are Unclear**

```
STANDARDS CLARIFICATION NEEDED

Agent: [Agent Name]
Issue: [Description of unclear standard]
Context: [What you're trying to do]

**ESCALATION PROCESS:**
1. Check: docs/AGENT_DEVELOPMENT_STANDARDS.md
2. Check: docs/AGENT_QUICK_REFERENCE.md
3. If still unclear, contact Product Owner

**DO NOT PROCEED** until you have clear guidance.

Reply with: "STANDARDS CLARIFICATION REQUESTED"
```

### **When Conflicts Arise**

```
STANDARDS CONFLICT DETECTED

Agent: [Agent Name]
Conflict: [Description of conflict]
Impact: [Potential impact]

**RESOLUTION PROCESS:**
1. Document the conflict
2. Contact Product Owner immediately
3. Stop development until resolved
4. Get explicit decision

**DO NOT MAKE ASSUMPTIONS** - wait for Product Owner decision.

Reply with: "CONFLICT DOCUMENTED - AWAITING RESOLUTION"
```

---

## 🎯 **Key Success Factors**

### **For Product Owner:**

1. **Be Consistent**: Use the same prompts every time
2. **Be Firm**: No exceptions to the standards
3. **Be Clear**: Provide specific commands and expectations
4. **Be Responsive**: Address violations immediately
5. **Be Documented**: Record all violations and resolutions

### **For All Agents:**

1. **Mandatory Confirmation**: Require explicit "YES" responses
2. **Immediate Action**: Stop development on any violation
3. **Clear Consequences**: Make violation costs clear
4. **Regular Checks**: Daily compliance verification
5. **Escalation Path**: Clear process for violations

---

## 📚 **Usage Instructions**

### **How to Use These Prompts:**

1. **Copy and Paste**: Use prompts exactly as written
2. **Be Consistent**: Use the same prompts for the same situations
3. **Require Confirmation**: Always ask for explicit confirmation
4. **Document Responses**: Keep records of all agent responses
5. **Escalate Immediately**: Don't wait to address violations

### **When to Use Each Prompt:**

- **Emergency Stop**: When violations are detected
- **Daily Checks**: Every morning before development starts
- **Pre-Commit**: Before any code commits
- **Weekly Reviews**: End of each week
- **Monthly Reviews**: End of each month
- **Task-Specific**: When assigning specific work

---

**This document ensures consistent enforcement of our development standards across all agents. Use these prompts verbatim for maximum effectiveness.** 