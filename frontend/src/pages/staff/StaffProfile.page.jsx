import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/user/Profile.module.css'

export default function StaffProfilePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [staff, setStaff] = useState(() => {
    try {
      const s = localStorage.getItem('user')
      return s ? JSON.parse(s) : null
    } catch (e) { void e; return null }
  })
  const [activeTab, setActiveTab] = useState('personal')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  
  // Notification State
  const [notification, setNotification] = useState(null)

  // Password Form State
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwLoading, setPwLoading] = useState(false)

  const API_BASE_ADMIN = 'http://localhost:8080/api/admin'

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
    if (staff) {
      setFormData({ name: staff.name || '', email: staff.email || '' })
      const id = staff.staffId || staff.userId
      const isStaff = staff.role === 'STAFF' || staff.role === 'ADMIN'
      const authHeader = localStorage.getItem('adminAuth')
      if (isStaff && authHeader) fetchStaffData(id)
    }
  }, [staff])

  const fetchStaffData = async (id) => {
    try {
      const headers = { 'Authorization': localStorage.getItem('adminAuth') || '' }
      const res = await fetch(`${API_BASE_ADMIN}/staff/${id}`, { headers })
      if (res.status === 401) return
      if (!res.ok) return
      const s = await res.json()
      setFormData({ name: s.name || '', email: s.email || '' })
      const uStr = localStorage.getItem('user')
      if (uStr) {
        const u = JSON.parse(uStr)
        localStorage.setItem('user', JSON.stringify({ ...u, name: s.name, email: s.email }))
      }
    } catch (e) {
      console.error('Fetch staff error:', e)
    }
  }

  const updateLocal = (dataToUpdate) => {
    try {
      const s = localStorage.getItem('user')
      if (!s) return false
      const u = JSON.parse(s)
      const next = { ...u, name: dataToUpdate.name, email: dataToUpdate.email }
      localStorage.setItem('user', JSON.stringify(next))
      setStaff(next)
      return true
    } catch (err) {
      console.error('Local update error:', err)
      return false
    }
  }

  const updateBackend = async (dataToUpdate) => {
    try {
      const s = localStorage.getItem('user')
      if (!s) throw new Error('Not logged in')
      const u = JSON.parse(s)
      const id = u.staffId || u.userId
      const isStaff = u.role === 'STAFF' || u.role === 'ADMIN'
      const authHeader = localStorage.getItem('adminAuth') || ''
      if (!isStaff || !authHeader) {
        return updateLocal(dataToUpdate)
      }
      const headers = { 'Content-Type': 'application/json', 'Authorization': authHeader }
      const res = await fetch(`${API_BASE_ADMIN}/staff/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: dataToUpdate.name,
          email: dataToUpdate.email,
          role: u.role || 'STAFF',
        })
      })
      if (res.status === 401) {
        return updateLocal(dataToUpdate)
      }
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      const next = { ...u, name: updated.name, email: updated.email, role: updated.role }
      localStorage.setItem('user', JSON.stringify(next))
      setStaff(next)
      return true
    } catch (err) {
      console.error('Staff update error:', err)
      return false
    }
  }

  const validateForm = () => {
    const n = {}
    if (!formData.name.trim()) n.name = 'Name is required'
    const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/
    if (!formData.email.trim()) n.email = 'Email is required'
    else if (!emailRegex.test(formData.email)) n.email = 'Invalid email format'
    setErrors(n)
    return Object.keys(n).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const ok = await updateBackend(formData)
    if (ok) {
        setNotification({ type: 'success', message: 'Profile updated successfully!' })
        setIsEditing(false)
    } else {
        setNotification({ type: 'error', message: 'Failed to update profile.' })
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
    setNotification(null)
    if (staff) setFormData({ name: staff.name || '', email: staff.email || '' })
  }

  // --- Password Logic ---

  const validatePasswordForm = () => {
    const e = {}
    if (!pwForm.current) e.current = 'Current password is required'
    if (!pwForm.new) e.new = 'New password is required'
    else if (pwForm.new.length < 6) e.new = 'At least 6 characters'
    if (pwForm.confirm !== pwForm.new) e.confirm = 'Passwords do not match'
    setPwErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!validatePasswordForm()) return
    setPwLoading(true)
    setNotification(null)

    try {
        // 1. Verify Current Password via Login
        const verifyRes = await fetch(`${API_BASE_ADMIN}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: staff.email, password: pwForm.current })
        })
        
        // Handle failed login/verification
        if (!verifyRes.ok) {
            setNotification({ type: 'error', message: 'Current password is incorrect.' })
            setPwLoading(false)
            return
        }
        
        const verifyData = await verifyRes.json()
        if (!verifyData.success) {
             setNotification({ type: 'error', message: 'Current password is incorrect.' })
             setPwLoading(false)
             return
        }

        // 2. Update Password if verified
        const id = staff.staffId || staff.userId
        const authHeader = localStorage.getItem('adminAuth') || ''

        const updateRes = await fetch(`${API_BASE_ADMIN}/staff/${id}/reset-password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({ password: pwForm.new })
        })

        if (!updateRes.ok) throw new Error('Failed to update password')

        // 3. Update stored Basic Auth to avoid logout/401 on next calls
        const newAuthHeader = 'Basic ' + btoa(staff.email + ':' + pwForm.new)
        localStorage.setItem('adminAuth', newAuthHeader)

        setNotification({ type: 'success', message: 'Password updated successfully.' })
        setPwForm({ current: '', new: '', confirm: '' })
        setPwErrors({})
        
    } catch (err) {
        console.error('Password change error:', err)
        setNotification({ type: 'error', message: 'Failed to update password.' })
    } finally {
        setPwLoading(false)
    }
  }

  return (
    <div className={styles['profile-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      
      {/* CUSTOM CONTAINER: Expands to 1600px */}
      <div 
        className={styles['profile-container']} 
        style={{ 
          paddingLeft: sidebarOpen ? '270px' : '2rem' 
        }}
      >
        <div className={styles['profile-layout']}>
          <aside className={styles['profile-sidebar']}>
            <div style={{ marginBottom: '1.5rem' }}>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Profile</h1>
            <div className={styles['profile-tabs']}>
              <button className={`${styles['profile-tab']} ${activeTab === 'personal' ? styles.active : ''}`} onClick={() => setActiveTab('personal')}>Profile Information</button>
              <button className={`${styles['profile-tab']} ${activeTab === 'account' ? styles.active : ''}`} onClick={() => setActiveTab('account')}>Account Settings</button>
              <button className={`${styles['profile-tab']} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
            </div>
          </aside>

          <main className={styles['profile-content']}>
            <div className={styles['profile-card']}>
              
              {/* Notification Banner */}
              {notification && (
                <div className={`${styles.notification} ${notification.type === 'error' ? styles['notification-error'] : styles['notification-success']}`}>
                  <span>{notification.message}</span>
                  <button onClick={() => setNotification(null)} aria-label="Close notification" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {activeTab === 'personal' && (
                <form onSubmit={handleSubmit}>
                  <div className={styles['profile-form-grid']}> 
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Full Name</label>
                      <input type="text" name="name" className={styles['form-input']} value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Staff Name" disabled={!isEditing} />
                      {errors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</span>}
                    </div>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Email Address</label>
                      <input type="email" name="email" className={styles['form-input']} value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="staff@example.com" disabled={!isEditing} />
                      {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
                    </div>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Role</label>
                      <input type="text" className={styles['form-input']} value={staff?.role || 'STAFF'} disabled />
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {!isEditing ? (
                      <button type="button" onClick={() => setIsEditing(true)} className={styles['btn-action-primary']}>Edit Profile</button>
                    ) : (
                      <>
                        <button type="button" onClick={handleCancel} className={styles['btn-action-secondary']}>Cancel</button>
                        <button type="submit" className={styles['btn-action-primary']} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                      </>
                    )}
                  </div>
                </form>
              )}

              {activeTab === 'account' && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className={styles['profile-form-grid']}>
                    {/* Current Password */}
                    <div className={`${styles['form-group']} ${styles['pw-current']}`}>
                      <label className={styles['form-label']}>Current Password</label>
                      <input 
                        type="password" 
                        className={styles['form-input']} 
                        value={pwForm.current}
                        onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      {pwErrors.current && <span style={{ color: 'var(--amber-600)', fontSize: '0.8rem' }}>{pwErrors.current}</span>}
                    </div>

                    {/* New Password */}
                    <div className={`${styles['form-group']} ${styles['pw-new']}`}>
                      <label className={styles['form-label']}>New Password</label>
                      <input 
                        type="password" 
                        className={styles['form-input']} 
                        value={pwForm.new}
                        onChange={(e) => setPwForm((p) => ({ ...p, new: e.target.value }))}
                        placeholder="Enter new password"
                      />
                      {pwErrors.new && <span style={{ color: 'var(--amber-600)', fontSize: '0.8rem' }}>{pwErrors.new}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className={`${styles['form-group']} ${styles['pw-confirm']}`}>
                      <label className={styles['form-label']}>Confirm New Password</label>
                      <input 
                        type="password" 
                        className={styles['form-input']} 
                        value={pwForm.confirm}
                        onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                        placeholder="Re-enter new password"
                      />
                      {pwErrors.confirm && <span style={{ color: 'var(--amber-600)', fontSize: '0.8rem' }}>{pwErrors.confirm}</span>}
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button 
                        type="button" 
                        className={styles['btn-action-secondary']} 
                        onClick={() => { 
                            setPwForm({ current: '', new: '', confirm: '' })
                            setPwErrors({}) 
                        }}
                    >
                        Cancel
                    </button>
                    <button type="submit" className={styles['btn-action-primary']} disabled={pwLoading}>
                        {pwLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}