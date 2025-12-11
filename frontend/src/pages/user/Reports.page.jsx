import { useEffect, useState, useMemo, useRef } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Reports.module.css'
import { Trash2, XCircle, Search, Filter, AlertCircle, BadgeCheck } from 'lucide-react'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function ReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'lost' | 'found' | 'claims'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // Filter by Status
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // { id, status, type, source }

  const [showReportChoice, setShowReportChoice] = useState(false)
  const reportLostBtnRef = useRef(null)

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Mock Data for Claims (Dummy Data as requested)
  const [claims, setClaims] = useState([
    { id: 201, item: 'Canon Camera', type: 'claim', date: '11-15-2023', status: 'Pending', location: 'Lost & Found Office' },
    { id: 202, item: 'Beige Trench Coat', type: 'claim', date: '11-10-2023', status: 'Approved', location: 'Admin Office' },
    { id: 203, item: 'Scientific Calculator', type: 'claim', date: '11-18-2023', status: 'Rejected', location: 'Library' },
  ])

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  useEffect(() => {
    if (!showReportChoice) return
    const onKey = (e) => { if (e.key === 'Escape') setShowReportChoice(false) }
    document.addEventListener('keydown', onKey)
    const id = setTimeout(() => { reportLostBtnRef.current?.focus() }, 0)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(id) }
  }, [showReportChoice])

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        const uStr = localStorage.getItem('user')
        if (!uStr) { setReports([]); return }
        const u = JSON.parse(uStr)
        const userId = u.userId
        const res = await fetch(`http://localhost:8080/api/reports/user/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch reports')
        const data = await res.json()
        const rows = (data || []).map(r => ({
          id: r.reportId,
          item: (r.itemName && r.itemName.trim()) || (r.description ? String(r.description).split('|')[0].trim() : 'Item'),
          type: (r.type || '').toLowerCase(),
          date: r.dateOfEvent || '',
          location: r.location || '',
          status: (r.status || 'pending').charAt(0).toUpperCase() + (r.status || 'pending').slice(1)
        }))
        setReports(rows)
      } catch {
        setNotification({ type: 'error', message: 'Unable to load your reports. Please try again later.' })
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  // --- Logic: Filter Reports & Claims ---
  const filteredItems = useMemo(() => {
    let dataToFilter = []

    // Select Source Data based on Tab
    if (activeTab === 'claims') {
      dataToFilter = claims
    } else {
      // For 'all', 'lost', or 'found', we look at the reports array
      dataToFilter = reports.filter(item => {
        if (activeTab === 'all') return true
        return item.type === activeTab
      })
    }

    // Apply Search and Status Filters
    return dataToFilter.filter((item) => {
      // Filter by Search (Item Name or Location)
      const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.location.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by Status Dropdown
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [reports, claims, activeTab, searchTerm, statusFilter])

  // --- Logic: Handle Actions ---
  const handleRemoveItem = (id, status, source) => {
    const actionType = status === 'Pending' ? 'cancel' : 'delete'
    setPendingAction({ id, status, type: actionType, source })
    setConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    try {
      setActionLoading(true)
      if (pendingAction.source === 'claims') {
        setClaims((prev) => prev.filter((c) => c.id !== pendingAction.id))
        setNotification({ type: 'success', message: pendingAction.type === 'cancel' ? 'Claim cancelled.' : 'Claim history deleted.' })
      } else {
        const res = await fetch(`http://localhost:8080/api/reports/${pendingAction.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to process action')
        setReports((prev) => prev.filter((r) => r.id !== pendingAction.id))
        setNotification({ type: 'success', message: pendingAction.type === 'cancel' ? 'Report cancelled.' : 'Report history deleted.' })
      }
    } catch {
      setNotification({ type: 'error', message: 'Action failed. Please try again.' })
    } finally {
      setActionLoading(false)
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  return (
    <div className={styles['reports-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />

      <div className={styles['reports-container']} style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}>
        
        <div className={styles['page-header']}>
          <div>
            <h1 className={styles['page-title']}>My Reports</h1>
            <p className={styles['page-subtitle']}>Track your reports and claimed items.</p>
          </div>
          {notification && (
            <div className={`${styles['notice']} ${styles[notification.type]}`}>
              {notification.message}
            </div>
          )}
          
          <div className={styles['controls']}>
            {/* Search Box */}
            <div className={styles['search-box']}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className={styles['filter-box']}>
              <Filter size={16} />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className={styles['tabs']}>
          <button 
            className={`${styles['tab']} ${activeTab === 'all' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Reports
          </button>
          <button 
            className={`${styles['tab']} ${activeTab === 'lost' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('lost')}
          >
            Lost Items
          </button>
          <button 
            className={`${styles['tab']} ${activeTab === 'found' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('found')}
          >
            Found Items
          </button>
          <button 
            className={`${styles['tab']} ${activeTab === 'claims' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('claims')}
          >
            My Claims
          </button>
      </div>
      
      {/* --- TABLE --- */}
        <div className={styles['table-card']}>
          <div className={styles['table-responsive']}>
            <table className={styles['table']}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Type</th>
                  <th>Date {activeTab === 'claims' ? 'Claimed' : ''}</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className={styles['empty-state']}>Loading...</td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className={styles['fw-bold']}>{item.item}</td>
                      <td>
                        <span className={styles['type-text']}>
                          {/* Display nicely formatted type */}
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                      </td>
                      <td>{item.date}</td>
                      <td>{item.location}</td>
                      <td>
                        <span className={`${styles['status-badge']} ${styles[item.status.toLowerCase()]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.status === 'Pending' ? (
                          <button 
                            className={`${styles['action-btn']} ${styles['btn-cancel']}`}
                            onClick={() => handleRemoveItem(item.id, item.status, activeTab === 'claims' ? 'claims' : 'reports')}
                            title={activeTab === 'claims' ? "Cancel Claim" : "Cancel Report"}
                            disabled={actionLoading}
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        ) : (
                          <button 
                            className={`${styles['action-btn']} ${styles['btn-delete']}`}
                            onClick={() => handleRemoveItem(item.id, item.status, activeTab === 'claims' ? 'claims' : 'reports')}
                            title="Delete History"
                            disabled={actionLoading}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className={styles['empty-state']}>
                      No {activeTab === 'all' ? 'reports' : activeTab} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Report Button */}
        <button
          className={styles['dashboard-report-btn']}
          aria-label="Report item"
          onClick={() => setShowReportChoice(true)}
        >
          Report
        </button>

        {/* Report Type Modal */}
        {showReportChoice && (
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
                  onClick={() => setShowReportChoice(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  ref={reportLostBtnRef}
                  className={styles['report-btn-option']}
                  onClick={() => { setShowReportChoice(false); window.location.hash = '#/report/lost' }}
                >
                  <AlertCircle size={18} />
                  Lost Item
                </button>
                <button
                  type="button"
                  className={styles['report-btn-option']}
                  onClick={() => { setShowReportChoice(false); window.location.hash = '#/report/found' }}
                >
                  <BadgeCheck size={18} />
                  Found Item
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          open={confirmOpen}
          title={pendingAction?.type === 'cancel' ? 'Cancel Item' : 'Delete History'}
          message={pendingAction?.type === 'cancel' 
            ? 'Are you sure you want to cancel this request? It will be removed from your list.'
            : 'Are you sure you want to delete this history? This action cannot be undone.'}
          confirmText={pendingAction?.type === 'cancel' ? 'Yes, Cancel' : 'Yes, Delete'}
          cancelText="Keep"
          onCancel={() => { setConfirmOpen(false); setPendingAction(null) }}
          onConfirm={confirmAction}
          tone="danger"
        />
      </div>
    </div>
  )
}
