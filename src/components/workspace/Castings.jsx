import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { StageButton } from '../stage/StageButton'
import { StageAvatar } from '../stage/StageAvatar'
import { StageIcon } from '../stage/StageIcon'
import { PageTitle, Empty, ErrorNotice, useWorkspace } from './shared'
import { dateLabel, initials } from '../../lib/api'
import rehearsalImage from '../../assets/stage-pune-rehearsal.png'

function StreakBar() {
  const { profile, mutate, busy } = useWorkspace()
  return <section className="streak-bar"><div className="streak-count"><span className="streak-flame"><StageIcon name="flame" size={20}/></span><div><strong>{profile.streakCount}</strong><span>day{profile.streakCount === 1 ? '' : 's'} in a row</span></div></div><div className="streak-prompt"><p>TODAY'S PROMPT</p><span>{profile.todayPrompt}</span></div><StageButton variant={profile.checkedInToday ? 'secondary' : 'primary'} disabled={busy || profile.checkedInToday} onClick={() => mutate('/streak/checkin', 'POST')}>{profile.checkedInToday ? 'Checked in ✓' : 'Check in today'}</StageButton></section>
}

export function Dashboard() {
  const { user, profile, castings, applications } = useWorkspace()
  const auditions = applications.filter(item => item.status === 'shortlisted')
  const isArtist = user.role === 'artist'
  return <div className="workspace-content"><section className="rehearsal-hero"><img src={rehearsalImage} alt="Theatre artists rehearsing under warm stage lights"/><div className="rehearsal-hero-copy"><p>YOUR CREATIVE COMMUNITY</p><h1>Make room<br/>for the work.</h1><span>People, productions, and new possibilities.</span><Link to="/feed">Enter the community</Link></div><div className="rehearsal-stamp">PUNE<br/><i>THEATRE</i><br/>2026</div></section>{isArtist && <StreakBar/>}<PageTitle eyebrow="YOUR CREATIVE WORKSPACE" title={`Welcome, ${user.name.split(' ')[0]}.`} copy={`${castings.length} open opportunities · ${applications.length} applications`} action={<Link to="/profile"><StageButton>Edit profile</StageButton></Link>}/><section className="workspace-grid"><div className="workspace-panel audition-panel"><div className="panel-heading"><div><p>SHORTLISTED</p><h2>Your auditions</h2></div><Link to="/applications">All applications</Link></div>{auditions.length ? auditions.map(item => <article className="audition-row" key={item.id}><div><h3>{item.title}</h3><p>{item.company}</p></div><span>{dateLabel(item.audition_date)}</span><Link to={`/messages?to=${item.owner_id}`}>Confirm details</Link></article>) : <Empty>Your shortlisted applications will appear here. Confirm audition details with the casting team.</Empty>}</div><aside className="profile-status"><div className="credit-orbit"><strong>{profile.portfolio.length}</strong><span>portfolio<br/>credits</span></div><h3>Your work belongs here.</h3><p>{profile.availability}</p><Link to="/profile">Update your portfolio</Link></aside></section><section className="workspace-panel opportunity-panel"><div className="panel-heading"><div><p>OPEN OPPORTUNITIES</p><h2>Roles worth a look</h2></div><Link to="/castings">View all roles</Link></div><div className="role-grid">{castings.slice(0, 3).map(item => <article className="workspace-role" key={item.id}><span className="role-mark violet">ST</span><h3>{item.title}</h3><p>{item.company}</p><small>{item.craft} · {item.compensation}</small><Link to={`/castings#casting-${item.id}`}>Open</Link></article>)}</div>{!castings.length && <Empty>No casting calls yet. New opportunities will appear when organizations publish them.</Empty>}</section></div>
}

function CastingForm({ onClose }) {
  const { mutate, busy, error } = useWorkspace()
  async function submit(event) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget))
    if (await mutate('/castings', 'POST', body)) onClose()
  }
  return <div className="casting-modal-backdrop"><form className="casting-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-label="Create a casting call"><header><div><p>NEW CASTING CALL</p><h2>Invite the right people in.</h2></div><button type="button" onClick={onClose}>Close</button></header><ErrorNotice error={error}/><div className="casting-form-grid"><label className="full">Role title<input required name="title" maxLength={150} placeholder="Lead performer — new Marathi play"/></label><label>Primary craft<input required name="craft" maxLength={100} defaultValue="Actor"/></label><label>Audition format<select name="format"><option>In-person audition</option><option>Self tape</option><option>Open call</option></select></label><label>Audition date<input required name="date" type="date" min={new Date().toISOString().slice(0, 10)}/></label><label>Compensation<select name="compensation"><option>Paid</option><option>Honorarium</option><option>Volunteer / collaborative</option></select></label><label className="full">What are you looking for?<textarea required name="description" maxLength={5000} placeholder="The production, role, and what to bring to the audition."/></label></div><footer><span>Your call will be visible to Stage artists.</span><StageButton disabled={busy} type="submit">Publish casting call</StageButton></footer></form></div>
}

function CastingCards({ items }) {
  const { user, applications, mutate, busy } = useWorkspace()
  const isArtist = user.role === 'artist'
  return <><div className="casting-grid">{items.map(item => {
    const application = applications.find(entry => entry.casting_id === item.id && entry.artist_id === user.id)
    return <article className="casting-card" id={`casting-${item.id}`} key={item.id}><span className="role-mark violet">CC</span><p>{item.status.toUpperCase()} CASTING CALL</p><h2>{item.title}</h2><h3>{item.company}</h3><small>{item.craft} · {item.format}</small><p className="casting-description">{item.description}</p><div className="casting-tags"><span>Audition: {dateLabel(item.audition_date)}</span><span>{item.compensation}</span></div>{isArtist ? <StageButton disabled={busy || Boolean(application) || item.status !== 'open'} onClick={() => mutate(`/castings/${item.id}/applications`)}>{application ? `Application ${application.status}` : 'Apply now'}</StageButton> : <StageButton disabled={busy} variant="secondary" onClick={() => mutate(`/castings/${item.id}`, 'PATCH', { status: item.status === 'open' ? 'closed' : 'open' })}>{item.status === 'open' ? 'Close casting' : 'Reopen casting'}</StageButton>}</article>
  })}</div>{!items.length && <Empty>No casting calls to show yet.</Empty>}</>
}

export function Castings() {
  const { user, castings } = useWorkspace()
  const [composer, setComposer] = useState(false)
  const [term, setTerm] = useState('')
  const isArtist = user.role === 'artist'
  const items = castings.filter(item => (isArtist || item.owner_id === user.id) && `${item.title} ${item.craft} ${item.company}`.toLowerCase().includes(term.toLowerCase()))
  return <div className="workspace-content"><PageTitle eyebrow="CASTING CALLS" title={isArtist ? 'The right role can find you.' : 'Cast the work with care.'} copy={isArtist ? 'Explore roles and send your profile to a casting team.' : 'Publish opportunities and manage your open calls.'} action={!isArtist && <StageButton onClick={() => setComposer(true)}>Create casting call</StageButton>}/><div className="filter-bar"><input aria-label="Search casting calls" value={term} onChange={event => setTerm(event.target.value)} placeholder="Search roles, craft, or organization"/></div><CastingCards items={items}/>{composer && <CastingForm onClose={() => setComposer(false)}/>}</div>
}

function ApplicantList() {
  const { applications, mutate, busy } = useWorkspace()
  return <section className="workspace-panel talent-pipeline"><div className="panel-heading"><div><p>YOUR CASTINGS</p><h2>Talent pipeline</h2></div><Link to="/search">Discover talent</Link></div>{applications.map(item => <article className="live-applicant" key={item.id}><Link className="applicant-identity" to={`/search?person=${item.artist_id}`}><StageAvatar initials={initials(item.artist_name)} src={item.artist_photo}/><div><h3>{item.artist_name}</h3><p>{item.title} · {item.craft}</p></div></Link><div className="applicant-portfolio-note"><small>{item.portfolio.length} portfolio item{item.portfolio.length === 1 ? '' : 's'}</small>{item.portfolio.length > 0 && <details><summary>View portfolio</summary>{item.portfolio.map(work => { const meta = [work.role, work.year].filter(Boolean).join(' · '); return <p key={work.id}><b>{work.title}</b>{meta && ` · ${meta}`}{work.src && <a href={work.src} target="_blank" rel="noreferrer"> View photo</a>}</p> })}</details>}</div><label className="sr-only" htmlFor={`status-${item.id}`}>Application status for {item.artist_name}</label><select id={`status-${item.id}`} value={item.status} disabled={busy || item.status === 'withdrawn'} onChange={event => mutate(`/applications/${item.id}`, 'PATCH', { status: event.target.value })}><option value="applied" disabled>Applied</option><option value="review">Under review</option><option value="shortlisted">Shortlisted</option><option value="rejected">Not selected</option><option value="withdrawn" disabled>Withdrawn</option></select><Link to={`/messages?to=${item.artist_id}`}><StageButton variant="secondary">Message</StageButton></Link></article>)}{!applications.length && <Empty>Applications to your casting calls will appear here.</Empty>}</section>
}

export function Organization() {
  const { user, castings, applications } = useWorkspace()
  const [composer, setComposer] = useState(false)
  const owned = castings.filter(item => item.owner_id === user.id)
  return <div className="workspace-content organization-page"><PageTitle eyebrow="ORGANIZATION WORKSPACE" title={user.name} copy="Manage productions, discover talent, and make casting simple." action={<StageButton onClick={() => setComposer(true)}>Create casting call</StageButton>}/><div className="org-grid"><article><p>OPEN CASTINGS</p><strong>{owned.filter(item => item.status === 'open').length}</strong><span>Published by your account</span></article><article><p>APPLICATIONS</p><strong>{applications.length}</strong><span>Across your casting calls</span></article><article><p>SHORTLISTED</p><strong>{applications.filter(item => item.status === 'shortlisted').length}</strong><span>Ready for the next conversation</span></article></div><ApplicantList/><section className="published-calls"><h2>Your casting calls</h2><CastingCards items={owned}/></section>{composer && <CastingForm onClose={() => setComposer(false)}/>}</div>
}

export function Applications() {
  const { user, applications, mutate, busy } = useWorkspace()
  return <div className="workspace-content"><PageTitle eyebrow="YOUR APPLICATIONS" title="Keep your next role in view." copy="Track your application status and contact the casting team."/>{user.role !== 'artist' ? <ApplicantList/> : <div className="application-list">{applications.map(item => <article key={item.id}><span className={`status-dot ${item.status}`}/><div><h2>{item.title}</h2><p>{item.company} · Applied {dateLabel(item.created_at)}</p></div><b>{item.status}</b><Link to={`/messages?to=${item.owner_id}`}>Message</Link>{item.status !== 'withdrawn' && <button disabled={busy} onClick={() => mutate(`/applications/${item.id}`, 'PATCH', { status: 'withdrawn' })}>Withdraw</button>}</article>)}{!applications.length && <Empty>You haven’t applied to any roles yet. <Link to="/castings">Explore casting calls</Link>.</Empty>}</div>}</div>
}

function BookingRequestForm({ artist, onClose }) {
  const { mutate, busy, error } = useWorkspace()
  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = { artistId: artist.id, eventTitle: form.get('eventTitle'), eventDate: form.get('eventDate'), location: form.get('location'), budget: form.get('budget'), message: form.get('message') }
    if (await mutate('/bookings', 'POST', body)) onClose()
  }
  return <div className="casting-modal-backdrop" onClick={onClose}><form className="casting-modal" onClick={event => event.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label={`Request a booking with ${artist.name}`}><header><div><p>REQUEST A BOOKING</p><h2>Book {artist.name}</h2></div><button type="button" onClick={onClose}>Close</button></header><ErrorNotice error={error}/><div className="casting-form-grid"><label className="full">Event title<input required name="eventTitle" maxLength={150} placeholder="Wedding sangeet, corporate evening, festival slot..."/></label><label>Event date<input required name="eventDate" type="date" min={new Date().toISOString().slice(0, 10)}/></label><label>Budget<input name="budget" maxLength={60} placeholder="₹15,000"/></label><label className="full">Location<input required name="location" maxLength={150} placeholder="Venue and city"/></label><label className="full">Message<textarea name="message" maxLength={2000} placeholder="Tell them about the event and what you are looking for."/></label></div><footer><span>{artist.name} will be able to accept or decline this request from their Bookings tab.</span><StageButton disabled={busy} type="submit">Send booking request</StageButton></footer></form></div>
}

function PersonDetail({ person, onClose }) {
  const { user, mutate, busy } = useWorkspace()
  const [booking, setBooking] = useState(false)
  const isArtist = person.kind === 'artist'
  return <div className="artist-detail-backdrop" onClick={onClose}><div className="artist-detail" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={person.name}><button className="artist-detail-close" onClick={onClose} aria-label="Close">×</button><header><StageAvatar initials={initials(person.name)} src={person.photo} size="lg"/><div><h2>{person.name}</h2><p>{person.craft}{person.location ? ` · ${person.location}` : ''}</p>{isArtist && person.openToCollabs && <span className="collab-badge">Open to collabs</span>}</div></header><div className="artist-detail-stats">{isArtist ? <><b>{person.credits}<small>credits</small></b><b>{person.followers}<small>followers</small></b></> : <><b>{person.openCastings}<small>open castings</small></b><b>{person.followers}<small>followers</small></b></>}</div><p className="artist-detail-bio">{person.bio || 'This profile has not added a bio yet.'}</p>{isArtist && person.portfolio?.length > 0 && <div className="artist-detail-portfolio"><h3>Selected work</h3><ul>{person.portfolio.map(item => { const meta = [item.company, item.role, item.year].filter(Boolean).join(' · '); const thumb = item.media && item.media[0]; return <li key={item.id}>{thumb && <span className="portfolio-thumb">{thumb.type === 'video' ? <span className="thumb-video">▶</span> : <img src={thumb.src} alt=""/>}</span>}<div><b>{item.title}</b>{meta && <span>{meta}</span>}</div></li> })}</ul></div>}<footer><StageButton variant="secondary" disabled={busy} onClick={() => mutate(`/follows/${person.id}`, 'PUT', { following: !person.following })}>{person.following ? 'Following' : 'Follow'}</StageButton><Link to={`/messages?to=${person.id}`}><StageButton variant="secondary">Message</StageButton></Link>{isArtist && user.role !== 'artist' && <StageButton onClick={() => setBooking(true)}>Request booking</StageButton>}</footer>{booking && <BookingRequestForm artist={person} onClose={() => setBooking(false)}/>}</div></div>
}

const kindOptions = [['all', 'All'], ['artist', 'Artists'], ['organization', 'Organizations']]

export function Search() {
  const { people, mutate, busy } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [term, setTerm] = useState('')
  const [kind, setKind] = useState('all')
  const [collabOnly, setCollabOnly] = useState(false)
  const [active, setActive] = useState(null)
  useEffect(() => {
    const personId = params.get('person')
    if (!personId) return
    const match = people.find(item => item.id === personId)
    if (match) setActive(match)
  }, [params, people])
  function closeDetail() { setActive(null); setParams({}, { replace: true }) }
  function openDetail(person) { setActive(person); setParams({ person: person.id }) }
  const found = people.filter(person => (kind === 'all' || person.kind === kind) && `${person.name} ${person.craft} ${person.location}`.toLowerCase().includes(term.toLowerCase()) && (!collabOnly || person.openToCollabs))
  return <div className="workspace-content"><PageTitle eyebrow="DISCOVER" title="Find your next collaborator." copy="Search Stage for artists, casting desks, theatre groups, and agencies."/><div className="filter-bar"><input aria-label="Search" value={term} onChange={event => setTerm(event.target.value)} placeholder="Search by name, craft, or locality"/><div className="kind-toggle">{kindOptions.map(([value, label]) => <button type="button" key={value} className={kind === value ? 'active' : ''} onClick={() => setKind(value)}>{label}</button>)}</div>{kind !== 'organization' && <button type="button" className={`filter-chip ${collabOnly ? 'active' : ''}`} onClick={() => setCollabOnly(value => !value)}>Open to collabs</button>}</div><div className="artist-list">{found.map(person => <article className="artist-result" key={person.id}><StageAvatar initials={initials(person.name)} src={person.photo}/><div><h3><button type="button" className="link-reset" onClick={() => openDetail(person)}>{person.name}</button>{person.kind === 'artist' && person.openToCollabs && <span className="collab-dot" title="Open to collabs"/>}</h3><p>{person.craft}{person.location ? ` · ${person.location}` : ''}</p><small>{person.languages}</small></div><strong>{person.kind === 'artist' ? person.credits : person.openCastings}<small>{person.kind === 'artist' ? 'credits' : 'castings'}</small></strong><StageButton disabled={busy} variant="secondary" onClick={() => mutate(`/follows/${person.id}`, 'PUT', { following: !person.following })}>{person.following ? 'Following' : 'Follow'}</StageButton><Link to={`/messages?to=${person.id}`}>Message</Link></article>)}</div>{!found.length && <Empty>No matching profiles yet.</Empty>}{active && <PersonDetail person={active} onClose={closeDetail}/>}</div>
}
