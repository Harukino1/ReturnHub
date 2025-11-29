import { useState, useEffect } from 'react'
import { User, Shield, Clock, Bell } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import styles from '../../styles/pages/user/Profile.module.css'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal')
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Theme sync
  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity History', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const [formData, setFormData] = useState({
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    contactNumber: '09123456789',
    email: 'juandelacruz@example.com',
    street: '123 Rizal St.',
    barangay: 'San Antonio',
    city: 'Makati City',
    zipCode: '1200'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Logic to update profile would go here
    console.log('Updating profile:', formData)
  }

  return (
    <div className={styles['profile-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" />
      
      <div className="container">
        <div className={styles['profile-layout']}>
          {/* Sidebar */}
          <aside className={styles['profile-sidebar']}>
            <h1>Profile</h1>
            <div className={styles['profile-tabs']}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles['profile-tab']} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles['profile-content']}>
            <div className={styles['profile-card']}>
              {activeTab === 'personal' && (
                <>
                  <div className={styles['profile-avatar-section']}>
                    <div className={styles['profile-avatar']}>
                      <User size={40} strokeWidth={1} />
                    </div>
                    <button className={styles['profile-btn-update-top']}>Update</button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className={styles['profile-form-grid']}>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>First name</label>
                        <input 
                          type="text" 
                          name="firstName"
                          className={styles['form-input']} 
                          value={formData.firstName} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Last name</label>
                        <input 
                          type="text" 
                          name="lastName"
                          className={styles['form-input']} 
                          value={formData.lastName} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className={`${styles['form-group']} ${styles['full-width']}`}>
                        <label className={styles['form-label']}>Contact Number</label>
                        <input 
                          type="tel" 
                          name="contactNumber"
                          className={styles['form-input']} 
                          value={formData.contactNumber} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className={`${styles['form-group']} ${styles['full-width']}`}>
                        <label className={styles['form-label']}>Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          className={styles['form-input']} 
                          value={formData.email} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Street</label>
                        <input 
                          type="text" 
                          name="street"
                          className={styles['form-input']} 
                          value={formData.street} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Barangay</label>
                        <input 
                          type="text" 
                          name="barangay"
                          className={styles['form-input']} 
                          value={formData.barangay} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>City</label>
                        <input 
                          type="text" 
                          name="city"
                          className={styles['form-input']} 
                          value={formData.city} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Zip Code</label>
                        <input 
                          type="text" 
                          name="zipCode"
                          className={styles['form-input']} 
                          value={formData.zipCode} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <button type="submit" className={styles['profile-submit-btn']}>
                      Update Information
                    </button>
                  </form>
                </>
              )}
              
              {activeTab !== 'personal' && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                  <p>Content for {tabs.find(t => t.id === activeTab)?.label} goes here.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
