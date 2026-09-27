import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { StageAvatar } from '../stage/StageAvatar'
import { StageButton } from '../stage/StageButton'
import { initials, dateLabel, useApiData } from '../../lib/api'
import { Empty, ErrorNotice, PageTitle, useWorkspace } from './shared'

export function Community() {
  const { profile, communities, mutate, busy, setError, error: mutationError } = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [comments, setComments] = useState({})
  const [expanded, setExpanded] = useState([])
  const [copied, setCopied] = useState(null)
  const active = communities.find(item => item.id === params.get('community') && item.joined) || communities.find(item => item.joined)
  const { data: posts, loading, error, reload } = useApiData(active ? `/communities/${active.id}/posts` : null, 15000)
  async function publish() {
    if (!draft.trim()) return
    if (await mutate(`/communities/${active.id}/posts`, 'POST', { text: draft })) { setDraft(''); reload() }
  }
  async function create(event) {
    event.preventDefault()
    const community = await mutate('/communities', 'POST', Object.fromEntries(new FormData(event.currentTarget)))
    if (community) { setParams({ community: community.id }); setShowCreate(false) }
  }
  async function join(id) { if (await mutate(`/communities/${id}/join`)) setParams({ community: id }) }
  async function comment(event, id) {
    event.preventDefault()
    if (await mutate(`/posts/${id}/comments`, 'POST', { text: comments[id] })) { setComments(current => ({ ...current, [id]: '' })); reload() }
  }
  async function applaud(post) { if (await mutate(`/posts/${post.id}/applause`, 'PUT', { applauded: !post.applauded })) reload() }
  async function share(post) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed?community=${active.id}#post-${post.id}`)
      setCopied(post.id)
    } catch { setError(new Error('Could not copy the link. You can copy this page’s address from your browser.')) }
  }
  return <div className="workspace-content feed-page"><PageTitle eyebrow="COMMUNITIES" title="The work between the work." copy="Join an open room — or create one for the people you need around the work." action={<button className="community-create" onClick={() => setShowCreate(true)}>Create community</button>}/><section className="community-rail">{communities.map(item => <article className={`community-card ${item.id === active?.id ? 'active' : ''}`} key={item.id}><button className="community-select" disabled={!item.joined} onClick={() => { setParams({ community: item.id }); setDraft('') }}><span className="community-mark maroon">{initials(item.name)}</span><div><b>{item.name}</b><small>{item.members} members</small></div></button><p>{item.description}</p>{item.joined ? <button className="community-state" onClick={() => setParams({ community: item.id })}>{item.id === active?.id ? 'In this room' : 'Open community'}</button> : <button className="community-join" disabled={busy} onClick={() => join(item.id)}>Join community</button>}</article>)}</section>{!communities.length && <Empty>No communities yet. Create the first room for your collaborators.</Empty>}{active ? <><section className="active-community"><span className="community-mark maroon">{initials(active.name)}</span><div><p>NOW IN</p><h2>{active.name}</h2></div><small>{active.members} members</small></section><section className="post-composer"><StageAvatar initials={profile.initials} src={profile.photo}/><textarea aria-label="New post" maxLength={5000} value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Share something with ${active.name}...`}/><StageButton disabled={busy || !draft.trim()} onClick={publish}>Publish</StageButton></section><ErrorNotice error={error} retry={reload}/>{loading && <Empty>Loading posts…</Empty>}<div className="post-stack">{(posts || []).map(post => <article className="social-post" id={`post-${post.id}`} key={post.id}><header><Link className="post-author-link" to={`/search?person=${post.author_id}`}><StageAvatar initials={initials(post.author)} src={post.author_photo}/><div><h3>{post.author}</h3><p>{post.craft} · {dateLabel(post.created_at)}</p></div></Link></header><p className="post-text">{post.body}</p><div className="post-canvas teal"><span>{active.name.toUpperCase()}</span><strong>From the rehearsal room</strong></div><footer><button disabled={busy} onClick={() => applaud(post)}>{post.applauded ? 'Applauded' : 'Applaud'} {post.likes}</button><button onClick={() => setExpanded(current => current.includes(post.id) ? current.filter(id => id !== post.id) : [...current, post.id])}>Comments {post.comments.length}</button><button onClick={() => share(post)}>{copied === post.id ? 'Link copied' : 'Share'}</button></footer>{expanded.includes(post.id) && <div className="comment-area">{post.comments.map(item => <p key={item.id}><Link className="comment-author-link" to={`/search?person=${item.author_id}`}><StageAvatar size="sm" initials={initials(item.author)} src={item.author_photo}/>{item.author}</Link> {item.body}</p>)}<form onSubmit={event => comment(event, post.id)}><input aria-label="Comment" required maxLength={2000} value={comments[post.id] || ''} onChange={event => setComments(current => ({ ...current, [post.id]: event.target.value }))} placeholder="Add a thoughtful comment…"/><button disabled={busy} type="submit">Post comment</button></form></div>}</article>)}</div>{!loading && posts?.length === 0 && <Empty>Start the conversation with the first post.</Empty>}</> : communities.length > 0 && <Empty>Join a community to read and publish posts.</Empty>}
    {showCreate && <div className="community-backdrop"><form className="community-form" onSubmit={create} role="dialog" aria-modal="true" aria-label="Create community"><header><div><p>START A COMMUNITY</p><h2>Make a room worth entering.</h2></div><button type="button" onClick={() => setShowCreate(false)}>Close</button></header><ErrorNotice error={mutationError}/><label>Community name<input name="name" required maxLength={100} placeholder="Pune Theatre Writers’ Room"/></label><label>What brings people together?<textarea name="description" required maxLength={1500} placeholder="Describe the practice or shared curiosity that belongs here."/></label><p className="stage-hint">Stage members can discover and join this community.</p><footer><button type="button" onClick={() => setShowCreate(false)}>Cancel</button><StageButton disabled={busy} type="submit">Create community</StageButton></footer></form></div>}
  </div>
}
