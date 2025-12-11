class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscribers = new Map();
    this.userId = null;
  }

  connect(userId) {
    this.userId = userId;
    
    if (this.stompClient && this.stompClient.connected) {
      return;
    }

    try {
      // Use SockJS for STOMP protocol (compatible with Spring Boot WebSocket)
      const socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = Stomp.over(socket);
      
      this.stompClient.connect({}, () => {
        console.log('WebSocket connected for real-time notifications');
        this.reconnectAttempts = 0;
        
        // Subscribe to user's personal notification queue
        this.stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          try {
            const data = JSON.parse(message.body);
            this.notifySubscribers(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
        
        // Also subscribe to general notifications topic
        this.stompClient.subscribe('/topic/notifications', (message) => {
          try {
            const data = JSON.parse(message.body);
            this.notifySubscribers(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
        
      }, (error) => {
        console.error('WebSocket connection error:', error);
        this.attemptReconnect(userId);
      });

    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.attemptReconnect(userId);
    }
  }

  attemptReconnect(userId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(userId);
    }, delay);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);
    
    return () => this.unsubscribe(channel, callback);
  }

  unsubscribe(channel, callback) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).delete(callback);
    }
  }

  notifySubscribers(data) {
    const channel = data.type || 'default';
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    this.reconnectAttempts = 0;
  }

  getConnectionState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}

// Export singleton instance
export default new WebSocketService();