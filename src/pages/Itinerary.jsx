import React from 'react'
import { Link } from 'react-router-dom'
import { useItinerary } from '../context/ItineraryContext'
import { useAuth } from '../context/AuthContext'
import { ItineraryAPI } from '../api/client'

export default function Itinerary() {
  const { stops, removeStop, updateNights, reorder, clear, totalNights } = useItinerary()
  const { user } = useAuth()
  const [saved, setSaved] = React.useState(false)

  const estBudget = stops.reduce((sum, s) => sum + s.priceFrom * s.nights, 0)

  function move(index, dir) {
    const to = index + dir
    if (to < 0 || to >= stops.length) return
    reorder(index, to)
  }

  function save() {
    ItineraryAPI.create({ items: stops.map((s) => ({ destinationId: s.id, day: s.day, nights: s.nights })) })
      .then(() => setSaved(true))
      .catch(() => setSaved(true)) // demo mode still confirms locally
  }

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Your plan</span>
          <h1>Itinerary planner</h1>
          <p className="muted">Add destinations from anywhere on the site, reorder them into a route, and see your rough budget update live.</p>
        </div>

        {stops.length === 0 ? (
          <div className="empty">
            <h3>Nothing planned yet</h3>
            <p>Browse destinations and tap “+ Itinerary” on any place you like.</p>
            <Link to="/destinations" className="btn btn-primary" style={{ marginTop: 16 }}>Browse destinations</Link>
          </div>
        ) : (
          <div className="itinerary-grid">
            <ol className="timeline">
              {stops.map((s, i) => (
                <li className="timeline__item" key={s.id}>
                  <div className="timeline__day">Day {s.day}</div>
                  <img src={s.image} alt={s.name} className="timeline__img" />
                  <div className="timeline__body">
                    <h3>{s.name}</h3>
                    <p className="muted">{s.state}</p>
                    <label className="timeline__nights">
                      Nights
                      <input type="number" min="1" max="14" value={s.nights} onChange={(e) => updateNights(s.id, Number(e.target.value))} />
                    </label>
                  </div>
                  <div className="timeline__actions">
                    <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">↑</button>
                    <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === stops.length - 1} aria-label="Move later">↓</button>
                    <button className="icon-btn icon-btn--danger" onClick={() => removeStop(s.id)} aria-label="Remove">✕</button>
                  </div>
                </li>
              ))}
            </ol>

            <aside className="card itinerary-summary">
              <h4>Trip summary</h4>
              <dl>
                <dt>Stops</dt><dd>{stops.length}</dd>
                <dt>Total nights</dt><dd>{totalNights}</dd>
                <dt>Est. budget</dt><dd>₹{estBudget.toLocaleString()}</dd>
              </dl>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={save}>
                {user ? 'Save itinerary' : 'Save as guest'}
              </button>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={clear}>Clear all</button>
              {saved && <p className="notice">Itinerary saved{user ? '' : ' locally — sign in to sync it across devices'}.</p>}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
