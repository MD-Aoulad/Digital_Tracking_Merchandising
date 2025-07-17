import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  Download,
  Send,
  Bell,
  Eye,
  RefreshCw,
  Users,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  MapPin,
  FileText,
  Image,
  Video,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

/**
 * Communication Hub Component
 * 
 * This component provides comprehensive communication functionality including:
 * - Centralized communication with field teams
 * - Message broadcasting and targeting
 * - Notification management
 * - Team collaboration tools
 * - Communication analytics
 * - File sharing and media management
 */
const CommunicationHub: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'announcement',
      title: 'New Product Launch - Samsung Galaxy S24',
      content: 'We are excited to announce the launch of Samsung Galaxy S24. All stores should update their displays and prepare for the launch event this Friday.',
      sender: 'Marketing Team',
      senderId: 'mkt001',
      recipients: ['all-workplaces'],
      workplaceIds: ['1', '2', '3'],
      priority: 'high',
      status: 'sent',
      sentDate: '2025-01-15T09:00:00Z',
      readBy: ['emp001', 'emp002'],
      attachments: [
        {
          id: 'att1',
          name: 'S24_Launch_Guide.pdf',
          type: 'pdf',
          size: '2.5 MB'
        },
        {
          id: 'att2',
          name: 'Display_Layout.jpg',
          type: 'image',
          size: '1.2 MB'
        }
      ],
      tags: ['product-launch', 'marketing', 'urgent'],
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-15T09:00:00Z'
    },
    {
      id: '2',
      type: 'instruction',
      title: 'Updated Safety Protocols',
      content: 'Please review the updated safety protocols for all workplaces. New guidelines must be implemented by end of week.',
      sender: 'Safety Manager',
      senderId: 'safety001',
      recipients: ['all-employees'],
      workplaceIds: ['1', '2', '3'],
      priority: 'medium',
      status: 'sent',
      sentDate: '2025-01-14T14:30:00Z',
      readBy: ['emp001'],
      attachments: [
        {
          id: 'att3',
          name: 'Safety_Protocols_2025.pdf',
          type: 'pdf',
          size: '3.1 MB'
        }
      ],
      tags: ['safety', 'protocols', 'mandatory'],
      createdAt: '2025-01-14T14:30:00Z',
      updatedAt: '2025-01-14T14:30:00Z'
    },
    {
      id: '3',
      type: 'update',
      title: 'Weekly Sales Meeting Reminder',
      content: 'Reminder: Weekly sales meeting tomorrow at 10 AM. Please prepare your reports and be ready to discuss performance metrics.',
      sender: 'Operations Manager',
      senderId: 'ops001',
      recipients: ['managers'],
      workplaceIds: ['1', '2', '3'],
      priority: 'normal',
      status: 'draft',
      sentDate: null,
      readBy: [],
      attachments: [],
      tags: ['meeting', 'sales', 'reminder'],
      createdAt: '2025-01-15T08:00:00Z',
      updatedAt: '2025-01-15T08:00:00Z'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Dashboard statistics
  const dashboardStats = {
    totalMessages: 156,
    sentMessages: 134,
    draftMessages: 22,
    readRate: 87.5,
    averageResponseTime: 2.3, // hours
    activeRecipients: 89,
    urgentMessages: 12,
    attachments: 45
  };

  const handleAddMessage = () => {
    setEditingMessage(null);
    setShowAddModal(true);
  };

  const handleEdit = (message: any) => {
    setEditingMessage(message);
    setShowAddModal(true);
  };

  const handleDelete = (messageId: string) => {
    setMessages(messages.filter(m => m.id !== messageId));
  };

  const handleSend = (messageId: string) => {
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, status: 'sent', sentDate: new Date().toISOString() } : m
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'text-blue-600 bg-blue-100';
      case 'instruction': return 'text-orange-600 bg-orange-100';
      case 'update': return 'text-green-600 bg-green-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'instruction': return <FileText className="h-4 w-4" />;
      case 'update': return <MessageSquare className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-green-600 bg-green-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'low': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || message.type === filterType;
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Hub</h2>
          <p className="text-gray-600">Centralized communication with field teams</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleAddMessage}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalMessages}</p>
              <p className="text-sm text-blue-600">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sent Messages</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.sentMessages}</p>
              <p className="text-sm text-green-600">{Math.round((dashboardStats.sentMessages / dashboardStats.totalMessages) * 100)}% sent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Read Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.readRate}%</p>
              <p className="text-sm text-indigo-600">Message engagement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Recipients</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeRecipients}</p>
              <p className="text-sm text-orange-600">Team members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages, content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="announcement">Announcement</option>
              <option value="instruction">Instruction</option>
              <option value="update">Update</option>
              <option value="alert">Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Messages</h3>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{message.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{message.content}</div>
                      <div className="text-xs text-gray-400">
                        {message.attachments.length > 0 && (
                          <span className="inline-flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{message.sender}</div>
                    <div className="text-sm text-gray-500">{message.recipients.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                      {getTypeIcon(message.type)}
                      <span className="ml-1">{message.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {getPriorityIcon(message.priority)}
                      <span className="ml-1">{message.priority}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {getStatusIcon(message.status)}
                      <span className="ml-1">{message.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {message.sentDate ? formatDate(message.sentDate) : 'Not sent'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {message.readBy.length} read
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {message.status === 'draft' && (
                        <button
                          onClick={() => handleSend(message.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(message)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMessage ? 'Edit Message' : 'New Message'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingMessage ? 'Update message details' : 'Create new communication message'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editingMessage ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationHub; 