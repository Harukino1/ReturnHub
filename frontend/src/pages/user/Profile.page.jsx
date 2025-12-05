import { useState, useEffect, useRef } from 'react'
import { User, Bell, Camera, Loader2, X, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Cropper from 'react-easy-crop'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Profile.module.css'
import { supabase } from '../../lib/supabaseClient'
import { getCroppedImg } from '../../lib/cropUtils'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [userId, setUserId] = useState(null)
  const [isEditing, setIsEditing] = useState(() => {
    try {
      return sessionStorage.getItem('profileEditing') === 'true'
    } catch {
      return false
    }
  })
  const [notification, setNotification] = useState(null)

  // Change Password State
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwLoading, setPwLoading] = useState(false)

  // Theme sync & Load Data
  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
    
    // Load user from localStorage first for immediate display
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.userId)
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
      if (user.profileImage) {
        setAvatarUrl(user.profileImage)
      }

      // Fetch latest data from backend
      fetchUserData(user.userId)
    }
  }, [])

  const fetchUserData = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/users/${id}`)
      const result = await response.json()
      
      if (result.success) {
        const { name, email, phone, profileImage } = result
        setFormData({
          name: name || '',
          email: email || '',
          phone: phone ? formatPhoneNumber(phone) : ''
        })
        if (profileImage) {
          setAvatarUrl(profileImage)
        }
        // Update localStorage
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          localStorage.setItem('user', JSON.stringify({ ...user, ...result }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      setNotification({ type: 'error', message: 'Failed to load latest profile data.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    if (!isEditing) return
    fileInputRef.current.click()
  }

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('Please upload a valid image (JPG, PNG, GIF).')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.')
        return
      }

      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result)
        setIsCropping(true)
      })
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleCropSave = async () => {
    try {
      setUploading(true)
      const oldAvatarUrl = avatarUrl
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)
      
      const fileName = `${userId}-${Date.now()}.jpg`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, croppedBlob, {
            contentType: 'image/jpeg',
            upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl
      setAvatarUrl(publicUrl)
      setIsCropping(false)
      setSelectedImage(null)

      await updateBackend({ ...formData, profileImage: publicUrl })

      if (oldAvatarUrl) {
        try {
          const urlParts = oldAvatarUrl.split('/')
          const lastPart = urlParts[urlParts.length - 1]
          const oldFileName = lastPart.split('?')[0] 

          if (oldAvatarUrl.includes('supabase') && oldFileName && oldFileName !== fileName) {
            await supabase.storage.from('profiles').remove([oldFileName])
          }
        } catch (deleteErr) {
          console.error('Error deleting old image:', deleteErr)
        }
      }

    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '')
    const truncated = cleaned.slice(0, 11)
    
    if (truncated.length > 7) {
      return `${truncated.slice(0, 4)} ${truncated.slice(4, 7)} ${truncated.slice(7)}`
    } else if (truncated.length > 4) {
      return `${truncated.slice(0, 4)} ${truncated.slice(4)}`
    }
    return truncated
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value)
      setFormData(prev => ({ ...prev, [name]: formatted }))
      
      const digitsOnly = formatted.replace(/\s/g, '')
      if (digitsOnly.length > 0 && (digitsOnly.length !== 11 || !digitsOnly.startsWith('09'))) {
        setErrors(prev => ({ ...prev, phone: 'Must be 11 digits starting with 09' }))
      } else {
        setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.phone
            return newErrors
        })
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format'

    const phoneDigits = formData.phone.replace(/\s/g, '')
    if (!phoneDigits) newErrors.phone = 'Phone number is required'
    else if (phoneDigits.length !== 11) newErrors.phone = 'Phone number must be exactly 11 digits'
    else if (!phoneDigits.startsWith('09')) newErrors.phone = 'Phone number must start with 09'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateBackend = async (dataToUpdate) => {
    try {
        const phoneClean = dataToUpdate.phone.replace(/\s/g, '')
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: dataToUpdate.name,
                email: dataToUpdate.email,
                phone: phoneClean,
                profileImage: dataToUpdate.profileImage || avatarUrl
            })
        })

        const result = await response.json()
        if (!result.success) throw new Error(result.message)

        const userStr = localStorage.getItem('user')
        if (userStr) {
            const currentUser = JSON.parse(userStr)
            const updatedUser = {
                ...currentUser,
                name: result.name || dataToUpdate.name,
                email: result.email || dataToUpdate.email,
                phone: result.phone || phoneClean,
                profileImage: result.profileImage || dataToUpdate.profileImage || avatarUrl
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        return true
    } catch (error) {
        console.error('Update error:', error)
        alert('Failed to update profile: ' + error.message)
        return false
    }
  }

  const validatePasswordForm = () => {
    const e = {}
    if (!pwForm.current.trim()) e.current = 'Current password is required'
    if (!pwForm.new.trim()) e.new = 'New password is required'
    else if (pwForm.new.length < 6) e.new = 'At least 6 characters'
    if (pwForm.confirm !== pwForm.new) e.confirm = 'Passwords do not match'
    setPwErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePasswordSubmit = async (ev) => {
    ev.preventDefault()
    if (!validatePasswordForm()) return
    setPwLoading(true)
    try {
      const bases = ['http://localhost:8080']
      let successResp = null
      for (const base of bases) {
        try {
          const res = await fetch(`${base}/api/users/${userId}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new })
          })
          const out = await res.json()
          if (res.ok && out?.success) { successResp = out; break }
          // If not ok, try next base
        } catch { void 0 }
      }
      if (!successResp) {
        setNotification({ type: 'error', message: 'Failed to update password.' })
      } else {
        setNotification({ type: 'success', message: 'Password updated successfully.' })
        setPwForm({ current: '', new: '', confirm: '' })
      }
    } catch (err) {
      console.error('Password change error:', err)
      setNotification({ type: 'error', message: 'Failed to update password.' })
    } finally {
      setPwLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setNotification(null)
    const success = await updateBackend(formData)
    if (success) {
        setNotification({ type: 'success', message: 'Profile updated successfully!' })
        setIsEditing(false)
    } else {
        setNotification({ type: 'error', message: 'Failed to update profile.' })
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'personal', label: 'Profile Information' },
    { id: 'account', label: 'Account Settings' },
    { id: 'notifications', label: 'Notifications' },
  ]

  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})
    setNotification(null)
    if (userId) fetchUserData(userId)
  }

  return (
    <div className={styles['profile-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />
      
      {/* IMPROVED CROP MODAL */}
      {isCropping && (
        <div className={styles['crop-modal-overlay']}>
          <div className={styles['crop-modal-content']}>
            
            {/* Header */}
            <div className={styles['crop-header']}>
              <h3>Adjust Profile Photo</h3>
              <button 
                onClick={() => setIsCropping(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                aria-label="Close"
              >
                <X size={20} className={styles['slider-icon']} />
              </button>
            </div>

            {/* Cropper Area */}
            <div className={styles['crop-area-wrapper']}>
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round" /* Circular mask for profile */
                showGrid={false} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls & Footer */}
            <div className={styles['crop-controls']}>
              <div className={styles['slider-container']}>
                <ImageIcon size={18} className={styles['slider-icon']} />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className={styles['crop-slider']}
                />
                <ImageIcon size={24} className={styles['slider-icon']} />
              </div>

              <div className={styles['crop-actions']}>
                <button 
                  onClick={() => setIsCropping(false)} 
                  className={styles['btn-action-secondary']}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCropSave} 
                  disabled={uploading} 
                  className={styles['btn-action-primary']}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="spinning" size={16} style={{ marginRight: '8px' }} />
                      Saving...
                    </>
                  ) : (
                    'Save & Update'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM CONTAINER */}
      <div 
        className={styles['profile-container']} 
        style={{ 
          paddingLeft: sidebarOpen ? '270px' : '2rem' 
        }}
      >
        <div className={styles['profile-layout']}>
          {/* Sidebar */}
          <aside className={styles['profile-sidebar']}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Profile</h1>
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
              {notification && (
                <div className={`${styles.notification} ${notification.type === 'error' ? styles['notification-error'] : styles['notification-success']}`}>
                  <span>{notification.message}</span>
                  <button onClick={() => setNotification(null)} aria-label="Close notification">
                    <X size={16} />
                  </button>
                </div>
              )}

              {activeTab === 'personal' && (
                <>
                  <div className={styles['profile-avatar-section']}>
                    <div className={styles['profile-avatar']} onClick={handleAvatarClick} style={{ cursor: isEditing ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={40} strokeWidth={1} />
                      )}
                      {uploading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Loader2 className="spinning" color="white" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/jpeg,image/png,image/gif"
                          style={{ display: 'none' }}
                        />
                        <button className={styles['profile-btn-update-top']} onClick={handleAvatarClick} disabled={uploading}>
                          {uploading ? 'Uploading...' : 'Update Photo'}
                        </button>
                      </>
                    )}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className={styles['profile-form-grid']}>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          className={styles['form-input']} 
                          value={formData.name} 
                          onChange={handleChange}
                          placeholder="e.g. Juan Dela Cruz"
                          disabled={!isEditing}
                        />
                        {errors.name && <span style={{ color: 'var(--amber-600)', fontSize: '0.8rem' }}>{errors.name}</span>}
                      </div>
                      
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          className={styles['form-input']} 
                          value={formData.email} 
                          onChange={handleChange}
                          placeholder="juan@example.com"
                          disabled={!isEditing}
                        />
                        {errors.email && <span style={{ color: 'var(--amber-600)', fontSize: '0.8rem' }}>{errors.email}</span>}
                      </div>

                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Phone Number</label>
                        <input 
                          type="text" 
                          name="phone"
                          className={styles['form-input']} 
                          value={formData.phone} 
                          onChange={handleChange}
                          placeholder="09XX XXX XXXX"
                          maxLength={13} 
                          disabled={!isEditing}
                        />
                        {errors.phone && <span style={{ color: 'var(--amber-600)', fontSize: '0.8rem' }}>{errors.phone}</span>}
                      </div>

                    
                    </div>
                    
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        {!isEditing ? (
                           <button 
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className={styles['btn-action-primary']}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    className={styles['btn-action-secondary']}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles['btn-action-primary']}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
                  </form>
                </>
              )}

              {activeTab === 'account' && (
                <>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className={styles['profile-form-grid']}>
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
                      <button type="button" className={styles['btn-action-secondary']} onClick={() => { setPwForm({ current: '', new: '', confirm: '' }); setPwErrors({}) }}>Cancel</button>
                      <button type="submit" className={styles['btn-action-primary']} disabled={pwLoading}>{pwLoading ? 'Updating...' : 'Update Password'}</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
    try { sessionStorage.removeItem('profileEditing') } catch { /* noop */ }
