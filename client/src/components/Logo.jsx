export function LogoIcon({ size = 32, className = '' }) {
  const id = `lg-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4fd1ff" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4fd1ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.5" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <line x1="20" y1="20" x2="7"  y2="9"  stroke={`url(#${id}-b)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2="33" y2="9"  stroke={`url(#${id}-b)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2="7"  y2="31" stroke={`url(#${id}-b)`} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2="33" y2="31" stroke={`url(#${id}-b)`} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7"  cy="9"  r="4" fill={`url(#${id}-a)`} opacity="0.8" filter={`url(#${id}-glow)`} />
      <circle cx="33" cy="9"  r="4" fill={`url(#${id}-a)`} opacity="0.8" filter={`url(#${id}-glow)`} />
      <circle cx="7"  cy="31" r="4" fill={`url(#${id}-a)`} opacity="0.8" filter={`url(#${id}-glow)`} />
      <circle cx="33" cy="31" r="4" fill={`url(#${id}-a)`} opacity="0.8" filter={`url(#${id}-glow)`} />
      <circle cx="20" cy="20" r="6" fill={`url(#${id}-a)`} filter={`url(#${id}-glow)`} />
      <circle cx="20" cy="20" r="3" fill="#050b15" opacity="0.7" />
    </svg>
  )
}

export function LogoFull({ className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <LogoIcon size={68} />
      <div className="text-center">
        <p className="bg-gradient-to-r from-[#4fd1ff] via-violet-300 to-purple-400 bg-clip-text pb-1 text-4xl font-black tracking-[0.12em] text-transparent">
          TEAMUP
        </p>
        {/* Tagline — large, vivid, unmissable */}
        <p className="mt-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500 bg-clip-text pb-0.5 text-base font-bold tracking-[0.18em] text-transparent uppercase">
          Ideas Unite · Future Ignite
        </p>
      </div>
    </div>
  )
}
