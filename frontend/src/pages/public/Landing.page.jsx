import { useState } from 'react'
import Navbar from '../../components/layout/Navbar'
import Hero from '../../components/common/Hero'
import About from '../../components/common/About'
import Features from '../../components/common/Features'
import CTA from '../../components/common/CTA'
import Footer from '../../components/layout/Footer'
import styles from '../../styles/pages/public/Landing.module.css'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className={styles['landing-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero onNavigate={(t)=>window.location.hash=t==='auth'?'#/auth/login':`#${t}`} />
      <About />
      <Features />
      <CTA onNavigate={(t)=>window.location.hash=t==='auth'?'#/auth/login':`#${t}`} />
      <Footer />
    </div>
  )
}