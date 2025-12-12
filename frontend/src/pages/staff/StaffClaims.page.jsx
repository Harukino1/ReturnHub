import { useEffect, useMemo, useState, useCallback } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Claims.module.css'
import { Search, Image, Eye, FileText, User, X, Check, AlertTriangle, ShieldAlert, MessageSquare, Briefcase } from 'lucide-react'

// API Base URLs
const API_BASE_URL = 'http://localhost:8080'
const API_BASE_CLAIMS = `${API_BASE_URL}/api/claims`

export default function StaffClaimsPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState('pending')

    // Modal States
    const [selectedClaim, setSelectedClaim] = useState(null)

    // Data States
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Apply theme on mount
    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    // Helper function to format dates
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return 'N/A'
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    // Helper function to format date/time for details
    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A'
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return 'N/A'
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Convert backend DTO to frontend format
    const normalizeClaim = (dto) => {
        return {
            id: dto.claimId,
            dateSubmitted: dto.claimDate || dto.createdAt,
            proofDocumentUrl: dto.proofDocumentUrl || dto.proofPhotoUrl || '',
            claimantNote: dto.claimantNote || dto.uniqueDetail || '',
            status: dto.status || 'pending',  // ← ADD THIS LINE
            claimantUser: {
                userId: dto.userId || dto.claimantUserId,
                name: dto.userName || dto.claimantName || 'Unknown User',
                email: dto.userEmail || dto.claimantEmail || 'N/A',
                phone: dto.userPhone || dto.claimantPhone || 'N/A'
            },
            foundItem: {
                itemId: dto.itemId || dto.foundItemId,
                submittedReport: {
                    itemName: dto.itemName || dto.itemTitle || 'Unknown Item',
                    category: dto.category || dto.itemCategory || 'N/A',
                    description: dto.description || dto.itemDescription || 'No description',
                    uniqueDetail: dto.itemUniqueDetail || dto.hiddenDetail || '',
                    location: dto.location || dto.itemLocation || 'N/A',
                    dateFound: dto.dateFound || dto.itemDateFound || dto.dateOfEvent,
                    photoUrl: dto.photoUrl || dto.itemPhotoUrl || dto.itemPhotoUrl1 || ''
                }
            }
        }
    }

    // Load all claims from backend
    const loadClaims = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            // Use the new endpoint
            const res = await fetch(`${API_BASE_CLAIMS}/staff/with-details`, {
                credentials: 'include'
            })

            if (!res.ok) {
                throw new Error('Failed to load claims')
            }

            const data = await res.json()

            if (Array.isArray(data)) {
                const normalized = data.map(normalizeClaim)
                setClaims(normalized)
            } else {
                setClaims([])
            }
        } catch (err) {
            console.error('Error loading claims:', err)
            setError('Failed to load claims. Please try again.')
            setClaims([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Load claims on mount
    useEffect(() => {
        loadClaims()
    }, [loadClaims])

    // Filter claims based on tab and search query
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return claims.filter((c) => {
            const matchTab = activeTab === 'all' || c.status.toLowerCase() === activeTab
            const matchSearch = !q || [
                c.claimantUser.name,
                c.foundItem.submittedReport.itemName,
                c.foundItem.submittedReport.location,
                c.claimantUser.email
            ].some(v => v?.toLowerCase().includes(q))

            return matchTab && matchSearch
        })
    }, [claims, query, activeTab])

    // Get staff ID from localStorage
    const getStaffId = () => {
        try {
            const userData = localStorage.getItem('user')
            if (!userData) return 1
            const user = JSON.parse(userData)
            return user.staffId || user.userId || 1
        } catch {
            return 1
        }
    }

    // Update claim status in backend
    const handleStatusChange = async (newStatus) => {
        if (!selectedClaim) return

        const staffId = getStaffId()

        try {
            let endpoint = ''
            let payload = {
                reviewerStaffId: staffId,
                reviewNotes: `Status changed to ${newStatus} by staff`
            }

            // Determine which endpoint to call based on new status
            if (newStatus === 'approved') {
                endpoint = `${API_BASE_CLAIMS}/${selectedClaim.id}/approve`
                payload.status = 'approved'
            } else if (newStatus === 'rejected') {
                endpoint = `${API_BASE_CLAIMS}/${selectedClaim.id}/reject`
                payload.status = 'rejected'
            } else if (newStatus === 'claimed') {
                // For "claimed" status, we might use approve endpoint or a custom one
                // Assuming you want to mark it as "completed" or similar
                endpoint = `${API_BASE_CLAIMS}/${selectedClaim.id}/approve`
                payload.status = 'claimed'
            } else {
                // Generic status update if you have a general endpoint
                endpoint = `${API_BASE_CLAIMS}/${selectedClaim.id}/status`
                payload.status = newStatus
            }

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                throw new Error('Failed to update claim status')
            }

            const updatedClaim = await res.json()
            const normalized = normalizeClaim(updatedClaim)

            // Update local state
            setClaims(prev => prev.map(c => c.id === normalized.id ? normalized : c))
            setSelectedClaim(normalized)

        } catch (err) {
            console.error('Error updating claim status:', err)
            alert('Failed to update claim status. Please try again.')
        }
    }

    // Navigate to messages page
    const handleMessageUser = () => {
        if (selectedClaim?.claimantUser?.userId) {
            // Store user ID for conversation creation
            sessionStorage.setItem('messageUserId', selectedClaim.claimantUser.userId)
        }
        window.location.hash = '#/staff/messages'
    }

    return (
        <div className={styles['claims-page']}>
            {/* Navigation Bar */}
            <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                variant="private"
                onHamburgerClick={() => setSidebarOpen((p) => !p)}
            />

            {/* Staff Sidebar */}
            <StaffSidebar open={sidebarOpen} />

            <div
                className={styles['claims-container']}
                style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}
            >
                {/* Header */}
                <div className={styles['claims-header']}>
                    <div className={styles['header-title-group']}>
                        <h1 className={styles['claims-title']}>Claims Management</h1>
                        <p className={styles['claims-subtitle']}>
                            Verify ownership and process item returns.
                        </p>
                    </div>

                    <div className={styles['controls']}>
                        <div className={styles['search-box']}>
                            <Search size={18} />
                            <input
                                className={styles['search-input']}
                                placeholder="Search claimant or item..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search claims"
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
                            {tab === 'pending' && (
                                <span className={styles['tab-count']}>
                  {claims.filter(c => c.status === 'pending').length}
                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Content */}
                <div className={styles['claims-content']}>
                    {loading ? (
                        // Loading State
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                            <p>Loading claims...</p>
                        </div>
                    ) : error ? (
                        // Error State
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--red-500)', marginBottom: '1rem' }}>{error}</p>
                            <button
                                onClick={loadClaims}
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
                        // Claims Table
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
                                        {/* Item Details */}
                                        <td>
                                            <div className={styles['item-cell']}>
                                                <div className={styles['thumb']}>
                                                    {c.foundItem.submittedReport.photoUrl ? (
                                                        <img
                                                            className={styles['thumb-image']}
                                                            src={c.foundItem.submittedReport.photoUrl}
                                                            alt="Item"
                                                        />
                                                    ) : (
                                                        <Image size={18} />
                                                    )}
                                                </div>
                                                <div className={styles['item-meta']}>
                                                    <div className={styles['item-name']}>
                                                        {c.foundItem.submittedReport.itemName}
                                                    </div>
                                                    <div className={styles['item-sub']}>
                                                        {c.foundItem.submittedReport.category}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Claimant Info */}
                                        <td>
                                            <div className={styles['user-meta']}>
                                                <div className={styles['user-name']}>{c.claimantUser.name}</div>
                                                <div className={styles['user-contact']}>{c.claimantUser.email}</div>
                                            </div>
                                        </td>

                                        {/* Date Submitted */}
                                        <td>{formatDate(c.dateSubmitted)}</td>

                                        {/* Proof Document Indicator */}
                                        <td>
                                            {c.proofDocumentUrl ? (
                                                <span className={styles['proof-badge']}>
                            <FileText size={12} /> Doc
                          </span>
                                            ) : (
                                                <span className={styles['text-muted']}>—</span>
                                            )}
                                        </td>

                                        {/* Status Badge */}
                                        <td>
                        <span className={`${styles['status-pill']} ${styles[c.status.toLowerCase()]}`}>
                          {c.status}
                        </span>
                                        </td>

                                        {/* Action Button */}
                                        <td style={{textAlign:'right'}}>
                                            <button
                                                className={styles['view-btn']}
                                                onClick={() => setSelectedClaim(c)}
                                            >
                                                Review <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className={styles['empty-cell']}>
                                            No claims found matching filters.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- REVIEW MODAL --- */}
                {selectedClaim && (
                    <div
                        className={styles['modal-overlay']}
                        onClick={() => setSelectedClaim(null)}
                    >
                        <div
                            className={styles['review-modal']}
                            onClick={e => e.stopPropagation()}
                        >

                            {/* Modal Header */}
                            <div className={styles['modal-header']}>
                                <div>
                                    <h3 className={styles['modal-title']}>
                                        Claim Review #{selectedClaim.id}
                                    </h3>
                                    <div className={styles['modal-subtitle']}>
                                        Compare item details with claimant proof
                                    </div>
                                </div>
                                <button
                                    className={styles['modal-close']}
                                    onClick={() => setSelectedClaim(null)}
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Review Grid - Split View */}
                            <div className={styles['review-grid']}>

                                {/* Left Panel: Found Item Record (System) */}
                                <div className={styles['review-section']}>
                                    <h4 className={styles['section-heading']}>Found Item Record</h4>

                                    {/* Item Photo */}
                                    <div className={styles['image-box']}>
                                        {selectedClaim.foundItem.submittedReport.photoUrl ? (
                                            <img
                                                src={selectedClaim.foundItem.submittedReport.photoUrl}
                                                alt="Found Item"
                                            />
                                        ) : (
                                            <div className={styles['no-img']}>
                                                <Image size={32} />
                                                <span>No Item Photo</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Details List */}
                                    <div className={styles['details-list']}>
                                        <div className={styles['detail-row']}>
                                            <span className={styles['label']}>Name</span>
                                            <span className={styles['val']}>
                        {selectedClaim.foundItem.submittedReport.itemName}
                      </span>
                                        </div>

                                        <div className={styles['detail-row']}>
                                            <span className={styles['label']}>Category</span>
                                            <span className={styles['val']}>
                        {selectedClaim.foundItem.submittedReport.category}
                      </span>
                                        </div>

                                        <div className={styles['detail-row']}>
                                            <span className={styles['label']}>Location Found</span>
                                            <span className={styles['val']}>
                        {selectedClaim.foundItem.submittedReport.location}
                      </span>
                                        </div>

                                        <div className={styles['detail-row']}>
                                            <span className={styles['label']}>Date Found</span>
                                            <span className={styles['val']}>
                        {formatDateTime(selectedClaim.foundItem.submittedReport.dateFound)}
                      </span>
                                        </div>

                                        <div className={styles['detail-row']}>
                                            <span className={styles['label']}>Description</span>
                                            <p className={styles['desc']}>
                                                {selectedClaim.foundItem.submittedReport.description}
                                            </p>
                                        </div>

                                        {/* Unique Detail (Hidden from Public - Staff Only) */}
                                        <div className={`${styles['claimant-note-box']} ${styles['internal-box']}`}>
                                            <div style={{
                                                display:'flex',
                                                alignItems:'center',
                                                gap:'0.5rem',
                                                marginBottom:'0.25rem'
                                            }}>
                                                <ShieldAlert size={14} color="var(--amber-600)" />
                                                <span
                                                    className={styles['label']}
                                                    style={{color:'var(--amber-700)'}}
                                                >
                          Unique Detail (Hidden from Public)
                        </span>
                                            </div>
                                            <p className={styles['note-text']}>
                                                {selectedClaim.foundItem.submittedReport.uniqueDetail ||
                                                    "No hidden details recorded."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel: Claimant's Proof */}
                                <div className={`${styles['review-section']} ${styles['bg-alt']}`}>
                                    <h4 className={styles['section-heading']}>Claimant's Proof</h4>

                                    {/* Claimant User Info */}
                                    <div className={styles['user-header']}>
                                        <div className={styles['avatar']}>
                                            <User size={20} />
                                        </div>
                                        <div style={{flex: 1, minWidth: 0}}>
                                            <div className={styles['user-name']}>
                                                {selectedClaim.claimantUser.name}
                                            </div>
                                            <div className={styles['user-contact']}>
                                                {selectedClaim.claimantUser.phone}
                                            </div>
                                            <div
                                                className={styles['user-contact']}
                                                style={{marginTop:'0.1rem'}}
                                            >
                                                {selectedClaim.claimantUser.email}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proof Document Photo */}
                                    <div className={styles['proof-box']}>
                                        {selectedClaim.proofDocumentUrl ? (
                                            <img
                                                src={selectedClaim.proofDocumentUrl}
                                                alt="Proof"
                                                className={styles['proof-img']}
                                            />
                                        ) : (
                                            <div className={styles['no-proof']}>
                                                <FileText size={32} />
                                                <p>No proof document uploaded.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Claimant's Note (their unique detail) */}
                                    <div className={styles['claimant-note-box']}>
                    <span className={styles['label']}>
                      Claimant's Unique Detail Note
                    </span>
                                        <p className={styles['note-text']}>
                                            {selectedClaim.claimantNote || "No specific details provided."}
                                        </p>
                                    </div>

                                    {/* Verification Alert */}
                                    <div className={styles['verification-alert']}>
                                        <AlertTriangle size={14} />
                                        <span>Cross-check this note with the hidden detail on the left.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer - Action Buttons */}
                            <div className={styles['modal-footer']}>

                                {/* Left: Message Button & Status */}
                                <div className={styles['footer-left']}>
                                    <button
                                        className={styles['btn-message']}
                                        onClick={handleMessageUser}
                                    >
                                        <MessageSquare size={16} /> Message
                                    </button>
                                    <span className={`${styles['status-pill']} ${styles[selectedClaim.status]}`}>
                    {selectedClaim.status}
                  </span>
                                </div>

                                {/* Right: Status Action Buttons */}
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

                                    {/* Scenario: APPROVED (Can mark as claimed or revoke) */}
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

                                    {/* Scenario: REJECTED (Can revert to approved) */}
                                    {selectedClaim.status === 'rejected' && (
                                        <button
                                            className={styles['btn-approve']}
                                            onClick={() => handleStatusChange('approved')}
                                        >
                                            Revert to Approved
                                        </button>
                                    )}

                                    {/* Scenario: CLAIMED (Can revert if mistake) */}
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