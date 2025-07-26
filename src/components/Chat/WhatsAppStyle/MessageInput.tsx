/**
 * WhatsApp-Style Message Input Component
 * 
 * Enhanced message input with WhatsApp-like features:
 * - Emoji picker integration
 * - Voice message recording
 * - File attachment support
 * - Reply to message functionality
 * - Typing indicators
 * - Send button states
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff, 
  X, 
  Reply,
  Image as ImageIcon,
  Video,
  FileText,
  MapPin,
  Camera,
  StopCircle,
  Pause,
  Play
} from 'lucide-react';
import { ChatMessage } from '../../../types/chat';
import EmojiPicker from './EmojiPicker';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  onSendVoiceMessage: (audioBlob: Blob) => void;
  onTyping: (isTyping: boolean) => void;
  replyToMessage?: ChatMessage | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendVoiceMessage,
  onTyping,
  replyToMessage,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Typing indicator
  useEffect(() => {
    const timeout = setTimeout(() => {
      onTyping(false);
    }, 1000);

    if (message.length > 0) {
      onTyping(true);
    }

    return () => clearTimeout(timeout);
  }, [message, onTyping]);

  // Handle textarea key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Send message
  const handleSendMessage = () => {
    if ((!message.trim() && attachments.length === 0) || disabled) return;

    onSendMessage(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
    setShowEmojiPicker(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Add emoji
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  // File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onSendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    // This would integrate with device camera
    // For now, we'll trigger file input
    fileInputRef.current?.click();
  };

  // Handle location sharing
  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `📍 Location: ${latitude}, ${longitude}`;
          setMessage(prev => prev + locationMessage);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get location. Please check permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Replying to {replyToMessage.sender?.name || 'Unknown'}
              </span>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 text-blue-500 hover:text-blue-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-blue-600 mt-1 truncate">
            {replyToMessage.content}
          </p>
        </div>
      )}

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Attachments ({attachments.length})
            </span>
            <button
              onClick={() => setAttachments([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center space-x-2">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                  ) : file.type.startsWith('video/') ? (
                    <Video className="w-4 h-4 text-purple-500" />
                  ) : file.type.startsWith('audio/') ? (
                    <Mic className="w-4 h-4 text-green-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-1 text-red-500 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording Interface */}
      {isRecording && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">
                Recording {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePauseRecording}
                className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-100"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={stopRecording}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end space-x-2">
        {/* Attachment Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(false)}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            disabled={disabled}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Attachment Menu */}
          <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-center hover:bg-gray-100 rounded"
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Document</span>
              </button>
              <button
                onClick={handleCameraCapture}
                className="p-2 text-center hover:bg-gray-100 rounded"
              >
                <Camera className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-center hover:bg-gray-100 rounded"
              >
                <ImageIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Gallery</span>
              </button>
              <button
                onClick={handleLocationShare}
                className="p-2 text-center hover:bg-gray-100 rounded"
              >
                <MapPin className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Location</span>
              </button>
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32"
            disabled={disabled}
            rows={1}
          />
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          disabled={disabled}
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Voice/Text Send Button */}
        {message.trim() || attachments.length > 0 ? (
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={disabled}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`p-3 rounded-lg ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
      />
    </div>
  );
};

export default MessageInput; 