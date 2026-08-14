export function StageAvatar({ initials, size = 'md' }) {
  return <span className={`stage-avatar stage-avatar--${size}`} aria-label="Profile avatar">{initials}</span>
}
