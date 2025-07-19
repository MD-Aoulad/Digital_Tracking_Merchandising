# 🚀 Quick Start - Free Local DevOps (5 Minutes)

## 🎯 **Get Your Enterprise DevOps Running for $0/month**

This guide will get your complete DevOps environment running locally on your Mac in under 5 minutes.

## ✅ **Prerequisites (Already Installed)**

- ✅ macOS (you're on darwin 24.5.0)
- ✅ Git (you have the repo)
- ✅ Docker Desktop (if not, we'll install it)

## 🚀 **Step 1: One-Command Setup**

```bash
# Make sure you're in the project directory
cd Digital_Tracking_Merchandising

# Run the automated setup (this will install everything you need)
./devops/scripts/local-setup.sh start
```

**What this does:**
- ✅ Installs Docker Desktop, Minikube, kubectl, Helm, Terraform
- ✅ Sets up local Kubernetes cluster
- ✅ Creates SSL certificates
- ✅ Builds and starts all services
- ✅ Configures monitoring dashboards
- ✅ Sets up automated backups

## 🌐 **Step 2: Access Your Application**

After the setup completes, you'll see URLs like this:

```
🌐 Application URLs:
  Frontend:        http://localhost:3000
  Mobile App:      http://localhost:3002
  API Gateway:     http://localhost:8080
  Nginx Proxy:     http://localhost

🔧 Development Tools:
  Database Admin:  http://localhost:8081 (Adminer)
  Redis GUI:       http://localhost:8082 (Redis Commander)
  Minikube:        minikube dashboard

📊 Monitoring:
  Grafana:         http://localhost:3001 (admin/admin)
  Prometheus:      http://localhost:9090
  AlertManager:    http://localhost:9093
  Loki:            http://localhost:3100
```

## 🔧 **Step 3: Daily Development Commands**

```bash
# Start everything
./devops/scripts/local-setup.sh start

# Stop everything
./devops/scripts/local-setup.sh stop

# Restart everything
./devops/scripts/local-setup.sh restart

# View logs
./devops/scripts/local-setup.sh logs

# Check health
./devops/scripts/local-setup.sh health

# Create backup
./devops/scripts/local-setup.sh backup

# View status
./devops/scripts/local-setup.sh status
```

## 🐛 **Step 4: Fix the Auth Service Issue**

I noticed from your logs that the auth service is timing out (408 errors). Let's fix this:

```bash
# Check the auth service specifically
./devops/scripts/local-setup.sh logs auth-service-local

# Restart just the auth service
docker-compose -f docker-compose.local.yml restart auth-service-local

# Check if it's working
curl http://localhost:3010/health
```

## 📊 **Step 5: Monitor Your Application**

Open these URLs in your browser:

1. **Main App**: http://localhost:3000
2. **Grafana Dashboard**: http://localhost:3001 (admin/admin)
3. **Database Admin**: http://localhost:8081
4. **Redis GUI**: http://localhost:8082

## 🔄 **Step 6: CI/CD Pipeline (Free)**

Your GitHub Actions pipeline will automatically:

- ✅ Run tests on every push
- ✅ Security scan your code
- ✅ Build Docker images
- ✅ Push to GitHub Container Registry (FREE)
- ✅ Generate deployment instructions

**To trigger a build:**
```bash
# Push your changes
git add .
git commit -m "Update local setup"
git push origin main
```

## 💾 **Step 7: Backup Strategy (Free)**

```bash
# Manual backup
./devops/scripts/local-setup.sh backup

# Automated backup (add to crontab)
0 2 * * * /path/to/project/devops/scripts/local-setup.sh backup
```

## 🎯 **What You Get (100% Free)**

### ✅ **Infrastructure**
- **Local Kubernetes** cluster (Minikube)
- **PostgreSQL** database
- **Redis** cache
- **Nginx** load balancer
- **SSL certificates**

### ✅ **Monitoring**
- **Grafana** dashboards
- **Prometheus** metrics
- **Loki** log aggregation
- **AlertManager** alerts

### ✅ **CI/CD**
- **GitHub Actions** (2000 free minutes/month)
- **GitHub Container Registry** (free storage)
- **Security scanning** (Snyk, Trivy)
- **Performance testing**

### ✅ **Development Tools**
- **Database admin** (Adminer)
- **Redis GUI** (Redis Commander)
- **Kubernetes dashboard**
- **Health checks**

## 🚨 **Troubleshooting**

### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

### Docker Issues
```bash
# Reset Docker
docker system prune -a
docker volume prune
```

### Service Not Starting
```bash
# Check logs
./devops/scripts/local-setup.sh logs

# Restart specific service
docker-compose -f docker-compose.local.yml restart service-name
```

## 🎉 **You're All Set!**

You now have a **complete enterprise DevOps environment** running locally for **$0/month**:

- ✅ **No cloud costs**
- ✅ **No monthly fees**
- ✅ **No vendor lock-in**
- ✅ **Complete control**
- ✅ **Offline development**

**Next steps:**
1. Access your app at http://localhost:3000
2. Explore the monitoring dashboards
3. Start developing your features
4. Use the CI/CD pipeline for automated testing

**Remember:** Everything runs on your Mac, so you can develop offline and have complete control over your infrastructure! 