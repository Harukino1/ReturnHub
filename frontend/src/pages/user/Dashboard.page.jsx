import { useState, useEffect, useRef } from 'react'
import { Search, AlertCircle, BadgeCheck } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Dashboard.module.css'
import ConfirmModal from '../../components/common/ConfirmModal'

// API Base URL - matches your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080'

export default function Dashboard() {
    // State management
    const [filterType, setFilterType] = useState('lost')
    const [searchQuery, setSearchQuery] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [showReportChoice, setShowReportChoice] = useState(false)
    const reportLostBtnRef = useRef(null)
    const [items, setItems] = useState([])
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

    // Fetch items from backend on component mount
    useEffect(() => {
        let cancelled = false

        async function loadItems() {
            setLoading(true)
            setError('')

            try {
                // Fetch both lost and found items from backend
                const [lostRes, foundRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/lost-items/public`),
                    fetch(`${API_BASE_URL}/api/found-items/public`)
                ])

                // Check if responses are ok
                if (!lostRes.ok || !foundRes.ok) {
                    throw new Error('Failed to fetch items from server')
                }

                // Parse JSON responses
                const lostItems = await lostRes.json()
                const foundItems = await foundRes.json()

                // Normalize lost items to common format
                const normalizeLost = (item) => ({
                    id: item.itemId,
                    type: 'lost',
                    title: item.itemName || item.category || 'Lost Item',
                    category: item.category || 'N/A',
                    description: item.description || 'No description available',
                    location: item.location || 'Location not specified',
                    date: formatDate(item.dateOfEvent || item.createdAt),
                    images: item.photoUrl ? [item.photoUrl] : [],
                    status: item.status
                })

                // Normalize found items to common format
                const normalizeFound = (item) => ({
                    id: item.itemId,
                    type: 'found',
                    title: item.itemName || item.category || 'Found Item',
                    category: item.category || 'N/A',
                    description: item.description || 'No description available',
                    location: item.location || 'Location not specified',
                    date: formatDate(item.dateOfEvent || item.createdAt),
                    images: [item.photoUrl1, item.photoUrl2, item.photoUrl3].filter(Boolean),
                    status: item.status
                })

                // Merge both arrays
                const allItems = [
                    ...(Array.isArray(lostItems) ? lostItems.map(normalizeLost) : []),
                    ...(Array.isArray(foundItems) ? foundItems.map(normalizeFound) : [])
                ]

                if (!cancelled) {
                    setItems(allItems)
                }
            } catch (err) {
                console.error("Error loading items:", err)
                if (!cancelled) {
                    setError('Failed to load items. Please check your connection and try again.')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadItems()

        // Cleanup function to prevent state updates on unmounted component
        return () => {
            cancelled = true
        }
    }, [])

    // Handle keyboard events for report modal
    useEffect(() => {
        if (!showReportChoice) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setShowReportChoice(false)
        }

        document.addEventListener('keydown', handleKeyDown)

        // Focus on "Report Lost" button when modal opens
        const timeoutId = setTimeout(() => {
            reportLostBtnRef.current?.focus()
        }, 0)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            clearTimeout(timeoutId)
        }
    }, [showReportChoice])

    // Filter items based on type and search query
    const filteredItems = items.filter(item => {
        const safeTitle = (item.title || '').toLowerCase()
        const safeDesc = (item.description || '').toLowerCase()
        const safeLoc = (item.location || '').toLowerCase()
        const safeCategory = (item.category || '').toLowerCase()
        const query = searchQuery.toLowerCase()

        const matchesType = item.type === filterType
        const matchesSearch =
            safeTitle.includes(query) ||
            safeDesc.includes(query) ||
            safeLoc.includes(query) ||
            safeCategory.includes(query)

        return matchesType && matchesSearch
    })

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault()
        // Search is handled by filter effect
    }

    // Handle item card click - navigate to details page
    const handleItemClick = (item) => {
        if (item.type === 'lost') {
            sessionStorage.setItem('lostItem', JSON.stringify(item))
            window.location.hash = '#/lost-item'
        } else if (item.type === 'found') {
            sessionStorage.setItem('foundItem', JSON.stringify(item))
            window.location.hash = '#/found-item'
        }
    }

    // Handle claim button click (Found items)
    const handleClaimClick = (e, item) => {
        e.stopPropagation() // Prevent card click event
        sessionStorage.setItem('claimItem', JSON.stringify(item))
        window.location.hash = '#/claim-request'
    }

    // Handle message button click (Lost items)
    const handleMessageClick = (e, item) => {
        e.stopPropagation() // Prevent card click event
        // Store item context in case the message page can pre-fill information
        sessionStorage.setItem('messageItem', JSON.stringify(item))
        window.location.hash = '#/messages'
    }

    return (
        <div className={styles['dashboard-page']}>
            {/* Navigation Bar */}
            <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                variant="private"
                onHamburgerClick={() => setSidebarOpen((prev) => !prev)}
            />

            {/* User Sidebar */}
            <UserSidebar open={sidebarOpen} />

            {/* Main Content */}
            <main className={styles['dashboard-main']}>
                <div
                    className={styles['dashboard-container']}
                    style={{ paddingLeft: sidebarOpen ? '250px' : '2rem' }}
                >
                    {/* Search Section */}
                    <div className={styles['dashboard-search-section']}>
                        <form onSubmit={handleSearch} className={styles['dashboard-search-form']}>
                            <input
                                type="text"
                                placeholder="Search for items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles['dashboard-search-input']}
                                aria-label="Search items"
                            />
                            <button
                                type="submit"
                                className={styles['dashboard-search-btn']}
                                aria-label="Search"
                            >
                                <Search size={20} />
                            </button>
                        </form>

                        {/* Filter Toggles - Lost/Found */}
                        <div className={styles['dashboard-filters']}>
                            <button
                                className={`${styles['dashboard-filter-btn']} ${
                                    filterType === 'lost' ? styles.active : ''
                                }`}
                                onClick={() => setFilterType('lost')}
                                aria-pressed={filterType === 'lost'}
                            >
                                Lost
                            </button>
                            <button
                                className={`${styles['dashboard-filter-btn']} ${
                                    filterType === 'found' ? styles.active : ''
                                }`}
                                onClick={() => setFilterType('found')}
                                aria-pressed={filterType === 'found'}
                            >
                                Found
                            </button>
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className={styles['dashboard-content']}>
                        {loading ? (
                            // Loading state
                            <div className={styles['dashboard-empty']}>
                                <p>Loading items...</p>
                            </div>
                        ) : error ? (
                            // Error state
                            <div className={styles['dashboard-empty']}>
                                <p className={styles['error-text']}>{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className={styles['retry-btn']}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            // Items grid
                            <div className={styles['dashboard-items-grid']}>
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, idx) => (
                                        <div
                                            key={`${item.type}-${item.id}-${idx}`}
                                            className={styles['dashboard-item-card']}
                                            onClick={() => handleItemClick(item)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    handleItemClick(item)
                                                }
                                            }}
                                        >
                                            {/* Item Image */}
                                            <div className={styles['dashboard-item-image']}>
                                                {item.images && item.images[0] ? (
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.title}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    // Placeholder icon if no image
                                                    <svg
                                                        width="48"
                                                        height="48"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Item Content */}
                                            <div className={styles['dashboard-item-content']}>
                                                <h3 className={styles['dashboard-item-title']}>
                                                    {item.title}
                                                </h3>
                                                <p className={styles['dashboard-item-category']}>
                                                    {item.category}
                                                </p>
                                                <p className={styles['dashboard-item-location']}>
                                                    📍 {item.location}
                                                </p>
                                                <p className={styles['dashboard-item-date']}>
                                                    📅 {item.date}
                                                </p>

                                                {/* Claim button for found items */}
                                                {item.type === 'found' && (
                                                    <button
                                                        type="button"
                                                        className={styles['claim-btn']}
                                                        aria-label="Request Claim"
                                                        onClick={(e) => handleClaimClick(e, item)}
                                                    >
                                                        Request Claim
                                                    </button>
                                                )}

                                                {/* Message button for lost items */}
                                                {item.type === 'lost' && (
                                                    <button
                                                        type="button"
                                                        className={styles['message-btn']}
                                                        aria-label="Message Return|Hub"
                                                        onClick={(e) => handleMessageClick(e, item)}
                                                    >
                                                        Message Return|Hub
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Empty state
                                    <div className={styles['dashboard-empty']}>
                                        <p>No {filterType} items found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Floating Report Button */}
                    <button
                        className={styles['dashboard-report-btn']}
                        aria-label="Report item"
                        onClick={() => setShowReportChoice(true)}
                    >
                        Report
                    </button>
                </div>

                {/* Report Choice Modal */}
                {showReportChoice && (
                    <div
                        className={styles['report-overlay']}
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setShowReportChoice(false)}
                    >
                        <div
                            className={styles['report-modal']}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles['report-header']}>
                                <h3 className={styles['report-title']}>Choose Report Type</h3>
                            </div>
                            <div className={styles['report-body']}>
                                <p className={styles['report-message']}>
                                    Select what you want to report.
                                </p>
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
                                    onClick={() => {
                                        setShowReportChoice(false)
                                        window.location.hash = '#/report/lost'
                                    }}
                                >
                                    <AlertCircle size={18} />
                                    Lost Item
                                </button>
                                <button
                                    type="button"
                                    className={styles['report-btn-option']}
                                    onClick={() => {
                                        setShowReportChoice(false)
                                        window.location.hash = '#/report/found'
                                    }}
                                >
                                    <BadgeCheck size={18} />
                                    Found Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout Confirmation Modal */}
                <ConfirmModal
                    open={showLogoutConfirm}
                    title="Logout"
                    message="Are you sure you want to logout?"
                    confirmText="Logout"
                    cancelText="Cancel"
                    onCancel={() => setShowLogoutConfirm(false)}
                    onConfirm={() => {
                        localStorage.removeItem('user')
                        setShowLogoutConfirm(false)
                        window.location.hash = '#/auth/login'
                    }}
                    tone="danger"
                />
            </main>
        </div>
    )
}