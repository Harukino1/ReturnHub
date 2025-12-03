import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Claims.module.css'
import { Search, Image, Eye, Plus } from 'lucide-react'

export default function StaffClaimsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ itemName: '', claimant: '', idType: '', idNumber: '', date: '', status: 'pending' })

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [claims, setClaims] = useState([
    { id: 1, itemName: 'Black Backpack', claimant: 'Jane Doe', idType: 'Passport', idNumber: 'P123456', date: '11/28/2025', status: 'pending', photoUrl: '' },
    { id: 2, itemName: 'iPhone 12', claimant: 'John D', idType: 'Driver’s License', idNumber: 'D-98765', date: '11/27/2025', status: 'approved', photoUrl: '' },
    { id: 3, itemName: 'Wallet', claimant: 'Maria S', idType: 'Student ID', idNumber: 'S-44521', date: '11/26/2025', status: 'rejected', photoUrl: '' },
    { id: 4, itemName: 'Umbrella', claimant: 'Paul C', idType: 'Company ID', idNumber: 'C-102', date: '11/25/2025', status: 'completed', photoUrl: '' }
  ])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return claims
      .filter((c) => activeTab === 'all' ? true : c.status === activeTab)
      .filter((c) => !q || [c.itemName, c.claimant, c.idType, c.idNumber, c.status].some((v) => v.toLowerCase().includes(q)))
  }, [claims, query, activeTab])

  return (
    <div className={styles['claims-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      <div className="container" style={{ paddingTop: '4rem', paddingLeft: sidebarOpen ? '250px' : '0' }}>
        <div className={styles['claims-header']}>
          <h1 className={styles['claims-title']}>Claims</h1>
          <form className={styles['claims-search-form']} onSubmit={(e) => e.preventDefault()}>
            <input className={styles['claims-search-input']} placeholder="Search claims" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className={styles['claims-search-btn']} aria-label="Search"><Search size={18} /></button>
          </form>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ marginLeft: 'auto' }}>
            <Plus size={16} /> Add Claim
          </button>
        </div>

        <div className={styles['claims-tabs']}>
          <button className={`${styles['claims-tab']} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>All</button>
          <button className={`${styles['claims-tab']} ${activeTab === 'pending' ? styles.active : ''}`} onClick={() => setActiveTab('pending')}>Pending</button>
          <button className={`${styles['claims-tab']} ${activeTab === 'approved' ? styles.active : ''}`} onClick={() => setActiveTab('approved')}>Approved</button>
          <button className={`${styles['claims-tab']} ${activeTab === 'rejected' ? styles.active : ''}`} onClick={() => setActiveTab('rejected')}>Rejected</button>
          <button className={`${styles['claims-tab']} ${activeTab === 'completed' ? styles.active : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
        </div>

        <div className={styles['claims-content']}>
          <table className={styles['claims-table']}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Claimant</th>
                <th>ID Type</th>
                <th>ID Number</th>
                <th>Date</th>
                {activeTab === 'all' && <th>Status</th>}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className={styles['item-cell']}>
                      <div className={styles['thumb']}>{c.photoUrl ? <img className={styles['thumb-image']} src={c.photoUrl} alt={c.itemName} /> : <Image size={18} />}</div>
                      <div className={styles['item-meta']}>
                        <div className={styles['item-name']}>{c.itemName}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.claimant}</td>
                  <td>{c.idType}</td>
                  <td>{c.idNumber}</td>
                  <td>{c.date}</td>
                  {activeTab === 'all' && <td>{c.status}</td>}
                  <td>
                    <button className={styles['view-btn']}>View <Eye size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'all' ? 7 : 6} className={styles['empty-cell']}>No claims</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showAdd && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal']}>
              <div className={styles['modal-header']}>
                <h3 className={styles['modal-title']}>Add Claim</h3>
              </div>
              <form
                className={styles['modal-form']}
                onSubmit={(e) => {
                  e.preventDefault()
                  const id = (claims[claims.length - 1]?.id || 0) + 1
                  const payload = { id, ...form, photoUrl: '' }
                  setClaims((p) => [payload, ...p])
                  setShowAdd(false)
                  setForm({ itemName: '', claimant: '', idType: '', idNumber: '', date: '', status: 'pending' })
                }}
              >
                <div className="form-grid">
                  <div className="input-wrap"><input className="input" placeholder="Item name" value={form.itemName} onChange={(e) => setForm((x) => ({ ...x, itemName: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" placeholder="Claimant name" value={form.claimant} onChange={(e) => setForm((x) => ({ ...x, claimant: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" placeholder="ID Type" value={form.idType} onChange={(e) => setForm((x) => ({ ...x, idType: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" placeholder="ID Number" value={form.idNumber} onChange={(e) => setForm((x) => ({ ...x, idNumber: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" placeholder="mm/dd/yyyy" value={form.date} onChange={(e) => setForm((x) => ({ ...x, date: e.target.value }))} required /></div>
                  <div className="input-wrap">
                    <select className="input" value={form.status} onChange={(e) => setForm((x) => ({ ...x, status: e.target.value }))}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Claim</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
