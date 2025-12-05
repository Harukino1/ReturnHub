import { useEffect, useState } from 'react'
import LandingPage from './pages/public/Landing.page'
import AuthPage from './pages/public/Auth.page'
import ContactPage from './pages/public/Contact.page'
import Dashboard from './pages/user/Dashboard.page'
import ClaimRequestPage from './pages/user/ClaimRequest.page'
import ReportFormPage from './pages/user/ReportForm.page'
import ProfilePage from './pages/user/Profile.page'
import MessagesPage from './pages/user/Messages.page'
import ReportsPage from './pages/user/Reports.page'
import StaffDashboardPage from './pages/staff/StaffDashboard.page'
import StaffReportsPage from './pages/staff/StaffReports.page'
import StaffInventoryPage from './pages/staff/StaffInventory.page'
import StaffClaimsPage from './pages/staff/StaffClaims.page'
import StaffMessagesPage from './pages/staff/StaffMessages.page'
import StaffProfilePage from './pages/staff/StaffProfile.page'
import AdminLoginPage from './pages/admin/AdminLogin.page'
import AdminDashboard from './pages/admin/AdminDashboard.page'

export default function App() {
  const routeMap = (p) => {
    const path = p.endsWith('/') ? p.slice(0, -1) : p
    if (path.startsWith('auth')) return 'auth'
    if (path.startsWith('report/')) return 'report-form'
    const m = {
      'contact': 'contact',
      'dashboard': 'dashboard',
      'claim-request': 'claim-request',
      'report/found': 'report-form',
      'report/lost': 'report-form',
      'reports': 'reports',
      'profile': 'profile',
      'messages': 'messages',
      'staff/dashboard': 'staff-dashboard',
      'staff/profile': 'staff-profile',
      'staff/reports': 'staff-reports',
      'staff/inventory': 'staff-inventory',
      'staff/claims': 'staff-claims',
      'staff/messages': 'staff-messages',
      'admin-panel': 'admin'
    }
    if (m[path]) return m[path]
    if (path.startsWith('staff/')) return 'staff-dashboard'
    return 'landing'
  }
  const computeInitialRoute = () => {
    const h = window.location.hash || '#home'
    if (h.startsWith('#/')) {
      const rawPath = h.slice(2)
      return routeMap(rawPath)
    }
    return 'landing'
  }

  const computeInitialAuthMode = () => {
    const h = window.location.hash || '#home'
    if (h.startsWith('#/auth')) {
      const seg = h.slice(2).split('/')
      return seg[1] === 'signup' ? 'signup' : 'login'
    }
    return 'login'
  }

  const [currentPage, setCurrentPage] = useState(() => computeInitialRoute())
  const [authMode, setAuthMode] = useState(() => computeInitialAuthMode())
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('adminAuth'))

  // routeFromHash removed; routing handled directly in the hashchange effect

  useEffect(() => {
    let lastPath = (() => {
      const h = window.location.hash || '#home'
      if (h.startsWith('#/')) {
        const rawPath = h.slice(2)
        const p = rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath
        return p
      }
      return 'home'
    })()
    const onHash = () => {
      const h = window.location.hash || '#home'
      if (h.startsWith('#/')) {
        const rawPath = h.slice(2)
        const path = rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath
        if (path === 'profile' || path === 'staff/profile') {
          if (lastPath && lastPath !== 'profile') {
            sessionStorage.setItem('returnRoute', lastPath)
          }
        }
        if (path.startsWith('auth')) {
          setCurrentPage('auth')
          const seg = path.split('/')
          setAuthMode(seg[1] === 'signup' ? 'signup' : 'login')
        } else {
          setCurrentPage(routeMap(path))
        }
        lastPath = path
      } else {
        setCurrentPage('landing')
        lastPath = 'home'
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleNavigate = (target, opts = {}) => {
    if (target === 'auth') window.location.hash = `#/auth/${opts.mode === 'signup' ? 'signup' : 'login'}`
    else if (target === 'contact') window.location.hash = '#/contact'
    else if (target === 'dashboard') window.location.hash = '#/dashboard'
    else if (target === 'claim-request') window.location.hash = '#/claim-request'
    else if (target === 'report-found') window.location.hash = '#/report/found'
    else if (target === 'report-lost') window.location.hash = '#/report/lost'
    else if (target === 'reports') window.location.hash = '#/reports'
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
    window.location.hash = '#/auth/login'
  }

  if (currentPage === 'admin') {
    return isAdminLoggedIn 
      ? <AdminDashboard onLogout={handleAdminLogout} /> 
      : <AdminLoginPage onLogin={handleAdminLogin} />
  }

  if (currentPage === 'auth') return <AuthPage onNavigate={handleNavigate} authMode={authMode} />
  if (currentPage === 'contact') return <ContactPage onNavigate={handleNavigate} />
  if (currentPage === 'dashboard') return <Dashboard onNavigate={handleNavigate} />
  if (currentPage === 'claim-request') return <ClaimRequestPage onNavigate={handleNavigate} />
  if (currentPage === 'report-form') return <ReportFormPage onNavigate={handleNavigate} />
  if (currentPage === 'reports') return <ReportsPage onNavigate={handleNavigate} />
  if (currentPage === 'profile') return <ProfilePage onNavigate={handleNavigate} />
  if (currentPage === 'messages') return <MessagesPage onNavigate={handleNavigate} />
  if (currentPage === 'staff-dashboard') return <StaffDashboardPage onNavigate={handleNavigate} />
  if (currentPage === 'staff-reports') return <StaffReportsPage onNavigate={handleNavigate} />
  if (currentPage === 'staff-inventory') return <StaffInventoryPage onNavigate={handleNavigate} />
  if (currentPage === 'staff-claims') return <StaffClaimsPage onNavigate={handleNavigate} />
  if (currentPage === 'staff-messages') return <StaffMessagesPage onNavigate={handleNavigate} />
  if (currentPage === 'staff-profile') return <StaffProfilePage onNavigate={handleNavigate} />
  return <LandingPage onNavigate={handleNavigate} />
}
