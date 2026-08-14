import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { StageButton } from '../components/stage/StageButton'
import { StageIcon } from '../components/stage/StageIcon'
import rehearsalImage from '../assets/stage-pune-rehearsal.png'
import { artistDisciplines } from '../data/demoData'

const roleOptions = [
  { id: 'artist', label: 'Artist', note: 'Actor, musician, writer, designer or theatre-maker', icon: 'feed' },
  { id: 'casting', label: 'Casting director', note: 'Find, review, and invite performers', icon: 'castings' },
  { id: 'organization', label: 'Theatre group', note: 'Manage your group, productions, and castings', icon: 'applications' },
  { id: 'agency', label: 'Agency', note: 'Represent and connect your talent roster', icon: 'search' },
]

export function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const location = useLocation()
  const navigate = useNavigate()
  const initialRole = useMemo(() => new URLSearchParams(location.search).get('role') || 'artist', [location.search])
  const [role, setRole] = useState(initialRole)
  const [discipline, setDiscipline] = useState('Actor')
  const [submitted, setSubmitted] = useState(false)
  const selected = roleOptions.find(option => option.id === role) || roleOptions[0]
  const submit = event => { event.preventDefault(); setSubmitted(true); window.setTimeout(() => navigate(role === 'artist' ? '/dashboard' : '/organization'), 550) }
  return <main className="auth-page-v2"><section className="auth-art"><img src={rehearsalImage} alt="A theatre rehearsal in warm stage light"/><div className="auth-art-overlay"/><Link to="/" className="auth-brand-v2">stage<span>.</span></Link><div className="auth-art-copy"><p>THE PROFESSIONAL HOME FOR PUNE THEATRE</p><h1>{isLogin ? 'The work is waiting.' : 'Take your place in the room.'}</h1><span>{isLogin ? 'Your people, productions, and possibilities are here.' : 'Join a community built around what you make - not just who follows you.'}</span></div><div className="auth-art-caption">PUNE<br/><i>THEATRE</i><br/>2026</div></section>
    <section className="auth-panel"><Link className="auth-back" to="/">← Back to Stage</Link><div className="auth-heading"><p>{isLogin ? 'WELCOME BACK' : 'CREATE YOUR STAGE'}</p><h2>{isLogin ? 'Come back to the work.' : 'What brings you to Stage?'}</h2><span>{isLogin ? 'Choose how you are joining today.' : 'Your role shapes the tools, community, and opportunities you see.'}</span></div>
      {isLogin ? <div className="auth-login-roles"><p>CONTINUE AS</p><div>{roleOptions.map(option => <button type="button" aria-label={`Continue as ${option.label}`} key={option.id} onClick={() => setRole(option.id)} className={role === option.id ? 'selected' : ''}><StageIcon name={option.icon}/><span>{option.label}</span></button>)}</div></div> : <><div className="auth-role-picker">{roleOptions.map(option => <button type="button" key={option.id} onClick={() => setRole(option.id)} className={role === option.id ? 'selected' : ''}><StageIcon name={option.icon}/><div><b>{option.label}</b><span>{option.note}</span></div><i>{role === option.id ? 'Selected' : 'Choose'}</i></button>)}</div>{role === 'artist' && <section className="discipline-picker"><div><p>YOUR PRIMARY CRAFT</p><span>Choose the craft you most want to be discovered for. You can add more disciplines later.</span></div>{artistDisciplines.map(group => <div className="discipline-group" key={group.group}><b>{group.group}</b><div>{group.items.map(item => <button type="button" onClick={() => setDiscipline(item)} className={discipline === item ? 'selected' : ''} key={item}>{item}</button>)}</div></div>)}</section>}</>}
      <form className="auth-form-v2" onSubmit={submit}>{!isLogin && <label>Your name<input required placeholder={role === 'artist' ? 'Your professional name' : 'Organization or team name'} /></label>}<label>Email address<input required type="email" placeholder="you@example.com" /></label><label>Password<input required type="password" placeholder="Create a secure password" /></label><StageButton type="submit">{submitted ? 'Opening your workspace...' : isLogin ? `Continue as ${selected.label}` : `Create ${selected.label} account`}</StageButton></form>
      <p className="auth-switch">{isLogin ? 'New to Stage?' : 'Already have a Stage account?'} <Link to={isLogin ? `/register?role=${role}` : `/login?role=${role}`}>{isLogin ? 'Create an account' : 'Log in'}</Link></p></section>
  </main>
}
