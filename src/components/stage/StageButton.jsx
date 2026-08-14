export function StageButton({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`stage-button stage-button--${variant} ${className}`} {...props}>{children}</button>
}
