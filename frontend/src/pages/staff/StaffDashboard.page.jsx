import { useMemo, useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Dashboard.module.css'
import { FileText, BadgeCheck, Mail, Layers, ArrowUpRight, Eye, Boxes } from 'lucide-react'

// API Base URL - matches your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080'

export default function StaffDashboardPage({ onNavigate }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    // State for data from backend
    const [recentClaims, setRecentClaims] = useState([])
    const [recentReports, setRecentReports] = useState([])
    const [messageStats, setMessageStats] = useState({ unread: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Apply theme on mount
    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    // Helper function to format dates to mm-dd-yyyy
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'N/A'

        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')
        const yyyy = date.getFullYear()

        return `${mm}-${dd}-${yyyy}`
    }

    // Fetch dashboard data from backend on mount
    useEffect(() => {
        let cancelled = false

        async function loadDashboardData() {
            setLoading(true)
            setError('')

            try {
                // Get staff info from localStorage
                const staffData = localStorage.getItem('user')
                if (!staffData) {
                    setError('Not authenticated')
                    setLoading(false)
                    return
                }

                // Fetch all required data in parallel
                const [claimsRes, reportsRes, statsRes] = await Promise.all([
                    // Use the enhanced claims endpoint with details
                    fetch(`${API_BASE_URL}/api/claims/staff/with-details`, {
                        credentials: 'include'
                    }).catch(() => ({ ok: false })), // Fallback if endpoint doesn't exist

                    // Get all reports (or use enhanced endpoint if available)
                    fetch(`${API_BASE_URL}/api/reports`, {
                        credentials: 'include'
                    }),

                    // Get dashboard stats
                    fetch(`${API_BASE_URL}/api/staff/dashboard/stats`, {
                        credentials: 'include'
                    }).catch(() => null) // Optional endpoint
                ])

                // Check if enhanced claims endpoint exists, fallback to regular
                let claimsData = []
                if (claimsRes.ok) {
                    claimsData = await claimsRes.json()
                } else {
                    // Fallback to regular endpoint
                    const fallbackRes = await fetch(`${API_BASE_URL}/api/claims/staff`, {
                        credentials: 'include'
                    })
                    if (fallbackRes.ok) {
                        const fallbackData = await fallbackRes.json()
                        // If we only get IDs, we need to fetch user details separately
                        claimsData = fallbackData
                    }
                }

                const reportsData = await reportsRes.json()

                // Parse stats if available
                let stats = { unread: 0 }
                if (statsRes && statsRes.ok) {
                    const statsData = await statsRes.json()
                    stats.unread = statsData.unreadMessages || 0
                }

                if (!cancelled) {
                    // Normalize claims data - handle both enhanced and regular endpoints
                    const normalizedClaims = Array.isArray(claimsData)
                        ? claimsData.map(claim => {
                            // Check if it's enhanced format (has claimantUserName)
                            if (claim.claimantUserName) {
                                return {
                                    id: claim.claimId || claim.id,
                                    itemTitle: claim.itemName || claim.itemTitle || 'Unknown Item',
                                    claimant: claim.claimantUserName || 'Unknown User',
                                    dateSubmitted: formatDate(claim.dateSubmitted || claim.createdAt || claim.claimDate),
                                    status: claim.status || 'pending',
                                    photoUrl: claim.photoUrl || claim.itemPhotoUrl || ''
                                }
                            } else {
                                // Regular format - fetch user details separately
                                return {
                                    id: claim.claimId || claim.id,
                                    itemTitle: 'Unknown Item', // Will be updated later
                                    claimant: 'Loading...', // Placeholder
                                    dateSubmitted: formatDate(claim.createdAt || claim.claimDate),
                                    status: claim.status || 'pending',
                                    photoUrl: '',
                                    claimantUserId: claim.claimantUserId // Save for later fetching
                                }
                            }
                        })
                        : []

                    // Normalize reports data
                    const normalizedReports = Array.isArray(reportsData)
                        ? reportsData.map(report => ({
                            id: report.reportId || report.id,
                            title: report.itemName || report.title || 'Unknown Item',
                            type: report.type || 'lost',
                            category: report.category || 'N/A',
                            reporter: report.submitterUserName || report.reporterName || 'Unknown User',
                            dateSubmitted: formatDate(report.dateSubmitted || report.createdAt || report.submittedDate),
                            status: report.status || 'pending',
                            photoUrl: report.photoUrl1 || report.photoUrl || ''
                        }))
                        : []

                    // If we have claims without user names, fetch user details in batch
                    const claimsWithoutUserNames = normalizedClaims.filter(c => !c.claimant || c.claimant === 'Loading...')
                    if (claimsWithoutUserNames.length > 0) {
                        await fetchUserDetailsForClaims(claimsWithoutUserNames, normalizedClaims)
                    }

                    setRecentClaims(normalizedClaims)
                    setRecentReports(normalizedReports)
                    setMessageStats(stats)
                }
            } catch (err) {
                console.error('Error loading dashboard data:', err)
                if (!cancelled) {
                    setError('Failed to load dashboard data. Please try again.')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadDashboardData()

        return () => {
            cancelled = true
        }
    }, [])

    // Filter for Published Items Table (status: 'approved' or 'published')
    const publishedReports = useMemo(() => {
        return recentReports.filter(r =>
            r.status.toLowerCase() === 'published' ||
            r.status.toLowerCase() === 'approved'
        )
    }, [recentReports])

    // Calculate Metrics
    const metrics = useMemo(() => ({
        pendingClaims: recentClaims.filter(c => c.status.toLowerCase() === 'pending').length,
        pendingReports: recentReports.filter(r => r.status.toLowerCase() === 'pending').length,
        publishedItems: publishedReports.length,
        unreadMessages: messageStats.unread
    }), [recentClaims, recentReports, publishedReports.length, messageStats])

    // Helper for Status Badge Styling
    const getStatusClass = (status) => {
        switch(status.toLowerCase()) {
            case 'approved': return 'published'
            case 'published': return 'published'
            case 'pending': return 'pending'
            case 'rejected': return 'rejected'
            case 'completed': return 'resolved'
            default: return 'pending'
        }
    }

    const fetchUserDetailsForClaims = async (claimsToUpdate, allClaims) => {
        try {
            // Create a set of unique user IDs to fetch
            const userIds = [...new Set(claimsToUpdate
                .filter(c => c.claimantUserId)
                .map(c => c.claimantUserId)
            )]

            // Fetch user details in parallel
            const userPromises = userIds.map(userId =>
                fetch(`${API_BASE_URL}/api/users/${userId}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null)
            )

            const userResults = await Promise.all(userPromises)

            // Create a map of userId -> user details
            const userMap = {}
            userResults.forEach((user, index) => {
                if (user) {
                    userMap[userIds[index]] = user
                }
            })

            // Update claims with user names
            const updatedClaims = allClaims.map(claim => {
                if (claim.claimantUserId && userMap[claim.claimantUserId]) {
                    return {
                        ...claim,
                        claimant: userMap[claim.claimantUserId].name || 'Unknown User'
                    }
                }
                return claim
            })

            setRecentClaims(updatedClaims)
        } catch (err) {
            console.error('Error fetching user details:', err)
        }
    }

    // Handle view claim details
    const handleViewClaim = (claim) => {
        // Save claim data to sessionStorage for detail page
        sessionStorage.setItem('selectedClaim', JSON.stringify(claim))
        if (onNavigate) {
            onNavigate('staff-claims')
        }
    }

    return (
        <div className={styles['dashboard-page']}>
            {/* Navigation Bar */}
            <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                variant="private"
                onHamburgerClick={() => setSidebarOpen((p) => !p)}
            />

            {/* Staff Sidebar */}
            <StaffSidebar open={sidebarOpen} />

            {/* Main Dashboard Container */}
            <div
                className={styles['dashboard-container']}
                style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}
            >
                {/* Dashboard Header */}
                <div className={styles['dashboard-header']}>
                    <div>
                        <h1 className={styles['dashboard-title']}>Dashboard Overview</h1>
                        <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                            Welcome back. Here is the latest activity requiring your attention.
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                        <p>Loading dashboard data...</p>
                    </div>
                ) : error ? (
                    // Error State
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--red-500)', marginBottom: '1rem' }}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {/* --- Key Metrics Grid --- */}
                        <div className={styles['metrics-grid']}>

                            {/* Card 1: Pending Claims (Priority) */}
                            <div
                                className={`${styles['metric-card']} ${styles['metric-card--link']}`}
                                onClick={() => onNavigate && onNavigate('staff-claims')}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles['metric-icon']}><BadgeCheck size={20} /></div>
                                <div className={styles['metric-content']}>
                                    <div className={styles['metric-title']}>Pending Claims</div>
                                    <div className={styles['metric-value']}>{metrics.pendingClaims}</div>
                                    <div className={styles['metric-sub']}>Requires verification</div>
                                </div>
                            </div>

                            {/* Card 2: Pending Reports */}
                            <div
                                className={`${styles['metric-card']} ${styles['metric-card--link']}`}
                                onClick={() => onNavigate && onNavigate('staff-reports')}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles['metric-icon']}><FileText size={20} /></div>
                                <div className={styles['metric-content']}>
                                    <div className={styles['metric-title']}>Pending Reports</div>
                                    <div className={styles['metric-value']}>{metrics.pendingReports}</div>
                                    <div className={styles['metric-sub']}>New submissions</div>
                                </div>
                            </div>

                            {/* Card 3: Published Items */}
                            <div
                                className={`${styles['metric-card']} ${styles['metric-card--link']}`}
                                onClick={() => onNavigate && onNavigate('staff-reports')}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles['metric-icon']}><Layers size={20} /></div>
                                <div className={styles['metric-content']}>
                                    <div className={styles['metric-title']}>Published Items</div>
                                    <div className={styles['metric-value']}>{metrics.publishedItems}</div>
                                    <div className={styles['metric-sub']}>Active listings</div>
                                </div>
                            </div>

                            {/* Card 4: Unread Messages */}
                            <div
                                className={`${styles['metric-card']} ${styles['metric-card--link']}`}
                                onClick={() => onNavigate && onNavigate('staff-messages')}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles['metric-icon']}><Mail size={20} /></div>
                                <div className={styles['metric-content']}>
                                    <div className={styles['metric-title']}>Unread Messages</div>
                                    <div className={styles['metric-value']}>{metrics.unreadMessages}</div>
                                    <div className={styles['metric-sub']}>Support inbox</div>
                                </div>
                            </div>
                        </div>

                        {/* --- Content Grid (Triage Tables) --- */}
                        <div className={styles['content-grid']}>

                            {/* Left Panel: Recent Claims Triage */}
                            <div className={styles['panel']}>
                                <div className={styles['panel-header']}>
                                    <h3 className={styles['panel-title']}>Recent Claims</h3>
                                    <button
                                        className={styles['view-btn']}
                                        style={{ border: 'none', background: 'transparent', padding: 0 }}
                                        onClick={() => onNavigate && onNavigate('staff-claims')}
                                    >
                                        View All <ArrowUpRight size={16} />
                                    </button>
                                </div>
                                <div className={styles['panel-body']}>
                                    <div className={styles['table-responsive']}>
                                        <table className={styles['table']}>
                                            <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Claimant</th>
                                                <th>Submitted</th>
                                                <th>Status</th>
                                                <th></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {recentClaims.slice(0, 5).map((c) => (
                                                <tr key={c.id}>
                                                    <td>
                                                        <div className={styles['item-cell']}>
                                                            <div className={styles['thumb']}>
                                                                {c.photoUrl ? (
                                                                    <img
                                                                        className={styles['thumb-image']}
                                                                        src={c.photoUrl}
                                                                        alt={c.itemTitle}
                                                                    />
                                                                ) : (
                                                                    <Boxes size={16} />
                                                                )}
                                                            </div>
                                                            <div className={styles['item-name']} style={{ fontSize: '0.9rem' }}>
                                                                {c.itemTitle}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                                                        {c.claimant}
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                                                        {c.dateSubmitted}
                                                    </td>
                                                    <td>
                              <span className={`${styles['status-pill']} ${styles[getStatusClass(c.status)]}`}>
                                {c.status}
                              </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            className={styles['view-btn']}
                                                            title="Review Claim"
                                                            onClick={() => handleViewClaim(c)}
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {recentClaims.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className={styles['empty-cell']}>
                                                        No pending claims
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Published Items */}
                            <div className={styles['panel']}>
                                <div className={styles['panel-header']}>
                                    <h3 className={styles['panel-title']}>Published Items</h3>
                                    <button
                                        className={styles['view-btn']}
                                        style={{ border: 'none', background: 'transparent', padding: 0 }}
                                        onClick={() => onNavigate && onNavigate('staff-reports')}
                                    >
                                        View All <ArrowUpRight size={16} />
                                    </button>
                                </div>
                                <div className={styles['panel-body']}>
                                    <div className={styles['table-responsive']}>
                                        <table className={styles['table']}>
                                            <thead>
                                            <tr>
                                                <th>Item Details</th>
                                                <th>Category</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {publishedReports.slice(0, 5).map((r) => (
                                                <tr key={r.id}>
                                                    <td>
                                                        <div className={styles['item-cell']}>
                                                            <div className={styles['thumb']}>
                                                                {r.photoUrl ? (
                                                                    <img
                                                                        className={styles['thumb-image']}
                                                                        src={r.photoUrl}
                                                                        alt={r.title}
                                                                    />
                                                                ) : (
                                                                    <FileText size={16} />
                                                                )}
                                                            </div>
                                                            <div className={styles['metric-content']} style={{ gap: 0 }}>
                                                                <div className={styles['item-name']} style={{ fontSize: '0.9rem' }}>
                                                                    {r.title}
                                                                </div>
                                                                <span style={{
                                                                    textTransform: 'uppercase',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: '700',
                                                                    color: r.type === 'lost' ? '#ef4444' : '#059669',
                                                                    letterSpacing: '0.05em'
                                                                }}>
                                    {r.type}
                                  </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>
                                                        {r.category}
                                                    </td>
                                                    <td style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                        {r.dateSubmitted}
                                                    </td>
                                                    <td>
                              <span className={`${styles['status-pill']} ${styles[getStatusClass(r.status)]}`}>
                                {r.status}
                              </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {publishedReports.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className={styles['empty-cell']}>
                                                        No published items
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    )
}