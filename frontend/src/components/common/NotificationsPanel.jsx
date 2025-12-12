import { useMemo, useEffect, useState, useCallback } from 'react'
import { Bell, Check, X, Clock, CheckCircle2 } from 'lucide-react'
import '../../styles/components/NotificationsPanel.css'

// API Base URL
const API_BASE_URL = 'http://localhost:8080'
const API_NOTIFICATIONS = `${API_BASE_URL}/api/notifications`

export default function NotificationsPanel({ open, onClose, userType = 'user' }) {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState(null)

    // Get user/staff ID from localStorage
    useEffect(() => {
        try {
            const userData = localStorage.getItem('user')
            if (userData) {
                const user = JSON.parse(userData)
                setUserId(user.userId || user.staffId)
            }
        } catch (err) {
            console.error('Error loading user data:', err)
        }
    }, [])

    // Format relative time (e.g., "5 minutes ago", "2 hours ago")
    const formatRelativeTime = (dateStr) => {
        if (!dateStr) return ''

        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffSecs = Math.floor(diffMs / 1000)
        const diffMins = Math.floor(diffSecs / 60)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffSecs < 60) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Load notifications from backend
    const loadNotifications = useCallback(async () => {
        if (!userId) return

        setLoading(true)

        try {
            const res = await fetch(`${API_NOTIFICATIONS}/user/${userId}`, {
                credentials: 'include'
            })

            if (!res.ok) {
                throw new Error('Failed to load notifications')
            }

            const data = await res.json()

            if (Array.isArray(data)) {
                // Normalize notifications
                const normalized = data.map(notif => ({
                    id: notif.notificationId || notif.id,
                    notification_id: notif.notificationId || notif.id,
                    message: notif.message || notif.content,
                    isRead: notif.read || notif.isRead || false,
                    created_at: notif.createdAt || notif.created_at,
                    createdAt: notif.createdAt || notif.created_at,
                    type: notif.type || 'info',
                    relatedId: notif.relatedId || null
                }))

                // Sort by newest first
                normalized.sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                )

                setNotifications(normalized)
            }
        } catch (err) {
            console.error('Error loading notifications:', err)
        } finally {
            setLoading(false)
        }
    }, [userId])

    // Load notifications when panel opens
    useEffect(() => {
        if (open && userId) {
            loadNotifications()
        }
    }, [open, userId, loadNotifications])

    // Calculate unread count
    const unreadCount = useMemo(() =>
            notifications.filter(n => !n.isRead).length,
        [notifications]
    )

    // Mark single notification as read
    const onMarkRead = async (notificationId) => {
        if (!notificationId || !userId) return

        try {
            const res = await fetch(
                `${API_NOTIFICATIONS}/${notificationId}/read?userId=${userId}`,
                {
                    method: 'PUT',
                    credentials: 'include'
                }
            )

            if (!res.ok) {
                throw new Error('Failed to mark notification as read')
            }

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            )
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }

    // Mark all notifications as read
    const onMarkAllRead = async () => {
        if (!userId) return

        try {
            const res = await fetch(
                `${API_NOTIFICATIONS}/user/${userId}/read-all`,
                {
                    method: 'PUT',
                    credentials: 'include'
                }
            )

            if (!res.ok) {
                throw new Error('Failed to mark all as read')
            }

            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            )
        } catch (err) {
            console.error('Error marking all as read:', err)
        }
    }

    // Handle notification click (mark as read and navigate if needed)
    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            await onMarkRead(notification.id)
        }

        // Navigate based on notification type (optional)
        if (notification.relatedId && notification.type) {
            // Example: Navigate to related item
            if (notification.type === 'claim') {
                window.location.hash = `#/${userType}/claims`
            } else if (notification.type === 'report') {
                window.location.hash = `#/${userType}/reports`
            } else if (notification.type === 'message') {
                window.location.hash = `#/${userType}/messages`
            }

            // Close panel after navigation
            onClose?.()
        }
    }

    return (
        <>
            {/* Overlay backdrop for mobile or focus */}
            <div
                className={`notifs-overlay ${open ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`notifs-panel ${open ? 'open' : ''}`}
                aria-hidden={!open}
                role="complementary"
                aria-label="Notifications"
            >

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
                                aria-label="Mark all notifications as read"
                            >
                                Mark all read
                            </button>
                        )}
                        <button
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close notifications"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                {/* List */}
                <div className="notifs-body">
                    {loading ? (
                        // Loading State
                        <div className="notifs-empty">
                            <p>Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        // Empty State
                        <div className="notifs-empty">
                            <Bell size={48} strokeWidth={1} />
                            <p>You're all caught up!</p>
                        </div>
                    ) : (
                        // Notifications List
                        <ul className="notifs-list">
                            {notifications.map((n, idx) => (
                                <li
                                    key={`${n.notification_id || n.id}-${idx}`}
                                    className={`notifs-item ${n.isRead ? 'read' : 'unread'}`}
                                    onClick={() => handleNotificationClick(n)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            handleNotificationClick(n)
                                        }
                                    }}
                                >

                                    {/* Icon Column */}
                                    <div className="notifs-icon-col">
                                        {n.isRead ? (
                                            <div className="icon-circle read">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        ) : (
                                            <div className="icon-circle unread">
                                                <Clock size={16} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Column */}
                                    <div className="notifs-content">
                                        <p className="notifs-message">{n.message}</p>
                                        <span className="notifs-time">
                      {formatRelativeTime(n.created_at || n.createdAt)}
                    </span>
                                    </div>

                                    {/* Mark as Read Button (only for unread) */}
                                    {!n.isRead && (
                                        <button
                                            className="btn-mark-read"
                                            onClick={(e) => {
                                                e.stopPropagation() // Prevent item click
                                                onMarkRead(n.notification_id || n.id)
                                            }}
                                            title="Mark as read"
                                            aria-label="Mark notification as read"
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