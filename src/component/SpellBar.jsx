import React, { useRef, useEffect, useState } from 'react'

const SPELLS = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛉ', 'ᛋ',
  'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ', 'ᚪ', 'ᚫ'
]

const SpellBar = ({ height = window.innerHeight, left = 40 }) => {
  const canvasRef = useRef(null)
  const [hover, setHover] = useState(false)
  const BAR_WIDTH = 80
  const spellCount = SPELLS.length

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.height = window.innerHeight
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = BAR_WIDTH

    // For spell animation
    let spellOffsets = Array.from({ length: spellCount }, (_, i) => Math.random() * height)

    function draw() {
      ctx.clearRect(0, 0, width, canvas.height)

      // Bar background
      ctx.save()
      ctx.globalAlpha = hover ? 0.92 : 0.8
      ctx.fillStyle = hover ? '#222a' : '#111a'
      ctx.shadowColor = hover ? '#ffe066' : '#00e0ff'
      ctx.shadowBlur = hover ? 32 : 16
      ctx.fillRect(0, 0, width, canvas.height)
      ctx.restore()

      // Spells/scripts with animation
      for (let i = 0; i < spellCount; i++) {
        // Animate each spell up the bar, looping
        spellOffsets[i] -= hover ? 1.5 : 0.7
        if (spellOffsets[i] < -40) spellOffsets[i] = canvas.height + 40

        ctx.save()
        ctx.font = hover ? '38px serif' : '30px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = hover ? '#ffe066' : '#fff'
        ctx.shadowColor = hover ? '#ffe066' : '#00e0ff'
        ctx.shadowBlur = hover ? 18 : 10
        ctx.globalAlpha = 0.85
        ctx.translate(width / 2, spellOffsets[i])
        // Wiggle on hover
        if (hover) {
          ctx.rotate(Math.sin(Date.now() / 400 + i) * 0.08)
        }
        ctx.fillText(SPELLS[i], 0, 0)
        ctx.restore()
      }

      // Glowing border
      ctx.save()
      ctx.strokeStyle = hover ? '#ffe066' : '#00e0ff'
      ctx.lineWidth = hover ? 6 : 3
      ctx.shadowColor = ctx.strokeStyle
      ctx.shadowBlur = hover ? 24 : 12
      ctx.strokeRect(0, 0, width, canvas.height)
      ctx.restore()

      requestAnimationFrame(draw)
    }
    draw()
    return () => ctx && ctx.clearRect(0, 0, width, canvas.height)
  }, [hover, height])

  return (
    <canvas
      ref={canvasRef}
      width={BAR_WIDTH}
      height={height}
      style={{
        position: 'fixed',
        left: left,
        top: 0,
        zIndex: 10,
        borderRadius: 20,
        cursor: 'pointer',
        background: 'transparent',
        transition: 'box-shadow 0.3s',
        boxShadow: hover ? '0 0 32px #ffe06688' : '0 0 16px #00e0ff44'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    />
  )
}

export default SpellBar