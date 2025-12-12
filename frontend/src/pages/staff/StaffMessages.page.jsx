import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Messages.module.css'
import { Search, Send, User as UserIcon } from 'lucide-react'

// API Base URLs
const API_BASE_URL = 'http://localhost:8080'
const API_CONVERSATIONS = `${API_BASE_URL}/api/conversations`
const WS_URL = 'ws://localhost:8080/ws' // WebSocket endpoint

export default function StaffMessagesPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [query, setQuery] = useState('')
    const [input, setInput] = useState('')

    // Data States
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [activeConversation, setActiveConversation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [sending, setSending] = useState(false)

    // Staff Info
    const [staffInfo, setStaffInfo] = useState(null)

    // WebSocket Reference
    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)
    const chatBodyRef = useRef(null)

    // Apply theme on mount
    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    // Get staff info from localStorage
    useEffect(() => {
        try {
            const userData = localStorage.getItem('user')
            if (userData) {
                const user = JSON.parse(userData)
                setStaffInfo({
                    staffId: user.staffId || user.userId,
                    name: user.name,
                    role: user.role
                })
            }
        } catch (err) {
            console.error('Error loading staff info:', err)
        }
    }, [])

    // Format time for messages
    const formatTime = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    // Format date for last message
    const formatLastMessage = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Load conversations for staff
    const loadConversations = useCallback(async () => {
        if (!staffInfo?.staffId) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_CONVERSATIONS}/staff/${staffInfo.staffId}`, {
                credentials: 'include'
            })

            if (!res.ok) {
                throw new Error('Failed to load conversations')
            }

            const data = await res.json()

            if (Array.isArray(data)) {
                // Normalize conversations
                const normalized = data.map(conv => ({
                    id: conv.conversationId,
                    userId: conv.userId,
                    staffId: conv.staffId,
                    name: conv.userName || 'User',
                    lastMessage: conv.lastMessage || 'No messages yet',
                    lastMessageTime: conv.lastMessageTime || conv.createdAt,
                    unread: conv.unreadCount || 0
                }))

                setConversations(normalized)

                // Auto-select first conversation or check for messageUserId from session
                const messageUserId = sessionStorage.getItem('messageUserId')
                if (messageUserId) {
                    const targetConv = normalized.find(c => c.userId === parseInt(messageUserId))
                    if (targetConv) {
                        setActiveConversation(targetConv)
                        sessionStorage.removeItem('messageUserId')
                    } else if (normalized.length > 0) {
                        setActiveConversation(normalized[0])
                    }
                } else if (normalized.length > 0) {
                    setActiveConversation(normalized[0])
                }
            }
        } catch (err) {
            console.error('Error loading conversations:', err)
            setError('Failed to load conversations.')
        } finally {
            setLoading(false)
        }
    }, [staffInfo])

    // Load conversations when staff info is available
    useEffect(() => {
        if (staffInfo) {
            loadConversations()
        }
    }, [staffInfo, loadConversations])

    // Load messages for active conversation
    const loadMessages = useCallback(async (conversationId) => {
        if (!conversationId) return

        try {
            const res = await fetch(`${API_CONVERSATIONS}/${conversationId}/messages`, {
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
                    conversationId: msg.conversationId,
                    from: msg.senderType?.toLowerCase() === 'staff' ? 'staff' : 'user',
                    senderId: msg.senderUserId || msg.senderStaffId,
                    text: msg.content || msg.message,
                    time: formatTime(msg.createdAt || msg.timestamp),
                    timestamp: msg.createdAt || msg.timestamp,
                    read: msg.read || msg.isRead
                }))

                setMessages(normalized)

                // Mark messages as read
                markMessagesAsRead(conversationId)
            }
        } catch (err) {
            console.error('Error loading messages:', err)
        }
    }, [])

    // Mark messages as read
    const markMessagesAsRead = async (conversationId) => {
        if (!conversationId) return

        try {
            await fetch(`${API_CONVERSATIONS}/${conversationId}/read?isUser=false`, {
                method: 'PUT',
                credentials: 'include'
            })

            // Update local unread count
            setConversations(prev =>
                prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c)
            )
        } catch (err) {
            console.error('Error marking messages as read:', err)
        }
    }

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversation?.id) {
            loadMessages(activeConversation.id)
        } else {
            setMessages([])
        }
    }, [activeConversation, loadMessages])

    // Scroll to bottom when messages change
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
        }
    }, [messages])

    // WebSocket Connection
    useEffect(() => {
        if (!staffInfo?.staffId || !activeConversation?.id) return

        // Connect to WebSocket
        const connectWebSocket = () => {
            try {
                const ws = new WebSocket(WS_URL)

                ws.onopen = () => {
                    console.log('WebSocket connected')
                    // Subscribe to conversation
                    ws.send(JSON.stringify({
                        type: 'subscribe',
                        conversationId: activeConversation.id
                    }))
                }

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)

                        if (data.type === 'message' && data.conversationId === activeConversation.id) {
                            // Add new message to list
                            const newMessage = {
                                id: data.messageId,
                                conversationId: data.conversationId,
                                from: data.senderType?.toLowerCase() === 'staff' ? 'staff' : 'user',
                                senderId: data.senderUserId || data.senderStaffId,
                                text: data.content,
                                time: formatTime(data.createdAt),
                                timestamp: data.createdAt,
                                read: false
                            }

                            setMessages(prev => [...prev, newMessage])

                            // Update last message in conversation list
                            setConversations(prev =>
                                prev.map(c =>
                                    c.id === activeConversation.id
                                        ? { ...c, lastMessage: data.content, lastMessageTime: data.createdAt }
                                        : c
                                )
                            )

                            // Auto-mark as read if from user
                            if (newMessage.from === 'user') {
                                markMessagesAsRead(activeConversation.id)
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
    }, [staffInfo, activeConversation])

    // Send message
    const onSend = async () => {
        const text = input.trim()
        if (!text || !activeConversation || !staffInfo) return

        setSending(true)

        try {
            const res = await fetch(`${API_CONVERSATIONS}/${activeConversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    senderId: staffInfo.staffId,
                    senderType: 'STAFF',
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
                conversationId: activeConversation.id,
                from: 'staff',
                senderId: staffInfo.staffId,
                text: text,
                time: formatTime(new Date()),
                timestamp: new Date().toISOString(),
                read: false
            }

            setMessages(prev => [...prev, newMessage])
            setInput('')

            // Update conversation last message
            setConversations(prev =>
                prev.map(c =>
                    c.id === activeConversation.id
                        ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
                        : c
                )
            )

        } catch (err) {
            console.error('Error sending message:', err)
            alert('Failed to send message. Please try again.')
        } finally {
            setSending(false)
        }
    }

    // Filter conversations by search query
    const filteredConvs = useMemo(() => {
        const q = query.trim().toLowerCase()
        return conversations.filter((c) =>
            !q ||
            c.name.toLowerCase().includes(q) ||
            c.lastMessage.toLowerCase().includes(q)
        )
    }, [conversations, query])

    // Handle conversation selection
    const handleSelectConversation = (conv) => {
        setActiveConversation(conv)
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

            {/* Staff Sidebar */}
            <StaffSidebar open={sidebarOpen} />

            {/* Messages Container */}
            <div
                className={styles['messages-container']}
                style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}
            >
                <div className={styles['messages-grid']}>

                    {/* Left Panel: Conversations List */}
                    <aside className={styles['list']}>
                        <div className={styles['list-header']}>
                            <h2 className={styles['list-title']}>Messages</h2>
                            <form className={styles['search']} onSubmit={(e) => e.preventDefault()}>
                                <input
                                    className={styles['search-input']}
                                    placeholder="Search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    aria-label="Search conversations"
                                />
                                <button
                                    className={styles['search-btn']}
                                    aria-label="Search"
                                    type="submit"
                                >
                                    <Search size={16} />
                                </button>
                            </form>
                        </div>

                        <div className={styles['conv-list']}>
                            {loading ? (
                                <div className={styles['empty']}>Loading conversations...</div>
                            ) : error ? (
                                <div className={styles['empty']} style={{ color: 'var(--red-500)' }}>
                                    {error}
                                </div>
                            ) : filteredConvs.length > 0 ? (
                                filteredConvs.map((c) => {
                                    const isActive = c.id === activeConversation?.id
                                    return (
                                        <button
                                            key={c.id}
                                            className={`${styles['conv-item']} ${isActive ? styles.active : ''}`}
                                            onClick={() => handleSelectConversation(c)}
                                        >
                      <span className={styles['avatar']}>
                        <UserIcon size={16} />
                      </span>
                                            <span className={styles['conv-meta']}>
                        <span className={styles['conv-name']}>{c.name}</span>
                        <span className={styles['conv-last']}>
                          {c.lastMessage.length > 40
                              ? c.lastMessage.substring(0, 40) + '...'
                              : c.lastMessage}
                        </span>
                      </span>
                                            <span className={styles['conv-time']}>
                        {formatLastMessage(c.lastMessageTime)}
                      </span>
                                            {c.unread > 0 && (
                                                <span className={styles['badge']}>{c.unread}</span>
                                            )}
                                        </button>
                                    )
                                })
                            ) : (
                                <div className={styles['empty']}>No conversations found</div>
                            )}
                        </div>
                    </aside>

                    {/* Right Panel: Chat Area */}
                    <main className={styles['chat']}>
                        {activeConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className={styles['chat-header']}>
                  <span className={styles['avatar']}>
                    <UserIcon size={18} />
                  </span>
                                    <div className={styles['chat-meta']}>
                                        <div className={styles['chat-name']}>
                                            {activeConversation.name}
                                        </div>
                                        <div className={styles['chat-sub']}>
                                            Secure conversation
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Body - Messages */}
                                <div className={styles['chat-body']} ref={chatBodyRef}>
                                    {messages.length > 0 ? (
                                        messages.map((m) => (
                                            <div
                                                key={m.id}
                                                className={`${styles['msg']} ${
                                                    m.from === 'staff' ? styles['msg-staff'] : styles['msg-user']
                                                }`}
                                            >
                                                <div className={styles['msg-bubble']}>{m.text}</div>
                                                <div className={styles['msg-time']}>{m.time}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles['empty']}>No messages yet</div>
                                    )}
                                </div>

                                {/* Chat Input */}
                                <form
                                    className={styles['chat-input']}
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        onSend()
                                    }}
                                >
                                    <input
                                        className={styles['input']}
                                        placeholder="Type a message"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={sending}
                                        aria-label="Message input"
                                    />
                                    <button
                                        className={styles['send']}
                                        type="submit"
                                        disabled={sending || !input.trim()}
                                        aria-label="Send message"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </>
                        ) : (
                            // No conversation selected
                            <div className={styles['empty']} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%'
                            }}>
                                <p>Select a conversation to start messaging</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}