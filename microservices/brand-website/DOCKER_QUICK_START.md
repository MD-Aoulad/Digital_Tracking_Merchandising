# 🐳 Brand Website Docker Quick Start

## 🚀 **Tomorrow's Deployment Guide**

### **Prerequisites**
1. **Docker Desktop** must be running
2. **Navigate** to the brand website directory
3. **Choose** your preferred method below

---

## 📋 **Method 1: Simple Scripts (Recommended)**

### **For Windows Users:**
```cmd
# Navigate to the directory
cd microservices/brand-website

# Start the website
docker-start.bat

# Stop the website
docker stop brand-website
```

### **For Linux/Mac Users:**
```bash
# Navigate to the directory
cd microservices/brand-website

# Make scripts executable
chmod +x docker-start.sh docker-stop.sh docker-manager.sh

# Start the website
./docker-start.sh

# Or use the manager
./docker-manager.sh start
```

---

## 🎯 **Method 2: Manual Docker Commands**

### **Start the Website:**
```bash
# Navigate to directory
cd microservices/brand-website

# Build the image
docker build -t brand-website:latest .

# Run the container
docker run -d --name brand-website -p 3013:3013 --restart unless-stopped brand-website:latest
```

### **Stop the Website:**
```bash
# Stop container
docker stop brand-website

# Remove container
docker rm brand-website
```

---

## 📊 **Management Commands**

### **Check Status:**
```bash
# View running containers
docker ps

# View all containers
docker ps -a

# View logs
docker logs brand-website

# Follow logs in real-time
docker logs -f brand-website
```

### **Restart Website:**
```bash
# Restart container
docker restart brand-website

# Or rebuild and restart
docker stop brand-website
docker rm brand-website
docker build -t brand-website:latest .
docker run -d --name brand-website -p 3013:3013 brand-website:latest
```

---

## 🌐 **Access Your Website**

Once started, your website will be available at:
- **URL**: http://localhost:3013
- **Port**: 3013
- **Container Name**: brand-website

---

## 🔧 **Troubleshooting**

### **If Docker isn't running:**
1. Start Docker Desktop
2. Wait for it to fully load
3. Try the commands again

### **If port 3013 is in use:**
```bash
# Check what's using the port
netstat -ano | findstr :3013

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### **If container fails to start:**
```bash
# Check container logs
docker logs brand-website

# Remove and rebuild
docker stop brand-website
docker rm brand-website
docker build -t brand-website:latest .
docker run -d --name brand-website -p 3013:3013 brand-website:latest
```

---

## 📈 **Performance Monitoring**

### **Check Resource Usage:**
```bash
# View container stats
docker stats brand-website

# View detailed container info
docker inspect brand-website
```

### **Monitor Logs:**
```bash
# Follow logs in real-time
docker logs -f brand-website

# View last 50 lines
docker logs --tail 50 brand-website
```

---

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
- ✅ Container running: `docker ps` shows brand-website
- ✅ Website accessible: http://localhost:3013 loads
- ✅ Professional black theme displayed
- ✅ Enterprise messaging visible
- ✅ All sections working properly

---

## 📞 **Quick Reference**

| Action | Command |
|--------|---------|
| Start Website | `./docker-start.sh` or `docker-start.bat` |
| Stop Website | `docker stop brand-website` |
| Restart Website | `docker restart brand-website` |
| View Logs | `docker logs brand-website` |
| Check Status | `docker ps` |
| Access Website | http://localhost:3013 |

---

**🎯 Ready for tomorrow's deployment! Your enterprise-grade brand website is fully containerized and ready to run!** 