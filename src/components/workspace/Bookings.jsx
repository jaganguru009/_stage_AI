import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StageButton } from '../stage/StageButton'
import { PageTitle, Empty, ErrorNotice, useWorkspace } from './shared'
import { dateLabel } from '../../lib/api'

const tabs = ['All', 'Pending', 'Accepted', 'Completed']

function statusLabel(status) {
  return { PENDING: 'Pending', ACCEPTED: 'Accepted', DECLINED: 'Declined', CANCELLED: 'Cancelled', COMPLETED: 'Completed' }[status] || status
}

export function Bookings() {
  const { user, bookings, mutate, busy, error } = useWorkspace()
  const [tab, setTab] = useState('All')
  const isArtist = user.role === 'artist'
  const items = bookings.filter(item => tab === 'All' || statusLabel(item.status) === tab)
  return <div className="workspace-content bookings-page">
    <PageTitle eyebrow="BOOKINGS" title={isArtist ? 'The work that pays.' : 'Your booking requests.'} copy={isArtist ? 'Review requests, confirm dates, and keep your calendar current.' : 'Track every request you have sent to artists on Stage.'}/>
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
      </footer>
    </article>)}</div>
    {!items.length && <Empty>{tab === 'All' ? (isArtist ? 'No booking requests yet. They will land here the moment a client reaches out.' : 'You haven’t requested any bookings yet. Find an artist under Discover talent.') : `No ${tab.toLowerCase()} bookings.`}</Empty>}
  </div>
}
