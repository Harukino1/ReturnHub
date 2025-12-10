import { useMemo, useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Dashboard.module.css'
import { FileText, BadgeCheck, Mail, Layers, ArrowUpRight, Eye, Boxes } from 'lucide-react'

export default function StaffDashboardPage({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // --- Mock Data simulating Backend Responses ---
  
  // Recent Claims (Join of Claim entity + User + FoundItem)
  const [recentClaims] = useState([
    { 
      id: 101, 
      itemTitle: 'MacBook Pro 14"', 
      claimant: 'Alex Santos', 
      dateSubmitted: '12/08/2025', 
      status: 'pending', 
      photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80' 
    },
    { 
      id: 102, 
      itemTitle: 'Blue Umbrella', 
      claimant: 'Maria Clara', 
      dateSubmitted: '12/07/2025', 
      status: 'approved', 
      photoUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=150&q=80' 
    },
    { 
      id: 103, 
      itemTitle: 'Toyota Car Keys', 
      claimant: 'Juan Dela Cruz', 
      dateSubmitted: '12/06/2025', 
      status: 'pending', 
      photoUrl: '' 
    },
    { 
      id: 104, 
      itemTitle: 'Hydroflask Black', 
      claimant: 'Sarah Lee', 
      dateSubmitted: '12/05/2025', 
      status: 'rejected', 
      photoUrl: '' 
    }
  ])

  // Recent Reports (SubmittedReport entity)
  const [recentReports] = useState([
    { 
      id: 201, 
      title: 'Lost Brown Wallet', 
      type: 'lost', 
      category: 'Personal',
      reporter: 'Guest User', 
      dateSubmitted: '12/08/2025', 
      status: 'pending', 
      photoUrl: '' 
    },
    { 
      id: 202, 
      title: 'Found iPhone 13', 
      type: 'found', 
      category: 'Electronics',
      reporter: 'Security Staff', 
      dateSubmitted: '12/08/2025', 
      status: 'pending', 
      photoUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=150&q=80' 
    },
    { 
      id: 203, 
      title: 'Lost ID Lanyard', 
      type: 'lost', 
      category: 'Personal',
      reporter: 'Student A', 
      dateSubmitted: '12/07/2025', 
      status: 'approved', 
      photoUrl: '' 
    },
    { 
      id: 204, 
      title: 'Found Casio Watch', 
      type: 'found', 
      category: 'Electronics',
      reporter: 'Janitor Staff', 
      dateSubmitted: '12/07/2025', 
      status: 'published', 
      photoUrl: '' 
    },
    { 
      id: 205, 
      title: 'Beige Tote Bag', 
      type: 'found', 
      category: 'Bags',
      reporter: 'Admin', 
      dateSubmitted: '12/06/2025', 
      status: 'published', 
      photoUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=150&q=80' 
    }
  ])

  // Messages Stats
  const [messageStats] = useState({
    unread: 3
  })

  // Filter for Published Items Table
  const publishedReports = useMemo(() => {
    return recentReports.filter(r => r.status === 'published')
  }, [recentReports])

  // Calculate Metrics
  const metrics = useMemo(() => ({
    pendingClaims: recentClaims.filter(c => c.status === 'pending').length,
    pendingReports: recentReports.filter(r => r.status === 'pending').length,
    publishedItems: publishedReports.length,
    unreadMessages: messageStats.unread
  }), [recentClaims, recentReports, publishedReports.length, messageStats])

  

  // Helper for Status Badge Styling
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'published'; // Reusing green style
      case 'published': return 'published';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      case 'completed': return 'resolved';
      default: return 'pending';
    }
  }

  return (
    <div className={styles['dashboard-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />

      <div 
        className={styles['dashboard-container']}
        style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}
      >
        <div className={styles['dashboard-header']}>
          <div>
            <h1 className={styles['dashboard-title']}>Dashboard Overview</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
              Welcome back. Here is the latest activity requiring your attention.
            </p>
          </div>
        </div>

        {/* --- Key Metrics Grid --- */}
        <div className={styles['metrics-grid']}>
          
          {/* Card 1: Pending Claims (Priority) */}
          <div 
            className={`${styles['metric-card']} ${styles['metric-card--link']}`}
            onClick={() => onNavigate && onNavigate('staff-claims')}
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
          >
            <div className={styles['metric-icon']}><FileText size={20} /></div>
            <div className={styles['metric-content']}>
              <div className={styles['metric-title']}>Pending Reports</div>
              <div className={styles['metric-value']}>{metrics.pendingReports}</div>
              <div className={styles['metric-sub']}>New submissions</div>
            </div>
          </div>

          {/* Card 3: Published Items -> Redirects to Reports Page (Published Tab) */}
          <div 
            className={`${styles['metric-card']} ${styles['metric-card--link']}`}
            onClick={() => onNavigate && onNavigate('staff-reports')}
          >
            <div className={styles['metric-icon']}><Layers size={20} /></div>
            <div className={styles['metric-content']}>
              <div className={styles['metric-title']}>Published Items</div>
              <div className={styles['metric-value']}>{metrics.publishedItems}</div>
              <div className={styles['metric-sub']}>Active listings</div>
            </div>
          </div>

          {/* Card 4: Unread Messages -> Redirects to Messages Page */}
          <div 
            className={`${styles['metric-card']} ${styles['metric-card--link']}`}
            onClick={() => onNavigate && onNavigate('staff-messages')}
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
                              {c.photoUrl ? <img className={styles['thumb-image']} src={c.photoUrl} alt="" /> : <Boxes size={16} />}
                            </div>
                            <div className={styles['item-name']} style={{ fontSize: '0.9rem' }}>{c.itemTitle}</div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>{c.claimant}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{c.dateSubmitted}</td>
                        <td>
                          <span className={`${styles['status-pill']} ${styles[getStatusClass(c.status)]}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className={styles['view-btn']} title="Review Claim">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recentClaims.length === 0 && (
                      <tr><td colSpan="5" className={styles['empty-cell']}>No pending claims</td></tr>
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
                              {r.photoUrl ? <img className={styles['thumb-image']} src={r.photoUrl} alt="" /> : <FileText size={16} />}
                            </div>
                            <div className={styles['metric-content']} style={{ gap: 0 }}>
                              <div className={styles['item-name']} style={{ fontSize: '0.9rem' }}>{r.title}</div>
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
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>{r.category}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{r.dateSubmitted}</td>
                        <td>
                          <span className={`${styles['status-pill']} ${styles[getStatusClass(r.status)]}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {publishedReports.length === 0 && (
                       <tr><td colSpan="4" className={styles['empty-cell']}>No published items</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
