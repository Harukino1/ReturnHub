import { useEffect, useState } from 'react'
import { LandingPage, AuthPage, ContactPage } from './pages/public'
import { Dashboard, ProfilePage, MessagesPage } from './pages/user'
import { AdminLoginPage, AdminDashboard } from './pages/admin'

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [authMode, setAuthMode] = useState('login')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminAuth'))

  const routeFromHash = () => {
    const h = window.location.hash || '#home'
    if (h.startsWith('#/')) {
      const path = h.slice(2)
      if (path.startsWith('auth')) {
        setCurrentPage('auth')
        const seg = path.split('/')
        setAuthMode(seg[1] === 'signup' ? 'signup' : 'login')
      } else if (path === 'contact') setCurrentPage('contact')
      else if (path === 'dashboard') setCurrentPage('dashboard')
      else if (path === 'profile') setCurrentPage('profile')
      else if (path === 'messages') setCurrentPage('messages')
      else if (path === 'admin-panel') setCurrentPage('admin')
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
    else if (target === 'dashboard') window.location.hash = '#/dashboard'
    else if (target === 'messages') window.location.hash = '#/messages'
    else if (target === 'admin') window.location.hash = '#/admin-panel'
    else window.location.hash = `#${target || 'home'}`
  }

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminName')
    setIsAdminLoggedIn(false)
  }

  if (currentPage === 'admin') {
    return isAdminLoggedIn 
      ? <AdminDashboard onLogout={handleAdminLogout} /> 
      : <AdminLoginPage onLogin={handleAdminLogin} />
  }

  if (currentPage === 'auth') return <AuthPage onNavigate={handleNavigate} authMode={authMode} />
  if (currentPage === 'contact') return <ContactPage onNavigate={handleNavigate} />
  if (currentPage === 'dashboard') return <Dashboard onNavigate={handleNavigate} />
  if (currentPage === 'profile') return <ProfilePage onNavigate={handleNavigate} />
  if (currentPage === 'messages') return <MessagesPage onNavigate={handleNavigate} />
  return <LandingPage onNavigate={handleNavigate} />
}
