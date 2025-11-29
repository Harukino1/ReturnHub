import { useEffect, useState } from 'react'
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import styles from '../../styles/pages/public/Auth.module.css'
import randomStuff from '../../assets/random-stuff.png'

const API_BASE_URL = 'http://localhost:8080/api/users'

export default function AuthPage({ authMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', fullName: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => { setIsLogin(authMode !== 'signup') }, [authMode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (submitError) setSubmitError('')
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone) => /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!isLogin) {
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Please enter your full name (at least 2 characters)'
      }
      
      if (!formData.phone || !validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits)'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    return newErrors
  }
  const handleSubmit = async (e) => {
    e?.preventDefault()
    setSubmitError('')
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      if (isLogin) {
        // Login
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        })

        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError)
          setSubmitError('Server error. Please try again later.')
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          setSubmitError(data.message || `Login failed (${response.status}). Please check your credentials.`)
          setIsLoading(false)
          return
        }

        if (data.success) {
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify({
            userId: data.userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            profileImage: data.profileImage
          }))
          
          // Redirect to dashboard
          window.location.hash = '#/dashboard'
        } else {
          setSubmitError(data.message || 'Login failed. Please try again.')
        }
      } else {
        // Signup
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
          }),
        })

        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError)
          setSubmitError('Server error. Please try again later.')
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          const errorMsg = data.message || `Registration failed (${response.status}). Please try again.`
          setSubmitError(errorMsg)
          setIsLoading(false)
          return
        }

        if (data.success) {
          // Clear form
          setFormData({ email: '', password: '', confirmPassword: '', fullName: '', phone: '' })
          setErrors({})
          setSubmitError('')
          
          // Show success message briefly, then redirect to login
          setSubmitError('')
          setTimeout(() => {
            window.location.hash = '#/auth/login'
          }, 500)
        } else {
          setSubmitError(data.message || 'Registration failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        setSubmitError('Cannot connect to server. Please make sure the backend is running on port 8080.')
      } else {
        setSubmitError('Network error. Please check your connection and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles['auth-page']}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <section className={styles['auth-section']}>
        <div className="container">
          <div className={styles['auth-grid']}>
            <div className={styles['auth-left']}>
              <div>
                <p className={styles['auth-desc']}>Find or report your lost items easily. Help others reunite with what they've lost.</p>
              </div>
              <div className={styles['auth-illustration']}>
                <img className={styles['auth-image']} src={randomStuff} alt="Assortment of recovered belongings" />
              </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                  <p>Secure & Private</p>
                  <p>Smart Matching</p>
                  <p>Mobile Friendly</p>
                </div>
              </div>

            <div className={styles['auth-right']}>
              <h2 className={styles['auth-title']}>{isLogin ? 'Welcome Back' : 'Join ReturnHub'}</h2>
              <p className={styles['auth-subtitle']}>{isLogin ? 'Sign in to your account to continue' : 'Create an account to get started'}</p>

              {submitError && (
                <div className={styles['auth-error-message']}>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="form-grid">
                {!isLogin && (
                  <>
                    <div>
                      <div className="input-wrap">
                        <User className="icon-left" size={20} />
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className={`input has-icon${errors.fullName ? ' error' : ''}`} />
                      </div>
                      {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                    </div>
                    <div>
                      <div className="input-wrap">
                        <Phone className="icon-left" size={20} />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className={`input has-icon${errors.phone ? ' error' : ''}`} />
                      </div>
                      {errors.phone && <p className="error-text">{errors.phone}</p>}
                    </div>
                  </>
                )}

                <div>
                  <div className="input-wrap">
                    <Mail className="icon-left" size={20} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={`input has-icon${errors.email ? ' error' : ''}`} />
                  </div>
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>

                <div>
                  <div className="input-wrap">
                    <Lock className="icon-left" size={20} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={`input has-icon${errors.password ? ' error' : ''}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="link" style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>

                {!isLogin && (
                  <div>
                    <div className="input-wrap">
                      <Lock className="icon-left" size={20} />
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={`input has-icon${errors.confirmPassword ? ' error' : ''}`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="link" style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                  </div>
                )}

                {isLogin && (
                  <div className="toggle">
                    <button type="button" className="link">Forgot Password?</button>
                  </div>
                )}

                <button 
                  onClick={handleSubmit} 
                  className="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className={styles.spinning} />
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="divider">
                  <div className="divider-line"></div>
                  <span className="divider-label">OR</span>
                </div>

                <button 
                  type="button" 
                  className="social-btn"
                  onClick={() => {
                    console.log('Google sign-in')
                    window.location.hash = '#/dashboard'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className={styles['auth-toggle']}>
                  {isLogin ? (
                    <>
                      Don't have an account?{' '}
                      <a className="link" href="#/auth/signup">Sign Up</a>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <a className="link" href="#/auth/login">Sign In</a>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}