import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { StageAvatar } from '../stage/StageAvatar'
import { StageButton } from '../stage/StageButton'
import { useApiData, initials, dateLabel } from '../../lib/api'
import { PageTitle, Empty, ErrorNotice, useWorkspace } from './shared'

export function Messages() {
  const { user, conversations, mutate, busy } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const recipientId = params.get('to') || conversations[0]?.id
  const { data, loading, error, reload } = useApiData(recipientId ? `/messages/${recipientId}` : null, 10000)
  const [message, setMessage] = useState('')
  async function send(event) {
    event.preventDefault()
    if (!message.trim() || !recipientId) return
    if (await mutate(`/messages/${recipientId}`, 'POST', { text: message })) { setMessage(''); await reload() }
  }
  return <div className="workspace-content messages-page"><PageTitle eyebrow="MESSAGES" title="Conversations that move the work." copy="Ask, plan, and keep the rehearsal room connected."/><ErrorNotice error={error} retry={reload}/><div className="messages-layout"><aside>{conversations.map(item => <button className={recipientId === item.id ? 'selected' : ''} onClick={() => { setParams({ to: item.id }); setMessage('') }} key={item.id}><StageAvatar initials={initials(item.name)} src={item.photo}/><div><b>{item.name}</b><span>{item.last}</span></div></button>)}{!conversations.length && <Empty>Start a conversation from an artist profile or an application.</Empty>}</aside><section className="message-thread">{loading ? <Empty>Loading conversation…</Empty> : data ? <><header><Link className="thread-recipient-link" to={`/search?person=${recipientId}`}><StageAvatar initials={initials(data.recipient.name)} src={data.recipient.photo}/><div><h3>{data.recipient.name}</h3><p>Messages refresh every 10 seconds</p></div></Link></header><div className="thread-body">{data.messages.map(item => <p className={item.sender_id === user.id ? 'outgoing' : 'incoming'} key={item.id}>{item.body}<small>{dateLabel(item.created_at)}</small></p>)}{!data.messages.length && <Empty>Say hello and start the conversation.</Empty>}</div><form onSubmit={send}><input aria-label="Your message" required maxLength={5000} value={message} onChange={event => setMessage(event.target.value)} placeholder={`Message ${data.recipient.name}...`}/><StageButton disabled={busy || !message.trim()} type="submit">Send</StageButton></form></> : <Empty>Select a conversation to get started.</Empty>}</section></div></div>
}

export function Notifications() {
  const { notifications, mutate, busy, reload } = useWorkspace()
  return <div className="workspace-content"><PageTitle eyebrow="NOTIFICATIONS" title="Stay close to the work." copy="Updates from your applications, messages, and community." action={<StageButton variant="secondary" onClick={reload}>Refresh</StageButton>}/><div className="notification-list">{notifications.map(item => <article className={item.is_read ? 'is-read' : ''} key={item.id}><span className="notice-icon">S</span><div><p><Link to={item.link}>{item.text}</Link></p><small>{dateLabel(item.created_at)}</small></div><button disabled={busy} onClick={() => mutate(`/notifications/${item.id}`, 'PATCH', { is_read: !item.is_read })}>{item.is_read ? 'Mark unread' : 'Mark read'}</button></article>)}{!notifications.length && <Empty>You’re all caught up. New activity will appear here.</Empty>}</div></div>
}
