export function StageAvatar({ initials, size = 'md', src, name = 'Profile avatar' }) {
  return <span className={`stage-avatar stage-avatar--${size} ${src ? 'stage-avatar--image' : ''}`} aria-label={name}>{src ? <img src={src} alt="" /> : initials}</span>
}
