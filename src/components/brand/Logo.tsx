interface LogoProps {
  size?: number
  variant?: 'mark' | 'wordmark'
  className?: string
  dark?: boolean // true = white text (for dark backgrounds)
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Map pin shape */}
      <path
        d="M20 2C13.373 2 8 7.373 8 14c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z"
        fill="#1B3A5C"
      />
      {/* Basketball circle inside pin */}
      <circle cx="20" cy="14" r="8" fill="#FF6B2C" />
      {/* Basketball seam lines */}
      <path
        d="M12 14h16M20 6v16"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M13.5 9.5c1.5 2 1.5 7 0 9M26.5 9.5c-1.5 2-1.5 7 0 9"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function Logo({ size = 32, variant = 'wordmark', className, dark = false }: LogoProps) {
  const textSize = size <= 32 ? 'text-lg' : size <= 48 ? 'text-xl' : 'text-3xl'

  if (variant === 'mark') {
    return <LogoMark size={size} className={className} />
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark size={size} />
      <span
        className={`${textSize} font-extrabold tracking-tight leading-none ${
          dark ? 'text-white' : 'text-[#1B3A5C]'
        }`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Hooper&apos;s Hub
      </span>
    </div>
  )
}

export default Logo
