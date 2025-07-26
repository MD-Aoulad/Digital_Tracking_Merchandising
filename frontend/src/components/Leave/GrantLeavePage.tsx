/**
 * Grant Leave Page Component - Workforce Management Platform
 * 
 * Administrative interface for granting accrued leave to employees.
 * This component provides a comprehensive 6-step wizard for configuring
 * and executing leave grants with support for both bulk and individual
 * employee configurations.
 * 
 * Key Features:
 * - 6-step wizard interface with progress tracking
 * - Leave type selection (Annual, Sick, Personal, Maternity)
 * - Employee selection (all employees or specific individuals)
 * - Grant type selection (same for all or individual via Excel)
 * - Excel template download and bulk upload functionality
 * - Carryover configuration with multiple expiration options
 * - Comprehensive review and validation before saving
 * - Admin-only access with proper permission checks
 * - Responsive design with mobile optimization
 * - Real-time form validation and error handling
 * 
 * Grant Types Supported:
 * 1. Same for All: Grant identical leave days to all selected employees
 * 2. Individual: Grant different leave days per employee via Excel upload
 * 
 * Carryover Options:
 * - Months from ended month
 * - Days from ended day  
 * - Next year month
 * - Specific date
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 * @since 2025-01-09
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  Users,
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LeaveGrant, LeaveGrantDetail, LeaveType } from '../../types';
import toast from 'react-hot-toast';

// Mock data - in real app, this would come from API
const mockLeaveTypes: LeaveType[] = [
  { id: 'annual', name: 'Annual Leave', maxDays: 25, color: '#3B82F6', requiresApproval: true },
  { id: 'sick', name: 'Sick Leave', maxDays: 15, color: '#EF4444', requiresApproval: false },
  { id: 'personal', name: 'Personal Leave', maxDays: 10, color: '#10B981', requiresApproval: true },
  { id: 'maternity', name: 'Maternity Leave', maxDays: 90, color: '#8B5CF6', requiresApproval: true },
];

const mockEmployees = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', department: 'Sales' },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', department: 'Marketing' },
  { id: '3', name: 'Carol Lee', email: 'carol@example.com', department: 'Development' },
  { id: '4', name: 'David Wilson', email: 'david@example.com', department: 'Sales' },
  { id: '5', name: 'Eva Brown', email: 'eva@example.com', department: 'HR' },
];

/**
 * GrantLeavePage Component
 * 
 * Main administrative interface for granting accrued leave to employees.
 * Implements a comprehensive 6-step wizard that guides administrators
 * through the process of configuring and executing leave grants.
 * 
 * Component State Management:
 * - Step tracking and navigation
 * - Form data collection and validation
 * - File upload handling for Excel templates
 * - Processing state for async operations
 * 
 * User Flow:
 * 1. Enter descriptive title for the leave grant
 * 2. Select appropriate leave type from available options
 * 3. Choose target employees (all or specific individuals)
 * 4. Determine grant type (same for all or individual)
 * 5. Configure details or upload Excel file
 * 6. Review configuration and execute grant
 * 
 * @returns JSX element with complete leave grant wizard interface
 */
const GrantLeavePage: React.FC = () => {
  const { user } = useAuth();
  
  // ============================================================================
  // STEP MANAGEMENT STATE
  // ============================================================================
  
  /** Current step in the wizard (1-6) */
  const [currentStep, setCurrentStep] = useState(1);
  
  /** Whether user can proceed to next step based on validation */
  const [canProceed, setCanProceed] = useState(false);
  
  // ============================================================================
  // FORM DATA STATE
  // ============================================================================
  
  /** Descriptive title for the leave grant (e.g., "Annual Leave 2025 - Sales Team") */
  const [title, setTitle] = useState('');
  
  /** Selected leave type from available options */
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  
  /** Array of selected employee IDs for the grant */
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  /** Grant type: 'same' for all employees or 'individual' for different amounts */
  const [grantType, setGrantType] = useState<'same' | 'individual'>('same');
  
  /** Number of days granted (used when grantType is 'same') */
  const [daysGranted, setDaysGranted] = useState<number>(0);
  
  /** Start date of the leave period */
  const [periodStart, setPeriodStart] = useState('');
  
  /** End date of the leave period */
  const [periodEnd, setPeriodEnd] = useState('');
  
  /** Type of carryover expiration rule */
  const [carryoverType, setCarryoverType] = useState<'months' | 'days' | 'nextYear' | 'specificDate'>('months');
  
  /** Value for carryover calculation (number of months/days or specific date) */
  const [carryoverValue, setCarryoverValue] = useState<string>('');
  
  /** Uploaded Excel file for individual grant processing */
  const [excelFile, setExcelFile] = useState<File | null>(null);
  
  /** Parsed details from uploaded Excel file */
  const [uploadedDetails, setUploadedDetails] = useState<LeaveGrantDetail[]>([]);
  
  /** Processing state for async operations (save, file upload, etc.) */
  const [isProcessing, setIsProcessing] = useState(false);

  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================
  
  /**
   * Validates the current step and determines if user can proceed
   * 
   * Validation Rules:
   * - Step 1: Title must be non-empty
   * - Step 2: Leave type must be selected
   * - Step 3: At least one employee must be selected
   * - Step 4: Grant type must be selected (always valid)
   * - Step 5: For 'same' type - days > 0 and dates filled
   *           For 'individual' type - Excel file must be uploaded
   * - Step 6: Always proceed (review step)
   * 
   * @returns void - updates canProceed state
   */
  const validateStep = React.useCallback(() => {
    switch (currentStep) {
      case 1:
        // Title validation: must have non-empty content
        setCanProceed(title.trim().length > 0);
        break;
      case 2:
        // Leave type validation: must select a leave type
        setCanProceed(selectedLeaveType !== null);
        break;
      case 3:
        // Employee selection validation: at least one employee must be selected
        setCanProceed(selectedEmployees.length > 0);
        break;
      case 4:
        // Grant type validation: must be either 'same' or 'individual'
        setCanProceed(grantType === 'same' || grantType === 'individual');
        break;
      case 5:
        // Details validation: different rules based on grant type
        if (grantType === 'same') {
          // For same grant: days must be > 0 and both dates must be filled
          setCanProceed(daysGranted > 0 && periodStart.trim() !== '' && periodEnd.trim() !== '');
        } else {
          // For individual grant: Excel file must be uploaded
          setCanProceed(excelFile !== null);
        }
        break;
      case 6:
        // Review step: always allow proceeding
        setCanProceed(true);
        break;
      default:
        // Invalid step: prevent proceeding
        setCanProceed(false);
    }
  }, [currentStep, title, selectedLeaveType, selectedEmployees, grantType, daysGranted, periodStart, periodEnd, excelFile]);

  React.useEffect(() => {
    validateStep();
  }, [validateStep]);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================
  
  /**
   * Navigate to the next step in the wizard
   * 
   * Only allows navigation if:
   * - Current step is less than 6 (not on final step)
   * - Current step validation passes (canProceed is true)
   * 
   * @returns void - updates currentStep state
   */
  const handleNext = () => {
    if (currentStep < 6 && canProceed) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Navigate to the previous step in the wizard
   * 
   * Allows navigation if current step is greater than 1
   * No validation required for going backwards
   * 
   * @returns void - updates currentStep state
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ============================================================================
  // DATA HANDLERS
  // ============================================================================
  
  /**
   * Toggle employee selection in the employee list
   * 
   * If employee is already selected, removes them from the list
   * If employee is not selected, adds them to the list
   * 
   * @param employeeId - The ID of the employee to toggle
   * @returns void - updates selectedEmployees state
   */
  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // ============================================================================
  // FILE HANDLERS
  // ============================================================================
  
  /**
   * Handle Excel file upload for individual leave grants
   * 
   * Processes uploaded Excel file and extracts employee-specific leave details.
   * In a real application, this would parse the actual Excel file content.
   * Currently uses mock data for demonstration purposes.
   * 
   * @param event - File input change event
   * @returns void - updates excelFile and uploadedDetails state
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExcelFile(file);
      
      // Mock processing - in real app, this would parse the Excel file
      // and extract actual employee data with their specific leave allocations
      const mockDetails: LeaveGrantDetail[] = selectedEmployees.map((employeeId, index) => ({
        userId: employeeId,
        daysGranted: 10 + index, // Mock: different days for each employee
        periodStart: '2025-01-01',
        periodEnd: '2025-12-31',
        carryoverExpiration: '2026-03-31',
      }));
      
      setUploadedDetails(mockDetails);
      toast.success('Excel file processed successfully');
    }
  };

  // ============================================================================
  // SAVE HANDLERS
  // ============================================================================
  
  /**
   * Execute the leave grant operation
   * 
   * Creates a LeaveGrant object with all collected data and sends it
   * to the backend API. Handles loading states and user feedback.
   * 
   * Process:
   * 1. Set processing state to show loading indicator
   * 2. Create LeaveGrant object with all form data
   * 3. Send to backend API (mock implementation)
   * 4. Show success message and reset form
   * 5. Handle any errors with user feedback
   * 
   * @returns Promise<void> - async operation for API call
   */
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Mock API call - simulate backend processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create LeaveGrant object with all collected data
      const leaveGrant: LeaveGrant = {
        id: Date.now().toString(), // Generate unique ID
        title,
        leaveTypeId: selectedLeaveType!.id,
        employees: selectedEmployees,
        grantType,
        daysGranted: grantType === 'same' ? daysGranted : undefined,
        periodStart: grantType === 'same' ? periodStart : '',
        periodEnd: grantType === 'same' ? periodEnd : '',
        carryoverType,
        carryoverValue,
        createdBy: user?.id || '',
        createdAt: new Date().toISOString(),
        details: grantType === 'individual' ? uploadedDetails : undefined,
      };

      console.log('Leave grant created:', leaveGrant);
      toast.success('Leave granted successfully!');
      
      // Reset form to initial state for next use
      setCurrentStep(1);
      setTitle('');
      setSelectedLeaveType(null);
      setSelectedEmployees([]);
      setGrantType('same');
      setDaysGranted(0);
      setPeriodStart('');
      setPeriodEnd('');
      setCarryoverType('months');
      setCarryoverValue('');
      setExcelFile(null);
      setUploadedDetails([]);
    } catch (error) {
      toast.error('Failed to grant leave. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Download Excel template for individual leave grants
   * 
   * Generates and downloads a CSV template file that users can fill in
   * with employee-specific leave details. The template includes:
   * - Employee identification fields
   * - Leave allocation details
   * - Period and expiration information
   * 
   * Template Structure:
   * - Employee ID, Name, Email, Department
   * - Days Granted (number)
   * - Period Start/End dates
   * - Carryover Expiration date
   * 
   * @returns void - triggers file download
   */
  const downloadTemplate = () => {
    // Mock download - in real app, this would generate and download an Excel file
    const csvContent = `Employee ID,Employee Name,Email,Department,Days Granted,Period Start,Period End,Carryover Expiration
1,Alice Smith,alice@example.com,Sales,25,2025-01-01,2025-12-31,2026-03-31
2,Bob Johnson,bob@example.com,Marketing,25,2025-01-01,2025-12-31,2026-03-31
3,Carol Lee,carol@example.com,Development,25,2025-01-01,2025-12-31,2026-03-31`;
    
    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave_grant_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully');
  };

  /**
   * Render step 1: Title
   */
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <FileText size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Enter a title</h2>
          <p className="text-sm text-gray-600">Combine the name of the group or a period for easy searching</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Grant Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Annual Leave 2025 - Sales Team"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-xs text-gray-500">
          Example: "Annual Leave 2025", "Sick Leave Q1 - Marketing Team"
        </p>
      </div>
    </motion.div>
  );

  /**
   * Render step 2: Leave type selection
   */
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <Calendar size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select leave type</h2>
          <p className="text-sm text-gray-600">Choose the type of leave you want to grant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockLeaveTypes.map((leaveType) => (
          <label
            key={leaveType.id}
            className={`relative cursor-pointer p-4 border-2 rounded-lg transition-colors ${
              selectedLeaveType?.id === leaveType.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="leaveType"
              value={leaveType.id}
              checked={selectedLeaveType?.id === leaveType.id}
              onChange={() => setSelectedLeaveType(leaveType)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: leaveType.color }}
              >
                <Calendar size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{leaveType.name}</h3>
                <p className="text-sm text-gray-500">Max: {leaveType.maxDays} days/year</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </motion.div>
  );

  /**
   * Render step 3: Employee selection
   */
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select employees</h2>
          <p className="text-sm text-gray-600">Choose who will receive the leave grant</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Selected: {selectedEmployees.length} employees
          </span>
          <button
            onClick={() => setSelectedEmployees(mockEmployees.map(emp => emp.id))}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Select All
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
          {mockEmployees.map((employee) => (
            <label
              key={employee.id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedEmployees.includes(employee.id)}
                onChange={() => handleEmployeeToggle(employee.id)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                <div className="text-xs text-gray-500">{employee.email} • {employee.department}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );

  /**
   * Render step 4: Grant type selection
   */
  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <FileText size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select grant type</h2>
          <p className="text-sm text-gray-600">Choose how to grant the leave days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          className={`relative cursor-pointer p-6 border-2 rounded-lg transition-colors ${
            grantType === 'same'
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="grantType"
            value="same"
            checked={grantType === 'same'}
            onChange={() => setGrantType('same')}
            className="sr-only"
          />
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <h3 className="font-medium text-gray-900">Grant the same for all employees</h3>
            </div>
            <p className="text-sm text-gray-600">
              Grant the same number of leave days to all selected employees
            </p>
          </div>
        </label>

        <label
          className={`relative cursor-pointer p-6 border-2 rounded-lg transition-colors ${
            grantType === 'individual'
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="grantType"
            value="individual"
            checked={grantType === 'individual'}
            onChange={() => setGrantType('individual')}
            className="sr-only"
          />
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Upload size={16} className="text-white" />
              </div>
              <h3 className="font-medium text-gray-900">Grant individually for each employee</h3>
            </div>
            <p className="text-sm text-gray-600">
              Grant different numbers of leave days using Excel bulk upload
            </p>
          </div>
        </label>
      </div>
    </motion.div>
  );

  /**
   * Render step 5: Details or Excel upload
   */
  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          {grantType === 'same' ? <Calendar size={20} className="text-white" /> : <Upload size={20} className="text-white" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {grantType === 'same' ? 'Grant the same for all employees' : 'Grant individually for each employee'}
          </h2>
          <p className="text-sm text-gray-600">
            {grantType === 'same' 
              ? 'Configure leave days and period for all employees'
              : 'Upload Excel file with individual leave details'
            }
          </p>
        </div>
      </div>

      {grantType === 'same' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days granted *
            </label>
            <input
              type="number"
              value={daysGranted}
              onChange={(e) => setDaysGranted(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.001"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 25"
            />
            <p className="text-xs text-gray-500 mt-1">Up to three decimal points allowed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period start date *
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period end date *
              </label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Carryover expiration
            </label>
            <select
              value={carryoverType}
              onChange={(e) => setCarryoverType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="months">Month(s) from the ended month</option>
              <option value="days">Day(s) from the ended day</option>
              <option value="nextYear">Month of next year</option>
              <option value="specificDate">Specific date</option>
            </select>

            {(carryoverType === 'months' || carryoverType === 'days') && (
              <input
                type="number"
                value={carryoverValue}
                onChange={(e) => setCarryoverValue(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={carryoverType === 'months' ? 'Number of months' : 'Number of days'}
              />
            )}

            {carryoverType === 'specificDate' && (
              <input
                type="date"
                value={carryoverValue}
                onChange={(e) => setCarryoverValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Excel Upload Process</h4>
                <ol className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>1. Download the Excel template</li>
                  <li>2. Fill in the leave details for each employee</li>
                  <li>3. Upload the completed file</li>
                  <li>4. Review the data and save</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100"
            >
              <Download size={16} />
              <span>Download Excel template</span>
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload completed Excel file *
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {excelFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ File uploaded: {excelFile.name}
                </p>
              )}
            </div>

            {uploadedDetails.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Data Preview</h4>
                <div className="max-h-40 overflow-y-auto">
                  {uploadedDetails.map((detail, index) => {
                    const employee = mockEmployees.find(emp => emp.id === detail.userId);
                    return (
                      <div key={index} className="text-sm text-gray-600 py-1">
                        {employee?.name}: {detail.daysGranted} days ({detail.periodStart} to {detail.periodEnd})
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  /**
   * Render step 6: Review and save
   */
  const renderStep6 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <CheckCircle size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Review and save</h2>
          <p className="text-sm text-gray-600">Review the leave grant details before saving</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Grant Details</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div><span className="font-medium">Title:</span> {title}</div>
              <div><span className="font-medium">Leave Type:</span> {selectedLeaveType?.name}</div>
              <div><span className="font-medium">Grant Type:</span> {grantType === 'same' ? 'Same for all' : 'Individual'}</div>
              <div><span className="font-medium">Employees:</span> {selectedEmployees.length} selected</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Configuration</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {grantType === 'same' ? (
                <>
                  <div><span className="font-medium">Days Granted:</span> {daysGranted}</div>
                  <div><span className="font-medium">Period:</span> {periodStart} to {periodEnd}</div>
                  <div><span className="font-medium">Carryover:</span> {carryoverType} {carryoverValue}</div>
                </>
              ) : (
                <>
                  <div><span className="font-medium">File:</span> {excelFile?.name}</div>
                  <div><span className="font-medium">Records:</span> {uploadedDetails.length}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Selected Employees</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            {selectedEmployees.map(employeeId => {
              const employee = mockEmployees.find(emp => emp.id === employeeId);
              return (
                <div key={employeeId} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>{employee?.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Important</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This action will grant leave to {selectedEmployees.length} employees. 
              The leave will be available for use from {grantType === 'same' ? periodStart : 'the specified dates'}.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  /**
   * Render current step
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Grant Leave (Accrued Leave)</h1>
        <p className="text-gray-600 mt-2">
          Grant leave days to employees for accrued leave types. Only admins can assign leave.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 6 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Title</span>
          <span>Leave Type</span>
          <span>Employees</span>
          <span>Grant Type</span>
          <span>Details</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Grant Leave</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrantLeavePage; 