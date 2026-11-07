import * as THREE from 'three'

// ─── SHARED VERTEX SHADER ────────────────────────────────────────────────────
const VERT = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vUv       = uv;
  vNormal   = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// ─── SHARED NOISE LIBRARY ────────────────────────────────────────────────────
const NOISE = `
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float h31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}

float n2(vec2 p){
  vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),
             mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);
}

float n3(vec3 p){
  vec3 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
  return mix(mix(mix(h31(i),          h31(i+vec3(1,0,0)),u.x),
                 mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),u.x),u.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),u.x),
                 mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),u.x),u.y),u.z);
}

float fbm2(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<6;i++){v+=a*n2(p);p=p*2.07+vec2(31.1*float(i+1),17.9);a*=0.5;}
  return v;
}

float fbm3(vec3 p){
  float v=0.0, a=0.5;
  for(int i=0;i<6;i++){v+=a*n3(p);p=p*2.07+vec3(31.1*float(i+1),17.9,7.3);a*=0.5;}
  return v;
}

float fbm3_4(vec3 p){
  float v=0.0, a=0.5;
  for(int i=0;i<4;i++){v+=a*n3(p);p=p*2.07+vec3(31.1*float(i+1),17.9,7.3);a*=0.5;}
  return v;
}
`

// ─── LIGHTING HELPERS ────────────────────────────────────────────────────────
const LIGHT = `
float diffuse(vec3 wp, vec3 wn){
  return max(dot(normalize(wn), normalize(-wp)), 0.0);
}
float rim(vec3 wp, vec3 wn){
  vec3 v=normalize(cameraPosition - wp);
  return pow(1.0 - max(dot(normalize(wn),v),0.0), 3.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// SUN
// ─────────────────────────────────────────────────────────────────────────────
const SUN_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}

void main(){
  float t = u_time * 0.07;
  vec3 p = normalize(vWorldPos) * 2.8;

  float n1 = fbm3(p + vec3(t, t*0.6, 0.0));
  float n2_ = fbm3(p*1.9 + vec3(-t*0.5, t*1.1, t*0.4));
  float n3_ = fbm3(p*0.55 + vec3(t*0.2, -t*0.35, t*0.5));

  float s = n1*0.5 + n2_*0.3 + n3_*0.2;
  s = smoothstep(0.28, 0.72, s);

  vec3 cDeep   = vec3(0.55, 0.03, 0.0);
  vec3 cHot    = vec3(1.0,  0.42, 0.0);
  vec3 cBright = vec3(1.0,  0.80, 0.18);
  vec3 cWhite  = vec3(1.0,  0.97, 0.88);

  vec3 col = mix(cDeep, cHot, smoothstep(0.0, 0.42, s));
  col = mix(col, cBright, smoothstep(0.38, 0.72, s));
  col = mix(col, cWhite,  smoothstep(0.68, 1.0,  s));

  // Limb darkening
  vec3 vd = normalize(cameraPosition - vWorldPos);
  float limb = max(dot(normalize(vNormal), vd), 0.0);
  col *= 0.55 + 0.45 * pow(limb, 0.25);

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// EARTH — surface (continents + ocean + poles)
// ─────────────────────────────────────────────────────────────────────────────
const EARTH_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);
  float lat = vUv.y;

  // Land mask
  float lnd = fbm3(sp * 2.6);
  float det = fbm3(sp * 7.5);
  float landMask = smoothstep(0.40, 0.52, lnd + det * 0.08);

  // Ocean
  vec3 deepSea    = vec3(0.02, 0.09, 0.30);
  vec3 shallowSea = vec3(0.04, 0.22, 0.52);
  vec3 ocean = mix(deepSea, shallowSea, fbm3(sp * 4.5));

  // Land
  float elev = fbm3(sp * 4.8);
  vec3 forest  = vec3(0.14, 0.26, 0.07);
  vec3 plains  = vec3(0.28, 0.32, 0.12);
  vec3 desert  = vec3(0.60, 0.52, 0.28);
  vec3 rock    = vec3(0.38, 0.30, 0.22);
  vec3 land = mix(forest, plains, smoothstep(0.38, 0.55, elev));
  land = mix(land, desert, smoothstep(0.54, 0.70, elev));
  land = mix(land, rock,   smoothstep(0.68, 0.85, elev));

  // Poles
  float np = smoothstep(0.76, 0.90, lat) * (0.8 + fbm3(sp*14.0)*0.4);
  float sp2 = smoothstep(0.24, 0.10, lat) * (0.8 + fbm3(sp*14.0)*0.4);
  float ice = max(np, sp2);
  vec3 iceCol = vec3(0.86, 0.92, 1.0);

  vec3 surface = mix(ocean, land, landMask);
  surface = mix(surface, iceCol, clamp(ice, 0.0, 1.0));

  // Lighting
  float diff = diffuse(vWorldPos, vNormal);
  float amb  = 0.06;
  vec3 col = surface * (amb + diff * 0.94);

  // Night lights (city glow on dark side)
  float night = 1.0 - smoothstep(0.0, 0.18, diff);
  float city = step(0.70, fbm3(sp * 6.5));
  col += night * city * landMask * vec3(0.55, 0.42, 0.10) * 0.07;

  // Atmosphere rim
  float r = rim(vWorldPos, vNormal);
  col += vec3(0.18, 0.46, 1.0) * r * 0.55 * (amb + diff * 0.6);

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// EARTH CLOUDS
// ─────────────────────────────────────────────────────────────────────────────
const CLOUD_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);
  float t = u_time * 0.012;

  float c1 = fbm3(sp * 3.2 + vec3(t, 0.0, t*0.5));
  float c2 = fbm3(sp * 6.5 + vec3(-t*0.7, t*0.3, 0.0));
  float c3 = fbm3_4(sp * 1.8 + vec3(t*0.3));

  float cMask = smoothstep(0.40, 0.65, c1 * 0.55 + c2 * 0.25 + c3 * 0.20);

  float diff = diffuse(vWorldPos, vNormal);
  vec3 col = vec3(0.92, 0.95, 1.0) * (0.18 + diff * 0.82);

  gl_FragColor = vec4(col, cMask * 0.88);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// MARS
// ─────────────────────────────────────────────────────────────────────────────
const MARS_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);
  float lat = vUv.y;

  float terrain = fbm3(sp * 3.2);
  float detail  = fbm3(sp * 9.0);
  float craters = fbm3(sp * 16.0);

  vec3 rust   = vec3(0.68, 0.24, 0.07);
  vec3 orange = vec3(0.76, 0.38, 0.12);
  vec3 dark   = vec3(0.30, 0.13, 0.05);
  vec3 tan    = vec3(0.60, 0.40, 0.22);

  vec3 col = mix(dark, rust, smoothstep(0.28, 0.58, terrain));
  col = mix(col, orange, smoothstep(0.52, 0.80, terrain));
  col = mix(col, tan,    smoothstep(0.65, 0.88, detail));
  col = mix(col, dark*0.65, smoothstep(0.70, 0.84, craters) * 0.5);

  // Polar caps
  float np = smoothstep(0.80, 0.93, lat);
  float sp2 = smoothstep(0.20, 0.07, lat);
  col = mix(col, vec3(0.88, 0.94, 0.86), clamp(max(np,sp2),0.0,1.0));

  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.05 + diff * 0.95);

  // Thin reddish atmosphere rim
  float r = rim(vWorldPos, vNormal);
  col += vec3(0.55, 0.18, 0.08) * r * 0.35;

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// JUPITER
// ─────────────────────────────────────────────────────────────────────────────
const JUPITER_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  float lat = vUv.y;
  float lon = vUv.x;
  float t   = u_time * 0.012;

  float warp = fbm2(vec2(lat * 4.5, lon * 1.8 + t)) * 0.04;
  float wavyLat = lat + warp;

  float bands = sin(wavyLat * 26.0 + lon * 0.6 + t) * 0.5 + 0.5;
  float fine  = sin(wavyLat * 60.0) * 0.5 + 0.5;
  float turb  = fbm2(vec2(lon * 3.2 + t*2.0, lat * 14.0));

  float s = bands * 0.55 + fine * 0.15 + turb * 0.30;

  vec3 cCream  = vec3(0.90, 0.82, 0.60);
  vec3 cTan    = vec3(0.72, 0.56, 0.32);
  vec3 cBrown  = vec3(0.48, 0.28, 0.12);
  vec3 cDark   = vec3(0.30, 0.17, 0.08);
  vec3 cOrange = vec3(0.78, 0.45, 0.18);

  vec3 col = mix(cDark,  cBrown, smoothstep(0.15, 0.40, s));
  col = mix(col, cTan,   smoothstep(0.38, 0.62, s));
  col = mix(col, cCream, smoothstep(0.60, 0.85, s));

  // Great Red Spot
  float grs_y = smoothstep(0.045, 0.0, abs(lat - 0.37));
  float grs_x = smoothstep(0.055, 0.0, abs(fract(lon + 0.5) - 0.6));
  col = mix(col, cOrange, grs_y * grs_x * 0.8);

  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.07 + diff * 0.93);

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// SATURN
// ─────────────────────────────────────────────────────────────────────────────
const SATURN_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  float lat = vUv.y;
  float lon = vUv.x;
  float t   = u_time * 0.009;

  float warp = fbm2(vec2(lat * 3.5, lon + t)) * 0.03;
  float bands = sin((lat + warp) * 20.0 + t) * 0.5 + 0.5;
  float fine  = sin((lat + warp) * 55.0) * 0.5 + 0.5;
  float s = bands * 0.70 + fine * 0.30;

  vec3 cLight = vec3(0.93, 0.87, 0.65);
  vec3 cMid   = vec3(0.78, 0.68, 0.44);
  vec3 cWarm  = vec3(0.65, 0.52, 0.30);
  vec3 cDark  = vec3(0.48, 0.38, 0.22);

  vec3 col = mix(cDark, cWarm, smoothstep(0.25, 0.50, s));
  col = mix(col, cMid,  smoothstep(0.48, 0.72, s));
  col = mix(col, cLight,smoothstep(0.70, 0.95, s));

  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.07 + diff * 0.93);

  // Subtle pale atmosphere rim
  float r = rim(vWorldPos, vNormal);
  col += vec3(0.75, 0.68, 0.45) * r * 0.25;

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// MERCURY
// ─────────────────────────────────────────────────────────────────────────────
const MERCURY_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);

  float base    = fbm3(sp * 3.8);
  float medium  = fbm3(sp * 9.0);
  float small_  = fbm3(sp * 22.0);

  vec3 cDark  = vec3(0.18, 0.17, 0.16);
  vec3 cMid   = vec3(0.42, 0.40, 0.38);
  vec3 cLight = vec3(0.60, 0.58, 0.55);
  vec3 cRay   = vec3(0.70, 0.68, 0.65);
  vec3 cFloor = vec3(0.08, 0.07, 0.06);

  vec3 col = mix(cDark, cMid,   smoothstep(0.32, 0.60, base));
  col = mix(col, cLight, smoothstep(0.58, 0.82, base));
  col = mix(col, cFloor, smoothstep(0.72, 0.86, medium) * 0.6);
  col = mix(col, cRay,   smoothstep(0.74, 0.88, small_) * 0.35);

  // Very sharp lighting — no atmosphere
  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.02 + diff * 0.98);

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// VENUS
// ─────────────────────────────────────────────────────────────────────────────
const VENUS_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);
  float t  = u_time * 0.018;

  float c1 = fbm3(sp * 2.2 + vec3(t, 0.0, t*0.6));
  float c2 = fbm3(sp * 5.5 + vec3(-t*0.75, t*0.4, 0.0));
  float c3 = fbm3_4(sp * 1.4 + vec3(t*0.3));

  float s = c1 * 0.5 + c2 * 0.3 + c3 * 0.2;

  vec3 cDeep   = vec3(0.55, 0.38, 0.12);
  vec3 cYellow = vec3(0.82, 0.70, 0.35);
  vec3 cPale   = vec3(0.92, 0.86, 0.60);
  vec3 cBright = vec3(0.98, 0.95, 0.80);

  vec3 col = mix(cDeep,   cYellow, smoothstep(0.28, 0.52, s));
  col = mix(col, cPale,   smoothstep(0.50, 0.75, s));
  col = mix(col, cBright, smoothstep(0.72, 0.95, s));

  // Thick atmosphere — high ambient + diffuse scatter
  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.18 + diff * 0.82);

  // Strong warm atmospheric rim
  float r = rim(vWorldPos, vNormal);
  col += vec3(0.90, 0.60, 0.15) * r * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// URANUS
// ─────────────────────────────────────────────────────────────────────────────
const URANUS_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);
  float lat = vUv.y;

  float atm   = fbm3(sp * 2.8);
  float bands = sin(lat * 10.0 + atm * 0.6) * 0.5 + 0.5;

  vec3 cDeep  = vec3(0.22, 0.60, 0.68);
  vec3 cCyan  = vec3(0.35, 0.78, 0.82);
  vec3 cLight = vec3(0.52, 0.88, 0.90);
  vec3 cPale  = vec3(0.72, 0.94, 0.95);

  vec3 col = mix(cDeep, cCyan,  smoothstep(0.30, 0.55, bands));
  col = mix(col, cLight, smoothstep(0.53, 0.78, bands));
  col = mix(col, cPale,  smoothstep(0.76, 1.00, bands));

  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.08 + diff * 0.92);

  float r = rim(vWorldPos, vNormal);
  col += vec3(0.18, 0.80, 0.90) * r * 0.45;

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// NEPTUNE
// ─────────────────────────────────────────────────────────────────────────────
const NEPTUNE_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);
  float lat = vUv.y;
  float t   = u_time * 0.022;

  float bands = sin(lat * 16.0 + fbm2(vec2(vUv.x*3.0+t, lat*5.0))*0.55) * 0.5 + 0.5;
  float storm = fbm3(sp * 3.8 + vec3(t, 0.0, 0.0));

  vec3 cVoid   = vec3(0.03, 0.08, 0.45);
  vec3 cDeep   = vec3(0.06, 0.18, 0.65);
  vec3 cBright = vec3(0.12, 0.32, 0.82);
  vec3 cDark   = vec3(0.02, 0.05, 0.28);

  vec3 col = mix(cVoid,  cDeep,   smoothstep(0.25, 0.55, bands));
  col = mix(col, cBright, smoothstep(0.52, 0.80, bands));
  col = mix(col, cDark,   smoothstep(0.68, 0.82, storm) * 0.45);

  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.05 + diff * 0.95);

  float r = rim(vWorldPos, vNormal);
  col += vec3(0.08, 0.35, 1.0) * r * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// MOON
// ─────────────────────────────────────────────────────────────────────────────
const MOON_FRAG = `
uniform float u_time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}
${LIGHT}

void main(){
  vec3 sp = normalize(vNormal);

  float highland = fbm3(sp * 2.0);
  float medium   = fbm3(sp * 7.5);
  float fine     = fbm3(sp * 18.0);
  float tiny     = fbm3(sp * 38.0);

  vec3 cMare  = vec3(0.18, 0.17, 0.16);
  vec3 cHigh  = vec3(0.52, 0.50, 0.47);
  vec3 cBright= vec3(0.68, 0.65, 0.62);
  vec3 cRay   = vec3(0.75, 0.73, 0.70);
  vec3 cDark  = vec3(0.08, 0.07, 0.06);

  vec3 col = mix(cMare, cHigh,  smoothstep(0.40, 0.65, highland + fine * 0.15));
  col = mix(col, cBright, smoothstep(0.62, 0.84, highland));
  col = mix(col, cDark,   smoothstep(0.72, 0.86, medium) * 0.65);
  col = mix(col, cRay,    smoothstep(0.76, 0.90, tiny)   * 0.40);

  // No atmosphere — harshest possible lighting
  float diff = diffuse(vWorldPos, vNormal);
  col *= (0.02 + diff * 0.98);

  gl_FragColor = vec4(col, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// SATURN RINGS
// ─────────────────────────────────────────────────────────────────────────────
const RING_VERT = `
varying vec2 vUv;
varying vec3 vWorldPos;
void main(){
  vUv       = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const RING_FRAG = `
varying vec2 vUv;
varying vec3 vWorldPos;

float h1(float n){ return fract(sin(n)*43758.5453); }

void main(){
  float u = vUv.x;  // 0 = inner edge, 1 = outer edge

  // Cassini Division: gap at ~0.42-0.52
  float cassini = 1.0 - smoothstep(0.40,0.42,u) * (1.0-smoothstep(0.52,0.54,u));

  // Ring density / particle simulation
  float coarse = h1(floor(u * 180.0)) * 0.35 + 0.65;
  float medium = h1(floor(u * 600.0)) * 0.20 + 0.80;
  float fine   = h1(floor(u * 2000.0))* 0.12 + 0.88;
  float density = coarse * medium * fine;

  // B ring is brightest (inner), A ring (outer) slightly dimmer
  float brightness = mix(0.85, 0.65, u);
  brightness *= smoothstep(0.0, 0.08, u) * smoothstep(1.0, 0.92, u); // edge fade

  vec3 cInner = vec3(0.80, 0.72, 0.48);
  vec3 cOuter = vec3(0.60, 0.55, 0.38);
  vec3 col = mix(cInner, cOuter, u) * density * brightness;

  float alpha = density * brightness * cassini * 0.78;
  gl_FragColor = vec4(col, alpha);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// SUN CORONA GLOW
// ─────────────────────────────────────────────────────────────────────────────
const CORONA_VERT = `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main(){
  vNormal   = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const CORONA_FRAG = `
uniform float u_time;
varying vec3 vNormal;
varying vec3 vWorldPos;
${NOISE}

void main(){
  vec3 vd  = normalize(cameraPosition - vWorldPos);
  float rim = 1.0 - max(dot(normalize(vNormal), vd), 0.0);
  rim = pow(rim, 2.2);

  float t = u_time * 0.05;
  vec3 p  = normalize(vWorldPos);
  float corona = fbm3(p * 1.8 + vec3(t));
  corona = smoothstep(0.35, 0.75, corona);

  vec3 cInner = vec3(1.0, 0.75, 0.15);
  vec3 cOuter = vec3(0.95, 0.35, 0.02);
  vec3 col = mix(cOuter, cInner, corona);

  float alpha = rim * 0.55;
  gl_FragColor = vec4(col, alpha);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// ATMOSPHERE GLOW (generic)
// ─────────────────────────────────────────────────────────────────────────────
const ATM_FRAG = `
uniform vec3 u_color;
uniform float u_intensity;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main(){
  vec3 vd = normalize(cameraPosition - vWorldPos);
  float rim = 1.0 - max(dot(normalize(vNormal), vd), 0.0);
  rim = pow(rim, 2.8);
  gl_FragColor = vec4(u_color, rim * u_intensity);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL FACTORIES
// ─────────────────────────────────────────────────────────────────────────────
function planet(frag: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: frag,
    uniforms: { u_time: { value: 0 } },
  })
}

function planetCloud(frag: string): THREE.ShaderMaterial {
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: frag,
    uniforms: { u_time: { value: 0 } },
    transparent: true,
    depthWrite: false,
  })
  return m
}

export function makeSunMaterial()     { return planet(SUN_FRAG) }
export function makeEarthMaterial()   { return planet(EARTH_FRAG) }
export function makeCloudMaterial()   { return planetCloud(CLOUD_FRAG) }
export function makeMarsMaterial()    { return planet(MARS_FRAG) }
export function makeJupiterMaterial() { return planet(JUPITER_FRAG) }
export function makeSaturnMaterial()  { return planet(SATURN_FRAG) }
export function makeMercuryMaterial() { return planet(MERCURY_FRAG) }
export function makeVenusMaterial()   { return planet(VENUS_FRAG) }
export function makeUranusMaterial()  { return planet(URANUS_FRAG) }
export function makeNeptuneMaterial() { return planet(NEPTUNE_FRAG) }
export function makeMoonMaterial()    { return planet(MOON_FRAG) }

export function makeRingMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: RING_VERT,
    fragmentShader: RING_FRAG,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
}

export function makeCoronaMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: CORONA_VERT,
    fragmentShader: CORONA_FRAG,
    uniforms: { u_time: { value: 0 } },
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

export function makeAtmMaterial(color: [number,number,number], intensity = 0.6): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: CORONA_VERT,
    fragmentShader: ATM_FRAG,
    uniforms: {
      u_color:     { value: new THREE.Vector3(...color) },
      u_intensity: { value: intensity },
    },
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
  })
}

export const PLANET_SHADER_MAP: Record<string, () => THREE.ShaderMaterial> = {
  sun:     makeSunMaterial,
  earth:   makeEarthMaterial,
  mars:    makeMarsMaterial,
  jupiter: makeJupiterMaterial,
  saturn:  makeSaturnMaterial,
  mercury: makeMercuryMaterial,
  venus:   makeVenusMaterial,
  uranus:  makeUranusMaterial,
  neptune: makeNeptuneMaterial,
  moon:    makeMoonMaterial,
}
