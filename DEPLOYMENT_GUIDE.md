# Deployment Guide - Free Tier Startup Edition

This guide covers **FREE** deployment options for the Workforce Management Platform, perfect for startups with limited funding.

## 🆓 Free Tier Deployment Options

### **Frontend (Free)**
- **Vercel**: 100GB bandwidth/month, automatic deployments
- **Netlify**: 100GB bandwidth/month, form submissions
- **GitHub Pages**: Unlimited bandwidth, static hosting

### **Backend (Free)**
- **Render**: 750 hours/month, automatic deployments
- **Railway**: $5 credit monthly (effectively free for small apps)
- **Heroku**: Free tier discontinued, but alternatives available
- **Glitch**: Free hosting with limitations

### **Database (Free)**
- **Supabase**: 500MB database, 50MB file storage
- **PlanetScale**: 1GB storage, 1 billion reads/month
- **Neon**: 3GB storage, serverless PostgreSQL
- **SQLite**: Local file-based database (no hosting costs)

### **Domain & SSL (Free)**
- **Freenom**: Free domains (.tk, .ml, .ga, .cf, .gq)
- **Let's Encrypt**: Free SSL certificates
- **Cloudflare**: Free DNS and SSL

## Table of Contents

1. [Quick Start - Free Setup](#quick-start---free-setup)
2. [GitHub Actions CI/CD - Free](#github-actions-cicd---free)
3. [Free Cloud Deployment](#free-cloud-deployment)
4. [Local Development](#local-development)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring - Free Tools](#monitoring---free-tools)
7. [SSL/HTTPS Setup - Free](#sslhttps-setup---free)
8. [Troubleshooting](#troubleshooting)

## Quick Start - Free Setup

### Prerequisites (All Free)

- Node.js 18+ and npm
- Git (free)
- GitHub account (free)
- Vercel account (free)
- Render account (free)

### 1. Initial Setup (5 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd Digital_Tracking_Merchandising

# Install dependencies
npm install
cd backend && npm install && cd ..
cd mobile && npm install && cd ..

# Test locally
npm start          # Frontend (port 3000)
cd backend && npm start && cd ..  # Backend (port 5000)
```

### 2. Free Cloud Deployment (10 minutes)

```bash
# Deploy frontend to Vercel (FREE)
npm run deploy:vercel

# Deploy backend to Render (FREE)
# Follow the Render setup below
```

## GitHub Actions CI/CD - Free

GitHub Actions provides **2000 minutes/month free** for public repositories and **500 minutes/month** for private repositories.

### Setup GitHub Secrets (Free)

1. **Go to your GitHub repository**
   - Settings → Secrets and variables → Actions

2. **Add these secrets** (all free services):

   ```bash
   # Vercel (Frontend) - FREE
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_vercel_org_id
   VERCEL_PROJECT_ID=your_vercel_project_id

   # Render (Backend) - FREE
   RENDER_SERVICE_ID=your_render_service_id
   RENDER_API_KEY=your_render_api_key

   # Expo (Mobile) - FREE
   EXPO_USERNAME=your_expo_username
   EXPO_PASSWORD=your_expo_password

   # Application URLs
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   STAGING_URL=https://your-staging-url.vercel.app
   ```

### How to Get Free Tokens

#### Vercel (Frontend) - FREE
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Create new project
4. Go to Settings → Tokens → Create Token
5. Copy token to GitHub secrets

#### Render (Backend) - FREE
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free)
3. Create new Web Service
4. Connect your repository
5. Get API key from Account → API Keys

## Free Cloud Deployment

### Frontend - Vercel (FREE)

**Cost**: $0/month
**Limits**: 100GB bandwidth, automatic deployments

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or use the script
npm run deploy:vercel
```

**Configuration**:
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### Backend - Render (FREE)

**Cost**: $0/month
**Limits**: 750 hours/month, automatic deployments

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository

2. **Configure Service**
   ```
   Name: workforce-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key
   DATABASE_URL=your-database-url
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

### Database - Supabase (FREE)

**Cost**: $0/month
**Limits**: 500MB database, 50MB file storage

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string

2. **Update Environment Variables**
   ```
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```

### Alternative Free Databases

#### PlanetScale (FREE)
- 1GB storage, 1 billion reads/month
- MySQL compatible

#### Neon (FREE)
- 3GB storage
- Serverless PostgreSQL

#### SQLite (FREE)
- Local file-based database
- No hosting costs
- Perfect for development

## Local Development

### Free Local Setup

```bash
# Quick development setup
./scripts/quick-deploy.sh

# Choose option 5: Development Setup
```

### Environment Files

Create `.env` (frontend):
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

Create `backend/.env`:
```bash
NODE_ENV=development
PORT=5000
JWT_SECRET=dev-secret-key-change-in-production
DATABASE_URL=sqlite:./database.sqlite
CORS_ORIGIN=http://localhost:3000
```

## Environment Configuration

### Production Environment Variables

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=$npm_package_version
```

#### Backend (Render Environment Variables)
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=your-supabase-connection-string
CORS_ORIGIN=https://your-frontend-url.vercel.app
SESSION_SECRET=your-session-secret
```

### Mobile App Environment Variables

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
EXPO_PUBLIC_ENVIRONMENT=production
```

## Monitoring - Free Tools

### Built-in Monitoring (FREE)

```bash
# Start monitoring stack
npm run monitoring:start

# Access Grafana
# URL: http://localhost:3001
# Username: admin
# Password: admin
```

### Free External Monitoring

#### UptimeRobot (FREE)
- 50 monitors
- 5-minute intervals
- Email notifications

#### StatusCake (FREE)
- 10 uptime monitors
- 5-minute intervals
- Basic notifications

#### Google Analytics (FREE)
- Website analytics
- User behavior tracking
- Performance monitoring

### Application Metrics

The backend exposes free metrics at `/api/metrics`:
- Request count and duration
- Error rates
- Database connection status
- Memory usage

## SSL/HTTPS Setup - Free

### Let's Encrypt (FREE)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (FREE)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare (FREE)

1. **Sign up at [cloudflare.com](https://cloudflare.com)**
2. **Add your domain**
3. **Update nameservers**
4. **Enable SSL/TLS encryption mode: Full**
5. **Enable HSTS**

### Free Domain Options

#### Freenom (FREE)
- Domains: .tk, .ml, .ga, .cf, .gq
- 12 months free
- Renewable

#### GitHub Pages (FREE)
- Custom domain support
- Automatic SSL
- Free hosting

## Cost Breakdown - Free Tier

### Monthly Costs: $0

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Frontend | Vercel Free | $0 | 100GB bandwidth |
| Backend | Render Free | $0 | 750 hours/month |
| Database | Supabase Free | $0 | 500MB storage |
| Domain | Freenom | $0 | .tk/.ml domains |
| SSL | Let's Encrypt | $0 | Unlimited |
| Monitoring | Built-in | $0 | Local only |
| CI/CD | GitHub Actions | $0 | 2000 min/month |

### When to Upgrade

**Frontend (Vercel Pro - $20/month)**
- When you exceed 100GB bandwidth
- Need team collaboration
- Want custom domains

**Backend (Render Paid - $7/month)**
- When you exceed 750 hours
- Need persistent disk
- Want custom domains

**Database (Supabase Pro - $25/month)**
- When you exceed 500MB
- Need more API calls
- Want advanced features

## Troubleshooting

### Common Free Tier Issues

1. **Render Sleep Mode**
   ```bash
   # First request after inactivity takes 30 seconds
   # This is normal for free tier
   # Consider upgrading to paid for production
   ```

2. **Vercel Bandwidth Limit**
   ```bash
   # Monitor usage in Vercel dashboard
   # Optimize images and assets
   # Consider CDN for static files
   ```

3. **Database Storage Limit**
   ```bash
   # Monitor Supabase usage
   # Clean up old data
   # Archive inactive records
   ```

### Performance Optimization (Free)

1. **Enable Gzip Compression**
   - Already configured in nginx.conf

2. **Static File Caching**
   - Already configured in nginx.conf

3. **Database Optimization**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_todos_user_id ON todos(user_id);
   ```

4. **Memory Optimization**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=2048"
   ```

### Backup and Recovery (Free)

1. **Database Backup**
   ```bash
   # Supabase provides automatic backups
   # Download from Supabase dashboard
   ```

2. **Application Backup**
   ```bash
   # GitHub provides code backup
   # Environment variables in GitHub secrets
   ```

3. **Manual Backup**
   ```bash
   # Backup configuration
   tar -czf backup-$(date +%Y%m%d).tar.gz .env backend/.env
   ```

## Security Best Practices (Free)

1. **Environment Variables**
   - Never commit secrets to version control
   - Use different secrets for each environment
   - Rotate secrets regularly

2. **HTTPS Only**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use HSTS headers

3. **Rate Limiting**
   - Already configured in nginx.conf
   - Monitor for abuse

4. **Input Validation**
   - Validate all user inputs
   - Use parameterized queries
   - Sanitize data

5. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

## Support

For deployment issues:

1. Check the troubleshooting section
2. Review logs for error messages
3. Verify environment configuration
4. Test with minimal configuration
5. Create an issue with detailed error information

### Free Support Resources

- **GitHub Issues**: Free issue tracking
- **Stack Overflow**: Free community support
- **Documentation**: Free online docs
- **Community Forums**: Free help from other developers

## Quick Commands Reference

```bash
# Quick deployment menu
./scripts/quick-deploy.sh

# Free deployments
npm run deploy:vercel      # Frontend to Vercel (FREE)
npm run deploy:render      # Backend to Render (FREE)
npm run deploy:mobile      # Mobile apps (FREE)

# Local development
npm start                  # Frontend dev server
cd backend && npm start    # Backend dev server

# Monitoring
npm run monitoring:start   # Local monitoring stack

# Database
npm run db:start          # Start PostgreSQL (FREE)

# Docker (optional)
npm run deploy:docker     # Local Docker deployment
```

## Migration Path

When your startup grows and you have funding:

1. **Frontend**: Vercel Pro ($20/month)
2. **Backend**: Render Paid ($7/month)
3. **Database**: Supabase Pro ($25/month)
4. **Monitoring**: DataDog or New Relic ($15-50/month)
5. **Domain**: Custom domain ($10-15/year)

**Total upgrade cost**: ~$67/month for production-ready infrastructure. 

---

## 1. **Backend and Database Health**

- **Backend Health:**  
  The `/api/health` endpoint returns:
  ```json
  {
    "status": "OK",
    "message": "Workforce Management API is running",
    "timestamp": "..."
  }
  ```
  ✅ **Backend is running and responsive.**

---

## 2. **Demo Login via Direct API Call**

- **Result:**  
  ```json
  {"error":"Invalid email or password"}
  ```
  ❌ **Login is still failing, even though the backend and database are up.**

---

## 3. **Authentication Code Consistency**

- **Backend Code:**  
  - The `/api/auth/login` endpoint **correctly queries the database** for the user by email.
  - It uses `bcryptjs` to compare the provided password with the stored hash.
  - The code is not using in-memory users for login; it is using the database.

---

## 4. **Root Cause Analysis**

- **You have already:**
  - Verified the database contains the correct users and bcryptjs-compatible hashes.
  - Confirmed the backend is using the correct database and code.
  - Confirmed the backend is running and accessible.

- **But:**  
  The login still fails with "Invalid email or password" even when using the correct credentials and hash.

---

## 5. **What Could Be Wrong?**

### **A. Database User Table Schema**
- The backend expects the columns: `email`, `password`, `name`, `role`, `department`, `status`, `created_at`.
- If the column names or types are different, the query or password check could fail.

### **B. Email Case Sensitivity**
- The backend queries with `email.toLowerCase()`.  
  If the email in the database is not all lowercase, the query may not find the user.

### **C. Extra Spaces or Hidden Characters**
- If the email or password in the database or request has extra spaces, the comparison will fail.

### **D. Multiple Users Table**
- If there are multiple `users` tables in different schemas or databases, the backend may be querying a different one than you checked.

---

## 6. **Expert Action Plan**

### **Step 1: Confirm Email Case**
Run this SQL and paste the output:
```sql
SELECT email, LENGTH(email), password FROM users WHERE LOWER(email) = 'admin@company.com';
```
- This will show if the email is stored in lowercase and if there are any hidden characters.

### **Step 2: Confirm Only One Users Table**
Run:
```sql
\\dt *users*
```
- This will list all tables named `users` in all schemas.

### **Step 3: Add Debug Logging to Backend**
Add a `console.log` in your `/api/auth/login` endpoint to print:
- The email and password received
- The user row fetched from the database
- The result of the bcrypt comparison

This will show exactly where the failure is.

### **Step 4: Try Registering a New User**
Use the `/api/auth/register` endpoint to create a new user with email `test@company.com` and password `password`, then try logging in with that user.  
If this works, the issue is with the existing demo users' data.

---

## 7. **Summary Table**

| Check                        | Status      | Next Action                                  |
|------------------------------|-------------|-----------------------------------------------|
| Backend health               | ✅ OK       | -                                             |
| Database users present       | ✅ Yes      | -                                             |
| bcryptjs hash correct        | ✅ Yes      | -                                             |
| Login via API                | ❌ Fails    | Check email case, schema, debug logging       |
| Code uses DB, not memory     | ✅ Yes      | -                                             |

---

## **What I Recommend Next**

1. **Run the SQL checks above and share the output.**
2. **Add debug logging to the backend login endpoint.**
3. **Try registering and logging in with a new user.**

Would you like me to guide you through these steps, or do you want to try them and report back?  
If you want, I can provide the exact code to add debug logging to your backend for immediate insight. 