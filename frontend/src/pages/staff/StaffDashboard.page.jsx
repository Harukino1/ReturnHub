import { useMemo, useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Dashboard.module.css'
import { FileText, BadgeCheck, Boxes, Mail, Image, Eye } from 'lucide-react'

export default function StaffDashboardPage({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // --- Placeholder data for triage & status ---
  const [claims] = useState([
    { id: 1, itemName: 'Black Backpack', claimant: 'Jane Doe', date: '12/06/2025', status: 'pending', photoUrl: '' },
    { id: 2, itemName: 'iPhone 12', claimant: 'John D', date: '12/05/2025', status: 'approved', photoUrl: '' },
    { id: 3, itemName: 'Wallet', claimant: 'Maria S', date: '12/05/2025', status: 'pending', photoUrl: '' },
    { id: 4, itemName: 'Umbrella', claimant: 'Paul C', date: '12/04/2025', status: 'completed', photoUrl: '' }
  ])
  const [reports] = useState([
    { id: 11, name: 'Laptop Sleeve', type: 'found', reporter: 'Staff A', date: '12/07/2025', status: 'pending', photoUrl: '' },
    { id: 12, name: 'Wallet', type: 'lost', reporter: 'User B', date: '12/07/2025', status: 'approved', photoUrl: '' },
    { id: 13, name: 'Keychain', type: 'found', reporter: 'Staff B', date: '12/06/2025', status: 'pending', photoUrl: '' }
  ])
  const [inventory] = useState([
    { id: 101, name: 'Black Backpack', status: 'in-hub' },
    { id: 102, name: 'iPhone 12', status: 'claimed' },
    { id: 103, name: 'Wallet', status: 'in-hub' }
  ])
  const [messages] = useState([
    { id: 201, subject: 'Claim follow-up', read: false },
    { id: 202, subject: 'Report inquiry', read: true },
    { id: 203, subject: 'Schedule pickup', read: false }
  ])

  const metrics = useMemo(() => ({
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    pendingClaims: claims.filter((c) => c.status === 'pending').length,
    itemsInHub: inventory.filter((i) => i.status === 'in-hub').length,
    unreadMessages: messages.filter((m) => !m.read).length
  }), [reports, claims, inventory, messages])

  const recentClaims = useMemo(() => claims.slice(0, 5), [claims])
  const recentReports = useMemo(() => reports.slice(0, 5), [reports])

  return (
    <div className={styles['dashboard-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />

      <div 
        className={styles['dashboard-container']}
        style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}
      >
        <div className={styles['dashboard-header']}>
          <h1 className={styles['dashboard-title']}>Staff Triage</h1>
        </div>

        {/* Key Metrics */}
        <div className={styles['metrics-grid']}>
          <div className={`${styles['metric-card']} ${styles['metric-card--hover']}`}>
            <div className={styles['metric-icon']}><BadgeCheck size={20} /></div>
            <div className={styles['metric-content']}>
              <div className={styles['metric-title']}>Pending Claims</div>
              <div className={styles['metric-value']}>{metrics.pendingClaims}</div>
              <div className={styles['metric-sub']}>Highest priority</div>
            </div>
          </div>
          <div className={`${styles['metric-card']} ${styles['metric-card--hover']}`}>
            <div className={styles['metric-icon']}><FileText size={20} /></div>
            <div className={styles['metric-content']}>
              <div className={styles['metric-title']}>Pending Reports</div>
              <div className={styles['metric-value']}>{metrics.pendingReports}</div>
              <div className={styles['metric-sub']}>Awaiting review</div>
            </div>
          </div>
          <div className={`${styles['metric-card']} ${styles['metric-card--link']}`}
               onClick={() => onNavigate && onNavigate('staff-inventory')}
               role="button" tabIndex={0}
               onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate('staff-inventory') }}>
            <div className={styles['metric-icon']}><Boxes size={20} /></div>
            <div className={styles['metric-content']}>
              <div className={styles['metric-title']}>Items in Hub</div>
              <div className={styles['metric-value']}>{metrics.itemsInHub}</div>
              <div className={styles['metric-sub']}>Current inventory</div>
            </div>
          </div>
          <div className={`${styles['metric-card']} ${styles['metric-card--link']}`}
               onClick={() => onNavigate && onNavigate('staff-messages')}
               role="button" tabIndex={0}
               onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate('staff-messages') }}>
            <div className={styles['metric-icon']}><Mail size={20} /></div>
            <div className={styles['metric-content']}>
              <div className={styles['metric-title']}>Unread Messages</div>
              <div className={styles['metric-value']}>{metrics.unreadMessages}</div>
              <div className={styles['metric-sub']}>Support inbox</div>
            </div>
          </div>
        </div>

        {/* Actionable Lists */}
        <div className={styles['content-grid']}>
          {/* Recent Claims */}
          <div className={styles['panel']}>
            <div className={styles['panel-header']}>
              <h3 className={styles['panel-title']}>Recent Claims</h3>
            </div>
            <div className={styles['panel-body']}>
              <div className={styles['table-responsive']}>
                <table className={styles['table']}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Claimant</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className={styles['item-cell']}>
                            <div className={styles['thumb']}>{c.photoUrl ? <img className={styles['thumb-image']} src={c.photoUrl} alt={c.itemName} /> : <Image size={16} />}</div>
                            <div className={styles['item-meta']}>
                              <div className={styles['item-name']}>{c.itemName}</div>
                            </div>
                          </div>
                        </td>
                        <td>{c.claimant}</td>
                        <td>{c.date}</td>
                        <td><span className={styles['status-pill']}>{c.status}</span></td>
                        <td>
                          <button className={styles['view-btn']} onClick={() => alert('Review placeholder')}>Review <Eye size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {recentClaims.length === 0 && (
                      <tr>
                        <td colSpan="5" className={styles['empty-cell']}>No recent claims</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className={styles['panel']}>
            <div className={styles['panel-header']}>
              <h3 className={styles['panel-title']}>Recent Reports</h3>
            </div>
            <div className={styles['panel-body']}>
              <div className={styles['table-responsive']}>
                <table className={styles['table']}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Reporter</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className={styles['item-cell']}>
                            <div className={styles['thumb']}>{r.photoUrl ? <img className={styles['thumb-image']} src={r.photoUrl} alt={r.name} /> : <Image size={16} />}</div>
                            <div className={styles['item-meta']}>
                              <div className={styles['item-name']}>{r.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>{r.type}</td>
                        <td>{r.reporter}</td>
                        <td>{r.date}</td>
                        <td><span className={styles['status-pill']}>{r.status}</span></td>
                      </tr>
                    ))}
                    {recentReports.length === 0 && (
                      <tr>
                        <td colSpan="5" className={styles['empty-cell']}>No recent reports</td>
                      </tr>
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
