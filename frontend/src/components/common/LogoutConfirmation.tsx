/**
 * Logout Confirmation Component
 * 
 * Provides a confirmation dialog when users attempt to logout,
 * preventing accidental logouts and improving user experience.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Confirm Logout
            </h3>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to logout? You will need to log back in to access your account.
          </p>
          {user && (
            <p className="text-sm text-gray-700 mt-2">
              <strong>Current user:</strong> {user.name} ({user.email})
            </p>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={handleConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for managing logout confirmation
 */
export const useLogoutConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  const showLogoutConfirmation = () => {
    setIsOpen(true);
  };

  const hideLogoutConfirmation = () => {
    setIsOpen(false);
  };

  const confirmLogout = () => {
    logout();
  };

  return {
    isOpen,
    showLogoutConfirmation,
    hideLogoutConfirmation,
    confirmLogout
  };
}; 