import { FaHandshake } from 'react-icons/fa'

export function LogoIcon({ size = 32, className = '' }) {
  const border = Math.max(2, Math.round(size / 13))
  const iconSize = Math.round(size * 0.52)

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        border: `${border}px solid #f5c842`,
        background: 'radial-gradient(circle, rgba(245,200,66,0.14) 0%, transparent 70%)',
        boxShadow: `0 0 ${Math.round(size / 3)}px rgba(245,200,66,0.4), inset 0 0 ${Math.round(size / 5)}px rgba(245,200,66,0.06)`,
      }}
    >
      <FaHandshake
        size={iconSize}
        style={{
          color: '#f5c842',
          filter: `drop-shadow(0 0 ${Math.round(size / 7)}px rgba(245,200,66,0.9))`,
        }}
      />
    </div>
  )
}

export function LogoFull({ className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <LogoIcon size={68} />
      <div className="text-center">
        <p className="pb-1 bg-gradient-to-r from-[#ffe08a] via-[#f5c842] to-[#c8860a] bg-clip-text text-4xl font-black tracking-[0.12em] text-transparent">
          TEAMUP
        </p>
        <p className="mt-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500 bg-clip-text pb-0.5 text-base font-bold tracking-[0.18em] text-transparent uppercase">
          Ideas Unite · Future Ignite
        </p>
      </div>
    </div>
  )
}
