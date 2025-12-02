import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Inventory.module.css'
import { Search, Image, Plus, Eye, Boxes } from 'lucide-react'

export default function StaffInventoryPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', location: '', dateIn: '', quantity: 1, status: 'in-hub' })

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const [items, setItems] = useState([
    { id: 1, name: 'Black Backpack', category: 'Bags', location: 'Main Desk', dateIn: '11/28/2025', quantity: 1, status: 'in-hub', photoUrl: '' },
    { id: 2, name: 'iPhone 12', category: 'Electronics', location: 'Locker A', dateIn: '11/27/2025', quantity: 1, status: 'posted', photoUrl: '' },
    { id: 3, name: 'Wallet', category: 'Personal', location: 'Locker B', dateIn: '11/26/2025', quantity: 1, status: 'claimed', photoUrl: '' }
  ])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((it) => activeTab === 'all' ? true : it.status === activeTab)
      .filter((it) => !q || [it.name, it.category, it.location, it.status].some((v) => v.toLowerCase().includes(q)))
  }, [items, query, activeTab])

  return (
    <div className={styles['inventory-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      <div className="container" style={{ paddingTop: '4rem', marginLeft: sidebarOpen ? '250px' : '0' }}>
        <div className={styles['inventory-header']}>
          <h1 className={styles['inventory-title']}>Inventory</h1>
          <form className={styles['inventory-search-form']} onSubmit={(e) => e.preventDefault()}>
            <input className={styles['inventory-search-input']} placeholder="Search inventory" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className={styles['inventory-search-btn']} aria-label="Search"><Search size={18} /></button>
          </form>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ marginLeft: 'auto' }}>
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className={styles['inventory-tabs']}>
          <button className={`${styles['inventory-tab']} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>All</button>
          <button className={`${styles['inventory-tab']} ${activeTab === 'in-hub' ? styles.active : ''}`} onClick={() => setActiveTab('in-hub')}>In Hub</button>
          <button className={`${styles['inventory-tab']} ${activeTab === 'posted' ? styles.active : ''}`} onClick={() => setActiveTab('posted')}>Posted</button>
          <button className={`${styles['inventory-tab']} ${activeTab === 'claimed' ? styles.active : ''}`} onClick={() => setActiveTab('claimed')}>Claimed</button>
        </div>

        <div className={styles['inventory-content']}>
          <table className={styles['inventory-table']}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Location</th>
                <th>Date In</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td>
                    <div className={styles['item-cell']}>
                      <div className={styles['thumb']}>{it.photoUrl ? <img className={styles['thumb-image']} src={it.photoUrl} alt={it.name} /> : <Image size={18} />}</div>
                      <div className={styles['item-meta']}>
                        <div className={styles['item-name']}>{it.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{it.category}</td>
                  <td>{it.location}</td>
                  <td>{it.dateIn}</td>
                  <td>{it.quantity}</td>
                  <td>{it.status}</td>
                  <td>
                    <button className={styles['view-btn']}>View <Eye size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles['empty-cell']}>No items</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showAdd && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal']}>
              <div className={styles['modal-header']}>
                <h3 className={styles['modal-title']}>Add Item</h3>
              </div>
              <form
                className={styles['modal-form']}
                onSubmit={(e) => {
                  e.preventDefault()
                  const id = (items[items.length - 1]?.id || 0) + 1
                  const payload = { id, ...form, photoUrl: '' }
                  setItems((p) => [payload, ...p])
                  setShowAdd(false)
                  setForm({ name: '', category: '', location: '', dateIn: '', quantity: 1, status: 'in-hub' })
                }}
              >
                <div className="form-grid">
                  <div className="input-wrap"><input className="input" placeholder="Item name" value={form.name} onChange={(e) => setForm((x) => ({ ...x, name: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm((x) => ({ ...x, category: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm((x) => ({ ...x, location: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" placeholder="mm/dd/yyyy" value={form.dateIn} onChange={(e) => setForm((x) => ({ ...x, dateIn: e.target.value }))} required /></div>
                  <div className="input-wrap"><input className="input" type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm((x) => ({ ...x, quantity: Number(e.target.value) }))} required /></div>
                  <div className="input-wrap">
                    <select className="input" value={form.status} onChange={(e) => setForm((x) => ({ ...x, status: e.target.value }))}>
                      <option value="in-hub">In Hub</option>
                      <option value="posted">Posted</option>
                      <option value="claimed">Claimed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary"><Boxes size={16} /> Save Item</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

