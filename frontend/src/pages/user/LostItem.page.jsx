import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import UserSidebar from '../../components/user/UserSidebar'
import styles from '../../styles/pages/user/LostItem.module.css'
import { ChevronLeft, ChevronRight, ArrowLeft, MessageSquare, Image as ImageIcon } from 'lucide-react'

export default function LostItemPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const [item] = useState(() => {
    try {
      const s = sessionStorage.getItem('lostItem')
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

  // Ensure there's at least one image/placeholder slot
  const images = item.images && item.images.length > 0 ? item.images : [null] 
  
  const goPrev = () => setActiveIndex((p) => (p - 1 + images.length) % images.length)
  const goNext = () => setActiveIndex((p) => (p + 1) % images.length)

  return (
    <div className={styles['lost-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} variant="private" onHamburgerClick={() => setSidebarOpen((p) => !p)} />
      <UserSidebar open={sidebarOpen} />

      <div className={styles['lost-container']} style={{ paddingLeft: sidebarOpen ? '270px' : '2rem' }}>
        
        {/* NEW HEADER LAYOUT */}
        <div className={styles['lost-header']}>
          <button 
            className={styles['back-btn']} 
            onClick={() => window.location.hash = '#/dashboard'} 
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles['lost-title']}>Lost Item Details</h1>
        </div>

        <div className={styles['lost-grid']}>
          
          {/* CAROUSEL */}
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

            {/* Navigation Buttons (Only if > 1 image) */}
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

          {/* DETAILS */}
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
              <div className={styles['mini']}>Last Seen Location</div>
              <div className={styles['value']}>{item.location}</div>
            </div>

            <div className={styles['sub']}>
              Reported on {item.lostSince || item.date}
            </div>

            <div className={styles['actions']}>
              <button 
                className={styles['message-btn']} 
                onClick={() => window.location.hash = '#/messages'}
              >
                <MessageSquare size={18} />
                Message ReturnHub
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}