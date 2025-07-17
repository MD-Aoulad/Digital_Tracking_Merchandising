import { Platform } from 'react-native';

/**
 * Accessibility utility functions to help prevent aria-hidden issues
 */

/**
 * Ensures proper focus management for React Native components
 * This helps prevent the aria-hidden warning by managing focus properly
 */
export const ensureProperFocus = () => {
  if (Platform.OS === 'web') {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const activeElement = document.activeElement;
      
      // If no element is focused, focus the first focusable element
      if (!activeElement || activeElement === document.body) {
        const firstFocusable = document.querySelector(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          (firstFocusable as HTMLElement).focus();
        }
      }
    }, 50);
  }
};

/**
 * Removes aria-hidden attributes from elements that shouldn't have them
 * This helps prevent the accessibility warning
 */
export const cleanupAriaHidden = () => {
  if (Platform.OS === 'web') {
    // Find elements with aria-hidden that contain focusable elements
    const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    
    ariaHiddenElements.forEach((element) => {
      const focusableChildren = element.querySelectorAll(
        'button, input, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      // If the aria-hidden element contains focusable children, remove aria-hidden
      if (focusableChildren.length > 0) {
        element.removeAttribute('aria-hidden');
      }
    });
  }
};

/**
 * Sets up accessibility event listeners to prevent aria-hidden issues
 */
export const setupAccessibilityListeners = () => {
  if (Platform.OS === 'web') {
    // Listen for focus events to ensure proper focus management
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      let parent = target.parentElement;
      
      // Check if the focused element is inside an aria-hidden container
      while (parent) {
        if (parent.getAttribute('aria-hidden') === 'true') {
          // Remove aria-hidden from the parent to prevent the warning
          parent.removeAttribute('aria-hidden');
          break;
        }
        parent = parent.parentElement;
      }
    };

    document.addEventListener('focusin', handleFocus);
    
    // Cleanup function
    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }
  
  return () => {}; // No-op for non-web platforms
};

/**
 * Accessibility props for React Native components
 */
export const getAccessibilityProps = (label: string, role?: string) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: role || 'none',
  accessibilityHint: `Tap to interact with ${label.toLowerCase()}`,
}); 