import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaHandshake } from 'react-icons/fa'

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('hands')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shake'),  900)
    const t2 = setTimeout(() => setPhase('text'),   1400)
    const t3 = setTimeout(() => setPhase('exit'),   2800)
    const t4 = setTimeout(() => onComplete?.(),     3500)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [onComplete])

  const handsIn = phase !== 'hands'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at center, #1c1000 0%, #0a0600 55%, #000 100%)' }}
        >
          {/* Ambient gold glow */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{ width: 360, height: 360, background: 'radial-gradient(circle, rgba(245,200,66,0.3) 0%, transparent 70%)' }}
            animate={handsIn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6 }}
          />

          {/* Gold circle ring */}
          <motion.svg
            width="320" height="320" viewBox="0 0 320 320"
            className="absolute"
            initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
            animate={handsIn ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.4, rotate: -45 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0"    stopColor="#fff0a0" />
                <stop offset="0.25" stopColor="#f5c842" />
                <stop offset="0.5"  stopColor="#c8860a" />
                <stop offset="0.75" stopColor="#f5c842" />
                <stop offset="1"    stopColor="#ffe08a" />
              </linearGradient>
              <filter id="rglow">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx="160" cy="160" r="148" stroke="url(#rg)" strokeWidth="14" fill="none" filter="url(#rglow)" />
            <circle cx="160" cy="160" r="133" stroke="#c8860a" strokeWidth="2"  fill="none" opacity="0.45" />
          </motion.svg>

          {/* Handshake icon — split in half, each half slides in from its side */}
          <div className="relative" style={{ zIndex: 2 }}>
            {/* LEFT half */}
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: handsIn ? 0 : -260 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                clipPath: 'inset(0 50% 0 0)',
                filter: 'drop-shadow(0 0 12px rgba(245,200,66,0.7))',
              }}
            >
              <FaHandshake size={170} style={{ color: '#f5c842', display: 'block' }} />
            </motion.div>

            {/* RIGHT half */}
            <motion.div
              initial={{ x: 260 }}
              animate={{ x: handsIn ? 0 : 260 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                clipPath: 'inset(0 0 0 50%)',
                filter: 'drop-shadow(0 0 12px rgba(245,200,66,0.7))',
              }}
            >
              <FaHandshake size={170} style={{ color: '#f5c842', display: 'block' }} />
            </motion.div>
          </div>

          {/* Impact flash */}
          <AnimatePresence>
            {phase === 'shake' && (
              <motion.div
                key="flash"
                initial={{ opacity: 0.8, scale: 0.2 }}
                animate={{ opacity: 0, scale: 3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="pointer-events-none absolute rounded-full"
                style={{ width: 100, height: 100, background: 'radial-gradient(circle, #ffe08a, transparent)', zIndex: 3 }}
              />
            )}
          </AnimatePresence>

          {/* Bounce on shake */}
          {phase === 'shake' && (
            <motion.div
              className="pointer-events-none absolute"
              style={{ width: 170, height: 170 }}
              animate={{ y: [0, -10, 6, -4, 0] }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* TEAMUP letters */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={phase === 'text' || phase === 'exit' ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 bg-gradient-to-r from-[#ffe08a] via-[#f5c842] to-[#c8860a] bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl"
            style={{ zIndex: 3 }}
          >
            TEAMUP
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={phase === 'text' || phase === 'exit' ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-3 bg-gradient-to-r from-[#ffe08a] via-[#f5c842] to-[#c8860a] bg-clip-text text-xs font-bold uppercase tracking-[0.2em] text-transparent"
            style={{ zIndex: 3 }}
          >
            Ideas Unite · Future Ignite
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
