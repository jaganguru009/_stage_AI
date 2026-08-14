import { Link } from 'react-router-dom'
import { StageButton } from '../components/stage/StageButton'
import { StageIcon } from '../components/stage/StageIcon'
import rehearsalImage from '../assets/stage-pune-rehearsal.png'
import rolePanorama from '../assets/stage-role-panorama.png'

const roles = [
  { role: 'Artist', copy: 'Build a body of work that gets you seen.', path: '/register?role=artist', icon: 'feed' },
  { role: 'Casting director', copy: 'Find performers who fit the part.', path: '/register?role=casting', icon: 'castings' },
  { role: 'Theatre group', copy: 'Bring your productions and people together.', path: '/register?role=organization', icon: 'applications' },
  { role: 'Agency', copy: 'Represent talent with more context and trust.', path: '/register?role=agency', icon: 'search' },
]

export function PublicHomePage() {
  return <main className="public-page">
    <nav className="public-nav"><Link to="/" className="public-brand">stage<span>.</span></Link><div className="public-links"><a href="#why-stage">Why Stage</a><a href="#for-everyone">For artists</a><a href="#for-everyone">For organizations</a></div><div><Link className="public-login" to="/login">Log in</Link><Link to="/register"><StageButton>Join Stage</StageButton></Link></div></nav>
    <section className="public-hero"><img src={rehearsalImage} alt="Theatre performers rehearsing under stage lights"/><div className="public-hero-overlay"/><div className="public-hero-atmosphere" aria-hidden="true"><i/><i/><i/></div><div className="public-hero-copy"><p>THE HOME OF PUNE THEATRE</p><h1>Your next<br/><em>great scene</em><br/>starts here.</h1><span>A professional home for the people who make theatre happen - on stage, backstage, and everywhere in between.</span><div><Link to="/register?role=artist"><StageButton>Build your artist profile</StageButton></Link><Link className="public-text-link" to="/register?role=organization">I represent a group</Link></div></div><div className="public-hero-note"><b>2,400+</b><span>artists and theatre-makers<br/>coming together in Pune</span></div></section>
    <section className="public-marquee"><span>MAKE WORK</span><i>✦</i><span>FIND YOUR PEOPLE</span><i>✦</i><span>GET CREDIT</span><i>✦</i><span>KEEP GOING</span></section>
    <section className="public-intro" id="why-stage"><p>NOT ANOTHER SOCIAL NETWORK</p><h2>Stage turns the work<br/>you make into a career<br/>you can carry.</h2><div className="intro-story"><div className="intro-collage"><img src={rehearsalImage} alt="Theatre artists in rehearsal"/><div className="intro-credit"><b>18</b><span>verified<br/>credits</span><i>✓</i></div><div className="intro-playbill"><small>IN REHEARSAL</small><strong>The Last<br/>Monsoon</strong><span>Rangmanch Pune</span></div><div className="intro-orbit">WORK<br/>MADE<br/>VISIBLE</div></div><div className="intro-copy"><span>Every profile is a living playbill. Every production becomes a verified credit. Every connection can become the next collaboration.</span><Link to="/register">Step into Stage <b>→</b></Link></div></div></section>
    <section className="role-section" id="for-everyone"><div className="role-section-head"><p>MADE FOR THE PEOPLE WHO MAKE IT HAPPEN</p><h2>There is a role for<br/>everyone in the room.</h2></div><div className="public-role-grid">{roles.map((item, index) => <Link to={item.path} style={{ '--role-art': `url(${rolePanorama})`, '--role-position': `${index * 33.33}% center` }} className={`public-role public-role-${index}`} key={item.role}><StageIcon name={item.icon} size={22}/><span>0{index + 1}</span><h3>{item.role}</h3><p>{item.copy}</p><b>Explore <i>→</i></b></Link>)}</div></section>
    <section className="public-cta"><p>THE CURTAIN IS UP</p><h2>There is a place<br/>for your work.</h2><Link to="/register"><StageButton>Find your role on Stage</StageButton></Link></section>
    <footer className="public-footer"><Link to="/" className="public-brand">stage<span>.</span></Link><p>Made with respect for the people who make theatre.</p><div><a href="#why-stage">About</a><a href="#for-everyone">Community</a><Link to="/login">Log in</Link></div></footer>
  </main>
}
