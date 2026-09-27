import { useCallback, useEffect, useRef, useState } from 'react'

// Stage now talks to a real backend (see the sibling `stage` project — Node,
// Express, MongoDB, Cloudinary). Every screen above this file calls api()
// exactly the same way it always did; only this file knows there's a network
// involved. The session itself lives in an httpOnly cookie the backend sets
// on login, so `credentials: 'include'` is all auth needs — there is no
// token for this file to store or attach by hand.
const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/$/, '')

async function parseErrorResponse(res) {
  let message = 'Something went wrong. Please try again.'
  try { const data = await res.json(); if (data && data.message) message = data.message } catch { /* body wasn't JSON */ }
  const error = new Error(message)
  error.status = res.status
  return error
}

function networkError() {
  const error = new Error('Could not reach the Stage server. Make sure the backend is running and try again.')
  error.status = 0
  return error
}

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw networkError()
  }
  if (!res.ok) throw await parseErrorResponse(res)
  if (res.status === 204) return null
  return res.json()
}

export function useApiData(path, pollMs = 0) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const request = useRef(0)
  const reload = useCallback(async () => {
    const current = ++request.current
    if (!path) { setState({ data: null, loading: false, error: null }); return }
    try {
      const data = await api(path)
      if (current === request.current) setState({ data, loading: false, error: null })
    } catch (error) {
      if (current === request.current) setState(previous => ({ ...previous, loading: false, error }))
    }
  }, [path])
  useEffect(() => {
    setState({ data: null, loading: Boolean(path), error: null })
    reload()
    const timer = pollMs ? setInterval(() => { if (!document.hidden) reload() }, pollMs) : null
    return () => { request.current += 1; if (timer) clearInterval(timer) }
  }, [reload, pollMs, path])
  return { ...state, reload }
}

export const initials = name => (name || '').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()
export const dateLabel = value => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 500 * 1024

// Uploads a single image to the backend, which stores it in Cloudinary and
// hands back a hosted URL. Every caller (profile photo, portfolio images)
// just stores whatever string this resolves to — they never knew or cared
// that this used to be a same-page base64 data URL instead of a real upload,
// so nothing above this file needed to change.
export function readImage(file) {
  if (!file || !ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
    return Promise.reject(new Error('Choose a PNG, JPEG, or WebP image smaller than 500 KB.'))
  }
  const form = new FormData()
  form.append('file', file)
  return fetch(`${API_BASE}/uploads`, { method: 'POST', credentials: 'include', body: form })
    .catch(() => { throw networkError() })
    .then(async res => {
      if (!res.ok) throw await parseErrorResponse(res)
      const data = await res.json()
      return data.url
    })
}

// Uploads several images at once (for multi-image portfolio uploads). Every
// file must pass the same PNG/JPEG/WebP, 500 KB check readImage() applies.
export function readImages(fileList) {
  return Promise.all(Array.from(fileList || []).map(readImage))
}
