'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
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
} from '@/lib/shaders'

// ── Constants ────────────────────────────────────────
const PARTICLE_COUNT = isMobile ? 150 : 500
const EXPLOSION_COUNT = isMobile ? 250 : 900

// ── Helpers ──────────────────────────────────────────
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
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
  const orbMatRef = useRef<THREE.ShaderMaterial>(null!)
  const glowMatRef = useRef<THREE.ShaderMaterial>(null!)
  const particleMatRef = useRef<THREE.ShaderMaterial>(null!)

  const orbColor = useMemo(() => new THREE.Color(color), [color])
  const pColor = useMemo(() => new THREE.Color(particleColor), [particleColor])
  const purpleColor = useMemo(() => new THREE.Color('#9900ff'), [])
  const _cOrb = useMemo(() => new THREE.Color(), [])
  const _cP = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }) => {
    const p = scrollProgress.current
    const time = clock.elapsedTime
    const sign = startX > 0 ? 1 : -1

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
      // Orbital mixing around center and tightening into burst
      let radius = 0.45
      if (p <= 0.30) {
        radius = lerp(0.85, 0.45, smoothstep(0.22, 0.30, p))
      } else if (p <= 0.62) {
        radius = 0.45 + Math.sin(time * 0.9 + sign * 1.6) * 0.04
      } else {
        radius = lerp(0.45, 0.05, smoothstep(0.62, 0.66, p))
      }

      const orbitSpin = time * (1.2 + smoothstep(0.22, 0.50, p) * 0.9)
      const orbitArc = smoothstep(0.22, 0.66, p) * Math.PI * 3.0
      const angle = orbitSpin + orbitArc + (sign > 0 ? 0 : Math.PI)
      x = Math.cos(angle) * radius
      y = Math.sin(angle * 1.15) * (0.16 + radius * 0.25)
      z = Math.sin(angle) * radius * 0.9
    } else {
      x = 0
      y = 0
      z = 0
    }

    if (groupRef.current) {
      groupRef.current.position.x = x
      groupRef.current.position.y = y
      groupRef.current.position.z = z
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
    const mergeT = p < 0.66 ? smoothstep(0.18, 0.42, p) : 1.0
    _cOrb.copy(orbColor).lerp(purpleColor, mergeT)
    _cP.copy(pColor).lerp(purpleColor, mergeT)

    // ── Materials ──
    let intensity = 1.0 + smoothstep(0.12, 0.30, p) * 0.9
    intensity += smoothstep(0.54, 0.66, p) * 0.45
    const preExplodeFade = 1.0 - smoothstep(0.62, 0.66, p)
    const endFade = p > 0.78 ? 1.0 - smoothstep(0.78, 0.92, p) : 1.0
    const fade = preExplodeFade * endFade

    if (orbMatRef.current) {
      orbMatRef.current.uniforms.uTime.value = time
      orbMatRef.current.uniforms.uColor.value.copy(_cOrb)
      orbMatRef.current.uniforms.uIntensity.value = intensity * fade
    }
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uColor.value.copy(_cOrb)
      glowMatRef.current.uniforms.uIntensity.value = intensity * 0.7 * fade
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
        <sphereGeometry args={[0.18, 64, 64]} />
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

      <mesh scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[0.18, 32, 32]} />
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
      matRef.current.uniforms.uProgress.value = smoothstep(0.66, 0.82, p)
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

  useFrame(({ clock }) => {
    const p = scrollProgress.current
    const time = clock.elapsedTime

    let orbitWeight = 0
    if (p >= 0.10 && p < 0.26) {
      orbitWeight = smoothstep(0.10, 0.26, p)
    } else if (p >= 0.26 && p < 0.62) {
      orbitWeight = 1
    } else if (p >= 0.62 && p < 0.74) {
      orbitWeight = 1.0 - smoothstep(0.62, 0.74, p)
    }

    const angle = time * 0.24 + smoothstep(0.18, 0.60, p) * 1.4
    const radius = 8
    target.set(
      Math.sin(angle) * radius * orbitWeight,
      Math.sin(angle * 0.7) * 1.0 * orbitWeight,
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
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)
  const bloomRef = useRef<UnrealBloomPass | null>(null)

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

    composer.addPass(new OutputPass())
    composer.setSize(size.width, size.height)

    composerRef.current = composer
    bloomRef.current = bloom

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

    // ── Bloom strength ──
    let strength = 0.8
    if (p > 0.22 && p <= 0.62) {
      strength = 0.8 + smoothstep(0.22, 0.34, p) * 0.75
    } else if (p > 0.56 && p <= 0.66) {
      strength = 1.55 - smoothstep(0.56, 0.66, p) * 0.45
    } else if (p > 0.66 && p < 0.85) {
      const explosionPeak = Math.sin(smoothstep(0.66, 0.82, p) * Math.PI) * 2.5
      strength = 0.8 + explosionPeak
    }
    if (p > 0.85) {
      strength = Math.max(0, 0.8 * (1 - smoothstep(0.85, 1.0, p)))
    }
    bloomRef.current.strength = strength

    composerRef.current.render(delta)
  }, 1)

  return null
}

// ── Main Scene ───────────────────────────────────────
export default function EnergyScene() {
  const { viewport } = useThree()
  const startScale = 0.6
  const coreRadius = 0.18 * startScale
  const glowRadius = 0.18 * 1.8 * startScale
  // Place center just beyond half-width so core is offscreen while glow still peeks in.
  const edgeStartX = viewport.width * 0.5 + (coreRadius + glowRadius) * 0.5
  const blueStartY = Math.min(viewport.height * 0.22, 1.4)
  const redStartY = -Math.min(viewport.height * 0.24, 1.5)

  return (
    <>
      <color attach="background" args={['#000000']} />

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
