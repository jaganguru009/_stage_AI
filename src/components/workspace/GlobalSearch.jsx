import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StageIcon } from '../stage/StageIcon'
import { StageAvatar } from '../stage/StageAvatar'
import { api, initials } from '../../lib/api'

function scrollToLater(id) {
  setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 320)
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) { setResults(null); setLoading(false); return undefined }
    setLoading(true)
    const timer = setTimeout(async () => {
      try { const data = await api('/search', { method: 'POST', body: { q: term } }); setResults(data) }
      catch { setResults({ people: [], posts: [], castings: [] }) }
      finally { setLoading(false) }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function onClickOutside(event) { if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function go(path, focusId) {
    setOpen(false); setQuery('')
    navigate(path)
    if (focusId) scrollToLater(focusId)
  }

  const term = query.trim()
  const hasQuery = term.length >= 2
  const empty = Boolean(results) && !results.people.length && !results.posts.length && !results.castings.length

  return <div className="global-search" ref={boxRef}>
    <div className="workspace-search"><StageIcon name="search" size={15}/><input value={query} onChange={event => { setQuery(event.target.value); setOpen(true) }} onFocus={() => setOpen(true)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }} placeholder="Search people, organizations, posts..." aria-label="Global search"/></div>
    {open && hasQuery && <div className="global-search-panel" role="listbox">
      {loading && <p className="global-search-status">Searching…</p>}
      {!loading && empty && <p className="global-search-status">No matches for "{term}".</p>}
      {!loading && results?.people.length > 0 && <div className="global-search-group"><p>PEOPLE &amp; ORGANIZATIONS</p>{results.people.map(person => <button type="button" key={person.id} onClick={() => go(`/search?person=${person.id}`)}><StageAvatar initials={initials(person.name)} src={person.photo} size="sm"/><span><b>{person.name}</b><small>{person.craft}{person.location ? ` · ${person.location}` : ''}</small></span></button>)}</div>}
      {!loading && results?.castings.length > 0 && <div className="global-search-group"><p>CASTING CALLS</p>{results.castings.map(item => <button type="button" key={item.id} onClick={() => go('/castings', `casting-${item.id}`)}><span className="global-search-mark">CC</span><span><b>{item.title}</b><small>{item.company}</small></span></button>)}</div>}
      {!loading && results?.posts.length > 0 && <div className="global-search-group"><p>POSTS</p>{results.posts.map(post => <button type="button" key={post.id} onClick={() => go(`/feed?community=${post.communityId}`, `post-${post.id}`)}><span className="global-search-mark">{initials(post.author)}</span><span><b>{post.author}</b><small>{post.snippet}</small></span></button>)}</div>}
    </div>}
  </div>
}
