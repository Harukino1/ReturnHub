import './index.css'
import './styles/global.css'
import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [authMode, setAuthMode] = useState('login')

  const routeFromHash = () => {
    const h = window.location.hash || '#home'
    if (h.startsWith('#/')) {
      const path = h.slice(2)
      if (path.startsWith('auth')) {
        setCurrentPage('auth')
        const seg = path.split('/')
        setAuthMode(seg[1] === 'signup' ? 'signup' : 'login')
      } else if (path === 'contact') setCurrentPage('contact')
      else setCurrentPage('landing')
    } else {
      setCurrentPage('landing')
    }
  }

  useEffect(() => {
    routeFromHash()
    const onHash = () => routeFromHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleNavigate = (target, opts = {}) => {
    if (target === 'auth') window.location.hash = `#/auth/${opts.mode === 'signup' ? 'signup' : 'login'}`
    else if (target === 'contact') window.location.hash = '#/contact'
    else window.location.hash = `#${target || 'home'}`
  }

  if (currentPage === 'auth') return <AuthPage onNavigate={handleNavigate} authMode={authMode} />
  if (currentPage === 'contact') return <ContactPage onNavigate={handleNavigate} />
  return <LandingPage onNavigate={handleNavigate} />
}
