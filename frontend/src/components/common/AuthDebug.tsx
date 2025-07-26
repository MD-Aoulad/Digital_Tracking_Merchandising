import React, { useState, useEffect } from 'react';
import { Shield, Key, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Auth Debug Component
 * 
 * This component helps debug authentication issues by showing:
 * - Current authentication status
 * - Token information
 * - User data
 * - Test authentication functionality
 * 
 * @returns JSX element with authentication debug information
 */
const AuthDebug: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    // Get token info from localStorage
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTokenInfo(payload);
      } catch (error) {
        setTokenInfo({ error: 'Invalid token format' });
      }
    }
    
    if (userData) {
      try {
        setLocalStorageData(JSON.parse(userData));
      } catch (error) {
        setLocalStorageData({ error: 'Invalid user data format' });
      }
    }
  }, [user]);

  const testAuthAPI = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/todos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`✅ API call successful! Found ${data.todos.length} todos`);
      } else {
        const error = await response.json();
        alert(`❌ API call failed: ${error.error}`);
      }
    } catch (error) {
      alert(`❌ Network error: ${error}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-800">Authentication Debug</h3>
        </div>
        <p className="text-yellow-700 mb-3">User is not authenticated</p>
        <div className="space-y-2 text-sm">
          <p><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
          <p><strong>User Data:</strong> {localStorage.getItem('userData') ? 'Present' : 'Missing'}</p>
        </div>
        <button
          onClick={clearAuth}
          className="mt-3 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
        >
          Clear Auth Data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">Authentication Debug</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-green-700 mb-1">User Information</h4>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Department:</strong> {user.department}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-green-700 mb-1">Token Information</h4>
          <div className="text-sm space-y-1">
            <p><strong>Issued At:</strong> {tokenInfo?.iat ? new Date(tokenInfo.iat * 1000).toLocaleString() : 'N/A'}</p>
            <p><strong>Expires At:</strong> {tokenInfo?.exp ? new Date(tokenInfo.exp * 1000).toLocaleString() : 'N/A'}</p>
            <p><strong>Token ID:</strong> {tokenInfo?.id || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-green-700 mb-1">Local Storage Data</h4>
          <div className="text-sm space-y-1">
            <p><strong>User ID:</strong> {localStorageData?.id || 'N/A'}</p>
            <p><strong>Backend Role:</strong> {localStorageData?.role || 'N/A'}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={testAuthAPI}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Test API Call
          </button>
          <button
            onClick={clearAuth}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Clear Auth
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug; 