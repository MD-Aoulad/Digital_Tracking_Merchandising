# Network Troubleshooting Guide
## Digital Tracking Merchandising Platform

### Overview
This guide provides step-by-step troubleshooting procedures for common network issues in the Digital Tracking Merchandising Platform. It includes diagnostic tools, resolution steps, and preventive measures.

---

## 🚨 Quick Diagnostic Commands

### 1. Network Health Check
```bash
# Run comprehensive network health check
./scripts/network-health-checker.sh

# Check port availability
./scripts/check-ports.sh

# Run automated troubleshooting
./scripts/network-troubleshooter.sh all
```

### 2. Service Status Check
```bash
# Check Docker service status
./scripts/docker-service-manager.sh status

# Check service discovery
./scripts/service-discovery-manager.sh health

# Check load balancer status
./scripts/load-balancer-manager.sh status
```

### 3. Connectivity Tests
```bash
# Test API Gateway connectivity
curl -s http://localhost:8080/health

# Test frontend connectivity
curl -s http://localhost:3000

# Test inter-service communication
docker exec digital_tracking_merchandising-api-gateway-1 ping -c 3 auth-service
```

---

## 🔍 Common Issues and Solutions

### Issue 1: Port Conflicts

#### Symptoms
- Services fail to start
- Error messages about ports already in use
- Network health checker reports port conflicts

#### Diagnosis
```bash
# Check which ports are in use
./scripts/check-ports.sh

# Check specific port usage
lsof -i :3000
lsof -i :8080
lsof -i :5432
```

#### Resolution
```bash
# Kill processes using conflicting ports
./scripts/port-killer.sh 3000
./scripts/port-killer.sh 8080
./scripts/port-killer.sh 5432

# Or stop all Docker containers
docker-compose down

# Restart services
./scripts/docker-service-manager.sh start
```

#### Prevention
- Always run `./scripts/check-ports.sh` before starting services
- Use different ports for local development
- Keep track of port assignments

### Issue 2: Service Discovery Problems

#### Symptoms
- Services can't find each other
- API Gateway reports service unavailable
- Inter-service communication fails

#### Diagnosis
```bash
# Check service discovery status
./scripts/service-discovery-manager.sh discover

# Check Docker network
docker network inspect digital_tracking_merchandising_microservices-network

# Test service connectivity
docker exec digital_tracking_merchandising-api-gateway-1 nslookup auth-service
```

#### Resolution
```bash
# Restart service discovery
./scripts/service-discovery-manager.sh discover

# Restart Docker network
docker network disconnect digital_tracking_merchandising_microservices-network <container>
docker network connect digital_tracking_merchandising_microservices-network <container>

# Restart all services
docker-compose restart
```

#### Prevention
- Ensure all services are on the same Docker network
- Use service names for inter-service communication
- Monitor service discovery health

### Issue 3: API Gateway Issues

#### Symptoms
- External requests fail
- Service health checks fail
- API responses are slow or timeout

#### Diagnosis
```bash
# Check API Gateway health
curl -s http://localhost:8080/health

# Check API Gateway logs
docker logs digital_tracking_merchandising-api-gateway-1

# Test service endpoints
curl -s http://localhost:3010/health
curl -s http://localhost:3002/health
```

#### Resolution
```bash
# Restart API Gateway
docker-compose restart api-gateway

# Check service dependencies
docker-compose ps

# Verify service health
./scripts/service-discovery-manager.sh health
```

#### Prevention
- Monitor API Gateway performance
- Set up health check alerts
- Regular log analysis

### Issue 4: Database Connectivity Issues

#### Symptoms
- Database connection errors
- Slow database queries
- Service startup failures

#### Diagnosis
```bash
# Check database containers
docker-compose ps | grep db

# Test database connectivity
docker exec digital_tracking_merchandising-auth-service-1 pg_isready -h auth-db -p 5432

# Check database logs
docker logs digital_tracking_merchandising-auth-db-1
```

#### Resolution
```bash
# Restart database services
docker-compose restart auth-db user-db chat-db

# Check database health
docker exec digital_tracking_merchandising-auth-db-1 pg_isready -U auth_user -d auth_db

# Verify database connections
docker exec digital_tracking_merchandising-auth-service-1 psql -h auth-db -U auth_user -d auth_db -c "SELECT 1;"
```

#### Prevention
- Monitor database performance
- Regular database backups
- Connection pooling optimization

### Issue 5: Load Balancer Issues

#### Symptoms
- External access fails
- Load balancing not working
- SSL/TLS issues

#### Diagnosis
```bash
# Check load balancer status
./scripts/load-balancer-manager.sh status

# Check Nginx configuration
docker exec digital_tracking_merchandising-nginx-1 nginx -t

# Test load balancer connectivity
curl -s http://localhost:80
```

#### Resolution
```bash
# Restart load balancer
docker-compose restart nginx

# Check backend services
./scripts/load-balancer-manager.sh check-backends

# Verify configuration
docker exec digital_tracking_merchandising-nginx-1 nginx -s reload
```

#### Prevention
- Monitor load balancer performance
- Regular configuration validation
- Health check monitoring

### Issue 6: Redis Connectivity Issues

#### Symptoms
- Session management fails
- Caching not working
- Real-time features broken

#### Diagnosis
```bash
# Check Redis container
docker-compose ps redis

# Test Redis connectivity
docker exec digital_tracking_merchandising-api-gateway-1 redis-cli -h redis ping

# Check Redis logs
docker logs digital_tracking_merchandising-redis-1
```

#### Resolution
```bash
# Restart Redis
docker-compose restart redis

# Test Redis functionality
docker exec digital_tracking_merchandising-api-gateway-1 redis-cli -h redis set test "value"
docker exec digital_tracking_merchandising-api-gateway-1 redis-cli -h redis get test
```

#### Prevention
- Monitor Redis memory usage
- Regular Redis backups
- Connection pool monitoring

---

## 🔧 Advanced Troubleshooting

### Network Performance Analysis

#### Latency Testing
```bash
# Test inter-service latency
docker exec digital_tracking_merchandising-api-gateway-1 ping -c 10 auth-service
docker exec digital_tracking_merchandising-api-gateway-1 ping -c 10 redis

# Test API response times
time curl -s http://localhost:8080/health
time curl -s http://localhost:3010/health
```

#### Bandwidth Testing
```bash
# Test network bandwidth between containers
docker exec digital_tracking_merchandising-api-gateway-1 iperf -c auth-service
docker exec digital_tracking_merchandising-api-gateway-1 iperf -c redis
```

### Memory and CPU Analysis

#### Resource Usage
```bash
# Check container resource usage
docker stats --no-stream

# Check specific container resources
docker stats digital_tracking_merchandising-api-gateway-1 --no-stream
```

#### Performance Profiling
```bash
# Check service performance
docker exec digital_tracking_merchandising-api-gateway-1 top
docker exec digital_tracking_merchandising-auth-service-1 top
```

### Log Analysis

#### Centralized Logging
```bash
# Check all service logs
docker-compose logs --tail=100

# Check specific service logs
docker-compose logs --tail=50 api-gateway
docker-compose logs --tail=50 auth-service

# Search for errors
docker-compose logs | grep -i error
docker-compose logs | grep -i exception
```

#### Real-time Log Monitoring
```bash
# Monitor logs in real-time
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
```

---

## 🛠️ Troubleshooting Tools

### Built-in Scripts

#### 1. Port Management
```bash
# Check port availability
./scripts/check-ports.sh

# Kill processes on specific port
./scripts/port-killer.sh <port_number>

# List all port usage
./scripts/check-ports.sh --verbose
```

#### 2. Network Health Monitoring
```bash
# Comprehensive health check
./scripts/network-health-checker.sh

# Continuous monitoring
./scripts/network-health-checker.sh --monitor 60
```

#### 3. Service Discovery
```bash
# Discover all services
./scripts/service-discovery-manager.sh discover

# Health check services
./scripts/service-discovery-manager.sh health

# Monitor services
./scripts/service-discovery-manager.sh monitor 30
```

#### 4. Load Balancer Management
```bash
# Check load balancer status
./scripts/load-balancer-manager.sh status

# Check backend services
./scripts/load-balancer-manager.sh check-backends

# Reload configuration
./scripts/load-balancer-manager.sh reload
```

#### 5. Automated Troubleshooting
```bash
# Run all troubleshooting checks
./scripts/network-troubleshooter.sh all

# Troubleshoot specific issues
./scripts/network-troubleshooter.sh ports
./scripts/network-troubleshooter.sh connectivity
./scripts/network-troubleshooter.sh api-gateway
./scripts/network-troubleshooter.sh database
./scripts/network-troubleshooter.sh performance

# Generate troubleshooting report
./scripts/network-troubleshooter.sh report
```

### External Tools

#### 1. Network Diagnostics
```bash
# Ping test
ping -c 5 localhost

# Traceroute
traceroute localhost

# Netstat
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080
```

#### 2. Docker Commands
```bash
# List containers
docker ps -a

# Inspect container
docker inspect digital_tracking_merchandising-api-gateway-1

# Execute commands in container
docker exec -it digital_tracking_merchandising-api-gateway-1 /bin/bash
```

#### 3. System Commands
```bash
# Check system resources
top
htop
free -h
df -h

# Check network interfaces
ifconfig
ip addr show
```

---

## 📊 Monitoring and Alerting

### Key Metrics to Monitor

#### 1. Service Health
- Service availability (uptime)
- Response times
- Error rates
- Health check status

#### 2. Network Performance
- Inter-service latency
- Network throughput
- Packet loss
- Connection counts

#### 3. Resource Usage
- CPU usage per service
- Memory usage per service
- Disk I/O
- Network I/O

#### 4. Database Performance
- Query response times
- Connection pool usage
- Database size
- Backup status

### Alerting Setup

#### 1. Service Down Alerts
```bash
# Monitor service health
./scripts/service-discovery-manager.sh monitor 30

# Set up health check alerts
curl -s http://localhost:8080/health | jq '.services[].status'
```

#### 2. Performance Alerts
```bash
# Monitor response times
time curl -s http://localhost:8080/health

# Monitor resource usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

#### 3. Error Rate Alerts
```bash
# Monitor error logs
docker-compose logs | grep -i error | wc -l

# Monitor exception logs
docker-compose logs | grep -i exception | wc -l
```

---

## 🔄 Recovery Procedures

### Service Recovery

#### 1. Automatic Recovery
```bash
# Enable automatic restart
docker-compose up -d --restart unless-stopped

# Check restart policies
docker inspect digital_tracking_merchandising-api-gateway-1 | grep RestartPolicy
```

#### 2. Manual Recovery
```bash
# Restart specific service
docker-compose restart api-gateway

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### Data Recovery

#### 1. Database Recovery
```bash
# Restore from backup
docker exec -i digital_tracking_merchandising-auth-db-1 psql -U auth_user -d auth_db < backup.sql

# Point-in-time recovery
docker exec digital_tracking_merchandising-auth-db-1 pg_restore -U auth_user -d auth_db backup.dump
```

#### 2. Configuration Recovery
```bash
# Restore configuration files
git checkout HEAD -- docker-compose.microservices.yml
git checkout HEAD -- nginx-microservices.conf

# Restart with restored configuration
docker-compose down
docker-compose up -d
```

---

## 📋 Preventive Maintenance

### Daily Tasks
1. **Health Checks**: Run `./scripts/network-health-checker.sh`
2. **Log Review**: Check for errors in service logs
3. **Performance Monitoring**: Monitor response times and resource usage
4. **Backup Verification**: Ensure backups are working

### Weekly Tasks
1. **Security Updates**: Update base images and dependencies
2. **Performance Analysis**: Review performance metrics
3. **Capacity Planning**: Monitor resource usage trends
4. **Documentation Updates**: Update troubleshooting procedures

### Monthly Tasks
1. **Network Optimization**: Review and optimize network configuration
2. **Security Audit**: Review security configurations
3. **Disaster Recovery Test**: Test backup and recovery procedures
4. **Performance Tuning**: Optimize based on usage patterns

---

## 📚 Additional Resources

### Documentation
- [Network Architecture](./NETWORK_ARCHITECTURE.md)
- [Service Discovery Documentation](./SERVICE_DISCOVERY.md)
- [Load Balancer Configuration](./LOAD_BALANCER_CONFIG.md)
- [Monitoring Setup Guide](./MONITORING_SETUP.md)

### Scripts Reference
- `scripts/check-ports.sh`: Port availability checker
- `scripts/network-health-checker.sh`: Network health monitoring
- `scripts/network-troubleshooter.sh`: Automated troubleshooting
- `scripts/service-discovery-manager.sh`: Service discovery
- `scripts/load-balancer-manager.sh`: Load balancer management
- `scripts/port-killer.sh`: Port conflict resolution

### Emergency Contacts
- **Network Engineer**: Senior Network Engineer (8+ Years Experience)
- **DevOps Team**: Available for infrastructure issues
- **Development Team**: Available for application-specific issues

---

*Last Updated: July 19, 2025*
*Network Engineer: Senior Network Engineer (8+ Years Experience)* 