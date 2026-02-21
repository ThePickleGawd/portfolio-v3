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
    uBlueCenter: { value: { x: 0.0, y: 0.0 } },
    uRedCenter: { value: { x: 0.0, y: 0.0 } },
    uSplit: { value: 0.0 },
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
    uniform vec2 uBlueCenter;
    uniform vec2 uRedCenter;
    uniform float uSplit;
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
      float split = clamp(uSplit, 0.0, 1.0);
      float motion = smoothstep(0.0, 1.0, uSwirlStrength);
      vec2 drift = vec2(uTime * 0.018, -uTime * 0.014) * (0.35 + motion * 0.65);

      float softNoise = fbm(vec3(centered * 2.2 + drift, 0.8)) * 0.5 + 0.5;
      float mixNoise = fbm(vec3(centered * 4.8 + drift * 1.8, 2.3)) * 0.5 + 0.5;

      // Keep the title zone calmer: less texture contrast near center.
      float centerCalm = 1.0 - smoothstep(0.0, 0.35, dist);
      softNoise = mix(softNoise, 0.52, centerCalm * 0.6);
      mixNoise = mix(mixNoise, 0.5, centerCalm * 0.75);

      vec2 baseA = vec2(0.21 + sin(uTime * 0.22) * 0.018, 0.01 + cos(uTime * 0.19) * 0.01);
      vec2 baseB = -baseA;
      vec2 centerA = mix(baseA, uBlueCenter, split);
      vec2 centerB = mix(baseB, uRedCenter, split);

      float spread = mix(0.56, 0.3, split);
      spread *= mix(1.0, 0.92, smoothstep(0.0, 1.0, uWashRadius));
      float spreadSq = max(spread * spread, 0.0001);

      float dA = length(centered - centerA);
      float dB = length(centered - centerB);
      float blueBlob = exp(-(dA * dA) / spreadSq);
      float redBlob = exp(-(dB * dB) / spreadSq);

      float overlap = blueBlob * redBlob;
      float overlapTurb = mix(1.0, 0.78 + mixNoise * 0.22, overlap);

      float blueW = blueBlob * (0.76 + softNoise * 0.24);
      float redW = redBlob * (0.76 + (1.0 - softNoise) * 0.22);
      float purpleW = smoothstep(0.08, 0.75, overlap) * (0.58 + mixNoise * 0.3) * overlapTurb;

      vec3 blue = vec3(0.07, 0.18, 0.48);
      vec3 red = vec3(0.46, 0.07, 0.17);
      vec3 purple = vec3(0.30, 0.09, 0.46);

      vec3 ink = blue * blueW + red * redW + purple * purpleW;
      ink *= 0.64 + softNoise * 0.24;
      ink = max(vec3(0.0), (ink - 0.03) * 1.18);

      float vignette = 1.0 - smoothstep(0.35, 1.25, dist) * 0.16;
      vec3 effect = ink * uIntensity * vignette;
      float centerFocus = 1.0 - smoothstep(0.0, 0.62, dist);
      vec3 base = scene.rgb * (1.0 - uIntensity * (0.12 + centerFocus * 0.08));
      gl_FragColor = vec4(base + effect * 0.44, 1.0);
    }
  `,
}
