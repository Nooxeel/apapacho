'use client'

import React, { useEffect, useRef, useState } from 'react'

// ── Constants ────────────────────────────────────────────────────
const COLORS = ['#d946ef', '#a21caf', '#8b5cf6', '#6366f1', '#c026d3'] as const
const MOUSE_RADIUS = 150
const REPULSION_STRENGTH = 10
const SPRING_FACTOR = 0.05
const FRICTION = 0.95
const MAX_PARTICLES = 180          // hard cap for large screens
const DENSITY_DIVISOR = 12_000     // area / divisor = particle count
const SETTLE_THRESHOLD = 0.01      // velocity below which a particle is "at rest"
const TWO_PI = Math.PI * 2
const RESIZE_DEBOUNCE_MS = 200

// ── SoA particle storage (cache-friendly typed arrays) ──────────
interface ParticlePool {
  count: number
  x:       Float32Array
  y:       Float32Array
  originX: Float32Array
  originY: Float32Array
  vx:      Float32Array
  vy:      Float32Array
  size:    Float32Array
  colorIdx: Uint8Array   // index into COLORS
}

function createPool(w: number, h: number): ParticlePool {
  const n = Math.min(Math.floor((w * h) / DENSITY_DIVISOR), MAX_PARTICLES)
  const pool: ParticlePool = {
    count: n,
    x:        new Float32Array(n),
    y:        new Float32Array(n),
    originX:  new Float32Array(n),
    originY:  new Float32Array(n),
    vx:       new Float32Array(n),
    vy:       new Float32Array(n),
    size:     new Float32Array(n),
    colorIdx: new Uint8Array(n),
  }
  for (let i = 0; i < n; i++) {
    const px = Math.random() * w
    const py = Math.random() * h
    pool.x[i] = px
    pool.y[i] = py
    pool.originX[i] = px
    pool.originY[i] = py
    pool.vx[i] = 0
    pool.vy[i] = 0
    pool.size[i] = Math.random() * 2 + 1
    pool.colorIdx[i] = (Math.random() * COLORS.length) | 0
  }
  return pool
}

// ── Component ────────────────────────────────────────────────────
export const CursorParticles = React.memo(function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shouldRender, setShouldRender] = useState(true)

  // Bail out immediately on touch devices or reduced-motion preference
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || prefersReduced) setShouldRender(false)
  }, [])

  useEffect(() => {
    if (!shouldRender) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let frameId = 0
    let pool: ParticlePool = { count: 0, x: new Float32Array(0), y: new Float32Array(0), originX: new Float32Array(0), originY: new Float32Array(0), vx: new Float32Array(0), vy: new Float32Array(0), size: new Float32Array(0), colorIdx: new Uint8Array(0) }
    let isVisible = true
    let mouseX = -9999
    let mouseY = -9999

    // ── Resize (debounced) ───────────────────────────────────
    let resizeTimer: ReturnType<typeof setTimeout>
    const resize = () => {
      const parent = canvas.parentElement
      const w = parent ? parent.offsetWidth : window.innerWidth
      const h = parent ? parent.offsetHeight : window.innerHeight
      canvas.width = w
      canvas.height = h
      pool = createPool(w, h)
    }
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, RESIZE_DEBOUNCE_MS)
    }

    // ── Intersection Observer — pause when offscreen ─────────
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting },
      { threshold: 0 },
    )
    observer.observe(canvas)

    // ── Visibility — pause when tab hidden ───────────────────
    const onVisibility = () => {
      if (!document.hidden && isVisible) scheduleFrame()
    }

    // ── Mouse ────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    const onMouseLeave = () => {
      mouseX = -9999
      mouseY = -9999
    }

    // ── Animation loop ───────────────────────────────────────
    const animate = () => {
      if (!isVisible || document.hidden) { frameId = 0; return }

      const { count, x, y, originX, originY, vx, vy, size, colorIdx } = pool
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Batch draws by color to minimise fillStyle switches
      for (let c = 0; c < COLORS.length; c++) {
        ctx.fillStyle = COLORS[c]
        ctx.beginPath()

        for (let i = 0; i < count; i++) {
          if (colorIdx[i] !== c) continue

          // Physics
          const dx = mouseX - x[i]
          const dy = mouseY - y[i]
          const distSq = dx * dx + dy * dy
          const radiusSq = MOUSE_RADIUS * MOUSE_RADIUS

          if (distSq < radiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq)
            const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * REPULSION_STRENGTH
            vx[i] -= (dx / dist) * force
            vy[i] -= (dy / dist) * force
          } else {
            // Spring back to origin
            vx[i] -= (x[i] - originX[i]) * SPRING_FACTOR
            vy[i] -= (y[i] - originY[i]) * SPRING_FACTOR
          }

          vx[i] *= FRICTION
          vy[i] *= FRICTION
          x[i] += vx[i]
          y[i] += vy[i]

          // Sub-path (one beginPath/fill per color)
          ctx.moveTo(x[i] + size[i], y[i])
          ctx.arc(x[i], y[i], size[i], 0, TWO_PI)
        }

        ctx.fill()
      }

      frameId = requestAnimationFrame(animate)
    }

    const scheduleFrame = () => {
      if (!frameId) frameId = requestAnimationFrame(animate)
    }

    // ── Bootstrap ────────────────────────────────────────────
    resize()
    scheduleFrame()

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frameId)
      clearTimeout(resizeTimer)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [shouldRender])

  if (!shouldRender) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  )
})
