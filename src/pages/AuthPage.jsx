import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { StageButton } from '../components/stage/StageButton'
import { StageIcon } from '../components/stage/StageIcon'
import { ErrorNotice } from '../components/workspace/shared'
import rehearsalImage from '../assets/stage-pune-rehearsal.png'
import { artistDisciplines } from '../data/staticData'
import { demoAccounts, DEMO_PASSWORD } from '../data/mockData'
import { api } from '../lib/api'

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
  const requestedRole = new URLSearchParams(location.search).get('role')
  const [role, setRole] = useState(roleOptions.some(option => option.id === requestedRole) ? requestedRole : 'artist')
  const [discipline, setDiscipline] = useState('Actor')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const selected = roleOptions.find(option => option.id === role)
  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const form = new FormData(event.currentTarget)
    setError(null); setPending(true)
    try {
      const body = { email: form.get('email'), password: form.get('password') }
      if (!isLogin) Object.assign(body, { name: form.get('name'), role, discipline: role === 'artist' ? discipline : selected.label })
      const { user } = await api(isLogin ? '/auth/login' : '/auth/register', { method: 'POST', body })
      navigate(user.role === 'artist' ? '/dashboard' : '/organization', { replace: true })
    } catch (failure) { setError(failure) }
    finally { setPending(false) }
  }
  async function quickLogin(account) {
    if (pending) return
    setError(null); setPending(true)
    try {
      const { user } = await api('/auth/login', { method: 'POST', body: { email: account.email, password: DEMO_PASSWORD } })
      navigate(user.role === 'artist' ? '/dashboard' : '/organization', { replace: true })
    } catch (failure) { setError(failure) }
    finally { setPending(false) }
  }
  return <main className="auth-page-v2"><section className="auth-art"><img src={rehearsalImage} alt="A theatre rehearsal in warm stage light"/><div className="auth-art-overlay"/><Link to="/" className="auth-brand-v2">stage<span>.</span></Link><div className="auth-art-copy"><p>THE PROFESSIONAL HOME FOR PUNE THEATRE</p><h1>{isLogin ? 'The work is waiting.' : 'Take your place in the room.'}</h1><span>{isLogin ? 'Your people, productions, and possibilities are here.' : 'Join a community built around what you make.'}</span></div><div className="auth-art-caption">PUNE<br/><i>THEATRE</i><br/>2026</div></section>
    <section className="auth-panel"><Link className="auth-back" to="/">← Back to Stage</Link><div className="auth-heading"><p>{isLogin ? 'WELCOME BACK' : 'CREATE YOUR STAGE'}</p><h2>{isLogin ? 'Come back to the work.' : 'What brings you to Stage?'}</h2><span>{isLogin ? 'Log in to your Stage account.' : 'Your role shapes the tools, community, and opportunities you see.'}</span></div>
      {!isLogin && <><div className="auth-role-picker">{roleOptions.map(option => <button type="button" key={option.id} onClick={() => setRole(option.id)} className={role === option.id ? 'selected' : ''}><StageIcon name={option.icon}/><div><b>{option.label}</b><span>{option.note}</span></div><i>{role === option.id ? 'Selected' : 'Choose'}</i></button>)}</div>{role === 'artist' && <section className="discipline-picker"><div><p>YOUR PRIMARY CRAFT</p><span>Choose the craft you most want to be discovered for.</span></div>{artistDisciplines.map(group => <div className="discipline-group" key={group.group}><b>{group.group}</b><div>{group.items.map(item => <button type="button" onClick={() => setDiscipline(item)} className={discipline === item ? 'selected' : ''} key={item}>{item}</button>)}</div></div>)}</section>}</>}
      <form key={mode} className="auth-form-v2" onSubmit={submit}>{!isLogin && <label>Your name<input name="name" required maxLength={100} autoComplete="name" placeholder={role === 'artist' ? 'Your professional name' : 'Organization or team name'}/></label>}<label>Email address<input name="email" required type="email" maxLength={254} autoComplete="email" placeholder="you@example.com"/></label><label>Password<input name="password" required type="password" minLength={10} maxLength={128} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder={isLogin ? 'Your password' : 'At least 10 characters'}/></label><ErrorNotice error={error}/><StageButton type="submit" disabled={pending}>{pending ? 'Please wait...' : isLogin ? 'Log in' : `Create ${selected.label} account`}</StageButton></form>
      {isLogin && <div className="auth-demo"><p>OR EXPLORE AS A DEMO ACCOUNT</p><div className="auth-demo-grid">{demoAccounts.map(account => <button type="button" key={account.role} disabled={pending} onClick={() => quickLogin(account)}><b>{account.label}</b><span>{account.name}</span></button>)}</div><small>Demo accounts share password "{DEMO_PASSWORD}" — nothing here leaves your browser.</small></div>}
      <p className="auth-switch">{isLogin ? 'New to Stage?' : 'Already have a Stage account?'} <Link onClick={() => setError(null)} to={isLogin ? `/register?role=${role}` : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link></p></section>
  </main>
}
