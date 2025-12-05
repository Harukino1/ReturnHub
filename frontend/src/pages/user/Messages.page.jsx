import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Messages.module.css'
import { useState, useEffect, useRef } from 'react' // Added useRef
import { Send } from 'lucide-react'
import logoReturnHub from '../../assets/logo_retrurnhub.png'

export default function MessagesPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState('')
  const [user] = useState(() => {
    const uStr = localStorage.getItem('user')
    try { return uStr ? JSON.parse(uStr) : null } catch { return null }
  })
  
  // Reference for auto-scrolling
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [messages, setMessages] = useState([
    { id: 1, from: 'user', text: 'Hi ReturnHub, I lost my backpack near IT Park.', time: '09:10 AM' },
    { id: 2, from: 'staff', text: 'Thanks for reaching out. Please provide a brief description and any identifying marks.', time: '09:12 AM' },
    { id: 3, from: 'user', text: 'It’s navy blue with a laptop compartment and a sticker on the front.', time: '09:14 AM' },
  ])

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Trigger scroll whenever messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSend = () => {
    const text = input.trim()
    if (!text) return
    const nextId = (messages[messages.length - 1]?.id || 0) + 1
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    setMessages((p) => [...p, { id: nextId, from: 'user', text, time: now }])
    setInput('')
    
    // Simulate Staff Reply
    setTimeout(() => {
      const replyId = nextId + 1
      setMessages((p) => [...p, { 
        id: replyId, 
        from: 'staff', 
        text: 'Thanks, noted. We’ll update you once we have a match.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }])
    }, 600)
  }

  return (
    <div className={styles['messages-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />
      
      <div className="container" style={{ paddingTop: '4rem', paddingLeft: sidebarOpen ? '250px' : '0', transition: 'padding-left 0.3s' }}>
        <div className={styles['messages-wrap']}>
          
          <h1 className={styles['greet']}>Hello,{user?.name ? ` ${user.name}` : ' User Name'}</h1>
          
          <div className={styles['chat-stream']}>
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`${styles['msg']} ${m.from === 'staff' ? styles['msg-staff'] : styles['msg-user']}`}
              >
                {/* LOGIC SPLIT: Staff gets Header + Bubble, User gets just Bubble */}
                
                {m.from === 'staff' ? (
                  <>
                    {/* Row 1: Logo and Name */}
                    <div className={styles['msg-staff-header']}>
                      <span className={styles['staff-chip']}>
                        <img src={logoReturnHub} alt="ReturnHub" className={styles['staff-logo']} />
                      </span>
                      <span className={styles['staff-name']}>ReturnHub</span>
                    </div>

                    {/* Row 2: The Message Bubble */}
                    <div className={styles['msg-bubble']}>
                      {m.text}
                    </div>
                  </>
                ) : (
                  // User Message (Just the bubble)
                  <div className={styles['msg-bubble']}>
                    {m.text}
                  </div>
                )}

                {/* Timestamp below bubble */}
                <div className={styles['msg-time']}>{m.time}</div>
              </div>
            ))}
            
            {messages.length === 0 && <div className={styles['empty']}>No messages yet</div>}
            
            {/* Invisible element to anchor scroll to */}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles['prompt']} onSubmit={(e) => { e.preventDefault(); onSend() }}>
            <input 
              className={styles['prompt-input']} 
              placeholder="Ask us what's your concern..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button className={styles['prompt-send']} type="submit">
              <Send size={18} />
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
