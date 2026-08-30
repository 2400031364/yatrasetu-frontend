import React, { useState } from 'react'

const FAQS = [
  { q: 'How does the itinerary planner work?', a: 'Tap "+ Itinerary" on any destination card. It gets added to your trip plan where you can reorder stops, set nights per stop, and see a running budget estimate.' },
  { q: 'How does sign-in work?', a: 'YatraSetu uses passwordless sign-in: enter your email, we send a 6-digit code, and entering it signs you in. New accounts also verify their email with a code before the account is created.' },
  { q: 'How do I book a stay?', a: 'Open a hotel and tap "Book stay". You will be taken to a payment page to choose a payment method and confirm the amount before the booking is finalized.' },
  { q: 'Can I search for real, live tourist places?', a: 'Yes — on the Destinations page, use the city search box. Results are fetched live from OpenStreetMap, not limited to the curated list, and include nearby stays with distances.' },
  { q: 'How do I cancel a booking?', a: 'Go to your Bookings page from the navigation bar (visible once signed in) and use the cancel option next to the booking.' },
  { q: 'Where do I update my profile?', a: 'Click your name in the top navigation to open your Profile page, where you can update your name, mobile number and address.' },
]

export default function HelpCenter() {
  const [open, setOpen] = useState(null)

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <span className="eyebrow">Help center</span>
        <h1 style={{ marginTop: 10 }}>Frequently asked questions</h1>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((item, i) => (
            <div key={item.q} className="card" style={{ padding: '18px 22px', cursor: 'pointer' }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                {item.q}
                <span style={{ opacity: 0.5 }}>{open === i ? '−' : '+'}</span>
              </div>
              {open === i && <p className="muted" style={{ marginTop: 10 }}>{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
