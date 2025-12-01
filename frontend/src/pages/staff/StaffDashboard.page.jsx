import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'

export default function StaffDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [staff, setStaff] = useState(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setStaff(userData)
      
      // Simple check to redirect if not staff (optional, but good for security)
      if (userData.role !== 'ADMIN' && userData.role !== 'STAFF') {
        // window.location.hash = '#/dashboard' 
        // Not forcing redirect yet as I want to test it first, but typically yes.
      }
    } else {
        window.location.hash = '#/auth/login'
    }
    
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--white)', transition: 'background-color 0.3s ease' }}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" />
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div style={{ 
            backgroundColor: 'var(--gray-50)', 
            padding: '2rem', 
            borderRadius: '1rem', 
            border: '1px solid var(--gray-200)' 
        }}>
            <h1 style={{ color: 'var(--gray-900)', marginBottom: '1rem' }}>Staff Dashboard</h1>
            {staff && (
                <div>
                    <p style={{ color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Welcome, <strong>{staff.name}</strong></p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>Role: <span style={{ 
                        display: 'inline-block', 
                        padding: '0.25rem 0.75rem', 
                        backgroundColor: 'var(--primary)', 
                        color: 'white', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600' 
                    }}>{staff.role}</span></p>
                </div>
            )}
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--gray-900)' }}>Overview</h2>
                <p style={{ color: 'var(--gray-600)' }}>This is a temporary dashboard to verify staff login functionality.</p>
            </div>
        </div>
      </div>
    </div>
  )
}
