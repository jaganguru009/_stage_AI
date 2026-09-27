import { useState } from 'react'
import { StageButton } from '../stage/StageButton'
import { StageIcon } from '../stage/StageIcon'
import { PageTitle, Empty, useWorkspace, ErrorNotice } from './shared'
import { readImage, readImages } from '../../lib/api'

function emptyWork() { return { id: crypto.randomUUID(), title: '', company: '', role: '', year: '', description: '', media: [] } }
const metaLine = item => [item.company, item.role, item.year].filter(Boolean).join(' · ')

function PortfolioMedia({ media, title }) {
  const [active, setActive] = useState(0)
  if (!media || !media.length) return <div className="portfolio-media portfolio-media-empty"><StageIcon name="feed" size={22}/><span>No photos added yet</span></div>
  const current = media[Math.min(active, media.length - 1)]
  return <div className="portfolio-media">
    <div className="portfolio-media-main">{current.type === 'video' ? <video src={current.src} controls preload="metadata"/> : <img src={current.src} alt={title}/>}</div>
    {media.length > 1 && <div className="portfolio-media-thumbs">{media.map((item, index) => <button type="button" key={item.id} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Photo ${index + 1} of ${media.length}`}>{item.type === 'video' ? <span className="thumb-video">▶</span> : <img src={item.src} alt=""/>}</button>)}</div>}
  </div>
}

function PortfolioForm({ work, setWork, onSubmit, onClose, onAddImages, onRemoveMedia, videoUrl, setVideoUrl, onAddVideoLink, busy, reading, error }) {
  const fields = [['title', 'Title', true], ['company', 'Company or group (optional)', false], ['role', 'Your role (optional)', false], ['year', 'Year (optional)', false]]
  return <div className="production-backdrop" onClick={onClose}><form className="production-form" onClick={event => event.stopPropagation()} onSubmit={onSubmit} role="dialog" aria-modal="true" aria-label="Portfolio item"><header><div><p>PORTFOLIO ITEM</p><h2>Add a piece to your portfolio.</h2></div><button type="button" onClick={onClose}>Close</button></header><ErrorNotice error={error}/><div className="production-fields">{fields.map(([key, label, required]) => <label key={key} className={key === 'title' ? 'full' : ''}>{label}<input required={required} maxLength={key === 'year' ? 20 : 150} value={work[key]} onChange={event => setWork(current => ({ ...current, [key]: event.target.value }))}/></label>)}<label className="full">Description (optional)<textarea maxLength={2000} placeholder="What is this, and why does it matter to you?" value={work.description} onChange={event => setWork(current => ({ ...current, description: event.target.value }))}/></label>
    <div className="full production-media portfolio-media-manager"><span>Photos <em>(optional — add as many as you like)</em></span>{work.media.length > 0 && <div className="media-manager-grid">{work.media.map(item => <div className="media-manager-item" key={item.id}>{item.type === 'video' ? <span className="thumb-video">▶</span> : <img src={item.src} alt=""/>}<button type="button" onClick={() => onRemoveMedia(item.id)} aria-label="Remove this photo">×</button></div>)}</div>}<label className="media-upload-button">Add images<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={onAddImages} disabled={reading}/></label><p className="stage-hint">PNG, JPEG, or WebP, up to 500 KB each. You can add photos later too — nothing here is required.</p></div>
    <label className="full">Video link (optional)<div className="video-link-row"><input type="url" placeholder="https://… direct link to a video file" value={videoUrl} onChange={event => setVideoUrl(event.target.value)}/><button type="button" onClick={onAddVideoLink}>Add</button></div></label>
  </div><footer><button type="button" onClick={onClose}>Cancel</button><StageButton type="submit" disabled={busy || reading}>Save portfolio item</StageButton></footer></form></div>
}

export function Profile() {
  const { profile, mutate, busy, error } = useWorkspace()
  const [draft, setDraft] = useState(profile)
  const [notice, setNotice] = useState('')
  const [localError, setLocalError] = useState(null)
  const [work, setWork] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [reading, setReading] = useState(false)
  const update = event => { setDraft(current => ({ ...current, [event.target.name]: event.target.value })); setNotice('') }
  async function save(next) {
    setNotice('')
    const result = await mutate('/profile', 'PUT', next)
    if (result) { setDraft(result); setNotice('Your profile is saved.'); return true }
    return false
  }
  async function photo(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setLocalError(null); setReading(true)
    try { const image = await readImage(file); setDraft(current => ({ ...current, photo: image })); setNotice('Photo selected. Save your profile to publish it.') }
    catch (error) { setLocalError(error) }
    finally { setReading(false) }
  }
  function openNewWork() { setVideoUrl(''); setLocalError(null); setWork(emptyWork()) }
  function openEditWork(item) { setVideoUrl(''); setLocalError(null); setWork({ ...item, media: item.media || [] }) }
  async function saveWork(event) {
    event.preventDefault()
    if (!work.title.trim()) { setLocalError(new Error('Give this portfolio item a title.')); return }
    const next = { ...work, title: work.title.trim() }
    const portfolio = draft.portfolio.some(item => item.id === next.id) ? draft.portfolio.map(item => item.id === next.id ? next : item) : [...draft.portfolio, next]
    if (await save({ ...draft, portfolio })) setWork(null)
  }
  async function addWorkImages(event) {
    const files = event.target.files
    if (!files || !files.length) return
    setLocalError(null); setReading(true)
    try {
      const images = await readImages(files)
      setWork(current => ({ ...current, media: [...current.media, ...images.map(src => ({ id: crypto.randomUUID(), src, type: 'image' }))] }))
    } catch (readError) { setLocalError(readError) }
    finally { setReading(false); event.target.value = '' }
  }
  function removeWorkMedia(id) { setWork(current => ({ ...current, media: current.media.filter(item => item.id !== id) })) }
  function addWorkVideoLink() {
    if (!videoUrl.trim()) return
    setWork(current => ({ ...current, media: [...current.media, { id: crypto.randomUUID(), src: videoUrl.trim(), type: 'video' }] }))
    setVideoUrl('')
  }
  return <div className="workspace-content profile-page"><PageTitle eyebrow="YOUR PROFESSIONAL PROFILE" title={profile.name} copy={`${profile.craft} · ${profile.location}`}/><ErrorNotice error={localError || error}/>{notice && <p className="profile-notice" role="status">{notice}</p>}<section className="profile-hero"><div className="profile-photo">{draft.photo ? <img src={draft.photo} alt={draft.name}/> : profile.initials}<label className="photo-edit">Change<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy || reading} onChange={photo}/></label>{draft.photo && <button className="photo-remove" onClick={() => { setDraft(current => ({ ...current, photo: '' })); setNotice('Photo removed from draft. Save your profile to confirm.') }}>Remove</button>}</div><div><span className="availability">{profile.availability}</span>{profile.openToCollabs && <span className="collab-badge">Open to collabs</span>}<h2>Your story, in your own words.</h2><p>{profile.bio || 'Add a short introduction so collaborators can get to know your work.'}</p><div className="profile-metrics"><b>{profile.followers}<small>followers</small></b><b>{profile.following}<small>following</small></b><b>{profile.portfolio.length}<small>portfolio items</small></b></div></div></section>
    <form className="stage-profile-form" onSubmit={event => { event.preventDefault(); save(draft) }}><div className="production-fields">{[['name', 'Professional name', 100], ['craft', 'Primary craft / organization type', 100], ['location', 'Location', 150], ['languages', 'Languages', 200], ['availability', 'Availability', 150]].map(([name, label, max]) => <label key={name}>{label}<input name={name} value={draft[name]} onChange={update} maxLength={max} required={['name', 'craft', 'location'].includes(name)}/></label>)}<label className="full">About your work<textarea name="bio" value={draft.bio} onChange={update} maxLength={2000}/></label></div><p className="stage-hint">Profile images: PNG, JPEG, or WebP, up to 500 KB.</p><StageButton type="submit" disabled={busy || reading}>Save profile</StageButton></form>
    <section className="portfolio-section"><div className="panel-heading"><div><p>PORTFOLIO</p><h2>Show the work you're proud of.</h2><span className="portfolio-subhead">Rehearsal photos, a performance still, a poster, a self-tape — anything that represents your craft. You do not need a professional credit to add something here.</span></div><button className="portfolio-upload" onClick={openNewWork}>Add portfolio item</button></div><div className="portfolio-grid">{draft.portfolio.map(item => <article className="portfolio-card" key={item.id}><PortfolioMedia media={item.media} title={item.title}/><div className="portfolio-copy">{metaLine(item) && <span>{metaLine(item)}</span>}<h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div><button className="portfolio-edit" onClick={() => openEditWork(item)}>Edit</button><button className="portfolio-remove" disabled={busy} aria-label={`Remove ${item.title}`} onClick={() => save({ ...draft, portfolio: draft.portfolio.filter(entry => entry.id !== item.id) })}>×</button></article>)}</div>{!draft.portfolio.length && <Empty>Add your first portfolio item — rehearsal photos, a performance still, or a poster all count. No prior professional credit needed.</Empty>}</section>
    {work && <PortfolioForm work={work} setWork={setWork} onSubmit={saveWork} onClose={() => setWork(null)} onAddImages={addWorkImages} onRemoveMedia={removeWorkMedia} videoUrl={videoUrl} setVideoUrl={setVideoUrl} onAddVideoLink={addWorkVideoLink} busy={busy} reading={reading} error={localError || error}/>}
  </div>
}

export function Settings() {
  const { user, profile, mutate, busy, error } = useWorkspace()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({ visibility: profile.visibility, opportunity_alerts: profile.opportunity_alerts, community_alerts: profile.community_alerts, openToCollabs: profile.openToCollabs })
  const change = (key, value) => { setSettings(current => ({ ...current, [key]: value })); setSaved(false) }
  return <div className="workspace-content"><PageTitle eyebrow="SETTINGS" title="Shape your Stage." copy="Control discovery and in-app activity alerts."/><ErrorNotice error={error}/><form className="settings-card" onSubmit={async event => { event.preventDefault(); if (await mutate('/settings', 'PUT', settings)) setSaved(true) }}><h2>Professional preferences</h2><label><span>Profile visibility</span><select value={settings.visibility} onChange={event => change('visibility', event.target.value)}><option value="public">Visible to Stage members</option><option value="organizations">Only organizations</option><option value="private">Private</option></select></label><p className="stage-hint">Your submitted applications remain visible to their casting teams. Existing conversations remain available.</p>{user.role === 'artist' && <label className="switch-row"><span>Open to collaborations <small>Shown as a badge on your profile and as a filter in Discover talent.</small></span><input type="checkbox" checked={settings.openToCollabs} onChange={event => change('openToCollabs', event.target.checked)}/></label>}<label className="switch-row"><span>New opportunity alerts</span><input type="checkbox" checked={settings.opportunity_alerts} onChange={event => change('opportunity_alerts', event.target.checked)}/></label><label className="switch-row"><span>Comment activity alerts</span><input type="checkbox" checked={settings.community_alerts} onChange={event => change('community_alerts', event.target.checked)}/></label><StageButton disabled={busy} type="submit">{saved ? 'Preferences saved' : 'Save preferences'}</StageButton></form></div>
}
