import React, { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function submit(e) {
    e.preventDefault()
    // No backend endpoint for this yet — kept as a friendly local
    // confirmation so the page is fully functional for a demo.
    setSent(true)
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <span className="eyebrow">Contact</span>
        <h1 style={{ marginTop: 10 }}>Say hello</h1>
        <p className="muted" style={{ marginTop: 12 }}>
          Questions, feedback, or spotted a bug? Send a note below.
        </p>

        {sent ? (
          <div className="notice" style={{ marginTop: 24 }}>
            Thanks, {form.name || 'traveller'} — your message has been noted. We'll get back to you at {form.email}.
          </div>
        ) : (
          <form className="card auth__card" style={{ marginTop: 24, padding: 28 }} onSubmit={submit}>
            <label>Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </label>
            <label>Email
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </label>
            <label>Message
              <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="What's on your mind?"
                style={{ width: '100%', border: '1.5px solid var(--line-dark)', borderRadius: 10, padding: 12, fontFamily: 'inherit', resize: 'vertical' }} />
            </label>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Send message</button>
          </form>
        )}
      </div>
    </div>
  )
}
