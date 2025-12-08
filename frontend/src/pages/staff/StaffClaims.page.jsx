import { useEffect, useMemo, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Claims.module.css'
import { Search, Image, Eye, FileText, User, X, Check, AlertTriangle, ShieldAlert, MessageSquare, Briefcase } from 'lucide-react'

export default function StaffClaimsPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  
  // Modal States
  const [selectedClaim, setSelectedClaim] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  // Mock Data
  const [claims, setClaims] = useState([
    { 
      id: 101, 
      dateSubmitted: '2025-12-06T09:30:00',
      status: 'pending',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1585770536735-38b96d997235?auto=format&fit=crop&w=400&q=80',
      claimantNote: 'There is a small scratch on the bottom right corner of the screen. The lock screen is a picture of a golden retriever.',
      claimantUser: {
        userId: 1,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '0917-123-4567'
      },
      foundItem: {
        itemId: 55,
        submittedReport: {
          itemName: 'iPhone 13',
          category: 'Electronics',
          description: 'Black iPhone 13 with clear case. Found on bench near fountain.',
          uniqueDetail: 'Deep scratch near charging port. Sim tray is missing.',
          location: 'Ayala Terraces',
          photoUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80'
        }
      }
    },
    { 
      id: 102, 
      dateSubmitted: '2025-12-05T14:15:00',
      status: 'approved',
      proofDocumentUrl: '', 
      claimantNote: 'It contains a blue Parker pen and a notebook with "Physics" written on it.',
      claimantUser: {
        userId: 2,
        name: 'John Smith',
        email: 'john.smith@university.edu',
        phone: '0999-888-7777'
      },
      foundItem: {
        itemId: 62,
        submittedReport: {
          itemName: 'Leather Satchel',
          category: 'Bags',
          description: 'Brown leather satchel, Jansport brand.',
          uniqueDetail: 'Inside pocket has ink stains. Name tag says "J.S."',
          location: 'Library 2nd Floor',
          photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'
        }
      }
    },
    { 
      id: 103, 
      dateSubmitted: '2025-12-04T10:00:00',
      status: 'rejected',
      proofDocumentUrl: 'https://via.placeholder.com/150',
      claimantNote: 'I left it near the entrance guard. It has a wooden handle.',
      claimantUser: {
        userId: 3,
        name: 'Mark Lee',
        email: 'mark.lee@corp.com',
        phone: '0922-333-4444'
      },
      foundItem: {
        itemId: 40,
        submittedReport: {
          itemName: 'Blue Umbrella',
          category: 'Personal',
          description: 'Blue umbrella, huge size.',
          uniqueDetail: 'Handle is broken at the tip.',
          location: 'Lobby',
          photoUrl: ''
        }
      }
    },
    { 
      id: 104, 
      dateSubmitted: '2025-12-01T08:00:00',
      status: 'claimed',
      proofDocumentUrl: '',
      claimantNote: 'Black tumbler with "Hydrate" sticker.',
      claimantUser: {
        userId: 4,
        name: 'Sarah Connor',
        email: 'sarah.c@future.net',
        phone: '0918-555-1234'
      },
      foundItem: {
        itemId: 99,
        submittedReport: {
          itemName: 'Hydroflask',
          category: 'Personal',
          description: '32oz Black Hydroflask.',
          uniqueDetail: 'Dent on the bottom.',
          location: 'Gym',
          photoUrl: ''
        }
      }
    }
  ])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return claims.filter((c) => {
      const matchTab = activeTab === 'all' || c.status.toLowerCase() === activeTab
      const matchSearch = !q || [
        c.claimantUser.name, 
        c.foundItem.submittedReport.itemName, 
        c.foundItem.submittedReport.location
      ].some(v => v?.toLowerCase().includes(q))
      
      return matchTab && matchSearch
    })
  }, [claims, query, activeTab])

  const handleStatusChange = (newStatus) => {
    if (!selectedClaim) return
    setClaims(prev => prev.map(c => c.id === selectedClaim.id ? { ...c, status: newStatus } : c))
    // Update local selected state to reflect immediate change
    setSelectedClaim(prev => ({ ...prev, status: newStatus }))
  }

  const handleMessageUser = () => {
    // Logic to start conversation with this specific user would go here
    window.location.hash = '#/staff/messages'
  }

  return (
    <div className={styles['claims-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <StaffSidebar open={sidebarOpen} />
      
      <div 
        className={styles['claims-container']} 
        style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}
      >
        {/* Header */}
        <div className={styles['claims-header']}>
          <div className={styles['header-title-group']}>
            <h1 className={styles['claims-title']}>Claims Management</h1>
            <p className={styles['claims-subtitle']}>Verify ownership and process item returns.</p>
          </div>
          
          <div className={styles['controls']}>
            <div className={styles['search-box']}>
              <Search size={18} />
              <input 
                className={styles['search-input']} 
                placeholder="Search claimant or item..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles['claims-tabs']}>
          {['pending', 'approved', 'claimed', 'rejected', 'all'].map((tab) => (
            <button 
              key={tab}
              className={`${styles['claims-tab']} ${activeTab === tab ? styles.active : ''}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && <span className={styles['tab-count']}>{claims.filter(c => c.status === 'pending').length}</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles['claims-content']}>
          <div className={styles['table-responsive']}>
            <table className={styles['claims-table']}>
              <thead>
                <tr>
                  <th>Item Requested</th>
                  <th>Claimant</th>
                  <th>Date Submitted</th>
                  <th>Proof Provided</th>
                  <th>Status</th>
                  <th style={{textAlign:'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className={styles['item-cell']}>
                        <div className={styles['thumb']}>
                          {c.foundItem.submittedReport.photoUrl ? (
                            <img className={styles['thumb-image']} src={c.foundItem.submittedReport.photoUrl} alt="Item" />
                          ) : (
                            <Image size={18} />
                          )}
                        </div>
                        <div className={styles['item-meta']}>
                          <div className={styles['item-name']}>{c.foundItem.submittedReport.itemName}</div>
                          <div className={styles['item-sub']}>{c.foundItem.submittedReport.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles['user-meta']}>
                        <div className={styles['user-name']}>{c.claimantUser.name}</div>
                        <div className={styles['user-contact']}>{c.claimantUser.email}</div>
                      </div>
                    </td>
                    <td>{formatDate(c.dateSubmitted)}</td>
                    <td>
                       {c.proofDocumentUrl ? (
                         <span className={styles['proof-badge']}><FileText size={12} /> Doc</span>
                       ) : (
                         <span className={styles['text-muted']}>—</span>
                       )}
                    </td>
                    <td>
                      <span className={`${styles['status-pill']} ${styles[c.status.toLowerCase()]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{textAlign:'right'}}>
                      <button className={styles['view-btn']} onClick={() => setSelectedClaim(c)}>
                        Review <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className={styles['empty-cell']}>No claims found matching filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- REVIEW MODAL --- */}
        {selectedClaim && (
          <div className={styles['modal-overlay']} onClick={() => setSelectedClaim(null)}>
            <div className={styles['review-modal']} onClick={e => e.stopPropagation()}>
              
              <div className={styles['modal-header']}>
                <div>
                  <h3 className={styles['modal-title']}>Claim Review #{selectedClaim.id}</h3>
                  <div className={styles['modal-subtitle']}>Compare item details with claimant proof</div>
                </div>
                <button className={styles['modal-close']} onClick={() => setSelectedClaim(null)}><X size={20} /></button>
              </div>
              
              <div className={styles['review-grid']}>
                {/* Left: System Item */}
                <div className={styles['review-section']}>
                  <h4 className={styles['section-heading']}>Found Item Record</h4>
                  <div className={styles['image-box']}>
                    {selectedClaim.foundItem.submittedReport.photoUrl ? (
                      <img src={selectedClaim.foundItem.submittedReport.photoUrl} alt="Found Item" />
                    ) : (
                      <div className={styles['no-img']}><Image size={32} /> No Item Photo</div>
                    )}
                  </div>
                  <div className={styles['details-list']}>
                    <div className={styles['detail-row']}>
                      <span className={styles['label']}>Name</span>
                      <span className={styles['val']}>{selectedClaim.foundItem.submittedReport.itemName}</span>
                    </div>
                    <div className={styles['detail-row']}>
                      <span className={styles['label']}>Category</span>
                      <span className={styles['val']}>{selectedClaim.foundItem.submittedReport.category}</span>
                    </div>
                    <div className={styles['detail-row']}>
                      <span className={styles['label']}>Location Found</span>
                      <span className={styles['val']}>{selectedClaim.foundItem.submittedReport.location}</span>
                    </div>
                    <div className={styles['detail-row']}>
                      <span className={styles['label']}>Description</span>
                      <p className={styles['desc']}>{selectedClaim.foundItem.submittedReport.description}</p>
                    </div>

                    {/* NEW SECTION: Unique Detail (Internal) */}
                    <div className={`${styles['claimant-note-box']} ${styles['internal-box']}`}>
                      <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem'}}>
                        <ShieldAlert size={14} color="var(--amber-600)" />
                        <span className={styles['label']} style={{color:'var(--amber-700)'}}>Unique Detail (Hidden from Public)</span>
                      </div>
                      <p className={styles['note-text']}>
                        {selectedClaim.foundItem.submittedReport.uniqueDetail || "No hidden details recorded."}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Right: Claimant Proof */}
                <div className={`${styles['review-section']} ${styles['bg-alt']}`}>
                  <h4 className={styles['section-heading']}>Claimant's Proof</h4>
                  <div className={styles['user-header']}>
                    <div className={styles['avatar']}><User size={20} /></div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div className={styles['user-name']}>{selectedClaim.claimantUser.name}</div>
                      <div className={styles['user-contact']}>{selectedClaim.claimantUser.phone}</div>
                      <div className={styles['user-contact']} style={{marginTop:'0.1rem'}}>{selectedClaim.claimantUser.email}</div>
                    </div>
                  </div>
                  
                  <div className={styles['proof-box']}>
                    {selectedClaim.proofDocumentUrl ? (
                      <img src={selectedClaim.proofDocumentUrl} alt="Proof" className={styles['proof-img']} />
                    ) : (
                      <div className={styles['no-proof']}>
                        <FileText size={32} />
                        <p>No proof document uploaded.</p>
                      </div>
                    )}
                  </div>

                  <div className={styles['claimant-note-box']}>
                    <span className={styles['label']}>Claimant's Unique Detail Note</span>
                    <p className={styles['note-text']}>
                      {selectedClaim.claimantNote || "No specific details provided."}
                    </p>
                  </div>
                  
                  <div className={styles['verification-alert']}>
                    <AlertTriangle size={14} />
                    <span>Cross-check this note with the hidden detail on the left.</span>
                  </div>
                </div>
              </div>

              <div className={styles['modal-footer']}>
                
                {/* 1. Status Indicator & Message Button */}
                <div className={styles['footer-left']}>
                  <button className={styles['btn-message']} onClick={handleMessageUser}>
                    <MessageSquare size={16} /> Message
                  </button>
                  <span className={`${styles['status-pill']} ${styles[selectedClaim.status]}`}>
                    {selectedClaim.status}
                  </span>
                </div>

                {/* 2. Action Buttons based on Status */}
                <div className={styles['footer-actions']}>
                  
                  {/* Scenario: PENDING (Default) */}
                  {selectedClaim.status === 'pending' && (
                    <>
                      <button 
                        className={styles['btn-reject']}
                        onClick={() => handleStatusChange('rejected')}
                      >
                         Reject
                      </button>
                      <button 
                        className={styles['btn-approve']}
                        onClick={() => handleStatusChange('approved')}
                      >
                        <Check size={18} /> Approve Claim
                      </button>
                    </>
                  )}

                  {/* Scenario: APPROVED (Can Claim or Reject) */}
                  {selectedClaim.status === 'approved' && (
                    <>
                      <button 
                        className={styles['btn-reject']}
                        onClick={() => handleStatusChange('rejected')}
                      >
                         Revoke Approval
                      </button>
                      <button 
                        className={styles['btn-approve']}
                        onClick={() => handleStatusChange('claimed')}
                      >
                        <Briefcase size={18} /> Mark as Claimed
                      </button>
                    </>
                  )}

                  {/* Scenario: REJECTED (Correction) */}
                  {selectedClaim.status === 'rejected' && (
                    <button 
                      className={styles['btn-approve']}
                      onClick={() => handleStatusChange('approved')}
                    >
                      Revert to Approved
                    </button>
                  )}

                  {/* Scenario: CLAIMED (Revert if mistake) */}
                  {selectedClaim.status === 'claimed' && (
                    <button 
                      className={styles['btn-outline']}
                      onClick={() => handleStatusChange('approved')}
                    >
                      Revert to Approved
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}