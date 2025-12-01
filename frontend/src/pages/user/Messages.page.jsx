import Navbar from '../../components/layout/Navbar'
import { useState, useEffect } from 'react'

export default function MessagesPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--white)', transition: 'background-color 0.3s ease' }}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" />
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', color: 'var(--gray-900)' }}>
        <h1>Messages</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: '1rem' }}>Messaging feature is coming soon.</p>
      </div>
    </div>
  )
}
