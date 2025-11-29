import { useState, useEffect } from 'react'
import { User, Shield, Clock, Bell } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import '../styles/pages/ProfilePage.css'

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
    <div className="profile-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" />
      
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <h1>Profile</h1>
            <div className="profile-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="profile-content">
            <div className="profile-card">
              {activeTab === 'personal' && (
                <>
                  <div className="profile-avatar-section">
                    <div className="profile-avatar">
                      <User size={40} strokeWidth={1} />
                    </div>
                    <button className="profile-btn-update-top">Update</button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="profile-form-grid">
                      <div className="form-group">
                        <label className="form-label">First name</label>
                        <input 
                          type="text" 
                          name="firstName"
                          className="form-input" 
                          value={formData.firstName} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last name</label>
                        <input 
                          type="text" 
                          name="lastName"
                          className="form-input" 
                          value={formData.lastName} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Contact Number</label>
                        <input 
                          type="tel" 
                          name="contactNumber"
                          className="form-input" 
                          value={formData.contactNumber} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          className="form-input" 
                          value={formData.email} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Street</label>
                        <input 
                          type="text" 
                          name="street"
                          className="form-input" 
                          value={formData.street} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Barangay</label>
                        <input 
                          type="text" 
                          name="barangay"
                          className="form-input" 
                          value={formData.barangay} 
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input 
                          type="text" 
                          name="city"
                          className="form-input" 
                          value={formData.city} 
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Zip Code</label>
                        <input 
                          type="text" 
                          name="zipCode"
                          className="form-input" 
                          value={formData.zipCode} 
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <button type="submit" className="profile-submit-btn">
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
