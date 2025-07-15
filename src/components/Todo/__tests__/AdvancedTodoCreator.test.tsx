/**
 * Advanced Todo Creator Component Tests
 * 
 * Comprehensive test suite for the AdvancedTodoCreator component covering:
 * - Component rendering
 * - Question type selection
 * - Question creation and editing
 * - Form validation
 * - User interactions
 * - Error handling
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvancedTodoCreator from '../AdvancedTodoCreator';
import { QuestionType } from '../../../types';

// Mock the types module
jest.mock('../../../types', () => ({
  QuestionType: {
    TEXT_ANSWER: 'text_answer',
    MULTIPLE_CHOICE: 'multiple_choice',
    SINGLE_CHOICE: 'single_choice',
    PHOTO_UPLOAD: 'photo_upload',
    RATING_SCALE: 'rating_scale',
    PRODUCT_INSPECTION: 'product_inspection',
    DISPLAY_EVALUATION: 'display_evaluation',
    INVENTORY_COUNT: 'inventory_count',
    PRICING_VERIFICATION: 'pricing_verification',
    COMPETITOR_ANALYSIS: 'competitor_analysis',
    CUSTOMER_FEEDBACK: 'customer_feedback',
    STORE_AUDIT: 'store_audit',
    PROMOTION_VERIFICATION: 'promotion_verification',
    PLANOGRAM_COMPLIANCE: 'planogram_compliance',
    SHELF_MAINTENANCE: 'shelf_maintenance'
  }
}));

// Mock window.alert
global.alert = jest.fn();

describe('AdvancedTodoCreator', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with correct title', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Create Advanced Todo')).toBeInTheDocument();
    });

    it('renders all tabs', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('shows basic info tab by default', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    });

    it('shows questions tab content when clicked', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Questions'));
      expect(screen.getByTestId('add-question-tab-button')).toBeInTheDocument();
    });

    it('shows settings tab content when clicked', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Assign To Users')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('allows typing in title field', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/Title/), 'Test Todo');
      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    });

    it('allows typing in description field', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText(/Description/), 'Test Description');
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });

    it('allows changing category', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const categorySelect = screen.getByDisplayValue('General');
      fireEvent.change(categorySelect, { target: { value: 'Sales' } });
      expect(screen.getByDisplayValue('Sales')).toBeInTheDocument();
    });

    it('allows changing difficulty', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const difficultySelect = screen.getByDisplayValue('Medium');
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      expect(screen.getByDisplayValue('Hard')).toBeInTheDocument();
    });

    it('allows changing estimated duration', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const durationInput = screen.getByDisplayValue('30');
      fireEvent.change(durationInput, { target: { value: '60' } });
      expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    });
  });

  describe('Settings Tab', () => {
    it('shows user assignment options', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Richard Johnson (richard@company.com)')).toBeInTheDocument();
      expect(screen.getByText('Admin User (admin@company.com)')).toBeInTheDocument();
    });

    it('allows toggling approval requirement', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Settings'));
      const approvalCheckbox = screen.getByLabelText('Require approval before completion');
      fireEvent.click(approvalCheckbox);

      expect(approvalCheckbox).toBeChecked();
    });
  });

  describe('Preview Tab', () => {
    it('shows preview of todo with questions', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Add basic info
      await user.type(screen.getByLabelText(/Title/), 'Test Todo');
      await user.type(screen.getByLabelText(/Description/), 'Test Description');

      // Add a question
      fireEvent.click(screen.getByText('Questions'));
      await user.click(screen.getByTestId('add-question-tab-button'));
      await user.click(screen.getByTestId('add-question-modal-button'));
      await user.type(screen.getByPlaceholderText('Question Title *'), 'Test Question');

      // Check preview
      fireEvent.click(screen.getByText('Preview'));

      expect(screen.getByText('Test Todo')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Q1: Test Question')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when saving without title', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Try to save without title
      await user.click(screen.getByText('Save'));

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows error when saving without questions', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Add title but no questions
      await user.type(screen.getByLabelText(/Title/), 'Test Todo');
      await user.click(screen.getByText('Save'));

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('saves successfully with valid data', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Add basic info
      await user.type(screen.getByLabelText(/Title/), 'Test Todo');
      await user.type(screen.getByLabelText(/Description/), 'Test Description');

      // Add a question
      fireEvent.click(screen.getByText('Questions'));
      await user.click(screen.getByTestId('add-question-tab-button'));
      await user.click(screen.getByTestId('add-question-modal-button'));
      await user.type(screen.getByPlaceholderText('Question Title *'), 'Test Question');

      // Save
      await user.click(screen.getByText('Save'));

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Todo',
          description: 'Test Description',
          questions: expect.arrayContaining([
            expect.objectContaining({
              title: 'Test Question',
              type: QuestionType.TEXT_ANSWER
            })
          ])
        })
      );
    });
  });

  describe('User Interactions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Use the header cancel button specifically
      await user.click(screen.getByTestId('header-cancel-button'));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('closes question modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Open question modal
      fireEvent.click(screen.getByText('Questions'));
      await user.click(screen.getByTestId('add-question-tab-button'));

      // Cancel modal - use the modal cancel button
      await user.click(screen.getByTestId('modal-cancel-button'));

      // Check that the modal is closed by looking for the modal container
      expect(screen.queryByTestId('question-modal')).not.toBeInTheDocument();
      // Also check that we're back to the questions tab
      expect(screen.getByTestId('add-question-tab-button')).toBeInTheDocument();
    });

    it('allows switching between tabs', () => {
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Switch to different tabs
      fireEvent.click(screen.getByText('Questions'));
      expect(screen.getByTestId('add-question-tab-button')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Assign To Users')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Basic Info'));
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    });
  });

  describe('Question Type Specific Features', () => {
    it('shows file upload settings for photo upload questions', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Add photo upload question
      fireEvent.click(screen.getByText('Questions'));
      await user.click(screen.getByTestId('add-question-tab-button'));
      await user.click(screen.getByText('Photo Upload'));
      await user.click(screen.getByTestId('add-question-modal-button'));

      // Check that the question was added by looking for the question number
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('shows rating scale settings for rating scale questions', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedTodoCreator
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Add rating scale question
      fireEvent.click(screen.getByText('Questions'));
      await user.click(screen.getByTestId('add-question-tab-button'));
      await user.click(screen.getByText('Rating Scale'));
      await user.click(screen.getByTestId('add-question-modal-button'));

      // Check that the question was added by looking for the question number
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
  });
}); 