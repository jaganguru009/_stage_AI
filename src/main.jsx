import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { WorkspacePage } from './pages/WorkspacePage'
import { AuthPage } from './pages/AuthPage'
import { PublicHomePage } from './pages/PublicHomePage'
import './styles.css'
import './stage-theme.css'
import './auth-overrides.css'
import './hero-motion-boost.css'
import './actor-lighting.css'
import './actor-spotlight-targets.css'

const opportunities = [
  { company: 'Riverstone Theatre Co.', type: 'Casting call', title: 'Lead Actor — The Glass Menagerie', meta: 'Bengaluru · In-person', color: 'rose' },
  { company: 'Awaaz Collective', type: 'Open role', title: 'Lighting Designer for new work', meta: 'Bengaluru · Flexible', color: 'ochre' },
  { company: 'Ninaad Arts', type: 'Casting call', title: 'Singer / performer ensemble', meta: 'Mumbai · Auditions this week', color: 'plum' },
]

const credits = [
  ['18', 'verified productions'],
  ['42', 'trusted collaborators'],
  ['5', 'new opportunities']
]

function Arrow() {
  return <span className="arrow" aria-hidden="true">↗</span>
}

function LandingPage() {
  return (
    <main>
      <section className="hero-shell">
        <nav className="nav wrap">
          <a className="brand" href="#top" aria-label="Stage home"><span>stage</span><i /></a>
          <div className="nav-links">
            <a href="#discover">Discover talent</a>
            <a href="#how-it-works">For organizations</a>
            <a href="#how-it-works">For artists</a>
          </div>
          <div className="nav-actions">
            <button className="text-button">Log in</button>
            <button className="pill-button light">Join Stage <Arrow /></button>
          </div>
        </nav>

        <div className="hero wrap" id="top">
          <p className="eyebrow">The professional home for performing arts</p>
          <h1>Make your next<br /><em>great production.</em></h1>
          <p className="hero-copy">A better way for artists and organizations to meet, make work, and build careers with every production.</p>
          <div className="hero-actions">
            <button className="pill-button coral">Create your profile <Arrow /></button>
            <button className="watch-button"><span className="play">▶</span> See how Stage works</button>
          </div>

          <div className="hero-art" aria-label="Stage artist profile preview">
            <div className="sun-disc" />
            <div className="arch arch-one" /><div className="arch arch-two" />
            <div className="profile-card">
              <div className="portrait portrait-main" />
              <div className="profile-info">
                <span className="verified">● Verified artist</span>
                <h3>Maya D'Souza</h3>
                <p>Actor · Movement artist</p>
                <div className="tag-row"><span>Contemporary theatre</span><span>Hindi</span></div>
              </div>
              <button className="profile-more">•••</button>
            </div>
            <div className="credit-card"><strong>18</strong><span>verified<br />productions</span><i>✓</i></div>
            <div className="note-card">Casting now<br /><b>The Last Monsoon</b><span>Riverstone Theatre</span></div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="wrap trust-content"><p>Built for the people who bring the arts to life.</p><div><span>THEATRE</span><span>FILM</span><span>MUSIC</span><span>LIVE EVENTS</span></div></div>
      </section>

      <section className="discover wrap" id="discover">
        <div className="section-head"><div><p className="eyebrow dark">Find your next collaborator</p><h2>Good work starts<br />with the right people.</h2></div><button className="round-link">Explore talent <Arrow /></button></div>
        <div className="talent-grid">
          <article className="talent-card card-one"><div className="portrait portrait-one" /><div className="talent-caption"><span>Actor</span><h3>Arjun Mehta</h3><p>12 verified productions</p></div></article>
          <article className="talent-card card-two"><div className="portrait portrait-two" /><div className="talent-caption"><span>Costume designer</span><h3>Shreya Nair</h3><p>8 verified productions</p></div></article>
          <article className="talent-card card-three"><div className="portrait portrait-three" /><div className="talent-caption"><span>Music director</span><h3>Kabir Ali</h3><p>21 verified productions</p></div></article>
        </div>
      </section>

      <section className="opportunities-section">
        <div className="wrap"><div className="section-head"><div><p className="eyebrow dark">Open opportunities</p><h2>Your next role<br />could be here.</h2></div><button className="round-link">View all opportunities <Arrow /></button></div>
          <div className="opportunity-list">{opportunities.map((item) => <article className="opportunity" key={item.title}><div className={`opportunity-mark ${item.color}`}>{item.company.charAt(0)}</div><div className="opportunity-main"><span className="job-type">{item.type}</span><h3>{item.title}</h3><p>{item.company}</p></div><p className="opportunity-meta">{item.meta}</p><button aria-label={`View ${item.title}`} className="circle-arrow"><Arrow /></button></article>)}</div>
        </div>
      </section>

      <section className="how-section wrap" id="how-it-works">
        <div className="how-visual"><div className="how-orbit"><span>Make</span><span>Find</span><span>Grow</span><b>STAGE</b></div></div>
        <div className="how-copy"><p className="eyebrow dark">A career, not a feed</p><h2>Every credit tells<br />your story.</h2><p>Stage turns your real work into a professional history you can carry from one production to the next. No chasing followers. Just the craft, the people, and the work.</p><div className="stat-row">{credits.map(([number, label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}</div><button className="pill-button ink">Build your profile <Arrow /></button></div>
      </section>

      <section className="cta wrap"><p className="eyebrow">Your next chapter starts here</p><h2>Bring your work<br />into the spotlight.</h2><button className="pill-button light">Join Stage today <Arrow /></button></section>
      <footer className="footer wrap"><a className="brand" href="#top"><span>stage</span><i /></a><p>© 2026 Stage. Made for the performing arts.</p><div><a href="#top">Instagram</a><a href="#top">LinkedIn</a><a href="#top">Contact</a></div></footer>
    </main>
  )
}

function App() {
  return <Routes>
    <Route path="/" element={<PublicHomePage />} />
    <Route path="/home" element={<PublicHomePage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/:page" element={<WorkspacePage />} />
  </Routes>
}

createRoot(document.getElementById('root')).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>)
