import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookingsAPI } from '../api/client'

const STATUS_LABEL = {
  PENDING_PAYMENT: { label: 'Payment pending', tone: 'warn' },
  CONFIRMED: { label: 'Confirmed', tone: 'good' },
  CANCELLED: { label: 'Cancelled', tone: 'muted' },
}

export default function HotelDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'HOTEL_MANAGER') return
    BookingsAPI.forHotelManager()
      .then((res) => setBookings(res.data || []))
      .catch(() => setErrorMsg('Could not load bookings from the server — make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'HOTEL_MANAGER') return <Navigate to="/" replace />

  const activeCount = bookings.filter((b) => b.status !== 'CANCELLED').length

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">{user.hotelName || 'Your hotel'}</span>
          <h1>Guest bookings</h1>
          <p className="muted">Contact details for everyone who has booked your property, so you can reach out directly.</p>
        </div>

        {loading ? (
          <p className="muted">Loading bookings…</p>
        ) : errorMsg ? (
          <p className="notice notice--warn">{errorMsg}</p>
        ) : bookings.length === 0 ? (
          <div className="empty">
            <h3>No bookings yet</h3>
            <p>Once a traveler books this hotel, their details will show up here.</p>
          </div>
        ) : (
          <>
            <p className="muted" style={{ marginBottom: 16 }}>{activeCount} active booking{activeCount === 1 ? '' : 's'}</p>
            <div className="booking-list">
              {bookings.map((b) => {
                const status = STATUS_LABEL[b.status] || { label: b.status, tone: 'muted' }
                return (
                  <div className="card booking-card" key={b.id}>
                    <div className="booking-card__main">
                      <h3>{b.guestName}</h3>
                      <div className="booking-card__meta">
                        {b.checkIn && <span>📅 {b.checkIn} → {b.checkOut}</span>}
                        <span>👥 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                      </div>
                      <div className="booking-card__meta" style={{ marginTop: 6 }}>
                        {b.guestEmail && (
                          <a href={`mailto:${b.guestEmail}`} className="btn btn-outline btn-sm">✉️ {b.guestEmail}</a>
                        )}
                        {b.guestMobile && (
                          <a href={`tel:${b.guestMobile}`} className="btn btn-outline btn-sm">📞 {b.guestMobile}</a>
                        )}
                        {!b.guestMobile && (
                          <span className="muted" style={{ fontSize: 13 }}>No phone number on file</span>
                        )}
                      </div>
                    </div>
                    <div className="booking-card__side">
                      <span className={`status-pill status-pill--${status.tone}`}>{status.label}</span>
                      <strong className="booking-card__amount">₹{(b.totalAmount || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
