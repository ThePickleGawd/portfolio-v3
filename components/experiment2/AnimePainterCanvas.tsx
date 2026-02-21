'use client'

import { useEffect, useRef } from 'react'

type AnimePainterCanvasProps = {
  progress: number
}

type Wisp = {
  x: number
  y: number
  length: number
  width: number
  angle: number
  drift: number
  speed: number
  alpha: number
  tint: 'blue' | 'pink' | 'violet'
}

type Spark = {
  angle: number
  radius: number
  speed: number
  phase: number
  size: number
}

type DropletPalette = {
  shadow: string
  mid: string
  light: string
  flash: string
  outline: string
  glow: string
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
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function roughBlobPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  time: number,
  seedOffset: number,
  roughness = 0.035
) {
  const steps = 28
  ctx.beginPath()
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const angle = t * Math.PI * 2
    const wobble =
      1 +
      Math.sin(angle * 3 + seedOffset + time * 0.45) * roughness +
      Math.sin(angle * 5 - seedOffset * 0.7 + time * 0.22) * roughness * 0.6
    const r = radius * wobble
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
  spread = 2.1
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * spread)
  gradient.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`)
  gradient.addColorStop(0.42, `${color}${Math.round(alpha * 0.32 * 255)
    .toString(16)
    .padStart(2, '0')}`)
  gradient.addColorStop(1, `${color}00`)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius * spread, 0, Math.PI * 2)
  ctx.fill()
}

function drawSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number,
  color: string,
  alpha: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.64, 0)
  ctx.lineTo(0, size)
  ctx.lineTo(-size * 0.64, 0)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawDroplet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  alpha: number,
  palette: DropletPalette,
  tilt: number,
  glowStrength: number
) {
  if (alpha <= 0) {
    return
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  drawGlow(ctx, x, y, radius, palette.glow, alpha * glowStrength, 2.4)
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = alpha

  roughBlobPath(ctx, x, y, radius, time, tilt)
  ctx.fillStyle = palette.shadow
  ctx.fill()

  ctx.save()
  roughBlobPath(ctx, x, y, radius, time, tilt)
  ctx.clip()

  const body = ctx.createLinearGradient(
    x - radius * 0.35,
    y - radius * 0.4,
    x + radius * 0.4,
    y + radius * 0.5
  )
  body.addColorStop(0, palette.light)
  body.addColorStop(0.45, palette.mid)
  body.addColorStop(1, palette.shadow)
  ctx.fillStyle = body
  ctx.fillRect(x - radius * 1.3, y - radius * 1.3, radius * 2.6, radius * 2.6)

  ctx.globalAlpha = alpha * 0.82
  roughBlobPath(ctx, x - radius * 0.22, y - radius * 0.2, radius * 0.72, time, tilt + 2.1, 0.02)
  ctx.fillStyle = palette.light
  ctx.fill()

  ctx.globalAlpha = alpha * 0.7
  roughBlobPath(ctx, x - radius * 0.34, y - radius * 0.36, radius * 0.26, time, tilt + 5.2, 0.04)
  ctx.fillStyle = palette.flash
  ctx.fill()

  ctx.globalAlpha = alpha * 0.38
  ctx.strokeStyle = palette.flash
  ctx.lineWidth = Math.max(1.3, radius * 0.08)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x + radius * 0.06, y + radius * 0.04, radius * 0.6, -2.1, -0.55)
  ctx.stroke()

  ctx.restore()

  ctx.lineWidth = Math.max(2.4, radius * 0.08)
  ctx.strokeStyle = palette.outline
  roughBlobPath(ctx, x, y, radius, time, tilt)
  ctx.stroke()
  ctx.restore()
}

function drawBridge(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  bridgeT: number,
  contactT: number
) {
  if (bridgeT <= 0.01) {
    return
  }

  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.hypot(dx, dy)
  if (dist < 0.001) {
    return
  }

  const ux = dx / dist
  const uy = dy / dist
  const nx = -uy
  const ny = ux

  const minR = Math.min(r1, r2)
  const anchor1 = r1 * mix(0.56, 0.78, bridgeT)
  const anchor2 = r2 * mix(0.56, 0.78, bridgeT)
  const thickness = minR * mix(0.14, 0.58, bridgeT * contactT)

  const p1x = x1 + ux * anchor1
  const p1y = y1 + uy * anchor1
  const p2x = x2 - ux * anchor2
  const p2y = y2 - uy * anchor2

  const top1x = p1x + nx * thickness
  const top1y = p1y + ny * thickness
  const top2x = p2x + nx * thickness * 0.92
  const top2y = p2y + ny * thickness * 0.92
  const bot2x = p2x - nx * thickness * 0.92
  const bot2y = p2y - ny * thickness * 0.92
  const bot1x = p1x - nx * thickness
  const bot1y = p1y - ny * thickness

  const controlTopX = mix(top1x, top2x, 0.5) + nx * thickness * 0.5
  const controlTopY = mix(top1y, top2y, 0.5) + ny * thickness * 0.5
  const controlBotX = mix(bot1x, bot2x, 0.5) - nx * thickness * 0.5
  const controlBotY = mix(bot1y, bot2y, 0.5) - ny * thickness * 0.5

  const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
  gradient.addColorStop(0, '#6cc6ff')
  gradient.addColorStop(0.45, '#9d8dff')
  gradient.addColorStop(1, '#ff6ba3')

  ctx.save()
  ctx.globalAlpha = bridgeT * 0.95
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(top1x, top1y)
  ctx.quadraticCurveTo(controlTopX, controlTopY, top2x, top2y)
  ctx.lineTo(bot2x, bot2y)
  ctx.quadraticCurveTo(controlBotX, controlBotY, bot1x, bot1y)
  ctx.closePath()
  ctx.fill()

  ctx.globalAlpha = bridgeT * 0.55
  ctx.strokeStyle = '#eff7ff'
  ctx.lineWidth = Math.max(1.1, minR * 0.05)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(mix(p1x, p2x, 0.08), mix(p1y, p2y, 0.08))
  ctx.quadraticCurveTo(
    mix(p1x, p2x, 0.55) + nx * thickness * 0.18,
    mix(p1y, p2y, 0.55) + ny * thickness * 0.18,
    mix(p1x, p2x, 0.92),
    mix(p1y, p2y, 0.92)
  )
  ctx.stroke()
  ctx.restore()
}

function drawMergedDroplet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  alpha: number
) {
  if (alpha <= 0) {
    return
  }

  const palette: DropletPalette = {
    shadow: '#2a1f60',
    mid: '#6845c9',
    light: '#b289ff',
    flash: '#f3eaff',
    outline: '#170d3a',
    glow: '#8b69ff',
  }

  drawDroplet(ctx, x, y, radius, time, alpha, palette, 1.4, 0.56)

  ctx.save()
  ctx.globalAlpha = alpha * 0.82
  roughBlobPath(ctx, x, y, radius, time, 1.4)
  ctx.clip()

  for (let i = 0; i < 16; i += 1) {
    const t = i / 15
    const yOffset = (t - 0.5) * radius * 1.6
    const swing = Math.sin(time * 1.4 + t * 8.4) * radius * 0.22
    const thickness = radius * mix(0.1, 0.04, t)

    const grad = ctx.createLinearGradient(x - radius, y, x + radius, y)
    grad.addColorStop(0, 'rgba(85, 200, 255, 0.72)')
    grad.addColorStop(0.48, 'rgba(202, 149, 255, 0.9)')
    grad.addColorStop(1, 'rgba(255, 113, 176, 0.72)')

    ctx.strokeStyle = grad
    ctx.lineWidth = thickness
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x - radius * 0.72, y + yOffset)
    ctx.quadraticCurveTo(x + swing, y + yOffset - radius * 0.26, x + radius * 0.72, y + yOffset)
    ctx.stroke()
  }

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

    const rand = seeded(19)

    const wisps: Wisp[] = Array.from({ length: 24 }, () => ({
      x: rand(),
      y: rand() * 0.88,
      length: 0.08 + rand() * 0.24,
      width: 16 + rand() * 38,
      angle: (rand() - 0.5) * 0.9,
      drift: 0.03 + rand() * 0.08,
      speed: 0.28 + rand() * 0.8,
      alpha: 0.04 + rand() * 0.12,
      tint: rand() < 0.38 ? 'blue' : rand() < 0.78 ? 'violet' : 'pink',
    }))

    const sparks: Spark[] = Array.from({ length: 70 }, () => ({
      angle: rand() * Math.PI * 2,
      radius: 0.36 + rand() * 0.88,
      speed: 0.22 + rand() * 0.74,
      phase: rand(),
      size: 1.1 + rand() * 2.9,
    }))

    const grainCanvas = document.createElement('canvas')
    grainCanvas.width = 220
    grainCanvas.height = 220
    const grainCtx = grainCanvas.getContext('2d')
    if (!grainCtx) {
      return
    }

    const grain = grainCtx.createImageData(grainCanvas.width, grainCanvas.height)
    for (let i = 0; i < grain.data.length; i += 4) {
      const tone = Math.floor(182 + rand() * 70)
      grain.data[i] = tone
      grain.data[i + 1] = tone
      grain.data[i + 2] = tone + 2
      grain.data[i + 3] = Math.floor(8 + rand() * 28)
    }
    grainCtx.putImageData(grain, 0, 0)

    const bluePalette: DropletPalette = {
      shadow: '#0f2f78',
      mid: '#2e7eff',
      light: '#9edaff',
      flash: '#f0faff',
      outline: '#081a4a',
      glow: '#52a7ff',
    }

    const pinkPalette: DropletPalette = {
      shadow: '#6f1448',
      mid: '#e63878',
      light: '#ff9ec2',
      flash: '#ffeaf3',
      outline: '#3b0724',
      glow: '#ff5b9a',
    }

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

    let raf = 0

    const render = (now: number) => {
      const time = now * 0.001
      const p = clamp(progressRef.current, 0, 1)

      const approach = smoothstep(0.05, 0.34, p)
      const contact = smoothstep(0.21, 0.46, p)
      const merge = smoothstep(0.38, 0.74, p)
      const settle = smoothstep(0.74, 0.96, p)

      const bg = ctx.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0, '#030713')
      bg.addColorStop(0.55, '#070c1a')
      bg.addColorStop(1, '#0a0e1f')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      const centerX = width * 0.52
      const centerY = height * 0.5
      const minSide = Math.min(width, height)

      const ambientA = ctx.createRadialGradient(
        centerX - minSide * 0.1,
        centerY - minSide * 0.2,
        minSide * 0.02,
        centerX - minSide * 0.1,
        centerY - minSide * 0.2,
        minSide * 0.55
      )
      ambientA.addColorStop(0, 'rgba(65, 157, 255, 0.24)')
      ambientA.addColorStop(1, 'rgba(65, 157, 255, 0)')
      ctx.fillStyle = ambientA
      ctx.fillRect(0, 0, width, height)

      const ambientB = ctx.createRadialGradient(
        centerX + minSide * 0.05,
        centerY + minSide * 0.2,
        minSide * 0.02,
        centerX + minSide * 0.05,
        centerY + minSide * 0.2,
        minSide * 0.5
      )
      ambientB.addColorStop(0, 'rgba(255, 73, 148, 0.16)')
      ambientB.addColorStop(1, 'rgba(255, 73, 148, 0)')
      ctx.fillStyle = ambientB
      ctx.fillRect(0, 0, width, height)

      for (let i = 0; i < wisps.length; i += 1) {
        const wisp = wisps[i]
        const x = wisp.x * width + Math.sin(time * wisp.speed + i * 0.7) * width * wisp.drift
        const y = wisp.y * height + Math.cos(time * wisp.speed * 0.6 + i * 0.9) * 24
        const len = wisp.length * width
        const tint =
          wisp.tint === 'blue'
            ? 'rgba(118, 188, 255, '
            : wisp.tint === 'pink'
              ? 'rgba(255, 126, 176, '
              : 'rgba(181, 165, 255, '

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(wisp.angle + Math.sin(time * 0.4 + i) * 0.08)
        ctx.globalAlpha = wisp.alpha
        ctx.strokeStyle = `${tint}${0.7 - settle * 0.3})`
        ctx.lineWidth = wisp.width
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(-len * 0.5, 0)
        ctx.lineTo(len * 0.5, 0)
        ctx.stroke()
        ctx.restore()
      }

      const blueStartX = width * 0.56
      const blueStartY = height * 0.2
      const pinkStartX = width * 0.48
      const pinkStartY = height * 0.8

      const separation = minSide * 0.06 * (1 - merge)
      const blueX = mix(blueStartX, centerX + separation * 0.35, approach)
      const blueY = mix(blueStartY, centerY - separation * 0.22, approach)
      const pinkX = mix(pinkStartX, centerX - separation * 0.3, approach)
      const pinkY = mix(pinkStartY, centerY + separation * 0.24, approach)

      const radiusBlue = minSide * 0.066 * (1 + Math.sin(time * 1.8) * 0.035)
      const radiusPink = minSide * 0.061 * (1 + Math.sin(time * 1.6 + 0.7) * 0.03)

      const distance = Math.hypot(blueX - pinkX, blueY - pinkY)
      const proximity = 1 - clamp((distance - (radiusBlue + radiusPink) * 0.9) / (minSide * 0.24), 0, 1)
      const bridgeT = contact * proximity * (1 - smoothstep(0.6, 0.82, p))

      const individualAlpha = 1 - merge * 0.85
      const mergedAlpha = smoothstep(0.45, 0.72, p)

      drawDroplet(
        ctx,
        blueX,
        blueY,
        radiusBlue,
        time,
        individualAlpha,
        bluePalette,
        1.2,
        0.64
      )
      drawDroplet(
        ctx,
        pinkX,
        pinkY,
        radiusPink,
        time + 0.8,
        individualAlpha,
        pinkPalette,
        2.4,
        0.64
      )

      drawBridge(ctx, blueX, blueY, radiusBlue, pinkX, pinkY, radiusPink, bridgeT, contact)

      const mergedRadius = minSide * mix(0.07, 0.118, merge)
      const mergedX = centerX + Math.sin(time * 0.8) * 4 * (1 - settle)
      const mergedY = centerY + Math.cos(time * 0.7) * 3 * (1 - settle)
      drawMergedDroplet(ctx, mergedX, mergedY, mergedRadius, time, mergedAlpha)

      const sparkCenterX = mix(mix(blueX, pinkX, 0.5), mergedX, mergedAlpha)
      const sparkCenterY = mix(mix(blueY, pinkY, 0.5), mergedY, mergedAlpha)
      const sparkRadius = mix(radiusBlue, mergedRadius * 1.08, mergedAlpha)
      const sparkColor = mergedAlpha > 0.5 ? '#ecd8ff' : '#cce8ff'

      for (let i = 0; i < sparks.length; i += 1) {
        const spark = sparks[i]
        const life = (time * spark.speed + spark.phase) % 1
        const radius = sparkRadius * (spark.radius + life * 0.86)
        const angle = spark.angle + life * 2.2
        const x = sparkCenterX + Math.cos(angle) * radius
        const y = sparkCenterY + Math.sin(angle) * radius
        const alpha = (1 - life) * (0.65 - settle * 0.4) * (0.35 + mergedAlpha * 0.6)
        drawSpark(ctx, x, y, spark.size * (1 - life * 0.26), angle, sparkColor, alpha)
      }

      if (mergedAlpha > 0.18) {
        ctx.save()
        ctx.globalAlpha = mergedAlpha * (0.58 - settle * 0.3)
        ctx.strokeStyle = '#bea4ff'
        for (let i = 0; i < 3; i += 1) {
          const r = mergedRadius * (1.38 + i * 0.28 + Math.sin(time * 0.8 + i) * 0.02)
          ctx.lineWidth = Math.max(1.1, mergedRadius * 0.04 - i * 0.4)
          ctx.beginPath()
          ctx.arc(mergedX, mergedY, r, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.46,
        minSide * 0.09,
        width * 0.5,
        height * 0.5,
        minSide * 0.85
      )
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
      vignette.addColorStop(1, 'rgba(2, 3, 10, 0.72)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      const grainPattern = ctx.createPattern(grainCanvas, 'repeat')
      if (grainPattern) {
        ctx.save()
        ctx.globalAlpha = 0.18
        ctx.fillStyle = grainPattern
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

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
}
