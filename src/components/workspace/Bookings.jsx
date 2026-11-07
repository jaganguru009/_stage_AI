import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StageButton } from '../stage/StageButton'
import { PageTitle, Empty, ErrorNotice, useWorkspace } from './shared'
import { dateLabel } from '../../lib/api'
import { BookingRequestForm, castingOptionsForArtist } from './Castings'

const tabs = ['All', 'Pending', 'Accepted', 'Completed']

function statusLabel(status) {
  return { PENDING: 'Pending', ACCEPTED: 'Accepted', DECLINED: 'Declined', CANCELLED: 'Cancelled', COMPLETED: 'Completed' }[status] || status
}

// Lets a non-artist account start a booking request "with respect to the
// applied casting": pick one of the applications to your own casting calls
// (which pins down both the artist and the casting) and hand off straight
// into BookingRequestForm, pre-filled and still able to switch to a
// different casting that same artist applied to.
function BookingComposer({ onClose }) {
  const { applications, castings } = useWorkspace()
  const [selectedId, setSelectedId] = useState('')
  const application = applications.find(item => item.id === selectedId)
  if (application) {
    return <BookingRequestForm artist={{ id: application.artist_id, name: application.artist_name }} castingOptions={castingOptionsForArtist(application.artist_id, applications, castings)} initialCastingId={application.casting_id} onClose={onClose}/>
  }
  return <div className="casting-modal-backdrop" onClick={onClose}><form className="casting-modal" onClick={event => event.stopPropagation()} onSubmit={event => event.preventDefault()} role="dialog" aria-modal="true" aria-label="Request a booking">
    <header><div><p>REQUEST A BOOKING</p><h2>Who are you booking?</h2></div><button type="button" onClick={onClose}>Close</button></header>
    {applications.length
      ? <div className="casting-form-grid"><label className="full">Choose an applicant<select autoFocus value={selectedId} onChange={event => setSelectedId(event.target.value)}><option value="">Select an application…</option>{applications.map(item => <option key={item.id} value={item.id}>{item.artist_name} — {item.title} ({item.status})</option>)}</select></label></div>
      : <Empty>No one has applied to your casting calls yet. Find an artist under Discover talent instead.</Empty>}
  </form></div>
}

// Posted once a booking is COMPLETED, by either party, about the other
// party. The unique (booking, author) index on the backend is the real
// guard against a double submission — `reviewed` on the booking just lets
// the UI hide the button without a round trip.
function ReviewForm({ booking, subjectName, onClose }) {
  const { mutate, busy, error } = useWorkspace()
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (await mutate(`/bookings/${booking.id}/review`, 'POST', { rating, body })) onClose()
  }
  return <div className="casting-modal-backdrop" onClick={onClose}><form className="casting-modal" onClick={event => event.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label={`Review ${subjectName}`}><header><div><p>LEAVE A REVIEW</p><h2>How was working with {subjectName}?</h2></div><button type="button" onClick={onClose}>Close</button></header><ErrorNotice error={error}/><div className="casting-form-grid"><label className="full">Rating<select value={rating} onChange={event => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>)}</select></label><label className="full">Review (optional)<textarea maxLength={1000} placeholder="Share a few words about the experience." value={body} onChange={event => setBody(event.target.value)}/></label></div><footer><span>Visible on {subjectName}'s profile.</span><StageButton disabled={busy} type="submit">Submit review</StageButton></footer></form></div>
}

export function Bookings() {
  const { user, bookings, mutate, busy, error } = useWorkspace()
  const [tab, setTab] = useState('All')
  const [composing, setComposing] = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const isArtist = user.role === 'artist'
  const items = bookings.filter(item => tab === 'All' || statusLabel(item.status) === tab)
  return <div className="workspace-content bookings-page">
    <PageTitle eyebrow="BOOKINGS" title={isArtist ? 'The work that pays.' : 'Your booking requests.'} copy={isArtist ? 'Review requests, confirm dates, and keep your calendar current.' : 'Track every request you have sent to artists on Stage.'} action={!isArtist && <StageButton onClick={() => setComposing(true)}>Request booking</StageButton>}/>
    <ErrorNotice error={error}/>
    <div className="booking-tabs">{tabs.map(item => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>
    <div className="booking-list">{items.map(item => <article className="booking-card" key={item.id}>
      <div className={`booking-status booking-status-${item.status.toLowerCase()}`}>{statusLabel(item.status)}</div>
      <h2>{item.eventTitle}</h2>
      <div className="booking-meta">
        <span><b>{isArtist ? 'Client' : 'Artist'}</b>{isArtist ? item.clientName : item.artistName}</span>
        <span><b>Date</b>{dateLabel(item.eventDate)}</span>
        <span><b>Location</b>{item.location}</span>
        <span><b>Budget</b>{item.budget}</span>
      </div>
      {item.message && <p className="booking-message">"{item.message}"</p>}
      <footer>
        <Link to={`/messages?to=${isArtist ? item.clientId : item.artistId}`}><StageButton variant="secondary">Message {isArtist ? 'client' : 'artist'}</StageButton></Link>
        {isArtist && item.status === 'PENDING' && <><StageButton disabled={busy} onClick={() => mutate(`/bookings/${item.id}`, 'PATCH', { status: 'ACCEPTED' })}>Accept</StageButton><StageButton disabled={busy} variant="secondary" onClick={() => mutate(`/bookings/${item.id}`, 'PATCH', { status: 'DECLINED' })}>Decline</StageButton></>}
        {isArtist && item.status === 'ACCEPTED' && <StageButton disabled={busy} onClick={() => mutate(`/bookings/${item.id}`, 'PATCH', { status: 'COMPLETED' })}>Mark completed</StageButton>}
        {!isArtist && item.status === 'PENDING' && <StageButton disabled={busy} variant="secondary" onClick={() => mutate(`/bookings/${item.id}`, 'PATCH', { status: 'CANCELLED' })}>Cancel request</StageButton>}
        {item.status === 'COMPLETED' && !item.reviewed && <StageButton disabled={busy} variant="secondary" onClick={() => setReviewing(item)}>Leave a review</StageButton>}
        {item.status === 'COMPLETED' && item.reviewed && <span className="review-done-note">Review submitted</span>}
      </footer>
    </article>)}</div>
    {!items.length && <Empty>{tab === 'All' ? (isArtist ? 'No booking requests yet. They will land here the moment a client reaches out.' : 'You haven’t requested any bookings yet. Find an artist under Discover talent.') : `No ${tab.toLowerCase()} bookings.`}</Empty>}
    {composing && <BookingComposer onClose={() => setComposing(false)}/>}
    {reviewing && <ReviewForm booking={reviewing} subjectName={isArtist ? reviewing.clientName : reviewing.artistName} onClose={() => setReviewing(null)}/>}
  </div>
}
