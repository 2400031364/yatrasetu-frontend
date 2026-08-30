import React, { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateProfile, loading, error } = useAuth()
  const [form, setForm] = useState({ name: '', mobile: '', address: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', mobile: user.mobile || '', address: user.address || '' })
    }
  }, [user])

  if (!user) return <Navigate to="/login" replace />

  async function submit(e) {
    e.preventDefault()
    setSaved(false)
    const res = await updateProfile(form)
    if (res.ok) setSaved(true)
  }

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Account</span>
          <h1>My profile</h1>
        </div>

        <div className="profile-grid">
          <form className="card profile-card" onSubmit={submit}>
            <h3>Personal details</h3>
            {error && <p className="auth__error">{error}</p>}
            {saved && <p className="notice">Profile updated.</p>}

            <label>Full name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>Email
              <input value={user.email} disabled />
              <span className="field-hint">Email can't be changed — it's how you sign in.</span>
            </label>
            <label>Mobile number
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/[^\d+ ]/g, '') })}
                placeholder="+91 98765 43210"
              />
            </label>
            <label>Address
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, city, state, PIN"
              />
            </label>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <aside className="card profile-links">
            <h4>Quick links</h4>
            <Link to="/bookings" className="profile-links__item">🧾 My bookings</Link>
            <Link to="/itinerary" className="profile-links__item">🧭 My itinerary</Link>
            <Link to="/destinations" className="profile-links__item">🗺️ Explore destinations</Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
