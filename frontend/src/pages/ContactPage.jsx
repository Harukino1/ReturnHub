import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }
  const onSubmit = (e) => {
    e.preventDefault()
    const n = {}
    if (!form.name.trim()) n.name = 'Please enter your name'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) n.email = 'Please enter a valid email'
    if (!form.message.trim()) n.message = 'Please enter your message'
    if (Object.keys(n).length) { setErrors(n); return }
    console.log('Contact', form)
  }

  return (
    <div className="page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <section className="contact">
        <div className="container">
          <div className="contact-grid">
            <div>
              <h2 className="contact-title">Contact Us</h2>
              <p className="contact-subtitle">Have questions or need help? Send us a message and we’ll get back to you.</p>
              <form className="contact-form" onSubmit={onSubmit}>
                <div>
                  <input name="name" value={form.name} onChange={onChange} placeholder="Your Name" className={`input${errors.name ? ' error' : ''}`} />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>
                <div>
                  <input name="email" value={form.email} onChange={onChange} placeholder="you@example.com" className={`input${errors.email ? ' error' : ''}`} />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
                <div>
                  <textarea name="message" value={form.message} onChange={onChange} placeholder="How can we help?" className={`textarea${errors.message ? ' error' : ''}`}></textarea>
                  {errors.message && <p className="error-text">{errors.message}</p>}
                </div>
                <button className="submit" type="submit">Send Message</button>
              </form>
            </div>
            <div>
              <div className="contact-card">
                <h3>Support</h3>
                <p>Email: support@returnhub.example</p>
                <p>Hours: Mon–Fri, 9am–5pm</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}