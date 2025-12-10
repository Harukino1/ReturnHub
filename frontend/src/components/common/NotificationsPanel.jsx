import { useMemo } from 'react'
import { Bell, Check, X, Clock, CheckCircle2 } from 'lucide-react'
import '../../styles/components/NotificationsPanel.css'

export default function NotificationsPanel({ open, notifications = [], onClose, onMarkAllRead, onMarkRead }) {
  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

  return (
    <>
      {/* Overlay backdrop for mobile or focus */}
      <div 
        className={`notifs-overlay ${open ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside className={`notifs-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
        
        {/* Header */}
        <header className="notifs-header">
          <div className="notifs-header-left">
            <h3 className="notifs-title">Notifications</h3>
            {unreadCount > 0 && (
              <span className="notifs-badge-pill">{unreadCount} New</span>
            )}
          </div>
          <div className="notifs-header-right">
            {unreadCount > 0 && (
              <button 
                className="btn-mark-all" 
                onClick={onMarkAllRead}
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
            <button className="btn-close" onClick={onClose} aria-label="Close notifications">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* List */}
        <div className="notifs-body">
          {notifications.length === 0 ? (
            <div className="notifs-empty">
              <Bell size={48} strokeWidth={1} />
              <p>You're all caught up!</p>
            </div>
          ) : (
            <ul className="notifs-list">
              {notifications.map((n, idx) => (
                <li key={`${n.notification_id || n.id}-${idx}`} className={`notifs-item ${n.isRead ? 'read' : 'unread'}`}>
                  
                  <div className="notifs-icon-col">
                    {n.isRead ? (
                       <div className="icon-circle read"><CheckCircle2 size={16} /></div>
                    ) : (
                       <div className="icon-circle unread"><Clock size={16} /></div>
                    )}
                  </div>

                  <div className="notifs-content">
                    <p className="notifs-message">{n.message}</p>
                    <span className="notifs-time">{n.created_at || n.createdAt}</span>
                  </div>

                  {!n.isRead && (
                    <button 
                      className="btn-mark-read" 
                      onClick={() => onMarkRead?.(n.notification_id || n.id)}
                      title="Mark as read"
                    >
                      <div className="mark-dot" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
