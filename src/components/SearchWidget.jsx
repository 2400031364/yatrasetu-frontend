import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchWidget() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ source: '', destination: '' })
  const [error, setError] = useState('')

  function update(key, value) {
    setError('')
    setForm((f) => ({ ...f, [key]: value }))
  }

  function swap() {
    setForm((f) => ({ source: f.destination, destination: f.source }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.source.trim() || !form.destination.trim()) {
      setError('Enter both a source and a destination to plan the route.')
      return
    }
    const params = new URLSearchParams()
    params.set('from', form.source.trim())
    params.set('to', form.destination.trim())
    // Plain push navigation (no `replace`) so the browser Back button always
    // returns here to the route results — never straight past them.
    navigate(`/route-planner?${params.toString()}`)
  }

  return (
    <form className="search" onSubmit={submit}>
      <div className="search__field search__field--grow">
        <label htmlFor="source">Source</label>
        <input
          id="source"
          placeholder="Where are you starting from?"
          value={form.source}
          onChange={(e) => update('source', e.target.value)}
        />
      </div>
      <button type="button" className="search__swap" onClick={swap} aria-label="Swap source and destination" title="Swap source and destination">
        ⇄
      </button>
      <div className="search__field search__field--grow">
        <label htmlFor="destination">Destination</label>
        <input
          id="destination"
          placeholder="Where do you want to go?"
          value={form.destination}
          onChange={(e) => update('destination', e.target.value)}
        />
      </div>
      <button className="btn btn-primary search__submit" type="submit">Search</button>
      {error && <p className="search__error">{error}</p>}
    </form>
  )
}
