/**
 * TutorialOverlay Component Tests
 * 
 * Comprehensive tests for the tutorial overlay component
 * covering functionality, animations, and user interactions.
 * 
 * @author Testing Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TutorialOverlay from '../TutorialOverlay';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

const renderTutorialOverlay = (onClose = jest.fn()) => {
  return render(
    <BrowserRouter>
      <TutorialOverlay onClose={onClose} />
    </BrowserRouter>
  );
};

describe('TutorialOverlay', () => {
  beforeEach(() => {
    // Mock window.addEventListener for keyboard events
    jest.spyOn(window, 'addEventListener').mockImplementation(() => {});
    jest.spyOn(window, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the tutorial overlay with correct content', () => {
      renderTutorialOverlay();
      
      expect(screen.getByText('App Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Learn how to use Workforce Manager effectively')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Workforce Manager')).toBeInTheDocument();
    });

    it('shows the first step by default', () => {
      renderTutorialOverlay();
      
      expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
      expect(screen.getByText('12% Complete')).toBeInTheDocument();
    });

    it('displays step indicators for all tutorial steps', () => {
      renderTutorialOverlay();
      
      // Should have 8 step indicators (dots)
      const stepIndicators = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-label')?.includes('Go to step')
      );
      expect(stepIndicators).toHaveLength(8);
    });
  });

  describe('Navigation', () => {
    it('allows navigation to next step', () => {
      renderTutorialOverlay();
      
      const nextButton = screen.getByLabelText('Next step');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();
      expect(screen.getByText('Task Management & Todo System')).toBeInTheDocument();
    });

    it('allows navigation to previous step', () => {
      renderTutorialOverlay();
      
      // First go to step 2
      const nextButton = screen.getByLabelText('Next step');
      fireEvent.click(nextButton);
      
      // Then go back to step 1
      const prevButton = screen.getByLabelText('Previous step');
      fireEvent.click(prevButton);
      
      expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Workforce Manager')).toBeInTheDocument();
    });

    it('wraps around when navigating past the last step', () => {
      renderTutorialOverlay();
      
      // Go to the last step (step 8)
      for (let i = 0; i < 7; i++) {
        const nextButton = screen.getByLabelText('Next step');
        fireEvent.click(nextButton);
      }
      
      expect(screen.getByText('Step 8 of 8')).toBeInTheDocument();
      
      // Go to next step (should wrap to step 1)
      const nextButton = screen.getByLabelText('Next step');
      fireEvent.click(nextButton);
      
      expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
    });

    it('allows direct navigation to specific steps', () => {
      renderTutorialOverlay();
      
      // Click on step 3 indicator
      const step3Button = screen.getByLabelText('Go to step 3');
      fireEvent.click(step3Button);
      
      expect(screen.getByText('Step 3 of 8')).toBeInTheDocument();
      expect(screen.getByText('Communication & Chat System')).toBeInTheDocument();
    });
  });

  describe('Play/Pause Functionality', () => {
    it('toggles play/pause state', () => {
      renderTutorialOverlay();
      
      const playButton = screen.getByLabelText('Play tutorial');
      expect(playButton).toBeInTheDocument();
      
      fireEvent.click(playButton);
      
      expect(screen.getByLabelText('Pause tutorial')).toBeInTheDocument();
      
      fireEvent.click(screen.getByLabelText('Pause tutorial'));
      
      expect(screen.getByLabelText('Play tutorial')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      renderTutorialOverlay(onClose);
      
      const closeButton = screen.getByLabelText('Close tutorial');
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when skip tutorial is clicked', () => {
      const onClose = jest.fn();
      renderTutorialOverlay(onClose);
      
      const skipButton = screen.getByText('Skip Tutorial');
      fireEvent.click(skipButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking outside the modal', () => {
      const onClose = jest.fn();
      renderTutorialOverlay(onClose);
      
      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Display', () => {
    it('displays features and tips for each step', () => {
      renderTutorialOverlay();
      
      expect(screen.getByText('Key Features')).toBeInTheDocument();
      expect(screen.getByText('Pro Tips')).toBeInTheDocument();
      
      // Check for specific content from step 1
      expect(screen.getByText('Real-time dashboard with live updates')).toBeInTheDocument();
      expect(screen.getByText('Use the sidebar to navigate between features')).toBeInTheDocument();
    });

    it('updates content when navigating between steps', () => {
      renderTutorialOverlay();
      
      // Go to step 2
      const nextButton = screen.getByLabelText('Next step');
      fireEvent.click(nextButton);
      
      // Check for step 2 content
      expect(screen.getByText('8 specialized task types for merchandising')).toBeInTheDocument();
      expect(screen.getByText('Use the Advanced Todo Creator for detailed tasks')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all interactive elements', () => {
      renderTutorialOverlay();
      
      expect(screen.getByLabelText('Close tutorial')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous step')).toBeInTheDocument();
      expect(screen.getByLabelText('Next step')).toBeInTheDocument();
      expect(screen.getByLabelText('Play tutorial')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      const onClose = jest.fn();
      renderTutorialOverlay(onClose);
      
      // Simulate Escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interactive Elements', () => {
    it('toggles feature highlights button', () => {
      renderTutorialOverlay();
      
      const highlightsButton = screen.getByText('Show Feature Highlights');
      expect(highlightsButton).toBeInTheDocument();
      
      fireEvent.click(highlightsButton);
      
      expect(screen.getByText('Hide Feature Highlights')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Hide Feature Highlights'));
      
      expect(screen.getByText('Show Feature Highlights')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('updates progress bar when navigating', () => {
      renderTutorialOverlay();
      
      // Initial progress should be 12% (1/8)
      expect(screen.getByText('12% Complete')).toBeInTheDocument();
      
      // Go to step 4
      const step4Button = screen.getByLabelText('Go to step 4');
      fireEvent.click(step4Button);
      
      // Progress should be 50% (4/8)
      expect(screen.getByText('50% Complete')).toBeInTheDocument();
    });
  });
}); 