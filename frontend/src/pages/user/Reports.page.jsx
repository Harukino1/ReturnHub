import { useEffect, useState, useMemo, useRef } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Reports.module.css'
import { Trash2, XCircle, Search, Filter, AlertCircle, BadgeCheck } from 'lucide-react'
import ConfirmModal from '../../components/common/ConfirmModal'

// API Base URL
const API_BASE_URL = 'http://localhost:8080'

export default function ReportsPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingAction, setPendingAction] = useState(null)

    const [showReportChoice, setShowReportChoice] = useState(false)
    const reportLostBtnRef = useRef(null)

    const [reports, setReports] = useState([])
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(false)
    const [claimsLoading, setClaimsLoading] = useState(false)
    const [notification, setNotification] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Apply theme
    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    // Keyboard handling for modal
    useEffect(() => {
        if (!showReportChoice) return
        const onKey = (e) => { if (e.key === 'Escape') setShowReportChoice(false) }
        document.addEventListener('keydown', onKey)
        const id = setTimeout(() => { reportLostBtnRef.current?.focus() }, 0)
        return () => { document.removeEventListener('keydown', onKey); clearTimeout(id) }
    }, [showReportChoice])

    // Get user ID from localStorage
    const getUserId = () => {
        try {
            const userData = localStorage.getItem('user')
            if (!userData) return null
            const user = JSON.parse(userData)
            return user.userId
        } catch {
            return null
        }
    }

    // Normalize claim data - SIMILAR TO STAFF DASHBOARD
    const normalizeClaim = (claim) => {
        // Try to get item name from various possible locations
        let itemName = 'Unknown Item'
        let location = 'N/A'
        let date = ''

        // Check multiple possible locations like StaffDashboard does
        if (claim.itemName) {
            itemName = claim.itemName
        } else if (claim.itemTitle) {
            itemName = claim.itemTitle
        } else if (claim.foundItem && claim.foundItem.submittedReport && claim.foundItem.submittedReport.itemName) {
            itemName = claim.foundItem.submittedReport.itemName
        } else if (claim.foundItem && claim.foundItem.itemName) {
            itemName = claim.foundItem.itemName
        }

        // Get location
        if (claim.location) {
            location = claim.location
        } else if (claim.itemLocation) {
            location = claim.itemLocation
        } else if (claim.foundItem && claim.foundItem.submittedReport && claim.foundItem.submittedReport.location) {
            location = claim.foundItem.submittedReport.location
        }

        // Get date
        if (claim.claimDate) {
            date = claim.claimDate
        } else if (claim.createdAt) {
            date = claim.createdAt
        } else if (claim.dateSubmitted) {
            date = claim.dateSubmitted
        }

        // Format status like StaffDashboard
        let status = claim.status || 'pending'
        if (status === 'pending') status = 'Pending'
        else if (status === 'approved') status = 'Approved'
        else if (status === 'rejected') status = 'Rejected'
        else if (status === 'claimed') status = 'Claimed'
        else {
            // Capitalize first letter
            status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        }

        return {
            id: claim.claimId || claim.id,
            item: itemName,
            type: 'claim',
            date: date,
            location: location,
            status: status,
            proofDocumentUrl: claim.proofDocumentUrl || claim.proofPhotoUrl || '',
            claimantNote: claim.claimantNote || '',
            itemId: claim.itemId
        }
    }

    // Load user's reports
    useEffect(() => {
        const loadReports = async () => {
            try {
                setLoading(true)
                const userId = getUserId()
                if (!userId) {
                    setReports([])
                    setNotification({ type: 'error', message: 'Please login to view reports' })
                    return
                }

                const res = await fetch(`${API_BASE_URL}/api/reports/user/${userId}`)
                if (!res.ok) throw new Error('Failed to fetch reports')
                const data = await res.json()

                const rows = (data || []).map(r => ({
                    id: r.reportId || r.id,
                    item: r.itemName || 'Unknown Item',
                    type: (r.type || '').toLowerCase(),
                    date: r.dateOfEvent || r.createdAt || '',
                    location: r.location || '',
                    status: (r.status || 'pending').charAt(0).toUpperCase() + (r.status || 'pending').slice(1),
                    description: r.description || '',
                    category: r.category || ''
                }))
                setReports(rows)
            } catch (err) {
                console.error('Error loading reports:', err)
                setNotification({ type: 'error', message: 'Unable to load your reports. Please try again later.' })
            } finally {
                setLoading(false)
            }
        }
        loadReports()
    }, [])

    // Load user's claims from backend - USING BETTER APPROACH
    useEffect(() => {
        const loadClaims = async () => {
            try {
                setClaimsLoading(true)
                const userId = getUserId()
                if (!userId) {
                    setClaims([])
                    return
                }

                // Try multiple endpoints like StaffDashboard does
                let claimsData = []

                // First try the enhanced endpoint if available
                try {
                    const enhancedRes = await fetch(`${API_BASE_URL}/api/claims/staff/with-details`, {
                        credentials: 'include'
                    })

                    if (enhancedRes.ok) {
                        const data = await enhancedRes.json()
                        // Filter to show only this user's claims
                        const userClaims = data.filter(claim => {
                            // Check if this claim belongs to the current user
                            return claim.userId === userId ||
                                claim.claimantUserId === userId ||
                                (claim.claimantUser && claim.claimantUser.userId === userId)
                        })
                        claimsData = userClaims
                    }
                } catch (enhancedErr) {
                    console.log('Enhanced endpoint not available, trying regular endpoint')
                }

                // If enhanced endpoint didn't work or returned no data, try regular endpoint
                if (claimsData.length === 0) {
                    const regularRes = await fetch(`${API_BASE_URL}/api/claims/user/${userId}`)
                    if (regularRes.ok) {
                        const data = await regularRes.json()
                        claimsData = data

                        // If we got claims without details, we might need to fetch item details separately
                        if (claimsData.length > 0 && !claimsData[0].itemName) {
                            // Try to fetch item details for each claim
                            const claimsWithDetails = await Promise.all(
                                claimsData.map(async (claim) => {
                                    try {
                                        // Try to get item details from reports endpoint
                                        if (claim.itemId) {
                                            const itemRes = await fetch(`${API_BASE_URL}/api/reports/${claim.itemId}`)
                                            if (itemRes.ok) {
                                                const itemData = await itemRes.json()
                                                return {
                                                    ...claim,
                                                    itemName: itemData.itemName,
                                                    location: itemData.location
                                                }
                                            }
                                        }
                                    } catch (itemErr) {
                                        console.log('Could not fetch item details for claim', claim.id)
                                    }
                                    return claim
                                })
                            )
                            claimsData = claimsWithDetails
                        }
                    }
                }

                // Normalize all claims
                const formattedClaims = (claimsData || []).map(normalizeClaim)

                console.log('Formatted claims:', formattedClaims) // Debug log

                setClaims(formattedClaims)
            } catch (err) {
                console.error('Error loading claims:', err)
                // Fallback to mock data if API fails
                setClaims([
                    { id: 201, item: 'Canon Camera', type: 'claim', date: '11-15-2023', status: 'Pending', location: 'Lost & Found Office' },
                    { id: 202, item: 'Beige Trench Coat', type: 'claim', date: '11-10-2023', status: 'Approved', location: 'Admin Office' },
                    { id: 203, item: 'Scientific Calculator', type: 'claim', date: '11-18-2023', status: 'Rejected', location: 'Library' },
                ])
            } finally {
                setClaimsLoading(false)
            }
        }
        loadClaims()
    }, [])

    // Filter logic
    const filteredItems = useMemo(() => {
        let dataToFilter = []

        if (activeTab === 'claims') {
            dataToFilter = claims
        } else {
            dataToFilter = reports.filter(item => {
                if (activeTab === 'all') return true
                return item.type === activeTab
            })
        }

        return dataToFilter.filter((item) => {
            const matchesSearch = searchTerm === '' ||
                item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesStatus = statusFilter === 'All' ||
                item.status.toLowerCase() === statusFilter.toLowerCase() ||
                (statusFilter === 'Resolved' && (item.status.toLowerCase() === 'claimed' || item.status.toLowerCase() === 'completed'))

            return matchesSearch && matchesStatus
        })
    }, [reports, claims, activeTab, searchTerm, statusFilter])

    // Handle remove/cancel actions
    const handleRemoveItem = (id, status, source) => {
        const actionType = status.toLowerCase() === 'pending' ? 'cancel' : 'delete'
        setPendingAction({ id, status, type: actionType, source })
        setConfirmOpen(true)
    }

    // Confirm action execution
    const confirmAction = async () => {
        if (!pendingAction) return
        try {
            setActionLoading(true)

            if (pendingAction.source === 'claims') {
                const res = await fetch(`${API_BASE_URL}/api/claims/${pendingAction.id}`, {
                    method: 'DELETE'
                })

                if (!res.ok) throw new Error('Failed to delete claim')

                setClaims((prev) => prev.filter((c) => c.id !== pendingAction.id))
                setNotification({
                    type: 'success',
                    message: pendingAction.type === 'cancel' ? 'Claim cancelled.' : 'Claim deleted.'
                })
            } else {
                const res = await fetch(`${API_BASE_URL}/api/reports/${pendingAction.id}`, {
                    method: 'DELETE'
                })

                if (!res.ok) throw new Error('Failed to process action')

                setReports((prev) => prev.filter((r) => r.id !== pendingAction.id))
                setNotification({
                    type: 'success',
                    message: pendingAction.type === 'cancel' ? 'Report cancelled.' : 'Report deleted.'
                })
            }
        } catch (err) {
            console.error('Action error:', err)
            setNotification({
                type: 'error',
                message: 'Action failed. Please try again.'
            })
        } finally {
            setActionLoading(false)
            setConfirmOpen(false)
            setPendingAction(null)
        }
    }

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    // Get status badge class
    const getStatusClass = (status) => {
        const statusLower = status.toLowerCase()
        if (statusLower === 'approved' || statusLower === 'published') return 'approved'
        if (statusLower === 'pending') return 'pending'
        if (statusLower === 'rejected') return 'rejected'
        if (statusLower === 'claimed' || statusLower === 'completed' || statusLower === 'resolved') return 'resolved'
        return 'pending'
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
                        <div className={styles['search-box']}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search items"
                            />
                        </div>

                        <div className={styles['filter-box']}>
                            <Filter size={16} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={styles['filter-select']}
                                aria-label="Filter by status"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Published">Published</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Claimed">Claimed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles['tabs']}>
                    <button
                        className={`${styles['tab']} ${activeTab === 'all' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('all')}
                        aria-pressed={activeTab === 'all'}
                    >
                        All Reports
                    </button>
                    <button
                        className={`${styles['tab']} ${activeTab === 'lost' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('lost')}
                        aria-pressed={activeTab === 'lost'}
                    >
                        Lost Items
                    </button>
                    <button
                        className={`${styles['tab']} ${activeTab === 'found' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('found')}
                        aria-pressed={activeTab === 'found'}
                    >
                        Found Items
                    </button>
                    <button
                        className={`${styles['tab']} ${activeTab === 'claims' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('claims')}
                        aria-pressed={activeTab === 'claims'}
                    >
                        My Claims
                    </button>
                </div>

                {/* Table */}
                <div className={styles['table-card']}>
                    <div className={styles['table-responsive']}>
                        <table className={styles['table']}>
                            <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Type</th>
                                <th>Date {activeTab === 'claims' ? 'Claimed' : 'Reported'}</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading || claimsLoading ? (
                                <tr>
                                    <td colSpan="6" className={styles['empty-state']}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className={styles['fw-bold']}>{item.item}</td>
                                        <td>
                        <span className={`${styles['type-badge']} ${styles[item.type]}`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                                        </td>
                                        <td>{formatDate(item.date)}</td>
                                        <td>{item.location || 'N/A'}</td>
                                        <td>
                        <span className={`${styles['status-badge']} ${styles[getStatusClass(item.status)]}`}>
                          {item.status}
                        </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {item.status.toLowerCase() === 'pending' ? (
                                                <button
                                                    className={`${styles['action-btn']} ${styles['btn-cancel']}`}
                                                    onClick={() => handleRemoveItem(item.id, item.status, activeTab === 'claims' ? 'claims' : 'reports')}
                                                    title={activeTab === 'claims' ? "Cancel Claim" : "Cancel Report"}
                                                    disabled={actionLoading}
                                                >
                                                    <XCircle size={14} /> Cancel
                                                </button>
                                            ) : (
                                                <button
                                                    className={`${styles['action-btn']} ${styles['btn-delete']}`}
                                                    onClick={() => handleRemoveItem(item.id, item.status, activeTab === 'claims' ? 'claims' : 'reports')}
                                                    title="Delete History"
                                                    disabled={actionLoading}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={styles['empty-state']}>
                                        No {activeTab === 'all' ? 'reports' : activeTab} found.
                                        {activeTab === 'claims' && (
                                            <p className={styles['empty-subtext']}>
                                                You haven't made any claims yet. Browse found items to make a claim.
                                            </p>
                                        )}
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