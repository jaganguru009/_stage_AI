import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { StageAvatar } from '../components/stage/StageAvatar'
import { StageIcon } from '../components/stage/StageIcon'
import { navigation, organizationNavigation } from '../data/staticData'
import { api, useApiData } from '../lib/api'
import { WorkspaceContext, ErrorNotice } from '../components/workspace/shared'
import { Dashboard, Castings, Applications, Organization, Search } from '../components/workspace/Castings'
import { Profile, Settings } from '../components/workspace/Profile'
import { Community } from '../components/workspace/Community'
import { Messages, Notifications } from '../components/workspace/Messages'
import { Bookings } from '../components/workspace/Bookings'
import { GlobalSearch } from '../components/workspace/GlobalSearch'

export function WorkspacePage() {
  const { page = 'dashboard' } = useParams()
  const navigate = useNavigate()
  const { data, loading, error: loadError, reload } = useApiData('/workspace', 15000)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)
  useEffect(() => { if (loadError?.status === 401) navigate('/login', { replace: true }) }, [loadError, navigate])
  useEffect(() => { setError(null) }, [page])
  async function mutate(path, method = 'POST', body) {
    if (inFlight.current) return undefined
    inFlight.current = true; setBusy(true); setError(null)
    try { const result = await api(path, { method, body }); await reload(); return result }
    catch (failure) { setError(failure); if (failure.status === 401) navigate('/login', { replace: true }); return undefined }
    finally { inFlight.current = false; setBusy(false) }
  }
  async function logout() {
    if (busy) return
    setBusy(true)
    try { await api('/auth/logout', { method: 'POST' }); navigate('/login', { replace: true }) }
    catch (failure) { setError(failure) }
    finally { setBusy(false) }
  }
  if (loading) return <main className="stage-loading" role="status">Opening your workspace…</main>
  if (!data) return <main className="stage-loading"><ErrorNotice error={loadError} retry={reload}/><NavLink to="/login">Log in</NavLink></main>
  const { user, profile, notifications } = data
  const isArtist = user.role === 'artist'
  const items = isArtist ? navigation : [...organizationNavigation.slice(0, 3), ['feed', 'Community', 'feed'], ...organizationNavigation.slice(3)]
  const home = isArtist ? '/dashboard' : '/organization'
  const unreadForPath = path => notifications.filter(item => !item.is_read && item.link && item.link.split('?')[0] === `/${path}`).length
  const screens = { dashboard: isArtist ? <Dashboard/> : <Organization/>, organization: isArtist ? <Dashboard/> : <Organization/>, profile: <Profile/>, feed: <Community/>, search: <Search/>, castings: <Castings/>, applications: <Applications/>, bookings: <Bookings/>, messages: <Messages/>, notifications: <Notifications/>, settings: <Settings/> }
  return <WorkspaceContext.Provider value={{ ...data, busy, mutate, reload, setError, error: error || loadError }}><div className="workspace"><aside className="workspace-sidebar"><NavLink to={home} className="workspace-brand">stage<span>.</span></NavLink><NavLink to="/profile" className="profile-mini"><StageAvatar initials={profile.initials} src={profile.photo}/><div><strong>{user.name}</strong><small>{isArtist ? 'Artist account' : `${user.role} account`}</small></div><span className="chevron">v</span></NavLink><nav className="workspace-nav">{items.map(([path, label, icon]) => { const unread = unreadForPath(path); return <NavLink key={path} to={`/${path}`} className={({ isActive }) => `workspace-nav-item ${isActive ? 'active' : ''}`}><StageIcon name={icon}/>{label}{unread > 0 && <b>{unread > 9 ? '9+' : unread}</b>}</NavLink> })}</nav><div className="sidebar-bottom"><NavLink to="/settings">Preferences</NavLink><button className="logout-link" disabled={busy} onClick={logout}>Log out</button></div></aside>
    <div className="workspace-main"><header className="workspace-topbar"><GlobalSearch/><div className="topbar-actions"><NavLink to="/notifications" aria-label="Notifications"><StageIcon name="notifications" size={17}/>{notifications.some(item => !item.is_read) && <em/>}</NavLink><NavLink to="/profile"><StageAvatar initials={profile.initials} src={profile.photo} size="sm"/></NavLink></div></header><div className="workspace-feedback"><ErrorNotice error={error || loadError} retry={loadError ? reload : undefined}/>{busy && <span role="status">Saving…</span>}</div><div key={page}>{screens[page] || <Dashboard/>}</div></div>
  </div></WorkspaceContext.Provider>
}
