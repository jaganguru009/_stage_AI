import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { WorkspacePage } from './pages/WorkspacePage'
import { AuthPage } from './pages/AuthPage'
import { PublicHomePage } from './pages/PublicHomePage'
import './styles.css'
import './stage-theme.css'
import './auth-overrides.css'
import './hero-motion-boost.css'
import './actor-lighting.css'
import './actor-spotlight-targets.css'
import './discipline-picker.css'
import './discipline-enhance.css'
import './intro-collage.css'
import './casting-composer.css'
import './community-interactions.css'
import './community-hub.css'
import './profile-media.css'
import './backend-ui.css'
import './booking-experience.css'

function App() {
  return <Routes>
    <Route path="/" element={<PublicHomePage />} />
    <Route path="/home" element={<PublicHomePage />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/:page" element={<WorkspacePage />} />
  </Routes>
}

createRoot(document.getElementById('root')).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>)
