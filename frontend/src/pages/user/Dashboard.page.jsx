import { useState, useEffect, useRef } from 'react'
import { Search, AlertCircle, BadgeCheck } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Dashboard.module.css'
import ConfirmModal from '../../components/common/ConfirmModal'

const API_BASE_URL = 'http://localhost:8080'

export default function Dashboard() {
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

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // Helper function for Date Formatting (mm-dd-yyyy)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString
    
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    
    return `${mm}-${dd}-${yyyy}`
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [lostRes, foundRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/lost-items/public`),
          fetch(`${API_BASE_URL}/api/found-items/public`)
        ])

        const lost = await lostRes.json().catch(() => [])
        const found = await foundRes.json().catch(() => [])

        // DEBUGGING: Inspect these in your browser console (F12) to see the real field names
        // console.log('Raw Lost Items from API:', lost);
        // console.log('Raw Found Items from API:', found);

        const normalizeLost = (it) => ({
          id: it.itemId,
          type: 'lost',
          // FIXED: Checks itemName, name, title, item_name to ensure we get the real name.
          // Fallback to category only if all name fields are missing.
          title: it.itemName || it.name || it.title || it.item_name || it.category || 'Lost item',
          category: it.category,
          description: it.description,
          location: it.location,
          // Apply format here
          date: formatDate(it.dateOfEvent || it.createdAt),
          images: [it.photoUrl].filter(Boolean)
        })

        const normalizeFound = (it) => ({
          id: it.itemId,
          type: 'found',
          // FIXED: Checks itemName, name, title, item_name to ensure we get the real name.
          title: it.itemName || it.name || it.title || it.item_name || it.category || 'Found item',
          category: it.category,
          description: it.description,
          location: it.location,
          // Apply format here
          date: formatDate(it.dateOfEvent || it.createdAt),
          images: [it.photoUrl1, it.photoUrl2, it.photoUrl3].filter(Boolean)
        })

        const merged = [
          ...(Array.isArray(lost) ? lost.map(normalizeLost) : []),
          ...(Array.isArray(found) ? found.map(normalizeFound) : [])
        ]
        if (!cancelled) setItems(merged)
      } catch (err) {
        console.error("Error loading items:", err)
        if (!cancelled) setError('Failed to load items. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!showReportChoice) return
    const onKey = (e) => { if (e.key === 'Escape') setShowReportChoice(false) }
    document.addEventListener('keydown', onKey)
    const id = setTimeout(() => { reportLostBtnRef.current?.focus() }, 0)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(id) }
  }, [showReportChoice])

  const filteredItems = items.filter(item => {
    // Ensure properties exist before calling toLowerCase() to prevent crashes
    const safeTitle = (item.title || '').toLowerCase()
    const safeDesc = (item.description || '').toLowerCase()
    const safeLoc = (item.location || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesType = item.type === filterType
    const matchesSearch = safeTitle.includes(query) ||
                          safeDesc.includes(query) ||
                          safeLoc.includes(query)
    return matchesType && matchesSearch
  })

  const handleSearch = (e) => {
    e.preventDefault()
  }

  return (
    <div className={styles['dashboard-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
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
              />
              <button type="submit" className={styles['dashboard-search-btn']}>
                <Search size={20} />
              </button>
            </form>

            {/* Filter Toggles */}
            <div className={styles['dashboard-filters']}>
              <button
                className={`${styles['dashboard-filter-btn']} ${filterType === 'lost' ? styles.active : ''}`}
                onClick={() => setFilterType('lost')}
              >
                Lost
              </button>
              <button
                className={`${styles['dashboard-filter-btn']} ${filterType === 'found' ? styles.active : ''}`}
                onClick={() => setFilterType('found')}
              >
                Found
              </button>
            </div>
          </div>

          {/* Items Grid */}
          <div className={styles['dashboard-content']}>
            {loading ? (
              <div className={styles['dashboard-empty']}><p>Loading items...</p></div>
            ) : error ? (
              <div className={styles['dashboard-empty']}><p>{error}</p></div>
            ) : (
              <div className={styles['dashboard-items-grid']}>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => (
                    <div
                      key={`${item.type}-${item.id}-${idx}`}
                      className={styles['dashboard-item-card']}
                      onClick={() => {
                        // CRITICAL: This is where we save the item data for the details page.
                        if (item.type === 'lost') {
                          try { sessionStorage.setItem('lostItem', JSON.stringify(item)) } catch { void 0 }
                          window.location.hash = '#/lost-item'
                        } else if (item.type === 'found') {
                          try { sessionStorage.setItem('foundItem', JSON.stringify(item)) } catch { void 0 }
                          window.location.hash = '#/found-item'
                        }
                      }}
                    >
                      <div className={styles['dashboard-item-image']}>
                        {item.images && item.images[0] ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                        ) : (
                          <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                          </svg>
                        )}
                      </div>
                      <div className={styles['dashboard-item-content']}>
                        <h3 className={styles['dashboard-item-title']}>{item.title}</h3>
                        <p className={styles['dashboard-item-location']}>{item.location}</p>
                        <p className={styles['dashboard-item-date']}>{item.date}</p>
                        
                        {item.type === 'found' && (
                           <button
                             type="button"
                             className={styles['claim-btn']}
                             aria-label="Request Claim"
                             onClick={(e) => {
                               e.stopPropagation()
                               try { sessionStorage.setItem('claimItem', JSON.stringify(item)) } catch { void 0 }
                               window.location.hash = '#/claim-request'
                             }}
                           >
                             Request Claim
                           </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles['dashboard-empty']}>
                    <p>No {filterType} items found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Button */}
          <button
            className={styles['dashboard-report-btn']}
            aria-label="Report item"
            onClick={() => setShowReportChoice(true)}
          >
            Report
          </button>
        </div>
        {showReportChoice && (
          <div className={styles['report-overlay']} role="dialog" aria-modal="true">
            <div className={styles['report-modal']}>
              <div className={styles['report-header']}>
                <h3 className={styles['report-title']}>Choose Report Type</h3>
              </div>
              <div className={styles['report-body']}>
                <p className={styles['report-message']}>Select what you want to report.</p>
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