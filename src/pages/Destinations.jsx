import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import DestinationCard from '../components/DestinationCard'
import { DestinationsAPI, PlacesAPI } from '../api/client'
import { DESTINATIONS, CATEGORIES } from '../data/mockData'

// Caches a city's live results in memory so that navigating away (e.g. into
// a place's detail page and the booking flow) and pressing Back restores
// them instantly instead of losing the search and showing an empty box.
const liveSearchCache = new Map()

export default function Destinations() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [all, setAll] = useState(DESTINATIONS)
  const [sort, setSort] = useState('rating')

  const category = params.get('category') || ''
  const query = params.get('q') || ''

  useEffect(() => {
    DestinationsAPI.list({ category, q: query })
      .then((res) => { if (res.data?.length) setAll(res.data) })
      .catch(() => { /* fall back to bundled demo data */ })
  }, [category, query])

  const filtered = useMemo(() => {
    let list = all.filter((d) => {
      const matchesCategory = !category || d.category === category
      const matchesQuery = !query || `${d.name} ${d.state}`.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    if (sort === 'price-low') list = [...list].sort((a, b) => a.priceFrom - b.priceFrom)
    if (sort === 'price-high') list = [...list].sort((a, b) => b.priceFrom - a.priceFrom)
    return list
  }, [all, category, query, sort])

  function setCategory(next) {
    const p = new URLSearchParams(params)
    if (next) p.set('category', next); else p.delete('category')
    setParams(p)
  }

  // ---- Live city search (real OpenStreetMap data, not the curated list) ----
  // `liveCity` (the URL's `city` param) is the source of truth for what was
  // actually searched — so pressing Back after opening a place / booking
  // restores the same results instead of resetting to an empty search box.
  const liveCity = params.get('city') || ''
  const [city, setCity] = useState(liveCity) // the text field's current value
  useEffect(() => { setCity(liveCity) }, [liveCity])

  const [live, setLive] = useState(() => liveSearchCache.get(liveCity.toLowerCase()) || null)
  const [liveLoading, setLiveLoading] = useState(Boolean(liveCity) && !liveSearchCache.has(liveCity.toLowerCase()))
  const [liveError, setLiveError] = useState('')
  const [expanded, setExpanded] = useState({}) // placeName -> bool, show/hide stays
  const [importingKey, setImportingKey] = useState(null)

  useEffect(() => {
    if (!liveCity) { setLive(null); return }
    const key = liveCity.toLowerCase()
    if (liveSearchCache.has(key)) {
      setLive(liveSearchCache.get(key))
      setLiveLoading(false)
      setLiveError('')
      return
    }
    let cancelled = false
    setLiveLoading(true)
    setLiveError('')
    PlacesAPI.search(liveCity)
      .then(({ data }) => {
        if (cancelled) return
        liveSearchCache.set(key, data)
        setLive(data)
        if (!data.places?.length) {
          setLiveError(`No tourist places found near "${liveCity}" in OpenStreetMap's data. Try a bigger nearby city.`)
        }
      })
      .catch((err) => {
        if (cancelled) return
        setLive(null)
        setLiveError(err?.response?.data?.message || 'Could not fetch live places right now. Try again in a moment.')
      })
      .finally(() => { if (!cancelled) setLiveLoading(false) })
    return () => { cancelled = true }
  }, [liveCity])

  async function openLivePlace(place) {
    const key = `${place.name}-${place.lat}-${place.lng}`
    setImportingKey(key)
    try {
      const { data } = await PlacesAPI.import({ city: live.city, place })
      navigate(`/destinations/${data.destination.id}`)
    } catch (err) {
      setLiveError(err?.response?.data?.message || 'Could not open this place right now. Try again.')
    } finally {
      setImportingKey(null)
    }
  }

  async function openLiveStay(place, stay) {
    const key = `stay-${stay.name}-${stay.lat}-${stay.lng}`
    setImportingKey(key)
    try {
      const { data } = await PlacesAPI.import({ city: live.city, place })
      const matched = data.hotels?.find((h) => h.name === stay.name)
      if (matched) navigate(`/hotels/${matched.id}`)
      else navigate(`/destinations/${data.destination.id}`)
    } catch (err) {
      setLiveError(err?.response?.data?.message || 'Could not open this stay right now. Try again.')
    } finally {
      setImportingKey(null)
    }
  }

  function searchCity(e) {
    e.preventDefault()
    if (!city.trim()) return
    // Pushes `city` into the URL (never `replace`) so the browser Back
    // button always has this exact search to return to.
    const p = new URLSearchParams(params)
    p.set('city', city.trim())
    setParams(p)
  }

  function clearLiveSearch() {
    setLiveError('')
    setCity('')
    const p = new URLSearchParams(params)
    p.delete('city')
    setParams(p)
  }

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Live search</span>
          <h1>Find real tourist places near any city</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Search any city worldwide — results are fetched live from OpenStreetMap, including nearby stays with distances.
          </p>
        </div>

        <form className="city-search" onSubmit={searchCity}>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter a city — e.g. Udaipur, Kochi, Shimla…"
          />
          <button className="btn btn-primary" type="submit" disabled={liveLoading}>
            {liveLoading ? 'Searching…' : 'Search live places'}
          </button>
          {live && <button type="button" className="btn btn-outline" onClick={clearLiveSearch}>Clear</button>}
        </form>

        {liveLoading && (
          <div className="empty" style={{ padding: '40px 20px' }}>
            <h3>Fetching live data for "{city}"…</h3>
            <p className="muted">Pulling attractions and nearby stays from OpenStreetMap. This can take a few seconds.</p>
          </div>
        )}

        {!liveLoading && liveError && (
          <div className="notice notice--error">{liveError}</div>
        )}

        {!liveLoading && live && live.places?.length > 0 && (
          <div className="live-results">
            <div className="live-results__head">
              <span className="eyebrow">{live.places.length} real places found near {live.city}</span>
            </div>
            <div className="live-grid">
              {live.places.map((place) => {
                const placeKey = `${place.name}-${place.lat}-${place.lng}`
                return (
                <div className="live-card" key={placeKey}>
                  <div className="live-card__top">
                    <div>
                      <button
                        type="button"
                        className="live-card__name-btn"
                        onClick={() => openLivePlace(place)}
                        disabled={importingKey === placeKey}
                      >
                        <h3>{place.name}</h3>
                      </button>
                      <span className="live-card__category">{place.category}</span>
                    </div>
                    <span className="live-card__distance">{place.distanceFromCenterKm} km from city centre</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', marginBottom: 8 }}
                    onClick={() => openLivePlace(place)}
                    disabled={importingKey === placeKey}
                  >
                    {importingKey === placeKey ? 'Opening…' : 'View place details →'}
                  </button>

                  {place.nearbyStays?.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => setExpanded((s) => ({ ...s, [place.name]: !s[place.name] }))}
                      >
                        {expanded[place.name] ? 'Hide' : 'Show'} {place.nearbyStays.length} nearby stay{place.nearbyStays.length > 1 ? 's' : ''}
                      </button>
                      {expanded[place.name] && (
                        <ul className="live-card__stays">
                          {place.nearbyStays.map((stay) => {
                            const stayKey = `stay-${stay.name}-${stay.lat}-${stay.lng}`
                            return (
                              <li key={stay.name}>
                                <button
                                  type="button"
                                  className="live-card__stay-btn"
                                  onClick={() => openLiveStay(place, stay)}
                                  disabled={importingKey === stayKey}
                                >
                                  <span>{stay.name}</span>
                                  <span className="live-card__stay-meta">
                                    {importingKey === stayKey ? 'Opening…' : `${stay.type} · ${stay.distanceKm} km away`}
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>No listed stays nearby in OpenStreetMap data.</p>
                  )}
                </div>
              )})}
            </div>
          </div>
        )}

        <div className="page-head" style={{ marginTop: live ? 56 : 40 }}>
          <span className="eyebrow">{filtered.length} destinations</span>
          <h1>Curated destinations</h1>
        </div>

        <div className="filters">
          <div className="filters__chips">
            <button className={`chip chip--sm ${!category ? 'is-active' : ''}`} onClick={() => setCategory('')}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.key} className={`chip chip--sm ${category === c.key ? 'is-active' : ''}`} onClick={() => setCategory(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">Sort: Top rated</option>
            <option value="price-low">Sort: Price — low to high</option>
            <option value="price-high">Sort: Price — high to low</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <h3>No destinations match that search</h3>
            <p>Try clearing the category filter or searching a different state.</p>
          </div>
        ) : (
          <div className="grid grid--cards">
            {filtered.map((d) => <DestinationCard key={d.id} d={d} />)}
          </div>
        )}
      </div>
    </div>
  )
}
