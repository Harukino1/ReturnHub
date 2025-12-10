import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/ClaimRequest.module.css'
import { Image, Upload, ArrowLeft, Calendar } from 'lucide-react'
// import { supabase } from '../../lib/supabaseClient'

export default function ReportFormPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [photos, setPhotos] = useState([])
  const [photoFiles, setPhotoFiles] = useState([])
  const [form, setForm] = useState({
    itemName: '',
    category: '',
    location: '',
    date: '',
    description: '',
    uniqueDetail: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const CATEGORIES = [
    'Electronics & Gadgets',
    'Clothing & Apparel',
    'Home & Living',
    'Kitchen & Dining',
    'Health & Beauty',
    'Sports & Outdoors',
    'Toys & Hobbies',
    'Automotive & Industrial',
    'Office & School Supplies',
    'Books & Media',
    'Groceries & Pets',
    'Miscellaneous'
  ]

  const reportType = useMemo(() => {
    const h = window.location.hash || '#/report/found'
    if (h.includes('/report/lost')) return 'lost'
    return 'found'
  }, [])

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [details] = useState(() => {
    try {
      const uStr = localStorage.getItem('user')
      const u = uStr ? JSON.parse(uStr) : null
      return { name: u?.name || 'Your Name', email: u?.email || 'you@example.com', phone: u?.phone || '' }
    } catch {
      return { name: 'Your Name', email: 'you@example.com', phone: '' }
    }
  })

  const onFileSelect = (files) => {
    const list = Array.from(files || [])
    const validType = list.filter(f => ['image/jpeg','image/png','image/gif'].includes(f.type))
    const maxSize = 15 * 1024 * 1024
    const filtered = []
    for (const f of validType) {
      if (f.size <= maxSize) filtered.push(f)
    }
    if (filtered.length < list.length) {
      setNotification({ type: 'error', message: 'One or more photos exceed size limit (15MB).' })
    }
    const limited = filtered.slice(0, 3)
    const next = limited.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setPhotoFiles(next)
    setPhotos(next.map((n, i) => ({ id: i + 1, url: n.preview })))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const uStr = localStorage.getItem('user')
    if (!uStr) return
    const u = JSON.parse(uStr)
    const submitterUserId = u.userId
    if (!submitterUserId) return
    if (!form.itemName || !form.category || !form.location || !form.date || !form.description) return
    setSubmitting(true)

    try {
      const toIsoDate = (s) => {
        if (!s) return ''
        // If already ISO (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
        // Try DD/MM/YYYY or MM/DD/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
          const [a,b,c] = s.split('/')
          const dd = parseInt(a,10)
          const mm = parseInt(b,10)
          // Heuristic: if first part > 12, treat as DD/MM/YYYY, else assume MM/DD/YYYY
          const day = dd > 12 ? dd : mm
          const mon = dd > 12 ? mm : dd
          const yyyy = parseInt(c,10)
          const mStr = String(mon).padStart(2,'0')
          const dStr = String(day).padStart(2,'0')
          return `${yyyy}-${mStr}-${dStr}`
        }
        // Fallback: attempt Date parse
        const d = new Date(s)
        if (!isNaN(d)) {
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth()+1).padStart(2,'0')
          const dd = String(d.getDate()).padStart(2,'0')
          return `${yyyy}-${mm}-${dd}`
        }
        return ''
      }
      const uploadedUrls = []
      for (let i = 0; i < Math.min(3, photoFiles.length); i++) {
        const pf = photoFiles[i]
        const fd = new FormData()
        fd.append('userId', submitterUserId)
        fd.append('index', i)
        fd.append('file', pf.file)
        const upRes = await fetch('http://localhost:8080/api/uploads/report-photo', {
          method: 'POST',
          body: fd
        })
        if (!upRes.ok) {
          let msg = 'Upload failed'
          try { const j = await upRes.json(); if (j && j.message) msg = j.message } catch { void 0 }
          throw new Error(msg)
        }
        const upJson = await upRes.json()
        uploadedUrls.push(upJson.url)
      }

      const payload = {
        type: reportType,
        category: form.category,
        itemName: form.itemName,
        description: `${form.description}${form.uniqueDetail ? ` | ${form.uniqueDetail}` : ''}`,
        dateOfEvent: toIsoDate(form.date),
        location: form.location,
        photoUrl1: uploadedUrls[0] || null,
        photoUrl2: uploadedUrls[1] || null,
        photoUrl3: uploadedUrls[2] || null,
        submitterUserId
      }

      const res = await fetch('http://localhost:8080/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        let msg = 'Failed to submit report'
        try {
          const j = await res.json()
          if (j && j.message) msg = j.message
        } catch { void 0 }
        throw new Error(msg)
      }

      window.location.hash = '#/reports'
    } catch (err) {
      setNotification({ type: 'error', message: (err && err.message) ? err.message : 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles['claim-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />
      <div className={styles['claim-container']} style={{ paddingLeft: sidebarOpen ? '250px' : '2rem' }}>
        <header className={styles['claim-header']}>
          <div className={styles['header-left']}>
            <button
              type="button"
              className={styles['back-btn']}
              onClick={() => { window.location.hash = '#/dashboard' }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className={styles['title']}>{reportType === 'lost' ? 'Lost Item' : 'Found Item'}</h1>
            </div>
          </div>
          
          {/* --- UPDATED NOTIFICATION COLOR HERE --- */}
          {notification && (
            <div 
              className={`${styles['notice']} ${styles[notification.type]}`}
              style={{ color: '#FBBF24', borderColor: '#FBBF24' }} 
            >
              {notification.message}
            </div>
          )}
          {/* --------------------------------------- */}

        </header>

        <div className={styles['grid']}>
          <section className={styles['left']}>
            <div className={styles['upload-bar']}>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                style={{ display: 'none' }} 
                id="report-photo-input" 
                onChange={(e) => onFileSelect(e.target.files)}
              />
              <button className={styles['upload-btn']} type="button" onClick={() => document.getElementById('report-photo-input').click()}><Upload size={16} /> Upload Photo</button>
              <span className={styles['upload-count']}>{photos.length}/3</span>
            </div>
            <div className={styles['photo-grid']}>
              {[0,1,2].map((i) => (
                <div key={`slot-${i}`} className={styles['photo-slot']}>{photos[i]?.url ? <img src={photos[i].url} alt="Item" /> : <Image size={20} />}</div>
              ))}
            </div>
          </section>

          <section className={styles['right']}>
            <form onSubmit={onSubmit} className={styles['form']}>
              <div className={styles['group']}>
                <label className={styles['label']}>Item Name</label>
                <input 
                  className={styles['input']} 
                  placeholder="e.g. Black Leather Wallet" 
                  value={form.itemName} 
                  onChange={(e) => setForm((x) => ({ ...x, itemName: e.target.value }))} 
                />
              </div>
              <div className={styles['group']}>
                <label className={styles['label']}>Category</label>
                <select className={styles['input']} value={form.category} onChange={(e) => setForm((x) => ({ ...x, category: e.target.value }))}>
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={styles['group']}>
                <label className={styles['label']}>{reportType === 'lost' ? 'Location Lost' : 'Location Found'}</label>
                <input 
                  className={styles['input']} 
                  placeholder="e.g. Central Park, near the fountain" 
                  value={form.location} 
                  onChange={(e) => setForm((x) => ({ ...x, location: e.target.value }))} 
                />
                <div className={styles['helper']}>Provide a specific landmark or area if possible.</div>
              </div>

              <div className={styles['group']}>
                <label className={styles['label']}>{reportType === 'lost' ? 'Date lost' : 'Date found'}</label>
                <div className={styles['date-wrapper']}>
                  <input 
                    className={styles['input']} 
                    placeholder="mm/dd/yyyy"
                    type={form.date ? "date" : "text"} 
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                    value={form.date} 
                    onChange={(e) => setForm((x) => ({ ...x, date: e.target.value }))} 
                  />
                  <Calendar className={styles['ghost-calendar-icon']} size={20} />
                </div>
              </div>

              <div className={styles['group']}>
                <label className={styles['label']}>Item Descriptions</label>
                <input 
                  className={styles['input']} 
                  placeholder="e.g. Brand, color, size, distinguishing marks" 
                  value={form.description} 
                  onChange={(e) => setForm((x) => ({ ...x, description: e.target.value }))} 
                />
              </div>
              <div className={styles['group']}>
                <label className={styles['label']}>Unique Identifying Detail</label>
                <input 
                  className={styles['input']} 
                  placeholder="e.g. Serial number, initials engraved, specific scratch" 
                  value={form.uniqueDetail} 
                  onChange={(e) => setForm((x) => ({ ...x, uniqueDetail: e.target.value }))} 
                />
                <div className={styles['helper']}>
                  <ul>
                    <li>Marks, scratches, engravings</li>
                    <li>Serial number or partial serial</li>
                    <li>Sticker placement or add-ons</li>
                  </ul>
                </div>
              </div>

              <div className={styles['details']}>
                <div className={styles['details-head']}>
                  <span>Your Details</span>
                  <button type="button" className={styles['edit']} onClick={() => { try { sessionStorage.setItem('profileEditing', 'true') } catch { /* noop */ } window.location.hash = '#/profile' }}>Edit</button>
                </div>
                <div className={styles['details-grid']}>
                  <div>
                    <label className={styles['mini-label']}>Full Name</label>
                    <div className={styles['text']}>{details.name}</div>
                  </div>
                  <div>
                    <label className={styles['mini-label']}>Email Address</label>
                    <div className={styles['text']}>{details.email}</div>
                  </div>
                  <div>
                    <label className={styles['mini-label']}>Phone number</label>
                    <div className={styles['text']}>{details.phone || '—'}</div>
                  </div>
                </div>
              </div>
              <div className={styles['actions']}>
                <button type="submit" className="btn btn-primary" style={{ padding: '.9rem 1.8rem' }} disabled={submitting}>{submitting ? 'Submitting...' : 'SUBMIT REPORT'}</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
