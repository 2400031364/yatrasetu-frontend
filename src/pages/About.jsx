import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <span className="eyebrow">About YatraSetu</span>
        <h1 style={{ marginTop: 10 }}>Planning India, without the nine open tabs</h1>
        <p className="muted" style={{ marginTop: 18, fontSize: 16, lineHeight: 1.7 }}>
          YatraSetu started as a simple idea: most travel sites make you choose between
          rich destination storytelling (great for inspiration, useless for booking) or
          pure booking engines (great for checkout, useless for actually deciding where
          to go). We wanted both — destinations, real nearby attractions, stays and an
          itinerary planner, all in one place, with transparent pricing throughout.
        </p>
        <p className="muted" style={{ marginTop: 16, fontSize: 16, lineHeight: 1.7 }}>
          This is a student project built to explore a full travel-planning flow end to
          end — from live place discovery to booking to payment — using a
          React + Vite frontend and a Spring Boot + MySQL backend.
        </p>
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <Link to="/destinations" className="btn btn-primary">Explore destinations</Link>
          <Link to="/contact" className="btn btn-outline">Get in touch</Link>
        </div>
      </div>
    </div>
  )
}
