// ═══════════════════════════════════════════════════
// GLSL Shaders for Energy Orb Scene
// ═══════════════════════════════════════════════════

// ---- Simplex Noise (Ashima) ----
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x2_ = x_ * ns.x + ns.yyyy;
  vec4 y2_ = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x2_) - abs(y2_);

  vec4 b0 = vec4(x2_.xy, y2_.xy);
  vec4 b1 = vec4(x2_.zw, y2_.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

// ---- Energy Orb Core ----
export const orbVertexShader = /* glsl */ `
${simplexNoise}

uniform float uTime;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

void main() {
  vNormal = normalize(normalMatrix * normal);

  float noise = snoise(position * 3.0 + uTime * 0.4) * 0.12 * uIntensity;
  vNoise = noise;

  vec3 newPos = position + normal * noise;

  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
`

export const orbFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);

  vec3 core = uColor * 1.5;
  vec3 edge = (uColor * 1.2 + vec3(0.3)) * fresnel * 2.0;

  vec3 finalColor = mix(core, edge, fresnel) * uIntensity;
  finalColor += uColor * abs(vNoise) * 1.5;

  float alpha = 0.7 + fresnel * 0.3;

  gl_FragColor = vec4(finalColor, alpha);
}
`

// ---- Glow Halo (outer sphere) ----
export const glowVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

export const glowFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.5);

  vec3 glowColor = uColor * fresnel * uIntensity * 1.5;
  float alpha = fresnel * 0.3 * uIntensity;

  gl_FragColor = vec4(glowColor, alpha);
}
`

// ---- Orbiting Particles ----
export const particleVertexShader = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aSpeed;

uniform float uTime;
uniform float uScale;
uniform float uMergeProgress;
uniform vec3  uTarget;

varying float vAlpha;

void main() {
  vec3 pos = position;

  // Orbit around origin
  float angle = uTime * aSpeed * 0.4 + aPhase;
  float r = length(pos.xz);
  float baseAngle = atan(pos.z, pos.x);

  pos.x = r * cos(baseAngle + angle);
  pos.z = r * sin(baseAngle + angle);
  pos.y += sin(uTime * aSpeed * 0.3 + aPhase) * 0.15;

  // During merge → pull toward center
  pos = mix(pos, uTarget, uMergeProgress * 0.6);

  // Turbulence during merge
  float turb = uMergeProgress;
  pos += vec3(
    sin(uTime * 3.0 + aPhase) * turb * 0.4,
    cos(uTime * 2.5 + aPhase * 1.3) * turb * 0.4,
    sin(uTime * 2.0 + aPhase * 0.7) * turb * 0.4
  );

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_PointSize = aSize * uScale * (250.0 / -mvPosition.z);
  gl_Position  = projectionMatrix * mvPosition;

  vAlpha = smoothstep(4.5, 0.3, length(pos)) * (0.6 + uMergeProgress * 0.4);
}
`

export const particleFragmentShader = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.05, d) * vAlpha;

  gl_FragColor = vec4(uColor * 1.5, alpha);
}
`

// ---- Explosion Burst Particles ----
export const explosionVertexShader = /* glsl */ `
attribute float aSize;
attribute vec3  aDirection;
attribute float aSpeed;
attribute float aPhase;

uniform float uProgress;
uniform float uTime;

varying float vAlpha;

void main() {
  float t = max(uProgress, 0.0);
  float easedT = 1.0 - pow(1.0 - t, 2.5);

  vec3 pos = aDirection * easedT * aSpeed * 14.0;

  // Spiral motion
  float angle = easedT * aSpeed * 3.0 + aPhase;
  pos.x += sin(angle) * 0.5 * easedT;
  pos.z += cos(angle) * 0.5 * easedT;

  // Keep subtle motion in the late timeline so the end doesn't feel frozen.
  float linger = smoothstep(0.78, 1.0, t);
  pos += aDirection * sin(uTime * (0.8 + aSpeed * 0.45) + aPhase * 1.7) * 0.55 * linger;
  pos += vec3(
    sin(uTime * 0.6 + aPhase) * 0.22 * linger,
    cos(uTime * 0.5 + aPhase * 1.3) * 0.14 * linger,
    sin(uTime * 0.75 + aPhase * 0.8) * 0.2 * linger
  );

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float size = aSize * (1.0 - easedT * 0.5);
  gl_PointSize = size * (350.0 / -mvPosition.z);
  gl_Position  = projectionMatrix * mvPosition;

  vAlpha = (1.0 - easedT * 0.85) * smoothstep(0.0, 0.06, t);
}
`

export const explosionFragmentShader = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.0, d) * vAlpha;

  gl_FragColor = vec4(uColor * 3.0, alpha);
}
`

// ---- Energy Wash Post-Processing (ink-in-water) ----
export const energyWashShader = {
  uniforms: {
    tDiffuse: { value: null },
    uWashRadius: { value: 0.0 },
    uSwirlStrength: { value: 0.0 },
    uIntensity: { value: 0.0 },
    uTime: { value: 0.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    ${simplexNoise}

    uniform sampler2D tDiffuse;
    uniform float uWashRadius;
    uniform float uSwirlStrength;
    uniform float uIntensity;
    uniform float uTime;

    varying vec2 vUv;

    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec4 scene = texture2D(tDiffuse, vUv);

      vec2 centered = vUv - 0.5;
      float dist = length(centered);
      float mixMotion = smoothstep(0.0, 1.0, uSwirlStrength);
      vec2 drift = vec2(
        uTime * (0.06 + mixMotion * 0.03),
        -uTime * (0.05 + mixMotion * 0.04)
      );

      vec2 warpA = vec2(
        fbm(vec3(centered * 3.0 + drift, 0.7)),
        fbm(vec3(centered * 3.0 - drift, 2.2))
      );
      vec2 warpB = vec2(
        fbm(vec3((centered + warpA * 0.22) * 5.4 + vec2(-uTime * 0.04, uTime * 0.08), 4.4)),
        fbm(vec3((centered - warpA * 0.20) * 5.2 + vec2(uTime * 0.07, -uTime * 0.05), 7.1))
      );
      vec2 flow = centered + warpA * 0.24 + warpB * 0.14;

      float orbit = uTime * (0.45 + mixMotion * 0.35);
      vec2 centerA = vec2(cos(orbit), sin(orbit * 1.15)) * (0.10 + uWashRadius * 0.32);
      vec2 centerB = -centerA;

      float blobScale = 0.12 + uWashRadius * 0.42;
      float blueBlob = exp(-pow(length(flow - centerA) / blobScale, 2.0));
      float redBlob = exp(-pow(length(flow - centerB) / blobScale, 2.0));

      float field = fbm(vec3(flow * 4.2, uTime * 0.14)) * 0.5 + 0.5;
      float turbulence = fbm(vec3(flow * 7.0 + vec2(1.7, -2.3), uTime * 0.2)) * 0.5 + 0.5;

      float blueW = blueBlob * (0.7 + field * 0.6);
      float redW = redBlob * (0.7 + (1.0 - field) * 0.45 + turbulence * 0.35);
      float purpleW = smoothstep(0.05, 1.1, blueBlob * redBlob * 1.8 + turbulence * 0.25);

      vec3 blue = vec3(0.05, 0.3, 1.0);
      vec3 red = vec3(1.0, 0.05, 0.3);
      vec3 purple = vec3(0.55, 0.0, 1.0);
      vec3 whiteHot = vec3(1.0, 0.9, 0.95);

      float weightSum = redW + blueW + purpleW + 0.0001;
      vec3 ink = (red * redW + blue * blueW + purple * purpleW) / weightSum;
      ink *= 0.7 + field * 0.6;

      float edgeNoise = fbm(vec3(flow * 8.0, uTime * 0.22)) * 0.5 + 0.5;
      float edgeOffset = (edgeNoise - 0.5) * 0.09;
      float radius = max(uWashRadius, 0.0001);
      float washMask = 1.0;
      if (uWashRadius <= 1.0) {
        washMask = 1.0 - smoothstep(radius - 0.08 + edgeOffset, radius + 0.08 + edgeOffset, dist);
        washMask *= smoothstep(0.01, 0.04, uWashRadius);
      }

      float hotCore = smoothstep(1.0, 2.0, uIntensity) * exp(-dist * 17.0);
      ink = mix(ink, whiteHot, clamp(hotCore, 0.0, 1.0));

      vec3 effect = ink * washMask * uIntensity;
      gl_FragColor = vec4(scene.rgb + effect * 0.55, 1.0);
    }
  `,
}
