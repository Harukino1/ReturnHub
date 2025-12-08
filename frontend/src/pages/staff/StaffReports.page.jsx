import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Reports.module.css'
import { Search, Image, Eye, Plus, Filter, X, ChevronLeft, ChevronRight, ExternalLink, MapPin, Calendar, User, Tag, Camera } from 'lucide-react'

export default function StaffReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending') 
  const [typeFilter, setTypeFilter] = useState('All')
  
  // --- REVIEW MODAL & SLIDER STATE ---
  const [selectedReport, setSelectedReport] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // --- CREATE REPORT STATE ---
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ 
    name: '', type: 'found', category: '', location: '', date: '', 
    reporterName: '', reporterPhone: '', reporterEmail: '', 
    description: '', uniqueDetail: '', status: 'Published', photos: [] 
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

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  

  const formatDateStr = (s) => {
    if (!s) return ''
    if (s.includes('/')) {
      const [m, d, y] = s.split('/')
      return `${m}-${d}-${y}`
    }
    if (s.includes('-')) {
      const [a, b, c] = s.split('-')
      if (a.length === 4) return `${b}-${c}-${a}`
      return s
    }
    const dt = new Date(s)
    if (Number.isNaN(dt.getTime())) return s
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    const yy = String(dt.getFullYear())
    return `${mm}-${dd}-${yy}`
  }

  // --- MOCK DATA ---
  const [reports, setReports] = useState([
    { 
      id: 1, 
      name: 'Black Backpack', 
      type: 'found', 
      date: '11/28/2025', 
      category: 'Bags', 
      location: 'Cebu City Grandstand', 
      reporter: 'Pao Gwapo', 
      status: 'Pending', 
      description: 'Black Jansport bag. Contains a water bottle and some notebooks. Found near the bleachers.', 
      uniqueDetail: 'Sticker of a cat on the bottom right corner.', 
      claimsCount: 2, 
      photos: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80'
      ] 
    },
    { 
      id: 2, 
      name: 'Brown Leather Wallet', 
      type: 'lost', 
      date: '11/27/2025', 
      category: 'Personal', 
      location: 'Mandaue Public Market', 
      reporter: 'Jane Doe', 
      status: 'Published', 
      description: 'Lost somewhere near the fruit section. Contains ID and cards.', 
      uniqueDetail: 'Initials "JD" embossed on the inside.', 
      claimsCount: 0, 
      photos: [] 
    },
    { 
      id: 3, 
      name: 'iPhone 13 Pro', 
      type: 'found', 
      date: '11/26/2025', 
      category: 'Electronics', 
      location: 'IT Park, Cebu', 
      reporter: 'Security Guard', 
      status: 'Pending', 
      description: 'Blue iPhone 13 Pro with a clear case. Found on a bench near the plaza.', 
      uniqueDetail: 'Lock screen is a picture of a Golden Retriever.', 
      claimsCount: 5, 
      photos: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'
      ] 
    },
    { 
      id: 4, 
      name: 'Silver Car Keys', 
      type: 'lost', 
      date: '11/25/2025', 
      category: 'Keys', 
      location: 'SM Seaside Parking', 
      reporter: 'Mark Cruz', 
      status: 'Rejected', 
      description: 'Toyota car keys with a leather keychain.', 
      uniqueDetail: 'Keychain has "Cebu" engraved on it.', 
      claimsCount: 0, 
      photos: [] 
    },
    { 
      id: 5, 
      name: 'Blue Umbrella', 
      type: 'found', 
      date: '11/29/2025', 
      category: 'Others', 
      location: 'Ayala Terraces', 
      reporter: 'Cleaning Staff', 
      status: 'Published', 
      description: 'Large golf umbrella, navy blue.', 
      uniqueDetail: 'Handle has a scratch near the button.', 
      claimsCount: 1, 
      photos: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=600&q=80'
      ] 
    },
  ])

  // --- FILTER LOGIC ---
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports.filter((r) => {
      const matchTab = activeTab === 'all' || r.status.toLowerCase() === activeTab.toLowerCase()
      const matchType = typeFilter === 'All' || r.type.toLowerCase() === typeFilter.toLowerCase()
      const matchSearch = !q || [r.name, r.category, r.location, r.reporter].some(v => v?.toLowerCase().includes(q))
      return matchTab && matchType && matchSearch
    })
  }, [reports, query, activeTab, typeFilter])

  // --- ACTIONS: REVIEW MODAL ---
  const handleViewClaims = () => {
    window.location.hash = '#/staff/claims'
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    if (!selectedReport?.photos?.length) return
    setCurrentImageIndex((prev) => (prev + 1) % selectedReport.photos.length)
  }

  const handlePrevImage = (e) => {
    e.stopPropagation()
    if (!selectedReport?.photos?.length) return
    setCurrentImageIndex((prev) => (prev - 1 + selectedReport.photos.length) % selectedReport.photos.length)
  }

  // --- ACTIONS: CREATE MODAL ---
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

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    const id = (reports.length > 0 ? Math.max(...reports.map(r => r.id)) : 0) + 1
    const payload = { 
      id, ...form, 
      reporter: form.reporterName, 
      claimsCount: 0,
      photos: form.photos // Use the array directly
    }
    setReports((p) => [payload, ...p])
    setShowAdd(false)
    setForm({ name: '', type: 'found', category: '', location: '', date: '', reporterName: '', reporterPhone: '', reporterEmail: '', description: '', uniqueDetail: '', status: 'Published', photos: [] })
  }

  return (
    <div className={styles['reports-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      
      <div className={styles['reports-container']} style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}>
        
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
            Published
          </button>
          <button className={`${styles['reports-tab']} ${activeTab === 'rejected' ? styles.active : ''}`} onClick={() => setActiveTab('rejected')}>
            Rejected
          </button>
          <button className={`${styles['reports-tab']} ${activeTab === 'resolved' ? styles.active : ''}`} onClick={() => setActiveTab('resolved')}>
            Resolved
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
                  <th>Potential Claims</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className={styles['item-cell']}>
                        <div className={styles['thumb']}>
                          {r.photos && r.photos.length > 0 ? (
                            <img className={styles['thumb-image']} src={r.photos[0]} alt={r.name} />
                          ) : (
                            <Image size={20} />
                          )}
                        </div>
                        <div>
                          <div className={styles['item-name']}>{r.name}</div>
                          <div className={styles['item-category']}>{r.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}><span className={`${styles['type-badge']} ${styles[r.type]}`}>{r.type}</span></td>
                    <td>{formatDateStr(r.date)}</td>
                    <td>{r.location}</td>
                    <td>{r.reporter}</td>
                    <td><span className={`${styles['status-pill']} ${styles[r.status.toLowerCase()]}`}>{r.status}</span></td>
                    <td>
                      {r.type === 'found' ? (
                        <span className={styles['claims-pill']}>{r.status === 'Published' ? r.claimsCount : 0}</span>
                      ) : (
                        <span className={styles['text-muted']}>—</span>
                      )}
                    </td>
                    <td><button className={styles['action-btn']} onClick={() => { setSelectedReport(r); setCurrentImageIndex(0) }}><Eye size={16} /> Review</button></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className={styles['empty-cell']}>No reports found matching criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- REVIEW MODAL (SLIDER + INFO) --- */}
        {selectedReport && (
          <div className={styles['modal-overlay']} onClick={() => setSelectedReport(null)}>
            <div className={styles['review-modal']} onClick={e => e.stopPropagation()}>
              
              <div className={styles['review-header']}>
                <div>
                  <h3 className={styles['review-title']}>{selectedReport.name}</h3>
                  <div className={styles['review-meta']}>
                    <span className={`${styles['type-badge']} ${styles[selectedReport.type]}`}>{selectedReport.type}</span>
                    <span className={styles['meta-dot']}>•</span>
                    <span className={styles['meta-text']}>Reported on {formatDateStr(selectedReport.date)}</span>
                  </div>
                </div>
                <button className={styles['modal-close']} onClick={() => setSelectedReport(null)}><X size={20} /></button>
              </div>

              <div className={styles['review-body']}>
                
                {/* SLIDER / IMAGES */}
                <div className={styles['review-gallery']}>
                  {selectedReport.photos && selectedReport.photos.length > 0 ? (
                    <div className={styles['slider-container']}>
                      <img 
                        src={selectedReport.photos[currentImageIndex]} 
                        alt="Report Item" 
                        className={styles['slider-image']} 
                      />
                      {/* Controls */}
                      {selectedReport.photos.length > 1 && (
                        <>
                          <button className={`${styles['slider-btn']} ${styles['prev']}`} onClick={handlePrevImage}>
                            <ChevronLeft size={20} />
                          </button>
                          <button className={`${styles['slider-btn']} ${styles['next']}`} onClick={handleNextImage}>
                            <ChevronRight size={20} />
                          </button>
                          <div className={styles['slider-dots']}>
                            {selectedReport.photos.map((_, idx) => (
                              <span key={idx} className={`${styles['dot']} ${idx === currentImageIndex ? styles.active : ''}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={styles['no-image-placeholder']}>
                      <Image size={48} strokeWidth={1} />
                      <p>No photos provided</p>
                    </div>
                  )}
                </div>

                {/* INFORMATION */}
                <div className={styles['review-info']}>
                  
                  <div className={`${styles['info-banner']} ${styles[selectedReport.status.toLowerCase()]}`}>
                    <span className={styles['banner-label']}>Current Status</span>
                    <span className={styles['banner-value']}>{selectedReport.status}</span>
                  </div>

                  <div className={styles['info-group']}>
                    <h4 className={styles['info-heading']}>Item Details</h4>
                    <div className={styles['info-row']}>
                      <Tag size={16} className={styles['info-icon']} />
                      <div>
                        <span className={styles['info-label']}>Category</span>
                        <div className={styles['info-text']}>{selectedReport.category}</div>
                      </div>
                    </div>
                    <div className={styles['info-row']}>
                      <MapPin size={16} className={styles['info-icon']} />
                      <div>
                        <span className={styles['info-label']}>Location</span>
                        <div className={styles['info-text']}>{selectedReport.location}</div>
                      </div>
                    </div>
                    <div className={styles['info-row']}>
                      <Calendar size={16} className={styles['info-icon']} />
                      <div>
                        <span className={styles['info-label']}>Date of Event</span>
                        <div className={styles['info-text']}>{formatDateStr(selectedReport.date)}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles['info-group']}>
                    <h4 className={styles['info-heading']}>Reporter</h4>
                    <div className={styles['info-row']}>
                      <User size={16} className={styles['info-icon']} />
                      <div>
                        <span className={styles['info-label']}>Reported By</span>
                        <div className={styles['info-text']}>{selectedReport.reporter}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles['info-group']}>
                    <h4 className={styles['info-heading']}>Description</h4>
                    <p className={styles['desc-text']}>{selectedReport.description}</p>
                  </div>

                  {selectedReport.uniqueDetail && (
                    <div className={`${styles['info-group']} ${styles['highlight']}`}>
                      <h4 className={styles['info-heading']}>Hidden Detail (Staff Only)</h4>
                      <p className={styles['desc-text']}>{selectedReport.uniqueDetail}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER */}
              <div className={styles['review-footer']}>
                {selectedReport.status === 'Published' && selectedReport.claimsCount > 0 ? (
                  <div className={styles['footer-left']}>
                    <span className={styles['claims-alert']}>
                      {selectedReport.claimsCount} Potential Claim{selectedReport.claimsCount > 1 ? 's' : ''}
                    </span>
                    <button className={styles['btn-link']} onClick={handleViewClaims}>
                      View Claims <ExternalLink size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={styles['footer-left']}>
                    <span className={styles['text-muted']}>No claims yet</span>
                  </div>
                )}

                <div className={styles['footer-actions']}>
                  {selectedReport.status === 'Pending' && (
                    <button className={styles['btn-text-danger']} onClick={() => setSelectedReport(null)}>
                      Reject
                    </button>
                  )}
                  {selectedReport.status === 'Pending' ? (
                    <button className={styles['btn-action-primary']} onClick={() => alert('Publish Logic')}>
                      Approve & Publish
                    </button>
                  ) : (
                    <button className={styles['btn-outline']} onClick={() => setSelectedReport(null)}>
                      Close
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- CREATE MANUAL REPORT MODAL --- */}
        {showAdd && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal']}>
              <div className={styles['modal-header']}>
                <h3 className={styles['modal-title']}>Create Manual Report</h3>
                <button className={styles['modal-close']} onClick={() => setShowAdd(false)}><X size={20} /></button>
              </div>
              
              <form className={styles['modal-scroll-content']} onSubmit={handleCreateSubmit}>
                {/* 1. Toggle */}
                <div className={styles['toggle-container']}>
                  <button type="button" className={`${styles['toggle-btn']} ${form.type === 'lost' ? styles.active : ''}`} onClick={() => setForm({ ...form, type: 'lost' })}>Lost Item</button>
                  <button type="button" className={`${styles['toggle-btn']} ${form.type === 'found' ? styles.active : ''}`} onClick={() => setForm({ ...form, type: 'found' })}>Found Item</button>
                </div>

                {/* 2. Photo Upload */}
                <div className={styles['photo-upload-container']}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                    <span style={{fontSize:'0.75rem', fontWeight:'600', color:'var(--gray-500)'}}>ITEM PHOTOS</span>
                    <span style={{fontSize:'0.75rem', color:'var(--gray-400)'}}>{form.photos.length}/3</span>
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
                <button type="button" className={styles['btn-primary']} onClick={handleCreateSubmit}>Save Report</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
