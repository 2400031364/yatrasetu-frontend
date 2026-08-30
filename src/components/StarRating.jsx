import React from 'react'

export default function StarRating({ value = 0, count }) {
  return (
    <span className="stars" aria-label={`Rated ${value} out of 5`}>
      <span className="stars__badge">{value.toFixed(1)} ★</span>
      {count != null && <span className="stars__count">({count.toLocaleString()})</span>}
    </span>
  )
}
