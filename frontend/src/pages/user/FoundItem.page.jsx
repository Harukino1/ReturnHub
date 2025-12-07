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

  if (!item) return null

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

            <div className={styles['detail-row']}>
              <div className={styles['mini']}>Description</div>
              <div className={styles['value']} style={{ fontWeight: 500, fontSize: '1rem', lineHeight: '1.6' }}>
                {item.description}
              </div>
            </div>

            <div className={styles['detail-row']}>
              <div className={styles['mini']}>Found Location</div>
              <div className={styles['value']}>{item.location}</div>
            </div>

            <div className={styles['sub']}>
              Found since {item.foundSince || item.date}
            </div>

            <div className={styles['actions']}>
              <button
                className={styles['claim-btn']}
                onClick={() => {
                  try { sessionStorage.setItem('claimItem', JSON.stringify(item)) } catch { /* noop */ }
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