import { useEffect, useState } from 'react'
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
    
    setIsEditing(ok ? false : true)
    setLoading(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
    if (staff) setFormData({ name: staff.name || '', email: staff.email || '' })
  }

  return (
    <div className={styles['profile-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      <div className="container" style={{ marginLeft: sidebarOpen ? '250px' : '0' }}>
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
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
