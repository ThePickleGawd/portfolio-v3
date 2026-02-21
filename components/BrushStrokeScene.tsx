'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import {
  animeBgVertexShader,
  animeBgFragmentShader,
  orbVertexShader,
  orbFragmentShader,
} from '@/lib/brushStrokeShaders'

// ── Full-screen Anime Background ─────────────────────
function AnimeBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
      matRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={animeBgVertexShader}
        fragmentShader={animeBgFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Cel-shaded Orb ───────────────────────────────────
function CelOrb({
  color,
  position,
  scale = 0.3,
}: {
  color: string
  position: [number, number, number]
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const orbColor = useMemo(() => new THREE.Color(color), [color])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(t * 0.5) * 0.1
      meshRef.current.position.y = position[1] + Math.cos(t * 0.4) * 0.08
    }
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={orbVertexShader}
        fragmentShader={orbFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: orbColor },
        }}
        transparent
      />
    </mesh>
  )
}

// ── Bloom ─────────────────────────────────────────────
function Bloom() {
  const { gl, scene, camera, size } = useThree()
  const composerRef = useRef<EffectComposer | null>(null)

  useEffect(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.4,  // strength — gentle glow
      0.5,  // radius
      0.7   // threshold — only bright spots
    )
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
    composer.setSize(size.width, size.height)

    composerRef.current = composer
    return () => { composer.dispose() }
  }, [gl, scene, camera, size])

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height)
  }, [size])

  useFrame((_, delta) => {
    composerRef.current?.render(delta)
  }, 1)

  return null
}

// ── Main Scene ───────────────────────────────────────
export default function BrushStrokeScene() {
  return (
    <>
      <AnimeBackground />

      {/* Blue orb */}
      <CelOrb color="#4488ff" position={[1.2, 0.6, 0]} scale={0.25} />

      {/* Pink orb */}
      <CelOrb color="#ff3377" position={[-1.0, -0.5, 0]} scale={0.2} />

      <Bloom />
    </>
  )
}
