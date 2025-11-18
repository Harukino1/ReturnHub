import { useState } from 'react'
import Navbar from '../shared/Navbar'
import Hero from '../sections/Hero'
import Features from '../sections/Features'
import CTA from '../sections/CTA'
import Footer from '../shared/Footer'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}