import { Zap, Lock, MessageCircle, Heart, Smartphone, AlertCircle } from 'lucide-react'

const features = [
  {
    icon: <Zap size={28} color="#ffffff" />, title: 'Smart Matching', text: 'Our intelligent algorithm automatically matches lost and found items based on descriptions, photos, and location data.',
    bg: 'linear-gradient(to bottom right, #f59e0b, #f97316)', border: '#fcd34d'
  },
  {
    icon: <Lock size={28} color="#ffffff" />, title: 'Secure & Private', text: 'Your data is protected with military-grade encryption. Verification checklists ensure legitimate claims only.',
    bg: 'linear-gradient(to bottom right, #3b82f6, #06b6d4)', border: '#bfdbfe'
  },
  {
    icon: <MessageCircle size={28} color="#ffffff" />, title: 'Real-Time Updates', text: `Get instant notifications when your item is found or when there's a potential match. Stay in the loop always.`,
    bg: 'linear-gradient(to bottom right, #22c55e, #10b981)', border: '#bbf7d0'
  },
  {
    icon: <Heart size={28} color="#ffffff" />, title: 'Community Driven', text: `Join thousands helping each other. Every reunion matters. Together, we're making a difference.`,
    bg: 'linear-gradient(to bottom right, #a855f7, #ec4899)', border: '#e9d5ff'
  },
  {
    icon: <AlertCircle size={28} color="#ffffff" />, title: 'Fast Resolution', text: 'Streamlined claim process with staff verification ensures items are returned quickly and securely.',
    bg: 'linear-gradient(to bottom right, #ef4444, #f97316)', border: '#fecaca'
  },
  {
    icon: <Smartphone size={28} color="#ffffff" />, title: 'Mobile Friendly', text: 'Access ReturnHub anywhere, anytime. Our responsive design works seamlessly on all your devices.',
    bg: 'linear-gradient(to bottom right, #f59e0b, #d97706)', border: '#fde68a'
  },
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
            <div key={f.title} className="feature-card" style={{ borderColor: f.border }}>
              <div className="feature-icon" style={{ backgroundImage: f.bg }}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}