import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, User, Loader2 } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/user/Profile.module.css'
import Cropper from 'react-easy-crop'
import { supabase } from '../../lib/supabaseClient'
import { getCroppedImg } from '../../lib/cropUtils'

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
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
    if (staff) {
      setFormData({ name: staff.name || '', email: staff.email || '' })
      if (staff.profileImage) setAvatarUrl(staff.profileImage)
    }
  }, [staff])

  const onBack = () => {
    const r = sessionStorage.getItem('returnRoute')
    if (r) {
      sessionStorage.removeItem('returnRoute')
      window.location.hash = `#/${r}`
      return
    }
    window.location.hash = '#/staff/dashboard'
  }

  const handleAvatarClick = () => {
    if (!isEditing) return
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) { alert('Please upload a valid image (JPG, PNG, GIF).'); return }
      if (file.size > 5 * 1024 * 1024) { alert('Image size must be less than 5MB.'); return }
      const reader = new FileReader()
      reader.addEventListener('load', () => { setSelectedImage(reader.result); setIsCropping(true) })
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = (_, pixels) => { setCroppedAreaPixels(pixels) }

  const updateLocal = (dataToUpdate) => {
    const s = localStorage.getItem('user')
    if (!s) return false
    try {
      const u = JSON.parse(s)
      const next = { ...u, name: dataToUpdate.name, email: dataToUpdate.email, profileImage: dataToUpdate.profileImage || u.profileImage }
      localStorage.setItem('user', JSON.stringify(next))
      setStaff(next)
      return true
    } catch (e) { console.error(e); return false }
  }

  const handleCropSave = async () => {
    try {
      setUploading(true)
      const oldAvatarUrl = avatarUrl
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels)
      const fileName = `${(staff?.staffId || staff?.userId || 'staff')}-${Date.now()}.jpg`
      const filePath = `${fileName}`
      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, croppedBlob, { contentType: 'image/jpeg', upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath)
      const publicUrl = data.publicUrl
      setAvatarUrl(publicUrl)
      setIsCropping(false)
      setSelectedImage(null)
      updateLocal({ ...formData, profileImage: publicUrl })
      if (oldAvatarUrl) { try { /* optional delete old */ } catch (e) { console.error(e) } }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image: ' + error.message)
    } finally {
      setUploading(false)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    const ok = updateLocal(formData)
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
              <button 
                onClick={onBack} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--gray-700)' }}
                aria-label="Go back"
              >
                <ArrowLeft size={24} />
              </button>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Profile</h1>
            <div className={styles['profile-tabs']}>
              <button className={`${styles['profile-tab']} ${activeTab === 'personal' ? styles.active : ''}`} onClick={() => setActiveTab('personal')}>Profile Information</button>
              <button className={`${styles['profile-tab']} ${activeTab === 'account' ? styles.active : ''}`} onClick={() => setActiveTab('account')}>Account Settings</button>
              <button className={`${styles['profile-tab']} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
              <a className={styles['profile-tab']} href="#/auth/login">Logout</a>
            </div>
          </aside>

          <main className={styles['profile-content']}>
            <div className={styles['profile-card']}>
              {isCropping && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '90%', height: '60%', background: '#333' }}>
                    <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', gap: 20 }}>
                    <button onClick={() => setIsCropping(false)} style={{ padding: '10px 20px', background: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleCropSave} disabled={uploading} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>{uploading ? 'Saving...' : 'Save & Upload'}</button>
                  </div>
                  <div style={{ marginTop: 10, width: '50%' }}>
                    <input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                </div>
              )}

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
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/gif" style={{ display: 'none' }} />
                    <button className={styles['profile-btn-update-top']} onClick={handleAvatarClick} disabled={uploading}>{uploading ? 'Uploading...' : 'Update Photo'}</button>
                  </>
                )}
              </div>

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
