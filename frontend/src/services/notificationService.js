import WebSocketService from './websocketService';

const API_BASE_URL = 'http://localhost:8080';

class NotificationService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/notifications`;
    this.wsService = WebSocketService;
  }

  async getAuthHeaders() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    
    try {
      const user = JSON.parse(userStr);
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.userId || user.id}`
      };
    } catch {
      return { 'Content-Type': 'application/json' };
    }
  }

  async getUserNotifications(userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/user/${userId}`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getRecentNotifications(userId, limit = 20) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/user/${userId}/recent?limit=${limit}`, {
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recent notifications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/user/${userId}/unread-count`, {
        headers
      });

      if (!response.ok) {
        // Fallback to counting from all notifications if specific endpoint doesn't exist
        const notifications = await this.getUserNotifications(userId);
        return notifications.filter(n => !n.isRead).length;
      }

      const result = await response.json();
      return result.count || result.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${notificationId}/read?userId=${userId}`, {
        method: 'PUT',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/user/${userId}/mark-all-read`, {
        method: 'PUT',
        headers
      });

      if (!response.ok) {
        // Fallback to marking each notification individually
        const notifications = await this.getUserNotifications(userId);
        const unreadNotifications = notifications.filter(n => !n.isRead);
        
        for (const notification of unreadNotifications) {
          await this.markAsRead(notification.notificationId, userId);
        }
        
        return { success: true, message: 'All notifications marked as read' };
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${notificationId}?userId=${userId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async clearAllNotifications(userId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/user/${userId}/clear-all`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        // Fallback to deleting each notification individually
        const notifications = await this.getUserNotifications(userId);
        
        for (const notification of notifications) {
          await this.deleteNotification(notification.notificationId, userId);
        }
        
        return { success: true, message: 'All notifications cleared' };
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  // WebSocket methods for real-time notifications
  connectWebSocket(userId) {
    this.wsService.connect(userId);
  }

  subscribeToNotifications(userId, callback) {
    return this.wsService.subscribe('notification', (data) => {
      if (data.userId === userId || data.payload?.userId === userId) {
        callback(data.payload || data);
      }
    });
  }

  disconnectWebSocket() {
    this.wsService.disconnect();
  }

  // Real-time notification handling
  handleRealTimeNotification(notification, setNotifications) {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.notificationId === notification.notificationId);
      if (!exists) {
        return [notification, ...prev];
      }
      return prev;
    });
  }
}

export default new NotificationService();