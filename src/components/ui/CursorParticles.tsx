'use client'

import React, { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    originX: number
    originY: number
    color: string
    size: number
    vx: number
    vy: number
    ease: number
    friction: number
    dx: number
    dy: number
    distance: number
    force: number
    angle: number
}

export const CursorParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []

        const mouse = {
            x: -9999,
            y: -9999,
            isActive: false,
            radius: 150 // Interaction radius
        }

        // Colors matching the theme (Purples, Violets, Indigos)
        const colors = [
            '#d946ef', // Primary 500
            '#a21caf', // Primary 700
            '#8b5cf6', // Indigo 500
            '#6366f1', // Violet 500
            '#c026d3', // Primary 600
        ]

        const initParticles = () => {
            particles = []
            // Density: Screen area / constant
            // Adjust density for performance
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 10000)

            for (let i = 0; i < numberOfParticles; i++) {
                const size = Math.random() * 2 + 1
                const x = Math.random() * canvas.width
                const y = Math.random() * canvas.height
                const color = colors[Math.floor(Math.random() * colors.length)]

                particles.push({
                    x,
                    y,
                    originX: x,
                    originY: y,
                    color,
                    size,
                    vx: 0,
                    vy: 0,
                    ease: 0.1,
                    friction: 0.95,
                    dx: 0,
                    dy: 0,
                    distance: 0,
                    force: 0,
                    angle: 0
                })
            }
        }

        const handleResize = () => {
            // Use parent element dimensions if available, else window
            // Since we want to cover the Hero section, we rely on the canvas filling the parent div
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.offsetWidth
                canvas.height = parent.offsetHeight
            } else {
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
            }
            initParticles()
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach(particle => {
                const dx = mouse.x - particle.x
                const dy = mouse.y - particle.y
                const distance = Math.hypot(dx, dy)

                // Physics logic
                const maxDistance = mouse.radius
                let force = (maxDistance - distance) / maxDistance

                if (force < 0) force = 0

                const forceDirectionX = dx / distance
                const forceDirectionY = dy / distance

                // Repulsion strength
                const strength = 10
                const directionX = forceDirectionX * force * strength
                const directionY = forceDirectionY * force * strength

                if (distance < mouse.radius) {
                    particle.vx -= directionX
                    particle.vy -= directionY
                } else {
                    // Return to origin
                    if (particle.x !== particle.originX) {
                        const dxOrigin = particle.x - particle.originX
                        particle.vx -= dxOrigin * 0.05
                    }
                    if (particle.y !== particle.originY) {
                        const dyOrigin = particle.y - particle.originY
                        particle.vy -= dyOrigin * 0.05
                    }
                }

                particle.vx *= particle.friction
                particle.vy *= particle.friction

                particle.x += particle.vx
                particle.y += particle.vy

                // Draw
                ctx.fillStyle = particle.color
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        const onMouseMove = (e: MouseEvent) => {
            if (!canvas) return
            const rect = canvas.getBoundingClientRect()
            // Fix: we need to handle scroll offsets if we use clientX/Y but getBoundingClientRect helper handles viewport relativity.
            // However, for a fixed/absolute canvas in a specific section, we need to map mouse correctly.
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
            mouse.isActive = true
        }

        const onMouseLeave = () => {
            mouse.isActive = false
            mouse.x = -9999
            mouse.y = -9999
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', onMouseMove)
        // window.addEventListener('mouseleave', onMouseLeave) 

        handleResize()
        animate()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', onMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            aria-hidden="true"
        />
    )
}
