import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { HotelsAPI, DestinationsAPI, ReviewsAPI } from '../api/client'
import { HOTELS, DESTINATIONS, REVIEWS } from '../data/mockData'
import { useAuth } from '../context/AuthContext'

export default function HotelDetail() {
  const { id } = useParams()
  const hotelId = Number(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [hotel, setHotel] = useState(() => HOTELS.find((h) => h.id === hotelId) || null)
  const [destination, setDestination] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setNotFound(false)
    HotelsAPI.get(hotelId)
      .then((res) => setHotel(res.data))
      .catch(() => {
        const fallback = HOTELS.find((h) => h.id === hotelId)
        if (fallback) setHotel(fallback); else setNotFound(true)
      })
  }, [hotelId])

  useEffect(() => {
    if (!hotel) return
    DestinationsAPI.get(hotel.destinationId).then((res) => res.data && setDestination(res.data))
      .catch(() => setDestination(DESTINATIONS.find((d) => d.id === hotel.destinationId) || null))
    ReviewsAPI.byDestination(hotel.destinationId).then((res) => res.data && setReviews(res.data))
      .catch(() => setReviews(REVIEWS.filter((r) => r.destinationId === hotel.destinationId)))
  }, [hotel])

  if (notFound) {
    return (
      <div className="section container empty">
        <h2>Stay not found</h2>
        <Link to="/hotels" className="btn btn-outline" style={{ marginTop: 16 }}>Back to stays</Link>
      </div>
    )
  }

  if (!hotel) {
    return <div className="section container"><p className="muted">Loading stay details…</p></div>
  }

  function bookStay() {
    if (!user) { navigate('/login'); return }
    navigate('/payment', {
      state: {
        hotelId: hotel.id,
        destinationId: hotel.destinationId,
        title: `${hotel.name}${destination ? ' · ' + destination.name : ''}`,
        amount: hotel.pricePerNight,
        guests: 2,
      },
    })
  }

  function submitReview(e) {
    e.preventDefault()
    if (!reviewText.trim() || !destination) return
    const optimistic = { id: Date.now(), destinationId: destination.id, author: user?.name || 'You', rating: reviewRating, verified: !!user, date: new Date().toISOString().slice(0, 10), text: reviewText }
    setReviews((r) => [optimistic, ...r])
    setReviewText('')
    ReviewsAPI.create({ destinationId: destination.id, rating: reviewRating, text: optimistic.text }).catch(() => {})
  }

  return (
    <div>
      <div className="detail-hero" style={{ backgroundImage: `url(${hotel.image})` }}>
        <div className="detail-hero__scrim" />
        <div className="container detail-hero__content">
          {destination && (
            <span className="eyebrow">
              <Link to={`/destinations/${destination.id}`} style={{ color: 'inherit' }}>📍 Near {destination.name}, {destination.state}</Link>
            </span>
          )}
          <h1>{hotel.name}</h1>
          <p>{'★'.repeat(hotel.stars)} · {hotel.stars}-star stay</p>
          <div className="detail-hero__row">
            <StarRating value={hotel.rating} count={hotel.reviewCount} />
            <button className="btn btn-primary btn-sm" onClick={bookStay}>
              Book stay — ₹{hotel.pricePerNight.toLocaleString()}/night
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container detail-grid">
          <div>
            <h2>Facilities</h2>
            <div className="facilities-grid">
              {hotel.amenities.map((a) => (
                <div className="facility-chip" key={a}>✓ {a}</div>
              ))}
            </div>

            <h2 style={{ marginTop: 48 }}>Guest reviews</h2>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 4 }}>
              Reviews are shared across stays in {destination?.name || 'this area'}, since they reflect the destination as a whole.
            </p>
            <form className="review-form" onSubmit={submitReview}>
              <div className="review-form__rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} className={`review-form__star ${n <= reviewRating ? 'is-filled' : ''}`} onClick={() => setReviewRating(n)} aria-label={`${n} star`}>★</button>
                ))}
              </div>
              <textarea placeholder="How was your stay?" value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} />
              <button className="btn btn-dark btn-sm" type="submit">Post review</button>
            </form>

            <div className="reviews">
              {reviews.length ? reviews.map((r) => (
                <div className="review" key={r.id}>
                  <div className="review__top">
                    <strong>{r.author}</strong>
                    {r.verified && <span className="badge">Verified stay</span>}
                    <span className="review__rating">{'★'.repeat(r.rating)}</span>
                    <span className="review__date">{r.date}</span>
                  </div>
                  <p>{r.text}</p>
                </div>
              )) : <p className="muted">No reviews yet — be the first to share your experience.</p>}
            </div>
          </div>

          <aside className="detail-aside">
            <div className="card info-card">
              <h4>Stay essentials</h4>
              <dl>
                <dt>Price</dt><dd>₹{hotel.pricePerNight.toLocaleString()} / night</dd>
                <dt>Rating</dt><dd>{hotel.rating.toFixed(1)} ★</dd>
                {destination && <><dt>Near</dt><dd>{destination.name}</dd></>}
              </dl>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={bookStay}>
                Book this stay
              </button>
            </div>
            {destination && (
              <div className="card info-card">
                <h4>About the area</h4>
                <p className="muted" style={{ fontSize: 13.5 }}>{destination.tagline}</p>
                <Link to={`/destinations/${destination.id}`} className="link-btn" style={{ marginTop: 10, display: 'inline-block' }}>
                  See {destination.name} & other stays →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
