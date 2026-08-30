import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import HotelCard from '../components/HotelCard'
import { DestinationsAPI, HotelsAPI, ReviewsAPI } from '../api/client'
import { DESTINATIONS, HOTELS, REVIEWS } from '../data/mockData'
import { useItinerary } from '../context/ItineraryContext'
import { useAuth } from '../context/AuthContext'

export default function DestinationDetail() {
  const { id } = useParams()
  const destId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { stops, addStop } = useItinerary()

  const [dest, setDest] = useState(() => DESTINATIONS.find((d) => d.id === destId))
  const [hotels, setHotels] = useState(() => HOTELS.filter((h) => h.destinationId === destId))
  const [reviews, setReviews] = useState(() => REVIEWS.filter((r) => r.destinationId === destId))
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  useEffect(() => {
    DestinationsAPI.get(destId).then((res) => res.data && setDest(res.data)).catch(() => {})
    HotelsAPI.byDestination(destId).then((res) => res.data && setHotels(res.data)).catch(() => {})
    ReviewsAPI.byDestination(destId).then((res) => res.data && setReviews(res.data)).catch(() => {})
  }, [destId])

  if (!dest) {
    return <div className="section container"><h2>Destination not found</h2><Link to="/destinations" className="btn btn-outline">Back to destinations</Link></div>
  }

  const added = stops.some((s) => s.id === dest.id)

  function bookHotel(hotel) {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/payment', {
      state: {
        hotelId: hotel.id,
        destinationId: dest.id,
        title: `${hotel.name} · ${dest.name}`,
        amount: hotel.pricePerNight,
        guests: 2,
      },
    })
  }

  function submitReview(e) {
    e.preventDefault()
    if (!reviewText.trim()) return
    const optimistic = { id: Date.now(), destinationId: dest.id, author: user?.name || 'You', rating: reviewRating, verified: !!user, date: new Date().toISOString().slice(0, 10), text: reviewText }
    setReviews((r) => [optimistic, ...r])
    setReviewText('')
    ReviewsAPI.create({ destinationId: dest.id, rating: reviewRating, text: optimistic.text }).catch(() => {})
  }

  return (
    <div>
      <div className="detail-hero" style={{ backgroundImage: `url(${dest.image})` }}>
        <div className="detail-hero__scrim" />
        <div className="container detail-hero__content">
          <span className="eyebrow">{dest.state} · Best {dest.bestSeason}</span>
          <h1>{dest.name}</h1>
          <p>{dest.tagline}</p>
          <div className="detail-hero__row">
            <StarRating value={dest.rating} count={dest.reviewCount} />
            <button className={`btn btn-sm ${added ? 'btn-dark' : 'btn-primary'}`} onClick={() => addStop(dest)} disabled={added}>
              {added ? 'In your itinerary ✓' : '+ Add to itinerary'}
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container detail-grid">
          <div>
            <h2>Stays in {dest.name}</h2>
            <div className="grid grid--hotels">
              {hotels.length ? hotels.map((h) => <HotelCard key={h.id} h={h} onBook={bookHotel} />) : (
                <p className="muted">No listed stays yet for this destination — check back soon.</p>
              )}
            </div>

            <h2 style={{ marginTop: 48 }}>Traveller reviews</h2>
            <form className="review-form" onSubmit={submitReview}>
              <div className="review-form__rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} className={`review-form__star ${n <= reviewRating ? 'is-filled' : ''}`} onClick={() => setReviewRating(n)} aria-label={`${n} star`}>★</button>
                ))}
              </div>
              <textarea placeholder="Went recently? Share what surprised you." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} />
              <button className="btn btn-dark btn-sm" type="submit">Post review</button>
            </form>

            <div className="reviews">
              {reviews.map((r) => (
                <div className="review" key={r.id}>
                  <div className="review__top">
                    <strong>{r.author}</strong>
                    {r.verified && <span className="badge">Verified stay</span>}
                    <span className="review__rating">{'★'.repeat(r.rating)}</span>
                    <span className="review__date">{r.date}</span>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="detail-aside">
            <div className="card map-card">
              <div className="map-card__grid" />
              <div className="map-card__pin">📍</div>
              <p className="map-card__coords">{dest.lat.toFixed(2)}°N, {dest.lng.toFixed(2)}°E</p>
            </div>
            <div className="card info-card">
              <h4>Trip essentials</h4>
              <dl>
                <dt>Best season</dt><dd>{dest.bestSeason}</dd>
                <dt>State</dt><dd>{dest.state}</dd>
                <dt>Est. cost</dt><dd>₹{dest.priceFrom.toLocaleString()} / person</dd>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
