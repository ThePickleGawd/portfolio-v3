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
      const r = 0.8 + Math.random() * 1.8
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      sz[i] = 1.5 + Math.random() * 3.5
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

    // ── Position: left/right → converge to center ──
    let x = startX
    let y = startY

    if (p <= 0.15) {
      x = startX + Math.sin(time * 0.4 + startX) * 0.12
      y = startY + Math.cos(time * 0.3 + startY * 2) * 0.08
    } else if (p <= 0.45) {
      const t = smoothstep(0.15, 0.45, p)
      x = lerp(startX, 0, t)
      y = lerp(startY, 0, t)
    } else if (p <= 0.6) {
      const t = smoothstep(0.45, 0.6, p)
      const sign = startX > 0 ? 1 : -1
      x = lerp(sign * 0.3, 0, t)
      y = lerp(startY > 0 ? 0.15 : -0.15, 0, t)
      x += Math.sin(time * 4 + startX) * 0.05 * (1 - t)
      y += Math.cos(time * 3.5 + startY) * 0.04 * (1 - t)
    } else {
      x = 0
      y = 0
    }

    if (groupRef.current) {
      groupRef.current.position.x = x
      groupRef.current.position.y = y
    }

    // ── Scale: start small → grow → shrink for merge → explode ──
    let scale: number
    if (p <= 0.15) {
      const t = smoothstep(0, 0.15, p)
      scale = 0.35 + t * 0.35
    } else if (p <= 0.45) {
      const t = smoothstep(0.15, 0.45, p)
      scale = 0.7 + t * 0.3
    } else if (p <= 0.65) {
      const t = smoothstep(0.45, 0.65, p)
      scale = 1.0 - t * 0.5
    } else {
      const t = smoothstep(0.65, 0.82, p)
      scale = 0.5 + t * 4.0
    }
    if (groupRef.current) groupRef.current.scale.setScalar(scale)

    // ── Color blend → purple ──
    const mergeT = smoothstep(0.3, 0.58, p)
    _cOrb.copy(orbColor).lerp(purpleColor, mergeT)
    _cP.copy(pColor).lerp(purpleColor, mergeT)

    // ── Materials ──
    const intensity = 1.0 + smoothstep(0.2, 0.55, p) * 2.0
    const fade = p > 0.78 ? 1.0 - smoothstep(0.78, 0.92, p) : 1.0

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
      particleMatRef.current.uniforms.uMergeProgress.value = smoothstep(0.25, 0.6, p)
      particleMatRef.current.uniforms.uTarget.value.set(-x, -y, 0)
      particleMatRef.current.uniforms.uScale.value =
        (0.5 + smoothstep(0.0, 0.4, p) * 0.8 + smoothstep(0.25, 0.55, p) * 0.5) * fade
    }
  })

  return (
    <group ref={groupRef} position={[startX, startY, 0]}>
      <mesh>
        <sphereGeometry args={[0.55, 64, 64]} />
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

      <mesh scale={[2.2, 2.2, 2.2]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <shaderMaterial
          ref={glowMatRef}
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={{
            uColor: { value: orbColor.clone() },
            uIntensity: { value: 0.7 },
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
      matRef.current.uniforms.uProgress.value = smoothstep(0.62, 0.88, p)
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
      1.5, // strength
      0.4, // radius
      0.1  // threshold
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
  useFrame((_, delta) => {
    if (!composerRef.current || !bloomRef.current) return

    const p = scrollProgress.current
    let strength = 1.5

    if (p > 0.25 && p < 0.85) {
      const mergeBoost = smoothstep(0.25, 0.5, p) * 2.5
      const explosionPeak =
        p > 0.62
          ? Math.sin(smoothstep(0.62, 0.78, p) * Math.PI) * 5.0
          : 0
      strength = 1.5 + mergeBoost + explosionPeak
    }
    if (p > 0.85) {
      strength = Math.max(0, 1.5 * (1 - smoothstep(0.85, 1.0, p)))
    }

    bloomRef.current.strength = strength
    composerRef.current.render(delta)
  }, 1)

  return null
}

// ── Main Scene ───────────────────────────────────────
export default function EnergyScene() {
  return (
    <>
      <color attach="background" args={['#000000']} />

      {/* Blue orb — left, slightly higher */}
      <EnergyOrb color="#0088ff" startX={-2.8} startY={0.5} particleColor="#0066ff" />

      {/* Red orb — right, slightly lower */}
      <EnergyOrb color="#ff0044" startX={2.8} startY={-0.5} particleColor="#ff2244" />

      <ExplosionParticles />
      <NativeBloom />
    </>
  )
}
