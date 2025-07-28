# Windows Batch Scripts for Digital Tracking Merchandising Platform

This directory contains Windows batch (.bat) equivalents of all the shell scripts for the Digital Tracking Merchandising Platform. These scripts provide the same functionality as their Unix/Linux counterparts but are designed to run on Windows systems.

## 📋 Available Scripts

### 🔧 Core Management Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `start-docker.bat` | Main Docker startup script | `scripts\start-docker.bat` |
| `docker-service-manager.bat` | Comprehensive Docker service management | `scripts\docker-service-manager.bat [action]` |
| `quick-deploy.bat` | Rapid deployment for development/testing | `scripts\quick-deploy.bat` |
| `dev-start.bat` | Simple development environment startup | `scripts\dev-start.bat` |

### 🔍 Monitoring & Health Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `check-ports.bat` | Check port availability for all services | `scripts\check-ports.bat` |
| `port-killer.bat` | Stop processes using specific ports | `scripts\port-killer.bat <port>` |
| `network-health-checker.bat` | Comprehensive network health monitoring | `scripts\network-health-checker.bat` |
| `network-troubleshooter.bat` | Automated network troubleshooting | `scripts\network-troubleshooter.bat [issue]` |
| `check-usage.bat` | System resource usage monitoring | `scripts\check-usage.bat` |

### 🏗️ Architecture & Compliance Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `network-architecture-enforcer.bat` | Validate network architecture compliance | `scripts\network-architecture-enforcer.bat` |
| `ui-compliance-checker.bat` | Check UI immutability compliance | `scripts\ui-compliance-checker.bat [commit]` |

### 🧪 Testing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `run-all-tests.bat` | Comprehensive test suite runner | `scripts\run-all-tests.bat` |

### 🌐 Network & Service Management

| Script | Purpose | Usage |
|--------|---------|-------|
| `service-discovery-manager.bat` | Service discovery and registration | `scripts\service-discovery-manager.bat [action]` |
| `load-balancer-manager.bat` | Load balancer management | `scripts\load-balancer-manager.bat [action]` |

## 🚀 Quick Start Guide

### 1. Initial Setup
```batch
REM Check if all ports are available
scripts\check-ports.bat

REM Start the development environment
scripts\start-docker.bat
```

### 2. Daily Development Workflow
```batch
REM Start development environment
scripts\dev-start.bat

REM Check system health
scripts\network-health-checker.bat

REM Run tests
scripts\run-all-tests.bat
```

### 3. Troubleshooting
```batch
REM Check for issues
scripts\network-troubleshooter.bat all

REM Kill conflicting processes
scripts\port-killer.bat 3000

REM Restart services
scripts\docker-service-manager.bat restart
```

## 📊 Script Categories

### 🔧 Infrastructure Management
- **Docker Services**: Start, stop, restart, and manage Docker containers
- **Port Management**: Check availability and resolve conflicts
- **Network Health**: Monitor connectivity and performance

### 🏗️ Architecture Enforcement
- **Network Compliance**: Ensure services follow defined architecture
- **UI Compliance**: Prevent unauthorized UI changes
- **Service Discovery**: Manage service registration and discovery

### 🧪 Quality Assurance
- **Comprehensive Testing**: Run all test suites
- **Health Monitoring**: Check system and service health
- **Performance Monitoring**: Monitor resource usage

### 🌐 Network Operations
- **Load Balancing**: Manage traffic distribution
- **Service Management**: Register and manage services
- **Troubleshooting**: Automated problem resolution

## 🔧 Prerequisites

### Required Software
- **Docker Desktop**: For container management
- **Windows 10/11**: Operating system
- **Command Prompt**: For running batch scripts
- **curl**: For HTTP requests (usually included in Windows 10/11)

### Required Tools
- **Git**: For version control operations
- **Node.js**: For some testing operations
- **npm**: For package management

## 📝 Usage Examples

### Starting the Platform
```batch
REM Quick start
scripts\start-docker.bat

REM Or with full management
scripts\docker-service-manager.bat start
```

### Checking System Health
```batch
REM Comprehensive health check
scripts\network-health-checker.bat

REM Quick port check
scripts\check-ports.bat

REM System resource usage
scripts\check-usage.bat
```

### Troubleshooting Issues
```batch
REM Automated troubleshooting
scripts\network-troubleshooter.bat all

REM Specific issue types
scripts\network-troubleshooter.bat ports
scripts\network-troubleshooter.bat connectivity
scripts\network-troubleshooter.bat health
```

### Managing Services
```batch
REM List all services
scripts\service-discovery-manager.bat list

REM Check service health
scripts\service-discovery-manager.bat health

REM Restart all services
scripts\service-discovery-manager.bat restart
```

### Load Balancer Management
```batch
REM Check load balancer status
scripts\load-balancer-manager.bat status

REM Test load balancing
scripts\load-balancer-manager.bat test

REM Show traffic statistics
scripts\load-balancer-manager.bat stats
```

## 🛠️ Advanced Usage

### Custom Port Management
```batch
REM Kill specific port
scripts\port-killer.bat 3000

REM Check specific port
netstat -an | findstr ":3000"
```

### Service-Specific Operations
```batch
REM Register specific service
scripts\service-discovery-manager.bat register auth-service 3010

REM Deregister service
scripts\service-discovery-manager.bat deregister auth-service
```

### Testing Operations
```batch
REM Run all tests
scripts\run-all-tests.bat

REM Check UI compliance
scripts\ui-compliance-checker.bat HEAD~1
```

## 🔍 Troubleshooting

### Common Issues

#### Docker Not Running
```batch
REM Check Docker status
docker info

REM Start Docker Desktop manually if needed
```

#### Port Conflicts
```batch
REM Check what's using a port
netstat -ano | findstr ":3000"

REM Kill the process
scripts\port-killer.bat 3000
```

#### Service Not Responding
```batch
REM Check service health
scripts\network-health-checker.bat

REM Restart specific service
docker-compose restart auth-service
```

### Error Messages

| Error | Solution |
|-------|----------|
| "Docker is not running" | Start Docker Desktop |
| "Port X is in use" | Use `port-killer.bat` to free the port |
| "Service not responding" | Check service logs with `docker-compose logs` |
| "Network not found" | Run `docker-compose up` to create networks |

## 📚 Script Documentation

Each script includes:
- **Purpose**: What the script does
- **Usage**: How to run it with parameters
- **Examples**: Common usage scenarios
- **Error Handling**: How errors are handled
- **Dependencies**: What tools are required

## 🔄 Migration from Shell Scripts

If you're migrating from Unix/Linux shell scripts:

1. **Replace file extensions**: `.sh` → `.bat`
2. **Update path separators**: `/` → `\`
3. **Use Windows commands**: `lsof` → `netstat`, `kill` → `taskkill`
4. **Adjust syntax**: Bash syntax → Batch syntax

## 📞 Support

For issues with these scripts:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure Docker is running
4. Check script logs and error messages
5. Consult the original shell script documentation for reference

## 🔄 Updates

These batch scripts are maintained to match the functionality of their shell script counterparts. When shell scripts are updated, corresponding batch scripts should also be updated to maintain feature parity.

---

**Note**: All scripts are designed to work with the Digital Tracking Merchandising Platform's microservices architecture and follow the established development standards and port assignments. 