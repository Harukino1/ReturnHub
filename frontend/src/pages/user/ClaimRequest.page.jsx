import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/ClaimRequest.module.css'
import { Image, Upload, ArrowLeft, X } from 'lucide-react'

// API Base URLs
const API_BASE_URL = 'http://localhost:8080'
const API_CLAIMS = `${API_BASE_URL}/api/claims`
const API_UPLOAD = `${API_BASE_URL}/api/uploads`

export default function ClaimRequestPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [note, setNote] = useState('')
    const [uniqueDetail, setUniqueDetail] = useState('')
    const [photos, setPhotos] = useState([])
    const [photoFiles, setPhotoFiles] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // User details from localStorage
    const [user, setUser] = useState(null)
    const [details, setDetails] = useState({
        name: 'Your Name',
        email: 'you@example.com',
        phone: ''
    })

    // Load user info with better validation
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user')
            console.log('Raw user string from localStorage:', userStr)

            if (!userStr) {
                setError('Not logged in. Please login first.')
                return
            }

            const userData = JSON.parse(userStr)
            console.log('Parsed user data:', userData)

            // Extract userId - try multiple possible field names
            const userId = userData.userId || userData.id || userData.user_id

            if (!userId || userId === 0) {
                console.error('Invalid user ID:', userId)
                setError('Invalid user session. Please logout and login again.')
                return
            }

            // Create user object with guaranteed userId
            const validUser = {
                ...userData,
                userId: userId
            }

            console.log('Valid user object:', validUser)
            setUser(validUser)

            setDetails({
                name: userData.name || 'Your Name',
                email: userData.email || 'you@example.com',
                phone: userData.phone || ''
            })
        } catch (err) {
            console.error('Error loading user data:', err)
            setError('Failed to load user session. Please login again.')
        }
    }, [])

    // Apply theme
    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    // Get selected item from sessionStorage
    const [selectedItem, setSelectedItem] = useState(null)

    useEffect(() => {
        try {
            const claimItemStr = sessionStorage.getItem('claimItem')
            const foundItemStr = sessionStorage.getItem('foundItem')

            let item = null

            if (claimItemStr) {
                item = JSON.parse(claimItemStr)
            } else if (foundItemStr) {
                item = JSON.parse(foundItemStr)
            }

            console.log('Selected item from storage:', item)

            if (item) {
                setSelectedItem(item)
            } else {
                setError('No item selected for claim. Please select an item from the dashboard.')
            }
        } catch (err) {
            console.error('Error loading selected item:', err)
            setError('Failed to load item details.')
        }
    }, [])

    // Handle file input change
    const handleFileInput = (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        const remainingSlots = 4 - photos.length
        if (remainingSlots <= 0) return

        const filesToAdd = files.slice(0, remainingSlots)

        const newPhotos = filesToAdd.map((file, idx) => ({
            id: Date.now() + idx,
            url: URL.createObjectURL(file),
            file: file
        }))

        setPhotos(prev => [...prev, ...newPhotos])
        setPhotoFiles(prev => [...prev, ...filesToAdd])
    }

    // Add photo slot
    const addPhoto = () => {
        if (photos.length >= 4) return

        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.multiple = true
        input.onchange = handleFileInput
        input.click()
    }

    // Remove photo
    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
        setPhotoFiles(prev => prev.filter((_, i) => i !== index))
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
                const res = await fetch(`${API_UPLOAD}/report-photo`, {
                    method: 'POST',
                    body: formData
                })

                const data = await res.json()

                if (data.success && data.url) {
                    uploadedUrls.push(data.url)
                }
            } catch (err) {
                console.error('Error uploading photo:', err)
            }
        }

        return uploadedUrls
    }

    // Submit claim
    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')

        console.log('=== CLAIM SUBMISSION DEBUG ===')

        // Validate user
        if (!user) {
            setError('User session not loaded. Please refresh and try again.')
            return
        }

        const userId = user.userId || user.id
        console.log('User ID:', userId, 'Type:', typeof userId)

        if (!userId || userId === 0) {
            console.error('Invalid user ID:', userId)
            console.error('User object:', user)
            setError('Invalid user session. Please logout and login again.')
            return
        }

        // Validate item
        if (!selectedItem) {
            setError('No item selected for claim.')
            return
        }

        const itemId = selectedItem.id ||
            selectedItem.itemId ||
            selectedItem.foundItemId

        console.log('Item ID:', itemId, 'Type:', typeof itemId)

        if (!itemId || itemId === 0) {
            console.error('Invalid item ID:', itemId)
            console.error('Item object:', selectedItem)
            setError('Invalid item. Please go back and select the item again.')
            return
        }

        // Validate unique detail
        if (!uniqueDetail.trim()) {
            setError('Please provide a unique identifying detail.')
            return
        }

        setSubmitting(true)

        try {
            // Upload proof photos if any
            let proofPhotoUrl = null
            if (photoFiles.length > 0) {
                console.log('Uploading photos...')
                const uploadedUrls = await uploadPhotos(photoFiles, userId)
                proofPhotoUrl = uploadedUrls[0] || null
                console.log('Uploaded photo URL:', proofPhotoUrl)
            }

            // Prepare claim payload - MATCHING YOUR BACKEND DTO EXACTLY
            const claimPayload = {
                claimantUserId: parseInt(userId),  // Changed from userId to claimantUserId
                foundItemId: parseInt(itemId),
                lostItemId: null,  // Set to null if claiming found item
                proofDocumentUrl: proofPhotoUrl || '',
                claimantNote: note.trim() || '',
                uniqueDetail: uniqueDetail.trim()
            }

            console.log('Claim Payload:', JSON.stringify(claimPayload, null, 2))

            // Submit claim
            const res = await fetch(`${API_CLAIMS}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(claimPayload)
            })

            console.log('Response status:', res.status)

            const responseData = await res.json()
            console.log('Response data:', responseData)

            if (!res.ok) {
                throw new Error(responseData.message || 'Failed to submit claim')
            }

            // Success
            sessionStorage.removeItem('claimItem')
            sessionStorage.removeItem('foundItem')

            alert('Claim submitted successfully! Staff will review your request.')
            window.location.hash = '#/reports'

        } catch (err) {
            console.error('Error submitting claim:', err)
            setError(err.message || 'Failed to submit claim. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // Handle back navigation
    const handleBack = () => {
        sessionStorage.removeItem('claimItem')
        sessionStorage.removeItem('foundItem')
        window.location.hash = '#/dashboard'
    }

    return (
        <div className={styles['claim-page']}>
            <Navbar
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                variant="private"
                onHamburgerClick={() => setSidebarOpen(p => !p)}
            />

            <UserSidebar open={sidebarOpen} />

            <div
                className={styles['claim-container']}
                style={{ paddingLeft: sidebarOpen ? '250px' : '2rem' }}
            >
                <header className={styles['claim-header']}>
                    <div className={styles['header-left']}>
                        <button
                            type="button"
                            className={styles['back-btn']}
                            onClick={handleBack}
                            aria-label="Go back"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className={styles['title']}>Claim Request</h1>
                            <p className={styles['subtitle']}>Proof-of-ownership</p>
                        </div>
                    </div>
                    {selectedItem && (
                        <div className={styles['selected']}>
                            Item: <strong>{selectedItem.title || selectedItem.name || 'Unknown'}</strong>
                        </div>
                    )}
                </header>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #ef4444',
                        color: '#dc2626',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        {error}
                    </div>
                )}

                <div className={styles['grid']}>
                    <section className={styles['left']}>
                        <div className={styles['upload-bar']}>
                            <button
                                className={styles['upload-btn']}
                                type="button"
                                onClick={addPhoto}
                                disabled={photos.length >= 4 || submitting}
                            >
                                <Upload size={16} /> Upload Photo
                            </button>
                            <span className={styles['upload-count']}>{photos.length}/4</span>
                        </div>

                        <div className={styles['photo-grid']}>
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className={styles['photo-slot']}>
                                    {photos[i]?.url ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <img
                                                src={photos[i].url}
                                                alt={`Proof ${i + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: 'rgba(0, 0, 0, 0.6)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <Image size={20} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '1rem' }}>
                            Upload photos that prove ownership (receipts, serial numbers, etc.)
                        </p>
                    </section>

                    <section className={styles['right']}>
                        <form onSubmit={onSubmit} className={styles['form']}>
                            <div className={styles['group']}>
                                <label className={styles['label']}>Note (Optional)</label>
                                <textarea
                                    className={styles['input']}
                                    placeholder="Explain why this item belongs to you."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    disabled={submitting}
                                />
                            </div>

                            <div className={styles['group']}>
                                <label className={styles['label']}>Unique Identifying Detail *</label>
                                <input
                                    className={styles['input']}
                                    placeholder="Enter Your Detail"
                                    value={uniqueDetail}
                                    onChange={(e) => setUniqueDetail(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                                <div className={styles['helper']}>
                                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Examples:</p>
                                    <ul>
                                        <li>Marks, scratches, engravings</li>
                                        <li>Serial number or partial serial</li>
                                        <li>Sticker placement or add-ons</li>
                                        <li>Hidden compartments or color variations</li>
                                        <li>Specific defect like "zipper broken on left"</li>
                                    </ul>
                                </div>
                            </div>

                            <div className={styles['details']}>
                                <div className={styles['details-head']}>
                                    <span>Your Details</span>
                                    <button
                                        type="button"
                                        className={styles['edit']}
                                        onClick={() => {
                                            sessionStorage.setItem('profileEditing', 'true')
                                            window.location.hash = '#/profile'
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className={styles['details-grid']}>
                                    <div>
                                        <label className={styles['mini-label']}>Full Name</label>
                                        <div className={styles['text']}>{details.name}</div>
                                    </div>
                                    <div>
                                        <label className={styles['mini-label']}>Email Address</label>
                                        <div className={styles['text']}>{details.email}</div>
                                    </div>
                                    <div>
                                        <label className={styles['mini-label']}>Phone number</label>
                                        <div className={styles['text']}>{details.phone || '—'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles['actions']}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ padding: '.9rem 1.8rem' }}
                                    disabled={submitting || !user || !selectedItem || !uniqueDetail.trim()}
                                >
                                    {submitting ? 'SUBMITTING...' : 'SUBMIT CLAIM'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    )
}