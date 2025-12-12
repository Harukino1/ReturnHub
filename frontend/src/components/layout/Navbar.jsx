import { Menu, X, Sun, Moon, User, Bell } from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import NotificationsPanel from '../common/NotificationsPanel'
import '../../styles/components/Navbar.css'

// API Base URL
const API_BASE_URL = 'http://localhost:8080'
const API_NOTIFICATIONS = `${API_BASE_URL}/api/notifications`
const WS_URL = 'ws://localhost:8080/ws'

export default function Navbar({ menuOpen, setMenuOpen, variant = 'public', onHamburgerClick }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
    const [user, setUser] = useState(null)
    const [userType, setUserType] = useState('user')
    const [showNotifs, setShowNotifs] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    // WebSocket references
    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const isPrivate = variant === 'private'
    const isStaffHeader = isPrivate && typeof window !== 'undefined' && (window.location.hash || '').startsWith('#/staff/')

    // Load user from localStorage and determine type
    useEffect(() => {
        if (!isPrivate) return

        const userStr = localStorage.getItem('user')
        if (!userStr) return

        try {
            const parsed = JSON.parse(userStr)

            // Batch state updates to avoid cascading renders
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(parsed)

            // Determine user type
            if (parsed.role && (parsed.role === 'STAFF' || parsed.role === 'ADMIN')) {
                setUserType('staff')
            } else {
                setUserType('user')
            }
        } catch (err) {
            console.error('Error parsing user data:', err)
        }
    }, [isPrivate])

    // Profile link based on user type
    const profileHref = isPrivate && user
        ? ((user.role === 'ADMIN' || user.role === 'STAFF') ? '#/staff/profile' : '#/profile')
        : '#/profile'

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return

        const userId = user.userId || user.staffId
        if (!userId) return

        try {
            const res = await fetch(`${API_NOTIFICATIONS}/user/${userId}/unread-count`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setUnreadCount(data.count || 0)
            }
        } catch (err) {
            console.error('Error fetching unread count:', err)
        }
    }, [user])

    // Load unread count on mount and periodically
    useEffect(() => {
        if (!user) return

        // Initial fetch wrapped to avoid cascading render warning
        const loadInitialCount = async () => {
            await fetchUnreadCount()
        }

        loadInitialCount()

        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount()
        }, 30000)

        return () => clearInterval(interval)
    }, [user, fetchUnreadCount])

    // WebSocket for real-time notification updates
    useEffect(() => {
        if (!user) return

        const userId = user.userId || user.staffId
        if (!userId) return

        const connectWebSocket = () => {
            try {
                const ws = new WebSocket(WS_URL)

                ws.onopen = () => {
                    console.log('Notification WebSocket connected')
                    ws.send(JSON.stringify({
                        type: 'subscribe_notifications',
                        userId: userId
                    }))
                }

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)

                        if (data.type === 'notification') {
                            setUnreadCount(prev => prev + 1)

                            // Browser notification
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('ReturnHub', {
                                    body: data.message || 'You have a new notification',
                                    icon: '/favicon.ico'
                                })
                            }
                        } else if (data.type === 'notification_read') {
                            setUnreadCount(prev => Math.max(0, prev - 1))
                        }
                    } catch (err) {
                        console.error('Error processing WebSocket notification:', err)
                    }
                }

                ws.onerror = (error) => {
                    console.error('Notification WebSocket error:', error)
                }

                ws.onclose = () => {
                    console.log('Notification WebSocket disconnected')
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Reconnecting notification WebSocket...')
                        connectWebSocket()
                    }, 5000)
                }

                wsRef.current = ws
            } catch (err) {
                console.error('Error connecting notification WebSocket:', err)
            }
        }

        connectWebSocket()

        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }

        // Cleanup
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [user])

    // Refresh unread count when notification panel closes
    const handleCloseNotifications = useCallback(() => {
        setShowNotifs(false)
        fetchUnreadCount()
    }, [fetchUnreadCount])

    return (
        <>
            <nav className="navbar">
                <div className="nav-wide">
                    <div className="nav-inner">

                        {/* Left Side */}
                        <div className="nav-left">
                            {isPrivate && (
                                <button
                                    className="nav-icon-btn"
                                    aria-label="Toggle sidebar"
                                    onClick={() => onHamburgerClick?.()}
                                    style={{ marginRight: '.5rem' }}
                                >
                                    <Menu size={18} />
                                </button>
                            )}
                            <div className="logo">
                                Return<span className="logo-sep">|</span>Hub
                                {isStaffHeader ? ' Staff' : ''}
                            </div>
                            <div className="menu">
                                {!isPrivate && (
                                    <>
                                        <a href="#home">Home</a>
                                        <a href="#about">About</a>
                                        <a href="#features">Features</a>
                                        <a href="#/contact">Contact Us</a>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="nav-right">
                            {/* Theme Toggle */}
                            <button
                                className="theme-toggle"
                                aria-label="Toggle dark mode"
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>

                            {isPrivate ? (
                                <>
                                    {/* Notification Bell */}
                                    <button
                                        className="nav-icon-btn"
                                        aria-label="Notifications"
                                        onClick={() => setShowNotifs(p => !p)}
                                        style={{ position: 'relative' }}
                                    >
                                        <Bell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="notif-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                                        )}
                                    </button>

                                    {/* Profile Avatar */}
                                    {!isStaffHeader && (
                                        <a
                                            href={profileHref}
                                            className="nav-icon-btn"
                                            aria-label="User profile"
                                            style={{
                                                padding: 0,
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #e5e7eb'
                                            }}
                                        >
                                            {user?.profileImage || user?.name ? (
                                                <img
                                                    src={
                                                        user.profileImage ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`
                                                    }
                                                    alt="Profile"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`
                                                    }}
                                                />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </a>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Public Header Auth Links */}
                                    <div className="nav-auth">
                                        <a className="nav-login" href="#/auth/login">Login</a>
                                        <a className="nav-signup" href="#/auth/signup">Sign Up</a>
                                    </div>
                                    <button
                                        className="mobile-trigger"
                                        aria-label="Toggle menu"
                                        onClick={() => setMenuOpen(!menuOpen)}
                                    >
                                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {!isPrivate && menuOpen && (
                        <div className="mobile-menu">
                            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
                            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
                            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
                            <a href="#/contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
                            <div className="mobile-auth">
                                <a className="nav-login" href="#/auth/login" onClick={() => setMenuOpen(false)}>
                                    Login
                                </a>
                                <a className="nav-signup" href="#/auth/signup" onClick={() => setMenuOpen(false)}>
                                    Sign Up
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Notifications Panel */}
            {isPrivate && (
                <NotificationsPanel
                    open={showNotifs}
                    onClose={handleCloseNotifications}
                    userType={userType}
                />
            )}
        </>
    )
}