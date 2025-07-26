/**
 * WebSocket Service for Real-Time Attendance Updates
 * 
 * This service provides real-time communication for attendance management
 * including status updates, team notifications, and approval requests.
 * 
 * Features:
 * - Real-time attendance status updates
 * - Team status synchronization
 * - Approval request notifications
 * - Connection management and reconnection
 * - Event-driven architecture
 * - Error handling and logging
 * 
 * @author Workforce Management Team
 * @version 1.0.0
 */

// Update WebSocket URL to connect directly to chat service
const WEBSOCKET_URL = 'ws://localhost:3012';

export interface AttendanceUpdate {
  type: 'attendance_update';
  payload: {
    userId: string;
    status: 'in' | 'out' | 'break';
    timestamp: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
  };
}

export interface TeamUpdate {
  type: 'team_update';
  payload: {
    teamStatus: Array<{
      userId: string;
      name: string;
      status: string;
      clockInTime?: string;
      currentLocation?: string;
      isOnBreak: boolean;
      breakType?: string;
      lastSeen: string;
    }>;
  };
}

export interface ApprovalRequest {
  type: 'approval_request';
  payload: {
    id: string;
    attendanceId: string;
    userId: string;
    managerId: string;
    type: 'late' | 'early-leave' | 'overtime' | 'break-extension';
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
  };
}

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export type WebSocketEventHandler = (data: any) => void;

/**
 * WebSocket Service Class
 * 
 * Manages WebSocket connections for real-time attendance updates
 */
export class AttendanceWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private isConnecting = false;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.connectionStatus = 'connecting';

      try {
        this.ws = new WebSocket(WEBSOCKET_URL);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionStatus = 'connected';
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.connectionStatus = 'disconnected';
          this.isConnecting = false;
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off(eventType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionStatus;
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      switch (data.type) {
        case 'attendance_update':
          this.emit('attendance_update', data.payload);
          break;
        case 'team_update':
          this.emit('team_update', data.payload);
          break;
        case 'approval_request':
          this.emit('approval_request', data.payload);
          break;
        case 'ping':
          this.send({ type: 'pong', payload: {} });
          break;
        default:
          console.warn('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in WebSocket event handler:', error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.connectionStatus === 'disconnected') {
        this.connect().catch(error => {
          console.error('WebSocket reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Join a workplace room to receive real-time updates
   */
  joinWorkplaceRoom(workplaceId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // For Socket.io, this would be socket.emit; for native WS, send a message
      this.send({ type: 'join-workplace', payload: { workplaceId } });
    }
  }

  /**
   * Leave a workplace room
   */
  leaveWorkplaceRoom(workplaceId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ type: 'leave-workplace', payload: { workplaceId } });
    }
  }
}

// Create singleton instance
export const attendanceWebSocket = new AttendanceWebSocket();

// Export convenience functions
export const connectWebSocket = () => attendanceWebSocket.connect();
export const disconnectWebSocket = () => attendanceWebSocket.disconnect();
export const sendWebSocketMessage = (message: WebSocketMessage) => attendanceWebSocket.send(message);
export const onWebSocketEvent = (eventType: string, handler: WebSocketEventHandler) => attendanceWebSocket.on(eventType, handler);
export const offWebSocketEvent = (eventType: string, handler: WebSocketEventHandler) => attendanceWebSocket.off(eventType, handler);
export const getWebSocketStatus = () => attendanceWebSocket.getConnectionStatus(); 

// Export join/leave room helpers
export const joinWorkplaceRoom = (workplaceId: string) => attendanceWebSocket.joinWorkplaceRoom(workplaceId);
export const leaveWorkplaceRoom = (workplaceId: string) => attendanceWebSocket.leaveWorkplaceRoom(workplaceId); 