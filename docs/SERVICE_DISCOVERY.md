# Service Discovery Documentation
## Digital Tracking Merchandising Platform

### Overview
Service discovery is a critical component of the microservices architecture that enables services to find and communicate with each other dynamically. This document covers the service discovery implementation, configuration, and management in the Digital Tracking Merchandising Platform.

---

## 🏗️ Service Discovery Architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE DISCOVERY LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Service Discovery Manager                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Discovery     │  │   Registration  │  │   Health Check  │              │
│  │   Engine        │  │   Service       │  │   Monitor       │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │   Docker     │ │   Service   │ │   Load     │
            │   Network    │ │   Registry  │ │ Balancer   │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │   Microservices Network      │ │   Nginx    │
            │   (172.18.0.0/16)            │ │   Config   │
            └──────────────────────────────┘ └────────────┘
```

### Service Discovery Components

#### 1. Docker DNS
- **Purpose**: Automatic service name resolution
- **Network**: `digital_tracking_merchandising_microservices-network`
- **Resolution**: Service names resolve to container IPs
- **Health**: Built-in health checks

#### 2. Service Registry
- **Purpose**: Centralized service information
- **Storage**: In-memory registry with persistence
- **Updates**: Real-time service status updates
- **Access**: REST API for service information

#### 3. Health Check Monitor
- **Purpose**: Continuous service health monitoring
- **Checks**: HTTP health endpoints
- **Frequency**: Configurable check intervals
- **Alerts**: Automatic failure notifications

#### 4. Load Balancer Integration
- **Purpose**: Dynamic backend configuration
- **Updates**: Automatic backend updates
- **Health**: Backend health monitoring
- **Failover**: Automatic failover handling

---

## 🔧 Service Discovery Configuration

### Service Registration

#### Automatic Registration
```bash
# Discover and register all services
./scripts/service-discovery-manager.sh discover

# Register specific service
./scripts/service-discovery-manager.sh register auth-service

# List registered services
./scripts/service-discovery-manager.sh list
```

#### Manual Registration
```bash
# Register service with custom configuration
./scripts/service-discovery-manager.sh register auth-service 3010 /health

# Update service endpoints
./scripts/service-discovery-manager.sh update-endpoints auth-service 3010 /api/health
```

### Service Configuration

#### Service Definition
```yaml
# Service configuration in docker-compose.microservices.yml
auth-service:
  build:
    context: ./microservices/auth-service
    dockerfile: Dockerfile
  ports:
    - "3010:3001"
  environment:
    - NODE_ENV=development
    - PORT=3001
    - SERVICE_NAME=auth-service
    - HEALTH_CHECK_PATH=/health
  networks:
    - microservices-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

#### Health Check Configuration
```yaml
# Health check configuration
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s          # Check frequency
  timeout: 10s           # Check timeout
  retries: 3             # Failure retries
  start_period: 40s      # Initial startup grace period
```

### Network Configuration

#### Docker Network Setup
```yaml
# Network configuration in docker-compose.microservices.yml
networks:
  microservices-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.18.0.0/16
          gateway: 172.18.0.1
```

#### Service Network Assignment
```yaml
# Service network assignment
services:
  auth-service:
    networks:
      - microservices-network
  user-service:
    networks:
      - microservices-network
  # ... other services
```

---

## 📊 Service Discovery Management

### Service Discovery Commands

#### 1. Service Discovery
```bash
# Discover all services automatically
./scripts/service-discovery-manager.sh discover

# Discover specific service
./scripts/service-discovery-manager.sh discover auth-service

# List discovered services
./scripts/service-discovery-manager.sh list
```

#### 2. Service Registration
```bash
# Register service manually
./scripts/service-discovery-manager.sh register auth-service

# Register with custom configuration
./scripts/service-discovery-manager.sh register auth-service 3010 /health

# Unregister service
./scripts/service-discovery-manager.sh unregister auth-service
```

#### 3. Health Monitoring
```bash
# Health check all services
./scripts/service-discovery-manager.sh health

# Health check specific service
./scripts/service-discovery-manager.sh health auth-service

# Monitor services continuously
./scripts/service-discovery-manager.sh monitor 30
```

#### 4. Endpoint Management
```bash
# Update service endpoints
./scripts/service-discovery-manager.sh update-endpoints auth-service 3010 /api/health

# List service endpoints
./scripts/service-discovery-manager.sh list-endpoints

# Test service endpoints
./scripts/service-discovery-manager.sh test-endpoint auth-service
```

### Service Discovery Scripts

#### 1. Service Discovery Manager
```bash
#!/bin/bash
# scripts/service-discovery-manager.sh

# Usage: ./scripts/service-discovery-manager.sh [COMMAND] [OPTIONS]
#
# Commands:
#   discover              Discover all services automatically
#   register <service>    Register a specific service
#   unregister <service>  Unregister a specific service
#   list                  List all registered services
#   health [service]      Health check all services or specific service
#   update-endpoints <service> <port> <endpoint>  Update service endpoints
#   monitor [interval]    Monitor services (default: 30s interval)
#   help                  Show this help message
```

#### 2. Health Check Implementation
```bash
# Health check function
check_service_health() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    # Check if service is running
    if ! docker ps | grep -q "$service_name"; then
        echo "[ERROR] Service $service_name is not running"
        return 1
    fi
    
    # Check health endpoint
    local health_url="http://localhost:$port$endpoint"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$health_url")
    
    if [ "$response" = "200" ]; then
        echo "[SUCCESS] Service $service_name is healthy"
        return 0
    else
        echo "[ERROR] Service $service_name health check failed (HTTP $response)"
        return 1
    fi
}
```

---

## 🔍 Service Discovery Monitoring

### Health Check Monitoring

#### 1. Service Health Metrics
```bash
# Monitor service health
./scripts/service-discovery-manager.sh monitor 30

# Check specific service health
curl -s http://localhost:8080/health | jq '.services.auth.status'

# Monitor service uptime
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

#### 2. Health Check Configuration
```yaml
# Health check configuration for each service
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s          # Check every 30 seconds
  timeout: 10s           # 10 second timeout
  retries: 3             # 3 retries before marking unhealthy
  start_period: 40s      # 40 second grace period on startup
```

#### 3. Health Check Endpoints
```javascript
// Health check endpoint implementation
app.get('/health', (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: checkDatabaseConnection(),
        redis: checkRedisConnection()
    };
    
    res.status(200).json(health);
});
```

### Service Discovery Metrics

#### 1. Discovery Metrics
- **Service Count**: Number of registered services
- **Discovery Rate**: Services discovered per minute
- **Registration Success Rate**: Successful registrations
- **Health Check Success Rate**: Successful health checks

#### 2. Performance Metrics
- **Discovery Latency**: Time to discover services
- **Health Check Latency**: Time to complete health checks
- **Service Response Time**: Service response times
- **Network Latency**: Inter-service communication latency

#### 3. Availability Metrics
- **Service Uptime**: Service availability percentage
- **Health Check Failures**: Number of failed health checks
- **Service Restarts**: Number of service restarts
- **Network Connectivity**: Network connectivity status

---

## 🚨 Service Discovery Troubleshooting

### Common Issues

#### 1. Service Not Discovered
**Symptoms**: Service not appearing in discovery list
**Diagnosis**:
```bash
# Check if service is running
docker ps | grep auth-service

# Check service logs
docker logs digital_tracking_merchandising-auth-service-1

# Check network connectivity
docker exec digital_tracking_merchandising-api-gateway-1 ping auth-service
```

**Resolution**:
```bash
# Restart service discovery
./scripts/service-discovery-manager.sh discover

# Restart service
docker-compose restart auth-service

# Check network configuration
docker network inspect digital_tracking_merchandising_microservices-network
```

#### 2. Health Check Failures
**Symptoms**: Service marked as unhealthy
**Diagnosis**:
```bash
# Check health endpoint directly
curl -s http://localhost:3010/health

# Check service logs
docker logs digital_tracking_merchandising-auth-service-1

# Check health check configuration
docker inspect digital_tracking_merchandising-auth-service-1 | grep Health
```

**Resolution**:
```bash
# Restart service
docker-compose restart auth-service

# Check health check endpoint
curl -s http://localhost:3010/health

# Verify health check configuration
docker-compose config
```

#### 3. Network Connectivity Issues
**Symptoms**: Services can't communicate with each other
**Diagnosis**:
```bash
# Check network connectivity
docker exec digital_tracking_merchandising-api-gateway-1 ping auth-service

# Check DNS resolution
docker exec digital_tracking_merchandising-api-gateway-1 nslookup auth-service

# Check network configuration
docker network inspect digital_tracking_merchandising_microservices-network
```

**Resolution**:
```bash
# Restart network
docker network disconnect digital_tracking_merchandising_microservices-network auth-service
docker network connect digital_tracking_merchandising_microservices-network auth-service

# Restart all services
docker-compose restart
```

### Troubleshooting Commands

#### 1. Service Discovery Debug
```bash
# Debug service discovery
./scripts/service-discovery-manager.sh discover --debug

# Check service registry
./scripts/service-discovery-manager.sh list --verbose

# Test service connectivity
./scripts/service-discovery-manager.sh test-connectivity auth-service
```

#### 2. Network Debug
```bash
# Check Docker network
docker network ls
docker network inspect digital_tracking_merchandising_microservices-network

# Check container network
docker inspect digital_tracking_merchandising-auth-service-1 | grep NetworkMode

# Test inter-service communication
docker exec digital_tracking_merchandising-api-gateway-1 ping -c 3 auth-service
```

#### 3. Health Check Debug
```bash
# Check health check status
docker inspect digital_tracking_merchandising-auth-service-1 | grep Health -A 10

# Test health endpoint
curl -v http://localhost:3010/health

# Check health check logs
docker logs digital_tracking_merchandising-auth-service-1 | grep health
```

---

## 🔄 Service Discovery Recovery

### Automatic Recovery

#### 1. Service Restart
```bash
# Automatic service restart on failure
docker-compose up -d --restart unless-stopped

# Check restart policies
docker inspect digital_tracking_merchandising-auth-service-1 | grep RestartPolicy
```

#### 2. Health Check Recovery
```bash
# Health check with automatic recovery
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

#### 3. Network Recovery
```bash
# Network recovery script
./scripts/network-troubleshooter.sh connectivity

# Service discovery recovery
./scripts/service-discovery-manager.sh discover
```

### Manual Recovery

#### 1. Service Recovery
```bash
# Restart specific service
docker-compose restart auth-service

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

#### 2. Network Recovery
```bash
# Recreate network
docker network rm digital_tracking_merchandising_microservices-network
docker-compose up -d

# Reconnect services to network
docker network connect digital_tracking_merchandising_microservices-network auth-service
```

#### 3. Configuration Recovery
```bash
# Restore service discovery configuration
git checkout HEAD -- docker-compose.microservices.yml

# Restart with restored configuration
docker-compose down
docker-compose up -d
```

---

## 📊 Service Discovery Monitoring

### Monitoring Setup

#### 1. Prometheus Metrics
```yaml
# Prometheus configuration for service discovery metrics
scrape_configs:
  - job_name: 'service-discovery'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

#### 2. Grafana Dashboards
```json
{
  "dashboard": {
    "title": "Service Discovery Dashboard",
    "panels": [
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "service_health_status",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Service Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "service_response_time",
            "legendFormat": "{{service}}"
          }
        ]
      }
    ]
  }
}
```

#### 3. Alerting Rules
```yaml
# Alerting rules for service discovery
groups:
  - name: service-discovery
    rules:
      - alert: ServiceDown
        expr: service_health_status == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.service }} is down"
          description: "Service {{ $labels.service }} has been down for more than 1 minute"
```

### Key Metrics

#### 1. Service Health Metrics
- `service_health_status`: Service health status (1 = healthy, 0 = unhealthy)
- `service_uptime`: Service uptime in seconds
- `service_restart_count`: Number of service restarts
- `service_response_time`: Service response time in milliseconds

#### 2. Discovery Metrics
- `service_discovery_count`: Number of discovered services
- `service_registration_success_rate`: Service registration success rate
- `service_discovery_latency`: Service discovery latency
- `service_health_check_duration`: Health check duration

#### 3. Network Metrics
- `service_network_latency`: Inter-service network latency
- `service_network_connectivity`: Network connectivity status
- `service_dns_resolution_time`: DNS resolution time
- `service_connection_count`: Number of active connections

---

## 📋 Service Discovery Best Practices

### Configuration Best Practices

#### 1. Service Naming
- Use consistent naming conventions
- Include service type in name
- Use lowercase with hyphens
- Example: `auth-service`, `user-service`, `chat-service`

#### 2. Health Check Configuration
- Use lightweight health checks
- Set appropriate timeouts
- Configure retry policies
- Monitor health check performance

#### 3. Network Configuration
- Use dedicated networks for services
- Configure proper subnet ranges
- Enable network isolation
- Monitor network performance

### Operational Best Practices

#### 1. Service Registration
- Register services automatically
- Validate service configuration
- Monitor registration success
- Handle registration failures

#### 2. Health Monitoring
- Monitor health check results
- Set up alerting for failures
- Track service availability
- Analyze health check patterns

#### 3. Performance Optimization
- Optimize health check frequency
- Monitor discovery latency
- Track service response times
- Optimize network configuration

### Security Best Practices

#### 1. Network Security
- Use network segmentation
- Restrict service communication
- Monitor network traffic
- Implement access controls

#### 2. Service Security
- Validate service endpoints
- Implement authentication
- Monitor service access
- Secure health check endpoints

#### 3. Configuration Security
- Secure configuration files
- Use environment variables
- Implement secrets management
- Monitor configuration changes

---

## 📚 Additional Resources

### Documentation
- [Network Architecture](./NETWORK_ARCHITECTURE.md)
- [Network Troubleshooting Guide](./NETWORK_TROUBLESHOOTING.md)
- [Load Balancer Configuration](./LOAD_BALANCER_CONFIG.md)
- [Monitoring Setup Guide](./MONITORING_SETUP.md)

### Scripts Reference
- `scripts/service-discovery-manager.sh`: Service discovery management
- `scripts/network-health-checker.sh`: Network health monitoring
- `scripts/network-troubleshooter.sh`: Automated troubleshooting
- `scripts/load-balancer-manager.sh`: Load balancer management

### Configuration Files
- `docker-compose.microservices.yml`: Service configuration
- `nginx-microservices.conf`: Load balancer configuration
- `monitoring/prometheus.yml`: Monitoring configuration
- `monitoring/grafana/`: Dashboard configuration

---

*Last Updated: July 19, 2025*
*Network Engineer: Senior Network Engineer (8+ Years Experience)* 