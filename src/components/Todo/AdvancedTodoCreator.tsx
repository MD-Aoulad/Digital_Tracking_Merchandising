/**
 * Advanced Todo Creator Component
 * 
 * This component allows admins to create advanced todos with multiple question types.
 * It provides a comprehensive interface for building complex todo forms with various
 * question types, validation rules, and assignment settings.
 * 
 * Features:
 * - Multiple question types (multiple choice, text, photo upload, etc.)
 * - Drag and drop question reordering
 * - Conditional logic between questions
 * - Validation rules for each question
 * - Assignment settings and scheduling
 * - Template creation and management
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings, 
  Users, 
  Calendar,
  Save,
  Eye,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { 
  QuestionType, 
  TodoQuestion, 
  QuestionOption, 
  QuestionValidation,
  RatingScale,
  MatrixQuestion,
  ConditionalLogic,
  AdvancedTodo
} from '../../types';

interface AdvancedTodoCreatorProps {
  onSave: (todo: AdvancedTodo) => void;
  onCancel: () => void;
  initialData?: Partial<AdvancedTodo>;
  isTemplate?: boolean;
}

const AdvancedTodoCreator: React.FC<AdvancedTodoCreatorProps> = ({
  onSave,
  onCancel,
  initialData,
  isTemplate = false
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<AdvancedTodo>>({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'medium',
    estimatedDuration: 30,
    assignedTo: [],
    requireApproval: false,
    allowReassignment: false,
    autoComplete: false,
    questions: [],
    tags: [],
    ...initialData
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'settings' | 'preview'>('basic');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<TodoQuestion | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.TEXT_ANSWER);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Load users for assignment
  useEffect(() => {
    // TODO: Load users from API
    setUsers([
      { id: '1', name: 'Richard Johnson', email: 'richard@company.com', role: 'Manager' },
      { id: '2', name: 'Admin User', email: 'admin@company.com', role: 'Administrator' },
      { id: '3', name: 'Sarah Wilson', email: 'sarah@company.com', role: 'Supervisor' },
      { id: '4', name: 'Mike Chen', email: 'mike@company.com', role: 'Team Lead' },
      { id: '5', name: 'Lisa Rodriguez', email: 'lisa@company.com', role: 'Coordinator' }
    ]);
  }, []);

  /**
   * Add a new question to the todo
   */
  const addQuestion = () => {
    // Validate that a question type is selected
    if (!questionType) {
      alert('Please select a question type');
      return;
    }

    const newQuestion: TodoQuestion = {
      id: `q_${Date.now()}`,
      type: questionType,
      title: `New ${getQuestionTypeLabel(questionType)} Question`,
      description: '',
      required: false,
      order: (formData.questions?.length || 0) + 1,
      options: questionType === QuestionType.MULTIPLE_CHOICE || 
               questionType === QuestionType.SINGLE_CHOICE ? [
        { id: 'opt_1', label: 'Option 1', value: 'option1' },
        { id: 'opt_2', label: 'Option 2', value: 'option2' }
      ] : undefined,
      validation: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
    
    // Reset modal state
    setShowQuestionModal(false);
    setQuestionType(QuestionType.TEXT_ANSWER); // Reset to default
  };

  /**
   * Update a question in the todo
   */
  const updateQuestion = (questionId: string, updates: Partial<TodoQuestion>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === questionId ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
      )
    }));
  };

  /**
   * Delete a question from the todo
   */
  const deleteQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== questionId) || []
    }));
  };

  /**
   * Reorder questions using drag and drop
   */
  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    const questions = [...(formData.questions || [])];
    const [movedQuestion] = questions.splice(fromIndex, 1);
    questions.splice(toIndex, 0, movedQuestion);
    
    // Update order numbers
    const updatedQuestions = questions.map((q, index) => ({
      ...q,
      order: index + 1
    }));

    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  /**
   * Save the advanced todo
   */
  const handleSave = () => {
    console.log('Save button clicked');
    console.log('Form data:', formData);
    
    if (!formData.title || !formData.questions || formData.questions.length === 0) {
      alert('Please provide a title and at least one question');
      return;
    }

    const todo: AdvancedTodo = {
      id: initialData?.id || `todo_${Date.now()}`,
      title: formData.title!,
      description: formData.description || '',
      questions: formData.questions!,
      assignedTo: formData.assignedTo || [],
      assignedBy: 'current_user_id', // TODO: Get from auth context
      category: formData.category || 'General',
      difficulty: formData.difficulty || 'medium',
      estimatedDuration: formData.estimatedDuration || 30,
      tags: formData.tags || [],
      isTemplate: isTemplate,
      allowReassignment: formData.allowReassignment || false,
      requireApproval: formData.requireApproval || false,
      autoComplete: formData.autoComplete || false,
      completionRate: 0,
      averageTime: 0,
      difficultyRating: 0,
      // Required by AdvancedTodo (from TodoTask)
      priority: 'medium',
      isRepeating: false,
      reminders: [],
      attachments: [],
      requiresPhoto: false,
      requiresLocation: false,
      requiresSignature: false,
      notes: '',
      dueDate: new Date().toISOString().slice(0, 10),
      status: 'pending',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Optionals
      startDate: undefined,
      recurring: undefined,
      points: 0,
      weight: 1,
      evaluationCriteria: [],
      linkedTasks: [],
      dependencies: []
    };

    onSave(todo);
  };

  /**
   * Render question type selector
   */
  const renderQuestionTypeSelector = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Select a question type to add to your todo:
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {Object.values(QuestionType).slice(0, 15).map(type => ( // Show only first 15 types to avoid overwhelming
          <button
            key={type}
            onClick={() => setQuestionType(type)}
            className={`p-3 border rounded-lg text-left transition-all duration-200 ${
              questionType === type 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="font-medium text-sm">{getQuestionTypeLabel(type)}</div>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{getQuestionTypeDescription(type)}</div>
          </button>
        ))}
      </div>
      
      {questionType && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-800">
            Selected: {getQuestionTypeLabel(questionType)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {getQuestionTypeDescription(questionType)}
          </div>
        </div>
      )}
    </div>
  );

  /**
   * Get human-readable label for question type
   */
  const getQuestionTypeLabel = (type: QuestionType): string => {
    const labels: Record<QuestionType, string> = {
      [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
      [QuestionType.SINGLE_CHOICE]: 'Single Choice',
      [QuestionType.TEXT_ANSWER]: 'Text Answer',
      [QuestionType.TEXTAREA_ANSWER]: 'Long Text',
      [QuestionType.NUMBER_INPUT]: 'Number Input',
      [QuestionType.PHOTO_UPLOAD]: 'Photo Upload',
      [QuestionType.LOCATION]: 'Location',
      [QuestionType.DATE_TIME]: 'Date & Time',
      [QuestionType.RATING_SCALE]: 'Rating Scale',
      [QuestionType.CHECKLIST]: 'Checklist',
      [QuestionType.SIGNATURE]: 'Signature',
      [QuestionType.FILE_UPLOAD]: 'File Upload',
      [QuestionType.YES_NO]: 'Yes/No',
      [QuestionType.SLIDER]: 'Slider',
      [QuestionType.MATRIX]: 'Matrix',
      
      // Merchandising-specific types
      [QuestionType.PRODUCT_INSPECTION]: 'Product Inspection',
      [QuestionType.DISPLAY_EVALUATION]: 'Display Evaluation',
      [QuestionType.COMPETITOR_ANALYSIS]: 'Competitor Analysis',
      [QuestionType.STORE_LAYOUT]: 'Store Layout',
      [QuestionType.INVENTORY_COUNT]: 'Inventory Count',
      [QuestionType.PRICING_VERIFICATION]: 'Pricing Verification',
      [QuestionType.PROMOTION_COMPLIANCE]: 'Promotion Compliance',
      [QuestionType.CUSTOMER_FEEDBACK]: 'Customer Feedback',
      [QuestionType.SUPPLIER_EVALUATION]: 'Supplier Evaluation',
      [QuestionType.QUALITY_ASSURANCE]: 'Quality Assurance',
      [QuestionType.SAFETY_INSPECTION]: 'Safety Inspection',
      [QuestionType.TRAINING_VERIFICATION]: 'Training Verification',
      [QuestionType.EQUIPMENT_CHECK]: 'Equipment Check',
      [QuestionType.ENVIRONMENTAL_ASSESSMENT]: 'Environmental Assessment',
      [QuestionType.COMPLIANCE_AUDIT]: 'Compliance Audit'
    };
    return labels[type] || type;
  };

  /**
   * Get description for question type
   */
  const getQuestionTypeDescription = (type: QuestionType): string => {
    const descriptions: Record<QuestionType, string> = {
      [QuestionType.MULTIPLE_CHOICE]: 'Select multiple options from a list',
      [QuestionType.SINGLE_CHOICE]: 'Select one option from a list',
      [QuestionType.TEXT_ANSWER]: 'Short text response',
      [QuestionType.TEXTAREA_ANSWER]: 'Long text response with multiple lines',
      [QuestionType.NUMBER_INPUT]: 'Numeric value input',
      [QuestionType.PHOTO_UPLOAD]: 'Upload or capture photos',
      [QuestionType.LOCATION]: 'Capture GPS location',
      [QuestionType.DATE_TIME]: 'Select date and time',
      [QuestionType.RATING_SCALE]: 'Rate on a scale (1-5, 1-10, etc.)',
      [QuestionType.CHECKLIST]: 'Check off items from a list',
      [QuestionType.SIGNATURE]: 'Digital signature capture',
      [QuestionType.FILE_UPLOAD]: 'Upload documents or files',
      [QuestionType.YES_NO]: 'Simple yes or no response',
      [QuestionType.SLIDER]: 'Select value using a slider',
      [QuestionType.MATRIX]: 'Matrix-style question with rows and columns',
      
      // Merchandising-specific descriptions
      [QuestionType.PRODUCT_INSPECTION]: 'Comprehensive product quality and condition assessment',
      [QuestionType.DISPLAY_EVALUATION]: 'Evaluate visual merchandising displays and effectiveness',
      [QuestionType.COMPETITOR_ANALYSIS]: 'Analyze competitor products, pricing, and strategies',
      [QuestionType.STORE_LAYOUT]: 'Assess store layout, traffic flow, and space utilization',
      [QuestionType.INVENTORY_COUNT]: 'Count and verify inventory levels and accuracy',
      [QuestionType.PRICING_VERIFICATION]: 'Verify pricing accuracy and promotional compliance',
      [QuestionType.PROMOTION_COMPLIANCE]: 'Check promotional material compliance and effectiveness',
      [QuestionType.CUSTOMER_FEEDBACK]: 'Collect and analyze customer feedback and satisfaction',
      [QuestionType.SUPPLIER_EVALUATION]: 'Evaluate supplier performance and quality standards',
      [QuestionType.QUALITY_ASSURANCE]: 'Quality control and standards compliance verification',
      [QuestionType.SAFETY_INSPECTION]: 'Safety compliance and hazard assessment',
      [QuestionType.TRAINING_VERIFICATION]: 'Verify training completion and competency',
      [QuestionType.EQUIPMENT_CHECK]: 'Equipment status and maintenance verification',
      [QuestionType.ENVIRONMENTAL_ASSESSMENT]: 'Environmental factors and conditions evaluation',
      [QuestionType.COMPLIANCE_AUDIT]: 'Comprehensive compliance and regulatory audit'
    };
    return descriptions[type] || 'Question type description';
  };

  /**
   * Render question editor
   */
  const renderQuestionEditor = (question: TodoQuestion) => (
    <div key={question.id} className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GripVertical className="text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-700">Question {question.order}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getQuestionTypeLabel(question.type)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Delete question"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Title *
          </label>
          <input
            type="text"
            placeholder="Enter your question"
            value={question.title}
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            placeholder="Additional context or instructions for this question"
            value={question.description || ''}
            onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm">Required</span>
          </label>
        </div>

        {/* Question type specific options */}
        {renderQuestionTypeOptions(question)}
      </div>
    </div>
  );

  /**
   * Render question type specific options
   */
  const renderQuestionTypeOptions = (question: TodoQuestion) => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Options</label>
            {question.options?.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[index] = { ...option, label: e.target.value };
                    updateQuestion(question.id, { options: newOptions });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => {
                    const newOptions = question.options?.filter((_, i) => i !== index);
                    updateQuestion(question.id, { options: newOptions });
                  }}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOption: QuestionOption = {
                  id: `opt_${Date.now()}`,
                  label: `Option ${(question.options?.length || 0) + 1}`,
                  value: `option${(question.options?.length || 0) + 1}`
                };
                updateQuestion(question.id, { 
                  options: [...(question.options || []), newOption] 
                });
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Option
            </button>
          </div>
        );

      case QuestionType.RATING_SCALE:
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Min Value</label>
                <input
                  type="number"
                  value={question.ratingScale?.min ?? 1}
                  onChange={(e) => updateQuestion(question.id, {
                    ratingScale: { ...question.ratingScale, min: parseInt(e.target.value) || 1, max: question.ratingScale?.max ?? 5 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Max Value</label>
                <input
                  type="number"
                  value={question.ratingScale?.max ?? 5}
                  onChange={(e) => updateQuestion(question.id, {
                    ratingScale: { ...question.ratingScale, max: parseInt(e.target.value) || 5, min: question.ratingScale?.min ?? 1 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        );

      // Merchandising-specific question configurations
      case QuestionType.PRODUCT_INSPECTION:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Beauty', 'Food & Beverage', 'Automotive', 'Books'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.merchandisingConfig?.productInspection?.productCategories?.includes(category) || false}
                      onChange={(e) => {
                        const currentCategories = question.merchandisingConfig?.productInspection?.productCategories || [];
                        const newCategories = e.target.checked 
                          ? [...currentCategories, category]
                          : currentCategories.filter(c => c !== category);
                        updateQuestion(question.id, {
                          merchandisingConfig: {
                            ...question.merchandisingConfig,
                            productInspection: {
                              productCategories: newCategories,
                              inspectionPoints: question.merchandisingConfig?.productInspection?.inspectionPoints || [],
                              qualityStandards: question.merchandisingConfig?.productInspection?.qualityStandards || [],
                              defectTypes: question.merchandisingConfig?.productInspection?.defectTypes || [],
                              requirePhotos: question.merchandisingConfig?.productInspection?.requirePhotos || false,
                              requireBarcodeScan: question.merchandisingConfig?.productInspection?.requireBarcodeScan || false,
                              requireQuantityCount: question.merchandisingConfig?.productInspection?.requireQuantityCount || false
                            }
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Inspection Requirements</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.productInspection?.requirePhotos || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        productInspection: {
                          productCategories: question.merchandisingConfig?.productInspection?.productCategories || [],
                          inspectionPoints: question.merchandisingConfig?.productInspection?.inspectionPoints || [],
                          qualityStandards: question.merchandisingConfig?.productInspection?.qualityStandards || [],
                          defectTypes: question.merchandisingConfig?.productInspection?.defectTypes || [],
                          requirePhotos: e.target.checked,
                          requireBarcodeScan: question.merchandisingConfig?.productInspection?.requireBarcodeScan || false,
                          requireQuantityCount: question.merchandisingConfig?.productInspection?.requireQuantityCount || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Photos
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.productInspection?.requireBarcodeScan || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        productInspection: {
                          productCategories: question.merchandisingConfig?.productInspection?.productCategories || [],
                          inspectionPoints: question.merchandisingConfig?.productInspection?.inspectionPoints || [],
                          qualityStandards: question.merchandisingConfig?.productInspection?.qualityStandards || [],
                          defectTypes: question.merchandisingConfig?.productInspection?.defectTypes || [],
                          requirePhotos: question.merchandisingConfig?.productInspection?.requirePhotos || false,
                          requireBarcodeScan: e.target.checked,
                          requireQuantityCount: question.merchandisingConfig?.productInspection?.requireQuantityCount || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Barcode Scan
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.productInspection?.requireQuantityCount || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        productInspection: {
                          productCategories: question.merchandisingConfig?.productInspection?.productCategories || [],
                          inspectionPoints: question.merchandisingConfig?.productInspection?.inspectionPoints || [],
                          qualityStandards: question.merchandisingConfig?.productInspection?.qualityStandards || [],
                          defectTypes: question.merchandisingConfig?.productInspection?.defectTypes || [],
                          requirePhotos: question.merchandisingConfig?.productInspection?.requirePhotos || false,
                          requireBarcodeScan: question.merchandisingConfig?.productInspection?.requireBarcodeScan || false,
                          requireQuantityCount: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Quantity Count
                </label>
              </div>
            </div>
          </div>
        );

      case QuestionType.DISPLAY_EVALUATION:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Types</label>
              <div className="grid grid-cols-2 gap-2">
                {['Window Display', 'In-Store Display', 'End Cap', 'Island Display', 'Wall Display', 'Floor Display', 'Digital Display', 'Interactive Display'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.merchandisingConfig?.displayEvaluation?.displayTypes?.includes(type) || false}
                      onChange={(e) => {
                        const currentTypes = question.merchandisingConfig?.displayEvaluation?.displayTypes || [];
                        const newTypes = e.target.checked 
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        updateQuestion(question.id, {
                          merchandisingConfig: {
                            ...question.merchandisingConfig,
                            displayEvaluation: {
                              displayTypes: newTypes,
                              evaluationCriteria: question.merchandisingConfig?.displayEvaluation?.evaluationCriteria || [],
                              visualElements: question.merchandisingConfig?.displayEvaluation?.visualElements || [],
                              lightingAssessment: question.merchandisingConfig?.displayEvaluation?.lightingAssessment || false,
                              trafficFlowAnalysis: question.merchandisingConfig?.displayEvaluation?.trafficFlowAnalysis || false,
                              competitorComparison: question.merchandisingConfig?.displayEvaluation?.competitorComparison || false
                            }
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Evaluation Requirements</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.displayEvaluation?.lightingAssessment || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        displayEvaluation: {
                          displayTypes: question.merchandisingConfig?.displayEvaluation?.displayTypes || [],
                          evaluationCriteria: question.merchandisingConfig?.displayEvaluation?.evaluationCriteria || [],
                          visualElements: question.merchandisingConfig?.displayEvaluation?.visualElements || [],
                          lightingAssessment: e.target.checked,
                          trafficFlowAnalysis: question.merchandisingConfig?.displayEvaluation?.trafficFlowAnalysis || false,
                          competitorComparison: question.merchandisingConfig?.displayEvaluation?.competitorComparison || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Lighting Assessment
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.displayEvaluation?.trafficFlowAnalysis || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        displayEvaluation: {
                          displayTypes: question.merchandisingConfig?.displayEvaluation?.displayTypes || [],
                          evaluationCriteria: question.merchandisingConfig?.displayEvaluation?.evaluationCriteria || [],
                          visualElements: question.merchandisingConfig?.displayEvaluation?.visualElements || [],
                          lightingAssessment: question.merchandisingConfig?.displayEvaluation?.lightingAssessment || false,
                          trafficFlowAnalysis: e.target.checked,
                          competitorComparison: question.merchandisingConfig?.displayEvaluation?.competitorComparison || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Traffic Flow Analysis
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.displayEvaluation?.competitorComparison || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        displayEvaluation: {
                          displayTypes: question.merchandisingConfig?.displayEvaluation?.displayTypes || [],
                          evaluationCriteria: question.merchandisingConfig?.displayEvaluation?.evaluationCriteria || [],
                          visualElements: question.merchandisingConfig?.displayEvaluation?.visualElements || [],
                          lightingAssessment: question.merchandisingConfig?.displayEvaluation?.lightingAssessment || false,
                          trafficFlowAnalysis: question.merchandisingConfig?.displayEvaluation?.trafficFlowAnalysis || false,
                          competitorComparison: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Competitor Comparison
                </label>
              </div>
            </div>
          </div>
        );

      case QuestionType.INVENTORY_COUNT:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Count Methods</label>
              <div className="grid grid-cols-2 gap-2">
                {['Manual Count', 'Scanner Count', 'Cycle Count', 'Full Count', 'Random Sample', 'ABC Analysis'].map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.merchandisingConfig?.inventoryCount?.countMethods?.includes(method) || false}
                      onChange={(e) => {
                        const currentMethods = question.merchandisingConfig?.inventoryCount?.countMethods || [];
                        const newMethods = e.target.checked 
                          ? [...currentMethods, method]
                          : currentMethods.filter(m => m !== method);
                        updateQuestion(question.id, {
                          merchandisingConfig: {
                            ...question.merchandisingConfig,
                            inventoryCount: {
                              countMethods: newMethods,
                              accuracyThresholds: question.merchandisingConfig?.inventoryCount?.accuracyThresholds || [],
                              requirePhotos: question.merchandisingConfig?.inventoryCount?.requirePhotos || false,
                              requireLocationVerification: question.merchandisingConfig?.inventoryCount?.requireLocationVerification || false,
                              requireDiscrepancyReporting: question.merchandisingConfig?.inventoryCount?.requireDiscrepancyReporting || false
                            }
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Requirements</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.inventoryCount?.requirePhotos || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        inventoryCount: {
                          countMethods: question.merchandisingConfig?.inventoryCount?.countMethods || [],
                          accuracyThresholds: question.merchandisingConfig?.inventoryCount?.accuracyThresholds || [],
                          requirePhotos: e.target.checked,
                          requireLocationVerification: question.merchandisingConfig?.inventoryCount?.requireLocationVerification || false,
                          requireDiscrepancyReporting: question.merchandisingConfig?.inventoryCount?.requireDiscrepancyReporting || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Photos
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.inventoryCount?.requireLocationVerification || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        inventoryCount: {
                          countMethods: question.merchandisingConfig?.inventoryCount?.countMethods || [],
                          accuracyThresholds: question.merchandisingConfig?.inventoryCount?.accuracyThresholds || [],
                          requirePhotos: question.merchandisingConfig?.inventoryCount?.requirePhotos || false,
                          requireLocationVerification: e.target.checked,
                          requireDiscrepancyReporting: question.merchandisingConfig?.inventoryCount?.requireDiscrepancyReporting || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Location Verification
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.inventoryCount?.requireDiscrepancyReporting || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        inventoryCount: {
                          countMethods: question.merchandisingConfig?.inventoryCount?.countMethods || [],
                          accuracyThresholds: question.merchandisingConfig?.inventoryCount?.accuracyThresholds || [],
                          requirePhotos: question.merchandisingConfig?.inventoryCount?.requirePhotos || false,
                          requireLocationVerification: question.merchandisingConfig?.inventoryCount?.requireLocationVerification || false,
                          requireDiscrepancyReporting: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Discrepancy Reporting
                </label>
              </div>
            </div>
          </div>
        );

      case QuestionType.PRICING_VERIFICATION:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pricing Elements</label>
              <div className="grid grid-cols-2 gap-2">
                {['Shelf Tags', 'Display Signs', 'Promotional Materials', 'Digital Displays', 'Price Stickers', 'Barcode Labels', 'Menu Boards', 'Catalog Prices'].map(element => (
                  <label key={element} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.merchandisingConfig?.pricingVerification?.pricingElements?.includes(element) || false}
                      onChange={(e) => {
                        const currentElements = question.merchandisingConfig?.pricingVerification?.pricingElements || [];
                        const newElements = e.target.checked 
                          ? [...currentElements, element]
                          : currentElements.filter(el => el !== element);
                        updateQuestion(question.id, {
                          merchandisingConfig: {
                            ...question.merchandisingConfig,
                            pricingVerification: {
                              pricingElements: newElements,
                              accuracyThresholds: question.merchandisingConfig?.pricingVerification?.accuracyThresholds || [],
                              requirePhotos: question.merchandisingConfig?.pricingVerification?.requirePhotos || false,
                              requireCompetitorComparison: question.merchandisingConfig?.pricingVerification?.requireCompetitorComparison || false,
                              requirePromotionCheck: question.merchandisingConfig?.pricingVerification?.requirePromotionCheck || false
                            }
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    {element}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Verification Requirements</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.pricingVerification?.requirePhotos || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        pricingVerification: {
                          pricingElements: question.merchandisingConfig?.pricingVerification?.pricingElements || [],
                          accuracyThresholds: question.merchandisingConfig?.pricingVerification?.accuracyThresholds || [],
                          requirePhotos: e.target.checked,
                          requireCompetitorComparison: question.merchandisingConfig?.pricingVerification?.requireCompetitorComparison || false,
                          requirePromotionCheck: question.merchandisingConfig?.pricingVerification?.requirePromotionCheck || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Photos
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.pricingVerification?.requireCompetitorComparison || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        pricingVerification: {
                          pricingElements: question.merchandisingConfig?.pricingVerification?.pricingElements || [],
                          accuracyThresholds: question.merchandisingConfig?.pricingVerification?.accuracyThresholds || [],
                          requirePhotos: question.merchandisingConfig?.pricingVerification?.requirePhotos || false,
                          requireCompetitorComparison: e.target.checked,
                          requirePromotionCheck: question.merchandisingConfig?.pricingVerification?.requirePromotionCheck || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Competitor Comparison
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.pricingVerification?.requirePromotionCheck || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        pricingVerification: {
                          pricingElements: question.merchandisingConfig?.pricingVerification?.pricingElements || [],
                          accuracyThresholds: question.merchandisingConfig?.pricingVerification?.accuracyThresholds || [],
                          requirePhotos: question.merchandisingConfig?.pricingVerification?.requirePhotos || false,
                          requireCompetitorComparison: question.merchandisingConfig?.pricingVerification?.requireCompetitorComparison || false,
                          requirePromotionCheck: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Promotion Check
                </label>
              </div>
            </div>
          </div>
        );

      case QuestionType.CUSTOMER_FEEDBACK:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Feedback Types</label>
              <div className="grid grid-cols-2 gap-2">
                {['Product Satisfaction', 'Service Quality', 'Store Experience', 'Display Effectiveness', 'Pricing Perception', 'Staff Interaction', 'Store Cleanliness', 'Overall Satisfaction'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.merchandisingConfig?.customerFeedback?.feedbackTypes?.includes(type) || false}
                      onChange={(e) => {
                        const currentTypes = question.merchandisingConfig?.customerFeedback?.feedbackTypes || [];
                        const newTypes = e.target.checked 
                          ? [...currentTypes, type]
                          : currentTypes.filter(t => t !== type);
                        updateQuestion(question.id, {
                          merchandisingConfig: {
                            ...question.merchandisingConfig,
                            customerFeedback: {
                              feedbackTypes: newTypes,
                              surveyQuestions: question.merchandisingConfig?.customerFeedback?.surveyQuestions || [],
                              requireDemographics: question.merchandisingConfig?.customerFeedback?.requireDemographics || false,
                              requireContactInfo: question.merchandisingConfig?.customerFeedback?.requireContactInfo || false,
                              requireFollowUp: question.merchandisingConfig?.customerFeedback?.requireFollowUp || false
                            }
                          }
                        });
                      }}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Collection Requirements</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.customerFeedback?.requireDemographics || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        customerFeedback: {
                          feedbackTypes: question.merchandisingConfig?.customerFeedback?.feedbackTypes || [],
                          surveyQuestions: question.merchandisingConfig?.customerFeedback?.surveyQuestions || [],
                          requireDemographics: e.target.checked,
                          requireContactInfo: question.merchandisingConfig?.customerFeedback?.requireContactInfo || false,
                          requireFollowUp: question.merchandisingConfig?.customerFeedback?.requireFollowUp || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Demographics
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.customerFeedback?.requireContactInfo || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        customerFeedback: {
                          feedbackTypes: question.merchandisingConfig?.customerFeedback?.feedbackTypes || [],
                          surveyQuestions: question.merchandisingConfig?.customerFeedback?.surveyQuestions || [],
                          requireDemographics: question.merchandisingConfig?.customerFeedback?.requireDemographics || false,
                          requireContactInfo: e.target.checked,
                          requireFollowUp: question.merchandisingConfig?.customerFeedback?.requireFollowUp || false
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Contact Info
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.merchandisingConfig?.customerFeedback?.requireFollowUp || false}
                    onChange={(e) => updateQuestion(question.id, {
                      merchandisingConfig: {
                        ...question.merchandisingConfig,
                        customerFeedback: {
                          feedbackTypes: question.merchandisingConfig?.customerFeedback?.feedbackTypes || [],
                          surveyQuestions: question.merchandisingConfig?.customerFeedback?.surveyQuestions || [],
                          requireDemographics: question.merchandisingConfig?.customerFeedback?.requireDemographics || false,
                          requireContactInfo: question.merchandisingConfig?.customerFeedback?.requireContactInfo || false,
                          requireFollowUp: e.target.checked
                        }
                      }
                    })}
                    className="mr-2"
                  />
                  Require Follow-up
                </label>
              </div>
            </div>
          </div>
        );

      case QuestionType.PHOTO_UPLOAD:
      case QuestionType.FILE_UPLOAD:
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Max Files</label>
              <input
                type="number"
                value={question.maxFiles || 1}
                onChange={(e) => updateQuestion(question.id, { maxFiles: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Max File Size (MB)</label>
              <input
                type="number"
                value={Math.round((question.maxFileSize || 5242880) / 1024 / 1024)}
                onChange={(e) => updateQuestion(question.id, { 
                  maxFileSize: parseInt(e.target.value) * 1024 * 1024 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isTemplate ? 'Create Todo Template' : 'Create Advanced Todo'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              data-testid="header-cancel-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              data-testid="save-todo-button"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'basic', label: 'Basic Info', icon: Settings },
            { id: 'questions', label: 'Questions', icon: Eye },
            { id: 'settings', label: 'Settings', icon: Users },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="todo-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="todo-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter todo title"
              />
            </div>

            <div>
              <label htmlFor="todo-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="todo-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter todo description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="General">General</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Customer Service">Customer Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Questions</h3>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 shadow-sm"
                data-testid="add-question-tab-button"
              >
                <Plus size={16} />
                <span>Add Question</span>
              </button>
            </div>

            {formData.questions?.map((question, index) => renderQuestionEditor(question))}

            {(!formData.questions || formData.questions.length === 0) && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-gray-500">
                  <Plus size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No questions added yet</p>
                  <p className="text-sm mb-4">Start building your todo by adding questions</p>
                  <button
                    onClick={() => setShowQuestionModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                  >
                    <Plus size={16} />
                    <span>Add Your First Question</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Assignment Section */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users size={20} className="mr-2" />
                Assignment Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assign To Users
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                    {/* User Search and Bulk Actions */}
                    <div className="mb-3 space-y-2">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const filteredUsers = users.filter(user => 
                              user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                              user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                              (user.role && user.role.toLowerCase().includes(userSearchTerm.toLowerCase()))
                            );
                            const allFilteredUserIds = filteredUsers.map(u => u.id);
                            setFormData(prev => ({ 
                              ...prev, 
                              assignedTo: Array.from(new Set([...(prev.assignedTo || []), ...allFilteredUserIds]))
                            }));
                          }}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const filteredUsers = users.filter(user => 
                              user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                              user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                              (user.role && user.role.toLowerCase().includes(userSearchTerm.toLowerCase()))
                            );
                            const allFilteredUserIds = filteredUsers.map(u => u.id);
                            setFormData(prev => ({ 
                              ...prev, 
                              assignedTo: (prev.assignedTo || []).filter(id => !allFilteredUserIds.includes(id))
                            }));
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    
                    {(() => {
                      const filteredUsers = users.filter(user => 
                        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        (user.role && user.role.toLowerCase().includes(userSearchTerm.toLowerCase()))
                      );
                      
                      if (filteredUsers.length === 0) {
                        return (
                          <div className="text-center py-4 text-gray-500">
                            <Users size={24} className="mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">
                              {userSearchTerm ? 'No users found matching your search' : 'No users available for assignment'}
                            </p>
                          </div>
                        );
                      }
                      
                      return filteredUsers.map(user => (
                        <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedTo?.includes(user.id)}
                            onChange={(e) => {
                              const newAssignedTo = e.target.checked
                                ? [...(formData.assignedTo || []), user.id]
                                : formData.assignedTo?.filter(id => id !== user.id) || [];
                              setFormData(prev => ({ ...prev, assignedTo: newAssignedTo }));
                            }}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            <span className="text-xs text-gray-500 block">{user.email}</span>
                            {user.role && (
                              <span className="text-xs text-gray-400 block">{user.role}</span>
                            )}
                          </div>
                          {formData.assignedTo?.includes(user.id) && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Assigned
                            </span>
                          )}
                        </label>
                      ));
                    })()}
                  </div>
                  
                  {formData.assignedTo && formData.assignedTo.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Assigned to {formData.assignedTo.length} user(s):</strong>
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {formData.assignedTo.map(userId => {
                          const user = users.find(u => u.id === userId);
                          return user ? (
                            <span key={userId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {user.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignment Options */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Assignment Options</h4>
                    <div className="text-xs text-gray-500">
                      {[
                        formData.requireApproval && 'Approval Required',
                        formData.allowReassignment && 'Reassignment Allowed',
                        formData.autoComplete && 'Auto-complete Enabled'
                      ].filter(Boolean).join(', ') || 'No options selected'}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors">
                      <input
                        type="checkbox"
                        id="require-approval"
                        checked={formData.requireApproval || false}
                        onChange={(e) => {
                          console.log('Require approval changed:', e.target.checked);
                          setFormData(prev => ({ ...prev, requireApproval: e.target.checked }));
                        }}
                        className="mr-3 mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="require-approval" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">Require approval before completion</div>
                        <div className="text-xs text-gray-500 mt-1">Todos must be approved by a supervisor before being marked as complete</div>
                      </label>
                    </div>

                    <div className="flex items-start p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors">
                      <input
                        type="checkbox"
                        id="allow-reassignment"
                        checked={formData.allowReassignment || false}
                        onChange={(e) => {
                          console.log('Allow reassignment changed:', e.target.checked);
                          setFormData(prev => ({ ...prev, allowReassignment: e.target.checked }));
                        }}
                        className="mr-3 mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="allow-reassignment" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">Allow reassignment</div>
                        <div className="text-xs text-gray-500 mt-1">Users can reassign this todo to other team members if needed</div>
                      </label>
                    </div>

                    <div className="flex items-start p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-colors">
                      <input
                        type="checkbox"
                        id="auto-complete"
                        checked={formData.autoComplete || false}
                        onChange={(e) => {
                          console.log('Auto complete changed:', e.target.checked);
                          setFormData(prev => ({ ...prev, autoComplete: e.target.checked }));
                        }}
                        className="mr-3 mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="auto-complete" className="flex-1 cursor-pointer">
                        <div className="text-sm font-medium text-gray-900">Auto-complete when all questions answered</div>
                        <div className="text-xs text-gray-500 mt-1">Todo will be automatically marked as complete when all required questions are answered</div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">{formData.title || 'Untitled Todo'}</h3>
              {formData.description && (
                <p className="text-gray-600 mb-4">{formData.description}</p>
              )}
              
              <div className="space-y-4">
                {formData.questions?.map((question, index) => (
                  <div key={question.id} className="bg-white p-4 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Q{index + 1}: {question.title}</span>
                      {question.required && <span className="text-red-500 text-sm">*</span>}
                    </div>
                    {question.description && (
                      <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      Type: {getQuestionTypeLabel(question.type)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Type Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" data-testid="question-modal">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add Question</h3>
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setQuestionType(QuestionType.TEXT_ANSWER); // Reset selection
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {renderQuestionTypeSelector()}

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setQuestionType(QuestionType.TEXT_ANSWER); // Reset selection
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                data-testid="modal-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={addQuestion}
                disabled={!questionType}
                className={`px-4 py-2 rounded-md ${
                  questionType 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                data-testid="add-question-modal-button"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTodoCreator; 