import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Messages.module.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import logoReturnHub from '../../assets/logo_retrurnhub.png'

// API Base URLs
const API_BASE_URL = 'http://localhost:8080'
const API_CONVERSATIONS = `${API_BASE_URL}/api/conversations`
const WS_URL = 'ws://localhost:8080/ws' // WebSocket endpoint

export default function MessagesPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [input, setInput] = useState('')

    // User info from localStorage
    const [user, setUser] = useState(null)

    // Data states
    const [conversation, setConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    // References
    const messagesEndRef = useRef(null)
    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)

    // Apply theme on mount
    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    // Load user from localStorage
    useEffect(() => {
        const uStr = localStorage.getItem('user')
        try {
            const userData = uStr ? JSON.parse(uStr) : null
            setUser(userData)
        } catch {
            setUser(null)
        }
    }, [])

    // Scroll to bottom function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Trigger scroll whenever messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Format time for messages
    const formatTime = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    // Get or create conversation with staff
    const getOrCreateConversation = useCallback(async (userId) => {
        try {
            // For now, we'll use staffId = 1 (default staff)
            // In production, you might want to assign staff dynamically
            const staffId = 1

            const res = await fetch(`${API_CONVERSATIONS}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId, staffId })
            })

            if (!res.ok) {
                throw new Error('Failed to create/get conversation')
            }

            const data = await res.json()

            return {
                id: data.conversationId,
                userId: data.userId,
                staffId: data.staffId,
                createdAt: data.createdAt
            }
        } catch (err) {
            console.error('Error getting conversation:', err)
            return null
        }
    }, [])

    // Load conversation and messages
    const loadConversation = useCallback(async () => {
        if (!user?.userId) return

        setLoading(true)

        try {
            // Get or create conversation
            const conv = await getOrCreateConversation(user.userId)

            if (!conv) {
                throw new Error('Failed to load conversation')
            }

            setConversation(conv)

            // Load messages for this conversation
            const res = await fetch(`${API_CONVERSATIONS}/${conv.id}/messages`, {
                credentials: 'include'
            })

            if (!res.ok) {
                throw new Error('Failed to load messages')
            }

            const data = await res.json()

            if (Array.isArray(data)) {
                // Normalize messages
                const normalized = data.map(msg => ({
                    id: msg.messageId,
                    from: msg.senderType?.toLowerCase() === 'staff' ? 'staff' : 'user',
                    senderId: msg.senderUserId || msg.senderStaffId,
                    text: msg.content || msg.message,
                    time: formatTime(msg.createdAt || msg.timestamp),
                    timestamp: msg.createdAt || msg.timestamp
                }))

                setMessages(normalized)

                // Mark messages as read
                markMessagesAsRead(conv.id)
            }
        } catch (err) {
            console.error('Error loading conversation:', err)
        } finally {
            setLoading(false)
        }
    }, [user, getOrCreateConversation])

    // Load conversation when user is available
    useEffect(() => {
        if (user) {
            loadConversation()
        }
    }, [user, loadConversation])

    // Mark messages as read
    const markMessagesAsRead = async (conversationId) => {
        if (!conversationId) return

        try {
            await fetch(`${API_CONVERSATIONS}/${conversationId}/read?isUser=true`, {
                method: 'PUT',
                credentials: 'include'
            })
        } catch (err) {
            console.error('Error marking messages as read:', err)
        }
    }

    // WebSocket Connection
    useEffect(() => {
        if (!user?.userId || !conversation?.id) return

        // Connect to WebSocket
        const connectWebSocket = () => {
            try {
                const ws = new WebSocket(WS_URL)

                ws.onopen = () => {
                    console.log('WebSocket connected')
                    // Subscribe to conversation
                    ws.send(JSON.stringify({
                        type: 'subscribe',
                        conversationId: conversation.id
                    }))
                }

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)

                        if (data.type === 'message' && data.conversationId === conversation.id) {
                            // Add new message to list
                            const newMessage = {
                                id: data.messageId,
                                from: data.senderType?.toLowerCase() === 'staff' ? 'staff' : 'user',
                                senderId: data.senderUserId || data.senderStaffId,
                                text: data.content,
                                time: formatTime(data.createdAt),
                                timestamp: data.createdAt
                            }

                            setMessages(prev => [...prev, newMessage])

                            // Auto-mark as read if from staff
                            if (newMessage.from === 'staff') {
                                markMessagesAsRead(conversation.id)
                            }
                        }
                    } catch (err) {
                        console.error('Error processing WebSocket message:', err)
                    }
                }

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                }

                ws.onclose = () => {
                    console.log('WebSocket disconnected')
                    // Reconnect after 3 seconds
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('Reconnecting WebSocket...')
                        connectWebSocket()
                    }, 3000)
                }

                wsRef.current = ws
            } catch (err) {
                console.error('Error connecting WebSocket:', err)
            }
        }

        connectWebSocket()

        // Cleanup
        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [user, conversation])

    // Send message
    const onSend = async () => {
        const text = input.trim()
        if (!text || !conversation || !user) return

        setSending(true)

        try {
            const res = await fetch(`${API_CONVERSATIONS}/${conversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    senderId: user.userId,
                    senderType: 'USER',
                    content: text
                })
            })

            if (!res.ok) {
                throw new Error('Failed to send message')
            }

            const data = await res.json()

            // Add message to local state (also received via WebSocket, but this is faster)
            const newMessage = {
                id: data.messageId,
                from: 'user',
                senderId: user.userId,
                text: text,
                time: formatTime(new Date()),
                timestamp: new Date().toISOString()
            }

            setMessages(prev => [...prev, newMessage])
            setInput('')

        } catch (err) {
            console.error('Error sending message:', err)
            alert('Failed to send message. Please try again.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className={styles['messages-page']}>
            {/* Navigation Bar */}
            <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                variant="private"
                onHamburgerClick={() => setSidebarOpen((p) => !p)}
            />

            {/* User Sidebar */}
            <UserSidebar open={sidebarOpen} />

            {/* Messages Container */}
            <div
                className="container"
                style={{
                    paddingTop: '4rem',
                    paddingLeft: sidebarOpen ? '250px' : '0',
                    transition: 'padding-left 0.3s'
                }}
            >
                <div className={styles['messages-wrap']}>

                    {/* Greeting */}
                    <h1 className={styles['greet']}>
                        Hello, {user?.name ? user.name : 'User Name'}
                    </h1>

                    {/* Chat Stream */}
                    <div className={styles['chat-stream']}>
                        {loading ? (
                            // Loading State
                            <div className={styles['empty']}>Loading messages...</div>
                        ) : messages.length > 0 ? (
                            // Messages List
                            messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`${styles['msg']} ${
                                        m.from === 'staff' ? styles['msg-staff'] : styles['msg-user']
                                    }`}
                                >
                                    {/* Staff Message: Header + Bubble */}
                                    {m.from === 'staff' ? (
                                        <>
                                            {/* Row 1: Logo and Name */}
                                            <div className={styles['msg-staff-header']}>
                        <span className={styles['staff-chip']}>
                          <img
                              src={logoReturnHub}
                              alt="ReturnHub"
                              className={styles['staff-logo']}
                          />
                        </span>
                                                <span className={styles['staff-name']}>ReturnHub</span>
                                            </div>

                                            {/* Row 2: The Message Bubble */}
                                            <div className={styles['msg-bubble']}>
                                                {m.text}
                                            </div>
                                        </>
                                    ) : (
                                        // User Message: Just the bubble
                                        <div className={styles['msg-bubble']}>
                                            {m.text}
                                        </div>
                                    )}

                                    {/* Timestamp below bubble */}
                                    <div className={styles['msg-time']}>{m.time}</div>
                                </div>
                            ))
                        ) : (
                            // Empty State
                            <div className={styles['empty']}>
                                No messages yet. Start a conversation with ReturnHub!
                            </div>
                        )}

                        {/* Invisible element to anchor scroll to */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Form */}
                    <form
                        className={styles['prompt']}
                        onSubmit={(e) => {
                            e.preventDefault()
                            onSend()
                        }}
                    >
                        <input
                            className={styles['prompt-input']}
                            placeholder="Ask us what's your concern..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={sending || loading}
                            aria-label="Message input"
                        />
                        <button
                            className={styles['prompt-send']}
                            type="submit"
                            disabled={sending || loading || !input.trim()}
                            aria-label="Send message"
                        >
                            <Send size={18} />
                        </button>
                    </form>

                </div>
            </div>
        </div>
    )
}