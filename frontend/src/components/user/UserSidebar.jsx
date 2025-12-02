import { useEffect, useMemo, useState } from 'react'
import { Home, FileText, MessageSquare, Settings, LogOut } from 'lucide-react'
import '../../styles/components/UserSidebar.css'
import ConfirmModal from '../common/ConfirmModal'

export default function UserSidebar({ open = true }) {
  const items = useMemo(() => ([
    { key: 'dashboard', label: 'Home', icon: Home, href: '#/dashboard' },
    { key: 'reports', label: 'Your Reports', icon: FileText, href: '#/reports' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, href: '#/messages' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '#/profile' },
  ]), [])

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [activeKey, setActiveKey] = useState(() => {
    const h = window.location.hash || '#/dashboard'
    if (!h.startsWith('#/')) return 'dashboard'
    const path = h.slice(2).replace(/\/$/, '')
    if (path === 'profile') return 'settings'
    if (path === 'messages') return 'messages'
    if (path === 'reports') return 'reports'
    return 'dashboard'
  })
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash || '#/dashboard'
      if (!h.startsWith('#/')) { setActiveKey('dashboard'); return }
      const path = h.slice(2).replace(/\/$/, '')
      if (path === 'profile') setActiveKey('settings')
      else if (path === 'messages') setActiveKey('messages')
      else if (path === 'reports') setActiveKey('reports')
      else setActiveKey('dashboard')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  return (
    <aside className={`user-sidebar${open ? '' : ' collapsed'}`}>
      <div className="user-sidebar-inner">
        <nav className="user-nav">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeKey === item.key
            return (
              <a
                key={item.key}
                href={item.href}
                className={`user-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={18} />
                <span className="label">{item.label}</span>
                {isActive && <span className="chev">›</span>}
              </a>
            )
          })}
        </nav>
        <div className="user-nav-bottom">
          <button
            className="user-nav-item logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut size={18} />
            <span className="label">Logout</span>
          </button>
        </div>
        <ConfirmModal
          open={showLogoutConfirm}
          title="Logout"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Cancel"
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            localStorage.removeItem('user')
            setShowLogoutConfirm(false)
            window.location.hash = '#/auth/login'
          }}
          tone="danger"
        />
      </div>
    </aside>
  )
}
