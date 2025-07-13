/**
 * Advanced Todo Response Component
 * 
 * This component allows employees to respond to advanced todos with various question types.
 * It dynamically renders form fields based on the question type and handles validation,
 * file uploads, and conditional logic.
 * 
 * Features:
 * - Dynamic form rendering based on question type
 * - Real-time validation
 * - File and photo upload support
 * - GPS location capture
 * - Conditional question display
 * - Auto-save functionality
 * - Progress tracking
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Camera, 
  MapPin, 
  Upload, 
  Check, 
  X, 
  Save,
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  TodoQuestion, 
  QuestionType, 
  TodoResponse,
  TodoSubmission,
  RatingScale
} from '../../types';

interface AdvancedTodoResponseProps {
  todo: any; // AdvancedTodo type
  onSubmit: (submission: TodoSubmission) => void;
  onSaveDraft: (submission: TodoSubmission) => void;
  initialResponses?: TodoResponse[];
}

const AdvancedTodoResponse: React.FC<AdvancedTodoResponseProps> = ({
  todo,
  onSubmit,
  onSaveDraft,
  initialResponses = []
}) => {
  // State
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [progress, setProgress] = useState(0);

  // Refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cameraRef = useRef<HTMLVideoElement>(null);

  // Memoize questions to prevent infinite loops
  const memoizedQuestions = useMemo(() => todo.questions || [], [todo.questions]);

  // Initialize responses from props
  useEffect(() => {
    const initialResponsesMap: Record<string, any> = {};
    initialResponses.forEach(response => {
      initialResponsesMap[response.questionId] = response.answer;
    });
    setResponses(initialResponsesMap);
  }, [initialResponses]);

  // Calculate progress
  useEffect(() => {
    const requiredQuestions = memoizedQuestions.filter((q: TodoQuestion) => q.required);
    const answeredRequired = requiredQuestions.filter((q: TodoQuestion) => 
      responses[q.id] !== undefined && responses[q.id] !== null && responses[q.id] !== ''
    ).length;
    
    const progressPercent = requiredQuestions.length > 0 
      ? (answeredRequired / requiredQuestions.length) * 100 
      : 0;
    
    setProgress(Math.round(progressPercent));
  }, [responses, memoizedQuestions]);

  /**
   * Update response for a question
   */
  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (questionId: string, files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const question = memoizedQuestions.find((q: TodoQuestion) => q.id === questionId);
    
    if (!question) return;

    // Validate file size
    const maxSize = question.maxFileSize || 5 * 1024 * 1024; // 5MB default
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        [questionId]: `Files exceed maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`
      }));
      return;
    }

    // Validate file count
    const maxFiles = question.maxFiles || 1;
    if (fileArray.length > maxFiles) {
      setErrors(prev => ({
        ...prev,
        [questionId]: `Maximum ${maxFiles} file(s) allowed`
      }));
      return;
    }

    setFiles(prev => ({
      ...prev,
      [questionId]: fileArray
    }));

    // Update response with file names
    updateResponse(questionId, fileArray.map(f => f.name));
  };

  /**
   * Capture photo using camera
   */
  const capturePhoto = async (questionId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [questionId]: 'Camera access denied'
      }));
    }
  };

  /**
   * Take photo from camera stream
   */
  const takePhoto = (questionId: string) => {
    if (!cameraRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = cameraRef.current.videoWidth;
    canvas.height = cameraRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(cameraRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFiles(prev => ({
            ...prev,
            [questionId]: [file]
          }));
          updateResponse(questionId, file.name);
        }
      }, 'image/jpeg');
    }

    // Stop camera stream
    const stream = cameraRef.current.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  /**
   * Get current GPS location
   */
  const getLocation = (questionId: string) => {
    if (!navigator.geolocation) {
      setErrors(prev => ({
        ...prev,
        [questionId]: 'Geolocation not supported'
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        updateResponse(questionId, location);
      },
      (error) => {
        setErrors(prev => ({
          ...prev,
          [questionId]: 'Unable to get location'
        }));
      }
    );
  };

  /**
   * Validate all responses
   */
  const validateResponses = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    memoizedQuestions.forEach((question: TodoQuestion) => {
      if (question.required) {
        const response = responses[question.id];
        
        if (response === undefined || response === null || response === '') {
          newErrors[question.id] = 'This field is required';
        } else if (question.validation) {
          // Custom validation
          if (question.validation.minLength && response.length < question.validation.minLength) {
            newErrors[question.id] = `Minimum ${question.validation.minLength} characters required`;
          }
          if (question.validation.maxLength && response.length > question.validation.maxLength) {
            newErrors[question.id] = `Maximum ${question.validation.maxLength} characters allowed`;
          }
          if (question.validation.minValue && response < question.validation.minValue) {
            newErrors[question.id] = `Minimum value is ${question.validation.minValue}`;
          }
          if (question.validation.maxValue && response > question.validation.maxValue) {
            newErrors[question.id] = `Maximum value is ${question.validation.maxValue}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Save as draft
   */
  const handleSaveDraft = () => {
    const submission: TodoSubmission = {
      id: `submission_${Date.now()}`,
      todoId: todo.id,
      userId: 'current_user_id', // TODO: Get from auth context
      responses: Object.keys(responses).map(questionId => ({
        id: `response_${questionId}_${Date.now()}`,
        todoId: todo.id,
        userId: 'current_user_id',
        questionId,
        answer: responses[questionId],
        files: files[questionId]?.map(f => f.name) || [],
        metadata: {
          timestamp: new Date().toISOString(),
          deviceInfo: navigator.userAgent
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveDraft(submission);
  };

  /**
   * Submit responses
   */
  const handleSubmit = async () => {
    if (!validateResponses()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Upload files to server
      const uploadedFiles: Record<string, string[]> = {};
      
      // Create submission
      const submission: TodoSubmission = {
        id: `submission_${Date.now()}`,
        todoId: todo.id,
        userId: 'current_user_id', // TODO: Get from auth context
        responses: Object.keys(responses).map(questionId => ({
          id: `response_${questionId}_${Date.now()}`,
          todoId: todo.id,
          userId: 'current_user_id',
          questionId,
          answer: responses[questionId],
          files: uploadedFiles[questionId] || [],
          metadata: {
            location: currentLocation ? {
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
              accuracy: 10
            } : undefined,
            timestamp: new Date().toISOString(),
            deviceInfo: navigator.userAgent
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSubmit(submission);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render individual question based on type
   */
  const renderQuestion = (question: TodoQuestion, index: number) => {
    const hasError = errors[question.id];
    const response = responses[question.id];

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(response) && response.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(response) ? response : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    updateResponse(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option.id} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={response === option.value}
                  onChange={(e) => updateResponse(question.id, e.target.value)}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case QuestionType.TEXT_ANSWER:
        return (
          <input
            type="text"
            value={response || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder || 'Enter your answer'}
            className={baseClasses}
          />
        );

      case QuestionType.TEXTAREA_ANSWER:
        return (
          <textarea
            value={response || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder={question.placeholder || 'Enter your detailed answer'}
            className={baseClasses}
            rows={4}
          />
        );

      case QuestionType.NUMBER_INPUT:
        return (
          <input
            type="number"
            value={response || ''}
            onChange={(e) => updateResponse(question.id, parseFloat(e.target.value) || 0)}
            placeholder={question.placeholder || 'Enter a number'}
            className={baseClasses}
          />
        );

      case QuestionType.PHOTO_UPLOAD:
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              multiple={question.maxFiles ? question.maxFiles > 1 : false}
              onChange={(e) => handleFileUpload(question.id, e.target.files)}
              className="hidden"
              ref={(input) => {
                fileInputRefs.current[question.id] = input;
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current[question.id]?.click()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Camera size={16} />
              <span>Upload Photos</span>
            </button>
            {files[question.id] && (
              <div className="space-y-2">
                {Array.from(files[question.id]).map((file, fileIndex) => (
                  <div key={fileIndex} className="flex items-center space-x-2">
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = Array.from(files[question.id]).filter((_, i) => i !== fileIndex);
                        setFiles(prev => ({ ...prev, [question.id]: newFiles }));
                        updateResponse(question.id, newFiles.map(f => f.name));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case QuestionType.LOCATION:
        return (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => getLocation(question.id)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <MapPin size={16} />
              <span>Get Current Location</span>
            </button>
            {currentLocation && (
              <div className="text-sm text-gray-600">
                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
              </div>
            )}
          </div>
        );

      case QuestionType.DATE_TIME:
        return (
          <input
            type="datetime-local"
            value={response || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            className={baseClasses}
          />
        );

      case QuestionType.RATING_SCALE:
        const min = question.ratingScale?.min || 1;
        const max = question.ratingScale?.max || 5;
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(rating => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={rating}
                    checked={response === rating}
                    onChange={(e) => updateResponse(question.id, parseInt(e.target.value))}
                    className="mr-1"
                  />
                  {rating}
                </label>
              ))}
            </div>
            {question.ratingScale?.labels && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>{question.ratingScale.labels.min}</span>
                <span>{question.ratingScale.labels.max}</span>
              </div>
            )}
          </div>
        );

      case QuestionType.CHECKLIST:
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(response) && response.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(response) ? response : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    updateResponse(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case QuestionType.SIGNATURE:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <span className="text-gray-500">Signature capture will be implemented</span>
          </div>
        );

      case QuestionType.FILE_UPLOAD:
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept={question.fileTypes?.join(',')}
              multiple={question.maxFiles ? question.maxFiles > 1 : false}
              onChange={(e) => handleFileUpload(question.id, e.target.files)}
              className="hidden"
              ref={(input) => {
                fileInputRefs.current[question.id] = input;
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current[question.id]?.click()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Upload size={16} />
              <span>Upload Files</span>
            </button>
            {files[question.id] && (
              <div className="space-y-2">
                {Array.from(files[question.id]).map((file, fileIndex) => (
                  <div key={fileIndex} className="flex items-center space-x-2">
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = Array.from(files[question.id]).filter((_, i) => i !== fileIndex);
                        setFiles(prev => ({ ...prev, [question.id]: newFiles }));
                        updateResponse(question.id, newFiles.map(f => f.name));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case QuestionType.YES_NO:
        return (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value="yes"
                checked={response === 'yes'}
                onChange={(e) => updateResponse(question.id, e.target.value)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value="no"
                checked={response === 'no'}
                onChange={(e) => updateResponse(question.id, e.target.value)}
                className="mr-2"
              />
              No
            </label>
          </div>
        );

      case QuestionType.SLIDER:
        const sliderMin = question.validation?.minValue || 0;
        const sliderMax = question.validation?.maxValue || 100;
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              value={response || sliderMin}
              onChange={(e) => updateResponse(question.id, parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{sliderMin}</span>
              <span>{response || sliderMin}</span>
              <span>{sliderMax}</span>
            </div>
          </div>
        );

      // Merchandising-specific question types
      case QuestionType.PRODUCT_INSPECTION:
        return (
          <div className="space-y-4">
            {/* Product Categories */}
            {question.merchandisingConfig?.productInspection?.productCategories && (
              <div>
                <label className="block text-sm font-medium mb-2">Product Categories to Inspect</label>
                <div className="grid grid-cols-2 gap-2">
                  {question.merchandisingConfig.productInspection.productCategories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={Array.isArray(response?.categories) && response.categories.includes(category)}
                        onChange={(e) => {
                          const currentCategories = Array.isArray(response?.categories) ? response.categories : [];
                          const newCategories = e.target.checked
                            ? [...currentCategories, category]
                            : currentCategories.filter((c: string) => c !== category);
                          updateResponse(question.id, { ...response, categories: newCategories });
                        }}
                        className="mr-2"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection Points */}
            <div>
              <label className="block text-sm font-medium mb-2">Inspection Points</label>
              <div className="space-y-2">
                {['Packaging', 'Quality', 'Expiry Date', 'Damage', 'Cleanliness', 'Labeling', 'Functionality'].map(point => (
                  <div key={point} className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{point}</span>
                      <select
                        value={response?.inspectionPoints?.[point] || 'pass'}
                        onChange={(e) => {
                          const currentPoints = response?.inspectionPoints || {};
                          updateResponse(question.id, {
                            ...response,
                            inspectionPoints: { ...currentPoints, [point]: e.target.value }
                          });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                        <option value="needs_attention">Needs Attention</option>
                      </select>
                    </div>
                    <textarea
                      placeholder={`Notes for ${point}`}
                      value={response?.notes?.[point] || ''}
                      onChange={(e) => {
                        const currentNotes = response?.notes || {};
                        updateResponse(question.id, {
                          ...response,
                          notes: { ...currentNotes, [point]: e.target.value }
                        });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Requirements */}
            {question.merchandisingConfig?.productInspection?.requirePhotos && (
              <div>
                <label className="block text-sm font-medium mb-2">Product Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(question.id, e.target.files)}
                  className="hidden"
                  ref={(input) => {
                    fileInputRefs.current[question.id] = input;
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[question.id]?.click()}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Camera size={16} />
                  <span>Upload Product Photos</span>
                </button>
              </div>
            )}

            {/* Quantity Count */}
            {question.merchandisingConfig?.productInspection?.requireQuantityCount && (
              <div>
                <label className="block text-sm font-medium mb-2">Quantity Count</label>
                <input
                  type="number"
                  value={response?.quantity || ''}
                  onChange={(e) => updateResponse(question.id, { ...response, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>
        );

      case QuestionType.DISPLAY_EVALUATION:
        return (
          <div className="space-y-4">
            {/* Display Types */}
            {question.merchandisingConfig?.displayEvaluation?.displayTypes && (
              <div>
                <label className="block text-sm font-medium mb-2">Display Types Evaluated</label>
                <div className="grid grid-cols-2 gap-2">
                  {question.merchandisingConfig.displayEvaluation.displayTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={Array.isArray(response?.displayTypes) && response.displayTypes.includes(type)}
                        onChange={(e) => {
                          const currentTypes = Array.isArray(response?.displayTypes) ? response.displayTypes : [];
                          const newTypes = e.target.checked
                            ? [...currentTypes, type]
                            : currentTypes.filter((t: string) => t !== type);
                          updateResponse(question.id, { ...response, displayTypes: newTypes });
                        }}
                        className="mr-2"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation Criteria */}
            <div>
              <label className="block text-sm font-medium mb-2">Display Evaluation</label>
              <div className="space-y-3">
                {['Visual Appeal', 'Product Visibility', 'Brand Consistency', 'Customer Engagement', 'Sales Impact'].map(criteria => (
                  <div key={criteria} className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{criteria}</span>
                      <select
                        value={response?.evaluation?.[criteria] || 'excellent'}
                        onChange={(e) => {
                          const currentEvaluation = response?.evaluation || {};
                          updateResponse(question.id, {
                            ...response,
                            evaluation: { ...currentEvaluation, [criteria]: e.target.value }
                          });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <textarea
                      placeholder={`Comments for ${criteria}`}
                      value={response?.comments?.[criteria] || ''}
                      onChange={(e) => {
                        const currentComments = response?.comments || {};
                        updateResponse(question.id, {
                          ...response,
                          comments: { ...currentComments, [criteria]: e.target.value }
                        });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lighting Assessment */}
            {question.merchandisingConfig?.displayEvaluation?.lightingAssessment && (
              <div>
                <label className="block text-sm font-medium mb-2">Lighting Assessment</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`${question.id}_lighting`}
                      value="adequate"
                      checked={response?.lighting === 'adequate'}
                      onChange={(e) => updateResponse(question.id, { ...response, lighting: e.target.value })}
                      className="mr-2"
                    />
                    Adequate
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`${question.id}_lighting`}
                      value="needs_improvement"
                      checked={response?.lighting === 'needs_improvement'}
                      onChange={(e) => updateResponse(question.id, { ...response, lighting: e.target.value })}
                      className="mr-2"
                    />
                    Needs Improvement
                  </label>
                  <textarea
                    placeholder="Lighting comments"
                    value={response?.lightingComments || ''}
                    onChange={(e) => updateResponse(question.id, { ...response, lightingComments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case QuestionType.INVENTORY_COUNT:
        return (
          <div className="space-y-4">
            {/* Count Method */}
            <div>
              <label className="block text-sm font-medium mb-2">Count Method</label>
              <select
                value={response?.countMethod || 'manual'}
                onChange={(e) => updateResponse(question.id, { ...response, countMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="manual">Manual Count</option>
                <option value="scanner">Scanner Count</option>
                <option value="cycle">Cycle Count</option>
                <option value="full">Full Count</option>
              </select>
            </div>

            {/* Inventory Items */}
            <div>
              <label className="block text-sm font-medium mb-2">Inventory Count</label>
              <div className="space-y-2">
                {['SKU', 'Product Name', 'Expected Quantity', 'Actual Quantity', 'Variance'].map((field, index) => (
                  <div key={field} className="grid grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="SKU"
                      value={response?.items?.[index]?.sku || ''}
                      onChange={(e) => {
                        const currentItems = response?.items || [];
                        const newItems = [...currentItems];
                        newItems[index] = { ...newItems[index], sku: e.target.value };
                        updateResponse(question.id, { ...response, items: newItems });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={response?.items?.[index]?.name || ''}
                      onChange={(e) => {
                        const currentItems = response?.items || [];
                        const newItems = [...currentItems];
                        newItems[index] = { ...newItems[index], name: e.target.value };
                        updateResponse(question.id, { ...response, items: newItems });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Expected"
                      value={response?.items?.[index]?.expected || ''}
                      onChange={(e) => {
                        const currentItems = response?.items || [];
                        const newItems = [...currentItems];
                        newItems[index] = { ...newItems[index], expected: parseInt(e.target.value) || 0 };
                        updateResponse(question.id, { ...response, items: newItems });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Actual"
                      value={response?.items?.[index]?.actual || ''}
                      onChange={(e) => {
                        const currentItems = response?.items || [];
                        const newItems = [...currentItems];
                        newItems[index] = { ...newItems[index], actual: parseInt(e.target.value) || 0 };
                        updateResponse(question.id, { ...response, items: newItems });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Variance"
                      value={response?.items?.[index]?.variance || ''}
                      readOnly
                      className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Discrepancy Reporting */}
            {question.merchandisingConfig?.inventoryCount?.requireDiscrepancyReporting && (
              <div>
                <label className="block text-sm font-medium mb-2">Discrepancy Report</label>
                <textarea
                  placeholder="Report any discrepancies found during counting"
                  value={response?.discrepancyReport || ''}
                  onChange={(e) => updateResponse(question.id, { ...response, discrepancyReport: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            )}
          </div>
        );

      case QuestionType.PRICING_VERIFICATION:
        return (
          <div className="space-y-4">
            {/* Pricing Elements */}
            {question.merchandisingConfig?.pricingVerification?.pricingElements && (
              <div>
                <label className="block text-sm font-medium mb-2">Pricing Elements Verified</label>
                <div className="grid grid-cols-2 gap-2">
                  {question.merchandisingConfig.pricingVerification.pricingElements.map(element => (
                    <label key={element} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={Array.isArray(response?.verifiedElements) && response.verifiedElements.includes(element)}
                        onChange={(e) => {
                          const currentElements = Array.isArray(response?.verifiedElements) ? response.verifiedElements : [];
                          const newElements = e.target.checked
                            ? [...currentElements, element]
                            : currentElements.filter((el: string) => el !== element);
                          updateResponse(question.id, { ...response, verifiedElements: newElements });
                        }}
                        className="mr-2"
                      />
                      {element}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Verification Table */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Verification</label>
              <div className="space-y-2">
                {['Product', 'Expected Price', 'Displayed Price', 'Status', 'Notes'].map((field, index) => (
                  <div key={field} className="grid grid-cols-5 gap-2">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={response?.prices?.[index]?.product || ''}
                      onChange={(e) => {
                        const currentPrices = response?.prices || [];
                        const newPrices = [...currentPrices];
                        newPrices[index] = { ...newPrices[index], product: e.target.value };
                        updateResponse(question.id, { ...response, prices: newPrices });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Expected"
                      value={response?.prices?.[index]?.expected || ''}
                      onChange={(e) => {
                        const currentPrices = response?.prices || [];
                        const newPrices = [...currentPrices];
                        newPrices[index] = { ...newPrices[index], expected: parseFloat(e.target.value) || 0 };
                        updateResponse(question.id, { ...response, prices: newPrices });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Displayed"
                      value={response?.prices?.[index]?.displayed || ''}
                      onChange={(e) => {
                        const currentPrices = response?.prices || [];
                        const newPrices = [...currentPrices];
                        newPrices[index] = { ...newPrices[index], displayed: parseFloat(e.target.value) || 0 };
                        updateResponse(question.id, { ...response, prices: newPrices });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <select
                      value={response?.prices?.[index]?.status || 'correct'}
                      onChange={(e) => {
                        const currentPrices = response?.prices || [];
                        const newPrices = [...currentPrices];
                        newPrices[index] = { ...newPrices[index], status: e.target.value };
                        updateResponse(question.id, { ...response, prices: newPrices });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="correct">Correct</option>
                      <option value="incorrect">Incorrect</option>
                      <option value="missing">Missing</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Notes"
                      value={response?.prices?.[index]?.notes || ''}
                      onChange={(e) => {
                        const currentPrices = response?.prices || [];
                        const newPrices = [...currentPrices];
                        newPrices[index] = { ...newPrices[index], notes: e.target.value };
                        updateResponse(question.id, { ...response, prices: newPrices });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case QuestionType.CUSTOMER_FEEDBACK:
        return (
          <div className="space-y-4">
            {/* Feedback Type */}
            {question.merchandisingConfig?.customerFeedback?.feedbackTypes && (
              <div>
                <label className="block text-sm font-medium mb-2">Feedback Type</label>
                <select
                  value={response?.feedbackType || ''}
                  onChange={(e) => updateResponse(question.id, { ...response, feedbackType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select feedback type</option>
                  {question.merchandisingConfig.customerFeedback.feedbackTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer Satisfaction */}
            <div>
              <label className="block text-sm font-medium mb-2">Overall Satisfaction</label>
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4, 5].map(rating => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name={`${question.id}_satisfaction`}
                      value={rating}
                      checked={response?.satisfaction === rating}
                      onChange={(e) => updateResponse(question.id, { ...response, satisfaction: parseInt(e.target.value) })}
                      className="mr-1"
                    />
                    {rating}
                  </label>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Dissatisfied</span>
                <span>Very Satisfied</span>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div>
              <label className="block text-sm font-medium mb-2">Detailed Feedback</label>
              <textarea
                placeholder="Please provide detailed feedback about your experience"
                value={response?.detailedFeedback || ''}
                onChange={(e) => updateResponse(question.id, { ...response, detailedFeedback: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>

            {/* Demographics */}
            {question.merchandisingConfig?.customerFeedback?.requireDemographics && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age Group</label>
                  <select
                    value={response?.ageGroup || ''}
                    onChange={(e) => updateResponse(question.id, { ...response, ageGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select age group</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={response?.gender || ''}
                    onChange={(e) => updateResponse(question.id, { ...response, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-gray-500 italic">
            Question type "{question.type}" is not yet implemented
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{todo.title}</h1>
            {todo.description && (
              <p className="text-gray-600 mt-1">{todo.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Progress: {progress}%
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {memoizedQuestions.map((question: TodoQuestion, index: number) => 
            renderQuestion(question, index)
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || progress < 100}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Camera modal */}
      <div className="hidden">
        <video
          ref={cameraRef}
          autoPlay
          playsInline
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default AdvancedTodoResponse; 