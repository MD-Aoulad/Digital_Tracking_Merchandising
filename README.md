# Workforce Management Platform

A comprehensive workforce, task, and operations management platform built with React, TypeScript, and Tailwind CSS. This platform replicates the end-to-end capabilities of Shoplworks with an added IAM (Identity & Access Management) system for role-based access control.

## 🚀 Features

### 🧰 Workforce Management
- **Attendance System**: Clock in/out via geolocation, QR code, and facial recognition
- **Work Scheduling**: Calendar & list views with shift templates and bulk upload
- **Leave Management**: Customizable leave types with approval workflows
- **Journey Planning**: Map-based daily visit planner with KPIs

### 🗣️ Task & Communication Tools
- **Report Builder**: Dynamic form templates with completion tracking
- **Posting Board**: Internal thread-based bulletin board
- **To-Do List Manager**: Checklist-based task assignment
- **Internal Chat**: Real-time 1:1 and group messaging
- **AI Chatbot**: AI-powered assistance for FAQs and policies

### 🔐 IAM (Identity & Access Management)
- **Role-based Access Control**: Admin, Editor, and Viewer roles
- **Permission-based Navigation**: Dynamic menu based on user permissions
- **Secure Authentication**: Mock authentication system (easily replaceable with Firebase/Auth0)

### ⚙️ Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **TypeScript**: Full type safety and better development experience
- **Modular Architecture**: Component-based structure for maintainability

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Yup validation
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workforce-management-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Credentials

The application includes mock authentication with the following demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | password |
| Editor | editor@company.com | password |
| Viewer | viewer@company.com | password |

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── Attendance/
│       └── AttendancePage.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── Login.tsx
│   └── Dashboard.tsx
├── types/
│   └── index.ts
├── App.tsx
└── index.tsx
```

## 🎯 Key Components

### Authentication System
- **AuthContext**: Manages user authentication state and permissions
- **ProtectedRoute**: Guards routes based on authentication status
- **Role-based Navigation**: Dynamic sidebar based on user permissions

### Dashboard
- **Real-time Statistics**: Employee counts, attendance rates, task completion
- **Quick Actions**: Direct access to common functions
- **Recent Activity**: Live feed of system activities
- **Performance Overview**: Visual metrics and KPIs

### Attendance Management
- **Clock In/Out**: Multiple authentication methods (GPS, QR, Facial)
- **Real-time Tracking**: Live attendance monitoring
- **Location Services**: GPS-based attendance verification
- **Export Functionality**: Download attendance reports

## 🔧 Customization

### Adding New Features
1. Create new components in the appropriate directory
2. Add TypeScript interfaces in `src/types/index.ts`
3. Update the sidebar navigation in `src/components/Layout/Sidebar.tsx`
4. Add routes in `src/App.tsx`

### Styling
- Uses Tailwind CSS utility classes
- Custom components defined in `src/index.css`
- Responsive design with mobile-first approach

### Authentication
- Currently uses mock authentication
- Easy to replace with Firebase, Auth0, or custom backend
- Role-based permissions system in place

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository to Netlify or Vercel
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy!

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Responsive navigation
- Mobile-optimized forms
- Progressive Web App ready

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced reporting with charts and analytics
- [ ] Document signing integration
- [ ] Mobile app with React Native
- [ ] Advanced scheduling with drag-and-drop
- [ ] Integration with external HR systems
- [ ] Advanced AI features for task automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
