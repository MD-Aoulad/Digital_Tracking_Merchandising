/**
 * Approval Page Component
 * 
 * Main approval management page with tabs for:
 * - Approval Requests (pending, approved, rejected)
 * - Approval Settings (self-approval, delegation)
 * - Delegation Management
 * - Approval Workflows
 * - Approval Statistics
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ApprovalRequest, 
  ApprovalStatus, 
  ApprovalRequestType,
  ApprovalSettings,
  DelegationInfo,
  ApprovalStats 
} from '../../types';
import ApprovalRequestsTab from './ApprovalRequestsTab';
import ApprovalSettingsTab from './ApprovalSettingsTab';
import DelegationManagementTab from './DelegationManagementTab';
import ApprovalWorkflowsTab from './ApprovalWorkflowsTab';
import ApprovalStatsTab from './ApprovalStatsTab';

interface ApprovalPageProps {
  // Component props if needed
}

const ApprovalPage: React.FC<ApprovalPageProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [isLoading, setIsLoading] = useState(true);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
  const [approvalSettings, setApprovalSettings] = useState<ApprovalSettings | null>(null);

  // Tab configuration
  const tabs = [
    {
      id: 'requests',
      label: 'Approval Requests',
      icon: '📋',
      description: 'Manage pending, approved, and rejected requests',
      requiresPermission: true
    },
    {
      id: 'settings',
      label: 'Approval Settings',
      icon: '⚙️',
      description: 'Configure self-approval and delegation policies',
      requiresPermission: user?.role === 'admin'
    },
    {
      id: 'delegation',
      label: 'Delegation Management',
      icon: '🔄',
      description: 'Manage approval authority delegations',
      requiresPermission: true
    },
    {
      id: 'workflows',
      label: 'Approval Workflows',
      icon: '🔄',
      description: 'Configure approval workflows and templates',
      requiresPermission: user?.role === 'admin'
    },
    {
      id: 'stats',
      label: 'Approval Statistics',
      icon: '📊',
      description: 'View approval metrics and reports',
      requiresPermission: true
    }
  ];

  useEffect(() => {
    loadApprovalData();
  }, []);

  const loadApprovalData = async () => {
    try {
      setIsLoading(true);
      
      // Load approval statistics
      const statsResponse = await fetch('/api/approvals/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setApprovalStats(stats);
      }

      // Load approval settings (admin only)
      if (user?.role === 'admin') {
        const settingsResponse = await fetch('/api/approvals/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setApprovalSettings(settings);
        }
      }
    } catch (error) {
      console.error('Error loading approval data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'requests':
        return <ApprovalRequestsTab />;
      case 'settings':
        return <ApprovalSettingsTab 
          settings={approvalSettings} 
          onSettingsUpdate={loadApprovalData}
        />;
      case 'delegation':
        return <DelegationManagementTab />;
      case 'workflows':
        return <ApprovalWorkflowsTab />;
      case 'stats':
        return <ApprovalStatsTab stats={approvalStats} />;
      default:
        return <ApprovalRequestsTab />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approval system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Approval Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage approval requests, configure workflows, and handle delegations
                </p>
              </div>
              
              {/* Quick Stats */}
              {approvalStats && (
                <div className="flex space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {approvalStats.pendingRequests}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {approvalStats.approvedRequests}
                    </div>
                    <div className="text-sm text-gray-500">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {approvalStats.rejectedRequests}
                    </div>
                    <div className="text-sm text-gray-500">Rejected</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              if (!tab.requiresPermission) return null;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>

      {/* Help Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            💡 Approval System Help
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Self-Approval</h4>
              <p className="text-blue-700 text-sm">
                When enabled, approvers can approve their own requests. Only administrators can configure this setting.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Delegation</h4>
              <p className="text-blue-700 text-sm">
                Approvers can delegate their approval authority to other managers or leaders for specific periods.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Workflows</h4>
              <p className="text-blue-700 text-sm">
                Configure multi-step approval processes with different approvers for each step.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Statistics</h4>
              <p className="text-blue-700 text-sm">
                Monitor approval metrics, response times, and identify bottlenecks in the approval process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage; 