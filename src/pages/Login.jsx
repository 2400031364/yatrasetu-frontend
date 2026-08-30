import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { requestOtp, verifyOtp, loading, error } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [info, setInfo] = useState('')

  async function sendCode(e) {
    e.preventDefault()
    setInfo('')
    const res = await requestOtp(email)
    if (res.ok) {
      setStep('otp')
      setInfo(`We sent a 6-digit code to ${email}. It's valid for 5 minutes.`)
    }
  }

  async function confirmCode(e) {
    e.preventDefault()
    const res = await verifyOtp(email, otp)
    if (res.ok) navigate('/')
  }

  return (
    <div className="auth section">
      <div className="container auth__container">
        <form className="card auth__card" onSubmit={step === 'email' ? sendCode : confirmCode}>
          <span className="eyebrow">{step === 'email' ? 'Welcome back' : 'Check your email'}</span>
          <h1>{step === 'email' ? 'Sign in' : 'Enter your code'}</h1>

          {info && step === 'otp' && <p className="notice">{info}</p>}
          {error && <p className="auth__error">{error}</p>}

          {step === 'email' ? (
            <>
              <label>Email
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <p className="muted" style={{ fontSize: 13.5 }}>
                We'll email you a one-time 6-digit code instead of a password.
              </p>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending code…' : 'Send code'}
              </button>
              <p className="auth__switch">New here? <Link to="/register">Create an account</Link></p>
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
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => { setStep('email'); setOtp(''); setInfo('') }}
              >
                Use a different email
              </button>
              <p className="auth__switch">
                Didn't get it? <button type="button" className="link-btn" onClick={sendCode}>Resend code</button>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
