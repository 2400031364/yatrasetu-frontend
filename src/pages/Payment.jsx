import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookingsAPI } from '../api/client'

const METHODS = [
  { key: 'UPI', label: 'UPI', hint: 'Pay via any UPI app', icon: '📱' },
  { key: 'CARD', label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay', icon: '💳' },
  { key: 'NETBANKING', label: 'Net Banking', hint: 'All major Indian banks', icon: '🏦' },
  { key: 'WALLET', label: 'Wallet', hint: 'Paytm, PhonePe, Amazon Pay', icon: '👛' },
  { key: 'PAY_AT_HOTEL', label: 'Pay at hotel', hint: 'Reserve now, settle at check-in', icon: '🏨' },
]

export default function Payment() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}

  const [method, setMethod] = useState('UPI')
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!user) return <Navigate to="/login" replace />
  if (!state.amount && !state.bookingId) return <Navigate to="/hotels" replace />

  const amount = state.amount || 0
  const taxes = Math.round(amount * 0.05)
  const total = amount + taxes

  async function confirmPayment() {
    setProcessing(true)
    setErrorMsg('')
    try {
      let bookingId = state.bookingId
      if (!bookingId) {
        const { data: booking } = await BookingsAPI.create({
          hotelId: state.hotelId,
          destinationId: state.destinationId,
          checkIn: state.checkIn,
          checkOut: state.checkOut,
          guests: state.guests || 1,
          totalAmount: total,
        })
        bookingId = booking.id
      }
      await BookingsAPI.pay(bookingId, method)
      navigate('/bookings', { state: { justPaid: true } })
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Payment could not be completed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Last step</span>
          <h1>Choose how to pay</h1>
        </div>

        <div className="payment-grid">
          <div className="card payment-methods">
            {errorMsg && <p className="auth__error">{errorMsg}</p>}
            {METHODS.map((m) => (
              <label key={m.key} className={`method-option ${method === m.key ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="method"
                  value={m.key}
                  checked={method === m.key}
                  onChange={() => setMethod(m.key)}
                />
                <span className="method-option__icon">{m.icon}</span>
                <span>
                  <strong>{m.label}</strong>
                  <span className="method-option__hint">{m.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <aside className="card payment-summary">
            <h4>{state.title || 'Trip summary'}</h4>
            <dl>
              <dt>Amount</dt><dd>₹{amount.toLocaleString()}</dd>
              <dt>Taxes & fees</dt><dd>₹{taxes.toLocaleString()}</dd>
              <dt className="payment-summary__total-label">Total</dt>
              <dd className="payment-summary__total-value">₹{total.toLocaleString()}</dd>
            </dl>
            <p className="field-hint" style={{ marginBottom: 14 }}>
              The price shown is exactly what you'll be charged — no surprise fees at checkout.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={confirmPayment} disabled={processing}>
              {processing ? 'Processing…' : `Pay ₹${total.toLocaleString()}`}
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}
