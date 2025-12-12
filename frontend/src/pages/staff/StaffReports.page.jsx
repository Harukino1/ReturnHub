import { useEffect, useMemo, useState, useCallback } from 'react'
import Navbar from '../../components/layout/Navbar'
import StaffSidebar from '../../components/staff/StaffSidebar'
import styles from '../../styles/pages/staff/Reports.module.css'
import { Search, Image, Eye, Plus, Filter, X, ChevronLeft, ChevronRight, ExternalLink, MapPin, Calendar, User, Tag, Camera, Phone, Mail } from 'lucide-react'

// API Base URLs
const API_BASE_URL = 'http://localhost:8080'
const API_BASE_STAFF = `${API_BASE_URL}/api/staff`
const API_BASE_REPORTS = `${API_BASE_URL}/api/reports`
const API_BASE_USERS = `${API_BASE_URL}/api/users`
const API_BASE_UPLOAD = `${API_BASE_URL}/api/uploads`

export default function StaffReportsPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState('pending')
    const [typeFilter, setTypeFilter] = useState('All')

    // --- REVIEW MODAL & SLIDER STATE ---
    const [selectedReport, setSelectedReport] = useState(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // --- CREATE REPORT STATE ---
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState({
        name: '', type: 'found', category: '', location: '', date: '',
        reporterName: '', reporterPhone: '', reporterEmail: '',
        description: '', uniqueDetail: '', status: 'approved',
        photos: [], photoFiles: [] // Store both preview URLs and actual files
    })

    // Data state
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Category options
    const CATEGORIES = [
        'Electronics & Gadgets',
        'Clothing & Apparel',
        'Home & Living',
        'Kitchen & Dining',
        'Health & Beauty',
        'Sports & Outdoors',
        'Toys & Hobbies',
        'Automotive & Industrial',
        'Office & School Supplies',
        'Books & Media',
        'Groceries & Pets',
        'Miscellaneous'
    ]

    // Apply theme on mount
    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    // Helper function to format dates to mm-dd-yyyy
    const formatDateStr = (s) => {
        if (!s) return 'N/A'
        const dt = new Date(s)
        if (Number.isNaN(dt.getTime())) return s
        const mm = String(dt.getMonth() + 1).padStart(2, '0')
        const dd = String(dt.getDate()).padStart(2, '0')
        const yyyy = String(dt.getFullYear())
        return `${mm}-${dd}-${yyyy}`
    }

    // Map backend status to frontend display
    const mapStatus = (s) => {
        const v = (s || '').toLowerCase()
        if (v === 'approved') return 'Approved'
        if (v === 'published') return 'Published'
        if (v === 'pending' || v === 'submitted' || v === 'draft') return 'Pending'
        if (v === 'rejected') return 'Rejected'
        if (v === 'completed' || v === 'resolved') return 'Resolved'
        return 'Pending'
    }

    // Convert backend DTO to frontend row format
    const toRow = (dto) => {
        const photos = [dto.photoUrl1, dto.photoUrl2, dto.photoUrl3].filter((u) => !!u)
        return {
            id: dto.reportId,
            name: dto.itemName || 'Unknown Item',
            type: (dto.type || 'lost').toLowerCase(),
            date: dto.dateOfEvent || dto.dateSubmitted || dto.createdAt,
            category: dto.category || 'N/A',
            location: dto.location || 'N/A',
            reporter: dto.submitterUserName || dto.userName || 'Unknown',
            submitterUserId: dto.submitterUserId || dto.userId || null,
            status: mapStatus(dto.status),
            description: dto.description || 'No description provided',
            uniqueDetail: dto.uniqueDetail || '',
            claimsCount: dto.claimsCount || 0,
            reporterPhone: dto.reporterPhone || '',
            reporterEmail: dto.reporterEmail || '',
            photos
        }
    }

    // Load all reports from backend
    const loadReports = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_BASE_REPORTS}`, {
                credentials: 'include'
            })

            if (!res.ok) {
                throw new Error('Failed to load reports')
            }

            const data = await res.json()

            if (Array.isArray(data)) {
                const rows = data.map(toRow)
                setReports(rows)
            } else {
                setReports([])
            }
        } catch (err) {
            console.error('Error loading reports:', err)
            setError('Failed to load reports. Please try again.')
            setReports([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Load reports on mount
    useEffect(() => {
        loadReports()
    }, [loadReports])

    // Fetch user contact info when viewing report details
    useEffect(() => {
        if (!selectedReport || selectedReport.reporterPhone || !selectedReport.submitterUserId) return

        const fetchUserInfo = async () => {
            try {
                const res = await fetch(`${API_BASE_USERS}/${selectedReport.submitterUserId}`)
                const data = await res.json()

                if (data && data.success) {
                    setSelectedReport((prev) => ({
                        ...prev,
                        reporterPhone: data.phone || prev.reporterPhone,
                        reporterEmail: data.email || prev.reporterEmail
                    }))
                }
            } catch (err) {
                console.error('Error fetching user info:', err)
            }
        }

        fetchUserInfo()
    }, [selectedReport])

    // Alternative: Fetch claims for each published found item
    const loadClaimsForReport = useCallback(async (reportId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/claims/staff/items/${reportId}`, {
                credentials: 'include'
            })
            if (res.ok) {
                const data = await res.json()
                return Array.isArray(data) ? data.length : 0
            }
            return 0
        } catch {
            return 0
        }
    }, [])

// Update the useEffect to load claims count
    useEffect(() => {
        const loadReportsWithClaims = async () => {
            await loadReports()

            // For published found items, load claims count
            const publishedFoundItems = reports.filter(r =>
                r.status === 'Published' && r.type === 'found'
            )

            for (const report of publishedFoundItems) {
                const claimsCount = await loadClaimsForReport(report.id)
                if (claimsCount > 0) {
                    setReports(prev => prev.map(r =>
                        r.id === report.id ? { ...r, claimsCount } : r
                    ))
                }
            }
        }

        loadReportsWithClaims()
    }, [loadReports, loadClaimsForReport])

    // Filter reports based on tab, type, and search query
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return reports.filter((r) => {
            const tab = activeTab.toLowerCase()
            const matchTab = tab === 'all' || r.status.toLowerCase() === tab
            const matchType = typeFilter === 'All' || r.type.toLowerCase() === typeFilter.toLowerCase()
            const matchSearch = !q || [r.name, r.category, r.location, r.reporter].some(v => v?.toLowerCase().includes(q))
            return matchTab && matchType && matchSearch
        })
    }, [reports, query, activeTab, typeFilter])

    // --- IMAGE SLIDER HANDLERS ---
    const handleNextImage = (e) => {
        e.stopPropagation()
        if (!selectedReport?.photos?.length) return
        setCurrentImageIndex((prev) => (prev + 1) % selectedReport.photos.length)
    }

    const handlePrevImage = (e) => {
        e.stopPropagation()
        if (!selectedReport?.photos?.length) return
        setCurrentImageIndex((prev) => (prev - 1 + selectedReport.photos.length) % selectedReport.photos.length)
    }

    // Get staff ID from localStorage
    const getReviewerStaffId = () => {
        try {
            const s = localStorage.getItem('user')
            if (!s) return 1
            const u = JSON.parse(s)
            return u.staffId || u.userId || 1
        } catch {
            return 1
        }
    }

    // Update report status in backend
    const applyStatus = async (status, notes = '') => {
        if (!selectedReport) return

        const reviewerStaffId = getReviewerStaffId()

        try {
            const res = await fetch(`${API_BASE_REPORTS}/${selectedReport.id}/status`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    status,
                    reviewerStaffId,
                    reviewNotes: notes
                })
            })

            if (!res.ok) {
                throw new Error('Failed to update status')
            }

            const updated = await res.json()
            const row = toRow(updated)

            // Update local state
            setReports((prev) => prev.map(r => (r.id === row.id ? row : r)))
            setSelectedReport(row)

        } catch (err) {
            console.error('Error updating status:', err)
            alert('Failed to update status. Please try again.')
        }
    }

    // --- PHOTO UPLOAD HANDLERS ---
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        const remainingSlots = 3 - form.photos.length
        if (remainingSlots <= 0) return

        const toAdd = files.slice(0, remainingSlots)
        const newPhotos = toAdd.map(file => URL.createObjectURL(file))

        setForm(prev => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos],
            photoFiles: [...prev.photoFiles, ...toAdd]
        }))
    }

    const removePhoto = (index) => {
        setForm(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index),
            photoFiles: prev.photoFiles.filter((_, i) => i !== index)
        }))
    }

    // Upload photos to Supabase
    const uploadPhotos = async (files, userId) => {
        const uploadedUrls = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', userId)
            formData.append('index', i)

            try {
                const res = await fetch(`${API_BASE_UPLOAD}/report-photo`, {
                    method: 'POST',
                    body: formData
                })

                const data = await res.json()

                if (data.success && data.url) {
                    uploadedUrls.push(data.url)
                } else {
                    console.error('Photo upload failed:', data.message)
                }
            } catch (err) {
                console.error('Error uploading photo:', err)
            }
        }

        return uploadedUrls
    }

    // Handle manual report creation
    const handleCreateSubmit = async (e) => {
        e.preventDefault()

        if (!form.name || !form.category || !form.location || !form.date || !form.reporterName) {
            alert('Please fill in all required fields')
            return
        }

        setSubmitting(true)

        try {
            // Get staff user ID for photo uploads
            const staffData = localStorage.getItem('user')
            const staff = staffData ? JSON.parse(staffData) : null
            const userId = staff?.userId || staff?.staffId || 1

            // Upload photos if any
            let photoUrls = []
            if (form.photoFiles.length > 0) {
                photoUrls = await uploadPhotos(form.photoFiles, userId)
            }

            // Prepare report payload
            const reportPayload = {
                userId: userId, // Staff creating the report
                itemName: form.name,
                type: form.type,
                category: form.category,
                location: form.location,
                dateOfEvent: form.date,
                description: form.description,
                uniqueDetail: form.uniqueDetail || '',
                photoUrl1: photoUrls[0] || null,
                photoUrl2: photoUrls[1] || null,
                photoUrl3: photoUrls[2] || null,
                submitterUserName: form.reporterName,
                reporterPhone: form.reporterPhone || '',
                reporterEmail: form.reporterEmail || '',
                status: form.status // 'approved' or 'pending'
            }

            // Submit report to backend
            const res = await fetch(`${API_BASE_REPORTS}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(reportPayload)
            })

            if (!res.ok) {
                throw new Error('Failed to create report')
            }

            const createdReport = await res.json()
            const newRow = toRow(createdReport)

            // Add to local state
            setReports((prev) => [newRow, ...prev])

            // Reset form and close modal
            setShowAdd(false)
            setForm({
                name: '', type: 'found', category: '', location: '', date: '',
                reporterName: '', reporterPhone: '', reporterEmail: '',
                description: '', uniqueDetail: '', status: 'approved',
                photos: [], photoFiles: []
            })

            alert('Report created successfully!')

        } catch (err) {
            console.error('Error creating report:', err)
            alert('Failed to create report. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // Navigate to claims page
    const handleViewClaims = () => {
        window.location.hash = '#/staff/claims'
    }

    return (
        <div className={styles['reports-page']}>
            {/* Navigation Bar */}
            <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                variant="private"
                onHamburgerClick={() => setSidebarOpen((p) => !p)}
            />

            {/* Staff Sidebar */}
            <StaffSidebar open={sidebarOpen}/>

            <div
                className={styles['reports-container']}
                style={{paddingLeft: sidebarOpen ? '270px' : '2rem'}}
            >

                {/* Header */}
                <div className={styles['reports-header']}>
                    <div className={styles['reports-title-group']}>
                        <h1 className={styles['reports-title']}>Reports Triage</h1>
                        <p className={styles['reports-subtitle']}>
                            Triaging pending reports and managing published items.
                        </p>
                    </div>

                    <div className={styles['controls']}>
                        {/* Search Box */}
                        <div className={styles['search-box']}>
                            <Search size={18}/>
                            <input
                                className={styles['search-input']}
                                placeholder="Search reports..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search reports"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className={styles['filter-box']}>
                            <Filter size={16}/>
                            <select
                                className={styles['filter-select']}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                aria-label="Filter by type"
                            >
                                <option value="All">All Types</option>
                                <option value="Lost">Lost Items</option>
                                <option value="Found">Found Items</option>
                            </select>
                        </div>

                        {/* Add Report Button */}
                        <button
                            className={styles['btn-add']}
                            onClick={() => setShowAdd(true)}
                            aria-label="Add report"
                        >
                            <Plus size={18}/> <span>Add Report</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles['reports-tabs']}>
                    <button
                        className={`${styles['reports-tab']} ${activeTab === 'pending' ? styles.active : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending
                        <span className={styles['tab-count']}>
              {reports.filter(r => r.status === 'Pending').length}
            </span>
                    </button>
                    <button
                        className={`${styles['reports-tab']} ${activeTab === 'approved' ? styles.active : ''}`}
                        onClick={() => setActiveTab('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`${styles['reports-tab']} ${activeTab === 'published' ? styles.active : ''}`}
                        onClick={() => setActiveTab('published')}
                    >
                        Published
                    </button>
                    <button
                        className={`${styles['reports-tab']} ${activeTab === 'rejected' ? styles.active : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Rejected
                    </button>
                    <button
                        className={`${styles['reports-tab']} ${activeTab === 'resolved' ? styles.active : ''}`}
                        onClick={() => setActiveTab('resolved')}
                    >
                        Resolved
                    </button>
                    <button
                        className={`${styles['reports-tab']} ${activeTab === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Records
                    </button>
                </div>

                {/* Table Content */}
                <div className={styles['reports-content']}>
                    {loading ? (
                        // Loading State
                        <div style={{textAlign: 'center', padding: '3rem', color: 'var(--gray-500)'}}>
                            <p>Loading reports...</p>
                        </div>
                    ) : error ? (
                        // Error State
                        <div style={{textAlign: 'center', padding: '3rem'}}>
                            <p style={{color: 'var(--red-500)', marginBottom: '1rem'}}>{error}</p>
                            <button
                                onClick={loadReports}
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
                        // Reports Table
                        <div className={styles['table-responsive']}>
                            <table className={styles['reports-table']}>
                                <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Reporter</th>
                                    <th>Status</th>
                                    <th>Potential Claims</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((r) => (
                                    <tr key={r.id}>
                                        {/* Item Details */}
                                        <td>
                                            <div className={styles['item-cell']}>
                                                <div className={styles['thumb']}>
                                                    {r.photos && r.photos.length > 0 ? (
                                                        <img
                                                            className={styles['thumb-image']}
                                                            src={r.photos[0]}
                                                            alt={r.name}
                                                        />
                                                    ) : (
                                                        <Image size={20}/>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={styles['item-name']}>{r.name}</div>
                                                    <div className={styles['item-category']}>{r.category}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type Badge */}
                                        <td style={{textTransform: 'capitalize'}}>
                        <span className={`${styles['type-badge']} ${styles[r.type]}`}>
                          {r.type}
                        </span>
                                        </td>

                                        {/* Date */}
                                        <td>{formatDateStr(r.date)}</td>

                                        {/* Location */}
                                        <td>{r.location}</td>

                                        {/* Reporter */}
                                        <td>{r.reporter}</td>

                                        {/* Status */}
                                        <td>
                        <span className={`${styles['status-pill']} ${styles[r.status.toLowerCase()]}`}>
                          {r.status}
                        </span>
                                        </td>

                                        {/* Claims Count (only for found items) */}
                                        <td>
                                            {r.type === 'found' ? (
                                                <span className={styles['claims-pill']}>
                            {r.status === 'Published' ? r.claimsCount : 0}
                          </span>
                                            ) : (
                                                <span className={styles['text-muted']}>—</span>
                                            )}
                                        </td>

                                        {/* Action Button */}
                                        <td>
                                            <button
                                                className={styles['action-btn']}
                                                onClick={() => {
                                                    setSelectedReport(r)
                                                    setCurrentImageIndex(0)
                                                }}
                                            >
                                                <Eye size={16}/> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className={styles['empty-cell']}>
                                            No reports found matching criteria.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* --- REVIEW MODAL (SLIDER + INFO) --- */}
                {selectedReport && (
                    <div
                        className={styles['modal-overlay']}
                        onClick={() => setSelectedReport(null)}
                    >
                        <div
                            className={styles['review-modal']}
                            onClick={e => e.stopPropagation()}
                        >

                            {/* Modal Header */}
                            <div className={styles['review-header']}>
                                <div>
                                    <h3 className={styles['review-title']}>{selectedReport.name}</h3>
                                    <div className={styles['review-meta']}>
                    <span className={`${styles['type-badge']} ${styles[selectedReport.type]}`}>
                      {selectedReport.type}
                    </span>
                                        <span className={styles['meta-dot']}>•</span>
                                        <span className={styles['meta-text']}>
                      Reported on {formatDateStr(selectedReport.date)}
                    </span>
                                    </div>
                                </div>
                                <button
                                    className={styles['modal-close']}
                                    onClick={() => setSelectedReport(null)}
                                    aria-label="Close modal"
                                >
                                    <X size={20}/>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className={styles['review-body']}>

                                {/* Image Slider / Gallery */}
                                <div className={styles['review-gallery']}>
                                    {selectedReport.photos && selectedReport.photos.length > 0 ? (
                                        <div className={styles['slider-container']}>
                                            <img
                                                src={selectedReport.photos[currentImageIndex]}
                                                alt="Report Item"
                                                className={styles['slider-image']}
                                            />

                                            {/* Slider Controls (if multiple photos) */}
                                            {selectedReport.photos.length > 1 && (
                                                <>
                                                    <button
                                                        className={`${styles['slider-btn']} ${styles['prev']}`}
                                                        onClick={handlePrevImage}
                                                        aria-label="Previous image"
                                                    >
                                                        <ChevronLeft size={20}/>
                                                    </button>
                                                    <button
                                                        className={`${styles['slider-btn']} ${styles['next']}`}
                                                        onClick={handleNextImage}
                                                        aria-label="Next image"
                                                    >
                                                        <ChevronRight size={20}/>
                                                    </button>

                                                    {/* Slider Dots */}
                                                    <div className={styles['slider-dots']}>
                                                        {selectedReport.photos.map((_, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`${styles['dot']} ${idx === currentImageIndex ? styles.active : ''}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        // No photos placeholder
                                        <div className={styles['no-image-placeholder']}>
                                            <Image size={48} strokeWidth={1}/>
                                            <p>No photos provided</p>
                                        </div>
                                    )}
                                </div>

                                {/* Report Information */}
                                <div className={styles['review-info']}>

                                    {/* Status Banner */}
                                    <div
                                        className={`${styles['info-banner']} ${styles[selectedReport.status.toLowerCase()]}`}>
                                        <span className={styles['banner-label']}>Current Status</span>
                                        <span className={styles['banner-value']}>{selectedReport.status}</span>
                                    </div>

                                    {/* Item Details */}
                                    <div className={styles['info-group']}>
                                        <h4 className={styles['info-heading']}>Item Details</h4>

                                        <div className={styles['info-row']}>
                                            <Tag size={16} className={styles['info-icon']}/>
                                            <div>
                                                <span className={styles['info-label']}>Category</span>
                                                <div className={styles['info-text']}>{selectedReport.category}</div>
                                            </div>
                                        </div>

                                        <div className={styles['info-row']}>
                                            <MapPin size={16} className={styles['info-icon']}/>
                                            <div>
                                                <span className={styles['info-label']}>Location</span>
                                                <div className={styles['info-text']}>{selectedReport.location}</div>
                                            </div>
                                        </div>

                                        <div className={styles['info-row']}>
                                            <Calendar size={16} className={styles['info-icon']}/>
                                            <div>
                                                <span className={styles['info-label']}>Date of Event</span>
                                                <div
                                                    className={styles['info-text']}>{formatDateStr(selectedReport.date)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reporter Information */}
                                    <div className={styles['info-group']}>
                                        <h4 className={styles['info-heading']}>Reporter</h4>

                                        <div className={styles['info-row']}>
                                            <User size={16} className={styles['info-icon']}/>
                                            <div>
                                                <span className={styles['info-label']}>Reported By</span>
                                                <div className={styles['info-text']}>{selectedReport.reporter}</div>
                                            </div>
                                        </div>

                                        <div className={styles['info-row']}>
                                            <Phone size={16} className={styles['info-icon']}/>
                                            <div>
                                                <span className={styles['info-label']}>Phone Number</span>
                                                <div className={styles['info-text']}>
                                                    {selectedReport.reporterPhone || 'Not provided'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles['info-row']}>
                                            <Mail size={16} className={styles['info-icon']}/>
                                            <div>
                                                <span className={styles['info-label']}>Email Address</span>
                                                <div className={styles['info-text']}>
                                                    {selectedReport.reporterEmail || 'Not provided'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className={styles['info-group']}>
                                        <h4 className={styles['info-heading']}>Description</h4>
                                        <div className={styles['desc-container']}>
                                            <p className={styles['desc-text']}>
                                                {selectedReport.description?.split('|')[0]?.trim() || 'No description provided'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Unique Detail - Second Part */}
                                    <div className={styles['info-group']}>
                                        <h4 className={styles['info-heading']}>
                                            Unique Identifying Detail
                                        </h4>
                                        <div className={styles['unique-detail-container']}>
                                            <div className={styles['unique-detail-text']}>
                                                {selectedReport.description?.split('|')[1]?.trim() || 'No unique detail provided'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer - Action Buttons */}
                            {/* Modal Footer - Action Buttons */}
                            <div className={styles['review-footer']}>
                                {/* Claims Info (for published found items) */}
                                {selectedReport.status === 'Published' && selectedReport.claimsCount > 0 ? (
                                    <div className={styles['footer-left']}>
      <span className={styles['claims-alert']}>
        {selectedReport.claimsCount} Potential Claim{selectedReport.claimsCount > 1 ? 's' : ''}
      </span>
                                        <button className={styles['btn-link']} onClick={handleViewClaims}>
                                            View Claims <ExternalLink size={14}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles['footer-left']}>
                                        <span className={styles['text-muted']}>No claims yet</span>
                                    </div>
                                )}

                                {/* Status Action Buttons */}
                                <div className={styles['footer-actions']}>
                                    {/* Pending Status Actions */}
                                    {selectedReport.status === 'Pending' && (
                                        <>
                                            <button
                                                className={styles['btn-text-danger']}
                                                onClick={() => applyStatus('rejected')}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                className={styles['btn-action-primary']}
                                                onClick={() => applyStatus('approved')}
                                            >
                                                Approve
                                            </button>
                                        </>
                                    )}

                                    {/* Approved Status Actions - WITH REJECT BUTTON ADDED */}
                                    {selectedReport.status === 'Approved' && (
                                        <>
                                            <button
                                                className={styles['btn-text-danger']}
                                                onClick={() => applyStatus('rejected')}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                className={styles['btn-action-primary']}
                                                onClick={() => applyStatus('published')}
                                            >
                                                Publish
                                            </button>
                                        </>
                                    )}

                                    {/* Published Status Actions */}
                                    {selectedReport.status === 'Published' && (
                                        <>
                                            <button
                                                className={styles['btn-outline']}
                                                onClick={() => applyStatus('approved')}
                                            >Unpublish
                                            </button>
                                            <button
                                                className={styles['btn-action-primary']}
                                                onClick={() => applyStatus('resolved')}
                                            >
                                                Mark Resolved
                                            </button>
                                        </>
                                    )}

                                    {/* Rejected Status Actions */}
                                    {selectedReport.status === 'Rejected' && (
                                        <button
                                            className={styles['btn-action-primary']}
                                            onClick={() => applyStatus('pending')}
                                        >
                                            Mark as Pending
                                        </button>
                                    )}

                                    {/* Resolved Status Actions */}
                                    {selectedReport.status === 'Resolved' && (
                                        <>
                                            <button
                                                className={styles['btn-outline']}
                                                onClick={() => applyStatus('approved')}
                                            >
                                                Reopen (Approved)
                                            </button>
                                            <button
                                                className={styles['btn-action-primary']}
                                                onClick={() => applyStatus('published')}
                                            >
                                                Publish
                                            </button>
                                        </>
                                    )}

                                    {/* Close Button (always visible) */}
                                    <button
                                        className={styles['btn-outline']}
                                        onClick={() => setSelectedReport(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* --- CREATE MANUAL REPORT MODAL --- */}
                {showAdd && (
                    <div className={styles['modal-overlay']}>
                        <div className={styles['modal']}>
                            {/* Modal Header */}
                            <div className={styles['modal-header']}>
                                <h3 className={styles['modal-title']}>Create Manual Report</h3>
                                <button
                                    className={styles['modal-close']}
                                    onClick={() => setShowAdd(false)}
                                    aria-label="Close modal"
                                >
                                    <X size={20}/>
                                </button>
                            </div>

                            {/* Modal Form Content */}
                            <form className={styles['modal-scroll-content']} onSubmit={handleCreateSubmit}>

                                {/* 1. Type Toggle (Lost/Found) */}
                                <div className={styles['toggle-container']}>
                                    <button
                                        type="button"
                                        className={`${styles['toggle-btn']} ${form.type === 'lost' ? styles.active : ''}`}
                                        onClick={() => setForm({...form, type: 'lost'})}
                                    >
                                        Lost Item
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles['toggle-btn']} ${form.type === 'found' ? styles.active : ''}`}
                                        onClick={() => setForm({...form, type: 'found'})}
                                    >
                                        Found Item
                                    </button>
                                </div>

                                {/* 2. Photo Upload Section */}
                                <div className={styles['photo-upload-container']}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }}>
                <span style={{fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray-500)'}}>
                  ITEM PHOTOS
                </span>
                                        <span style={{fontSize: '0.75rem', color: 'var(--gray-400)'}}>
                  {form.photos.length}/3
                </span>
                                    </div>

                                    <div className={styles['photo-grid']}>
                                        {/* Display uploaded photos */}
                                        {form.photos.map((src, idx) => (
                                            <div key={idx} className={styles['photo-slot']}>
                                                <img src={src} alt={`Upload ${idx}`}/>
                                                <button
                                                    type="button"
                                                    className={styles['photo-remove']}
                                                    onClick={() => removePhoto(idx)}
                                                    aria-label="Remove photo"
                                                >
                                                    <X size={12}/>
                                                </button>
                                            </div>
                                        ))}

                                        {/* Upload trigger (if slots remaining) */}
                                        {form.photos.length < 3 && (
                                            <label className={`${styles['photo-slot']} ${styles['upload-trigger']}`}>
                                                <Camera size={20}/>
                                                <span style={{fontSize: '0.7rem'}}>Add</span>
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handlePhotoUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Item Information */}
                                <div>
                                    <h4 className={styles['form-section-title']}>Item Information</h4>

                                    <div className={styles['form-row']}>
                                        <div className={styles['input-wrap']}>
                                            <label>Item Name *</label>
                                            <input
                                                className={styles['input']}
                                                placeholder="e.g. Black Wallet"
                                                value={form.name}
                                                onChange={e => setForm({...form, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className={styles['input-wrap']}>
                                            <label>Category *</label>
                                            <select
                                                className={styles['input']}
                                                value={form.category}
                                                onChange={e => setForm({...form, category: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles['form-row']} style={{marginTop: '1rem'}}>
                                        <div className={styles['input-wrap']}>
                                            <label>Location *</label>
                                            <input
                                                className={styles['input']}
                                                placeholder="Where was it seen?"
                                                value={form.location}
                                                onChange={e => setForm({...form, location: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className={styles['input-wrap']}>
                                            <label>Date *</label>
                                            <input
                                                type="date"
                                                className={styles['input']}
                                                value={form.date}
                                                onChange={e => setForm({...form, date: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Reporter Information */}
                                <div>
                                    <h4 className={styles['form-section-title']}>Reporter Information</h4>

                                    <div className={styles['form-row']}>
                                        <div className={styles['input-wrap']} style={{gridColumn: '1 / -1'}}>
                                            <label>Full Name *</label>
                                            <input
                                                className={styles['input']}
                                                placeholder="Walk-in Client Name"
                                                value={form.reporterName}
                                                onChange={e => setForm({...form, reporterName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className={styles['input-wrap']}>
                                            <label>Phone Number</label>
                                            <input
                                                className={styles['input']}
                                                type="tel"
                                                placeholder="09XX..."
                                                value={form.reporterPhone}
                                                onChange={e => setForm({...form, reporterPhone: e.target.value})}
                                            />
                                        </div>
                                        <div className={styles['input-wrap']}>
                                            <label>Email Address</label>
                                            <input
                                                className={styles['input']}
                                                type="email"
                                                placeholder="client@example.com"
                                                value={form.reporterEmail}
                                                onChange={e => setForm({...form, reporterEmail: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Description & Details */}
                                <div>
                                    <h4 className={styles['form-section-title']}>Details</h4>

                                    {/* Public Description */}
                                    <div className={styles['input-wrap']} style={{marginBottom: '1rem'}}>
                                        <label>Public Description *</label>
                                        <textarea
                                            className={styles['textarea']}
                                            placeholder="Visible to public. Describe the item: color, brand, size, condition, distinguishing marks..."
                                            value={form.description}
                                            onChange={e => setForm({...form, description: e.target.value})}
                                            rows={4}
                                        />
                                        <small className={styles['help-text']}>
                                            This description will be visible to all users on the public listings.
                                        </small>
                                    </div>

                                    {/* Hidden Unique Detail */}
                                    <div className={styles['input-wrap']}>
                                        <label style={{color: 'var(--amber-600)', fontWeight: '600'}}>
                                            <Camera size={14} style={{marginRight: '6px', verticalAlign: 'middle'}} />
                                            Unique Identifying Detail (Staff Only)
                                        </label>
                                        <textarea
                                            className={styles['textarea']}
                                            style={{
                                                borderColor: 'var(--amber-400)',
                                                backgroundColor: 'var(--amber-50)',
                                                fontFamily: 'monospace'
                                            }}
                                            placeholder="For verification purposes only. Example: 'Serial number: XYZ123', 'Hidden scratch on back', 'Inside pocket label reads...'"
                                            value={form.uniqueDetail}
                                            onChange={e => setForm({...form, uniqueDetail: e.target.value})}
                                            rows={3}
                                        />
                                        <small className={styles['help-text']} style={{color: 'var(--amber-600)'}}>
                                            Hidden from public view. Used to verify legitimate claims. Include specific, verifiable details.
                                        </small>
                                    </div>
                                </div>

                                {/* 6. Initial Status */}
                                <div className={styles['input-wrap']}>
                                    <label>Initial Status</label>
                                    <select
                                        className={styles['input']}
                                        value={form.status}
                                        onChange={e => setForm({...form, status: e.target.value})}
                                    >
                                        <option value="approved">Publish Immediately</option>
                                        <option value="pending">Save as Draft</option>
                                    </select>
                                </div>
                            </form>

                            {/* Modal Footer - Form Actions */}
                            <div className={styles['modal-footer']}>
                                <button
                                    type="button"
                                    className={styles['btn-outline']}
                                    onClick={() => setShowAdd(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={styles['btn-primary']}
                                    onClick={handleCreateSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}