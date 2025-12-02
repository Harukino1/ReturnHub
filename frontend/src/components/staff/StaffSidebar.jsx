import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, FileText, Package, BadgeCheck, Users, Settings, LogOut, User } from 'lucide-react'
import '../../styles/components/StaffSidebar.css'
import ConfirmModal from '../common/ConfirmModal'

export default function StaffSidebar({ open = true }) {
  const items = useMemo(() => ([
    { key: 'staff/dashboard', label: 'Dashboard', icon: LayoutGrid, href: '#/staff/dashboard' },
    { key: 'staff/reports', label: 'Reports', icon: FileText, href: '#/staff/reports' },
    { key: 'staff/inventory', label: 'Inventory', icon: Package, href: '#/staff/inventory' },
    { key: 'staff/claims', label: 'Claims', icon: BadgeCheck, href: '#/staff/claims' },
    { key: 'staff/users', label: 'User Management', icon: Users, href: '#/staff/users' },
    { key: 'staff/settings', label: 'Settings', icon: Settings, href: '#/staff/settings' },
  ]), [])

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [activeKey, setActiveKey] = useState(() => {
    const h = window.location.hash || '#/staff/dashboard'
    if (!h.startsWith('#/')) return 'staff/dashboard'
    return h.slice(2).replace(/\/$/, '')
  })
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash || '#/staff/dashboard'
      if (!h.startsWith('#/')) { setActiveKey('staff/dashboard'); return }
      setActiveKey(h.slice(2).replace(/\/$/, ''))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  return (
    <aside className={`staff-sidebar${open ? '' : ' collapsed'}`}>
      <div className="staff-sidebar-inner">
        <nav className="staff-nav">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeKey === item.key
            return (
              <a
                key={item.key}
                href={item.href}
                className={`staff-nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={18} />
                <span className="label">{item.label}</span>
                {isActive && <span className="chev">›</span>}
              </a>
            )
          })}
        </nav>
        <div className="staff-nav-bottom">
          <button
            className="staff-nav-item logout"
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
