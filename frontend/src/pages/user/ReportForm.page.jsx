import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/ClaimRequest.module.css'
import { Image, Upload, ArrowLeft, Calendar } from 'lucide-react'

export default function ReportFormPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({
    itemName: '',
    category: '',
    location: '',
    date: '',
    description: '',
    uniqueDetail: ''
  })

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

  const addPhoto = () => {
    if (photos.length >= 3) return
    setPhotos((p) => [...p, { id: Date.now(), url: '' }])
  }

  const onSubmit = (e) => {
    e.preventDefault()
    window.location.hash = '#/dashboard'
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
        </header>

        <div className={styles['grid']}>
          <section className={styles['left']}>
            <div className={styles['upload-bar']}>
              <button className={styles['upload-btn']} type="button" onClick={addPhoto}><Upload size={16} /> Upload Photo</button>
              <span className={styles['upload-count']}>{photos.length}/3</span>
            </div>
            <div className={styles['photo-grid']}>
              {[0,1,2].map((i) => (
                <div key={i} className={styles['photo-slot']}>{photos[i]?.url ? <img src={photos[i].url} alt="Item" /> : <Image size={20} />}</div>
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

              {/* --- UPDATED DATE INPUT SECTION WITH GHOST ICON --- */}
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
                  {/* Custom icon that sits over the input when in 'text' mode */}
                  <Calendar className={styles['ghost-calendar-icon']} size={20} />
                </div>
              </div>
              {/* ------------------------------------------------ */}

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
                <button type="submit" className="btn btn-primary" style={{ padding: '.9rem 1.8rem' }}>SUBMIT REPORT</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}