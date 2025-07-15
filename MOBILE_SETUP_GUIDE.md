# Mobile App Setup Guide

This guide explains the different mobile app versions and helps you choose the right one for your needs.

## 📱 Available Mobile Apps

### 1. **Expo App (Recommended for Development)**
**Location**: `/mobile/`
**Type**: Expo managed workflow
**Best for**: Quick development, testing, and prototyping

**Advantages:**
- ✅ Easy setup and development
- ✅ No native build tools required
- ✅ Fast iteration cycle
- ✅ Cross-platform compatibility
- ✅ Built-in development tools

**Setup:**
```bash
cd mobile
npm install
npx expo start
```

### 2. **React Native App (Production Ready)**
**Location**: `/WorkforceMobileApp/`
**Type**: Bare React Native
**Best for**: Production deployment, custom native modules

**Advantages:**
- ✅ Full native performance
- ✅ Custom native modules
- ✅ Production optimizations
- ✅ App store deployment ready
- ✅ Complete control over build process

**Setup:**
```bash
cd WorkforceMobileApp
npm install
npx react-native run-ios     # iOS
npx react-native run-android # Android
```

### 3. **Expo Web App (Alternative)**
**Location**: `/WorkforceMobileExpo/`
**Type**: Expo with web support
**Best for**: Web deployment, cross-platform testing

**Advantages:**
- ✅ Web, iOS, and Android from one codebase
- ✅ Easy deployment to web
- ✅ Shared codebase with mobile

**Setup:**
```bash
cd WorkforceMobileExpo
npm install
npx expo start --web
```

## 🎯 **Which One Should You Use?**

### **For Development & Testing**
Use the **Expo app** (`/mobile/`):
- Fastest to get started
- No complex setup required
- Perfect for feature development
- Easy to test on physical devices

### **For Production**
Use the **React Native app** (`/WorkforceMobileApp/`):
- Better performance
- Native optimizations
- App store ready
- Custom native features

### **For Web + Mobile**
Use the **Expo Web app** (`/WorkforceMobileExpo/`):
- Single codebase for web and mobile
- Easy web deployment
- Shared components and logic

## 🚀 Quick Start (Recommended)

### Step 1: Choose Your App
```bash
# For development (recommended)
cd mobile

# For production
cd WorkforceMobileApp

# For web + mobile
cd WorkforceMobileExpo
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development
```bash
# Expo apps
npx expo start

# React Native app
npx react-native start
```

### Step 4: Run on Device
```bash
# Expo: Scan QR code with Expo Go app
# React Native: Use iOS Simulator or Android Emulator
```

## 🔧 Configuration

### API Configuration
All mobile apps connect to the same backend API. Update the API URL in:

**Expo App** (`/mobile/src/services/api/config.ts`):
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.178.150:5000/api', // Your network IP
};
```

**React Native App** (`/WorkforceMobileApp/src/services/api/config.ts`):
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.178.150:5000/api', // Your network IP
};
```

### Environment Variables
Create `.env` files in each mobile app directory:
```bash
# .env
API_URL=http://192.168.178.150:5000/api
ENVIRONMENT=development
```

## 📱 Features Comparison

| Feature | Expo App | React Native App | Expo Web App |
|---------|----------|------------------|--------------|
| **Setup Complexity** | Easy | Medium | Easy |
| **Development Speed** | Fast | Medium | Fast |
| **Performance** | Good | Excellent | Good |
| **Native Modules** | Limited | Full | Limited |
| **App Store Ready** | Yes | Yes | Web Only |
| **Custom Build** | No | Yes | No |
| **Web Support** | No | No | Yes |

## 🧪 Testing

### Expo App Testing
```bash
cd mobile
npm test
```

### React Native App Testing
```bash
cd WorkforceMobileApp
npm test
```

### E2E Testing
```bash
# Run Cypress tests for mobile workflows
npx cypress run --spec "cypress/e2e/mobile.cy.ts"
```

## 🚨 Troubleshooting

### Common Issues

**1. Metro Bundler Issues**
```bash
# Clear cache
npx react-native start --reset-cache
# or
npx expo start --clear
```

**2. Network Connection Issues**
- Ensure backend is running on `http://192.168.178.150:5000`
- Check firewall settings
- Use same network for mobile device and development machine

**3. Build Issues**
```bash
# Clean and rebuild
cd WorkforceMobileApp
npx react-native clean
npm install
npx react-native run-ios
```

**4. Expo Issues**
```bash
# Clear Expo cache
npx expo start --clear
# or
expo r -c
```

## 📚 Next Steps

1. **Choose your preferred mobile app** based on your needs
2. **Follow the setup instructions** for that specific app
3. **Configure the API endpoint** to match your backend
4. **Test the authentication flow** with demo credentials
5. **Develop your features** using the chosen platform

## 🆘 Need Help?

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/docs/getting-started
- **Project Issues**: Check the main README.md for troubleshooting
- **API Issues**: Visit http://localhost:5000/api/docs

---

**Recommendation**: Start with the Expo app (`/mobile/`) for development, then migrate to React Native app (`/WorkforceMobileApp/`) for production. 