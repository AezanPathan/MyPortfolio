import React, { useRef, useEffect } from 'react'
import SpellBar from './SpellBar'
import Clock from './Clock'

const HERO_TITLE = "Hi, my name is Aezan"
const HERO_SUB = "I am a software engineer, and I love Anime , Manga and manhwa."
const SPELLS = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛉ', 'ᛋ',
  'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ', 'ᚪ', 'ᚫ'
]

const Hero = () => {
  const canvasRef = useRef(null)
  const mouseTrail = useRef([])

  // Scramble state
  const scramble = useRef(false)
  const scrambleTimeout = useRef(null)
  const scrambleInterval = useRef(null)
  const scrambleTitle = useRef(HERO_TITLE.split(''))
  const scrambleSub = useRef(HERO_SUB.split(''))

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let WIDTH = window.innerWidth
    let HEIGHT = window.innerHeight

    // Falling star particles
    let sparkles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      r: 0.5 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.5,
      speed: 1.5 + Math.random() * 2.5,
      dx: -0.5 + Math.random(),
      color: Math.random() > 0.5 ? "#ffe066" : "#00e0ff"
    }))

    // Mouse trail logic
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouseTrail.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        alpha: 1,
        radius: 18 + Math.random() * 10,
        color: Math.random() > 0.5 ? "#ffe066" : "#00e0ff"
      })
      if (mouseTrail.current.length > 60) mouseTrail.current.shift()
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    // Scramble logic
    function startScramble() {
      scramble.current = true
      scrambleInterval.current = setInterval(() => {
        scrambleTitle.current = HERO_TITLE.split('').map(ch =>
          ch === ' ' ? ' ' : SPELLS[Math.floor(Math.random() * SPELLS.length)]
        )
        scrambleSub.current = HERO_SUB.split('').map(ch =>
          ch === ' ' ? ' ' : SPELLS[Math.floor(Math.random() * SPELLS.length)]
        )
      }, 50)
      scrambleTimeout.current = setTimeout(() => {
        scramble.current = false
        clearInterval(scrambleInterval.current)
        scrambleTitle.current = HERO_TITLE.split('')
        scrambleSub.current = HERO_SUB.split('')
        scrambleTimeout.current = setTimeout(startScramble, 2000)
      }, 700)
    }
    scrambleTimeout.current = setTimeout(startScramble, 2000)

    function drawBackground() {
      // Gradient background
      let grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
      grad.addColorStop(0, "#181b2a")
      grad.addColorStop(0.5, "#23254a")
      grad.addColorStop(1, "#1a1e2e")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // Falling stars
      sparkles.forEach(s => {
        ctx.save()
        ctx.globalAlpha = s.alpha
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI)
        ctx.fillStyle = s.color
        ctx.shadowColor = s.color
        ctx.shadowBlur = 12
        ctx.fill()
        // Draw star tail
        ctx.globalAlpha = s.alpha * 0.4
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.dx * 18, s.y - s.speed * 8)
        ctx.strokeStyle = s.color
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()
        // Animate falling
        s.x += s.dx
        s.y += s.speed
        if (s.x < 0 || s.x > WIDTH || s.y > HEIGHT) {
          s.x = Math.random() * WIDTH
          s.y = -10
          s.r = 0.5 + Math.random() * 1.5
          s.alpha = 0.2 + Math.random() * 0.5
          s.speed = 1.5 + Math.random() * 2.5
          s.dx = -0.5 + Math.random()
          s.color = Math.random() > 0.5 ? "#ffe066" : "#00e0ff"
        }
      })

      // Mouse trail
      for (let i = 0; i < mouseTrail.current.length; i++) {
        const t = mouseTrail.current[i]
        ctx.save()
        ctx.globalAlpha = t.alpha
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.radius, 0, 2 * Math.PI)
        ctx.fillStyle = t.color
        ctx.shadowColor = t.color
        ctx.shadowBlur = 24
        ctx.fill()
        ctx.restore()
        t.alpha -= 0.025
        t.radius *= 0.97
      }
      mouseTrail.current = mouseTrail.current.filter(t => t.alpha > 0.05 && t.radius > 2)
    }

    function drawStaticText() {
      // Big, glowing, matching color text
      ctx.save()
      ctx.font = "bold 54px serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.shadowColor = "#00e0ff"
      ctx.shadowBlur = 32
      ctx.fillStyle = "#00e0ff"
      ctx.fillText(
        scramble.current ? scrambleTitle.current.join('') : HERO_TITLE,
        180,
        120
      )
      ctx.restore()

      ctx.save()
      ctx.font = "32px serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.shadowColor = "#00e0ff"
      ctx.shadowBlur = 18
      ctx.fillStyle = "#00e0ff"
      ctx.fillText(
        scramble.current ? scrambleSub.current.join('') : HERO_SUB,
        180,
        200
      )
      ctx.restore()
    }

    function animate() {
      ctx.clearRect(0, 0, WIDTH, HEIGHT)
      drawBackground()
      drawStaticText()
      requestAnimationFrame(animate)
    }
    animate()

    // Resize canvas on window resize
    const handleResize = () => {
      WIDTH = window.innerWidth
      HEIGHT = window.innerHeight
      canvas.width = WIDTH
      canvas.height = HEIGHT
    }
    window.addEventListener('resize', handleResize)

    // Hide scrollbars on body and html
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('resize', handleResize)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      canvas.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(scrambleTimeout.current)
      clearInterval(scrambleInterval.current)
    }
  }, [])

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        position: "relative"
      }}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          display: "block",
          width: "100vw",
          height: "100vh",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 1
        }}
      />
      <SpellBar height={window.innerHeight} left={40} />
      <div style={{
        position: "absolute",
        right: 60,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2
      }}>
        <Clock />
      </div>
    </div>
  )
}

export default Hero