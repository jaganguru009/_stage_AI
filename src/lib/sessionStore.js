import { useState } from 'react'

export function useSessionState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  const update = nextValue => {
    setValue(previous => {
      const resolved = typeof nextValue === 'function' ? nextValue(previous) : nextValue
      try { sessionStorage.setItem(key, JSON.stringify(resolved)) } catch { /* Keep the interaction usable if storage is full. */ }
      return resolved
    })
  }

  return [value, update]
}

export function clearStageSession() {
  sessionStorage.removeItem('stage-profile')
  sessionStorage.removeItem('stage-casting-calls')
  sessionStorage.removeItem('stage-applications')
  sessionStorage.removeItem('stage-messages')
  sessionStorage.removeItem('stage-feed')
  sessionStorage.removeItem('stage-social')
  sessionStorage.removeItem('stage-demo-user')
}
