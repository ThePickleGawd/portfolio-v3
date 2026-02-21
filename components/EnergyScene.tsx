'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { scrollProgress, isMobile } from '@/lib/store'
import {
  orbVertexShader,
  orbFragmentShader,
  glowVertexShader,
  glowFragmentShader,
  particleVertexShader,
  particleFragmentShader,
  explosionVertexShader,
  explosionFragmentShader,
  energyWashShader,
} from '@/lib/shaders'

// ── Constants ────────────────────────────────────────
const PARTICLE_COUNT = isMobile ? 120 : 280
const EXPLOSION_COUNT = isMobile ? 180 : 560
const DEPTH_STAR_COUNT = isMobile ? 360 : 900
const ORB_RADIUS = 0.12

const depthVeilVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const depthVeilFragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float d = length(uv);
  float mask = 1.0 - smoothstep(0.2, 1.05, d);

  float waveA = 0.5 + 0.5 * sin((uv.x * 3.6 + uv.y * 2.8) + uTime * 0.08);
  float waveB = 0.5 + 0.5 * sin((uv.x * -2.7 + uv.y * 3.4) - uTime * 0.06);
  vec3 col = mix(uColorA, uColorB, waveA * 0.65 + waveB * 0.35);

  gl_FragColor = vec4(col, mask * mask * uOpacity);
}
`

// ── Helpers ──────────────────────────────────────────
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// ── Depth Backdrop ───────────────────────────────────
function DepthBackdrop() {
  const starsRef = useRef<THREE.Points>(null!)
  const veilARef = useRef<THREE.ShaderMaterial>(null!)
  const veilBRef = useRef<THREE.ShaderMaterial>(null!)

  const { starPositions, starColors } = useMemo(() => {
    const positions = new Float32Array(DEPTH_STAR_COUNT * 3)
    const colors = new Float32Array(DEPTH_STAR_COUNT * 3)
    const c = new THREE.Color()

    for (let i = 0; i < DEPTH_STAR_COUNT; i++) {
      // Full spherical distribution around scene center for stronger depth cues.
      const theta = Math.random() * Math.PI * 2
      const u = Math.random() * 2 - 1
      const radius = 12 + Math.random() * 30
      const ring = Math.sqrt(1.0 - u * u)

      positions[i * 3] = Math.cos(theta) * ring * radius
      positions[i * 3 + 1] = u * radius * 0.95
      positions[i * 3 + 2] = Math.sin(theta) * ring * radius

      const t = Math.random()
      if (t < 0.55) {
        c.setRGB(0.48 + Math.random() * 0.24, 0.62 + Math.random() * 0.24, 1.0)
      } else if (t < 0.85) {
        c.setRGB(1.0, 0.52 + Math.random() * 0.2, 0.86 + Math.random() * 0.14)
      } else {
        c.setRGB(0.84 + Math.random() * 0.16, 0.84 + Math.random() * 0.16, 1.0)
      }
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    return { starPositions: positions, starColors: colors }
  }, [])

  useEffect(() => {
    const geo = starsRef.current.geometry
    geo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
  }, [starPositions, starColors])

  useFrame(({ clock }) => {
    const p = scrollProgress.current
    const fade = 1.0 - smoothstep(0.88, 1.0, p)
    const t = clock.elapsedTime

    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.016
      starsRef.current.rotation.x = Math.sin(t * 0.09) * 0.035
      const mat = starsRef.current.material as THREE.PointsMaterial
      mat.opacity = (isMobile ? 0.25 : 0.34) * fade
    }

    if (veilARef.current) {
      veilARef.current.uniforms.uTime.value = t
      veilARef.current.uniforms.uOpacity.value = 0.1 * fade
    }
    if (veilBRef.current) {
      veilBRef.current.uniforms.uTime.value = t + 4.0
      veilBRef.current.uniforms.uOpacity.value = 0.06 * fade
    }
  })

  return (
    <group>
      <points ref={starsRef}>
        <bufferGeometry />
        <pointsMaterial
          size={isMobile ? 0.055 : 0.06}
          sizeAttenuation
          transparent
          opacity={0.3}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh position={[0, 1.2, -16]} rotation={[0.05, -0.06, -0.35]} scale={[30, 18, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={veilARef}
          vertexShader={depthVeilVertexShader}
          fragmentShader={depthVeilFragmentShader}
          uniforms={{
            uColorA: { value: new THREE.Color('#1f3f92') },
            uColorB: { value: new THREE.Color('#7f2b8f') },
            uTime: { value: 0 },
            uOpacity: { value: 0.1 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, -1.4, -22]} rotation={[-0.03, 0.08, 0.28]} scale={[36, 22, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={veilBRef}
          vertexShader={depthVeilVertexShader}
          fragmentShader={depthVeilFragmentShader}
          uniforms={{
            uColorA: { value: new THREE.Color('#0f2c7d') },
            uColorB: { value: new THREE.Color('#8d286f') },
            uTime: { value: 0 },
            uOpacity: { value: 0.06 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// ── Particle Points (imperative geometry) ────────────
function ParticleCloud({
  count,
  children,
}: {
  count: number
  children?: React.ReactNode
}) {
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, sizes, phases, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const ph = new Float32Array(count)
    const sp = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 0.25 + Math.random() * 0.6
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      sz[i] = 0.8 + Math.random() * 1.8
      ph[i] = Math.random() * Math.PI * 2
      sp[i] = 0.4 + Math.random() * 1.6
    }
    return { positions: pos, sizes: sz, phases: ph, speeds: sp }
  }, [count])

  useEffect(() => {
    const geo = pointsRef.current?.geometry
    if (!geo) return
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  }, [positions, sizes, phases, speeds])

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      {children}
    </points>
  )
}

// ── Explosion Points (imperative geometry) ───────────
function ExplosionCloud({
  count,
  children,
}: {
  count: number
  children?: React.ReactNode
}) {
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, sizes, directions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const dir = new Float32Array(count * 3)
    const sp = new Float32Array(count)
    const ph = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0
      pos[i * 3 + 1] = 0
      pos[i * 3 + 2] = 0

      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      dir[i * 3 + 0] = Math.sin(phi) * Math.cos(theta)
      dir[i * 3 + 1] = Math.sin(phi) * Math.sin(theta)
      dir[i * 3 + 2] = Math.cos(phi)

      sz[i] = 1.0 + Math.random() * 4.5
      sp[i] = 0.3 + Math.random() * 1.8
      ph[i] = Math.random() * Math.PI * 2
    }
    return { positions: pos, sizes: sz, directions: dir, speeds: sp, phases: ph }
  }, [count])

  useEffect(() => {
    const geo = pointsRef.current?.geometry
    if (!geo) return
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aDirection', new THREE.BufferAttribute(directions, 3))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  }, [positions, sizes, directions, speeds, phases])

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      {children}
    </points>
  )
}

// ── Energy Orb ───────────────────────────────────────
function EnergyOrb({
  color,
  startX,
  startY,
  particleColor,
}: {
  color: string
  startX: number
  startY: number
  particleColor: string
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const glowMeshRef = useRef<THREE.Mesh>(null!)
  const orbMatRef = useRef<THREE.ShaderMaterial>(null!)
  const glowMatRef = useRef<THREE.ShaderMaterial>(null!)
  const particleMatRef = useRef<THREE.ShaderMaterial>(null!)

  const orbColor = useMemo(() => new THREE.Color(color), [color])
  const pColor = useMemo(() => new THREE.Color(particleColor), [particleColor])
  const comfortColor = useMemo(
    () => new THREE.Color(startX > 0 ? '#8fbaff' : '#ffa5bf'),
    [startX]
  )
  const purpleColor = useMemo(() => new THREE.Color('#9900ff'), [])
  const _cOrb = useMemo(() => new THREE.Color(), [])
  const _cP = useMemo(() => new THREE.Color(), [])
  const _cGlow = useMemo(() => new THREE.Color(), [])
  const introGlowScale = useMemo(() => (isMobile ? 4.2 : 5.2), [])

  useFrame(({ clock }) => {
    const p = scrollProgress.current
    const time = clock.elapsedTime
    const sign = startX > 0 ? 1 : -1
    const introT = 1.0 - smoothstep(0.0, 0.02, p)

    // ── Position ──
    let x = startX
    let y = startY
    let z = 0

    if (p <= 0.08) {
      // Idle bobbing
      x = startX + Math.sin(time * 0.4 + startX) * 0.025
      y = startY + Math.cos(time * 0.3 + startY * 2) * 0.08
      z = Math.sin(time * 0.55 + sign * 0.7) * 0.12
    } else if (p <= 0.22) {
      // Converge to center
      const t = smoothstep(0.08, 0.22, p)
      x = lerp(startX, sign * 0.85, t)
      y = lerp(startY, sign * 0.18, t)
      z = lerp(0, sign * 0.2, t)
    } else if (p <= 0.66) {
      // Scroll-driven orbital mixing: accelerates and tightens until explosion.
      const mixT = smoothstep(0.22, 0.66, p)
      const turnProgress = Math.pow(mixT, 1.75) * 4.2 // stronger acceleration toward end

      let radius: number
      if (p <= 0.52) {
        // Keep wide spacing early so both cores are clearly distinct.
        radius = lerp(1.12, 0.54, smoothstep(0.22, 0.52, p))
      } else {
        // Tight collapse near explosion handoff.
        radius = lerp(0.54, 0.06, smoothstep(0.52, 0.66, p))
      }

      const orbitArc = turnProgress * Math.PI * 2.0
      const angle = orbitArc + (sign > 0 ? 0 : Math.PI)
      x = Math.cos(angle) * radius
      y = Math.sin(angle * 1.18) * (0.11 + radius * 0.2)
      z = Math.sin(angle * 1.03 + sign * 0.35) * radius * 1.28
    } else {
      x = 0
      y = 0
      z = 0
    }

    if (groupRef.current) {
      groupRef.current.position.x = x
      groupRef.current.position.y = y
      groupRef.current.position.z = z
      groupRef.current.rotation.set(0, 0, 0)
    }

    // ── Scale ──
    let scale: number
    if (p <= 0.08) {
      scale = 0.6 + smoothstep(0, 0.08, p) * 0.4
    } else if (p <= 0.22) {
      const t = smoothstep(0.08, 0.22, p)
      scale = 1.0 + t * 0.25
    } else if (p <= 0.30) {
      // Compression at collision
      const t = smoothstep(0.22, 0.30, p)
      scale = lerp(1.25, 0.95, t)
    } else if (p <= 0.62) {
      scale = 0.96 + Math.sin(time * 1.8 + sign) * 0.03
    } else if (p <= 0.66) {
      scale = lerp(0.96, 0.0, smoothstep(0.62, 0.66, p))
    } else {
      // Hidden during and after explosion
      scale = 0
    }
    if (groupRef.current) groupRef.current.scale.setScalar(scale)

    // ── Color blend → purple ──
    const mergeT = p < 0.66 ? smoothstep(0.56, 0.66, p) : 1.0
    _cOrb.copy(orbColor).lerp(purpleColor, mergeT)
    _cP.copy(pColor).lerp(purpleColor, mergeT)
    _cGlow.copy(_cOrb).lerp(comfortColor, introT * 0.92)

    // ── Materials ──
    let intensity = 1.0 + smoothstep(0.12, 0.30, p) * 0.9
    intensity += smoothstep(0.54, 0.66, p) * 0.45
    const preExplodeFade = 1.0 - smoothstep(0.62, 0.66, p)
    const endFade = p > 0.78 ? 1.0 - smoothstep(0.78, 0.92, p) : 1.0
    const fade = preExplodeFade * endFade
    const introGlowIntensity = lerp(1.0, 0.56, introT)
    const mixGlowT = smoothstep(0.22, 0.66, p)
    const postIntroGlowScale = p > 0.22 ? lerp(0.62, 0.34, mixGlowT) : 1.35
    const glowFactor = p > 0.22 ? lerp(0.22, 0.1, mixGlowT) : 0.7

    if (orbMatRef.current) {
      orbMatRef.current.uniforms.uTime.value = time
      orbMatRef.current.uniforms.uColor.value.copy(_cOrb)
      orbMatRef.current.uniforms.uIntensity.value = intensity * fade
    }
    if (glowMeshRef.current) {
      const baseGlowScale = lerp(postIntroGlowScale, introGlowScale, introT)
      glowMeshRef.current.scale.setScalar(baseGlowScale)
    }
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uColor.value.copy(_cGlow)
      glowMatRef.current.uniforms.uIntensity.value = intensity * glowFactor * fade * introGlowIntensity
    }
    if (particleMatRef.current) {
      particleMatRef.current.uniforms.uTime.value = time
      particleMatRef.current.uniforms.uColor.value.copy(_cP)
      particleMatRef.current.uniforms.uMergeProgress.value = smoothstep(0.12, 0.35, p)
      particleMatRef.current.uniforms.uTarget.value.set(-x, -y, -z)
      particleMatRef.current.uniforms.uScale.value =
        (0.5 + smoothstep(0.0, 0.2, p) * 0.8 + smoothstep(0.12, 0.32, p) * 0.55) * fade
    }
  })

  return (
    <group ref={groupRef} position={[startX, startY, 0]}>
      <mesh>
        <sphereGeometry args={[ORB_RADIUS, 64, 64]} />
        <shaderMaterial
          ref={orbMatRef}
          vertexShader={orbVertexShader}
          fragmentShader={orbFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: orbColor.clone() },
            uIntensity: { value: 1.0 },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={glowMeshRef} scale={[1.35, 1.35, 1.35]}>
        <sphereGeometry args={[ORB_RADIUS, 32, 32]} />
        <shaderMaterial
          ref={glowMatRef}
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={{
            uColor: { value: orbColor.clone() },
            uIntensity: { value: 0.5 },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      <ParticleCloud count={PARTICLE_COUNT}>
        <shaderMaterial
          ref={particleMatRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: pColor.clone() },
            uScale: { value: 1.0 },
            uMergeProgress: { value: 0 },
            uTarget: { value: new THREE.Vector3(0, 0, 0) },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </ParticleCloud>
    </group>
  )
}

// ── Explosion Particles ──────────────────────────────
function ExplosionParticles() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  useFrame(({ clock }) => {
    const p = scrollProgress.current
    if (matRef.current) {
      matRef.current.uniforms.uProgress.value = smoothstep(0.66, 0.92, p)
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <ExplosionCloud count={EXPLOSION_COUNT}>
      <shaderMaterial
        ref={matRef}
        vertexShader={explosionVertexShader}
        fragmentShader={explosionFragmentShader}
        uniforms={{
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#aa44ff') },
        }}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </ExplosionCloud>
  )
}

// ── Camera Controller ────────────────────────────────
function CameraController() {
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const p = scrollProgress.current

    let orbitWeight = 0
    if (p >= 0.18 && p < 0.22) {
      orbitWeight = smoothstep(0.18, 0.22, p)
    } else if (p >= 0.22 && p < 0.66) {
      orbitWeight = 1
    } else if (p >= 0.66 && p < 0.74) {
      orbitWeight = 1.0 - smoothstep(0.66, 0.74, p)
    }

    const camT = smoothstep(0.22, 0.66, p)
    const camTurns = 1.35
    const angle = camT * camTurns * Math.PI * 2.0 + 0.35
    const radius = lerp(8.2, 6.9, camT)
    const height = lerp(0.08, 0.92, camT) + Math.sin(angle * 0.55) * 0.12
    target.set(
      Math.sin(angle) * radius * orbitWeight,
      height * orbitWeight,
      lerp(8, Math.cos(angle) * radius, orbitWeight)
    )

    camera.position.lerp(target, 0.08)
    lookTarget.set(Math.sin(angle * 1.15) * 0.2 * orbitWeight, 0, 0)
    camera.lookAt(lookTarget)
  })

  return null
}

// ── Bloom via native Three.js postprocessing ─────────
// Completely avoids @react-three/postprocessing and its
// circular-reference serialisation issues in Next.js.
// Using useFrame priority > 0 tells R3F to skip its own
// render pass — only our composer renders.
function NativeBloom() {
  const { gl, scene, camera, size, viewport } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)
  const bloomRef = useRef<UnrealBloomPass | null>(null)
  const introWashRef = useRef<ShaderPass | null>(null)

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.8, // strength
      0.5, // radius
      0.2  // threshold
    )
    composer.addPass(bloom)

    const introWash = new ShaderPass(energyWashShader)
    composer.addPass(introWash)

    composer.addPass(new OutputPass())
    composer.setSize(size.width, size.height)

    composerRef.current = composer
    bloomRef.current = bloom
    introWashRef.current = introWash

    return () => {
      composer.dispose()
    }
  }, [gl, scene, camera, size])

  // Resize
  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height)
  }, [size])

  // Priority 1 → R3F skips its default render; only composer renders
  useFrame(({ clock }, delta) => {
    if (!composerRef.current || !bloomRef.current) return

    const p = scrollProgress.current
    const introScrollBlend = 1.0 - smoothstep(0.0, 0.14, p)
    const introBlend = introScrollBlend
    const introSplit = smoothstep(0.0, 0.08, p)

    // ── Bloom strength ──
    let strength = 0.8
    if (introBlend > 0) {
      strength = lerp(1.0, 0.8, 1.0 - introBlend)
    } else if (p > 0.22 && p <= 0.62) {
      strength = 0.8 + smoothstep(0.22, 0.34, p) * 0.18
    } else if (p > 0.56 && p <= 0.66) {
      strength = 0.98 - smoothstep(0.56, 0.66, p) * 0.18
    } else if (p > 0.66 && p < 0.85) {
      const explosionPeak = Math.sin(smoothstep(0.66, 0.82, p) * Math.PI) * 2.5
      strength = 0.8 + explosionPeak
    }
    if (p > 0.85) {
      strength = Math.max(0, 0.8 * (1 - smoothstep(0.85, 1.0, p)))
    }
    bloomRef.current.strength = strength

    // ── Intro ink-in-water wash: fills hero at start, fades into orb timeline ──
    if (introWashRef.current) {
      introWashRef.current.enabled = introBlend > 0.01
      if (!introWashRef.current.enabled) {
        composerRef.current.render(delta)
        return
      }

      const u = introWashRef.current.uniforms
      const swirlPulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 0.55)
      const startScale = 0.6
      const coreRadius = ORB_RADIUS * startScale
      const glowRadius = ORB_RADIUS * 1.35 * startScale
      const edgeStartX = viewport.width * 0.5 + (coreRadius + glowRadius) * 0.5
      const blueStartY = Math.min(viewport.height * 0.22, 1.4)
      const redStartY = -Math.min(viewport.height * 0.24, 1.5)

      u.uWashRadius.value = lerp(1.0, 0.58, introSplit) * introBlend
      u.uSwirlStrength.value = (0.18 + swirlPulse * 0.08) * introBlend
      u.uIntensity.value = lerp(0.72, 0.46, introSplit) * introBlend
      u.uBlueCenter.value.x = edgeStartX / viewport.width
      u.uBlueCenter.value.y = blueStartY / viewport.height
      u.uRedCenter.value.x = -edgeStartX / viewport.width
      u.uRedCenter.value.y = redStartY / viewport.height
      u.uSplit.value = introSplit
      u.uTime.value = clock.elapsedTime
    }

    composerRef.current.render(delta)
  }, 1)

  return null
}

// ── Main Scene ───────────────────────────────────────
export default function EnergyScene() {
  const { viewport } = useThree()
  const startScale = 0.6
  const coreRadius = ORB_RADIUS * startScale
  const glowRadius = ORB_RADIUS * 1.35 * startScale
  // Place center just beyond half-width so core is offscreen while glow still peeks in.
  const edgeStartX = viewport.width * 0.5 + (coreRadius + glowRadius) * 0.5
  const blueStartY = Math.min(viewport.height * 0.22, 1.4)
  const redStartY = -Math.min(viewport.height * 0.24, 1.5)

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#050711', 8, 34]} />
      <DepthBackdrop />

      {/* Blue orb — upper right area */}
      <EnergyOrb color="#0088ff" startX={edgeStartX} startY={blueStartY} particleColor="#0066ff" />

      {/* Red orb — lower left area */}
      <EnergyOrb color="#ff0044" startX={-edgeStartX} startY={redStartY} particleColor="#ff2244" />

      <ExplosionParticles />
      <CameraController />
      <NativeBloom />
    </>
  )
}
