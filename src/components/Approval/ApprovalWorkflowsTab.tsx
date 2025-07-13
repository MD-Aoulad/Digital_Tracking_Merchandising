/**
 * Approval Workflows Tab Component
 * 
 * Allows administrators to configure approval workflows:
 * - Create and edit approval workflows
 * - Configure workflow steps and approvers
 * - Set up auto-approval conditions
 * - Manage escalation rules
 * - Create workflow templates
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ApprovalWorkflow, 
  ApprovalRequestType,
  ApprovalStep,
  ApproverType,
  ApprovalAction,
  AutoApproveCondition,
  EscalationRule 
} from '../../types';

interface ApprovalWorkflowsTabProps {
  // Component props if needed
}

const ApprovalWorkflowsTab: React.FC<ApprovalWorkflowsTabProps> = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New workflow form state
  const [newWorkflow, setNewWorkflow] = useState<Partial<ApprovalWorkflow>>({
    name: '',
    description: '',
    type: ApprovalRequestType.LEAVE_REQUEST,
    steps: [],
    allowSelfApproval: false,
    allowDelegation: false,
    autoApprove: false,
    isActive: true
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/approvals/workflows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      } else {
        console.error('Failed to load workflows');
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const response = await fetch('/api/approvals/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newWorkflow)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewWorkflow({
          name: '',
          description: '',
          type: ApprovalRequestType.LEAVE_REQUEST,
          steps: [],
          allowSelfApproval: false,
          allowDelegation: false,
          autoApprove: false,
          isActive: true
        });
        loadWorkflows();
      } else {
        console.error('Failed to create workflow');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const response = await fetch(`/api/approvals/workflows/${selectedWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedWorkflow)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedWorkflow(null);
        loadWorkflows();
      } else {
        console.error('Failed to update workflow');
      }
    } catch (error) {
      console.error('Error updating workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(`/api/approvals/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadWorkflows();
      } else {
        console.error('Failed to delete workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const addStep = () => {
    const newStep: ApprovalStep = {
      id: `step-${Date.now()}`,
      stepNumber: (newWorkflow.steps?.length || 0) + 1,
      name: '',
      description: '',
      approverType: ApproverType.MANAGER,
      isRequired: true,
      canDelegate: false,
      actions: [
        {
          id: 'approve',
          name: 'Approve',
          type: 'approve',
          label: 'Approve',
          icon: '✅',
          color: 'green',
          requiresComment: false,
          isPrimary: true
        },
        {
          id: 'reject',
          name: 'Reject',
          type: 'reject',
          label: 'Reject',
          icon: '❌',
          color: 'red',
          requiresComment: true,
          isPrimary: false
        }
      ]
    };

    setNewWorkflow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  };

  const removeStep = (stepIndex: number) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, index) => index !== stepIndex)
    }));
  };

  const updateStep = (stepIndex: number, field: string, value: any) => {
    setNewWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            Only administrators can configure approval workflows.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading workflows...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Workflows</h2>
          <p className="text-gray-600">
            Configure approval workflows and templates for different request types
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Create Workflow
          </button>
          <button
            onClick={loadWorkflows}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Create your first approval workflow to get started.'}
            </p>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{workflow.name}</h3>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Type:</span> {workflow.type.replace('_', ' ')}
                </div>
                <div>
                  <span className="font-medium">Steps:</span> {workflow.steps.length}
                </div>
                <div>
                  <span className="font-medium">Self-Approval:</span> {workflow.allowSelfApproval ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Delegation:</span> {workflow.allowDelegation ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Approval Workflow</h3>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    value={newWorkflow.type}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, type: e.target.value as ApprovalRequestType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(ApprovalRequestType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter workflow description"
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Workflow Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Allow Self-Approval</h5>
                    <p className="text-xs text-gray-600">Allow approvers to approve their own requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWorkflow.allowSelfApproval}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, allowSelfApproval: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Allow Delegation</h5>
                    <p className="text-xs text-gray-600">Allow approvers to delegate their approval authority</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWorkflow.allowDelegation}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, allowDelegation: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Auto-Approve</h5>
                    <p className="text-xs text-gray-600">Automatically approve certain requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWorkflow.autoApprove}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, autoApprove: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Workflow Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Workflow Steps</h4>
                  <button
                    onClick={addStep}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    ➕ Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {newWorkflow.steps?.map((step, index) => (
                    <div key={step.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">Step {step.stepNumber}</h5>
                        <button
                          onClick={() => removeStep(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️ Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Step Name
                          </label>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => updateStep(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter step name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Approver Type
                          </label>
                          <select
                            value={step.approverType}
                            onChange={(e) => updateStep(index, 'approverType', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {Object.values(ApproverType).map((type) => (
                              <option key={type} value={type}>
                                {type.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={step.description}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter step description"
                          />
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={step.isRequired}
                              onChange={(e) => updateStep(index, 'isRequired', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-xs text-gray-700">Required</span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={step.canDelegate}
                              onChange={(e) => updateStep(index, 'canDelegate', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-xs text-gray-700">Can Delegate</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workflow Modal */}
      {showEditModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Approval Workflow</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={selectedWorkflow.name}
                    onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    value={selectedWorkflow.type}
                    onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, type: e.target.value as ApprovalRequestType } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(ApprovalRequestType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={selectedWorkflow.description}
                  onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Workflow Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Allow Self-Approval</h5>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWorkflow.allowSelfApproval}
                      onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, allowSelfApproval: e.target.checked } : null)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Allow Delegation</h5>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWorkflow.allowDelegation}
                      onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, allowDelegation: e.target.checked } : null)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Auto-Approve</h5>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWorkflow.autoApprove}
                      onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, autoApprove: e.target.checked } : null)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Workflow Steps ({selectedWorkflow.steps.length})</h4>
                <div className="space-y-3">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            Step {step.stepNumber}: {step.name}
                          </h5>
                          <p className="text-xs text-gray-600">{step.description}</p>
                          <p className="text-xs text-gray-500">
                            Approver: {step.approverType.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.isRequired ? 'Required' : 'Optional'} • {step.canDelegate ? 'Can Delegate' : 'No Delegation'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWorkflow(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Update Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflowsTab; 