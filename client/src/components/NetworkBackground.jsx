import { useEffect, useRef } from 'react'

export default function NetworkBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let t = 0

    let W, H

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const N = Math.min(110, Math.floor((W * H) / 10000))
    const LINK = 200

    // Particle types for visual variety
    const COLORS = [
      { r: 79,  g: 209, b: 255 }, // cyan
      { r: 139, g: 92,  b: 246 }, // violet
      { r: 20,  g: 184, b: 166 }, // teal
      { r: 96,  g: 165, b: 250 }, // blue
      { r: 232, g: 121, b: 249 }, // fuchsia
    ]

    const pts = Array.from({ length: N }, () => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        c,
        phase: Math.random() * Math.PI * 2, // for pulsing
        speed: 0.3 + Math.random() * 0.7,
      }
    })

    // Pulse rings — emanate from random points periodically
    const pulses = []
    function spawnPulse() {
      const p = pts[Math.floor(Math.random() * pts.length)]
      const c = p.c
      pulses.push({ x: p.x, y: p.y, radius: 0, maxR: 80 + Math.random() * 60, life: 1, c })
    }
    let pulseTimer = 0

    function tick() {
      t += 0.008
      pulseTimer += 1
      if (pulseTimer > 90) { spawnPulse(); pulseTimer = 0 }

      // Clear fully then paint base — no trail bleed behind cards
      ctx.fillStyle = '#04080f'
      ctx.fillRect(0, 0, W, H)

      // ── Draw grid (subtle circuit board feel) ──
      ctx.save()
      ctx.strokeStyle = 'rgba(79,209,255,0.022)'
      ctx.lineWidth = 0.5
      const gridSize = 80
      for (let gx = 0; gx < W; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
      }
      for (let gy = 0; gy < H; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
      }
      ctx.restore()

      // ── Move particles ──
      for (const p of pts) {
        p.x += p.vx * p.speed
        p.y += p.vy * p.speed
        if (p.x < -20)  { p.x = W + 20 }
        if (p.x > W+20) { p.x = -20 }
        if (p.y < -20)  { p.y = H + 20 }
        if (p.y > H+20) { p.y = -20 }
      }

      // ── Draw connections ──
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK * LINK) {
            const dist = Math.sqrt(d2)
            const alpha = (1 - dist / LINK) * 0.22
            // Gradient line blending both point colors
            const grad = ctx.createLinearGradient(pts[i].x, pts[i].y, pts[j].x, pts[j].y)
            const ci = pts[i].c, cj = pts[j].c
            grad.addColorStop(0, `rgba(${ci.r},${ci.g},${ci.b},${alpha})`)
            grad.addColorStop(1, `rgba(${cj.r},${cj.g},${cj.b},${alpha})`)
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = grad
            ctx.lineWidth = (1 - dist / LINK) * 1.2
            ctx.stroke()
          }
        }
      }

      // ── Draw particles ──
      for (const p of pts) {
        const pulse = Math.sin(t * 2 + p.phase) * 0.3 + 0.7 // 0.4 – 1.0
        const { r: cr, g: cg, b: cb } = p.c

        // Outer glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10)
        glow.addColorStop(0, `rgba(${cr},${cg},${cb},${0.18 * pulse})`)
        glow.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.05)`)
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 10, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.9)`
        ctx.fill()
      }

      // ── Draw pulse rings ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i]
        pulse.radius += 1.8
        pulse.life = 1 - pulse.radius / pulse.maxR
        if (pulse.life <= 0) { pulses.splice(i, 1); continue }
        const { r: cr, g: cg, b: cb } = pulse.c
        ctx.beginPath()
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${pulse.life * 0.35})`
        ctx.lineWidth = pulse.life * 2
        ctx.stroke()
      }

      // ── Flowing bright lines (data streams) ──
      ctx.save()
      const streamY = ((t * 60) % (H + 200)) - 100
      const streamGrad = ctx.createLinearGradient(0, streamY - 60, 0, streamY + 60)
      streamGrad.addColorStop(0, 'transparent')
      streamGrad.addColorStop(0.5, 'rgba(79,209,255,0.04)')
      streamGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = streamGrad
      ctx.fillRect(0, streamY - 60, W, 120)
      ctx.restore()

      animId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.7 }}
    />
  )
}
