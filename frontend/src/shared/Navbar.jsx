import { Menu, X, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar({ menuOpen, setMenuOpen }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="logo">Return<span className="logo-sep">|</span>Hub</div>
            <div className="menu">
              {['Home', 'About', 'Features', 'Contact Us'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g,'')}`}>{item}</a>
              ))}
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
            <div className="auth">
              <button className="login">Login</button>
              <button className="signup">Sign Up</button>
            </div>
            <button className="mobile-trigger" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-menu">
            {['Home', 'About', 'Features', 'Contact Us'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g,'')}`} onClick={() => setMenuOpen(false)}>{item}</a>
            ))}
            <div className="mobile-auth">
              <button className="login">Login</button>
              <button className="signup">Sign Up</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}