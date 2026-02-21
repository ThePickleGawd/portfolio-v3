// ═══════════════════════════════════════════════════
// Anime Effect Shaders — JJK-style radial burst
// ═══════════════════════════════════════════════════

// ---- Full-screen Anime Background ----
// Radial speed lines + purple light burst + energy streaks
export const animeBgVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

export const animeBgFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

// Hash for pseudo-random
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

// 1D noise
float noise1d(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 centeredUv = (uv - 0.5) * aspect;
  float dist = length(centeredUv);
  float angle = atan(centeredUv.y, centeredUv.x);

  // ── Radial gradient: bright center → dark edges ──
  float radialGrad = 1.0 - smoothstep(0.0, 0.9, dist);
  radialGrad = pow(radialGrad, 1.5);

  // Base purple colors
  vec3 brightCenter = vec3(0.85, 0.65, 1.0);   // light lavender
  vec3 midPurple = vec3(0.45, 0.15, 0.7);       // rich purple
  vec3 darkEdge = vec3(0.08, 0.02, 0.15);       // near-black purple

  vec3 bgColor = mix(darkEdge, midPurple, smoothstep(0.7, 0.3, dist));
  bgColor = mix(bgColor, brightCenter, smoothstep(0.3, 0.0, dist) * 0.8);

  // ── Speed lines — THE anime signature ──
  // Many thin radial lines with varying intensity
  float speedLines = 0.0;

  // Layer 1: Dense fine lines
  float lineAngle1 = angle * 80.0;
  float line1 = abs(fract(lineAngle1 / 6.2831) - 0.5) * 2.0;
  line1 = smoothstep(0.0, 0.08, line1); // thin white lines
  float lineMask1 = (1.0 - line1) * smoothstep(0.05, 0.15, dist) * smoothstep(1.0, 0.3, dist);
  // Animate: lines shimmer
  lineMask1 *= 0.5 + 0.5 * sin(angle * 40.0 + uTime * 3.0);
  speedLines += lineMask1 * 0.4;

  // Layer 2: Medium lines — fewer, brighter
  float lineAngle2 = angle * 35.0;
  float line2 = abs(fract(lineAngle2 / 6.2831) - 0.5) * 2.0;
  line2 = smoothstep(0.0, 0.05, line2);
  float lineMask2 = (1.0 - line2) * smoothstep(0.1, 0.25, dist) * smoothstep(1.2, 0.2, dist);
  lineMask2 *= 0.6 + 0.4 * sin(angle * 20.0 - uTime * 2.0 + 1.5);
  speedLines += lineMask2 * 0.5;

  // Layer 3: Thick dramatic streaks — few, very bright
  float lineAngle3 = angle * 12.0;
  float line3 = abs(fract(lineAngle3 / 6.2831) - 0.5) * 2.0;
  line3 = smoothstep(0.0, 0.12, line3);
  float lineMask3 = (1.0 - line3) * smoothstep(0.08, 0.2, dist) * smoothstep(1.0, 0.15, dist);
  // These streaks pulse
  float streakPulse = 0.7 + 0.3 * sin(uTime * 1.5 + hash(floor(lineAngle3 / 6.2831)) * 6.28);
  speedLines += lineMask3 * 0.7 * streakPulse;

  // Speed lines are white/bright purple
  vec3 lineColor = mix(vec3(0.9, 0.7, 1.0), vec3(1.0), speedLines);
  bgColor = mix(bgColor, lineColor, speedLines * 0.7);

  // ── Light burst from center ──
  float burst = pow(max(0.0, 1.0 - dist * 1.8), 3.0);
  bgColor += vec3(0.6, 0.4, 0.8) * burst * 0.5;

  // ── Floating light streak particles ──
  float streaks = 0.0;
  for (int i = 0; i < 15; i++) {
    float fi = float(i);
    float streakAngle = hash(fi * 7.3) * 6.2831;
    float streakSpeed = 0.3 + hash(fi * 3.1) * 0.7;
    float streakDist = fract(hash(fi * 11.7) + uTime * streakSpeed * 0.15);
    float streakLen = 0.02 + hash(fi * 5.9) * 0.04;
    float streakWidth = 0.008 + hash(fi * 2.3) * 0.015;

    // Position along radial direction
    vec2 streakPos = vec2(cos(streakAngle), sin(streakAngle)) * streakDist * 0.8;
    vec2 streakDir = normalize(streakPos);

    // Distance from point to line segment
    vec2 toPoint = centeredUv - streakPos;
    float along = dot(toPoint, streakDir);
    float perp = length(toPoint - streakDir * along);

    float streakMask = smoothstep(streakWidth, 0.0, perp)
                     * smoothstep(streakLen, 0.0, abs(along))
                     * smoothstep(0.0, 0.1, streakDist)
                     * smoothstep(1.0, 0.6, streakDist);

    streaks += streakMask;
  }
  bgColor += vec3(0.8, 0.6, 1.0) * streaks * 0.6;

  // ── Vignette ──
  float vignette = 1.0 - smoothstep(0.4, 1.1, dist);
  bgColor *= vignette;

  gl_FragColor = vec4(bgColor, 1.0);
}
`

// ---- Cel-shaded Energy Orb ----
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
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
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

export const orbVertexShader = /* glsl */ `
${simplexNoise}

uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);

  float noise = snoise(position * 3.0 + uTime * 0.3) * 0.08;
  vec3 newPos = position + normal * noise;

  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`

export const orbFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Fresnel
  float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.5);

  // Simple cel-shading: 3 hard bands
  vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
  float NdotL = dot(normal, lightDir) * 0.5 + 0.5; // half-lambert
  float cel = floor(NdotL * 3.0) / 3.0;

  vec3 shadow = uColor * 0.3;
  vec3 mid = uColor * 0.7;
  vec3 lit = uColor * 1.0;

  vec3 color = shadow;
  color = mix(color, mid, step(0.33, cel));
  color = mix(color, lit, step(0.66, cel));

  // Hard specular flash
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = step(0.92, pow(max(dot(normal, halfDir), 0.0), 40.0));
  color += vec3(1.0) * spec * 0.4;

  // Dark outline at silhouette
  float outline = smoothstep(0.0, 0.15, abs(dot(viewDir, normal)));
  color *= outline;

  // Colored rim glow
  color += uColor * 0.5 * fresnel;

  float alpha = 0.95;
  gl_FragColor = vec4(color, alpha);
}
`
