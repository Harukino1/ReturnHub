import { useState, useEffect } from 'react'
import { Lock, User } from 'lucide-react'
import styles from '../../styles/pages/admin/AdminLogin.module.css'

const API_BASE_URL = 'http://localhost:8080/api/admin'

export default function AdminLogin({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Force light mode for admin pages
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const text = await response.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }
      if (response.ok && data && data.success) {
        // Store credentials for Basic Auth (not secure for prod but fits requirements/time)
        const authHeader = 'Basic ' + btoa(formData.username + ':' + formData.password)
        localStorage.setItem('adminAuth', authHeader)
        localStorage.setItem('adminName', data.name)
        localStorage.setItem('user', JSON.stringify({
          staffId: data.staffId,
          name: data.name,
          email: data.email,
          profileImage: data.profileImage,
          role: data.role
        }))
        onLogin()
      } else {
        // Fallback: validate via Basic Auth against protected endpoint
        try {
          const authHeader = 'Basic ' + btoa(formData.username + ':' + formData.password)
          const res = await fetch(`${API_BASE_URL}/staff`, { headers: { Authorization: authHeader } })
          if (res.ok) {
            const list = await res.json()
            const me = Array.isArray(list) ? list.find(s => s.email === formData.username || s.name === formData.username) : null
            if (me) {
              localStorage.setItem('adminAuth', authHeader)
              localStorage.setItem('adminName', me.name)
              localStorage.setItem('user', JSON.stringify({
                staffId: me.staffId,
                name: me.name,
                email: me.email,
                profileImage: me.profileImage,
                role: me.role
              }))
              onLogin()
              return
            }
          }
          const msg = (data && data.message) || (response.status >= 500 ? `Server ${response.status} error. Check backend/database.` : 'Invalid credentials')
          setError(msg)
        } catch {
          setError('Server error. Please try again.')
        }
      }
    } catch (err) {
      console.error('Admin login error:', err)
      setError('Cannot reach server. Verify backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles['auth-page']} style={{ justifyContent: 'center', alignItems: 'center', background: '#f3f4f6' }}>
      <div className={styles['auth-grid']} style={{ maxWidth: '400px', width: '100%', gridTemplateColumns: '1fr' }}>
        <div className={styles['auth-right']}>
          <h2 className={styles['auth-title']} style={{ textAlign: 'center' }}>Admin Panel</h2>
          <p className={styles['auth-subtitle']} style={{ textAlign: 'center' }}>Secure Access Only</p>
          
          {error && <div className={styles['auth-error-message']}>{error}</div>}

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="input-wrap">
              <User className="icon-left" size={20} />
              <input
                className="input has-icon"
                type="text"
                name="username"
                placeholder="Username / Email"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-wrap">
              <Lock className="icon-left" size={20} />
              <input
                className="input has-icon"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button className="submit" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
