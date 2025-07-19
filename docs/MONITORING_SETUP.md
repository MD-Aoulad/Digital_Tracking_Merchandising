# Monitoring Setup Guide
## Digital Tracking Merchandising Platform

### Overview
This guide covers the setup and configuration of the monitoring stack for the Digital Tracking Merchandising Platform. The monitoring system includes Prometheus for metrics collection, Grafana for visualization, and comprehensive health monitoring across all microservices.

---

## 🏗️ Monitoring Architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MONITORING STACK                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Prometheus    │  │     Grafana     │  │   Alertmanager  │              │
│  │   (Port 9090)   │  │   (Port 3002)   │  │   (Port 9093)   │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │   API        │ │   Service   │ │   Health   │
            │   Gateway    │ │   Metrics   │ │   Checks   │
            │   Metrics    │ │   Endpoints │ │   Monitor  │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │   Microservices Network      │ │   Docker   │
            │   (All Services)             │ │   Metrics  │
            └──────────────────────────────┘ └────────────┘
```

### Monitoring Components

#### 1. Prometheus
- **Purpose**: Metrics collection and storage
- **Port**: 9090
- **Features**: Time-series database, query language, alerting
- **Configuration**: `monitoring/prometheus.yml`

#### 2. Grafana
- **Purpose**: Metrics visualization and dashboards
- **Port**: 3002
- **Features**: Interactive dashboards, alerting, user management
- **Configuration**: `monitoring/grafana/`

#### 3. Health Monitoring
- **Purpose**: Service health checks and monitoring
- **Features**: Automated health checks, failure detection, recovery
- **Scripts**: `scripts/network-health-checker.sh`

#### 4. Log Aggregation
- **Purpose**: Centralized logging and log analysis
- **Features**: Log collection, parsing, searching, alerting
- **Configuration**: Docker logging drivers

---

## 🔧 Monitoring Configuration

### Prometheus Configuration

#### Main Configuration (`monitoring/prometheus.yml`)
```yaml
global:
  scrape_interval: 30s
  evaluation_interval: 30s
  external_labels:
    cluster: 'digital-tracking-merchandising'
    environment: 'development'

rule_files:
  - "alert_rules.yml"

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 30s

  # API Gateway metrics
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

  # Frontend metrics
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend-app:3000']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

  # Auth Service metrics
  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

  # User Service metrics
  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:3002']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

  # Chat Service metrics
  - job_name: 'chat-service'
    static_configs:
      - targets: ['chat-service:3003']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

  # Todo Service metrics
  - job_name: 'todo-service'
    static_configs:
      - targets: ['todo-service:3005']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

  # Database metrics
  - job_name: 'postgres'
    static_configs:
      - targets: ['auth-db:5432', 'user-db:5432', 'chat-db:5432']
    scrape_interval: 60s
    metrics_path: '/metrics'
    scrape_timeout: 15s

  # Redis metrics
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

  # Load balancer metrics
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    scrape_interval: 30s
    metrics_path: '/nginx_status'
    scrape_timeout: 10s

  # Docker metrics
  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']
    scrape_interval: 30s
    metrics_path: '/metrics'
    scrape_timeout: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# Alert rules
groups:
  - name: service-alerts
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service {{ $labels.job }} has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on {{ $labels.job }}"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High response time on {{ $labels.job }}"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: HighMemoryUsage
        expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.name }}"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.name }}"
          description: "CPU usage is {{ $value | humanizePercentage }}"
```

### Grafana Configuration

#### Datasource Configuration (`monitoring/grafana/datasources/prometheus.yml`)
```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      timeInterval: "30s"
```

#### Dashboard Configuration (`monitoring/grafana/dashboards/app-dashboard.json`)
```json
{
  "dashboard": {
    "id": null,
    "title": "Digital Tracking Merchandising - Application Dashboard",
    "tags": ["microservices", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Service Health Overview",
        "type": "stat",
        "targets": [
          {
            "expr": "up",
            "legendFormat": "{{job}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "green", "value": 1}
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{job}} - {{method}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests per second"
          }
        ]
      },
      {
        "id": 3,
        "title": "Response Time (95th percentile)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{job}}"
          }
        ],
        "yAxes": [
          {
            "label": "Response time (seconds)"
          }
        ]
      },
      {
        "id": 4,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{job}}"
          }
        ],
        "yAxes": [
          {
            "label": "Errors per second"
          }
        ]
      },
      {
        "id": 5,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "container_memory_usage_bytes / container_spec_memory_limit_bytes * 100",
            "legendFormat": "{{name}}"
          }
        ],
        "yAxes": [
          {
            "label": "Memory usage (%)"
          }
        ]
      },
      {
        "id": 6,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total[5m]) * 100",
            "legendFormat": "{{name}}"
          }
        ],
        "yAxes": [
          {
            "label": "CPU usage (%)"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### Docker Compose Configuration

#### Monitoring Services
```yaml
# Monitoring configuration in docker-compose.microservices.yml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    - prometheus-data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--web.console.libraries=/etc/prometheus/console_libraries'
    - '--web.console.templates=/etc/prometheus/consoles'
    - '--storage.tsdb.retention.time=200h'
    - '--web.enable-lifecycle'
  networks:
    - microservices-network
  restart: unless-stopped

grafana:
  image: grafana/grafana:latest
  ports:
    - "3002:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    - GF_USERS_ALLOW_SIGN_UP=false
  volumes:
    - grafana-data:/var/lib/grafana
    - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
  depends_on:
    - prometheus
  networks:
    - microservices-network
  restart: unless-stopped

alertmanager:
  image: prom/alertmanager:latest
  ports:
    - "9093:9093"
  volumes:
    - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
    - alertmanager-data:/alertmanager
  command:
    - '--config.file=/etc/alertmanager/alertmanager.yml'
    - '--storage.path=/alertmanager'
  networks:
    - microservices-network
  restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:
```

---

## 📊 Monitoring Setup

### Initial Setup

#### 1. Create Monitoring Directory Structure
```bash
# Create monitoring directory structure
mkdir -p monitoring/{grafana/{dashboards,datasources},alertmanager}

# Create configuration files
touch monitoring/prometheus.yml
touch monitoring/alertmanager.yml
touch monitoring/grafana/datasources/prometheus.yml
touch monitoring/grafana/dashboards/app-dashboard.json
```

#### 2. Configure Prometheus
```bash
# Copy Prometheus configuration
cp monitoring/prometheus.yml monitoring/prometheus.yml.backup

# Edit configuration
nano monitoring/prometheus.yml
```

#### 3. Configure Grafana
```bash
# Set up Grafana datasources
cp monitoring/grafana/datasources/prometheus.yml monitoring/grafana/datasources/prometheus.yml.backup

# Set up Grafana dashboards
cp monitoring/grafana/dashboards/app-dashboard.json monitoring/grafana/dashboards/app-dashboard.json.backup
```

#### 4. Start Monitoring Services
```bash
# Start monitoring stack
docker-compose up -d prometheus grafana alertmanager

# Check service status
docker-compose ps prometheus grafana alertmanager
```

### Service Integration

#### 1. Add Metrics Endpoints
```javascript
// Add metrics endpoint to services
const prometheus = require('prom-client');

// Create metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  next();
});
```

#### 2. Health Check Integration
```javascript
// Health check endpoint
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

---

## 🔍 Monitoring Dashboard

### Key Metrics to Monitor

#### 1. Service Health Metrics
- **Service Availability**: `up` metric for each service
- **Health Check Status**: Health endpoint responses
- **Service Restarts**: Container restart count
- **Uptime**: Service uptime duration

#### 2. Performance Metrics
- **Request Rate**: Requests per second
- **Response Time**: 95th percentile response time
- **Error Rate**: 4xx and 5xx error rates
- **Throughput**: Bytes transferred per second

#### 3. Resource Metrics
- **CPU Usage**: CPU utilization percentage
- **Memory Usage**: Memory utilization percentage
- **Disk I/O**: Disk read/write operations
- **Network I/O**: Network bytes sent/received

#### 4. Business Metrics
- **User Activity**: Active users, sessions
- **Feature Usage**: API endpoint usage
- **Error Patterns**: Common error types
- **Performance Trends**: Response time trends

### Dashboard Configuration

#### 1. Main Application Dashboard
```json
{
  "dashboard": {
    "title": "Digital Tracking Merchandising - Main Dashboard",
    "panels": [
      {
        "title": "Service Health Overview",
        "type": "stat",
        "targets": [
          {
            "expr": "up",
            "legendFormat": "{{job}}"
          }
        ]
      },
      {
        "title": "Request Rate by Service",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{job}}"
          }
        ]
      },
      {
        "title": "Response Time Distribution",
        "type": "heatmap",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_bucket[5m])",
            "legendFormat": "{{le}}"
          }
        ]
      }
    ]
  }
}
```

#### 2. Infrastructure Dashboard
```json
{
  "dashboard": {
    "title": "Infrastructure Dashboard",
    "panels": [
      {
        "title": "Container Resource Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "container_cpu_usage_seconds_total",
            "legendFormat": "{{name}}"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "container_memory_usage_bytes",
            "legendFormat": "{{name}}"
          }
        ]
      },
      {
        "title": "Network Traffic",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_network_receive_bytes_total[5m])",
            "legendFormat": "{{name}} - Receive"
          },
          {
            "expr": "rate(container_network_transmit_bytes_total[5m])",
            "legendFormat": "{{name}} - Transmit"
          }
        ]
      }
    ]
  }
}
```

---

## 🚨 Alerting Configuration

### Alert Rules

#### 1. Service Alerts
```yaml
# Service availability alerts
- alert: ServiceDown
  expr: up == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.job }} is down"
    description: "Service {{ $labels.job }} has been down for more than 1 minute"

- alert: ServiceHighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High error rate on {{ $labels.job }}"
    description: "Error rate is {{ $value }} errors per second"
```

#### 2. Performance Alerts
```yaml
# Performance alerts
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High response time on {{ $labels.job }}"
    description: "95th percentile response time is {{ $value }} seconds"

- alert: HighMemoryUsage
  expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage on {{ $labels.name }}"
    description: "Memory usage is {{ $value | humanizePercentage }}"
```

#### 3. Infrastructure Alerts
```yaml
# Infrastructure alerts
- alert: HighCPUUsage
  expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High CPU usage on {{ $labels.name }}"
    description: "CPU usage is {{ $value | humanizePercentage }}"

- alert: DiskSpaceLow
  expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Low disk space on {{ $labels.instance }}"
    description: "Disk space is {{ $value | humanizePercentage }} available"
```

### Alertmanager Configuration

#### Alertmanager Configuration (`monitoring/alertmanager.yml`)
```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.title" . }}'
        text: '{{ template "slack.text" . }}'
        send_resolved: true

templates:
  - '/etc/alertmanager/template/*.tmpl'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
```

---

## 🔧 Monitoring Management

### Monitoring Commands

#### 1. Service Management
```bash
# Start monitoring services
docker-compose up -d prometheus grafana alertmanager

# Stop monitoring services
docker-compose stop prometheus grafana alertmanager

# Restart monitoring services
docker-compose restart prometheus grafana alertmanager

# Check monitoring service status
docker-compose ps prometheus grafana alertmanager
```

#### 2. Configuration Management
```bash
# Reload Prometheus configuration
curl -X POST http://localhost:9090/-/reload

# Reload Alertmanager configuration
curl -X POST http://localhost:9093/-/reload

# Check Prometheus configuration
curl -s http://localhost:9090/api/v1/status/config

# Check Alertmanager configuration
curl -s http://localhost:9093/api/v1/status
```

#### 3. Data Management
```bash
# Backup Prometheus data
docker exec digital_tracking_merchandising-prometheus-1 tar -czf /prometheus/backup.tar.gz /prometheus

# Backup Grafana data
docker exec digital_tracking_merchandising-grafana-1 tar -czf /var/lib/grafana/backup.tar.gz /var/lib/grafana

# Restore Prometheus data
docker exec -i digital_tracking_merchandising-prometheus-1 tar -xzf /prometheus/backup.tar.gz

# Restore Grafana data
docker exec -i digital_tracking_merchandising-grafana-1 tar -xzf /var/lib/grafana/backup.tar.gz
```

### Monitoring Scripts

#### 1. Monitoring Health Check
```bash
#!/bin/bash
# scripts/monitoring-health-check.sh

echo "Checking monitoring services..."

# Check Prometheus
if curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo "✅ Prometheus is healthy"
else
    echo "❌ Prometheus is not responding"
fi

# Check Grafana
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo "✅ Grafana is healthy"
else
    echo "❌ Grafana is not responding"
fi

# Check Alertmanager
if curl -s http://localhost:9093/-/healthy > /dev/null; then
    echo "✅ Alertmanager is healthy"
else
    echo "❌ Alertmanager is not responding"
fi
```

#### 2. Metrics Collection
```bash
#!/bin/bash
# scripts/collect-metrics.sh

echo "Collecting system metrics..."

# Collect service metrics
for service in api-gateway auth-service user-service chat-service; do
    echo "Collecting metrics from $service..."
    curl -s http://localhost:8080/api/$service/metrics > metrics/$service.json
done

# Collect system metrics
docker stats --no-stream --format json > metrics/system.json

# Collect network metrics
./scripts/network-health-checker.sh > metrics/network.json
```

---

## 📋 Monitoring Best Practices

### Configuration Best Practices

#### 1. Prometheus Configuration
- Use appropriate scrape intervals
- Configure proper timeouts
- Set up retention policies
- Monitor Prometheus itself

#### 2. Grafana Configuration
- Create meaningful dashboards
- Use appropriate time ranges
- Set up user management
- Configure data sources properly

#### 3. Alerting Configuration
- Set appropriate thresholds
- Use meaningful alert messages
- Configure proper escalation
- Test alerting regularly

### Operational Best Practices

#### 1. Monitoring
- Monitor the monitoring system itself
- Set up alerting for monitoring failures
- Regular backup of monitoring data
- Test monitoring regularly

#### 2. Performance
- Optimize query performance
- Use appropriate retention periods
- Monitor resource usage
- Scale monitoring as needed

#### 3. Security
- Secure monitoring endpoints
- Use authentication for Grafana
- Monitor access to monitoring systems
- Regular security updates

---

## 📚 Additional Resources

### Documentation
- [Network Architecture](./NETWORK_ARCHITECTURE.md)
- [Network Troubleshooting Guide](./NETWORK_TROUBLESHOOTING.md)
- [Service Discovery Documentation](./SERVICE_DISCOVERY.md)
- [Load Balancer Configuration](./LOAD_BALANCER_CONFIG.md)

### Scripts Reference
- `scripts/monitoring-health-check.sh`: Monitoring health check
- `scripts/collect-metrics.sh`: Metrics collection
- `scripts/network-health-checker.sh`: Network health monitoring
- `scripts/network-troubleshooter.sh`: Automated troubleshooting

### Configuration Files
- `monitoring/prometheus.yml`: Prometheus configuration
- `monitoring/alertmanager.yml`: Alertmanager configuration
- `monitoring/grafana/`: Grafana dashboards and datasources
- `docker-compose.microservices.yml`: Docker Compose configuration

---

*Last Updated: July 19, 2025*
*Network Engineer: Senior Network Engineer (8+ Years Experience)* 