import '../../styles/components/About.css'
import randomStuff from '../../assets/random-stuff.png'

export default function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-grid">
          <div>
            <h2 className="about-title">About ReturnHub</h2>
            <p className="about-text">ReturnHub helps people find and reclaim lost items using smart matching, secure verification, and a caring community.</p>
            <p className="about-text">We streamline reporting and discovery with an intuitive experience that works beautifully on any device.</p>
          </div>
          <div>
            <div className="about-illustration">
              <img className="about-image" src={randomStuff} alt="Assortment of recovered belongings" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


