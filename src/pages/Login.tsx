/**
 * Login Page Component - Workforce Management Platform
 * 
 * Updated to use the enhanced LoginForm component with comprehensive
 * error handling, timeout management, and improved UX.
 * 
 * @author Workforce Management Team
 * @version 2.0.0
 */

import React from 'react';
import LoginForm from '../components/Auth/LoginForm';

/**
 * Login Page Component
 * 
 * Uses the enhanced LoginForm component for better error handling and UX.
 * 
 * @returns JSX element with login interface
 */
const Login: React.FC = () => {
  return <LoginForm />;
};

export default Login;
