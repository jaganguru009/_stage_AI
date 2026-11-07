import { createContext, useContext } from 'react'
export const WorkspaceContext = createContext(null)
export const useWorkspace = () => useContext(WorkspaceContext)
export function PageTitle({ eyebrow, title, copy, action }) {
  return <div className="workspace-title-row"><div><p className="workspace-kicker">{eyebrow}</p><h1>{title}</h1>{copy && <p>{copy}</p>}</div>{action}</div>
}
export function Empty({ children }) { return <p className="stage-empty">{children}</p> }
export function ErrorNotice({ error, retry }) { return error ? <div className="stage-error" role="alert">{error.message || error}{retry && <button type="button" onClick={retry}>Try again</button>}</div> : null }

// Shared star-rating chip: shown on a profile, in search results, and in the
// talent pipeline, so it lives here rather than in any one page's file.
export function RatingBadge({ rating, count }) {
  if (!count) return <span className="rating-badge rating-badge-empty">No reviews yet</span>
  return <span className="rating-badge" title={`${count} review${count === 1 ? '' : 's'}`}>★ {rating.toFixed(1)}<small>({count})</small></span>
}
