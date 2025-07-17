import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { 
  ensureProperFocus, 
  cleanupAriaHidden, 
  setupAccessibilityListeners 
} from '../utils/accessibility';

interface FocusManagerProps {
  children: React.ReactNode;
}

/**
 * FocusManager component to handle accessibility focus issues
 * Prevents aria-hidden warnings by ensuring proper focus management
 */
const FocusManager: React.FC<FocusManagerProps> = ({ children }) => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Initial setup
      ensureProperFocus();
      cleanupAriaHidden();
      
      // Setup event listeners
      const cleanup = setupAccessibilityListeners();
      
      // Periodic cleanup to prevent aria-hidden issues
      const interval = setInterval(() => {
        cleanupAriaHidden();
      }, 1000);
      
      return () => {
        cleanup();
        clearInterval(interval);
      };
    }
  }, []);

  return <>{children}</>;
};

export default FocusManager; 