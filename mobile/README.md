# Workforce Management Platform - Mobile App

## 📱 Overview
Professional mobile application for the Workforce Management Platform, built with React Native and Expo. This app enables field employees to punch in at planned stores, complete assigned tasks, and submit reports with full synchronization to the web platform.

## 🚀 Features

### Core Functionality
- **🔐 Authentication**: Secure login with role-based access control
- **📍 Store Punch-In**: GPS-verified punch-in at planned store locations
- **📋 Task Management**: View and complete tasks assigned via web platform
- **📊 Reporting**: Submit detailed reports with photos and notes
- **🔄 Real-time Sync**: All actions sync with the main platform backend
- **👥 Role-based Access**: Permissions match web platform user roles

### Technical Features
- **📱 Cross-platform**: iOS and Android support
- **🌐 Offline Support**: Basic offline functionality with sync when online
- **📸 Camera Integration**: Photo capture for reports and verification
- **📍 GPS Tracking**: Location services for punch-in verification
- **🔔 Push Notifications**: Real-time updates and reminders

## 🛠 Tech Stack

### Core Technologies
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type safety and better development experience
- **React Navigation** - Navigation and routing

### Key Libraries
- **@react-navigation/native** - Navigation framework
- **axios** - HTTP client for API calls
- **@react-native-async-storage/async-storage** - Local data storage
- **expo-location** - GPS and location services
- **expo-camera** - Camera functionality
- **expo-image-picker** - Image selection and capture
- **react-native-gesture-handler** - Touch handling
- **react-native-reanimated** - Smooth animations

## 📁 Project Structure

```
/mobile
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Shared components
│   │   ├── forms/          # Form components
│   │   └── navigation/     # Navigation components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── dashboard/     # Main dashboard
│   │   ├── stores/        # Store management
│   │   ├── tasks/         # Task management
│   │   └── reports/       # Reporting screens
│   ├── services/          # API and business logic
│   │   ├── api/          # API client and endpoints
│   │   ├── auth/         # Authentication service
│   │   ├── location/     # Location services
│   │   └── storage/      # Local storage service
│   ├── navigation/        # Navigation configuration
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── constants/        # App constants
├── assets/               # Images, fonts, etc.
├── App.tsx              # Main app component
└── package.json         # Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start
```

### Running on Devices
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (for testing)
npm run web
```

## 🔧 Development

### Environment Setup
1. **API Configuration**: Update `src/services/api/config.ts` with your backend URL
2. **Environment Variables**: Create `.env` file for sensitive data
3. **Permissions**: Configure required permissions in `app.json`

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions
- Follow the existing component structure

## 🔗 Integration with Web Platform

### Shared Features
- **Authentication**: Same login system and user roles
- **API Endpoints**: Uses the same backend API
- **Data Models**: Consistent data structures
- **Business Logic**: Shared validation and processing rules

### Synchronization
- Real-time data sync with web platform
- Offline capability with conflict resolution
- Automatic retry mechanisms for failed requests
- Data integrity checks

## 📱 App Screens

### Authentication
- Login screen with email/password
- Biometric authentication (optional)
- Password reset functionality

### Dashboard
- Overview of assigned stores and tasks
- Quick punch-in buttons
- Recent activity feed
- Navigation to main features

### Store Management
- List of planned store visits
- Store details and requirements
- GPS-based punch-in functionality
- Visit history and status

### Task Management
- Assigned tasks list
- Task details and instructions
- Task completion workflow
- Photo and note attachments

### Reporting
- Report creation interface
- Photo capture and upload
- Form-based data entry
- Report submission and status

## 🔒 Security

### Data Protection
- Encrypted local storage
- Secure API communication (HTTPS)
- Token-based authentication
- Automatic session management

## 🚀 Deployment

### Build Process
```bash
# Build for production
npx expo build:android
npx expo build:ios

# Or use EAS Build
npx eas build --platform android
npx eas build --platform ios
```

## 📚 Documentation

### Additional Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Web Platform Documentation](../README.md)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained by**: Workforce Management Team
