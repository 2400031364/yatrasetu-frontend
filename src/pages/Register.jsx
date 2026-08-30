import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HotelsAPI } from '../api/client'

export default function Register() {
  const { register, verifyOtp, requestOtp, loading, error } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', hotelId: '' })
  const [otp, setOtp] = useState('')
  const [info, setInfo] = useState('')
  const [hotels, setHotels] = useState([])

  useEffect(() => {
    if (form.role === 'HOTEL_MANAGER' && hotels.length === 0) {
      HotelsAPI.list().then((res) => setHotels(res.data || [])).catch(() => setHotels([]))
    }
  }, [form.role])

  async function submitForm(e) {
    e.preventDefault()
    setInfo('')
    const payload = form.role === 'HOTEL_MANAGER'
      ? { ...form, hotelId: Number(form.hotelId) }
      : { name: form.name, email: form.email, password: form.password }
    const res = await register(payload)
    if (res.ok) {
      setStep('otp')
      setInfo(res.message || `We sent a 6-digit code to ${form.email}. It's valid for 5 minutes.`)
    }
  }

  async function confirmCode(e) {
    e.preventDefault()
    const res = await verifyOtp(form.email, otp)
    if (res.ok) navigate(form.role === 'HOTEL_MANAGER' ? '/hotel-dashboard' : '/')
  }

  async function resend() {
    setInfo('')
    const res = await requestOtp(form.email)
    if (res.ok) setInfo(`We sent a new code to ${form.email}.`)
  }

  return (
    <div className="auth section">
      <div className="container auth__container">
        <form className="card auth__card" onSubmit={step === 'form' ? submitForm : confirmCode}>
          <span className="eyebrow">{step === 'form' ? 'Join in a minute' : 'Verify your email'}</span>
          <h1>{step === 'form' ? 'Create your account' : 'Enter your code'}</h1>

          {info && step === 'otp' && <p className="notice">{info}</p>}
          {error && <p className="auth__error">{error}</p>}

          {step === 'form' ? (
            <>
              <label>I am a
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value, hotelId: '' })}
                >
                  <option value="USER">Traveler, booking trips</option>
                  <option value="HOTEL_MANAGER">Hotel member, managing a property</option>
                </select>
              </label>

              <label>Full name
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ananya Rao" />
              </label>
              <label>Email
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </label>
              <label>Password
                <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
              </label>

              {form.role === 'HOTEL_MANAGER' && (
                <label>Your hotel
                  <select
                    required
                    value={form.hotelId}
                    onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
                  >
                    <option value="" disabled>Select the hotel you manage</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </label>
              )}

              <p className="muted" style={{ fontSize: 13.5 }}>
                We'll email you a 6-digit code to verify it's really you before your account is created.
              </p>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending code…' : 'Send verification code'}
              </button>
              <p className="auth__switch">Already have an account? <Link to="/login">Sign in</Link></p>
            </>
          ) : (
            <>
              <label>6-digit code
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  style={{ letterSpacing: '0.3em', fontSize: 20, textAlign: 'center' }}
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={loading || otp.length < 6} style={{ width: '100%' }}>
                {loading ? 'Verifying…' : 'Verify & create account'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => { setStep('form'); setOtp(''); setInfo('') }}
              >
                Edit details
              </button>
              <p className="auth__switch">
                Didn't get it? <button type="button" className="link-btn" onClick={resend}>Resend code</button>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
