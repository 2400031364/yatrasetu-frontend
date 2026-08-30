import React from 'react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'
import { useItinerary } from '../context/ItineraryContext'

export default function DestinationCard({ d }) {
  const { stops, addStop } = useItinerary()
  const added = stops.some((s) => s.id === d.id)

  return (
    <article className="dcard">
      <Link to={`/destinations/${d.id}`} className="dcard__media">
        <img src={d.image} alt={d.name} loading="lazy" />
        <span className="dcard__season">{d.bestSeason}</span>
      </Link>
      <div className="dcard__body">
        <div className="dcard__top">
          <div>
            <h3>{d.name}</h3>
            <p className="dcard__state">{d.state}</p>
          </div>
          <StarRating value={d.rating} count={d.reviewCount} />
        </div>
        <p className="dcard__tagline">{d.tagline}</p>
        <div className="dcard__bottom">
          <span className="dcard__price"><strong>₹{d.priceFrom.toLocaleString()}</strong> / person, est.</span>
          <button
            className={`btn btn-sm ${added ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => addStop(d)}
            disabled={added}
          >
            {added ? 'Added ✓' : '+ Itinerary'}
          </button>
        </div>
      </div>
    </article>
  )
}
