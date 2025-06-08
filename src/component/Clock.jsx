import React, { useEffect, useRef } from 'react'
import clockDial from '../assets/images/clockDial.png'

const WIDTH = 330
const HEIGHT = 330
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2

const ROMAN_NUMERALS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
]
const NUMERAL_RADIUS = 120
const NUMERAL_COUNT = ROMAN_NUMERALS.length

const SPARKLE_COUNT = 24

const GLYPHS = '✧✦✩✪✫✬✭✮✯✰'
const SPELL_GLYPHS = 'ᚠᚢᚦᚨᚱᚲᚷᚹᛉᛋ'

const Clock = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(0)
  const rotation = useRef(0)
  const numerals = useRef([])
  const sparkles = useRef([])
  const glyphTrail = useRef([])

  // Mouse state
  const mouse = useRef({ x: CENTER_X, y: CENTER_Y, active: false })

  // Initialize numerals and sparkles
  useEffect(() => {
    numerals.current = Array.from({ length: NUMERAL_COUNT }).map((_, i) => ({
      angle: (2 * Math.PI * i) / NUMERAL_COUNT,
      baseAngle: (2 * Math.PI * i) / NUMERAL_COUNT,
      radius: NUMERAL_RADIUS,
      scatter: 0,
      scatterAngle: 0,
      glow: false,
    }))
    sparkles.current = Array.from({ length: SPARKLE_COUNT }).map(() => ({
      angle: Math.random() * 2 * Math.PI,
      distance: 60 + Math.random() * 110,
      speed: 0.005 + Math.random() * 0.01,
      alpha: 0.5 + Math.random() * 0.5,
      radius: 1 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#fff' : '#00e0ff'
    }))
  }, [])

  // Mouse events (now on mouse move, not drag)
  useEffect(() => {
    const canvas = canvasRef.current

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
      mouse.current.active = true

      // Add spell glyphs to trail on every mouse move
      glyphTrail.current.push({
        x: mouse.current.x,
        y: mouse.current.y,
        glyph: SPELL_GLYPHS[Math.floor(Math.random() * SPELL_GLYPHS.length)],
        alpha: 1,
      })
    }
    function handleMouseLeave() {
      mouse.current.active = false
    }
    function handleClick() {
      // Scatter numerals
      numerals.current.forEach(n => {
        n.scatter = 1 + Math.random() * 2
        n.scatterAngle = Math.random() * 2 * Math.PI
      })
      // Burst sparkles
      sparkles.current.forEach(s => {
        s.distance = 60 + Math.random() * 110
        s.angle = Math.random() * 2 * Math.PI
      })
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleClick)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    img.src = clockDial

    img.onload = () => {
      function draw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT)
        ctx.drawImage(img, 0, 0, WIDTH, HEIGHT)

        // Animate rotation
        rotation.current += 0.008

        // Outer glowing ring
        ctx.save()
        ctx.beginPath()
        ctx.arc(CENTER_X, CENTER_Y, 155, 0, 2 * Math.PI)
        ctx.strokeStyle = '#00e0ff'
        ctx.lineWidth = 4
        ctx.shadowColor = '#00e0ff'
        ctx.shadowBlur = 24
        ctx.stroke()
        ctx.restore()

        // Inner glowing ring
        ctx.save()
        ctx.beginPath()
        ctx.arc(CENTER_X, CENTER_Y, 130, 0, 2 * Math.PI)
        ctx.strokeStyle = '#fff700'
        ctx.lineWidth = 3
        ctx.shadowColor = '#fff700'
        ctx.shadowBlur = 18
        ctx.stroke()
        ctx.restore()

        // Floating Roman numerals
        ctx.save()
        ctx.translate(CENTER_X, CENTER_Y)
        numerals.current.forEach((n, i) => {
          // Repel from mouse if close
          let dx = CENTER_X + Math.cos(n.angle + rotation.current) * n.radius - mouse.current.x
          let dy = CENTER_Y + Math.sin(n.angle + rotation.current) * n.radius - mouse.current.y
          let dist = Math.sqrt(dx * dx + dy * dy)
          let repel = 0
          if (mouse.current.active && dist < 40) {
            repel = (40 - dist) * 2
          }
          // Scatter effect
          if (n.scatter > 0.01) {
            n.radius += Math.sin(performance.now() / 100) * n.scatter
            n.scatter *= 0.95
          } else {
            n.scatter = 0
          }
          // Draw numeral
          ctx.save()
          let angle = n.angle + rotation.current
          let r = n.radius + repel
          ctx.rotate(angle)
          ctx.font = '20px serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = '#fff'
          ctx.shadowBlur = mouse.current.active && dist < 40 ? 18 : 8
          ctx.fillStyle = '#fff'
          ctx.fillText(ROMAN_NUMERALS[i], 0, -r)
          ctx.restore()
        })
        ctx.restore()

        // Magic sparkles/wisps
        ctx.save()
        ctx.translate(CENTER_X, CENTER_Y)
        sparkles.current.forEach(s => {
          // Move sparkles
          s.angle += s.speed
          // Mouse interaction: attract/repel
          let x = Math.cos(s.angle) * s.distance
          let y = Math.sin(s.angle) * s.distance
          if (mouse.current.active) {
            let dx = CENTER_X + x - mouse.current.x
            let dy = CENTER_Y + y - mouse.current.y
            let dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 60) {
              let repel = (60 - dist) * 0.1
              x += dx / dist * repel
              y += dy / dist * repel
            }
          }
          ctx.save()
          ctx.globalAlpha = s.alpha
          ctx.beginPath()
          ctx.arc(x, y, s.radius, 0, 2 * Math.PI)
          ctx.fillStyle = s.color
          ctx.shadowColor = s.color
          ctx.shadowBlur = 12
          ctx.fill()
          ctx.restore()
        })
        ctx.restore()

        // Glyph trail (on mouse move, using SPELL_GLYPHS)
        glyphTrail.current.forEach((g, i) => {
          ctx.save()
          ctx.globalAlpha = g.alpha
          ctx.font = '22px serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = '#fff700'
          ctx.shadowBlur = 10
          ctx.fillStyle = '#fff700'
          ctx.fillText(g.glyph, g.x, g.y)
          ctx.restore()
          g.alpha -= 0.02
        })
        // Remove faded glyphs
        glyphTrail.current = glyphTrail.current.filter(g => g.alpha > 0.05)

        // --- Existing magic circle animation ---
        // Outer rotating runes (cyan/blue)
        ctx.save()
        ctx.translate(CENTER_X, CENTER_Y)
        ctx.rotate(rotation.current)
        ctx.font = '22px serif'
        ctx.fillStyle = '#fff'
        let runes = '✧✦✩✪✫✬✭✮✯✰'
        let runeCount = 16
        for (let i = 0; i < runeCount; i++) {
          const angle = (2 * Math.PI * i) / runeCount
          ctx.save()
          ctx.rotate(angle)
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = '#00e0ff'
          ctx.shadowBlur = 10
          ctx.fillText(runes[i % runes.length], 0, -142)
          ctx.restore()
        }
        ctx.restore()

        // Inner rotating runes (yellow)
        ctx.save()
        ctx.translate(CENTER_X, CENTER_Y)
        ctx.rotate(-rotation.current * 1.5)
        ctx.font = '18px serif'
        ctx.fillStyle = '#fff700'
        let innerRuneCount = 10
        for (let i = 0; i < innerRuneCount; i++) {
          const angle = (2 * Math.PI * i) / innerRuneCount
          ctx.save()
          ctx.rotate(angle)
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.shadowColor = '#fff700'
          ctx.shadowBlur = 12
          ctx.fillText(runes[i % runes.length], 0, -110)
          ctx.restore()
        }
        ctx.restore()

        // Magic lines (spokes)
        ctx.save()
        ctx.translate(CENTER_X, CENTER_Y)
        ctx.rotate(-rotation.current * 1.5)
        for (let i = 0; i < 8; i++) {
          ctx.save()
          ctx.rotate((Math.PI * 2 * i) / 8)
          ctx.beginPath()
          ctx.moveTo(0, -120)
          ctx.lineTo(0, -155)
          ctx.strokeStyle = 'rgba(0,224,255,0.5)'
          ctx.lineWidth = 2
          ctx.shadowColor = '#00e0ff'
          ctx.shadowBlur = 8
          ctx.stroke()
          ctx.restore()
        }
        ctx.restore()

        // Inner magic glyph
        ctx.save()
        ctx.beginPath()
        ctx.arc(CENTER_X, CENTER_Y, 100, 0, 2 * Math.PI)
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([8, 8])
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = 6
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()

        animationRef.current = requestAnimationFrame(draw)
      }
      draw()
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ cursor: 'pointer' }} />
  )
}

export default Clock