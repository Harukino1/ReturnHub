import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Reports.module.css'
import { Search, Image, Eye, Plus, Filter, X, CheckCircle, XCircle, Globe, Archive, Upload, AlertCircle, Camera } from 'lucide-react'

export default function StaffReportsPage() {
  // ... (Keep existing state and logic: menuOpen, query, reports, filtering, etc.) ...
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending') 
  const [typeFilter, setTypeFilter] = useState('All')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  // UPDATED FORM STATE
  const [form, setForm] = useState({ 
    name: '', 
    type: 'found', 
    category: '', 
    location: '', 
    date: '', 
    reporterName: '', 
    reporterPhone: '',
    reporterEmail: '',
    description: '',
    uniqueDetail: '',
    status: 'Published', 
    photos: [] 
  })

  const CATEGORIES = [
    'Electronics', 'Clothing', 'Personal', 'Keys', 'Documents', 'Bags', 'Others'
  ]

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // Mock Data (Keep existing)
  const [reports, setReports] = useState([
    { id: 1, name: 'Black Backpack', type: 'found', date: '11/28/2025', category: 'Bags', location: 'Cebu City', reporter: 'Pao Gwapo', status: 'Pending', description: 'Found near the grandstand.', uniqueDetail: 'Sticker of a cat on bottom', claimsCount: 2, photoUrl: '' },
    { id: 2, name: 'Brown Leather Wallet', type: 'lost', date: '11/27/2025', category: 'Personal', location: 'Mandaue', reporter: 'Jane Doe', status: 'Published', description: 'Lost near the public market.', uniqueDetail: 'Initials JD embossed', claimsCount: 0, photoUrl: '' },
  ])

  // Filter Logic (Keep existing)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports.filter((r) => {
      const matchTab = activeTab === 'all' || r.status.toLowerCase() === activeTab.toLowerCase()
      const matchType = typeFilter === 'All' || r.type.toLowerCase() === typeFilter.toLowerCase()
      const matchSearch = !q || [r.name, r.category, r.location, r.reporter].some(v => v?.toLowerCase().includes(q))
      return matchTab && matchType && matchSearch
    })
  }, [reports, query, activeTab, typeFilter])

  // Handlers (Keep existing)
  const handleStatusUpdate = (id, newStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    setSelectedReport(null) 
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    const remainingSlots = 3 - form.photos.length
    if (remainingSlots <= 0) return
    const toAdd = files.slice(0, remainingSlots)
    const newPhotos = toAdd.map(file => URL.createObjectURL(file))
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
  }

  const removePhoto = (index) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))
  }

  return (
    <div className={styles['reports-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      
      <div className={styles['reports-container']} style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}>
        {/* ... (Header, Tabs, Table - Keep existing JSX) ... */}
        {/* Header */}
        <div className={styles['reports-header']}>
          <div className={styles['reports-title-group']}>
            <h1 className={styles['reports-title']}>Reports Management</h1>
            <p className={styles['reports-subtitle']}>Triaging pending reports and managing published items.</p>
          </div>
          <div className={styles['controls']}>
            <div className={styles['search-box']}>
              <Search size={18} />
              <input className={styles['search-input']} placeholder="Search reports..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className={styles['filter-box']}>
              <Filter size={16} />
              <select className={styles['filter-select']} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Lost">Lost Items</option>
                <option value="Found">Found Items</option>
              </select>
            </div>
            <button className={styles['btn-add']} onClick={() => setShowAdd(true)}>
              <Plus size={18} /> <span>Add Report</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles['reports-tabs']}>
          <button className={`${styles['reports-tab']} ${activeTab === 'pending' ? styles.active : ''}`} onClick={() => setActiveTab('pending')}>
            Pending <span className={styles['tab-count']}>{reports.filter(r => r.status === 'Pending').length}</span>
          </button>
          <button className={`${styles['reports-tab']} ${activeTab === 'published' ? styles.active : ''}`} onClick={() => setActiveTab('published')}>
            Published (Live)
          </button>
          <button className={`${styles['reports-tab']} ${activeTab === 'rejected' ? styles.active : ''}`} onClick={() => setActiveTab('rejected')}>
            Rejected
          </button>
          <button className={`${styles['reports-tab']} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>
            All Records
          </button>
        </div>

        {/* Table */}
        <div className={styles['reports-content']}>
          <div className={styles['table-responsive']}>
            <table className={styles['reports-table']}>
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className={styles['item-cell']}>
                        <div className={styles['thumb']}>
                          {r.photoUrl ? <img className={styles['thumb-image']} src={r.photoUrl} alt={r.name} /> : <Image size={20} />}
                        </div>
                        <div>
                          <div className={styles['item-name']}>{r.name}</div>
                          <div className={styles['item-category']}>{r.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}><span className={`${styles['type-badge']} ${styles[r.type]}`}>{r.type}</span></td>
                    <td>{r.date}</td>
                    <td>{r.location}</td>
                    <td>{r.reporter}</td>
                    <td><span className={`${styles['status-badge']} ${styles[r.status.toLowerCase()]}`}>{r.status === 'Published' && <Globe size={12} style={{marginRight:'4px'}} />}{r.status}</span></td>
                    <td><button className={styles['action-btn']} onClick={() => setSelectedReport(r)}><Eye size={16} /> Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ... (Keep Review Modal JSX) ... */}
        {selectedReport && (
          <div className={styles['modal-overlay']} onClick={() => setSelectedReport(null)}>
            <div className={styles['modal']} onClick={e => e.stopPropagation()}>
              <div className={styles['modal-header']}>
                <h3 className={styles['modal-title']}>{selectedReport.status === 'Published' ? 'Item Details' : 'Review Report'}</h3>
                <button className={styles['modal-close']} onClick={() => setSelectedReport(null)}><X size={20} /></button>
              </div>
              <div className={styles['modal-scroll-content']}>
                <div className={styles['modal-body-grid']}>
                  <div className={styles['modal-image-col']}>
                    {selectedReport.photoUrl ? <img src={selectedReport.photoUrl} alt="Proof" className={styles['detail-image']} /> : <Image size={64} />}
                  </div>
                  <div className={styles['modal-details-col']}>
                    <div className={styles['detail-row']}><label>Item</label><div className={styles['detail-value']}>{selectedReport.name}</div></div>
                    <div className={styles['detail-row']}><label>Detail (Staff)</label><div className={styles['detail-value']} style={{color:'var(--amber-600)'}}>{selectedReport.uniqueDetail}</div></div>
                    <div className={styles['detail-row']}><label>Desc</label><div className={styles['detail-value']}>{selectedReport.description}</div></div>
                  </div>
                </div>
              </div>
              <div className={styles['modal-footer']}>
                <button className={styles['btn-reject']} onClick={() => setSelectedReport(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* --- ADD MANUAL REPORT MODAL (REFINED) --- */}
        {showAdd && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal']}>
              <div className={styles['modal-header']}>
                <h3 className={styles['modal-title']}>Create Manual Report</h3>
                <button className={styles['modal-close']} onClick={() => setShowAdd(false)}><X size={20} /></button>
              </div>
              
              <form
                className={styles['modal-scroll-content']}
                onSubmit={(e) => {
                  e.preventDefault()
                  const id = (reports[reports.length - 1]?.id || 0) + 1
                  const payload = { 
                    id, ...form, reporter: form.reporterName, photoUrl: form.photos[0] || '' 
                  }
                  setReports((p) => [payload, ...p])
                  setShowAdd(false)
                  setForm({ name: '', type: 'found', category: '', location: '', date: '', reporterName: '', reporterPhone: '', reporterEmail: '', description: '', uniqueDetail: '', status: 'Published', photos: [] })
                }}
              >
                {/* 1. Report Type Toggle */}
                <div className={styles['toggle-container']}>
                  <button type="button" className={`${styles['toggle-btn']} ${form.type === 'lost' ? styles.active : ''}`} onClick={() => setForm({ ...form, type: 'lost' })}>Lost Item</button>
                  <button type="button" className={`${styles['toggle-btn']} ${form.type === 'found' ? styles.active : ''}`} onClick={() => setForm({ ...form, type: 'found' })}>Found Item</button>
                </div>

                {/* 2. Photo Upload */}
                <div className={styles['photo-upload-container']}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                    <span style={{fontSize:'0.75rem', fontWeight:'600', color:'#6b7280'}}>ITEM PHOTOS</span>
                    <span style={{fontSize:'0.75rem', color:'#9ca3af'}}>{form.photos.length}/3</span>
                  </div>
                  <div className={styles['photo-grid']}>
                    {form.photos.map((src, idx) => (
                      <div key={idx} className={styles['photo-slot']}>
                        <img src={src} alt={`Upload ${idx}`} />
                        <button type="button" className={styles['photo-remove']} onClick={() => removePhoto(idx)}><X size={12} /></button>
                      </div>
                    ))}
                    {form.photos.length < 3 && (
                      <label className={`${styles['photo-slot']} ${styles['upload-trigger']}`}>
                        <Camera size={20} />
                        <span style={{fontSize:'0.7rem'}}>Add</span>
                        <input type="file" hidden accept="image/*" multiple onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* 3. Item Information */}
                <div>
                  <h4 className={styles['form-section-title']}>Item Information</h4>
                  <div className={styles['form-row']}>
                    <div className={styles['input-wrap']}>
                      <label>Item Name *</label>
                      <input className={styles['input']} placeholder="e.g. Black Wallet" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className={styles['input-wrap']}>
                      <label>Category *</label>
                      <select className={styles['input']} value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className={styles['form-row']} style={{marginTop:'1rem'}}>
                    <div className={styles['input-wrap']}>
                      <label>Location *</label>
                      <input className={styles['input']} placeholder="Where was it seen?" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                    </div>
                    <div className={styles['input-wrap']}>
                      <label>Date *</label>
                      <input type="date" className={styles['input']} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                    </div>
                  </div>
                </div>

                {/* 4. Reporter Information */}
                <div>
                  <h4 className={styles['form-section-title']}>Reporter Information</h4>
                  <div className={styles['form-row']}>
                    <div className={styles['input-wrap']} style={{gridColumn:'1 / -1'}}>
                      <label>Full Name *</label>
                      <input className={styles['input']} placeholder="Walk-in Client Name" value={form.reporterName} onChange={e => setForm({...form, reporterName: e.target.value})} required />
                    </div>
                    <div className={styles['input-wrap']}>
                      <label>Phone Number</label>
                      <input className={styles['input']} type="tel" placeholder="09XX..." value={form.reporterPhone} onChange={e => setForm({...form, reporterPhone: e.target.value})} />
                    </div>
                    <div className={styles['input-wrap']}>
                      <label>Email Address</label>
                      <input className={styles['input']} type="email" placeholder="client@example.com" value={form.reporterEmail} onChange={e => setForm({...form, reporterEmail: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* 5. Details */}
                <div>
                  <h4 className={styles['form-section-title']}>Details</h4>
                  <div className={styles['input-wrap']} style={{marginBottom:'1rem'}}>
                    <label>Description</label>
                    <textarea className={styles['textarea']} placeholder="Color, brand, distinguishing marks..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                  </div>
                  <div className={styles['input-wrap']}>
                    <label style={{color: 'var(--amber-600)'}}>Unique Identifying Detail (Internal)</label>
                    <textarea className={styles['textarea']} style={{borderColor: 'var(--amber-400)'}} placeholder="Serial number, hidden scratch (Staff Only)" value={form.uniqueDetail} onChange={e => setForm({...form, uniqueDetail: e.target.value})} />
                  </div>
                </div>

                {/* 6. Status */}
                <div className={styles['input-wrap']}>
                  <label>Initial Status</label>
                  <select className={styles['input']} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Published">Publish Immediately</option>
                    <option value="Pending">Save as Draft</option>
                  </select>
                </div>

              </form>

              <div className={styles['modal-footer']}>
                <button type="button" className={styles['btn-outline']} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className={styles['btn-primary']} onClick={() => document.querySelector('form').requestSubmit()}>Save Report</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}