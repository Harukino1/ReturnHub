import { Plus, Search } from 'lucide-react'
import '../../styles/components/Hero.css'
import randomStuff from '../../assets/random-stuff.png'

export default function Hero({ onNavigate }) {
  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <div>
          <h1 className="hero-title">Lost <span className="accent">&</span> Found</h1>
          <p className="hero-text-xl">Find or report your lost items easily. Help others reunite with what they've lost through ReturnHub's intelligent matching system.</p>
          <p className="hero-text">Powered by smart technology, fast resolutions, and a caring community.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate && onNavigate('auth')}><Plus size={20} />Report Lost Item</button>
            <button className="btn btn-outline" onClick={() => onNavigate && onNavigate('auth')}><Search size={20} />Browse Found Items</button>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="illustration-box">
            <img className="hero-logo" src={randomStuff} alt="Assortment of recovered belongings" />
          </div>
        </div>
      </div>
    </section>
  )
}


