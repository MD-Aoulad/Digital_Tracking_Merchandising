# 🚀 DevOps Infrastructure & Operations

This document provides a comprehensive guide to the DevOps infrastructure, deployment processes, monitoring, and maintenance procedures for the Digital Tracking Merchandising platform.

## 📋 Table of Contents

- [Infrastructure Overview](#infrastructure-overview)
- [Containerization](#containerization)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Observability](#monitoring--observability)
- [Backup & Recovery](#backup--recovery)
- [Security](#security)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🏗️ Infrastructure Overview

### Architecture Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │   API Gateway   │
│   (React)       │    │   (React Native)│    │   (Load Balancer)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Microservices │
                    │   Architecture  │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Monitoring    │
│   Database      │    │     Cache       │    │   Stack         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (production), Docker Compose (development)
- **Infrastructure as Code**: Terraform
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Cloud**: AWS (ECS, RDS, ElastiCache, S3)

## 🐳 Containerization

### Docker Compose Configurations

#### Development Environment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

#### Production Environment
```bash
# Start production environment
docker-compose up -d

# Scale services
docker-compose up -d --scale api-gateway=3 --scale frontend=2
```

#### Microservices Environment
```bash
# Start microservices stack
docker-compose -f docker-compose.microservices.yml up -d
```

### Container Health Checks

All containers include health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Multi-stage Builds

Optimized Dockerfiles with multi-stage builds:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Security Scanning**
   - Trivy vulnerability scanner
   - Snyk dependency analysis
   - CodeQL static analysis

2. **Build & Test**
   - Multi-matrix builds for all services
   - Unit, integration, and E2E tests
   - Code coverage reporting

3. **Deployment**
   - Development → Staging → Production
   - Automated rollback on failure
   - Blue-green deployment support

### Deployment Environments

#### Development
- **Trigger**: Push to `develop` branch
- **Target**: Development ECS cluster
- **URL**: `https://dev.digital-tracking.com`

#### Staging
- **Trigger**: Push to `main` branch
- **Target**: Staging ECS cluster
- **URL**: `https://staging.digital-tracking.com`

#### Production
- **Trigger**: Manual workflow dispatch
- **Target**: Production ECS cluster
- **URL**: `https://digital-tracking.com`

### Deployment Commands

```bash
# Deploy to development
npm run deploy:dev

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod

# Plan infrastructure changes
npm run plan:prod
```

## 📊 Monitoring & Observability

### Prometheus Metrics

Key metrics collected:

- **Application Metrics**
  - Request rate and response time
  - Error rates and status codes
  - Business metrics (todos, users, etc.)

- **Infrastructure Metrics**
  - CPU and memory usage
  - Disk I/O and network traffic
  - Container health status

- **Database Metrics**
  - Connection pool usage
  - Query performance
  - Lock contention

### Grafana Dashboards

#### Application Dashboard
- Real-time service health
- Request/response metrics
- Error tracking
- Business KPIs

#### Infrastructure Dashboard
- Resource utilization
- Container metrics
- Network performance
- Storage usage

### Alerting Rules

```yaml
# High error rate alert
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value }} errors per second"
```

### Log Management

#### Log Aggregation
- Centralized logging with ELK stack
- Structured JSON logging
- Log retention policies
- Search and analysis capabilities

#### Log Formats
```javascript
{
  "timestamp": "2025-07-19T07:03:57.026Z",
  "level": "info",
  "message": "POST /api/auth/login -> http://auth-service:3001",
  "ip": "::ffff:172.217.18.27",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-12345",
  "service": "api-gateway"
}
```

## 💾 Backup & Recovery

### Automated Backup System

#### Backup Types
1. **Database Backups**
   - Daily PostgreSQL dumps
   - Point-in-time recovery support
   - Automated compression

2. **File System Backups**
   - Application code and configurations
   - User uploads and assets
   - Incremental backup support

3. **Configuration Backups**
   - Environment configurations
   - Infrastructure state
   - Service configurations

#### Backup Schedule
```bash
# Daily backups at 2 AM
0 2 * * * /usr/bin/node backup.js run

# Weekly full backups
0 2 * * 0 /usr/bin/node backup.js run --full

# Monthly archive
0 2 1 * * /usr/bin/node backup.js run --archive
```

#### Recovery Procedures

```bash
# Restore database
pg_restore -h localhost -U username -d database backup.sql

# Restore files
unzip backup.zip -d /restore/path

# Restore configuration
cp config-backup.json /etc/app/config.json
```

### Disaster Recovery

#### RTO (Recovery Time Objective): 4 hours
#### RPO (Recovery Point Objective): 1 hour

#### Recovery Steps
1. **Infrastructure Recovery**
   ```bash
   terraform apply -var-file=environments/prod.tfvars
   ```

2. **Database Recovery**
   ```bash
   aws s3 cp s3://backup-bucket/latest.sql ./latest.sql
   pg_restore -d database latest.sql
   ```

3. **Application Recovery**
   ```bash
   docker-compose up -d
   kubectl apply -f kubernetes/
   ```

## 🔒 Security

### Security Scanning

#### Container Security
```bash
# Scan Docker images
trivy image digital-tracking/api-gateway:latest

# Scan for vulnerabilities
snyk container test digital-tracking/api-gateway:latest
```

#### Code Security
```bash
# Dependency vulnerability scan
npm audit --audit-level=moderate

# Static code analysis
eslint . --ext .js,.ts
```

### Access Control

#### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:UpdateService"
      ],
      "Resource": "arn:aws:ecs:region:account:service/*"
    }
  ]
}
```

#### Network Security
- VPC with private subnets
- Security groups with minimal access
- WAF for web application protection
- SSL/TLS encryption in transit

### Secrets Management

#### Environment Variables
```bash
# Production secrets
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
```

#### AWS Secrets Manager
```bash
# Store secrets
aws secretsmanager create-secret \
  --name "digital-tracking/prod/database" \
  --secret-string '{"username":"user","password":"pass"}'

# Retrieve secrets
aws secretsmanager get-secret-value \
  --secret-id "digital-tracking/prod/database"
```

## ⚡ Performance Optimization

### Application Performance

#### Caching Strategy
```javascript
// Redis caching
const cache = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Cache frequently accessed data
app.get('/api/users/:id', async (req, res) => {
  const cacheKey = `user:${req.params.id}`;
  let user = await cache.get(cacheKey);
  
  if (!user) {
    user = await db.getUser(req.params.id);
    await cache.setex(cacheKey, 3600, JSON.stringify(user));
  }
  
  res.json(user);
});
```

#### Database Optimization
```sql
-- Index optimization
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM todos WHERE user_id = ? AND status = 'pending';
```

### Infrastructure Performance

#### Auto Scaling
```yaml
# ECS Auto Scaling
- name: scale-up
  expression: avg_cpu_utilization > 70
  action: scale_up
  cooldown: 300

- name: scale-down
  expression: avg_cpu_utilization < 30
  action: scale_down
  cooldown: 300
```

#### Load Balancing
```yaml
# Application Load Balancer
health_check:
  path: /health
  port: 3000
  protocol: HTTP
  interval: 30
  timeout: 5
  healthy_threshold: 2
  unhealthy_threshold: 3
```

## 🔧 Troubleshooting

### Common Issues

#### Service Not Starting
```bash
# Check container logs
docker-compose logs service-name

# Check container status
docker-compose ps

# Restart service
docker-compose restart service-name
```

#### Database Connection Issues
```bash
# Test database connectivity
pg_isready -h hostname -p 5432 -U username

# Check connection pool
SELECT * FROM pg_stat_activity;

# Monitor slow queries
SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC;
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check application metrics
curl http://localhost:3000/metrics

# Analyze slow requests
grep "slow" /var/log/app.log
```

### Debugging Tools

#### Container Debugging
```bash
# Enter running container
docker exec -it container-name /bin/bash

# View container processes
docker top container-name

# Inspect container
docker inspect container-name
```

#### Network Debugging
```bash
# Test service connectivity
curl -v http://service-name:port/health

# Check DNS resolution
nslookup service-name

# Monitor network traffic
tcpdump -i any port 3000
```

### Health Checks

#### Application Health
```bash
# Check all services
curl http://localhost:3000/health

# Check specific service
curl http://localhost:3001/health

# Run comprehensive health check
npm run health:check
```

#### Infrastructure Health
```bash
# Check Kubernetes pods
kubectl get pods -n digital-tracking

# Check ECS services
aws ecs describe-services --cluster cluster-name --services service-name

# Check database health
aws rds describe-db-instances --db-instance-identifier instance-name
```

## 📚 Additional Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Terraform Documentation](https://www.terraform.io/docs/)
- [AWS Documentation](https://docs.aws.amazon.com/)

### Tools
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [ELK Stack](https://www.elastic.co/elk-stack)
- [Trivy](https://trivy.dev/)

### Best Practices
- [12 Factor App](https://12factor.net/)
- [DevOps Best Practices](https://aws.amazon.com/devops/)
- [Container Security](https://kubernetes.io/docs/concepts/security/)

---

**For support and questions, contact the DevOps team or create an issue in the repository.** 