import React, { useState } from 'react';
import { PostingBoard, PostingBoardPost, PostingBoardSettings, UserRole } from '../../types';
import PostingBoardSettingsComponent from './PostingBoardSettings';

interface PostingBoardPageProps {
  userRole: UserRole;
}

const PostingBoardPage: React.FC<PostingBoardPageProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'boards' | 'posts' | 'settings'>('boards');
  const [selectedBoard, setSelectedBoard] = useState<PostingBoard | null>(null);

  // Mock data for demonstration
  const mockBoards: PostingBoard[] = [
    {
      id: '1',
      name: 'End-of-Day Report Board',
      description: 'For employees to summarize and report their daily tasks',
      type: 'general',
      category: 'end-of-day',
      isActive: true,
      isDefault: true,
      allowFileUploads: true,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
      maxFileSize: 10,
      requireApproval: false,
      allowComments: true,
      allowReactions: true,
      assignedRoles: ['admin', 'editor', 'viewer'],
      moderators: ['admin-1'],
      createdBy: 'admin-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Handover Board',
      description: 'For sharing notifications and updates during task transitions',
      type: 'general',
      category: 'handover',
      isActive: true,
      isDefault: false,
      allowFileUploads: true,
      allowedFileTypes: ['jpg', 'png', 'pdf'],
      maxFileSize: 5,
      requireApproval: true,
      allowComments: true,
      allowReactions: false,
      assignedRoles: ['admin', 'editor'],
      moderators: ['admin-1'],
      createdBy: 'admin-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Voice of the Customer Board',
      description: 'For gathering feedback from on-site employees',
      type: 'issue-resolution',
      category: 'voice-of-customer',
      isActive: true,
      isDefault: false,
      allowFileUploads: true,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'mp4'],
      maxFileSize: 20,
      requireApproval: false,
      allowComments: true,
      allowReactions: true,
      assignedRoles: ['admin', 'editor', 'viewer'],
      moderators: ['admin-1'],
      createdBy: 'admin-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Team Social Board',
      description: 'For sharing praise and feedback among team members',
      type: 'general',
      category: 'team-social',
      isActive: true,
      isDefault: false,
      allowFileUploads: true,
      allowedFileTypes: ['jpg', 'png', 'gif'],
      maxFileSize: 5,
      requireApproval: false,
      allowComments: true,
      allowReactions: true,
      assignedRoles: ['admin', 'editor', 'viewer'],
      moderators: ['admin-1'],
      createdBy: 'admin-1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ];

  const mockPosts: PostingBoardPost[] = [
    {
      id: '1',
      boardId: '1',
      title: 'Daily Report - January 13, 2025',
      content: 'Completed all scheduled tasks for today. Team meeting went well and we resolved the client issue.',
      authorId: 'user-1',
      authorName: 'John Doe',
      authorAvatar: 'https://via.placeholder.com/40',
      type: 'general',
      status: 'published',
      priority: 'medium',
      attachments: [],
      tags: ['daily-report', 'team-meeting'],
      isPinned: false,
      isAnonymous: false,
      views: 15,
      createdAt: '2025-01-13T17:00:00Z',
      updatedAt: '2025-01-13T17:00:00Z',
      publishedAt: '2025-01-13T17:00:00Z'
    },
    {
      id: '2',
      boardId: '3',
      title: 'Customer Complaint - Product Quality Issue',
      content: 'Received complaint about product quality from customer. Need immediate attention.',
      authorId: 'user-2',
      authorName: 'Jane Smith',
      authorAvatar: 'https://via.placeholder.com/40',
      type: 'issue',
      status: 'published',
      priority: 'high',
      attachments: [],
      tags: ['customer-complaint', 'quality-issue'],
      isPinned: true,
      isAnonymous: false,
      views: 25,
      createdAt: '2025-01-13T16:30:00Z',
      updatedAt: '2025-01-13T16:30:00Z',
      publishedAt: '2025-01-13T16:30:00Z'
    }
  ];

  const mockSettings: PostingBoardSettings = {
    id: '1',
    isEnabled: true,
    allowAnonymousPosts: false,
    requirePostApproval: false,
    allowFileUploads: true,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    allowComments: true,
    allowReactions: true,
    autoArchiveDays: 30,
    maxPostsPerDay: 10,
    maxCommentsPerPost: 50,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      mentionNotifications: true
    },
    moderationSettings: {
      enableAutoModeration: true,
      keywordFilter: ['spam', 'inappropriate'],
      spamProtection: true,
      profanityFilter: true
    },
    createdBy: 'admin-1',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  const handleSaveSettings = (settings: PostingBoardSettings) => {
    console.log('Saving settings:', settings);
    // In a real app, this would save to the backend
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'end-of-day':
        return '📊';
      case 'handover':
        return '🔄';
      case 'voice-of-customer':
        return '🎤';
      case 'team-social':
        return '👥';
      default:
        return '📋';
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (type) {
      case 'general':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'issue-resolution':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending-approval':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Posting Board</h1>
          <p className="mt-2 text-gray-600">
            Team communication and collaboration platform for sharing updates, feedback, and resolving issues.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('boards')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'boards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Boards
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts
            </button>
            {userRole === UserRole.ADMIN && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'boards' && (
          <div className="space-y-6">
            {/* Create New Board Button */}
            {userRole === UserRole.ADMIN && (
              <div className="flex justify-end">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Board
                </button>
              </div>
            )}

            {/* Boards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBoards.map((board) => (
                <div
                  key={board.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBoard(board)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(board.category)}</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{board.name}</h3>
                          <p className="text-sm text-gray-500">{board.description}</p>
                        </div>
                      </div>
                      {board.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className={getTypeBadge(board.type)}>
                          {board.type === 'general' ? 'General' : 'Issue & Resolution'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          board.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {board.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">File Uploads:</span>
                        <span className={board.allowFileUploads ? 'text-green-600' : 'text-red-600'}>
                          {board.allowFileUploads ? 'Allowed' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Approval Required:</span>
                        <span className={board.requireApproval ? 'text-orange-600' : 'text-green-600'}>
                          {board.requireApproval ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created: {new Date(board.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(board.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Posts List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {mockPosts.map((post) => (
                  <li key={post.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={post.authorAvatar}
                        alt={post.authorName}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {post.isAnonymous ? 'Anonymous' : post.authorName}
                            </p>
                            <span className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {post.isPinned && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                📌 Pinned
                              </span>
                            )}
                            <span className={getStatusBadge(post.status)}>
                              {post.status.replace('-', ' ')}
                            </span>
                            {post.type === 'issue' && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                post.priority === 'high' || post.priority === 'urgent'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {post.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mt-1">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                        
                        {post.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>👁️ {post.views} views</span>
                            {post.attachments.length > 0 && (
                              <span>📎 {post.attachments.length} attachments</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Board: {mockBoards.find(b => b.id === post.boardId)?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'settings' && userRole === UserRole.ADMIN && (
          <PostingBoardSettingsComponent
            settings={mockSettings}
            onSave={handleSaveSettings}
            isAdmin={true}
          />
        )}
      </div>
    </div>
  );
};

export default PostingBoardPage; 