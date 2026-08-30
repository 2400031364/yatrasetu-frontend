import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="section container empty">
      <h1>404</h1>
      <h3>This trail doesn't lead anywhere</h3>
      <p>The page you're looking for has wandered off the map.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back home</Link>
    </div>
  )
}
