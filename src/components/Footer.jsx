import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__row">
        <div className="footer__brand">
          <div className="nav__brand"><span className="nav__mark">◈</span> YatraSetu</div>
          <p className="footer__tag">One map, every stop — India, planned properly.</p>
        </div>

        <div className="footer__cols">
          <div>
            <h4>Explore</h4>
            <Link to="/destinations">Destinations</Link>
            <Link to="/hotels">Stays</Link>
            <Link to="/itinerary">Itinerary planner</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/help">Help center</Link>
          </div>
          <div>
            <h4>Trust</h4>
            <a href="#reviews">Verified reviews</a>
            <a href="#pricing">Transparent pricing</a>
          </div>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} YatraSetu — a student project.</span>
      </div>
    </footer>
  )
}
