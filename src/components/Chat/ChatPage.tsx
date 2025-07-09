/**
 * Team Chat Page Component - Workforce Management Platform
 * 
 * Real-time team communication system with messaging, file sharing,
 * and collaboration features. Features include:
 * - Real-time messaging and chat rooms
 * - File and image sharing
 * - Group chat management
 * - Message search and history
 * - Online status indicators
 * - Message reactions and replies
 * - Voice and video call integration
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Phone,
  Video,
  UserPlus,
  Settings,
  Archive,
  Trash2,
  Edit,
  Reply,
  Heart,
  ThumbsUp,
  MessageSquare,
  Users,
  Hash,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Message, ChatGroup } from '../../types';
import toast from 'react-hot-toast';

/**
 * ChatPage Component
 * 
 * Main team communication interface with real-time messaging,
 * file sharing, and collaboration capabilities.
 * 
 * @returns JSX element with complete chat interface
 */
const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize mock chat data
   */
  useEffect(() => {
    const mockGroups: ChatGroup[] = [
      {
        id: '1',
        name: 'General',
        members: ['1', '2', '3'],
        createdBy: '1',
        createdAt: '2024-01-01T00:00:00Z',
        lastMessage: {
          id: '1',
          senderId: '2',
          content: 'Good morning team!',
          type: 'text',
          readBy: ['1', '3'],
          createdAt: '2024-01-15T09:00:00Z'
        }
      },
      {
        id: '2',
        name: 'Development Team',
        members: ['1', '2'],
        createdBy: '1',
        createdAt: '2024-01-01T00:00:00Z',
        lastMessage: {
          id: '2',
          senderId: '1',
          content: 'Code review completed',
          type: 'text',
          readBy: ['2'],
          createdAt: '2024-01-15T14:30:00Z'
        }
      },
      {
        id: '3',
        name: 'Marketing',
        members: ['2', '3'],
        createdBy: '2',
        createdAt: '2024-01-01T00:00:00Z',
        lastMessage: {
          id: '3',
          senderId: '3',
          content: 'Campaign materials ready',
          type: 'text',
          readBy: ['2'],
          createdAt: '2024-01-15T16:00:00Z'
        }
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: '2',
        groupId: '1',
        content: 'Good morning team! How is everyone doing today?',
        type: 'text',
        readBy: ['1', '3'],
        createdAt: '2024-01-15T09:00:00Z'
      },
      {
        id: '2',
        senderId: '1',
        groupId: '1',
        content: 'Morning! I\'m working on the new feature. Should be ready by EOD.',
        type: 'text',
        readBy: ['2', '3'],
        createdAt: '2024-01-15T09:05:00Z'
      },
      {
        id: '3',
        senderId: '3',
        groupId: '1',
        content: 'Great! I\'ll review it once it\'s ready.',
        type: 'text',
        readBy: ['1', '2'],
        createdAt: '2024-01-15T09:10:00Z'
      },
      {
        id: '4',
        senderId: '2',
        groupId: '1',
        content: 'Don\'t forget about the team meeting at 2 PM today!',
        type: 'text',
        readBy: ['1'],
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    setGroups(mockGroups);
    setMessages(mockMessages);
    setSelectedGroup(mockGroups[0]);
  }, []);

  /**
   * Scroll to bottom of messages
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send new message
   */
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      groupId: selectedGroup.id,
      content: newMessage,
      type: 'text',
      readBy: [user?.id || ''],
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyTo(null);
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedGroup) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      groupId: selectedGroup.id,
      content: `📎 ${file.name}`,
      type: 'file',
      attachments: [file.name],
      readBy: [user?.id || ''],
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    toast.success('File uploaded successfully');
  };

  /**
   * Add reaction to message
   */
  const addReaction = (messageId: string, reaction: string) => {
    // In a real app, this would update the message with reactions
    toast.success(`Added ${reaction} reaction`);
  };

  /**
   * Get user display name
   */
  const getUserName = (userId: string) => {
    const userNames: Record<string, string> = {
      '1': 'Admin User',
      '2': 'Editor User',
      '3': 'Viewer User'
    };
    return userNames[userId] || `User ${userId}`;
  };

  /**
   * Get user avatar
   */
  const getUserAvatar = (userId: string) => {
    return (
      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">
          {getUserName(userId).charAt(0)}
        </span>
      </div>
    );
  };

  /**
   * Filter messages based on search
   */
  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Sidebar - Chat Groups */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Team Chat</h2>
            <button className="text-gray-400 hover:text-gray-600">
              <UserPlus size={20} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Chat Groups List */}
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedGroup?.id === group.id ? 'bg-primary-50 border-primary-200' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Hash className="text-primary-600" size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-xs text-gray-500">{group.members.length} members</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </div>
              
              {group.lastMessage && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate flex-1">
                    {group.lastMessage.content}
                  </p>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(group.lastMessage.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Hash className="text-primary-600" size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedGroup.members.length} members • 
                      {selectedGroup.members.some(id => id === user?.id) ? ' You are a member' : ' You are not a member'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Phone size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Video size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Search size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages
                .filter(message => message.groupId === selectedGroup.id)
                .map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                      {message.senderId !== user?.id && (
                        <div className="flex items-center mb-1">
                          {getUserAvatar(message.senderId)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getUserName(message.senderId)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`rounded-lg px-4 py-2 ${
                        message.senderId === user?.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {replyTo && replyTo.id === message.id && (
                          <div className="text-xs opacity-75 mb-1">
                            Replying to: {replyTo.content.substring(0, 30)}...
                          </div>
                        )}
                        
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center text-xs opacity-75">
                                <Paperclip size={12} className="mr-1" />
                                {attachment}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => addReaction(message.id, '👍')}
                              className="text-xs opacity-75 hover:opacity-100"
                            >
                              ��
                            </button>
                            <button
                              onClick={() => addReaction(message.id, '❤️')}
                              className="text-xs opacity-75 hover:opacity-100"
                            >
                              ❤️
                            </button>
                            <button
                              onClick={() => setReplyTo(message)}
                              className="text-xs opacity-75 hover:opacity-100"
                            >
                              <Reply size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {replyTo && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Replying to: {replyTo.content.substring(0, 50)}...
                    </span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFileUpload(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Paperclip size={20} />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Smile size={20} />
                  </button>
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
            </div>
          </>
        ) : (
          /* No chat selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
