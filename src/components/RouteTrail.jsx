import React from 'react'

// The page's signature element: a hand-drawn travel route connecting stops,
// echoing the "dotted flight path" of a paper map. Pure CSS/SVG, no deps.
export default function RouteTrail() {
  return (
    <svg className="trail" viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        className="trail__path"
        d="M40 380 C 120 340, 90 260, 170 230 S 260 120, 230 60 C 300 40, 330 120, 410 100 S 480 40, 480 40"
        stroke="var(--saffron-500)"
        strokeWidth="2.5"
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      {[
        { x: 40, y: 380, label: 'Jaipur' },
        { x: 170, y: 230, label: 'Hampi' },
        { x: 230, y: 60, label: 'Spiti' },
        { x: 410, y: 100, label: 'Munnar' },
        { x: 480, y: 40, label: 'Andaman' },
      ].map((p, i) => (
        <g key={p.label} className="trail__stop" style={{ animationDelay: `${i * 0.25 + 0.4}s` }}>
          <circle cx={p.x} cy={p.y} r="6" fill="var(--paper-050)" stroke="var(--terracotta-600)" strokeWidth="2.5" />
          <circle cx={p.x} cy={p.y} r="2" fill="var(--terracotta-600)" />
        </g>
      ))}
    </svg>
  )
}
