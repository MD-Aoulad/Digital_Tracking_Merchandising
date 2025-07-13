# GitHub Secrets Setup Guide - Free CI/CD

This guide will help you set up **FREE** CI/CD for your Workforce Management Platform using GitHub Actions.

## 🆓 Free Services Used

- **GitHub Actions**: 2000 minutes/month free (public repos)
- **Vercel**: 100GB bandwidth/month free (frontend)
- **Render**: 750 hours/month free (backend)
- **Expo**: Free mobile app builds
- **Total Cost**: $0/month

## 📋 Prerequisites

1. GitHub account (free)
2. Vercel account (free)
3. Render account (free)
4. Expo account (free)

## 🔑 Step-by-Step Setup

### 1. Vercel Setup (Frontend - FREE)

#### Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Verify your email

#### Create Project
1. Click "New Project"
2. Import your GitHub repository
3. Configure settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
4. Deploy

#### Get Vercel Tokens
1. Go to Vercel Dashboard
2. Settings → Tokens
3. Create new token
4. Copy the token

### 2. Render Setup (Backend - FREE)

#### Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free)
3. Verify your email

#### Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure settings:
   - Name: `workforce-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**
4. Create service

#### Get Render API Key
1. Go to Render Dashboard
2. Account → API Keys
3. Create new API key
4. Copy the key

#### Get Service ID
1. Go to your web service
2. Copy the service ID from the URL
3. Example: `https://dashboard.render.com/web/srv-abc123` → `srv-abc123`

### 3. Expo Setup (Mobile - FREE)

#### Create Expo Account
1. Go to [expo.dev](https://expo.dev)
2. Sign up (free)
3. Verify your email

#### Get Expo Credentials
1. Go to Expo Dashboard
2. Account → Access Tokens
3. Create new token
4. Copy username and token

### 4. GitHub Secrets Configuration

#### Access GitHub Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

#### Add Required Secrets

Add these secrets one by one:

**Vercel Secrets (Frontend - FREE):**
```
Name: VERCEL_TOKEN
Value: [your_vercel_token_from_step_1]

Name: VERCEL_ORG_ID
Value: [your_vercel_org_id]

Name: VERCEL_PROJECT_ID
Value: [your_vercel_project_id]
```

**Render Secrets (Backend - FREE):**
```
Name: RENDER_SERVICE_ID
Value: [your_render_service_id_from_step_2]

Name: RENDER_API_KEY
Value: [your_render_api_key_from_step_2]
```

**Expo Secrets (Mobile - FREE):**
```
Name: EXPO_USERNAME
Value: [your_expo_username]

Name: EXPO_PASSWORD
Value: [your_expo_token]
```

**Application URLs:**
```
Name: REACT_APP_API_URL
Value: https://[your-render-service].onrender.com/api

Name: STAGING_URL
Value: https://[your-vercel-project].vercel.app
```

## 🔍 How to Find Values

### Vercel Values

**VERCEL_TOKEN:**
1. Vercel Dashboard → Settings → Tokens
2. Create new token
3. Copy the token

**VERCEL_ORG_ID:**
1. Vercel Dashboard → Settings → General
2. Copy "Team ID" (looks like: `team_abc123`)

**VERCEL_PROJECT_ID:**
1. Go to your project in Vercel
2. Settings → General
3. Copy "Project ID" (looks like: `prj_abc123`)

### Render Values

**RENDER_SERVICE_ID:**
1. Go to your web service
2. URL will be: `https://dashboard.render.com/web/srv-abc123`
3. Copy `srv-abc123` part

**RENDER_API_KEY:**
1. Render Dashboard → Account → API Keys
2. Create new key
3. Copy the key

### Expo Values

**EXPO_USERNAME:**
1. Your Expo account username

**EXPO_PASSWORD:**
1. Expo Dashboard → Account → Access Tokens
2. Create new token
3. Use this token as password

## 🚀 Test Your Setup

### 1. Push to Develop Branch
```bash
git checkout -b develop
git add .
git commit -m "Setup CI/CD"
git push origin develop
```

### 2. Check GitHub Actions
1. Go to your repository
2. Actions tab
3. You should see the workflow running

### 3. Check Deployments
- **Frontend**: Check Vercel dashboard
- **Backend**: Check Render dashboard
- **Mobile**: Check Expo dashboard

## 🆘 Troubleshooting

### Common Issues

**1. Vercel Token Invalid**
- Regenerate token in Vercel
- Update GitHub secret
- Check token permissions

**2. Render Service Not Found**
- Verify service ID is correct
- Check if service exists in Render
- Ensure API key has correct permissions

**3. Expo Build Fails**
- Check Expo credentials
- Verify project configuration
- Check Expo CLI version

**4. GitHub Actions Fail**
- Check all secrets are set
- Verify secret names match exactly
- Check workflow file syntax

### Debug Steps

1. **Check Secret Names**
   - Names are case-sensitive
   - No spaces in names
   - Use underscores for spaces

2. **Verify Values**
   - Tokens should be long strings
   - IDs should match dashboard values
   - URLs should be complete

3. **Check Permissions**
   - Vercel token needs project access
   - Render API key needs service access
   - Expo token needs build permissions

## 💡 Pro Tips

### Security
- Never commit secrets to code
- Use different tokens for different environments
- Rotate tokens regularly

### Cost Optimization
- Monitor GitHub Actions usage
- Check Vercel bandwidth usage
- Monitor Render hours usage

### Best Practices
- Test on develop branch first
- Use staging environment
- Monitor deployment logs

## 📞 Support

### Free Resources
- **GitHub Issues**: Report problems in your repo
- **Stack Overflow**: Search for solutions
- **Documentation**: Check service docs
- **Community**: Discord/Slack groups

### Paid Support (When You Scale)
- **Vercel Pro**: $20/month
- **Render Paid**: $7/month
- **GitHub Pro**: $4/month

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ Automatic testing on every push
- ✅ Automatic deployment to staging (develop branch)
- ✅ Automatic deployment to production (main branch)
- ✅ Mobile app builds
- ✅ Security scanning
- ✅ Performance testing
- ✅ **All for FREE!**

Your startup now has enterprise-grade CI/CD without any costs! 🚀 