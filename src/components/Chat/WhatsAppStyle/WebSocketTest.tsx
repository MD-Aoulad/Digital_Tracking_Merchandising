import React, { useEffect, useState } from 'react';
import { useChatSocket } from '../../../hooks/useChatSocket';

interface WebSocketTestProps {
  userId: string;
}

const WebSocketTest: React.FC<WebSocketTestProps> = ({ userId }) => {
  const [testMessage, setTestMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);

  const {
    connectionStatus,
    joinChannel,
    leaveChannel,
    sendMessage,
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = useChatSocket({
    userId,
    autoReconnect: true
  });

  useEffect(() => {
    // Handle incoming messages
    const handleMessage = (message: any) => {
      console.log('Received message:', message);
      setReceivedMessages(prev => [...prev, message]);
    };

    // Handle connection events
    const handleConnect = () => {
      console.log('WebSocket connected!');
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected!');
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
    };

    // Register event handlers
    onMessage(handleMessage);
    onConnect(handleConnect);
    onDisconnect(handleDisconnect);
    onError(handleError);

    // Join a test channel
    joinChannel('test-channel').catch(console.error);

    // Cleanup
    return () => {
      leaveChannel('test-channel');
    };
  }, [joinChannel, leaveChannel, onMessage, onConnect, onDisconnect, onError]);

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    try {
      await sendMessage('test-channel', testMessage);
      setTestMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">WebSocket Test</h3>
      
      {/* Connection Status */}
      <div className="mb-4">
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          connectionStatus.connected 
            ? 'bg-green-500 text-white' 
            : connectionStatus.connecting 
            ? 'bg-yellow-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {connectionStatus.connected ? '🟢 Connected' : 
           connectionStatus.connecting ? '🟡 Connecting...' : '🔴 Disconnected'}
        </div>
        {connectionStatus.error && (
          <p className="text-red-500 text-sm mt-1">{connectionStatus.error}</p>
        )}
      </div>

      {/* Send Test Message */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendTestMessage()}
          />
          <button
            onClick={handleSendTestMessage}
            disabled={!connectionStatus.connected}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>

      {/* Received Messages */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Received Messages:</h4>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
          {receivedMessages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages received yet...</p>
          ) : (
            receivedMessages.map((msg, index) => (
              <div key={index} className="text-sm mb-1 p-1 bg-gray-50 rounded">
                <strong>{msg.senderId || 'Unknown'}:</strong> {msg.content || JSON.stringify(msg)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connection Info */}
      <div className="text-xs text-gray-600">
        <p>User ID: {userId}</p>
        <p>Channel: test-channel</p>
        <p>Reconnect Attempts: {connectionStatus.reconnectAttempts}</p>
      </div>
    </div>
  );
};

export default WebSocketTest; 