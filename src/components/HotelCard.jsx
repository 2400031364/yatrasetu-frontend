import React from 'react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function HotelCard({ h, onBook }) {
  return (
    <article className="hcard">
      <Link to={`/hotels/${h.id}`} className="hcard__media-link">
        <img className="hcard__img" src={h.image} alt={h.name} loading="lazy" />
      </Link>
      <div className="hcard__body">
        <div className="hcard__top">
          <Link to={`/hotels/${h.id}`} className="hcard__name-link"><h3>{h.name}</h3></Link>
          <span className="hcard__stars">{'★'.repeat(h.stars)}</span>
        </div>
        <StarRating value={h.rating} count={h.reviewCount} />
        <ul className="hcard__amenities">
          {h.amenities.map((a) => <li key={a}>{a}</li>)}
        </ul>
        <div className="hcard__bottom">
          <div>
            <strong className="hcard__price">₹{h.pricePerNight.toLocaleString()}</strong>
            <span className="hcard__pernight"> / night</span>
            <div className="hcard__nofees">No hidden fees at checkout</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onBook?.(h)}>Book stay</button>
        </div>
        <Link to={`/hotels/${h.id}`} className="link-btn" style={{ marginTop: 10, display: 'inline-block' }}>
          View details & reviews →
        </Link>
      </div>
    </article>
  )
}
