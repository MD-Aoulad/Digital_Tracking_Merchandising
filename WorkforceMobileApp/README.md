# Workforce Mobile App

A React Native mobile application for workforce management with punch-in/out functionality, attendance tracking, and user management.

## Features

### 🔐 Authentication
- **Login System**: Secure authentication with email/password
- **User Accounts**: 
  - **Richard** (richard@company.com / password) - Sales Representative
  - **Admin** (admin@company.com / password) - System Administrator
  - **Manager** (manager@company.com / password) - Operations Manager

### ⏰ Punch-In/Out System
- **Real-time Clock**: Live time display with seconds
- **GPS Location**: Automatic location capture for punch records
- **Photo Verification**: Automatic photo capture (mock implementation)
- **Status Tracking**: Shows current clock-in/out status
- **Today's Records**: View all punch records for the current day

### 📊 Dashboard
- **Weekly Overview**: Hours worked, overtime, attendance rate
- **Quick Actions**: Clock in/out, view schedule, request time off
- **Recent Activity**: Latest punch-in/out activities
- **Statistics**: Total hours, attendance rate, overtime tracking

### 📅 Attendance History
- **Monthly Records**: Complete attendance history
- **Status Tracking**: Present, late, absent, half-day status
- **Time Details**: Clock in/out times, total hours per day
- **Location History**: GPS coordinates for each punch

### 👤 User Profile
- **Personal Information**: Name, email, phone, position, department
- **Account Settings**: Security, notifications, language, appearance
- **Support**: Help center, contact support, terms of service
- **App Information**: Version, last updated

## Mobile App Screenshots

### Login Screen
```
┌─────────────────────────────────────┐
│           🏢 Workforce Mobile       │
│         Sign in to your account     │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 📧 Email                        │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ 🔒 Password                     │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │         Sign In                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Quick Login (Demo):                │
│  ┌─────────────────────────────────┐ │
│  │ Login as Richard               │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ Login as Admin                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Demo Credentials:                  │
│  Email: richard@company.com         │
│  Password: password                 │
└─────────────────────────────────────┘
```

### Punch-In Screen
```
┌─────────────────────────────────────┐
│ Welcome, Richard!                   │
│ Friday, January 15, 2024            │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │           14:32:45              │ │
│  │                                 │ │
│  │      Status: Clocked Out        │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ 🔓 Clock In                     │ │
│  └─────────────────────────────────┘ │
│                                     │
│  📍 Location: San Francisco, CA     │
│  📷 Photo Verification: Enabled     │
│                                     │
│  Today's Records:                   │
│  ┌─────────────────────────────────┐ │
│  │ 🔓 Clock In - 09:00 AM          │ │
│  │ 📍 San Francisco, CA            │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Dashboard Screen
```
┌─────────────────────────────────────┐
│ Good morning, Richard!              │
│ Friday, January 15, 2024            │
│                                     │
│ This Week's Overview:               │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ ⏰ 42.5h     │ │ ⏱️ 8.5h     │     │
│ │ This Week   │ │ Overtime    │     │
│ └─────────────┘ └─────────────┘     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ 📈 95.2%    │ │ 💼 156.5h   │     │
│ │ Attendance  │ │ Total Hours │     │
│ └─────────────┘ └─────────────┘     │
│                                     │
│ Quick Actions:                      │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ ⏰ Clock     │ │ 📅 Schedule │     │
│ │ In/Out      │ │             │     │
│ └─────────────┘ └─────────────┘     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ 🚫 Time Off │ │ ⚠️ Report   │     │
│ │             │ │ Issue       │     │
│ └─────────────┘ └─────────────┘     │
└─────────────────────────────────────┘
```

### Attendance Screen
```
┌─────────────────────────────────────┐
│ Attendance History                  │
│ January 2024                        │
│                                     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ 📈 95%      │ │ ⏰ 42.5h    │     │
│ │ Attendance  │ │ Total Hours │     │
│ └─────────────┘ └─────────────┘     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ ✅ 4        │ │ ⚠️ 1        │     │
│ │ Present     │ │ Late        │     │
│ └─────────────┘ └─────────────┘     │
│                                     │
│ Daily Records:                      │
│ ┌─────────────────────────────────┐ │
│ │ Mon, Jan 15  ✅ Present         │ │
│ │ 🔓 09:00  🔓 17:30  ⏰ 8.5h     │ │
│ │ 📍 San Francisco, CA            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Sun, Jan 14  ⚠️ Late           │ │
│ │ 🔓 09:15  🔓 17:45  ⏰ 8.5h     │ │
│ │ 📍 San Francisco, CA            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## How to Run the App

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)
- Java Development Kit (JDK 17)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   npx react-native run-ios
   ```

3. **Android Setup**
   ```bash
   npx react-native run-android
   ```

### Alternative: Use Expo (Easier Setup)

If you want to test the app quickly without setting up the full development environment:

1. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

2. **Create Expo Project**
   ```bash
   npx create-expo-app WorkforceMobileExpo --template blank-typescript
   cd WorkforceMobileExpo
   ```

3. **Install Dependencies**
   ```bash
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-vector-icons @react-native-async-storage/async-storage
   ```

4. **Run with Expo**
   ```bash
   npx expo start
   ```

## Richard's Punch-In Workflow

1. **Login**: Use `richard@company.com` / `password`
2. **Navigate to Punch-In Tab**: Tap the "Punch In" tab at the bottom
3. **Check Status**: See current clock-in/out status and real-time clock
4. **Punch In/Out**: Tap the large button to record punch
5. **Verification**: App automatically captures location and photo
6. **Confirmation**: Success message shows punch recorded
7. **View Records**: See today's punch history below

## Features for Richard

### ✅ Available Now
- **Authentication**: Secure login with Richard's credentials
- **Punch In/Out**: Record clock in/out with timestamp
- **Location Tracking**: GPS coordinates captured automatically
- **Photo Verification**: Mock photo capture (ready for real camera)
- **Real-time Clock**: Live time display
- **Today's Records**: View all punch records for current day
- **Dashboard**: Overview of hours, attendance, and quick actions
- **Attendance History**: Complete punch history with status tracking
- **Profile Management**: Personal information and settings

### 🔄 Ready for Production
- **Real Camera Integration**: Replace mock photo with actual camera
- **Real GPS**: Replace mock location with actual GPS coordinates
- **API Integration**: Connect to backend server for data persistence
- **Push Notifications**: Reminders for punch times
- **Offline Support**: Work without internet connection
- **Biometric Authentication**: Fingerprint/Face ID login

## Technical Architecture

### Frontend
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Tab and stack navigation
- **Context API**: State management for authentication
- **AsyncStorage**: Local data persistence

### Key Components
- `AuthContext`: User authentication and session management
- `LoginScreen`: User login with demo credentials
- `PunchInScreen`: Main punch-in/out functionality
- `DashboardScreen`: Overview and statistics
- `AttendanceScreen`: Historical punch records
- `ProfileScreen`: User profile and settings

### Data Flow
1. **Login** → Authenticate user → Store session
2. **Punch In/Out** → Capture data → Store locally → Show confirmation
3. **Dashboard** → Calculate stats → Display overview
4. **Attendance** → Load history → Display records

## Development Notes

### Mock Data
- User accounts are hardcoded for demo purposes
- Location data is mocked (San Francisco coordinates)
- Photo capture is simulated
- Attendance records are pre-populated

### Production Considerations
- Implement real API endpoints for data persistence
- Add proper error handling and loading states
- Implement real GPS and camera functionality
- Add proper security measures (JWT tokens, encryption)
- Set up push notifications for punch reminders
- Add offline synchronization capabilities

## Troubleshooting

### Common Issues
1. **Java not found**: Install JDK 17 with `brew install openjdk@17`
2. **iOS build fails**: Run `cd ios && pod install && cd ..`
3. **Android build fails**: Ensure Android SDK is properly configured
4. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`

### Getting Help
- Check React Native documentation: https://reactnative.dev/
- Review Expo documentation: https://docs.expo.dev/
- Check troubleshooting guides in React Native CLI

## Next Steps

1. **Test the App**: Run the app and test Richard's punch-in functionality
2. **Customize**: Modify colors, branding, and features as needed
3. **Connect to Backend**: Integrate with your existing web app API
4. **Deploy**: Build for production and distribute to users
5. **Monitor**: Add analytics and monitoring for usage tracking

---

**Note**: This is a demo application with mock data. For production use, replace mock implementations with real API calls, GPS services, and camera functionality.
