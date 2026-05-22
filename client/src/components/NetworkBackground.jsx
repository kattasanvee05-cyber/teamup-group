import { useEffect, useRef } from 'react'

export default function NetworkBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = window.innerWidth
    let H = window.innerHeight
    let animId
    let frame = 0

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const rand  = (a, b) => Math.random() * (b - a) + a
    const randI = (a, b) => Math.floor(rand(a, b + 1))

    // Moon — upper-right, slightly floats
    const MOON_OX = 0.80
    const MOON_OY = 0.13
    const MOON_R  = 48

    /* ── stars ─────────────────────────────────────────────────────── */
    function makeStar() {
      const r    = Math.random()
      const tier = r < 0.55 ? 0 : r < 0.85 ? 1 : 2
      const sizes  = [[0.18, 0.55], [0.55, 1.15], [1.15, 2.0]]
      const alphas = [[0.08, 0.28], [0.25, 0.50], [0.42, 0.68]]
      const rc  = Math.random()
      // Moonlit star palette — mostly silver-white, hints of blue/lavender/gold
      const col = rc > 0.93 ? [180, 215, 255]
                : rc > 0.88 ? [210, 195, 255]
                : rc > 0.85 ? [255, 245, 195]
                :              [225, 238, 255]
      return {
        x:    rand(0, W), y: rand(0, H),
        size: rand(...sizes[tier]),
        base: rand(...alphas[tier]),
        alpha: 0,
        ts:   rand(0.004, 0.025),
        to:   rand(0, Math.PI * 2),
        tier, col,
      }
    }
    let stars = Array.from({ length: 400 }, makeStar)

    /* ── shooting stars ─────────────────────────────────────────────── */
    let meteors   = []
    let nextMeteor = randI(140, 280)

    function makeMeteor() {
      const style = Math.random()
      let x, y, vx, vy, len
      if (style < 0.38) {
        x = rand(W * 0.05, W * 0.95); y = rand(-30, H * 0.3)
        const spd = rand(7, 14), ang = rand(65, 85) * Math.PI / 180
        vx = Math.cos(ang) * spd * (Math.random() < 0.5 ? 1 : -1)
        vy = Math.sin(ang) * spd; len = rand(80, 160)
      } else if (style < 0.72) {
        x = rand(-50, W * 0.4); y = rand(0, H * 0.5)
        const spd = rand(8, 15), ang = rand(25, 52) * Math.PI / 180
        vx = Math.cos(ang) * spd; vy = Math.sin(ang) * spd; len = rand(100, 190)
      } else {
        x = rand(W * 0.6, W + 50); y = rand(0, H * 0.5)
        const spd = rand(8, 15), ang = rand(128, 155) * Math.PI / 180
        vx = Math.cos(ang) * spd; vy = Math.sin(ang) * spd; len = rand(100, 190)
      }
      return { x, y, vx, vy, len, life: 1.0, col: [215, 238, 255] }
    }

    /* ── nebulae — cool moonlit palette ─────────────────────────────── */
    const nebulae = [
      { ox: 0.14, oy: 0.22, r: 460, col: [70,  148, 210], a: 0.020, sp: 0.00028 },
      { ox: 0.80, oy: 0.18, r: 400, col: [130,  95, 215], a: 0.022, sp: 0.00035 },
      { ox: 0.50, oy: 0.72, r: 380, col: [75,  135, 195], a: 0.016, sp: 0.00042 },
      { ox: 0.22, oy: 0.76, r: 340, col: [55,  145, 175], a: 0.018, sp: 0.00030 },
      { ox: 0.70, oy: 0.56, r: 310, col: [170, 155, 235], a: 0.014, sp: 0.00055 },
    ]

    /* ── milky way band ─────────────────────────────────────────────── */
    const BAND_ANGLE = -Math.PI / 5
    const BC = Math.cos(BAND_ANGLE), BS = Math.sin(BAND_ANGLE)
    const bandStars = Array.from({ length: 360 }, () => {
      const t   = rand(-0.1, 1.1)
      const bx  = W * 0.5 + (t - 0.5) * W * 1.4
      const by  = H * 0.5 + (t - 0.5) * H * 0.5
      const off = rand(-125, 125) * (Math.random() < 0.75 ? 1 : 1.8)
      return {
        x:     bx + off * (-BS),
        y:     by + off *   BC,
        size:  rand(0.14, 0.68),
        alpha: Math.max(0.06, 0.58 - Math.abs(off) / 125 * 0.50) * rand(0.4, 1),
        ts:    rand(0.004, 0.020),
        to:    rand(0, Math.PI * 2),
      }
    })

    /* ── cloud wisps ────────────────────────────────────────────────── */
    const clouds = [
      { x: rand(0, W),      y: rand(H * 0.06, H * 0.22), w: rand(420, 680), h: rand(38, 65),  a: rand(0.030, 0.055), spd: rand(0.18, 0.32) },
      { x: rand(0, W),      y: rand(H * 0.18, H * 0.36), w: rand(340, 580), h: rand(28, 52),  a: rand(0.022, 0.042), spd: rand(0.12, 0.24) },
      { x: rand(-W*0.3, W), y: rand(H * 0.28, H * 0.48), w: rand(300, 520), h: rand(22, 46),  a: rand(0.018, 0.035), spd: rand(0.08, 0.18) },
    ]

    /* ── moon crater data ───────────────────────────────────────────── */
    // [dx_frac, dy_frac, r_frac, darkness]
    const craters = [
      [  0.28, -0.14, 0.20, 0.08 ],
      [ -0.20,  0.22, 0.15, 0.07 ],
      [  0.36,  0.28, 0.13, 0.06 ],
      [ -0.32, -0.20, 0.11, 0.06 ],
      [  0.08,  0.38, 0.09, 0.05 ],
      [ -0.42,  0.08, 0.08, 0.05 ],
      [  0.18, -0.38, 0.07, 0.04 ],
    ]

    /* ── draw sky gradient ──────────────────────────────────────────── */
    function drawSky() {
      const grd = ctx.createLinearGradient(0, 0, 0, H)
      grd.addColorStop(0,    '#04091a')
      grd.addColorStop(0.30, '#050b1c')
      grd.addColorStop(0.65, '#060d1f')
      grd.addColorStop(1,    '#070e21')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)
    }

    /* ── moonlight wash on sky ──────────────────────────────────────── */
    function drawMoonlight() {
      const mx = MOON_OX * W
      const my = MOON_OY * H
      const pulse = 1 + Math.sin(frame * 0.0014) * 0.04

      // Giant soft atmospheric wash
      const wash = ctx.createRadialGradient(mx, my, MOON_R * 2, mx, my, Math.max(W, H) * 1.4 * pulse)
      wash.addColorStop(0,    'rgba(170,205,255,0.055)')
      wash.addColorStop(0.10, 'rgba(150,190,255,0.038)')
      wash.addColorStop(0.28, 'rgba(130,175,255,0.018)')
      wash.addColorStop(0.50, 'rgba(110,158,245,0.008)')
      wash.addColorStop(1,    'rgba(90,140,230,0)')
      ctx.fillStyle = wash
      ctx.fillRect(0, 0, W, H)

      // Soft silver gleam beam along vertical axis below moon
      const beam = ctx.createLinearGradient(mx - 120, my, mx + 120, my + H * 0.6)
      beam.addColorStop(0,   'rgba(190,215,255,0.012)')
      beam.addColorStop(0.5, 'rgba(170,200,255,0.005)')
      beam.addColorStop(1,   'rgba(150,185,255,0)')
      ctx.fillStyle = beam
      ctx.fillRect(mx - 160, my, 320, H)
    }

    /* ── draw nebulae ───────────────────────────────────────────────── */
    function drawNebulae() {
      nebulae.forEach(n => {
        const t     = frame * n.sp
        const cx    = n.ox * W + Math.sin(t * 0.7) * 75
        const cy    = n.oy * H + Math.cos(t * 0.5) * 55
        const pulse = 1 + Math.sin(t * 12) * 0.09
        const grd   = ctx.createRadialGradient(cx, cy, 0, cx, cy, n.r * pulse)
        const [r,g,b] = n.col
        grd.addColorStop(0,    `rgba(${r},${g},${b},${n.a})`)
        grd.addColorStop(0.44, `rgba(${r},${g},${b},${n.a * 0.38})`)
        grd.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, W, H)
      })
    }

    /* ── draw milky way band stars ──────────────────────────────────── */
    function drawBandStars() {
      bandStars.forEach(s => {
        const tw = Math.sin(frame * s.ts + s.to) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215,232,255,${s.alpha * (0.32 + 0.68 * tw)})`
        ctx.fill()
      })
    }

    /* ── draw field stars ───────────────────────────────────────────── */
    function drawStars() {
      const mx = MOON_OX * W
      const my = MOON_OY * H
      stars.forEach(s => {
        const tw   = Math.sin(frame * s.ts + s.to) * 0.5 + 0.5
        // Stars near the moon dim naturally — realistic moonlight wash
        const dist = Math.hypot(s.x - mx, s.y - my)
        const fade = Math.min(1, Math.max(0.25, (dist - MOON_R * 4) / (MOON_R * 12)))
        s.alpha = s.base * (0.38 + 0.62 * tw) * fade
        const [r,g,b] = s.col

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${s.alpha})`
        ctx.fill()

        // Soft sparkle on brightest foreground stars
        if (s.tier === 2 && s.alpha > 0.42) {
          const gr = s.size * 3.2
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gr)
          grd.addColorStop(0, `rgba(${r},${g},${b},${s.alpha * 0.20})`)
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(s.x, s.y, gr, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()

          // Cross-sparkle lines on very bright stars
          if (s.alpha > 0.58) {
            ctx.save()
            ctx.globalAlpha = s.alpha * 0.12
            ctx.strokeStyle = `rgb(${r},${g},${b})`
            ctx.lineWidth = 0.6
            const sl = s.size * 5
            ctx.beginPath()
            ctx.moveTo(s.x - sl, s.y); ctx.lineTo(s.x + sl, s.y)
            ctx.moveTo(s.x, s.y - sl); ctx.lineTo(s.x, s.y + sl)
            ctx.stroke()
            ctx.restore()
          }
        }
      })
    }

    /* ── draw cloud wisps ───────────────────────────────────────────── */
    function drawClouds() {
      clouds.forEach(c => {
        c.x += c.spd
        if (c.x - c.w * 0.5 > W + 60) c.x = -c.w * 0.5 - 60

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.scale(1, c.h / (c.w * 0.5))
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, c.w * 0.5)
        grd.addColorStop(0,    `rgba(175,205,240,${c.a})`)
        grd.addColorStop(0.38, `rgba(158,192,232,${c.a * 0.55})`)
        grd.addColorStop(0.70, `rgba(140,178,225,${c.a * 0.22})`)
        grd.addColorStop(1,    'rgba(125,165,220,0)')
        ctx.beginPath()
        ctx.arc(0, 0, c.w * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
        ctx.restore()
      })
    }

    /* ── draw moon ──────────────────────────────────────────────────── */
    function drawMoon() {
      const mx = MOON_OX * W
      // Subtle breathing float
      const my = MOON_OY * H + Math.sin(frame * 0.00028) * 9

      // ── Layer 1: giant outer atmospheric halo ──
      const haloOuter = ctx.createRadialGradient(mx, my, MOON_R * 1.2, mx, my, MOON_R * 16)
      haloOuter.addColorStop(0,    'rgba(195,220,255,0.048)')
      haloOuter.addColorStop(0.18, 'rgba(178,210,255,0.028)')
      haloOuter.addColorStop(0.40, 'rgba(160,198,255,0.012)')
      haloOuter.addColorStop(0.65, 'rgba(145,188,255,0.004)')
      haloOuter.addColorStop(1,    'rgba(130,178,255,0)')
      ctx.beginPath()
      ctx.arc(mx, my, MOON_R * 16, 0, Math.PI * 2)
      ctx.fillStyle = haloOuter
      ctx.fill()

      // ── Layer 2: diffraction ring (classic moon halo) ──
      const ringR = MOON_R * 7.5
      const ring  = ctx.createRadialGradient(mx, my, ringR * 0.82, mx, my, ringR * 1.18)
      ring.addColorStop(0,   'rgba(200,225,255,0)')
      ring.addColorStop(0.4, 'rgba(210,230,255,0.028)')
      ring.addColorStop(0.5, 'rgba(220,238,255,0.055)')
      ring.addColorStop(0.6, 'rgba(210,230,255,0.028)')
      ring.addColorStop(1,   'rgba(200,225,255,0)')
      ctx.beginPath()
      ctx.arc(mx, my, ringR * 1.18, 0, Math.PI * 2)
      ctx.fillStyle = ring
      ctx.fill()

      // ── Layer 3: inner corona glow ──
      const corona = ctx.createRadialGradient(mx, my, MOON_R * 0.9, mx, my, MOON_R * 3.2)
      corona.addColorStop(0,   'rgba(245,252,255,0.55)')
      corona.addColorStop(0.30,'rgba(230,245,255,0.28)')
      corona.addColorStop(0.65,'rgba(210,235,255,0.10)')
      corona.addColorStop(1,   'rgba(195,225,255,0)')
      ctx.beginPath()
      ctx.arc(mx, my, MOON_R * 3.2, 0, Math.PI * 2)
      ctx.fillStyle = corona
      ctx.fill()

      // ── Layer 4: moon disc ──
      // Off-center light source gives 3D look
      const disc = ctx.createRadialGradient(
        mx - MOON_R * 0.22, my - MOON_R * 0.28, MOON_R * 0.08,
        mx + MOON_R * 0.08, my + MOON_R * 0.10, MOON_R * 1.05
      )
      disc.addColorStop(0,    'rgba(252,255,255,1)')
      disc.addColorStop(0.38, 'rgba(242,250,255,0.99)')
      disc.addColorStop(0.72, 'rgba(222,240,255,0.97)')
      disc.addColorStop(0.90, 'rgba(202,228,255,0.95)')
      disc.addColorStop(1,    'rgba(185,215,255,0.92)')
      ctx.beginPath()
      ctx.arc(mx, my, MOON_R, 0, Math.PI * 2)
      ctx.fillStyle = disc
      ctx.fill()

      // ── Layer 5: crater / mare markings ──
      ctx.save()
      ctx.beginPath()
      ctx.arc(mx, my, MOON_R, 0, Math.PI * 2)
      ctx.clip()
      craters.forEach(([dx, dy, r, d]) => {
        const cx2 = mx + dx * MOON_R
        const cy2 = my + dy * MOON_R
        const cr  = r  * MOON_R
        // Each mare is a soft dark patch
        const mg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, cr)
        mg.addColorStop(0,   `rgba(130,158,195,${d})`)
        mg.addColorStop(0.6, `rgba(145,170,205,${d * 0.45})`)
        mg.addColorStop(1,   `rgba(160,182,215,0)`)
        ctx.beginPath()
        ctx.arc(cx2, cy2, cr, 0, Math.PI * 2)
        ctx.fillStyle = mg
        ctx.fill()
      })
      ctx.restore()

      // ── Layer 6: limb darkening (realistic edge shadow) ──
      const limb = ctx.createRadialGradient(
        mx - MOON_R * 0.15, my - MOON_R * 0.20, MOON_R * 0.55,
        mx, my, MOON_R
      )
      limb.addColorStop(0,   'rgba(255,255,255,0)')
      limb.addColorStop(0.75,'rgba(160,195,235,0.05)')
      limb.addColorStop(1,   'rgba(100,150,210,0.18)')
      ctx.beginPath()
      ctx.arc(mx, my, MOON_R, 0, Math.PI * 2)
      ctx.fillStyle = limb
      ctx.fill()

      // ── Layer 7: specular highlight (tiny bright spot) ──
      const spec = ctx.createRadialGradient(
        mx - MOON_R * 0.28, my - MOON_R * 0.32, 0,
        mx - MOON_R * 0.28, my - MOON_R * 0.32, MOON_R * 0.32
      )
      spec.addColorStop(0,   'rgba(255,255,255,0.35)')
      spec.addColorStop(0.5, 'rgba(245,252,255,0.08)')
      spec.addColorStop(1,   'rgba(235,248,255,0)')
      ctx.beginPath()
      ctx.arc(mx, my, MOON_R, 0, Math.PI * 2)
      ctx.fillStyle = spec
      ctx.fill()
    }

    /* ── draw meteors ───────────────────────────────────────────────── */
    function drawMeteors() {
      meteors = meteors.filter(m => m.life > 0)
      meteors.forEach(m => {
        m.x += m.vx; m.y += m.vy; m.life -= 0.015
        const mag = Math.hypot(m.vx, m.vy)
        const tx  = m.x - (m.vx / mag) * m.len
        const ty  = m.y - (m.vy / mag) * m.len
        const [r,g,b] = m.col

        // Core trail
        const grd = ctx.createLinearGradient(m.x, m.y, tx, ty)
        grd.addColorStop(0,    `rgba(${r},${g},${b},${m.life * 0.95})`)
        grd.addColorStop(0.22, `rgba(${r},${g},${b},${m.life * 0.62})`)
        grd.addColorStop(0.58, `rgba(${r},${g},${b},${m.life * 0.22})`)
        grd.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty)
        ctx.strokeStyle = grd; ctx.lineWidth = 1.8; ctx.stroke()

        // Soft wide glow trail
        const grd2 = ctx.createLinearGradient(m.x, m.y, tx, ty)
        grd2.addColorStop(0,  `rgba(${r},${g},${b},${m.life * 0.18})`)
        grd2.addColorStop(1,  `rgba(${r},${g},${b},0)`)
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty)
        ctx.strokeStyle = grd2; ctx.lineWidth = 6; ctx.stroke()

        // Head glow
        const hgrd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 7)
        hgrd.addColorStop(0,   `rgba(255,255,255,${m.life * 0.95})`)
        hgrd.addColorStop(0.4, `rgba(${r},${g},${b},${m.life * 0.55})`)
        hgrd.addColorStop(1,   `rgba(${r},${g},${b},0)`)
        ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, Math.PI * 2)
        ctx.fillStyle = hgrd; ctx.fill()

        // Bright core dot
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${m.life})`; ctx.fill()
      })

      if (--nextMeteor <= 0 && meteors.length < 2) {
        meteors.push(makeMeteor())
        nextMeteor = randI(110, 240)
      }
    }

    /* ── main loop ──────────────────────────────────────────────────── */
    function loop() {
      frame++
      drawSky()
      drawMoonlight()
      drawNebulae()
      drawBandStars()
      drawStars()
      drawClouds()
      drawMoon()
      drawMeteors()
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
