import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Messages.module.css'
import { useState, useEffect } from 'react'
import { Send, MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [messages, setMessages] = useState([
    { id: 1, from: 'user', text: 'Hi ReturnHub, I lost my backpack near IT Park.', time: '09:10 AM' },
    { id: 2, from: 'staff', text: 'Thanks for reaching out. Please provide a brief description and any identifying marks.', time: '09:12 AM' },
    { id: 3, from: 'user', text: 'It’s navy blue with a laptop compartment and a sticker on the front.', time: '09:14 AM' },
  ])

  const onSend = () => {
    const text = input.trim()
    if (!text) return
    const nextId = (messages[messages.length - 1]?.id || 0) + 1
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((p) => [...p, { id: nextId, from: 'user', text, time: now }])
    setInput('')
    setTimeout(() => {
      const replyId = nextId + 1
      setMessages((p) => [...p, { id: replyId, from: 'staff', text: 'Thanks, noted. We’ll update you once we have a match.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }, 600)
  }

  return (
    <div className={styles['messages-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />
      <div className="container" style={{ paddingTop: '4rem', marginLeft: sidebarOpen ? '250px' : '0' }}>
        <main className={styles['chat']}>
          <div className={styles['chat-header']}>
            <span className={styles['avatar']}><MessageSquare size={18} /></span>
            <div className={styles['chat-meta']}>
              <div className={styles['chat-name']}>ReturnHub</div>
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
  )
}
