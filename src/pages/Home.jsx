import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchWidget from '../components/SearchWidget'
import RouteTrail from '../components/RouteTrail'
import DestinationCard from '../components/DestinationCard'
import { DestinationsAPI } from '../api/client'
import { DESTINATIONS, CATEGORIES } from '../data/mockData'

export default function Home() {
  const [featured, setFeatured] = useState(DESTINATIONS.slice(0, 4))

  useEffect(() => {
    DestinationsAPI.featured()
      .then((res) => { if (res.data?.length) setFeatured(res.data) })
      .catch(() => { /* fall back to bundled demo data */ })
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container hero__row">
          <div className="hero__copy">
            <span className="eyebrow">01 states covered, one itinerary</span>
            <h1 className="hero__title">
              Plan India<br />like a local,<br /><span className="hero__title-accent">not a tourist.</span>
            </h1>
            <p className="hero__sub">
              Destinations, stays and a day-by-day planner in one place — with upfront pricing
              and reviews from travellers who actually checked in.
            </p>
            <SearchWidget />
            <div className="hero__stats">
              <div><strong>620+</strong><span>Destinations</span></div>
              <div><strong>12.4k</strong><span>Verified reviews</span></div>
              <div><strong>₹0</strong><span>Hidden fees</span></div>
            </div>
          </div>
          <div className="hero__art">
            <RouteTrail />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Browse by mood</span>
            <h2>What kind of trip are you packing for?</h2>
          </div>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <Link key={c.key} to={`/destinations?category=${c.key}`} className="chip">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section__head section__head--row">
            <div>
              <span className="eyebrow">Handpicked</span>
              <h2>Featured destinations</h2>
            </div>
            <Link to="/destinations" className="btn btn-outline btn-sm">View all →</Link>
          </div>
          <div className="grid grid--cards">
            {featured.map((d) => <DestinationCard key={d.id} d={d} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Why YatraSetu</span>
            <h2>Built to fix what other travel sites get wrong</h2>
          </div>
          <div className="grid grid--features">
            <Feature title="Destinations + stays + food, together" text="No more nine tabs open. Attractions, hotels and where to eat sit on the same page." icon="🗺️" />
            <Feature title="Transparent pricing" text="The price you see while browsing is the price at checkout. No surprise 'taxes & fees' reveal." icon="🏷️" />
            <Feature title="Verified reviews only" text="Reviews are tied to a completed stay, so you're reading real trips, not marketing copy." icon="✅" />
            <Feature title="Itinerary builder" text="Drag destinations into a day-by-day plan and see total nights and rough budget as you go." icon="🧭" />
            <Feature title="Offbeat picks" text="A whole category for the places that never make the top-10 listicles." icon="🌄" />
            <Feature title="Personalized picks" text="Recommendations shift based on the categories and places you've saved." icon="✨" />
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container cta">
          <div>
            <h2>Start building your itinerary — it's free, no account needed yet.</h2>
            <p>Add a few places, see them line up day by day, sign in only when you're ready to book.</p>
          </div>
          <Link to="/itinerary" className="btn btn-primary">Open itinerary planner →</Link>
        </div>
      </section>
    </>
  )
}

function Feature({ title, text, icon }) {
  return (
    <div className="feature">
      <div className="feature__icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
