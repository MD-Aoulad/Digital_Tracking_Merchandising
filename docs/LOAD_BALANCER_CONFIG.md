# Load Balancer Configuration Documentation
## Digital Tracking Merchandising Platform

### Overview
The load balancer (Nginx) serves as the entry point for all external traffic to the Digital Tracking Merchandising Platform. It provides reverse proxy functionality, load balancing, SSL termination, and health monitoring for the microservices architecture.

---

## 🏗️ Load Balancer Architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL TRAFFIC                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web       │  │   Mobile    │  │   API       │  │   Admin     │        │
│  │   Browser   │  │   App       │  │   Clients   │  │   Panel     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │        Load Balancer          │
                    │         (Nginx)               │
                    │      Port 80 (HTTP)           │
                    │    Port 443 (HTTPS)           │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │   Frontend   │ │   API       │ │   Mobile   │
            │   Service    │ │   Gateway   │ │   App      │
            │   (Port 3000)│ │(Port 8080)  │ │(Port 19000)│
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │   React      │ │   Microservices Router │ │   Expo     │
            │   Web App    │ │   (Auth, User, Chat)   │ │   Mobile   │
            └──────────────┘ └─────────────────────────┘ └────────────┘
```

### Load Balancer Components

#### 1. Nginx Reverse Proxy
- **Purpose**: Route traffic to appropriate backend services
- **Configuration**: `nginx-microservices.conf`
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: SSL termination, rate limiting, caching

#### 2. Health Monitoring
- **Purpose**: Monitor backend service health
- **Checks**: HTTP health endpoints
- **Failover**: Automatic failover for unhealthy services
- **Recovery**: Automatic recovery when services become healthy

#### 3. Load Distribution
- **Algorithm**: Round-robin with health checks
- **Session Persistence**: Sticky sessions for authenticated users
- **Backend Management**: Dynamic backend configuration
- **Traffic Control**: Rate limiting and traffic shaping

#### 4. Security Features
- **SSL/TLS**: HTTPS termination and certificate management
- **Rate Limiting**: Protection against DDoS attacks
- **Access Control**: IP-based access restrictions
- **Request Validation**: Input validation and sanitization

---

## 🔧 Load Balancer Configuration

### Nginx Configuration File

#### Main Configuration (`nginx-microservices.conf`)
```nginx
# Nginx configuration for Digital Tracking Merchandising Platform
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging configuration
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

    # Upstream definitions
    upstream frontend_backend {
        server frontend-app:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream api_gateway_backend {
        server api-gateway:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream mobile_backend {
        server mobile-app:19000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Health check configuration
    match health_check {
        status 200;
        header Content-Type = application/json;
        body ~ '"status":"OK"';
    }

    # Main server block
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html index.htm;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Frontend application
        location / {
            proxy_pass http://frontend_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            proxy_buffering off;
            proxy_cache off;
        }

        # API Gateway
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api_gateway_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            proxy_buffering off;
            proxy_cache off;

            # Health check
            health_check interval=10s fails=3 passes=2 uri=/health match=health_check;
        }

        # Authentication endpoints
        location /auth/ {
            limit_req zone=login burst=10 nodelay;
            proxy_pass http://api_gateway_backend/auth/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            proxy_buffering off;
            proxy_cache off;
        }

        # Mobile application
        location /mobile/ {
            proxy_pass http://mobile_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            proxy_buffering off;
            proxy_cache off;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Status page (for monitoring)
        location /nginx_status {
            stub_status on;
            access_log off;
            allow 127.0.0.1;
            deny all;
        }

        # Error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

### Docker Compose Configuration

#### Load Balancer Service
```yaml
# Load balancer configuration in docker-compose.microservices.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"  # For HTTPS (when configured)
  volumes:
    - ./nginx-microservices.conf:/etc/nginx/nginx.conf:ro
    - ./ssl/:/etc/nginx/ssl/:ro  # SSL certificates
    - nginx-logs:/var/log/nginx
  depends_on:
    - api-gateway
    - frontend-app
    - mobile-app
  networks:
    - microservices-network
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

---

## 📊 Load Balancer Management

### Load Balancer Commands

#### 1. Status Management
```bash
# Check load balancer status
./scripts/load-balancer-manager.sh status

# Check backend services
./scripts/load-balancer-manager.sh check-backends

# Check load balancer health
./scripts/load-balancer-manager.sh health
```

#### 2. Configuration Management
```bash
# Reload configuration
./scripts/load-balancer-manager.sh reload

# Test configuration
./scripts/load-balancer-manager.sh test-config

# Backup configuration
./scripts/load-balancer-manager.sh backup
```

#### 3. Backend Management
```bash
# Add backend service
./scripts/load-balancer-manager.sh add-backend auth-service 3010

# Remove backend service
./scripts/load-balancer-manager.sh remove-backend auth-service

# Update backend configuration
./scripts/load-balancer-manager.sh update-backend auth-service 3010 /health
```

#### 4. Monitoring and Logs
```bash
# View load balancer logs
./scripts/load-balancer-manager.sh logs

# Monitor traffic
./scripts/load-balancer-manager.sh monitor

# Check performance metrics
./scripts/load-balancer-manager.sh metrics
```

### Load Balancer Scripts

#### 1. Load Balancer Manager
```bash
#!/bin/bash
# scripts/load-balancer-manager.sh

# Usage: ./scripts/load-balancer-manager.sh [COMMAND] [OPTIONS]
#
# Commands:
#   status              Check load balancer status
#   check-backends      Check backend service health
#   health              Check load balancer health
#   reload              Reload Nginx configuration
#   test-config         Test Nginx configuration
#   backup              Backup current configuration
#   add-backend <service> <port>  Add backend service
#   remove-backend <service>      Remove backend service
#   update-backend <service> <port> <health_path>  Update backend
#   logs                View load balancer logs
#   monitor             Monitor traffic and performance
#   metrics             Show performance metrics
#   help                Show this help message
```

#### 2. Health Check Implementation
```bash
# Health check function
check_backend_health() {
    local service_name=$1
    local port=$2
    local health_path=$3
    
    # Check if service is running
    if ! docker ps | grep -q "$service_name"; then
        echo "[ERROR] Backend service $service_name is not running"
        return 1
    fi
    
    # Check health endpoint
    local health_url="http://localhost:$port$health_path"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$health_url")
    
    if [ "$response" = "200" ]; then
        echo "[SUCCESS] Backend service $service_name is healthy"
        return 0
    else
        echo "[ERROR] Backend service $service_name health check failed (HTTP $response)"
        return 1
    fi
}
```

---

## 🔍 Load Balancer Monitoring

### Performance Metrics

#### 1. Traffic Metrics
```bash
# Monitor request rate
curl -s http://localhost/nginx_status

# Check active connections
docker exec digital_tracking_merchandising-nginx-1 nginx -s status

# Monitor response times
time curl -s http://localhost/api/health
```

#### 2. Backend Health Metrics
```bash
# Check backend health
./scripts/load-balancer-manager.sh check-backends

# Monitor backend response times
for service in auth-service user-service chat-service; do
    echo "Testing $service..."
    time curl -s http://localhost/api/health
done
```

#### 3. Error Rate Monitoring
```bash
# Check error logs
docker logs digital_tracking_merchandising-nginx-1 | grep -i error

# Monitor 4xx and 5xx responses
docker exec digital_tracking_merchandising-nginx-1 tail -f /var/log/nginx/access.log | grep -E " [4-5][0-9][0-9] "
```

### Monitoring Configuration

#### 1. Prometheus Metrics
```yaml
# Prometheus configuration for load balancer metrics
scrape_configs:
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
    honor_labels: true
```

#### 2. Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Load Balancer Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "nginx_http_requests_total",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "nginx_http_request_duration_seconds",
            "legendFormat": "{{backend}}"
          }
        ]
      },
      {
        "title": "Active Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "nginx_connections_active",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

#### 3. Alerting Rules
```yaml
# Alerting rules for load balancer
groups:
  - name: load-balancer
    rules:
      - alert: HighErrorRate
        expr: rate(nginx_http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on load balancer"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: BackendDown
        expr: nginx_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Backend service is down"
          description: "Backend service {{ $labels.backend }} is not responding"
```

---

## 🚨 Load Balancer Troubleshooting

### Common Issues

#### 1. Backend Service Unavailable
**Symptoms**: 502 Bad Gateway errors
**Diagnosis**:
```bash
# Check backend service status
./scripts/load-balancer-manager.sh check-backends

# Check backend service logs
docker logs digital_tracking_merchandising-auth-service-1

# Test backend directly
curl -s http://localhost:3010/health
```

**Resolution**:
```bash
# Restart backend service
docker-compose restart auth-service

# Reload load balancer configuration
./scripts/load-balancer-manager.sh reload

# Check load balancer logs
docker logs digital_tracking_merchandising-nginx-1
```

#### 2. Configuration Errors
**Symptoms**: Load balancer fails to start
**Diagnosis**:
```bash
# Test Nginx configuration
./scripts/load-balancer-manager.sh test-config

# Check configuration syntax
docker exec digital_tracking_merchandising-nginx-1 nginx -t

# View configuration file
cat nginx-microservices.conf
```

**Resolution**:
```bash
# Fix configuration errors
# Edit nginx-microservices.conf

# Test configuration
docker exec digital_tracking_merchandising-nginx-1 nginx -t

# Reload configuration
./scripts/load-balancer-manager.sh reload
```

#### 3. High Response Times
**Symptoms**: Slow response times
**Diagnosis**:
```bash
# Check response times
time curl -s http://localhost/api/health

# Monitor backend performance
docker stats digital_tracking_merchandising-auth-service-1

# Check load balancer performance
docker stats digital_tracking_merchandising-nginx-1
```

**Resolution**:
```bash
# Optimize backend services
docker-compose restart

# Check for resource constraints
docker stats --no-stream

# Optimize load balancer configuration
# Adjust worker_processes and worker_connections
```

### Troubleshooting Commands

#### 1. Load Balancer Debug
```bash
# Debug load balancer
./scripts/load-balancer-manager.sh status --verbose

# Check detailed logs
docker logs digital_tracking_merchandising-nginx-1 --tail=100

# Test configuration
docker exec digital_tracking_merchandising-nginx-1 nginx -T
```

#### 2. Backend Debug
```bash
# Debug backend services
./scripts/load-balancer-manager.sh check-backends --verbose

# Test backend connectivity
for service in auth-service user-service chat-service; do
    echo "Testing $service..."
    docker exec digital_tracking_merchandising-nginx-1 curl -s http://$service:3001/health
done
```

#### 3. Performance Debug
```bash
# Performance analysis
./scripts/load-balancer-manager.sh metrics

# Monitor real-time traffic
docker exec digital_tracking_merchandising-nginx-1 tail -f /var/log/nginx/access.log

# Check resource usage
docker stats digital_tracking_merchandising-nginx-1 --no-stream
```

---

## 🔄 Load Balancer Recovery

### Automatic Recovery

#### 1. Health Check Recovery
```nginx
# Health check configuration with automatic recovery
upstream api_gateway_backend {
    server api-gateway:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

location /api/ {
    health_check interval=10s fails=3 passes=2 uri=/health match=health_check;
    proxy_pass http://api_gateway_backend/;
}
```

#### 2. Service Restart Recovery
```bash
# Automatic service restart
docker-compose up -d --restart unless-stopped

# Check restart policies
docker inspect digital_tracking_merchandising-nginx-1 | grep RestartPolicy
```

### Manual Recovery

#### 1. Configuration Recovery
```bash
# Backup current configuration
./scripts/load-balancer-manager.sh backup

# Restore configuration
cp backup/nginx-microservices.conf ./nginx-microservices.conf

# Reload configuration
./scripts/load-balancer-manager.sh reload
```

#### 2. Service Recovery
```bash
# Restart load balancer
docker-compose restart nginx

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

#### 3. Network Recovery
```bash
# Recreate network
docker network rm digital_tracking_merchandising_microservices-network
docker-compose up -d

# Reconnect services
docker network connect digital_tracking_merchandising_microservices-network nginx
```

---

## 📋 Load Balancer Best Practices

### Configuration Best Practices

#### 1. Performance Optimization
```nginx
# Performance optimizations
worker_processes auto;
worker_connections 1024;
use epoll;
multi_accept on;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
```

#### 2. Security Configuration
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

#### 3. Health Check Configuration
```nginx
# Health check configuration
match health_check {
    status 200;
    header Content-Type = application/json;
    body ~ '"status":"OK"';
}

location /api/ {
    health_check interval=10s fails=3 passes=2 uri=/health match=health_check;
    proxy_pass http://api_gateway_backend/;
}
```

### Operational Best Practices

#### 1. Monitoring
- Monitor request rates and response times
- Set up alerting for high error rates
- Track backend service health
- Monitor resource usage

#### 2. Logging
- Configure access and error logs
- Implement log rotation
- Monitor for security events
- Analyze traffic patterns

#### 3. Backup and Recovery
- Regular configuration backups
- Test recovery procedures
- Document recovery steps
- Maintain backup verification

### Security Best Practices

#### 1. Access Control
- Restrict access to status pages
- Implement IP-based access controls
- Use SSL/TLS encryption
- Monitor access logs

#### 2. Rate Limiting
- Implement rate limiting for API endpoints
- Configure burst limits
- Monitor rate limit violations
- Adjust limits based on usage

#### 3. Security Headers
- Implement security headers
- Use HTTPS for all traffic
- Validate input requests
- Monitor for security events

---

## 📚 Additional Resources

### Documentation
- [Network Architecture](./NETWORK_ARCHITECTURE.md)
- [Network Troubleshooting Guide](./NETWORK_TROUBLESHOOTING.md)
- [Service Discovery Documentation](./SERVICE_DISCOVERY.md)
- [Monitoring Setup Guide](./MONITORING_SETUP.md)

### Scripts Reference
- `scripts/load-balancer-manager.sh`: Load balancer management
- `scripts/network-health-checker.sh`: Network health monitoring
- `scripts/network-troubleshooter.sh`: Automated troubleshooting
- `scripts/service-discovery-manager.sh`: Service discovery

### Configuration Files
- `nginx-microservices.conf`: Nginx load balancer configuration
- `docker-compose.microservices.yml`: Docker Compose configuration
- `monitoring/prometheus.yml`: Monitoring configuration
- `monitoring/grafana/`: Dashboard configuration

---

*Last Updated: July 19, 2025*
*Network Engineer: Senior Network Engineer (8+ Years Experience)* 