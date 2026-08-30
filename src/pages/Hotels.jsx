import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HotelCard from '../components/HotelCard'
import { HotelsAPI } from '../api/client'
import { HOTELS, DESTINATIONS } from '../data/mockData'
import { useAuth } from '../context/AuthContext'

export default function Hotels() {
  const [hotels, setHotels] = useState(HOTELS)
  const [maxPrice, setMaxPrice] = useState(6000)
  const [minStars, setMinStars] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    HotelsAPI.list().then((res) => { if (res.data?.length) setHotels(res.data) }).catch(() => {})
  }, [])

  const filtered = useMemo(
    () => hotels.filter((h) => h.pricePerNight <= maxPrice && h.stars >= minStars),
    [hotels, maxPrice, minStars]
  )

  function nameFor(destinationId) {
    return DESTINATIONS.find((d) => d.id === destinationId)?.name || ''
  }

  function bookHotel(hotel) {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/payment', {
      state: {
        hotelId: hotel.id,
        title: hotel.name,
        amount: hotel.pricePerNight,
        guests: 2,
      },
    })
  }

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">{filtered.length} stays</span>
          <h1>Find a place to stay</h1>
        </div>

        <div className="filters filters--stays">
          <label>
            Max price / night: ₹{maxPrice.toLocaleString()}
            <input type="range" min="500" max="6000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          </label>
          <label>
            Min stars
            <select className="select" value={minStars} onChange={(e) => setMinStars(Number(e.target.value))}>
              <option value={0}>Any</option>
              <option value={3}>3+</option>
              <option value={4}>4+</option>
            </select>
          </label>
        </div>

        <div className="grid grid--hotels">
          {filtered.map((h) => (
            <div key={h.id}>
              <span className="hcard__location">📍 {nameFor(h.destinationId)}</span>
              <HotelCard h={h} onBook={bookHotel} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
