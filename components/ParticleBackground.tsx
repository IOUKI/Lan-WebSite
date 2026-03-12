'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    const PARTICLE_COUNT = 80
    const CONNECTION_DIST = 120
    let mouse = { x: -1000, y: -1000 }

    const resize = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      // Skip if size hasn't actually changed (avoids mobile overscroll flicker)
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      // Clamp existing particles to new bounds instead of reinitializing
      for (const p of particles) {
        if (p.x > w) p.x = Math.random() * w
        if (p.y > h) p.y = Math.random() * h
      }
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const isDark = document.documentElement.classList.contains('dark')
      const lineColor = isDark ? '100, 200, 255' : '30, 100, 180'
      const dotColor = isDark ? '100, 200, 255' : '30, 100, 180'

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.3
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // mouse connection
        const dxm = particles[i].x - mouse.x
        const dym = particles[i].y - mouse.y
        const distm = Math.sqrt(dxm * dxm + dym * dym)
        if (distm < 180) {
          const alpha = (1 - distm / 180) * 0.6
          ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }

      // draw particles
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dotColor}, ${p.opacity})`
        ctx.fill()
      }
    }

    const update = () => {
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }
    }

    const loop = () => {
      update()
      draw()
      animationId = requestAnimationFrame(loop)
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse = { x: -1000, y: -1000 }
    }

    resize()
    initParticles()
    loop()

    const handleResize = () => { resize() }
    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouse)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouse)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
    />
  )
}

export default ParticleBackground
