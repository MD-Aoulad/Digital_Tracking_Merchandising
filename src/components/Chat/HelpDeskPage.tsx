/**
 * Help Desk Page Component - Workforce Management Platform
 * 
 * Internal help desk system that allows employees to:
 * - Contact managers by topic for inquiries or requests
 * - Submit help desk requests with categories
 * - Track request status and responses
 * - View request history
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Tag,
  Calendar,
  FileText,
  Send,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  Settings,
  Archive
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HelpDeskRequest, 
  HelpDeskChannel, 
  HelpDeskCategory, 
  ChatMessage,
  ChatAttachment 
} from '../../types';
import toast from 'react-hot-toast';

/**
 * HelpDeskPage Component
 * 
 * Internal help desk interface for employees to contact managers
 * and submit requests by topic.
 * 
 * @returns JSX element with help desk interface
 */
const HelpDeskPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpDeskRequest[]>([]);
  const [channels, setChannels] = useState<HelpDeskChannel[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HelpDeskRequest | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpDeskCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize mock help desk data
   */
  useEffect(() => {
    loadHelpDeskData();
  }, []);

  /**
   * Load help desk data
   */
  const loadHelpDeskData = async () => {
    setIsLoading(true);
    try {
      // Mock channels
      const mockChannels: HelpDeskChannel[] = [
        {
          id: '1',
          name: 'Personnel Manager',
          description: 'Contact for vacation/annual leave, HR issues, and personnel matters',
          category: HelpDeskCategory.PERSONNEL,
          assignedManagers: ['1'], // Admin User
          contactPersons: ['1'],
          topics: ['Vacation Request', 'Annual Leave', 'HR Issues', 'Benefits'],
          priority: 'medium',
          responseTime: 24,
          isActive: true,
          autoAssign: true,
          createdBy: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'VMD Manager',
          description: 'Contact for visual merchandising, store layout, and display issues',
          category: HelpDeskCategory.VMD,
          assignedManagers: ['2'], // Editor User
          contactPersons: ['2'],
          topics: ['Store Layout', 'Display Issues', 'Visual Merchandising', 'Product Placement'],
          priority: 'high',
          responseTime: 12,
          isActive: true,
          autoAssign: true,
          createdBy: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Inventory Manager',
          description: 'Contact for inventory management, stock issues, and supply requests',
          category: HelpDeskCategory.INVENTORY,
          assignedManagers: ['3'], // Viewer User
          contactPersons: ['3'],
          topics: ['Stock Issues', 'Inventory Management', 'Supply Requests', 'Product Availability'],
          priority: 'high',
          responseTime: 8,
          isActive: true,
          autoAssign: true,
          createdBy: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      // Mock requests
      const mockRequests: HelpDeskRequest[] = [
        {
          id: '1',
          channelId: '1',
          requesterId: user?.id || '',
          requesterName: user?.name || '',
          requesterEmail: user?.email || '',
          title: 'Annual Leave Request',
          description: 'I would like to request annual leave for the week of March 15-19, 2024.',
          category: HelpDeskCategory.PERSONNEL,
          priority: 'medium',
          status: 'open',
          messages: [
            {
              id: '1',
              senderId: user?.id || '',
              channelId: '1',
              content: 'I would like to request annual leave for the week of March 15-19, 2024.',
              type: 'help-desk',
              readBy: [user?.id || ''],
              createdAt: '2024-01-15T09:00:00Z',
              updatedAt: '2024-01-15T09:00:00Z',
              isEdited: false,
              isDeleted: false
            }
          ],
          tags: ['leave', 'annual'],
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        },
        {
          id: '2',
          channelId: '2',
          requesterId: user?.id || '',
          requesterName: user?.name || '',
          requesterEmail: user?.email || '',
          title: 'Store Display Issue',
          description: 'The main window display needs updating for the new product line.',
          category: HelpDeskCategory.VMD,
          priority: 'high',
          status: 'in-progress',
          assignedTo: '2',
          assignedAt: '2024-01-15T10:00:00Z',
          messages: [
            {
              id: '2',
              senderId: user?.id || '',
              channelId: '2',
              content: 'The main window display needs updating for the new product line.',
              type: 'help-desk',
              readBy: [user?.id || '', '2'],
              createdAt: '2024-01-15T10:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z',
              isEdited: false,
              isDeleted: false
            },
            {
              id: '3',
              senderId: '2',
              channelId: '2',
              content: 'I\'ll help you with that. Can you provide more details about the new product line?',
              type: 'help-desk',
              readBy: [user?.id || '', '2'],
              createdAt: '2024-01-15T10:30:00Z',
              updatedAt: '2024-01-15T10:30:00Z',
              isEdited: false,
              isDeleted: false
            }
          ],
          tags: ['display', 'window', 'product'],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        }
      ];

      setChannels(mockChannels);
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading help desk data:', error);
      toast.error('Failed to load help desk data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create new help desk request
   */
  const createNewRequest = async (requestData: Partial<HelpDeskRequest>) => {
    try {
      const newRequest: HelpDeskRequest = {
        id: Date.now().toString(),
        channelId: requestData.channelId || '',
        requesterId: user?.id || '',
        requesterName: user?.name || '',
        requesterEmail: user?.email || '',
        title: requestData.title || '',
        description: requestData.description || '',
        category: requestData.category || HelpDeskCategory.GENERAL,
        priority: requestData.priority || 'medium',
        status: 'open',
        messages: [
          {
            id: Date.now().toString(),
            senderId: user?.id || '',
            channelId: requestData.channelId || '',
            content: requestData.description || '',
            type: 'help-desk',
            readBy: [user?.id || ''],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isEdited: false,
            isDeleted: false
          }
        ],
        tags: requestData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setRequests(prev => [newRequest, ...prev]);
      setShowNewRequestModal(false);
      toast.success('Help desk request created successfully');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
    }
  };

  /**
   * Send message to help desk request
   */
  const sendMessage = async (requestId: string, content: string) => {
    if (!content.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      channelId: selectedRequest?.channelId || '',
      content,
      type: 'help-desk',
      readBy: [user?.id || ''],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false
    };

    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, messages: [...request.messages, newMessage] }
        : request
    ));

    toast.success('Message sent successfully');
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Filter requests
   */
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary-600" />
              Help Desk
            </h1>
            <p className="text-gray-600 mt-2">
              Contact managers by topic for inquiries or requests
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowChannelModal(true)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Channels
            </button>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Channels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                Available Channels
              </h2>
              
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                    onClick={() => {
                      setShowNewRequestModal(true);
                      // Pre-select this channel
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{channel.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(channel.priority)}`}>
                        {channel.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Response: {channel.responseTime}h</span>
                      <span className="capitalize">{channel.category}</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {channel.topics.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                        {channel.topics.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{channel.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Requests List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-md">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">My Requests</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{filteredRequests.length} requests</span>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as HelpDeskCategory | 'all')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.values(HelpDeskCategory).map((category) => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Requests List */}
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading requests...</div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No requests found</p>
                    <button
                      onClick={() => setShowNewRequestModal(true)}
                      className="mt-2 text-primary-600 hover:text-primary-700"
                    >
                      Create your first request
                    </button>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">{request.title}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {request.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="capitalize">{request.category}</span>
                          <span>{request.messages.length} messages</span>
                          {request.assignedTo && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Assigned
                            </span>
                          )}
                        </div>
                        
                        {request.tags.length > 0 && (
                          <div className="flex gap-1">
                            {request.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {request.tags.length > 2 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{request.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* New Request Modal */}
        {showNewRequestModal && (
          <NewRequestModal
            channels={channels}
            onClose={() => setShowNewRequestModal(false)}
            onSubmit={createNewRequest}
          />
        )}

        {/* Request Detail Modal */}
        {selectedRequest && (
          <RequestDetailModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onSendMessage={sendMessage}
          />
        )}

        {/* Channels Modal */}
        {showChannelModal && (
          <ChannelsModal
            channels={channels}
            onClose={() => setShowChannelModal(false)}
          />
        )}
      </motion.div>
    </div>
  );
};

/**
 * New Request Modal Component
 */
interface NewRequestModalProps {
  channels: HelpDeskChannel[];
  onClose: () => void;
  onSubmit: (requestData: Partial<HelpDeskRequest>) => void;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({ channels, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    channelId: '',
    title: '',
    description: '',
    priority: 'medium' as const,
    tags: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.channelId || !formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const selectedChannel = channels.find(c => c.id === formData.channelId);
    onSubmit({
      ...formData,
      category: selectedChannel?.category || HelpDeskCategory.GENERAL
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">New Help Desk Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Channel *
            </label>
            <select
              value={formData.channelId}
              onChange={(e) => setFormData(prev => ({ ...prev, channelId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Choose a channel...</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name} - {channel.description}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Brief description of your request"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Provide detailed information about your request..."
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/**
 * Request Detail Modal Component
 */
interface RequestDetailModalProps {
  request: HelpDeskRequest;
  onClose: () => void;
  onSendMessage: (requestId: string, content: string) => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, onClose, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(request.id, newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{request.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(request.priority)}`}>
              {request.priority}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {request.status.replace('-', ' ')}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {request.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col h-[60vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {request.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Channels Modal Component
 */
interface ChannelsModalProps {
  channels: HelpDeskChannel[];
  onClose: () => void;
}

const ChannelsModal: React.FC<ChannelsModalProps> = ({ channels, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Help Desk Channels</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <div key={channel.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{channel.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(channel.priority)}`}>
                    {channel.priority}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{channel.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {channel.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Response time: {channel.responseTime}h</span>
                    <span className="capitalize">{channel.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function for priority colors
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export default HelpDeskPage; 