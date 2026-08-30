import React, { useEffect, useState } from 'react'
import { Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookingsAPI } from '../api/client'

const STATUS_LABEL = {
  PENDING_PAYMENT: { label: 'Payment pending', tone: 'warn' },
  CONFIRMED: { label: 'Confirmed', tone: 'good' },
  CANCELLED: { label: 'Cancelled', tone: 'muted' },
}

export default function Bookings() {
  const { user } = useAuth()
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!user) return
    BookingsAPI.mine()
      .then((res) => setBookings(res.data || []))
      .catch(() => setErrorMsg('Could not load bookings from the server — make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return <Navigate to="/login" replace />

  function cancel(id) {
    BookingsAPI.cancel(id)
      .then(() => setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))))
      .catch(() => setErrorMsg('Could not cancel that booking.'))
  }

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Your trips</span>
          <h1>My bookings</h1>
        </div>

        {location.state?.justPaid && (
          <p className="notice">Payment successful — your booking is confirmed. 🎉</p>
        )}

        {loading ? (
          <p className="muted">Loading your bookings…</p>
        ) : errorMsg ? (
          <p className="notice notice--warn">{errorMsg}</p>
        ) : bookings.length === 0 ? (
          <div className="empty">
            <h3>No bookings yet</h3>
            <p>Once you book a stay, it'll show up here with its payment status.</p>
            <Link to="/hotels" className="btn btn-primary" style={{ marginTop: 16 }}>Browse stays</Link>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((b) => {
              const status = STATUS_LABEL[b.status] || { label: b.status, tone: 'muted' }
              return (
                <div className="card booking-card" key={b.id}>
                  <div className="booking-card__main">
                    <h3>{b.hotelName || b.destinationName || 'Trip'}</h3>
                    <p className="muted">{b.destinationName && b.hotelName ? b.destinationName : ''}</p>
                    <div className="booking-card__meta">
                      {b.checkIn && <span>📅 {b.checkIn} → {b.checkOut}</span>}
                      <span>👥 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                      {b.paymentMethod && <span>💳 {b.paymentMethod}</span>}
                    </div>
                  </div>
                  <div className="booking-card__side">
                    <span className={`status-pill status-pill--${status.tone}`}>{status.label}</span>
                    <strong className="booking-card__amount">₹{(b.totalAmount || 0).toLocaleString()}</strong>
                    {b.status === 'PENDING_PAYMENT' && (
                      <Link
                        to="/payment"
                        state={{ bookingId: b.id, amount: b.totalAmount, title: b.hotelName || b.destinationName }}
                        className="btn btn-primary btn-sm"
                      >
                        Pay now
                      </Link>
                    )}
                    {b.status !== 'CANCELLED' && (
                      <button className="btn btn-outline btn-sm" onClick={() => cancel(b.id)}>Cancel</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
