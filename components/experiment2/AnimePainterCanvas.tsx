'use client'

import { useEffect, useRef } from 'react'

type AnimePainterCanvasProps = {
  progress: number
}

type CloudBlob = {
  ox: number
  oy: number
  r: number
}

type CloudCluster = {
  x: number
  y: number
  scale: number
  drift: number
  wobble: number
  alpha: number
  blobs: CloudBlob[]
}

type BrushStroke = {
  x: number
  y: number
  len: number
  width: number
  rot: number
  alpha: number
  speed: number
  tint: number
}

type Ember = {
  orbit: number
  angle: number
  speed: number
  size: number
  lifeOffset: number
  tilt: number
}

type DrawOrbOptions = {
  x: number
  y: number
  radius: number
  time: number
  hue: 'blue' | 'pink' | 'purple'
  visibility: number
  embers: Ember[]
  auraStrength: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function hardCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  roughness: number,
  seedOffset: number,
  time: number
) {
  const steps = 18
  ctx.beginPath()
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2
    const wobble = 1 + Math.sin(a * 3 + seedOffset + time * 0.5) * roughness
    const r = radius * wobble
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
}

function drawSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  alpha: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.65, 0)
  ctx.lineTo(0, size)
  ctx.lineTo(-size * 0.65, 0)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawCelOrb(ctx: CanvasRenderingContext2D, options: DrawOrbOptions) {
  const { x, y, radius, time, hue, visibility, embers, auraStrength } = options

  if (visibility <= 0) {
    return
  }

  const palette =
    hue === 'blue'
      ? {
          dark: '#0d4a9f',
          mid: '#2288ff',
          light: '#65c2ff',
          flash: '#e8f7ff',
          aura: '#3fb3ff',
          ember: '#9dd8ff',
          outline: '#062a58',
        }
      : hue === 'pink'
        ? {
            dark: '#8f1246',
            mid: '#ff2266',
            light: '#ff86a7',
            flash: '#ffe9f0',
            aura: '#ff5d94',
            ember: '#ffd4e0',
            outline: '#4f0b26',
          }
        : {
            dark: '#421576',
            mid: '#8833ee',
            light: '#b98cff',
            flash: '#f2e7ff',
            aura: '#aa55ff',
            ember: '#e4ccff',
            outline: '#240b42',
          }

  const auraLayers = 16
  for (let i = 0; i < auraLayers; i += 1) {
    const pct = i / auraLayers
    const angle = pct * Math.PI * 2
    const wave = Math.sin(time * 1.4 + i * 0.9) * 0.35
    const pulse = 1 + Math.sin(time * 2.1 + i * 1.2) * 0.16
    const tendrilLen = radius * mix(1.45, 1.95, pct) * pulse * auraStrength

    ctx.save()
    ctx.globalAlpha = visibility * (0.15 - pct * 0.008)
    ctx.strokeStyle = palette.aura
    ctx.lineWidth = mix(2.8, 1.2, pct)
    ctx.beginPath()

    const sx = x + Math.cos(angle) * radius * 1.05
    const sy = y + Math.sin(angle) * radius * 1.05
    const cx = x + Math.cos(angle + wave) * tendrilLen
    const cy = y + Math.sin(angle + wave) * tendrilLen
    const ex = x + Math.cos(angle + wave * 0.4) * radius * 1.25
    const ey = y + Math.sin(angle + wave * 0.4) * radius * 1.25

    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(cx, cy, ex, ey)
    ctx.stroke()
    ctx.restore()
  }

  for (let i = 0; i < embers.length; i += 1) {
    const ember = embers[i]
    const life = (time * ember.speed + ember.lifeOffset) % 1
    const dist = radius * (1.2 + ember.orbit * life)
    const a = ember.angle + life * (1.4 + ember.orbit * 0.5)
    const ex = x + Math.cos(a) * dist
    const ey = y + Math.sin(a) * dist
    const alpha = visibility * (1 - life) * 0.85
    const size = ember.size * (1 - life * 0.35)

    drawSpark(ctx, ex, ey, size, ember.tilt + life * 1.6, palette.ember, alpha)
  }

  ctx.save()
  ctx.globalAlpha = visibility
  hardCircle(ctx, x, y, radius, 0.03, 1.0, time)
  ctx.fillStyle = palette.dark
  ctx.fill()

  ctx.save()
  hardCircle(ctx, x, y, radius, 0.03, 3.3, time)
  ctx.clip()

  ctx.fillStyle = palette.mid
  hardCircle(ctx, x - radius * 0.14, y - radius * 0.1, radius * 0.92, 0.03, 2.1, time)
  ctx.fill()

  ctx.fillStyle = palette.light
  hardCircle(ctx, x - radius * 0.2, y - radius * 0.22, radius * 0.62, 0.03, 5.1, time)
  ctx.fill()

  ctx.fillStyle = palette.flash
  hardCircle(ctx, x - radius * 0.26, y - radius * 0.36, radius * 0.24, 0.06, 6.7, time)
  ctx.fill()
  ctx.restore()

  ctx.lineWidth = 3
  ctx.strokeStyle = palette.outline
  hardCircle(ctx, x, y, radius, 0.03, 1.0, time)
  ctx.stroke()
  ctx.restore()
}

export default function AnimePainterCanvas({ progress }: AnimePainterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const rng = seeded(42)
    const clouds: CloudCluster[] = Array.from({ length: 9 }, () => ({
      x: 0.08 + rng() * 0.84,
      y: 0.06 + rng() * 0.55,
      scale: 0.18 + rng() * 0.24,
      drift: 0.03 + rng() * 0.06,
      wobble: rng() * Math.PI * 2,
      alpha: 0.22 + rng() * 0.34,
      blobs: Array.from({ length: 7 + Math.floor(rng() * 6) }, () => ({
        ox: (rng() - 0.5) * 1.7,
        oy: (rng() - 0.5) * 0.75,
        r: 0.34 + rng() * 0.62,
      })),
    }))

    const strokes: BrushStroke[] = Array.from({ length: 48 }, () => ({
      x: rng(),
      y: rng() * 0.78,
      len: 0.08 + rng() * 0.2,
      width: 6 + rng() * 22,
      rot: (rng() - 0.5) * 0.7,
      alpha: 0.03 + rng() * 0.04,
      speed: 0.2 + rng() * 0.6,
      tint: rng(),
    }))

    const blueEmbers: Ember[] = Array.from({ length: 34 }, () => ({
      orbit: 0.5 + rng() * 1.15,
      angle: rng() * Math.PI * 2,
      speed: 0.22 + rng() * 0.7,
      size: 1.6 + rng() * 3,
      lifeOffset: rng(),
      tilt: rng() * Math.PI,
    }))

    const pinkEmbers: Ember[] = Array.from({ length: 34 }, () => ({
      orbit: 0.45 + rng() * 1.1,
      angle: rng() * Math.PI * 2,
      speed: 0.24 + rng() * 0.68,
      size: 1.4 + rng() * 2.8,
      lifeOffset: rng(),
      tilt: rng() * Math.PI,
    }))

    const grainCanvas = document.createElement('canvas')
    grainCanvas.width = 220
    grainCanvas.height = 220
    const grainCtx = grainCanvas.getContext('2d')
    if (!grainCtx) {
      return
    }

    const grainImage = grainCtx.createImageData(grainCanvas.width, grainCanvas.height)
    for (let i = 0; i < grainImage.data.length; i += 4) {
      const tone = Math.floor(212 + rng() * 43)
      const alpha = Math.floor(8 + rng() * 26)
      grainImage.data[i] = tone
      grainImage.data[i + 1] = tone
      grainImage.data[i + 2] = tone + 3
      grainImage.data[i + 3] = alpha
    }
    grainCtx.putImageData(grainImage, 0, 0)

    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawBurst = (
      centerX: number,
      centerY: number,
      radius: number,
      spikes: number,
      roughness: number,
      color: string,
      alpha: number,
      rotation: number
    ) => {
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i += 1) {
        const angle = (i / (spikes * 2)) * Math.PI * 2
        const spike = i % 2 === 0 ? 1 : roughness
        const r = radius * spike
        const px = Math.cos(angle) * r
        const py = Math.sin(angle) * r
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    let raf = 0
    const render = (now: number) => {
      const time = now * 0.001
      const p = clamp(progressRef.current, 0, 1)

      const converge = smoothstep(0.07, 0.28, p)
      const swirl = smoothstep(0.24, 0.52, p) * (1 - smoothstep(0.57, 0.74, p))
      const explosion = smoothstep(0.63, 0.76, p) * (1 - smoothstep(0.78, 0.9, p))
      const dusk = smoothstep(0.5, 0.94, p)
      const calm = smoothstep(0.8, 1, p)

      const skyTopR = Math.round(mix(115, 14, dusk))
      const skyTopG = Math.round(mix(194, 32, dusk))
      const skyTopB = Math.round(mix(240, 71, dusk))
      const skyBottomR = Math.round(mix(92, 44, dusk))
      const skyBottomG = Math.round(mix(168, 66, dusk))
      const skyBottomB = Math.round(mix(229, 146, dusk))

      const skyGradient = ctx.createLinearGradient(0, 0, 0, height)
      skyGradient.addColorStop(0, `rgb(${skyTopR}, ${skyTopG}, ${skyTopB})`)
      skyGradient.addColorStop(0.62, `rgb(${skyBottomR}, ${skyBottomG}, ${skyBottomB})`)
      skyGradient.addColorStop(
        1,
        `rgb(${Math.round(mix(126, 106, dusk))}, ${Math.round(mix(190, 114, dusk))}, ${Math.round(mix(235, 186, dusk))})`
      )

      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < strokes.length; i += 1) {
        const stroke = strokes[i]
        const x = stroke.x * width + Math.sin(time * stroke.speed + i) * 20
        const y = stroke.y * height + Math.cos(time * (stroke.speed * 0.5) + i) * 12

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(stroke.rot + Math.sin(time * 0.4 + i) * 0.05)
        ctx.globalAlpha = stroke.alpha
        const tint = stroke.tint
        const color = `rgb(${Math.round(mix(126, 188, tint))}, ${Math.round(mix(200, 228, tint))}, ${Math.round(mix(248, 255, tint))})`
        ctx.strokeStyle = color
        ctx.lineWidth = stroke.width
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(-stroke.len * width * 0.5, 0)
        ctx.lineTo(stroke.len * width * 0.5, 0)
        ctx.stroke()
        ctx.restore()
      }

      for (let i = 0; i < clouds.length; i += 1) {
        const cloud = clouds[i]
        const cx = (cloud.x + Math.sin(time * cloud.drift + cloud.wobble) * 0.03) * width
        const cy = cloud.y * height + Math.sin(time * (cloud.drift * 1.2) + cloud.wobble) * 18
        const scale = cloud.scale * Math.min(width, height)

        for (let j = 0; j < cloud.blobs.length; j += 1) {
          const blob = cloud.blobs[j]
          const bx = cx + blob.ox * scale
          const by = cy + blob.oy * scale
          const br = blob.r * scale * 0.6

          ctx.save()
          ctx.globalAlpha = cloud.alpha * (0.88 - j * 0.02)
          ctx.fillStyle = `rgb(${Math.round(mix(214, 255, dusk))}, ${Math.round(mix(238, 248, dusk))}, 255)`
          hardCircle(ctx, bx, by, br, 0.04, i * 0.9 + j * 1.7, time)
          ctx.fill()
          ctx.restore()
        }
      }

      const centerX = width * 0.52
      const centerY = height * 0.47
      const minSide = Math.min(width, height)
      const blueStartX = width * 0.54
      const blueStartY = height * 0.22
      const pinkStartX = width * 0.5
      const pinkStartY = height * 0.76

      const blueX = mix(blueStartX, centerX, converge)
      const blueY = mix(blueStartY, centerY, converge)
      const pinkX = mix(pinkStartX, centerX, converge)
      const pinkY = mix(pinkStartY, centerY, converge)

      const orbBase = minSide * 0.07
      const orbExpand = smoothstep(0.18, 0.4, p) * minSide * 0.015
      const orbVisibility = 1 - smoothstep(0.65, 0.75, p)

      drawCelOrb(ctx, {
        x: blueX,
        y: blueY,
        radius: orbBase + orbExpand,
        time,
        hue: swirl > 0.55 ? 'purple' : 'blue',
        visibility: orbVisibility,
        embers: blueEmbers,
        auraStrength: 0.9 + swirl * 0.6,
      })

      drawCelOrb(ctx, {
        x: pinkX,
        y: pinkY,
        radius: orbBase * 0.82 + orbExpand,
        time: time + 0.8,
        hue: swirl > 0.55 ? 'purple' : 'pink',
        visibility: orbVisibility,
        embers: pinkEmbers,
        auraStrength: 0.95 + swirl * 0.58,
      })

      if (swirl > 0.03) {
        const bands = 22
        for (let i = 0; i < bands; i += 1) {
          const a = (i / bands) * Math.PI * 2 + time * (0.7 + swirl * 1.8)
          const radius = minSide * (0.09 + i * 0.009)
          const bandWobble = Math.sin(time * 1.2 + i * 0.8) * minSide * 0.02

          const sx = centerX + Math.cos(a) * (radius + bandWobble)
          const sy = centerY + Math.sin(a) * (radius + bandWobble)
          const ex = centerX + Math.cos(a + 0.45) * (radius * 1.28)
          const ey = centerY + Math.sin(a + 0.45) * (radius * 1.28)

          ctx.save()
          ctx.globalAlpha = swirl * (0.36 - i * 0.012)
          ctx.lineWidth = Math.max(1.5, 9 - i * 0.3)
          ctx.lineCap = 'round'
          const colorIndex = i % 3
          ctx.strokeStyle =
            colorIndex === 0 ? '#3399ff' : colorIndex === 1 ? '#ff3377' : '#9944ff'
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.quadraticCurveTo(centerX, centerY, ex, ey)
          ctx.stroke()
          ctx.restore()
        }
      }

      if (explosion > 0.01) {
        const burstRadius = minSide * mix(0.06, 0.29, explosion)
        drawBurst(
          centerX,
          centerY,
          burstRadius,
          22,
          0.62,
          '#efe6ff',
          explosion * 0.9,
          time * 0.7
        )
        drawBurst(
          centerX,
          centerY,
          burstRadius * 1.3,
          24,
          0.72,
          '#aa55ff',
          explosion * 0.4,
          -time * 0.45
        )

        ctx.save()
        ctx.globalAlpha = explosion * 0.38
        ctx.strokeStyle = '#f2ddff'
        ctx.lineWidth = minSide * 0.008
        ctx.beginPath()
        ctx.arc(centerX, centerY, burstRadius * 1.6, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      if (calm > 0.05) {
        const moonX = width * 0.23
        const moonY = height * 0.18
        const moonR = minSide * 0.07

        ctx.save()
        ctx.globalAlpha = calm * 0.85
        ctx.fillStyle = '#f4eeff'
        hardCircle(ctx, moonX, moonY, moonR, 0.02, 1.2, time * 0.2)
        ctx.fill()

        ctx.fillStyle = `rgb(${Math.round(mix(95, 17, calm))}, ${Math.round(mix(166, 32, calm))}, ${Math.round(mix(239, 90, calm))})`
        hardCircle(ctx, moonX + moonR * 0.36, moonY - moonR * 0.04, moonR * 0.95, 0.02, 3.4, time * 0.2)
        ctx.fill()
        ctx.restore()
      }

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        minSide * 0.1,
        width * 0.5,
        height * 0.5,
        minSide * 0.75
      )
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignette.addColorStop(1, `rgba(10, 5, 25, ${mix(0.18, 0.52, dusk)})`)
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      const pattern = ctx.createPattern(grainCanvas, 'repeat')
      if (pattern) {
        ctx.save()
        ctx.globalAlpha = 0.18
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, width, height)
        ctx.restore()
      }

      raf = window.requestAnimationFrame(render)
    }

    resize()
    raf = window.requestAnimationFrame(render)

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden
    />
  )
}
