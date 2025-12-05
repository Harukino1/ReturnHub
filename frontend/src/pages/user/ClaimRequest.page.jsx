import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/ClaimRequest.module.css'
import { Image, Upload, ArrowLeft } from 'lucide-react'

export default function ClaimRequestPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [note, setNote] = useState('')
  const [uniqueDetail, setUniqueDetail] = useState('')
  const [photos, setPhotos] = useState([])
  const [details] = useState(() => {
    try {
      const uStr = localStorage.getItem('user')
      const u = uStr ? JSON.parse(uStr) : null
      return { name: u?.name || 'Your Name', email: u?.email || 'you@example.com', phone: u?.phone || '' }
    } catch {
      return { name: 'Your Name', email: 'you@example.com', phone: '' }
    }
  })

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // Optional: Show selected item from sessionStorage
  const [selectedItem] = useState(() => {
    try {
      const s = sessionStorage.getItem('claimItem')
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

  const addPhoto = () => {
    if (photos.length >= 4) return
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
              onClick={() => {
                const r = sessionStorage.getItem('returnRoute')
                if (r) {
                  sessionStorage.removeItem('returnRoute')
                  window.location.hash = `#/${r}`
                } else {
                  window.location.hash = '#/dashboard'
                }
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className={styles['title']}>Claim Request</h1>
              <p className={styles['subtitle']}>Proof-of-ownership</p>
            </div>
          </div>
          {selectedItem && (
            <div className={styles['selected']}>Item: <strong>{selectedItem.title}</strong></div>
          )}
        </header>

        <div className={styles['grid']}>
          <section className={styles['left']}>
            <div className={styles['upload-bar']}>
              <button className={styles['upload-btn']} type="button" onClick={addPhoto}><Upload size={16} /> Upload Photo</button>
              <span className={styles['upload-count']}>{photos.length}/4</span>
            </div>
            <div className={styles['photo-grid']}>
              {[0,1,2,3].map((i) => (
                <div key={i} className={styles['photo-slot']}>{photos[i]?.url ? <img src={photos[i].url} alt="Proof" /> : <Image size={20} />}</div>
              ))}
            </div>
          </section>

          <section className={styles['right']}>
            <form onSubmit={onSubmit} className={styles['form']}>
              <div className={styles['group']}>
                <label className={styles['label']}>Note</label>
                <input className={styles['input']} placeholder="Explain why this item belongs to you." value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className={styles['group']}>
                <label className={styles['label']}>Unique Identifying Detail</label>
                <input className={styles['input']} placeholder="Enter Your Detail" value={uniqueDetail} onChange={(e) => setUniqueDetail(e.target.value)} />
                <div className={styles['helper']}>
                  <ul>
                    <li>Marks, scratches, engravings</li>
                    <li>Serial number or partial serial</li>
                    <li>Sticker placement or add-ons</li>
                    <li>Hidden compartments or color variations</li>
                    <li>Specific defect like "zipper broken on left"</li>
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
                <button type="submit" className="btn btn-primary" style={{ padding: '.9rem 1.8rem' }}>SUBMIT CLAIM</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

