import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RoutesAPI, PlacesAPI } from '../api/client'

// Simple in-memory cache so that pressing the browser Back button (e.g. from
// the bookings/payment flow) back to this page instantly restores the last
// route instead of re-hitting the live routing APIs — the URL (`from`/`to`)
// stays the single source of truth, this just avoids a needless refetch.
const routeCache = new Map()

export default function RoutePlanner() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  // The URL is the source of truth for source/destination. This is what
  // keeps everything correct across the browser Back/Forward buttons: even
  // if this component unmounts (e.g. you go to Bookings and come back),
  // re-mounting reads the same `from`/`to` straight out of the URL instead
  // of resetting to a blank search.
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const cacheKey = `${from.toLowerCase()}|${to.toLowerCase()}`

  const [sourceInput, setSourceInput] = useState(from)
  const [destInput, setDestInput] = useState(to)
  useEffect(() => { setSourceInput(from) }, [from])
  useEffect(() => { setDestInput(to) }, [to])

  const [plan, setPlan] = useState(() => routeCache.get(cacheKey) || null)
  const [loading, setLoading] = useState(!routeCache.has(cacheKey))
  const [error, setError] = useState('')
  const [importingKey, setImportingKey] = useState(null)

  useEffect(() => {
    if (!from || !to) return
    const key = `${from.toLowerCase()}|${to.toLowerCase()}`

    if (routeCache.has(key)) {
      setPlan(routeCache.get(key))
      setLoading(false)
      setError('')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')
    RoutesAPI.plan(from, to)
      .then(({ data }) => {
        if (cancelled) return
        routeCache.set(key, data)
        setPlan(data)
      })
      .catch((err) => {
        if (cancelled) return
        setPlan(null)
        setError(err?.response?.data?.message || 'Could not plan that route right now. Try again in a moment.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [from, to])

  function submitSearch(e) {
    e.preventDefault()
    if (!sourceInput.trim() || !destInput.trim()) return
    const next = new URLSearchParams(params)
    next.set('from', sourceInput.trim())
    next.set('to', destInput.trim())
    setParams(next)
  }

  function swap() {
    setSourceInput(destInput)
    setDestInput(sourceInput)
    const next = new URLSearchParams(params)
    next.set('from', destInput.trim())
    next.set('to', sourceInput.trim())
    setParams(next)
  }

  async function openStop(stop) {
    const key = `${stop.name}-${stop.lat}-${stop.lng}`
    setImportingKey(key)
    try {
      const place = {
        name: stop.name,
        category: stop.category,
        lat: stop.lat,
        lng: stop.lng,
        distanceFromCenterKm: stop.distanceFromStartKm,
        nearbyStays: [],
      }
      const { data } = await PlacesAPI.import({ city: plan.destination.name, place })
      // Push (not replace) — so Back from the destination/booking flow
      // returns here, and the URL still has `from`/`to` to restore this view.
      navigate(`/destinations/${data.destination.id}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not open that place right now. Try again.')
    } finally {
      setImportingKey(null)
    }
  }

  const hasQuery = Boolean(from && to)

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Live route planner</span>
          <h1>{hasQuery ? `${from} → ${to}` : 'Plan a route'}</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Real driving directions, plus the notable places worth a stop along the way — all live data, no guesswork.
          </p>
        </div>

        <form className="route-search" onSubmit={submitSearch}>
          <div className="search__field search__field--grow">
            <label htmlFor="rp-source">Source</label>
            <input id="rp-source" value={sourceInput} onChange={(e) => setSourceInput(e.target.value)} placeholder="Starting point" />
          </div>
          <button type="button" className="search__swap" onClick={swap} aria-label="Swap source and destination" title="Swap source and destination">⇄</button>
          <div className="search__field search__field--grow">
            <label htmlFor="rp-dest">Destination</label>
            <input id="rp-dest" value={destInput} onChange={(e) => setDestInput(e.target.value)} placeholder="Where to?" />
          </div>
          <button className="btn btn-primary search__submit" type="submit">Search</button>
        </form>

        {!hasQuery && (
          <div className="empty" style={{ padding: '40px 20px' }}>
            <h3>Enter a source and destination above</h3>
            <p className="muted">We'll plot the shortest live route and the tourist spots along it.</p>
          </div>
        )}

        {hasQuery && loading && (
          <div className="empty" style={{ padding: '40px 20px' }}>
            <h3>Plotting the route from {from} to {to}…</h3>
            <p className="muted">Fetching live directions and nearby attractions. This can take a few seconds.</p>
          </div>
        )}

        {hasQuery && !loading && error && (
          <div className="notice notice--error">{error}</div>
        )}

        {hasQuery && !loading && plan && (
          <div className="route-plan">
            <div className="route-plan__map-wrap">
              <RouteMap plan={plan} />
              <div className="route-plan__stats">
                <div><strong>{plan.distanceKm} km</strong><span>Shortest route</span></div>
                <div><strong>{formatDuration(plan.durationMinutes)}</strong><span>Est. drive time</span></div>
                <div><strong>{plan.places.length}</strong><span>Stops along the way</span></div>
              </div>
            </div>

            <div className="route-plan__list">
              <h3>Places along the way</h3>
              {plan.places.length === 0 ? (
                <p className="muted">No notable tourist spots found in OpenStreetMap's data along this route.</p>
              ) : (
                <ul className="route-stops">
                  {plan.places.map((stop) => {
                    const key = `${stop.name}-${stop.lat}-${stop.lng}`
                    return (
                      <li key={key} className="route-stop">
                        <div>
                          <button type="button" className="live-card__name-btn" onClick={() => openStop(stop)} disabled={importingKey === key}>
                            <strong>{stop.name}</strong>
                          </button>
                          <span className="live-card__category">{stop.category}</span>
                        </div>
                        <span className="live-card__distance">
                          {importingKey === key ? 'Opening…' : `${stop.distanceFromStartKm} km in`}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

// Imperative Leaflet map — kept as a small standalone component so its
// effects (map init/teardown) don't get tangled with the page's data
// fetching effects above.
function RouteMap({ plan }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !window.L) return
    if (!mapRef.current) {
      mapRef.current = window.L.map(containerRef.current).setView([22.9734, 78.6569], 5) // default: India, refined by fitBounds once a route loads
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.L || !plan) return

    if (layerRef.current) {
      layerRef.current.remove()
    }
    const group = window.L.layerGroup().addTo(map)
    layerRef.current = group

    const line = window.L.polyline(plan.geometry, { color: '#E85D2A', weight: 4, opacity: 0.85 })
    line.addTo(group)

    window.L.circleMarker([plan.source.lat, plan.source.lng], { radius: 8, color: '#0F766E', fillColor: '#0F766E', fillOpacity: 1 })
      .bindPopup(`<strong>${plan.source.name}</strong><br/>Start`)
      .addTo(group)

    window.L.circleMarker([plan.destination.lat, plan.destination.lng], { radius: 8, color: '#B3261E', fillColor: '#B3261E', fillOpacity: 1 })
      .bindPopup(`<strong>${plan.destination.name}</strong><br/>Destination`)
      .addTo(group)

    plan.places.forEach((stop) => {
      window.L.circleMarker([stop.lat, stop.lng], { radius: 5, color: '#F0A500', fillColor: '#F0A500', fillOpacity: 0.9 })
        .bindPopup(`<strong>${stop.name}</strong><br/>${stop.category} · ${stop.distanceFromStartKm} km in`)
        .addTo(group)
    })

    map.fitBounds(line.getBounds(), { padding: [24, 24] })
  }, [plan])

  return <div ref={containerRef} className="route-plan__map" role="img" aria-label={`Map of the route from ${plan.source.name} to ${plan.destination.name}`} />
}
