import React, { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useItinerary } from '../context/ItineraryContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { stops } = useItinerary()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHotelManager = user?.role === 'HOTEL_MANAGER'

  const links = [
    { to: '/route-planner', label: 'Route Planner' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/hotels', label: 'Stays' },
    { to: '/itinerary', label: 'Itinerary' },
    ...(user && !isHotelManager ? [{ to: '/bookings', label: 'Bookings' }] : []),
    ...(isHotelManager ? [{ to: '/hotel-dashboard', label: 'Hotel Dashboard' }] : []),
  ]

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__row">
        <Link to="/" className="nav__brand" onClick={() => setOpen(false)}>
          <span className="nav__mark">◈</span> YatraSetu
        </Link>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <Link to="/itinerary" className="nav__pill" title="Your itinerary">
            🧭 {stops.length}
          </Link>
          {user ? (
            <div className="nav__user">
              <Link to="/profile" className="nav__hello" title="My profile">Hi, {user.name?.split(' ')[0]}</Link>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/') }}>Sign out</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-dark btn-sm">Sign in</Link>
          )}
          <button className="nav__burger" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
