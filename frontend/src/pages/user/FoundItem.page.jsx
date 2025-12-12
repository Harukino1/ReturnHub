import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/FoundItem.module.css'
import { ChevronLeft, ChevronRight, ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function FoundItemPage() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)

    const [item] = useState(() => {
        try {
            const s = sessionStorage.getItem('foundItem')
            return s ? JSON.parse(s) : null
        } catch {
            return null
        }
    })

    useEffect(() => {
        const t = localStorage.getItem('theme') || 'light'
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    useEffect(() => {
        if (!item) window.location.hash = '#/dashboard'
    }, [item])

    // Enhanced splitting function that handles pipe character
    const splitDescription = (description) => {
        if (!description) return { main: '', unique: '' };

        const desc = description.trim();

        if (desc.includes('|')) {
            const parts = desc.split('|').map(part => part.trim());

            if (parts.length === 2) {
                return {
                    main: parts[0],
                    unique: parts[1]
                };
            }
            else if (parts.length > 2) {
                return {
                    main: parts[0],
                    unique: parts.slice(1).join(', ')
                };
            }
        }

        if (desc.includes(' - ')) {
            const parts = desc.split(' - ').map(part => part.trim());
            if (parts.length === 2) {
                return {
                    main: parts[0],
                    unique: parts[1]
                };
            }
        }

        if (desc.includes(':')) {
            const colonIndex = desc.indexOf(':');
            const beforeColon = desc.substring(0, colonIndex).trim();
            const afterColon = desc.substring(colonIndex + 1).trim();

            if (beforeColon.length < 30) {
                return {
                    main: beforeColon,
                    unique: afterColon
                };
            }
        }
        const separatorPatterns = [
            { pattern: /unique details?:/i, name: 'Unique Details:' },
            { pattern: /special features?:/i, name: 'Special Features:' },
            { pattern: /additional notes?:/i, name: 'Additional Notes:' },
            { pattern: /distinguishing marks?:/i, name: 'Distinguishing Marks:' }
        ];

        for (const sep of separatorPatterns) {
            const match = desc.match(sep.pattern);
            if (match) {
                const separator = match[0];
                const index = desc.toLowerCase().indexOf(separator.toLowerCase());
                return {
                    main: desc.substring(0, index).trim(),
                    unique: desc.substring(index + separator.length).trim()
                };
            }
        }

        if (desc.length <= 80) {
            return {
                main: desc,
                unique: 'No additional unique details provided.'
            };
        }

        const sentences = desc.match(/[^.!?]+[.!?]+/g) || [desc];

        if (sentences.length <= 2) {
            return {
                main: desc,
                unique: 'No additional unique details provided.'
            };
        }

        const splitPoint = Math.ceil(sentences.length * 0.6);
        const mainSentences = sentences.slice(0, splitPoint);
        const uniqueSentences = sentences.slice(splitPoint);

        return {
            main: mainSentences.join(' '),
            unique: uniqueSentences.join(' ')
        };
    };

    if (!item) return null

    const descriptionParts = splitDescription(item.description);

    // Ensure there's at least one image/placeholder slot
    const images = item.images && item.images.length > 0 ? item.images : [null]

    const goPrev = () => setActiveIndex((p) => (p - 1 + images.length) % images.length)
    const goNext = () => setActiveIndex((p) => (p + 1) % images.length)

    return (
        <div className={styles['found-page']}>
            <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
            <UserSidebar open={sidebarOpen} />

            <div className={styles['found-container']} style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}>

                {/* Header Layout */}
                <div className={styles['found-header']}>
                    <button
                        className={styles['back-btn']}
                        onClick={() => window.location.hash = '#/dashboard'}
                        aria-label="Back to dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className={styles['found-title']}>Found Item Details</h1>
                </div>

                <div className={styles['found-grid']}>

                    {/* Carousel */}
                    <div className={styles['carousel']}>
                        <div className={styles['carousel-top']}>
                            {activeIndex + 1} / {images.length}
                        </div>

                        <div className={styles['carousel-body']}>
                            {images[activeIndex] ? (
                                <img className={styles['carousel-image']} src={images[activeIndex]} alt={item.title} />
                            ) : (
                                <div className={styles['carousel-placeholder']}>
                                    <div style={{ textAlign: 'center' }}>
                                        <ImageIcon size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                        <p>No image provided</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <>
                                <button className={`${styles['carousel-nav']} ${styles['prev']}`} onClick={goPrev} aria-label="Previous">
                                    <ChevronLeft size={24} />
                                </button>
                                <button className={`${styles['carousel-nav']} ${styles['next']}`} onClick={goNext} aria-label="Next">
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Details */}
                    <div className={styles['details']}>
                        <div className={styles['detail-row']}>
                            <div className={styles['mini']}>Item Name</div>
                            <div className={styles['value']}>{item.title}</div>
                        </div>

                        <div className={styles['detail-row']}>
                            <div className={styles['mini']}>Category</div>
                            <div className={styles['value']}>{item.category || 'General'}</div>
                        </div>

                        {/* Main Description */}
                        <div className={styles['detail-row']}>
                            <div className={styles['mini']}>Description</div>
                            <div className={styles['value']} style={{
                                fontWeight: 500,
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                wordBreak: 'break-word'
                            }}>
                                {descriptionParts.main || 'No description provided'}
                            </div>
                        </div>

                        {/* Unique Details - Only show if we have something meaningful */}
                        {descriptionParts.unique && descriptionParts.unique !== 'No additional unique details provided.' && (
                            <div className={styles['detail-row']}>
                                <div className={styles['mini']}>Unique Details</div>
                                <div className={styles['value']} style={{
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    wordBreak: 'break-word'
                                }}>
                                    {descriptionParts.unique}
                                </div>
                            </div>
                        )}

                        <div className={styles['detail-row']}>
                            <div className={styles['mini']}>Found Location</div>
                            <div className={styles['value']}>{item.location || 'Not specified'}</div>
                        </div>

                        <div className={styles['sub']}>
                            Found since {item.foundSince || item.date || 'Unknown date'}
                        </div>

                        <div className={styles['actions']}>
                            <button
                                className={styles['claim-btn']}
                                onClick={() => {
                                    try {
                                        // Pass item type to claim request page
                                        const claimItem = {
                                            ...item,
                                            itemType: 'found'
                                        };
                                        sessionStorage.setItem('claimItem', JSON.stringify(claimItem))
                                    } catch { /* noop */ }
                                    window.location.hash = '#/claim-request'
                                }}
                            >
                                Claim This Item
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}