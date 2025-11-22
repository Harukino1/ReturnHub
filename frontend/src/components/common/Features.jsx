import { Zap, Lock, MessageCircle, Heart, Smartphone, AlertCircle } from 'lucide-react'
import '../../styles/components/Features.css'

const features = [
  { icon: <Zap size={28} color="#ffffff" />, title: 'Smart Matching', text: 'Our intelligent algorithm automatically matches lost and found items based on descriptions, photos, and location data.' },
  { icon: <Lock size={28} color="#ffffff" />, title: 'Secure & Private', text: 'Your data is protected with military-grade encryption. Verification checklists ensure legitimate claims only.' },
  { icon: <MessageCircle size={28} color="#ffffff" />, title: 'Real-Time Updates', text: `Get instant notifications when your item is found or when there's a potential match. Stay in the loop always.` },
  { icon: <Heart size={28} color="#ffffff" />, title: 'Community Driven', text: `Join thousands helping each other. Every reunion matters. Together, we're making a difference.` },
  { icon: <AlertCircle size={28} color="#ffffff" />, title: 'Fast Resolution', text: 'Streamlined claim process with staff verification ensures items are returned quickly and securely.' },
  { icon: <Smartphone size={28} color="#ffffff" />, title: 'Mobile Friendly', text: 'Access ReturnHub anywhere, anytime. Our responsive design works seamlessly on all your devices.' },
]

export default function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-title">
          <h2>Why Choose ReturnHub?</h2>
          <p>Smart technology meets human care for better lost and found management</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


