// A fully client-side "backend": every screen in this app reads and writes
// through the functions below instead of calling a network API. State is
// kept in memory and mirrored to localStorage, so it behaves like a real
// app (data persists across reloads) without needing a server anywhere.
import { buildSeed, dailyPrompts } from '../data/mockData'

const DB_KEY = 'stageai_db_v2' // v2: portfolio items moved from a single src/type to a media[] array
const SESSION_KEY = 'stageai_session_v1'
const NETWORK_DELAY = [180, 420] // ms, purely cosmetic so loading states feel real

function loadDb() {
  try {
    const raw = window.localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* fall through to reseed */ }
  const seed = buildSeed()
  persist(seed)
  return seed
}

function persist(db) {
  try { window.localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch { /* storage unavailable — demo still works in-memory for this tab */ }
}

let db = loadDb()
function save() { persist(db) }

function getSessionId() {
  try { return window.localStorage.getItem(SESSION_KEY) } catch { return null }
}
function setSessionId(id) {
  try { id ? window.localStorage.setItem(SESSION_KEY, id) : window.localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
}

function apiError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function requireUser() {
  const id = getSessionId()
  const user = db.users.find(u => u.id === id)
  if (!user) throw apiError(401, 'Please log in to continue.')
  return user
}

function findUser(id) { return db.users.find(u => u.id === id) }

const wordInitials = name => (name || '').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()

function startOfDay(date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d.getTime() }

function reconcileStreak(user) {
  if (user.role !== 'artist') return
  if (!user.lastActivityDate) { user.streakCount = 0; return }
  const diffDays = Math.round((startOfDay(Date.now()) - startOfDay(user.lastActivityDate)) / 86400000)
  if (diffDays > 1) user.streakCount = 0
}

function checkIn(user) {
  if (user.role !== 'artist') return false
  const todayStart = startOfDay(Date.now())
  const lastStart = user.lastActivityDate ? startOfDay(user.lastActivityDate) : null
  if (lastStart === todayStart) return false
  const wasYesterday = lastStart === todayStart - 86400000
  user.streakCount = wasYesterday ? (user.streakCount || 0) + 1 : 1
  user.lastActivityDate = new Date().toISOString()
  return true
}

function todaysPrompt() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start) / 86400000)
  return dailyPrompts[dayOfYear % dailyPrompts.length]
}

function buildProfile(user) {
  reconcileStreak(user)
  return {
    name: user.name, craft: user.craft, location: user.location, languages: user.languages,
    availability: user.availability, bio: user.bio || '', photo: user.photo || '',
    portfolio: user.portfolio || [], followers: user.followers || 0, following: user.following || 0,
    initials: wordInitials(user.name), visibility: user.visibility, opportunity_alerts: user.opportunity_alerts,
    community_alerts: user.community_alerts, openToCollabs: Boolean(user.openToCollabs),
    streakCount: user.streakCount || 0, todayPrompt: todaysPrompt(),
    checkedInToday: user.lastActivityDate ? startOfDay(user.lastActivityDate) === startOfDay(Date.now()) : false,
  }
}

function publicUser(user) { return { id: user.id, role: user.role, name: user.name, email: user.email } }

function notify(userId, type, text, link) {
  if (!db.notifications[userId]) db.notifications[userId] = []
  db.notifications[userId].unshift({ id: crypto.randomUUID(), type, text, link, is_read: false, created_at: new Date().toISOString() })
}

function findPost(id) {
  for (const communityId of Object.keys(db.posts)) {
    const post = db.posts[communityId].find(p => p.id === id)
    if (post) return post
  }
  return null
}

// Every other account on Stage — fellow artists as well as casting desks,
// theatre groups, and agencies — so search and discovery are not limited
// to artists alone.
function buildDirectory(user) {
  return db.users.filter(u => u.id !== user.id).map(u => {
    const kind = u.role === 'artist' ? 'artist' : 'organization'
    const base = {
      id: u.id, name: u.name, kind, craft: u.craft, location: u.location, languages: u.languages,
      photo: u.photo || '', bio: u.bio || '', followers: u.followers || 0,
      following: (user.followingIds || []).includes(u.id),
    }
    if (kind === 'artist') return { ...base, openToCollabs: Boolean(u.openToCollabs), credits: (u.portfolio || []).length, portfolio: u.portfolio || [] }
    return { ...base, openCastings: db.castings.filter(c => c.owner_id === u.id && c.status === 'open').length }
  })
}

function buildWorkspace(user) {
  const isArtist = user.role === 'artist'
  const applications = db.applications.filter(item => isArtist ? item.artist_id === user.id : item.owner_id === user.id)
  const people = buildDirectory(user)
  const communities = db.communities.map(c => ({ ...c, members: c.memberIds.length, joined: c.memberIds.includes(user.id) }))
  const otherIds = new Set()
  db.messages.forEach(m => { if (m.sender_id === user.id) otherIds.add(m.recipient_id); if (m.recipient_id === user.id) otherIds.add(m.sender_id) })
  const conversations = [...otherIds].map(id => {
    const thread = db.messages.filter(m => (m.sender_id === user.id && m.recipient_id === id) || (m.sender_id === id && m.recipient_id === user.id))
    const last = thread[thread.length - 1]
    const other = findUser(id)
    return { id, name: other ? other.name : 'Former member', last: last ? last.body : '', at: last ? last.created_at : '' }
  }).sort((a, b) => new Date(b.at) - new Date(a.at))
  const bookings = db.bookings.filter(item => isArtist ? item.artistId === user.id : item.clientId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return {
    user: publicUser(user), profile: buildProfile(user),
    notifications: (db.notifications[user.id] || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    castings: db.castings.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    applications, people, communities, conversations, bookings,
  }
}

const routes = [
  { method: 'POST', pattern: '/auth/login', handler: (params, body) => {
    const email = (body.email || '').trim().toLowerCase()
    const user = db.users.find(u => u.email.toLowerCase() === email)
    if (!user) throw apiError(401, 'No Stage account found with that email. Try a demo account below, or sign up.')
    if (user.password !== body.password) throw apiError(401, 'Incorrect password. Demo accounts use "password123".')
    setSessionId(user.id)
    return { user: publicUser(user) }
  } },
  { method: 'POST', pattern: '/auth/register', handler: (params, body) => {
    const email = (body.email || '').trim().toLowerCase()
    if (!email || !body.password || !body.name) throw apiError(400, 'Please fill in every field.')
    if (db.users.some(u => u.email.toLowerCase() === email)) throw apiError(400, 'An account with that email already exists. Try logging in instead.')
    const role = ['artist', 'casting', 'organization', 'agency'].includes(body.role) ? body.role : 'artist'
    const user = {
      id: crypto.randomUUID(), role, name: body.name.trim(), email, password: body.password,
      craft: body.discipline || (role === 'artist' ? 'Actor' : 'Organization'), location: '', languages: '',
      availability: role === 'artist' ? 'Open to new work' : 'New on Stage', bio: '', photo: '',
      followers: 0, following: 0, streakCount: 0, lastActivityDate: null, openToCollabs: false,
      visibility: 'public', opportunity_alerts: true, community_alerts: true,
      followingIds: [], joinedCommunityIds: [], portfolio: [],
    }
    db.users.push(user)
    db.notifications[user.id] = []
    setSessionId(user.id)
    save()
    return { user: publicUser(user) }
  } },
  { method: 'POST', pattern: '/auth/logout', handler: () => { setSessionId(null); return { ok: true } } },

  { method: 'GET', pattern: '/workspace', handler: () => { const user = requireUser(); const payload = buildWorkspace(user); save(); return payload } },

  { method: 'POST', pattern: '/search', handler: (params, body) => {
    const user = requireUser()
    const q = (body.q || '').trim().toLowerCase()
    if (q.length < 2) return { people: [], posts: [], castings: [] }
    const people = buildDirectory(user).filter(p => `${p.name} ${p.craft} ${p.location}`.toLowerCase().includes(q)).slice(0, 5)
    const myCommunityIds = db.communities.filter(c => c.memberIds.includes(user.id)).map(c => c.id)
    const posts = []
    myCommunityIds.forEach(communityId => {
      const community = db.communities.find(c => c.id === communityId)
      ;(db.posts[communityId] || []).forEach(post => {
        if (post.body.toLowerCase().includes(q) || post.author.toLowerCase().includes(q)) {
          posts.push({ id: post.id, communityId, communityName: community ? community.name : '', author: post.author, snippet: post.body.length > 90 ? `${post.body.slice(0, 90)}…` : post.body, created_at: post.created_at })
        }
      })
    })
    const castings = db.castings.filter(c => `${c.title} ${c.craft} ${c.company}`.toLowerCase().includes(q)).slice(0, 5).map(c => ({ id: c.id, title: c.title, company: c.company, craft: c.craft, status: c.status }))
    return { people, posts: posts.slice(0, 5), castings }
  } },

  { method: 'PUT', pattern: '/profile', handler: (params, body) => {
    const user = requireUser()
    const allowed = ['name', 'craft', 'location', 'languages', 'availability', 'bio', 'photo', 'portfolio']
    allowed.forEach(key => { if (body[key] !== undefined) user[key] = body[key] })
    save()
    return buildProfile(user)
  } },
  { method: 'PUT', pattern: '/settings', handler: (params, body) => {
    const user = requireUser()
    ;['visibility', 'opportunity_alerts', 'community_alerts', 'openToCollabs'].forEach(key => { if (body[key] !== undefined) user[key] = body[key] })
    save()
    return buildProfile(user)
  } },
  { method: 'POST', pattern: '/streak/checkin', handler: () => {
    const user = requireUser()
    if (user.role !== 'artist') throw apiError(403, 'Only artist accounts keep a streak.')
    if (!checkIn(user)) throw apiError(400, 'You already checked in today. Come back tomorrow.')
    save()
    return buildProfile(user)
  } },

  { method: 'POST', pattern: '/castings', handler: (params, body) => {
    const user = requireUser()
    if (user.role === 'artist') throw apiError(403, 'Only organizations, casting desks, and agencies can publish casting calls.')
    if (!body.title || !body.description || !body.date) throw apiError(400, 'Please fill in the required fields.')
    const casting = { id: crypto.randomUUID(), owner_id: user.id, title: body.title, craft: body.craft || 'Any', company: user.name, format: body.format || 'In-person audition', audition_date: body.date, compensation: body.compensation || 'Paid', status: 'open', description: body.description, created_at: new Date().toISOString() }
    db.castings.push(casting)
    save()
    return casting
  } },
  { method: 'PATCH', pattern: '/castings/:id', handler: (params, body) => {
    const user = requireUser()
    const casting = db.castings.find(c => c.id === params.id)
    if (!casting) throw apiError(404, 'This casting call no longer exists.')
    if (casting.owner_id !== user.id) throw apiError(403, 'You can only manage your own casting calls.')
    if (body.status) casting.status = body.status
    save()
    return casting
  } },
  { method: 'POST', pattern: '/castings/:id/applications', handler: (params) => {
    const user = requireUser()
    if (user.role !== 'artist') throw apiError(403, 'Only artist accounts can apply to casting calls.')
    const casting = db.castings.find(c => c.id === params.id)
    if (!casting) throw apiError(404, 'This casting call no longer exists.')
    if (casting.status !== 'open') throw apiError(400, 'This casting call is closed.')
    if (db.applications.some(a => a.casting_id === casting.id && a.artist_id === user.id)) throw apiError(400, 'You have already applied to this role.')
    const application = { id: crypto.randomUUID(), casting_id: casting.id, owner_id: casting.owner_id, artist_id: user.id, artist_name: user.name, title: casting.title, company: casting.company, craft: casting.craft, audition_date: casting.audition_date, status: 'applied', created_at: new Date().toISOString(), portfolio: (user.portfolio || []).slice(0, 3).map(p => ({ id: p.id, title: p.title, role: p.role, year: p.year, src: p.media && p.media[0] ? p.media[0].src : '' })) }
    db.applications.push(application)
    notify(casting.owner_id, 'NEW_APPLICATION', `${user.name} applied to "${casting.title}"`, '/applications')
    save()
    return application
  } },
  { method: 'PATCH', pattern: '/applications/:id', handler: (params, body) => {
    const user = requireUser()
    const application = db.applications.find(a => a.id === params.id)
    if (!application) throw apiError(404, 'This application no longer exists.')
    if (body.status === 'withdrawn') {
      if (application.artist_id !== user.id) throw apiError(403, 'You can only withdraw your own application.')
    } else if (application.owner_id !== user.id) {
      throw apiError(403, 'You can only review applications to your own casting calls.')
    }
    application.status = body.status
    if (body.status !== 'withdrawn') notify(application.artist_id, 'BOOKING_STATUS', `Your application for "${application.title}" is now ${body.status}`, '/applications')
    save()
    return application
  } },

  { method: 'PUT', pattern: '/follows/:id', handler: (params, body) => {
    const user = requireUser()
    const target = findUser(params.id)
    if (!target) throw apiError(404, 'This profile no longer exists.')
    user.followingIds = user.followingIds || []
    const already = user.followingIds.includes(params.id)
    if (body.following && !already) { user.followingIds.push(params.id); target.followers = (target.followers || 0) + 1 }
    else if (!body.following && already) { user.followingIds = user.followingIds.filter(id => id !== params.id); target.followers = Math.max(0, (target.followers || 0) - 1) }
    save()
    return { following: user.followingIds.includes(params.id) }
  } },

  { method: 'GET', pattern: '/messages/:id', handler: (params) => {
    const user = requireUser()
    const recipient = findUser(params.id)
    if (!recipient) throw apiError(404, 'This person is no longer on Stage.')
    const messages = db.messages.filter(m => (m.sender_id === user.id && m.recipient_id === params.id) || (m.sender_id === params.id && m.recipient_id === user.id)).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return { recipient: { id: recipient.id, name: recipient.name }, messages }
  } },
  { method: 'POST', pattern: '/messages/:id', handler: (params, body) => {
    const user = requireUser()
    const recipient = findUser(params.id)
    if (!recipient) throw apiError(404, 'This person is no longer on Stage.')
    if (!body.text || !body.text.trim()) throw apiError(400, 'Message cannot be empty.')
    const message = { id: crypto.randomUUID(), sender_id: user.id, recipient_id: params.id, body: body.text.trim(), created_at: new Date().toISOString() }
    db.messages.push(message)
    notify(params.id, 'NEW_MESSAGE', `${user.name} sent you a message`, `/messages?to=${user.id}`)
    save()
    return message
  } },

  { method: 'GET', pattern: '/communities/:id/posts', handler: (params) => {
    const user = requireUser()
    const posts = (db.posts[params.id] || []).map(p => ({ ...p, applauded: (p.applaudedBy || []).includes(user.id) }))
    return posts.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } },
  { method: 'POST', pattern: '/communities/:id/posts', handler: (params, body) => {
    const user = requireUser()
    const community = db.communities.find(c => c.id === params.id)
    if (!community || !community.memberIds.includes(user.id)) throw apiError(403, 'Join this community to post.')
    if (!body.text || !body.text.trim()) throw apiError(400, 'Post cannot be empty.')
    const post = { id: crypto.randomUUID(), community_id: params.id, author: user.name, craft: user.craft, body: body.text.trim(), likes: 0, applaudedBy: [], comments: [], created_at: new Date().toISOString() }
    if (!db.posts[params.id]) db.posts[params.id] = []
    db.posts[params.id].push(post)
    checkIn(user)
    save()
    return post
  } },
  { method: 'POST', pattern: '/communities', handler: (params, body) => {
    const user = requireUser()
    if (!body.name || !body.description) throw apiError(400, 'Please fill in every field.')
    const community = { id: crypto.randomUUID(), name: body.name, description: body.description, memberIds: [user.id] }
    db.communities.push(community)
    db.posts[community.id] = []
    user.joinedCommunityIds = [...(user.joinedCommunityIds || []), community.id]
    save()
    return { ...community, members: 1, joined: true }
  } },
  { method: 'POST', pattern: '/communities/:id/join', handler: (params) => {
    const user = requireUser()
    const community = db.communities.find(c => c.id === params.id)
    if (!community) throw apiError(404, 'This community no longer exists.')
    if (!community.memberIds.includes(user.id)) { community.memberIds.push(user.id); user.joinedCommunityIds = [...(user.joinedCommunityIds || []), community.id] }
    save()
    return { ...community, members: community.memberIds.length, joined: true }
  } },
  { method: 'PUT', pattern: '/posts/:id/applause', handler: (params, body) => {
    const user = requireUser()
    const post = findPost(params.id)
    if (!post) throw apiError(404, 'This post no longer exists.')
    post.applaudedBy = post.applaudedBy || []
    const already = post.applaudedBy.includes(user.id)
    if (body.applauded && !already) post.applaudedBy.push(user.id)
    else if (!body.applauded && already) post.applaudedBy = post.applaudedBy.filter(id => id !== user.id)
    post.likes = post.applaudedBy.length
    save()
    return post
  } },
  { method: 'POST', pattern: '/posts/:id/comments', handler: (params, body) => {
    const user = requireUser()
    const post = findPost(params.id)
    if (!post) throw apiError(404, 'This post no longer exists.')
    if (!body.text || !body.text.trim()) throw apiError(400, 'Comment cannot be empty.')
    post.comments.push({ id: crypto.randomUUID(), author: user.name, body: body.text.trim() })
    save()
    return post
  } },

  { method: 'PATCH', pattern: '/notifications/:id', handler: (params, body) => {
    const user = requireUser()
    const list = db.notifications[user.id] || []
    const item = list.find(n => n.id === params.id)
    if (!item) throw apiError(404, 'This notification no longer exists.')
    item.is_read = Boolean(body.is_read)
    save()
    return item
  } },

  { method: 'POST', pattern: '/bookings', handler: (params, body) => {
    const user = requireUser()
    if (user.role === 'artist') throw apiError(403, 'Only clients (casting desks, theatre groups, and agencies) can request a booking.')
    const artist = findUser(body.artistId)
    if (!artist || artist.role !== 'artist') throw apiError(404, 'This artist is no longer on Stage.')
    if (!body.eventTitle || !body.eventDate || !body.location) throw apiError(400, 'Please fill in the required fields.')
    const booking = { id: crypto.randomUUID(), artistId: artist.id, artistName: artist.name, clientId: user.id, clientName: user.name, eventTitle: body.eventTitle, eventDate: body.eventDate, location: body.location, budget: body.budget || 'Not specified', message: body.message || '', status: 'PENDING', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    db.bookings.push(booking)
    notify(artist.id, 'NEW_BOOKING', `${user.name} sent you a booking request for "${booking.eventTitle}"`, '/bookings')
    save()
    return booking
  } },
  { method: 'PATCH', pattern: '/bookings/:id', handler: (params, body) => {
    const user = requireUser()
    const booking = db.bookings.find(b => b.id === params.id)
    if (!booking) throw apiError(404, 'This booking no longer exists.')
    const next = body.status
    const isArtist = user.id === booking.artistId
    const isClient = user.id === booking.clientId
    if (!isArtist && !isClient) throw apiError(403, 'You are not part of this booking.')
    const allowed = isArtist
      ? { PENDING: ['ACCEPTED', 'DECLINED'], ACCEPTED: ['COMPLETED'] }
      : { PENDING: ['CANCELLED'] }
    if (!allowed[booking.status] || !allowed[booking.status].includes(next)) throw apiError(400, `You can't change this booking from ${booking.status} to ${next}.`)
    booking.status = next
    booking.updatedAt = new Date().toISOString()
    const otherId = isArtist ? booking.clientId : booking.artistId
    notify(otherId, 'BOOKING_STATUS', `"${booking.eventTitle}" is now ${next.toLowerCase()}`, '/bookings')
    save()
    return booking
  } },
]

function wait() { const [min, max] = NETWORK_DELAY; return new Promise(resolve => setTimeout(resolve, min + Math.random() * (max - min))) }

export async function callMockApi(path, method, body) {
  await wait()
  const cleanPath = path.split('?')[0]
  for (const route of routes) {
    if (route.method !== method) continue
    const params = matchPath(route.pattern, cleanPath)
    if (params) return route.handler(params, body || {})
  }
  throw apiError(404, 'Unknown request.')
}

function matchPath(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
    else if (patternParts[i] !== pathParts[i]) return null
  }
  return params
}

export function resetMockDatabase() {
  db = buildSeed()
  persist(db)
  setSessionId(null)
}
