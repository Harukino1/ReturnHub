import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'

export default function StaffDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--white)', transition: 'background-color 0.3s ease' }}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      <div className="container" style={{ paddingTop: '4rem', marginLeft: sidebarOpen ? '250px' : '0' }}>
        <h1 style={{ fontWeight: 800 }}>Dashboard</h1>
      </div>
    </div>
  )
}
