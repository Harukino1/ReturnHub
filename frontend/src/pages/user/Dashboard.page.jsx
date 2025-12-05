import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/Dashboard.module.css'
import ConfirmModal from '../../components/common/ConfirmModal'

// Dummy data for items
const dummyItems = [
  { id: 1, title: 'Black Leather Wallet', type: 'lost', location: 'Downtown Mall', date: '2 days ago', description: 'Black leather wallet with ID cards inside' },
  { id: 2, title: 'iPhone 13 Pro', type: 'found', location: 'Central Park', date: '1 day ago', description: 'Silver iPhone found near the fountain' },
  { id: 3, title: 'Blue Backpack', type: 'lost', location: 'University Library', date: '3 days ago', description: 'Navy blue backpack with laptop compartment' },
  { id: 4, title: 'Gold Watch', type: 'found', location: 'Coffee Shop', date: '5 hours ago', description: 'Gold wristwatch left on table' },
  { id: 5, title: 'Red Umbrella', type: 'lost', location: 'Bus Station', date: '1 week ago', description: 'Red compact umbrella with wooden handle' },
  { id: 6, title: 'Keys with Keychain', type: 'found', location: 'Parking Lot', date: '2 days ago', description: 'Set of keys with car keychain' },
  { id: 7, title: 'Sunglasses', type: 'lost', location: 'Beach Area', date: '4 days ago', description: 'Black Ray-Ban sunglasses in case' },
  { id: 8, title: 'Laptop Bag', type: 'found', location: 'Train Station', date: '6 hours ago', description: 'Gray laptop bag with charger inside' },
  { id: 1, title: 'Black Leather Wallet', type: 'lost', location: 'Downtown Mall', date: '2 days ago', description: 'Black leather wallet with ID cards inside' },
  { id: 2, title: 'iPhone 13 Pro', type: 'found', location: 'Central Park', date: '1 day ago', description: 'Silver iPhone found near the fountain' },
  { id: 3, title: 'Blue Backpack', type: 'lost', location: 'University Library', date: '3 days ago', description: 'Navy blue backpack with laptop compartment' },
  { id: 4, title: 'Gold Watch', type: 'found', location: 'Coffee Shop', date: '5 hours ago', description: 'Gold wristwatch left on table' },
  { id: 5, title: 'Red Umbrella', type: 'lost', location: 'Bus Station', date: '1 week ago', description: 'Red compact umbrella with wooden handle' },
  { id: 6, title: 'Keys with Keychain', type: 'found', location: 'Parking Lot', date: '2 days ago', description: 'Set of keys with car keychain' },
  { id: 7, title: 'Sunglasses', type: 'lost', location: 'Beach Area', date: '4 days ago', description: 'Black Ray-Ban sunglasses in case' },
  { id: 8, title: 'Laptop Bag', type: 'found', location: 'Train Station', date: '6 hours ago', description: 'Gray laptop bag with charger inside' },
]

export default function Dashboard() {
  const [filterType, setFilterType] = useState('lost')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const filteredItems = dummyItems.filter(item => {
    const matchesType = item.type === filterType
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled by filteredItems
  }

  return (
    <div className={styles['dashboard-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />

      {/* Main Content */}
      <main className={styles['dashboard-main']}>
        {/* CHANGED: Replaced "container" with "dashboard-container" for wider width */}
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
            <div className={styles['dashboard-items-grid']}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div key={item.id} className={styles['dashboard-item-card']}>
                    <div className={styles['dashboard-item-image']}>
                      <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                    </div>
                    <div className={styles['dashboard-item-content']}>
                      <h3 className={styles['dashboard-item-title']}>{item.title}</h3>
                      <p className={styles['dashboard-item-location']}>{item.location}</p>
                      <p className={styles['dashboard-item-date']}>{item.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles['dashboard-empty']}>
                  <p>No {filterType} items found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Report Button */}
          <button className={styles['dashboard-report-btn']} aria-label="Report item">
            Report
          </button>
        </div>
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
