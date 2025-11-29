import { useState, useEffect } from 'react'
import styles from '../../styles/pages/admin/AdminDashboard.module.css'

const API_BASE = 'http://localhost:8080/api/admin'

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'createStaff', 'resetPassword'
  const [selectedId, setSelectedId] = useState(null)
  const [formData, setFormData] = useState({})
  
  // Logout states
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const getAuthHeaders = () => ({
    'Authorization': localStorage.getItem('adminAuth'),
    'Content-Type': 'application/json'
  })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const headers = getAuthHeaders()
      if (activeTab === 'users') {
        const res = await fetch(`${API_BASE}/users`, { headers })
        if (res.ok) setUsers(await res.json())
      } else {
        const res = await fetch(`${API_BASE}/staff`, { headers })
        if (res.ok) setStaff(await res.json())
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Force light mode for admin pages
    document.documentElement.setAttribute('data-theme', 'light')
    fetchData()
  }, [activeTab])

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return
    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (res.ok) fetchData()
      else alert('Failed to delete')
    } catch (error) {
      alert('Error deleting')
    }
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    try {
      let url = ''
      let method = 'POST'
      
      if (modalType === 'createStaff') {
        url = `${API_BASE}/staff`
        formData.role = 'STAFF' // Default role
      } else if (modalType === 'resetPassword') {
        url = `${API_BASE}/staff/${selectedId}/reset-password`
        method = 'PUT'
      }

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({})
        fetchData()
      } else {
        alert('Operation failed')
      }
    } catch (error) {
      alert('Error submitting form')
    }
  }

  const openCreateStaff = () => {
    setModalType('createStaff')
    setFormData({ name: '', email: '', password: '' })
    setShowModal(true)
  }

  const openResetPassword = (id) => {
    setModalType('resetPassword')
    setSelectedId(id)
    setFormData({ password: '' })
    setShowModal(true)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
      onLogout()
    }, 2000)
  }

  return (
    <div className={styles['admin-dashboard']}>
      <header className={styles['admin-header']}>
        <div className={styles['admin-title']}>Return|Hub Admin</div>
        <button className={styles['admin-logout']} onClick={handleLogoutClick}>Logout</button>
      </header>

      <main className={styles['admin-content']}>
        <div className={styles['admin-tabs']}>
          <button 
            className={`${styles['admin-tab']} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`${styles['admin-tab']} ${activeTab === 'staff' ? styles.active : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff Management
          </button>
        </div>

        {activeTab === 'staff' && (
          <div className={styles['admin-actions']}>
            <button className="btn btn-primary" onClick={openCreateStaff}>+ Add Staff</button>
          </div>
        )}

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <table className={styles['data-table']}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                {activeTab === 'staff' && <th>Role</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'users' ? users : staff).map(item => (
                <tr key={item.userId || item.staffId}>
                  <td>{item.userId || item.staffId}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  {activeTab === 'staff' && <td>{item.role}</td>}
                  <td>
                    <button 
                      className={`${styles['action-btn']} ${styles.delete}`}
                      onClick={() => handleDelete(item.userId || item.staffId, activeTab)}
                    >
                      Delete
                    </button>
                    {activeTab === 'staff' && (
                      <button 
                        className={styles['action-btn']}
                        onClick={() => openResetPassword(item.staffId)}
                      >
                        Reset Password
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(activeTab === 'users' ? users : staff).length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>

      {showModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <h3>{modalType === 'createStaff' ? 'Create New Staff' : 'Reset Password'}</h3>
            <form onSubmit={handleModalSubmit} className="form-grid">
              {modalType === 'createStaff' && (
                <>
                  <div className="input-wrap">
                    <input 
                      className="input" 
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-wrap">
                    <input 
                      className="input" 
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </div>
                </>
              )}
              <div className="input-wrap">
                <input 
                  className="input" 
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {modalType === 'createStaff' ? 'Create Account' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']} style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h3>Confirm Logout</h3>
            <p style={{ marginBottom: '1.5rem' }}>Are you sure you want to log out?</p>
            
            {isLoggingOut ? (
              <div style={{ color: 'var(--amber-600)', fontWeight: 'bold' }}>Logging out safely...</div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                  onClick={confirmLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
