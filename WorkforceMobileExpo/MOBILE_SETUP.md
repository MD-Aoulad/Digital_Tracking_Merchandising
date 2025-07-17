# Mobile App Setup Guide

This guide will help you set up and run the Workforce Mobile app with proper backend connectivity.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo CLI** (`npm install -g @expo/cli`)
3. **Expo Go app** on your mobile device
4. **Backend server** running (see backend setup)

## Quick Setup

### 1. Install Dependencies

```bash
cd WorkforceMobileExpo
npm install
```

### 2. Configure API Connection

Run the setup script to automatically detect your IP address and configure the API:

```bash
npm run setup-api
```

This script will:
- Detect your local IP address
- Update the API configuration file
- Provide troubleshooting tips

### 3. Start the Backend Server

Make sure your backend server is running:

```bash
cd ../backend
npm start
```

The backend should be running on `http://localhost:5000`

### 4. Start the Mobile App

```bash
cd WorkforceMobileExpo
npm start
```

This will start the Expo development server and show a QR code.

### 5. Connect with Mobile Device

1. Install **Expo Go** app on your mobile device
2. Scan the QR code with the Expo Go app
3. The app will load on your device

## Manual Configuration

If the automatic setup doesn't work, you can manually configure the API:

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` in Terminal
   - Look for your WiFi adapter's IPv4 address

2. Edit `src/config/api.ts`:
   ```typescript
   export const API_CONFIG = {
     BASE_URL: 'http://YOUR_IP_ADDRESS:5000/api', // Replace with your IP
     // ... other config
   };
   ```

## Login Credentials

Use these demo credentials to test the app:

- **Email**: `richard@company.com`
- **Password**: `password`

## Troubleshooting

### Connection Issues

**Problem**: App can't connect to backend
**Solutions**:
1. Check that backend server is running on port 5000
2. Ensure phone and computer are on same WiFi network
3. Verify IP address in `src/config/api.ts`
4. Check firewall settings

**Problem**: "Network error" or timeout
**Solutions**:
1. Try using `localhost` instead of IP if testing on same device
2. Check backend CORS settings
3. Restart both backend and mobile app

### App Loading Issues

**Problem**: App won't load in Expo Go
**Solutions**:
1. Clear Expo Go cache
2. Restart Expo development server
3. Check for JavaScript errors in console

### Authentication Issues

**Problem**: Login fails with valid credentials
**Solutions**:
1. Check backend database has demo users
2. Verify backend authentication endpoints
3. Check console logs for detailed errors

## Development Tips

### Debugging

1. **Console Logs**: Check the terminal running `npm start` for logs
2. **Network Tab**: Use browser dev tools to check API requests
3. **Expo DevTools**: Use Expo DevTools for debugging

### Testing

1. **Quick Login**: Use the "Quick Login" buttons for testing
2. **Network Simulation**: Test offline scenarios
3. **Different Devices**: Test on both iOS and Android

### Performance

1. **Image Optimization**: Use appropriate image sizes
2. **API Caching**: Implement caching for better performance
3. **Bundle Size**: Monitor app bundle size

## File Structure

```
WorkforceMobileExpo/
├── src/
│   ├── config/
│   │   └── api.ts          # API configuration
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── services/
│   │   └── api.ts          # API service
│   └── screens/
│       └── LoginScreen.tsx # Login screen
├── scripts/
│   └── setup-mobile-api.js # Setup script
└── package.json
```

## Environment Variables

You can use environment variables for different configurations:

```bash
# Create .env file
EXPO_PUBLIC_API_URL=http://your-api-url.com/api
EXPO_PUBLIC_ENV=development
```

## Production Deployment

For production deployment:

1. Update API configuration to use production URL
2. Configure proper SSL certificates
3. Set up proper authentication
4. Test thoroughly on real devices

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure backend server is running
4. Check network connectivity
5. Review this troubleshooting guide

## Changelog

### v1.0.0
- Initial mobile app setup
- Real API integration
- Authentication system
- Setup automation script 