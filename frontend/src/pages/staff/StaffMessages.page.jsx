import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Messages.module.css'
import { Search, Send, User as UserIcon } from 'lucide-react'

export default function StaffMessagesPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [input, setInput] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [conversations, setConversations] = useState([
    { id: 1, name: 'Jane Doe', lastMessage: 'Thank you for the update!', unread: 2 },
    { id: 2, name: 'John D', lastMessage: 'Can I claim tomorrow?', unread: 0 },
    { id: 3, name: 'Maria S', lastMessage: 'Sent my ID details.', unread: 1 },
  ])

  const [messagesByConv, setMessagesByConv] = useState({
    1: [
      { id: 1, from: 'user', text: 'Hi, any update?', time: '09:10 AM' },
      { id: 2, from: 'staff', text: 'Yes, item verified. Please bring your ID.', time: '09:12 AM' },
      { id: 3, from: 'user', text: 'Thank you for the update!', time: '09:18 AM' },
    ],
    2: [
      { id: 1, from: 'user', text: 'Can I claim tomorrow?', time: '08:02 PM' },
      { id: 2, from: 'staff', text: 'Yes, hub opens at 9AM.', time: '08:05 PM' },
    ],
    3: [
      { id: 1, from: 'user', text: 'Sent my ID details.', time: '03:21 PM' },
      { id: 2, from: 'staff', text: 'Received. We will review shortly.', time: '03:25 PM' },
    ],
  })

  const [activeId, setActiveId] = useState(1)

  const filteredConvs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return conversations.filter((c) => !q || c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q))
  }, [conversations, query])

  const messages = messagesByConv[activeId] || []

  const onSend = () => {
    const text = input.trim()
    if (!text) return
    const next = { id: (messages[messages.length - 1]?.id || 0) + 1, from: 'staff', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessagesByConv((p) => ({ ...p, [activeId]: [...messages, next] }))
    setInput('')
    setConversations((prev) => prev.map((c) => c.id === activeId ? { ...c, lastMessage: text, unread: 0 } : c))
  }

  return (
    <div className={styles['messages-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      
      {/* CUSTOM CONTAINER: Expands to 1600px */}
      <div 
        className={styles['messages-container']} 
        style={{ 
          paddingLeft: sidebarOpen ? '270px' : '2rem' 
        }}
      >
        <div className={styles['messages-grid']}>
          <aside className={styles['list']}> 
            <div className={styles['list-header']}>
              <h2 className={styles['list-title']}>Messages</h2>
              <form className={styles['search']} onSubmit={(e) => e.preventDefault()}>
                <input className={styles['search-input']} placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
                <button className={styles['search-btn']} aria-label="Search"><Search size={16} /></button>
              </form>
            </div>
            <div className={styles['conv-list']}>
              {filteredConvs.map((c) => {
                const isActive = c.id === activeId
                return (
                  <button key={c.id} className={`${styles['conv-item']} ${isActive ? styles.active : ''}`} onClick={() => setActiveId(c.id)}>
                    <span className={styles['avatar']}><UserIcon size={16} /></span>
                    <span className={styles['conv-meta']}>
                      <span className={styles['conv-name']}>{c.name}</span>
                      <span className={styles['conv-last']}>{c.lastMessage}</span>
                    </span>
                    {c.unread > 0 && <span className={styles['badge']}>{c.unread}</span>}
                  </button>
                )
              })}
              {filteredConvs.length === 0 && <div className={styles['empty']}>No conversations</div>}
            </div>
          </aside>

          <main className={styles['chat']}> 
            <div className={styles['chat-header']}>
              <span className={styles['avatar']}><UserIcon size={18} /></span>
              <div className={styles['chat-meta']}>
                <div className={styles['chat-name']}>{conversations.find((c) => c.id === activeId)?.name || 'Conversation'}</div>
                <div className={styles['chat-sub']}>Secure conversation</div>
              </div>
            </div>
            <div className={styles['chat-body']}>
              {messages.map((m) => (
                <div key={m.id} className={`${styles['msg']} ${m.from === 'staff' ? styles['msg-staff'] : styles['msg-user']}`}>
                  <div className={styles['msg-bubble']}>{m.text}</div>
                  <div className={styles['msg-time']}>{m.time}</div>
                </div>
              ))}
              {messages.length === 0 && <div className={styles['empty']}>No messages yet</div>}
            </div>
            <form className={styles['chat-input']} onSubmit={(e) => { e.preventDefault(); onSend() }}>
              <input className={styles['input']} placeholder="Type a message" value={input} onChange={(e) => setInput(e.target.value)} />
              <button className={styles['send']} type="submit"><Send size={16} /></button>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}