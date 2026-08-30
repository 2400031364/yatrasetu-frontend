import React, { createContext, useContext, useEffect, useState } from 'react'

const ItineraryContext = createContext(null)

const STORAGE_KEY = 'yatra_itinerary_draft'

export function ItineraryProvider({ children }) {
  const [stops, setStops] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stops))
  }, [stops])

  function addStop(destination) {
    setStops((prev) => {
      if (prev.find((s) => s.id === destination.id)) return prev
      return [...prev, { ...destination, day: prev.length + 1, nights: 1 }]
    })
  }

  function removeStop(id) {
    setStops((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, day: i + 1 })))
  }

  function updateNights(id, nights) {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, nights: Math.max(1, nights) } : s)))
  }

  function reorder(fromIndex, toIndex) {
    setStops((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next.map((s, i) => ({ ...s, day: i + 1 }))
    })
  }

  function clear() { setStops([]) }

  const totalNights = stops.reduce((sum, s) => sum + s.nights, 0)

  return (
    <ItineraryContext.Provider value={{ stops, addStop, removeStop, updateNights, reorder, clear, totalNights }}>
      {children}
    </ItineraryContext.Provider>
  )
}

export function useItinerary() {
  const ctx = useContext(ItineraryContext)
  if (!ctx) throw new Error('useItinerary must be used within ItineraryProvider')
  return ctx
}
