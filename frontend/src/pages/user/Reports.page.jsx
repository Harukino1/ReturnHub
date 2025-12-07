import { useEffect, useState, useMemo } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Reports.module.css'
import { Trash2, XCircle, Search, Filter } from 'lucide-react'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function ReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'lost' | 'found'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // Filter by Status
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // { id, status, type }

  // Mock Data with MM-DD-YYYY date format
  const [reports, setReports] = useState([
    { id: 101, item: 'MacBook Pro', type: 'lost', date: '10-25-2023', status: 'Pending', location: 'Library' },
    { id: 102, item: 'Blue Umbrella', type: 'found', date: '10-26-2023', status: 'Approved', location: 'Canteen' },
    { id: 103, item: 'Car Keys', type: 'lost', date: '10-24-2023', status: 'Resolved', location: 'Parking Lot' },
    { id: 104, item: 'Water Bottle', type: 'found', date: '10-28-2023', status: 'Pending', location: 'Gym' },
    { id: 105, item: 'ID Lanyard', type: 'found', date: '11-02-2023', status: 'Rejected', location: 'Walkway' },
  ])

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // --- Logic: Filter Reports ---
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // 1. Filter by Tab (Type: Lost/Found)
      const matchesTab = activeTab === 'all' || report.type === activeTab
      
      // 2. Filter by Search (Item Name or Location)
      const matchesSearch = report.item.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            report.location.toLowerCase().includes(searchTerm.toLowerCase())

      // 3. Filter by Status Dropdown
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter

      return matchesTab && matchesSearch && matchesStatus
    })
  }, [reports, activeTab, searchTerm, statusFilter])

  // --- Logic: Handle Actions ---
  const handleRemoveReport = (id, status) => {
    const actionType = status === 'Pending' ? 'cancel' : 'delete'
    setPendingAction({ id, status, type: actionType })
    setConfirmOpen(true)
  }

  return (
    <div className={styles['reports-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />

      <div className={styles['reports-container']} style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}>
        
        <div className={styles['page-header']}>
          <div>
            <h1 className={styles['page-title']}>My Reports</h1>
            <p className={styles['page-subtitle']}>Track and manage your lost and found items.</p>
          </div>
          
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
      </div>
      
      {/* --- TABLE --- */}
        <div className={styles['table-card']}>
          <div className={styles['table-responsive']}>
            <table className={styles['table']}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td className={styles['fw-bold']}>{report.item}</td>
                      <td>
                        {/* Pure text class, no color badge */}
                        <span className={styles['type-text']}>
                          {report.type === 'lost' ? 'Lost' : 'Found'}
                        </span>
                      </td>
                      <td>{report.date}</td>
                      <td>{report.location}</td>
                      <td>
                        <span className={`${styles['status-badge']} ${styles[report.status.toLowerCase()]}`}>
                          {report.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {report.status === 'Pending' ? (
                          <button 
                            className={`${styles['action-btn']} ${styles['btn-cancel']}`}
                            onClick={() => handleRemoveReport(report.id, report.status)}
                            title="Cancel Report"
                          >
                            <XCircle size={16} /> Cancel
                          </button>
                        ) : (
                          <button 
                            className={`${styles['action-btn']} ${styles['btn-delete']}`}
                            onClick={() => handleRemoveReport(report.id, report.status)}
                            title="Delete Report History"
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
                      No {activeTab !== 'all' ? activeTab : ''} reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <ConfirmModal
          open={confirmOpen}
          title={pendingAction?.type === 'cancel' ? 'Cancel Report' : 'Delete Report'}
          message={pendingAction?.type === 'cancel' 
            ? 'Are you sure you want to cancel this report? It will be removed from your list.'
            : 'Are you sure you want to delete this report history? This action cannot be undone.'}
          confirmText={pendingAction?.type === 'cancel' ? 'Cancel Report' : 'Delete Report'}
          cancelText="Keep"
          onCancel={() => { setConfirmOpen(false); setPendingAction(null) }}
          onConfirm={() => {
            if (pendingAction) {
              setReports((prev) => prev.filter((r) => r.id !== pendingAction.id))
            }
            setConfirmOpen(false)
            setPendingAction(null)
          }}
          tone="danger"
        />
      </div>
    </div>
  )
}
