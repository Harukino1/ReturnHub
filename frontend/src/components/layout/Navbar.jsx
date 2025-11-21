import { Menu, X, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import '../../styles/components/Navbar.css'

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
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#features">Features</a>
              <a href="#/contact">Contact Us</a>
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
            <div className="nav-auth">
              <a className="nav-login" href="#/auth/login">Login</a>
              <a className="nav-signup" href="#/auth/signup">Sign Up</a>
            </div>
            <button className="mobile-trigger" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
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


