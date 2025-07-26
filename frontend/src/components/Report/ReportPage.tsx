import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { 
  FileText, 
  Plus, 
  Settings, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Download,
  MessageSquare,
  Shield,
  Zap,
  Target,
  Bell,
  Filter,
  Lock,
  EyeOff,
  Link,
  FileCheck,
  UserCheck,
  Settings2
} from 'lucide-react';
import { ReportTemplate, ReportSubmission, ReportRequest } from '../../types';
import ReportSettings from './ReportSettings';

/**
 * Report Page Component
 * 
 * Main entry point for the Report feature that provides:
 * - Overview of report templates and submissions
 * - Quick access to report settings
 * - Recent report activity
 * - Quick actions for creating and managing reports
 */
const ReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'submissions' | 'requests' | 'approvals' | 'security' | 'settings' | 'setup'>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(true);

  // Mock data for demonstration
  const mockTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Daily Store Report',
      description: 'Daily sales, customer count, and store conditions',
      category: 'daily',
      fields: [],
      isActive: true,
      isRecurring: true,
      recurrencePattern: {
        frequency: 'daily',
        interval: 1,
        startDate: '2024-01-01'
      },
      assignedRoles: ['employee', 'manager'],
      requiresApproval: true,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Visit Report',
      description: 'Store visit and customer interaction report',
      category: 'custom',
      fields: [],
      isActive: true,
      isRecurring: false,
      assignedRoles: ['employee'],
      requiresApproval: false,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Sales Performance Report',
      description: 'Weekly sales targets and performance metrics',
      category: 'weekly',
      fields: [],
      isActive: true,
      isRecurring: true,
      recurrencePattern: {
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-01-01'
      },
      assignedRoles: ['employee', 'manager'],
      requiresApproval: true,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Inventory Check Report',
      description: 'Stock level verification and reorder recommendations',
      category: 'monthly',
      fields: [],
      isActive: true,
      isRecurring: true,
      recurrencePattern: {
        frequency: 'monthly',
        interval: 1,
        startDate: '2024-01-01'
      },
      assignedRoles: ['employee', 'manager'],
      requiresApproval: true,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'Customer Feedback Report',
      description: 'Customer satisfaction and feedback collection',
      category: 'custom',
      fields: [],
      isActive: true,
      isRecurring: false,
      assignedRoles: ['employee'],
      requiresApproval: false,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      name: 'Store Audit Report',
      description: 'Comprehensive store compliance and safety audit',
      category: 'monthly',
      fields: [],
      isActive: true,
      isRecurring: true,
      recurrencePattern: {
        frequency: 'monthly',
        interval: 1,
        startDate: '2024-01-01'
      },
      assignedRoles: ['manager'],
      requiresApproval: true,
      createdBy: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockSubmissions: ReportSubmission[] = [
    {
      id: '1',
      templateId: '1',
      title: 'Daily Store Report - Downtown Mall - Jan 15, 2024',
      submittedBy: 'sarah.johnson@retail.com',
      submittedAt: '2024-01-15T17:00:00Z',
      status: 'submitted',
      data: {},
      version: 1,
      isRecurring: true,
      recurringInstance: 15
    },
    {
      id: '2',
      templateId: '2',
      title: 'Visit Report - Westside Store - Customer Interaction',
      submittedBy: 'mike.chen@retail.com',
      submittedAt: '2024-01-14T16:30:00Z',
      status: 'approved',
      data: {},
      approvedBy: 'manager@retail.com',
      approvedAt: '2024-01-15T09:00:00Z',
      version: 1,
      isRecurring: false
    },
    {
      id: '3',
      templateId: '3',
      title: 'Sales Performance Report - Week 2, January 2024',
      submittedBy: 'lisa.rodriguez@retail.com',
      submittedAt: '2024-01-14T18:00:00Z',
      status: 'approved',
      data: {},
      approvedBy: 'manager@retail.com',
      approvedAt: '2024-01-15T10:00:00Z',
      version: 1,
      isRecurring: true,
      recurringInstance: 2
    },
    {
      id: '4',
      templateId: '4',
      title: 'Inventory Check Report - Electronics Department',
      submittedBy: 'david.kim@retail.com',
      submittedAt: '2024-01-13T15:45:00Z',
      status: 'submitted',
      data: {},
      version: 1,
      isRecurring: true,
      recurringInstance: 1
    },
    {
      id: '5',
      templateId: '5',
      title: 'Customer Feedback Report - Premium Service',
      submittedBy: 'emma.wilson@retail.com',
      submittedAt: '2024-01-12T14:20:00Z',
      status: 'approved',
      data: {},
      approvedBy: 'manager@retail.com',
      approvedAt: '2024-01-13T08:30:00Z',
      version: 1,
      isRecurring: false
    }
  ];

  const mockRequests: ReportRequest[] = [
    {
      id: '1',
      templateId: '1',
      title: 'Submit Daily Store Report',
      description: 'Please submit your daily store report including sales figures, customer count, and store conditions',
      assignedTo: ['sarah.johnson@retail.com', 'mike.chen@retail.com', 'lisa.rodriguez@retail.com'],
      dueDate: '2024-01-15T17:00:00Z',
      priority: 'high',
      status: 'completed',
      createdBy: 'admin@retail.com',
      createdAt: '2024-01-15T09:00:00Z',
      reminders: {
        enabled: true,
        frequency: 'daily'
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    },
    {
      id: '2',
      templateId: '3',
      title: 'Submit Weekly Sales Performance Report',
      description: 'Submit your weekly sales performance report with targets and achievements',
      assignedTo: ['lisa.rodriguez@retail.com', 'david.kim@retail.com'],
      dueDate: '2024-01-19T18:00:00Z',
      priority: 'medium',
      status: 'pending',
      createdBy: 'admin@retail.com',
      createdAt: '2024-01-15T10:00:00Z',
      reminders: {
        enabled: true,
        frequency: 'weekly'
      },
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    },
    {
      id: '3',
      templateId: '4',
      title: 'Complete Monthly Inventory Check',
      description: 'Perform monthly inventory check for all departments and submit report',
      assignedTo: ['david.kim@retail.com', 'emma.wilson@retail.com'],
      dueDate: '2024-01-31T16:00:00Z',
      priority: 'high',
      status: 'pending',
      createdBy: 'admin@retail.com',
      createdAt: '2024-01-15T11:00:00Z',
      reminders: {
        enabled: true,
        frequency: 'weekly'
      },
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showSettings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => setShowSettings(false)}
            variant="outline"
            className="flex items-center gap-2"
          >
            ← Back to Reports
          </Button>
        </div>
        <ReportSettings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Manage report templates, submissions, and requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowSettings(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Feature Status Banner */}
      {!isFeatureEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Report Feature Disabled</h3>
                <p className="text-sm text-yellow-700">Enable the report feature to start creating and managing reports.</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsFeatureEnabled(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Enable Feature
            </Button>
          </div>
        </div>
      )}

      {/* Setup Guide */}
      {isFeatureEnabled && showSetupGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Get Started with Reports</h3>
                <p className="text-sm text-blue-700">Follow the setup guide to configure your first report templates.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setActiveTab('setup')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Setup Guide
              </Button>
              <Button 
                onClick={() => setShowSetupGuide(false)}
                variant="outline"
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'submissions', label: 'Submissions', icon: CheckCircle },
            { id: 'requests', label: 'Requests', icon: Clock },
            { id: 'approvals', label: 'Approvals', icon: FileCheck },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'setup', label: 'Setup Guide', icon: Settings2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">No more waiting for field reports</h2>
              <p className="text-xl mb-6">Get instant updates, anytime</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <Zap className="h-6 w-6 text-yellow-300 mt-1" />
                  <div>
                    <h3 className="font-semibold">Real-Time Updates</h3>
                    <p className="text-blue-100">Instant notifications and live progress tracking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-yellow-300 mt-1" />
                  <div>
                    <h3 className="font-semibold">Customizable Reports</h3>
                    <p className="text-blue-100">Design reports in any format you need</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-yellow-300 mt-1" />
                  <div>
                    <h3 className="font-semibold">Secure & Reliable</h3>
                    <p className="text-blue-100">Enhanced security and data protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{mockTemplates.filter(t => t.isActive).length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{mockSubmissions.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockSubmissions.filter(s => s.status === 'submitted').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockRequests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Customizable Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Customize the report format your way. Design reports in any format you need.</p>
                <Button onClick={() => setShowCustomizeModal(true)} className="w-full">
                  Design Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assign Roles & Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Assign completion roles and deadlines for precise tracking.</p>
                <Button variant="outline" className="w-full">
                  Manage Assignments
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Organize by Topic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Organize by topic and type for easy management.</p>
                <Button variant="outline" className="w-full">
                  View Categories
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Real-Time Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create reports effortlessly and track progress in real-time.</p>
                <Button variant="outline" className="w-full">
                  View Notifications
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Report Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Comment, followup and download all in one place.</p>
                <Button variant="outline" className="w-full">
                  Download Reports
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Report Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Request reviews, set approvals, and customize your workflow.</p>
                <Button onClick={() => setShowApprovalModal(true)} className="w-full">
                  Manage Approvals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Report Templates</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.isActive ? 'default' : 'secondary'}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {template.category}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {template.assignedRoles.length} roles assigned
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Settings2 className="h-3 w-3" />
                        Customize
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Report Submissions</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockSubmissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{submission.submittedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            {submission.status === 'submitted' && (
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Report Requests</h2>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </div>
                  <CardDescription>{request.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {request.assignedTo.length} employees assigned
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(request.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Settings2 className="h-3 w-3" />
                        Customize
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Report Approvals</h2>
              <p className="text-gray-600">Request reviews, set approvals, and customize your approval workflow</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Approval Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {mockSubmissions.filter(s => s.status === 'submitted').length}
                </div>
                <p className="text-gray-600">Reports waiting for review</p>
                <Button variant="outline" className="w-full mt-4">
                  Review All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Approved Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {mockSubmissions.filter(s => s.status === 'approved').length}
                </div>
                <p className="text-gray-600">Reports approved today</p>
                <Button variant="outline" className="w-full mt-4">
                  View History
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Workflow Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
                <p className="text-gray-600">Active approval workflows</p>
                <Button variant="outline" className="w-full mt-4">
                  Manage Rules
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Approval Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{submission.title}</p>
                        <p className="text-sm text-gray-600">Submitted by {submission.submittedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Security & Reliability</h2>
              <p className="text-gray-600">Enhance security and protect your data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  IP Address Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Restrict access to allowed IP addresses only, blocking external connections.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feature Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allowed IPs</span>
                    <span className="text-sm font-medium">3 addresses</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Manage IP Access
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeOff className="h-5 w-5" />
                  Screen Capture Blocking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Limit capture features to prevent internal data and sensitive personal information leaks.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feature Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blocked Actions</span>
                    <span className="text-sm font-medium">Screenshots, Recording</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Configure Blocking
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Document Download Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Restrict file downloads within the company to prevent the leakage of important documents.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feature Status</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Restricted Formats</span>
                    <span className="text-sm font-medium">PDF, DOC, XLS</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Set Restrictions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Document Sharing Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Limit document access through shared links to block unnecessary external access and enhance security.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feature Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Link Expiry</span>
                    <span className="text-sm font-medium">24 hours</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Manage Links
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <p className="text-sm text-gray-600">Security Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <p className="text-sm text-gray-600">Security Incidents</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <p className="text-sm text-gray-600">Monitoring</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">99.9%</div>
                  <p className="text-sm text-gray-600">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Report Feature Setup Guide</h2>
              <p className="text-gray-600">Get started with Shopl's Report feature for retail operations</p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: 01-13-2025
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Important Note</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The report feature can only be enabled by administrators. This ensures proper control over report templates and submissions.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                  Understanding the Feature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Shopl's Report feature allows retail businesses to create templates for various types of reports and easily request submissions from employees.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Create templates for daily, monthly, or recurring reports</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Request submissions from employees anywhere</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Manage forms like applications and work logs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
                  Enable the Feature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  To use the report feature, you must enable it first.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">Steps:</p>
                  <ol className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>1. Go to Dashboard → Feature settings → Report</li>
                    <li>2. Toggle the Report feature to ON</li>
                    <li>3. Save your settings</li>
                  </ol>
                </div>
                <Button 
                  onClick={() => setIsFeatureEnabled(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Enable Report Feature
                </Button>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                  Add Your First Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Before creating a report template, you need to add a report.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">Steps:</p>
                  <ol className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>1. Navigate to Feature settings → Report</li>
                    <li>2. Click the [Add] button in the [All] section</li>
                    <li>3. Add the report you want to use</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">Popular Retail Report Examples:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-600">• Visit Report</div>
                    <div className="text-sm text-gray-600">• Work Log</div>
                    <div className="text-sm text-gray-600">• Sales Report</div>
                    <div className="text-sm text-gray-600">• Inventory Check</div>
                    <div className="text-sm text-gray-600">• Customer Feedback</div>
                    <div className="text-sm text-gray-600">• Store Audit</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setActiveTab('templates')}
                  variant="outline"
                  className="w-full"
                >
                  Create Report Template
                </Button>
              </CardContent>
            </Card>

            {/* Retail Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Retail Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Daily Store Reports</p>
                      <p className="text-xs text-gray-600">Track daily sales, customer count, and store conditions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Employee Performance</p>
                      <p className="text-xs text-gray-600">Monitor sales targets, customer service, and attendance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Inventory Management</p>
                      <p className="text-xs text-gray-600">Track stock levels, reorder points, and product movement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Customer Feedback</p>
                      <p className="text-xs text-gray-600">Collect and analyze customer satisfaction data</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setActiveTab('templates')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Template
                </Button>
                <Button 
                  onClick={() => setActiveTab('requests')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Request Reports
                </Button>
                <Button 
                  onClick={() => setActiveTab('submissions')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  View Submissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportPage; 