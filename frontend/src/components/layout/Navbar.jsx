import { Menu, X, Sun, Moon, User, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import '../../styles/components/Navbar.css'

export default function Navbar({ menuOpen, setMenuOpen, variant = 'public', onHamburgerClick }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [user, setUser] = useState(null)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const isPrivate = variant === 'private'
  const isStaffHeader = isPrivate && typeof window !== 'undefined' && (window.location.hash || '').startsWith('#/staff/')

  useEffect(() => {
    if (isPrivate) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        let parsed = null
        try {
          parsed = JSON.parse(userStr)
        } catch {
          parsed = null
        }
        if (parsed) {
          setTimeout(() => setUser(parsed), 0)
        }
      }
    }
  }, [isPrivate])

  const profileHref = isPrivate && user ? ((user.role === 'ADMIN' || user.role === 'STAFF') ? '#/staff/profile' : '#/profile') : '#/profile'

  return (
    <nav className="navbar">
      <div className="nav-wide">
        <div className="nav-inner">
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
            <div className="logo">Return<span className="logo-sep">|</span>Hub{isStaffHeader ? ' Staff' : ''}</div>
            <div className="menu">
              {isPrivate ? (
                <>
                  {/* Intentionally empty for private header */}
                </>
              ) : (
                <>
                  <a href="#home">Home</a>
                  <a href="#about">About</a>
                  <a href="#features">Features</a>
                  <a href="#/contact">Contact Us</a>
                </>
              )}
            </div>
          </div>
          <div className="nav-right">
            <button
              className="theme-toggle"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {isPrivate ? (
              <>
                <button className="nav-icon-btn" aria-label="Notifications">
                  <Bell size={18} />
                </button>
                {!isStaffHeader && (
                  <a 
                    href={profileHref} 
                    className="nav-icon-btn" 
                    aria-label="User profile" 
                    style={{ padding: 0, borderRadius: '50%', width: '32px', height: '32px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}
                  >
                    {user && (user.profileImage || user.name) ? (
                      <img 
                        src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random` }}
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </a>
                )}
              </>
            ) : (
              <>
                <div className="nav-auth">
                  <a className="nav-login" href="#/auth/login">Login</a>
                  <a className="nav-signup" href="#/auth/signup">Sign Up</a>
                </div>
                <button className="mobile-trigger" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>
        {!isPrivate && menuOpen && (
          <div className="mobile-menu">
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#/contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
            <div className="mobile-auth">
              <a className="nav-login" href="#/auth/login" onClick={() => setMenuOpen(false)}>Login</a>
              <a className="nav-signup" href="#/auth/signup" onClick={() => setMenuOpen(false)}>Sign Up</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
