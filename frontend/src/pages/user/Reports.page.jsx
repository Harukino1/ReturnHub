import { useEffect, useMemo, useState, useRef } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Reports.module.css'
import { Search, Image, Eye, Plus, AlertCircle, BadgeCheck } from 'lucide-react'

export default function ReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', category: '', location: '', status: 'pending' })
  const reportLostBtnRef = useRef(null)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  useEffect(() => {
    if (!showAdd) return
    const onKey = (e) => { if (e.key === 'Escape') setShowAdd(false) }
    document.addEventListener('keydown', onKey)
    const id = setTimeout(() => { reportLostBtnRef.current?.focus() }, 0)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(id) }
  }, [showAdd])

  const [reports, setReports] = useState([
    { id: 1, name: 'Black Backpack', date: '11/28/2025', category: 'Bags', location: 'Cebu City', status: 'pending', photoUrl: '' },
    { id: 2, name: 'Wallet', date: '11/27/2025', category: 'Personal', location: 'Mandaue', status: 'approved', photoUrl: '' },
    { id: 3, name: 'Phone', date: '11/25/2025', category: 'Electronics', location: 'IT Park', status: 'rejected', photoUrl: '' }
  ])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports
      .filter((r) => activeTab === 'all' ? true : r.status === activeTab)
      .filter((r) => !q || [r.name, r.category, r.location].some((v) => v.toLowerCase().includes(q)))
  }, [reports, query, activeTab])

  return (
    <div className={styles['reports-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />
      
      {/* UPDATED CONTAINER: 
        1. Used custom styles['reports-container'] 
        2. Added logic to style prop to handle sidebar offset 
      */}
      <div 
        className={styles['reports-container']} 
        style={{ 
          paddingLeft: sidebarOpen ? '270px' : '2rem' // 250px sidebar + 20px gap
        }}
      >
        <div className={styles['reports-header']}>
          <h1 className={styles['reports-title']}>Your Reports</h1>
          <form className={styles['reports-search-form']} onSubmit={(e) => e.preventDefault()}>
            <input
              className={styles['reports-search-input']}
              placeholder="Search your reports"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className={styles['reports-search-btn']} aria-label="Search">
              <Search size={18} />
            </button>
          </form>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ marginLeft: 'auto' }}>
            <Plus size={16} /> <span className={styles['btn-text']}>New Report</span>
          </button>
        </div>

        <div className={styles['reports-tabs']}>
          <button className={`${styles['reports-tab']} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>All</button>
          <button className={`${styles['reports-tab']} ${activeTab === 'pending' ? styles.active : ''}`} onClick={() => setActiveTab('pending')}>Pending</button>
          <button className={`${styles['reports-tab']} ${activeTab === 'approved' ? styles.active : ''}`} onClick={() => setActiveTab('approved')}>Approved</button>
          <button className={`${styles['reports-tab']} ${activeTab === 'rejected' ? styles.active : ''}`} onClick={() => setActiveTab('rejected')}>Rejected</button>
        </div>

        <div className={styles['reports-content']}>
          {/* ADDED: Table responsive wrapper for mobile scrolling */}
          <div className={styles['table-responsive']}>
            <table className={styles['reports-table']}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Location</th>
                  {activeTab === 'all' && <th>Status</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className={styles['item-cell']}>
                        <div className={styles['thumb']}>
                          {r.photoUrl ? (
                            <img className={styles['thumb-image']} src={r.photoUrl} alt={r.name} />
                          ) : (
                            <Image size={18} />
                          )}
                        </div>
                        <div className={styles['item-meta']}>
                          <div className={styles['item-name']}>{r.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{r.date}</td>
                    <td>{r.category}</td>
                    <td>{r.location}</td>
                    {activeTab === 'all' && <td>{r.status}</td>}
                    <td>
                      <button className={styles['view-btn']}>View <Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'all' ? 6 : 5} className={styles['empty-cell']}>No reports</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAdd && (
          <div className={styles['report-overlay']} role="dialog" aria-modal="true" aria-labelledby="report-type-title" aria-describedby="report-type-desc">
            <div className={styles['report-modal']}>
              <div className={styles['report-header']}>
                <h3 id="report-type-title" className={styles['report-title']}>Choose Report Type</h3>
              </div>
              <div className={styles['report-body']}>
                <p id="report-type-desc" className={styles['report-message']}>Select what you want to report.</p>
              </div>
              <div className={styles['report-actions']}>
                <button
                  type="button"
                  className={styles['report-btn-cancel']}
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  ref={reportLostBtnRef}
                  className={styles['report-btn-option']}
                  onClick={() => { setShowAdd(false); window.location.hash = '#/report/lost' }}
                >
                  <AlertCircle size={18} />
                  Lost Item
                </button>
                <button
                  type="button"
                  className={styles['report-btn-option']}
                  onClick={() => { setShowAdd(false); window.location.hash = '#/report/found' }}
                >
                  <BadgeCheck size={18} />
                  Found Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
