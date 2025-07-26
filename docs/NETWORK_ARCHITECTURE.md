# Network Architecture Documentation
## Digital Tracking Merchandising Platform

### Overview
The Digital Tracking Merchandising Platform uses a microservices architecture with Docker containers orchestrated through Docker Compose. The network infrastructure is designed for high availability, scalability, and maintainability.

### Service Port Mapping
| Service              | External Port | Internal Port | Protocol | Purpose                  |
|----------------------|--------------|--------------|----------|--------------------------|
| Frontend             | 3000         | 3000         | HTTP     | React Web Application    |
| API Gateway          | 8080         | 3000         | HTTP     | Microservices Router     |
| Auth Service         | 3010         | 3001         | HTTP     | Authentication           |
| User Service         | 3002         | 3002         | HTTP     | User Management          |
| Chat Service         | 3003         | 3003         | HTTP/WS  | Real-time Chat           |
| Attendance Service   | 3007         | 3007         | HTTP     | Attendance Tracking      |
| Todo Service         | 3005         | 3005         | HTTP     | Task Management          |
| Report Service       | 3006         | 3006         | HTTP     | Reporting                |
| Approval Service     | 3011         | 3011         | HTTP     | Approval Workflows       |
| Workplace Service    | 3008         | 3008         | HTTP     | Workplace Management     |
| Notification Service | 3009         | 3009         | HTTP     | Notifications            |
| Mobile App           | 3003         | 3002         | HTTP     | Mobile API Gateway       |
| Grafana              | 3002         | 3000         | HTTP     | Monitoring Dashboard     |
| Prometheus           | 9090         | 9090         | HTTP     | Metrics Collection       |
| Redis                | 6379         | 6379         | TCP      | Caching & Sessions       |
| Nginx (Load Balancer)| 80           | 80           | HTTP     | Reverse Proxy            |
| **pgAdmin**          | **8088**     | **80**       | HTTP     | PostgreSQL Admin Tool    |

---

## 🏗️ Network Architecture

### Network Topology
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL ACCESS LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Load Balancer (Nginx) - Port 80                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Frontend      │  │   API Gateway   │  │   Mobile App    │              │
│  │   (Port 3000)   │  │   (Port 8080)   │  │   (Port 19000)  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │ Auth Service │ │User Service │ │Chat Service│
            │ (Port 3010)  │ │(Port 3002)  │ │(Port 3003) │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │ Auth DB      │ │User DB      │ │Chat DB     │
            │ (Port 5432)  │ │(Port 5433)  │ │(Port 5434) │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │Attendance Svc│ │Todo Service │ │Report Svc  │
            │ (Port 3004)  │ │(Port 3005)  │ │(Port 3006) │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │Attendance DB │ │Todo DB      │ │Report DB   │
            │ (Port 5435)  │ │(Port 5436)  │ │(Port 5437) │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │Approval Svc  │ │Workplace Svc│ │Notification│
            │ (Port 3007)  │ │(Port 3008)  │ │(Port 3009) │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
            ┌───────▼──────┐ ┌───────▼──────┐ ┌─────▼──────┐
            │Approval DB   │ │Workplace DB  │ │Notification│
            │ (Port 5438)  │ │(Port 5439)   │ │DB(5440)    │
            └──────────────┘ └─────────────┘ └────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                            ┌───────▼──────┐
                            │    Redis     │
                            │ (Port 6379)  │
                            └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
            │ Prometheus   │ │   Grafana   │ │ Monitoring │
            │ (Port 9090)  │ │(Port 3002)  │ │   Stack    │
            └──────────────┘ └─────────────┘ └────────────┘
```

### Network Configuration

#### Docker Network Details
- **Network Name**: `digital_tracking_merchandising_microservices-network`
- **Network Type**: Bridge
- **Subnet**: 172.18.0.0/16
- **Gateway**: 172.18.0.1
- **Driver**: bridge
- **Scope**: local

#### Service Port Mapping

| Service | External Port | Internal Port | Protocol | Purpose |
|---------|---------------|---------------|----------|---------|
| Frontend | 3000 | 3000 | HTTP | React Web Application |
| API Gateway | 8080 | 3000 | HTTP | Microservices Router |
| Auth Service | 3010 | 3001 | HTTP | Authentication |
| User Service | 3002 | 3002 | HTTP | User Management |
| Chat Service | 3003 | 3003 | HTTP/WS | Real-time Chat |
| Attendance Service | 3004 | 3004 | HTTP | Attendance Tracking |
| Todo Service | 3005 | 3005 | HTTP | Task Management |
| Report Service | 3006 | 3006 | HTTP | Reporting |
| Approval Service | 3007 | 3007 | HTTP | Approval Workflows |
| Workplace Service | 3008 | 3008 | HTTP | Workplace Management |
| Notification Service | 3009 | 3009 | HTTP | Notifications |
| Load Balancer | 80 | 80 | HTTP | Nginx Reverse Proxy |
| Redis | 6379 | 6379 | TCP | Caching & Sessions |
| Prometheus | 9090 | 9090 | HTTP | Metrics Collection |
| Grafana | 3002 | 3000 | HTTP | Monitoring Dashboard |

#### Database Port Mapping

| Database | External Port | Internal Port | Purpose |
|----------|---------------|---------------|---------|
| Auth DB | 5432 | 5432 | Authentication Data |
| User DB | 5433 | 5432 | User Management Data |
| Chat DB | 5434 | 5432 | Chat Messages |
| Attendance DB | 5435 | 5432 | Attendance Records |
| Todo DB | 5436 | 5432 | Task Data |
| Report DB | 5437 | 5432 | Report Data |
| Approval DB | 5438 | 5432 | Approval Workflows |
| Workplace DB | 5439 | 5432 | Workplace Data |
| Notification DB | 5440 | 5432 | Notification Data |

---

## 🔧 Network Components

### 1. Load Balancer (Nginx)
- **Purpose**: Reverse proxy and load balancing
- **Configuration**: `nginx-microservices.conf`
- **Health Checks**: Automatic service health monitoring
- **SSL Termination**: Handles HTTPS termination
- **Rate Limiting**: Built-in rate limiting for API protection

### 2. API Gateway
- **Purpose**: Single entry point for all microservices
- **Routing**: Intelligent request routing based on service type
- **Authentication**: JWT token validation
- **Rate Limiting**: Per-service rate limiting
- **Monitoring**: Request/response logging and metrics

### 3. Microservices Network
- **Isolation**: Each service runs in its own container
- **Communication**: HTTP/REST APIs between services
- **Service Discovery**: Automatic service discovery via Docker DNS
- **Health Checks**: Built-in health check endpoints

### 4. Database Layer
- **Isolation**: Each service has its own database
- **Connection Pooling**: Optimized database connections
- **Backup Strategy**: Automated database backups
- **Monitoring**: Database performance metrics

### 5. Caching Layer (Redis)
- **Session Storage**: User session management
- **API Caching**: Response caching for improved performance
- **Real-time Features**: WebSocket support for chat
- **Queue Management**: Background job processing

---

## 🌐 Network Security

### Security Measures
1. **Network Segmentation**: Services isolated in Docker network
2. **Port Management**: Only necessary ports exposed
3. **Authentication**: JWT-based authentication
4. **Rate Limiting**: API rate limiting protection
5. **Input Validation**: All inputs validated and sanitized
6. **HTTPS**: SSL/TLS encryption for external access

### Access Control
- **Internal Services**: Only accessible within Docker network
- **External Services**: Only frontend, API gateway, and monitoring exposed
- **Database Access**: Restricted to service containers only
- **Admin Access**: Limited to specific IP ranges

---

## 📊 Network Performance

### Performance Metrics
- **Inter-service Latency**: < 1ms average
- **API Response Time**: < 100ms for most operations
- **Database Query Time**: < 50ms average
- **Redis Response Time**: < 5ms average
- **Network Throughput**: Optimized for concurrent users

### Scalability Features
- **Horizontal Scaling**: Services can be scaled independently
- **Load Balancing**: Automatic load distribution
- **Connection Pooling**: Optimized database connections
- **Caching Strategy**: Multi-layer caching for performance

---

## 🔍 Network Monitoring

### Monitoring Stack
1. **Prometheus**: Metrics collection and storage
2. **Grafana**: Visualization and alerting
3. **Health Checks**: Service health monitoring
4. **Logging**: Centralized logging system

### Key Metrics
- **Service Availability**: Uptime monitoring
- **Response Times**: API performance tracking
- **Error Rates**: Error tracking and alerting
- **Resource Usage**: CPU, memory, and network usage
- **Database Performance**: Query performance and connection stats

---

## 🚨 Network Troubleshooting

### Common Issues
1. **Port Conflicts**: Multiple services trying to use same port
2. **Service Discovery**: Services not finding each other
3. **Network Connectivity**: Inter-service communication issues
4. **Performance Degradation**: Slow response times
5. **Resource Exhaustion**: High CPU/memory usage

### Troubleshooting Tools
- `./scripts/check-ports.sh`: Port availability checker
- `./scripts/network-health-checker.sh`: Network health monitoring
- `./scripts/network-troubleshooter.sh`: Automated troubleshooting
- `./scripts/service-discovery-manager.sh`: Service discovery management
- `./scripts/load-balancer-manager.sh`: Load balancer management

---

## 📋 Network Operations

### Daily Operations
1. **Health Checks**: Monitor service health
2. **Performance Monitoring**: Track response times
3. **Log Analysis**: Review system logs
4. **Backup Verification**: Ensure backups are working

### Maintenance Procedures
1. **Service Updates**: Rolling updates for zero downtime
2. **Network Maintenance**: Scheduled network maintenance
3. **Security Updates**: Regular security patches
4. **Performance Optimization**: Continuous performance tuning

---

## 🔄 Network Recovery

### Disaster Recovery
1. **Service Restart**: Automatic service recovery
2. **Database Recovery**: Point-in-time recovery
3. **Network Recovery**: Network reconfiguration
4. **Data Backup**: Automated backup and restore

### Backup Strategy
- **Database Backups**: Daily automated backups
- **Configuration Backups**: Version-controlled configurations
- **Log Backups**: Centralized log storage
- **Monitoring Data**: Metrics and alerting data

---

## 📚 Additional Resources

### Documentation
- [Network Troubleshooting Guide](./NETWORK_TROUBLESHOOTING.md)
- [Service Discovery Documentation](./SERVICE_DISCOVERY.md)
- [Load Balancer Configuration](./LOAD_BALANCER_CONFIG.md)
- [Monitoring Setup Guide](./MONITORING_SETUP.md)

### Scripts
- `scripts/check-ports.sh`: Port availability checker
- `scripts/network-health-checker.sh`: Network health monitoring
- `scripts/network-troubleshooter.sh`: Automated troubleshooting
- `scripts/service-discovery-manager.sh`: Service discovery
- `scripts/load-balancer-manager.sh`: Load balancer management
- `scripts/port-killer.sh`: Port conflict resolution

### Configuration Files
- `docker-compose.microservices.yml`: Main Docker Compose configuration
- `nginx-microservices.conf`: Nginx load balancer configuration
- `monitoring/prometheus.yml`: Prometheus configuration
- `monitoring/grafana/`: Grafana dashboards and datasources

---

*Last Updated: July 19, 2025*
*Network Engineer: Senior Network Engineer (8+ Years Experience)* 

---

## 🛠️ Admin Tools

### pgAdmin
- **Purpose:** PostgreSQL database administration via web UI
- **Port Assignment:** 8088 (external) → 80 (internal)
- **Docker Compose Example:**
  ```yaml
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pgadmin
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@attendance.com
      - PGADMIN_DEFAULT_PASSWORD=password
      - PGADMIN_CONFIG_SERVER_MODE=False
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    ports:
      - "8088:80"
    depends_on:
      - attendance-db
      - user-db
      # ... other DBs as needed
    networks:
      - microservices-network
    restart: unless-stopped
  ```
- **Conflict Resolution:**
  - If port 8088 is in use, identify and stop the conflicting process/container (never change the port assignment).
  - Use `lsof -i :8088` and `docker rm -f <container>` as needed.
- **Network Placement:**
  - Must be on the same Docker network as all PostgreSQL databases for access.
- **Access:**
  - http://localhost:8088

--- 

## 🖥️ Grafana Monitoring Service

- **Purpose:**
  - Real-time monitoring and visualization of metrics, logs, and service health for all microservices.
  - Used for alerting, troubleshooting, and compliance with operational transparency requirements.
- **Port Assignment:**
  - **External Port:** 3002
  - **Internal Port:** 3000
  - **Protocol:** HTTP
- **Access URL:**
  - [http://localhost:3002](http://localhost:3002)
- **Default Credentials:**
  - **Username:** admin
  - **Password:** password
- **Password Reset Procedure:**
  - If you cannot log in with the default credentials, reset the admin password with:
    ```bash
    docker exec grafana grafana-cli admin reset-admin-password password
    ```
  - This will set the admin password to `password`.
- **Docker Compose Example:**
  ```yaml
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=password
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    ports:
      - "3002:3000"
    depends_on:
      - prometheus
    networks:
      - microservices-network
    restart: unless-stopped
  ```
- **Best Practices:**
  - Change the default password after first login for security.
  - Use persistent volumes to retain dashboards and settings.
  - Set up alerts for critical metrics and service failures. 