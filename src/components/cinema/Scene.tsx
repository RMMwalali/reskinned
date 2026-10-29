"use client";

/* eslint-disable react-hooks/immutability --
   react-three-fiber's model: three.js objects (camera, materials, uniforms)
   are created once and mutated every frame inside useFrame, outside React's
   render cycle. That is intentional and is how the scene animates at 60fps. */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { cinema } from "./store";
import { KEYS, blendWeight, lerp, lerp3, smoothstep, type Key, type Scroll, type V3 } from "./keyframes";
import { gaugeTexture, glowTexture, labelTexture, photoCardTexture } from "./textures";

// ---------------------------------------------------------------- helpers

function frame(): { a: Key; b: Key; w: number } {
  const i = Math.min(cinema.index, KEYS.length - 1);
  return { a: KEYS[i], b: KEYS[Math.min(i + 1, KEYS.length - 1)], w: blendWeight(cinema.local) };
}

/** Resolve a keyframe value that may be driven by the section's own scroll. */
const val = (s: Scroll, current: boolean, from = 0.05, to = 0.8) => {
  if (typeof s === "number") return s;
  const p = current ? smoothstep(from, to, cinema.local) : 0;
  return s === "up" ? p : 1 - p;
};

const at = (k: { pos: V3; n: V3 }) => (cinema.narrow ? k.n : k.pos);
const sizeK = () => (cinema.narrow ? 0.62 : 1);
const damp = (dt: number, lambda = 3.2) => 1 - Math.exp(-lambda * dt);
const timeScale = () => (cinema.reducedMotion ? 0 : 1);

function dampVec(v: THREE.Vector3, t: V3, k: number) {
  v.x += (t[0] - v.x) * k;
  v.y += (t[1] - v.y) * k;
  v.z += (t[2] - v.z) * k;
}

/** Shared placement: position, scale × visibility, and returns the visibility. */
function place(g: THREE.Object3D, a: { pos: V3; n: V3; scale: number; vis: number }, b: typeof a, w: number, k: number) {
  dampVec(g.position, lerp3(at(a), at(b), w), k);
  const vis = lerp(a.vis, b.vis, w);
  const s = lerp(a.scale, b.scale, w) * sizeK() * (0.001 + 0.999 * vis);
  g.scale.setScalar(Math.max(0.0001, g.scale.x + (s - g.scale.x) * k));
  g.visible = g.scale.x > 0.02;
  return vis;
}

function useReady() {
  const r = useRef(false);
  return (dt: number, lambda?: number) => {
    const k = r.current ? damp(dt, lambda) : 1;
    r.current = true;
    return k;
  };
}

// ---------------------------------------------------------------- camera

function Rig() {
  const { camera, size } = useThree();
  useFrame((_, dt) => {
    cinema.narrow = size.width < 760;
    const k = damp(dt, 2.5);
    camera.position.x += (cinema.pointer.x * 0.35 - camera.position.x) * k;
    camera.position.y += (cinema.pointer.y * 0.22 - camera.position.y) * k;
    camera.position.z += ((cinema.narrow ? 14 : 12) - camera.position.z) * k;
    camera.lookAt(0, cinema.narrow ? 0.5 : 0, 0);
  });
  return null;
}

// ---------------------------------------------------------------- hairline

const HAIR_GLSL_HEAD = `
uniform float uTime; uniform float uPull; uniform float uThin;
attribute float aA; attribute float aRow; attribute float aPhase; attribute float aLen; attribute float aShade;
varying float vShade;
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,s,0.0, -s,c,0.0, 0.0,0.0,1.0); }
`;

function buildHairline(count: number) {
  const parts: THREE.BufferGeometry[] = [];
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const row = i % 3;
    const a = Math.max(-1, Math.min(1, (i / count) * 2 - 1 + (rand() - 0.5) * 0.04));
    const len = (0.85 + rand() * 0.45) * (1 - Math.abs(a) * 0.25);
    const geo = new THREE.CylinderGeometry(0.012, 0.018, len, 5, 28, true);
    geo.translate(0, len / 2, 0);
    const n = geo.attributes.position.count;
    const fill = (v: number) => new THREE.Float32BufferAttribute(new Array(n).fill(v), 1);
    geo.setAttribute("aA", fill(a));
    geo.setAttribute("aRow", fill(row));
    geo.setAttribute("aPhase", fill(rand() * Math.PI * 2));
    geo.setAttribute("aLen", fill(len));
    geo.setAttribute("aShade", fill(0.7 + rand() * 0.55));
    geo.deleteAttribute("uv");
    parts.push(geo);
  }
  return mergeGeometries(parts)!;
}

function Hairline() {
  const group = useRef<THREE.Group>(null);
  const narrow = typeof window !== "undefined" && window.innerWidth < 760;
  const geometry = useMemo(() => buildHairline(narrow ? 180 : 330), [narrow]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPull: { value: 0 }, uThin: { value: 0 } }), []);
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: "#2a1d17",
      roughness: 0.48,
      sheen: 1,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color("#c9c2d6"),
      clearcoat: 0.1,
    });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${HAIR_GLSL_HEAD}`)
        .replace(
          "#include <beginnormal_vertex>",
          `float lean = mix(0.3, 1.25, uPull) + aRow * 0.16;
          float fan = -aA * mix(0.6, 0.2, uPull);
          mat3 R = rotZ(fan) * rotX(-lean);
          vec3 objectNormal = R * vec3(normal);
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3(tangent.xyz);
          #endif`,
        )
        .replace(
          "#include <begin_vertex>",
          `float t = clamp(position.y / aLen, 0.0, 1.0);
          float temple = smoothstep(0.45, 0.95, abs(aA));
          float keep = clamp(1.0 - uThin * temple * (0.8 + 0.35 * sin(aPhase * 3.0)), 0.0, 1.0);
          float len = aLen * mix(1.0, 1.1, uPull);
          vec3 p = vec3(position.x * mix(1.0, 0.4, 1.0 - keep), t * len * keep, position.z);
          float amp = mix(0.05, 0.008, uPull) * smoothstep(0.0, 0.15, t);
          float ang = t * 8.0 * 6.2831 + aPhase;
          p.x += sin(ang) * amp * keep;
          p.z += cos(ang) * amp * keep;
          p.x += sin(uTime * 0.8 + aPhase + t * 2.0) * 0.03 * t * (1.0 - uPull);
          p = R * p;
          vec3 root = vec3(sin(aA * 1.15) * 1.7, -aA * aA * 0.55, cos(aA * 1.15) * 0.55 - aRow * 0.1);
          vec3 transformed = root + p;
          vShade = aShade;`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\nvarying float vShade;`)
        .replace("#include <color_fragment>", `#include <color_fragment>\ndiffuseColor.rgb *= vShade;`);
    };
    m.customProgramCacheKey = () => "edgewise-hairline";
    return m;
  }, [uniforms]);
  const dome = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#efe9fb",
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.55,
      }),
    [],
  );
  const step = useReady();

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    uniforms.uTime.value += dt * timeScale();
    const { a, b, w } = frame();
    const k = step(dt);
    place(g, a.hairline, b.hairline, w, k);
    // Pull first, then thinning follows, as in real traction damage.
    const pull = lerp(val(a.hairline.pull, true, 0.04, 0.28), val(b.hairline.pull, false), w);
    const thin = lerp(val(a.hairline.thin, true, 0.26, 0.58), val(b.hairline.thin, false), w);
    uniforms.uPull.value += (pull - uniforms.uPull.value) * k;
    uniforms.uThin.value += (thin - uniforms.uThin.value) * k;
    g.rotation.y += (cinema.pointer.x * 0.3 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1 * timeScale() - 0.15 - g.rotation.y) * k;
    g.rotation.x += (0.28 - cinema.pointer.y * 0.1 - g.rotation.x) * k;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} />
      <mesh material={dome} position={[0, -0.95, -0.55]} scale={[1.85, 1.15, 1.05]}>
        <sphereGeometry args={[1, 64, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- photo cards

function Cards() {
  const group = useRef<THREE.Group>(null);
  const cards = useRef<(THREE.Mesh | null)[]>([]);
  const geometry = useMemo(() => new RoundedBoxGeometry(1.3, 1.75, 0.05, 4, 0.09), []);
  const mats = useMemo(
    () => [photoCardTexture("Take 1", 1), photoCardTexture("Take 2", 2)].map((map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.5, clearcoat: 0.4, transparent: true })),
    [],
  );
  const step = useReady();
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const { a, b, w } = frame();
    const k = step(dt);
    const vis = place(g, a.cards, b.cards, w, k);
    const spread = lerp(a.cards.spread, b.cards.spread, w);
    g.rotation.y += (cinema.pointer.x * 0.2 - 0.18 - g.rotation.y) * k;
    for (let i = 0; i < 2; i++) {
      const m = cards.current[i];
      if (!m) continue;
      const side = i === 0 ? -1 : 1;
      const bob = Math.sin(state.clock.elapsedTime * 0.8 + i * 1.7) * 0.05 * timeScale();
      dampVec(m.position, [side * 0.72 * spread, side * -0.08 * spread + bob, -i * 0.3 * spread], k);
      m.rotation.y += (side * -0.3 * spread - m.rotation.y) * k;
      m.rotation.z += (side * -0.05 * spread - m.rotation.z) * k;
      mats[i].opacity += (vis - mats[i].opacity) * k;
      mats[i].depthWrite = mats[i].opacity > 0.95;
    }
  });
  return (
    <group ref={group}>
      {mats.map((m, i) => (
        <mesh key={i} ref={(el) => void (cards.current[i] = el)} geometry={geometry} material={m} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- density gauge

function arcTube(radius: number, sweep: number, tube: number, segments: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const t = -sweep / 2 + (i / 64) * sweep + Math.PI / 2; // centred at the top, filling clockwise
    pts.push(new THREE.Vector3(-Math.cos(t) * radius, Math.sin(t) * radius, 0));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segments, tube, 10, false);
}

function Gauge() {
  const group = useRef<THREE.Group>(null);
  const SWEEP = Math.PI * 1.5;
  const SEG = 120;
  const track = useMemo(() => arcTube(1.1, SWEEP, 0.07, SEG), [SWEEP]);
  const fill = useMemo(() => arcTube(1.1, SWEEP, 0.085, SEG), [SWEEP]);
  const face = useMemo(() => new THREE.MeshBasicMaterial({ map: gaugeTexture(), transparent: true, depthWrite: false }), []);
  const fillMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5b3fb0", roughness: 0.3, clearcoat: 1 }), []);
  const trackMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#e4e0ea", roughness: 0.6 }), []);
  const amount = useRef(0);
  const step = useReady();
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const { a, b, w } = frame();
    const k = step(dt);
    const vis = place(g, a.gauge, b.gauge, w, k);
    const target = lerp(val(a.gauge.fill, true, 0.1, 0.6), val(b.gauge.fill, false), w) * (2.31 / 3);
    amount.current += (target - amount.current) * k;
    const idx = fill.index!.count;
    const per = idx / SEG;
    fill.setDrawRange(0, Math.max(0, Math.floor((amount.current * SEG)) * per));
    face.opacity = vis * smoothstep(0.2, 0.7, amount.current / (2.31 / 3));
    g.quaternion.slerp(state.camera.quaternion, k);
  });
  return (
    <group ref={group}>
      <mesh geometry={track} material={trackMat} />
      <mesh geometry={fill} material={fillMat} />
      <mesh material={face} position={[0, 0.05, 0.05]}>
        <planeGeometry args={[2, 2]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- trend chart

const SERIES = [
  { d: 2.31, label: "Box braids", c: "#17151b" },
  { d: 2.24, label: "Glued wig", c: "#8a5a00" },
  { d: 2.02, label: "Cornrows", c: "#b42318" },
  { d: 2.09, label: "Break", c: "#1e7a4e" },
  { d: 2.21, label: "Glueless", c: "#1e7a4e" },
  { d: 2.29, label: "Knotless", c: "#1e7a4e" },
];

function Chart() {
  const group = useRef<THREE.Group>(null);
  const dots = useRef<(THREE.Mesh | null)[]>([]);
  const labels = useRef<(THREE.Mesh | null)[]>([]);
  const xy = useMemo(() => SERIES.map((s, i) => new THREE.Vector3(-2.1 + i * 0.84, (s.d - 2.17) * 7, 0)), []);
  const SEG = 150;
  const line = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(xy, false, "centripetal"), SEG, 0.035, 8, false), [xy]);
  const lineMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#17151b", roughness: 0.35, clearcoat: 0.6 }), []);
  const dotMats = useMemo(() => SERIES.map((s) => new THREE.MeshPhysicalMaterial({ color: s.c, roughness: 0.25, clearcoat: 1 })), []);
  const labelMats = useMemo(
    () => SERIES.map((s) => new THREE.MeshBasicMaterial({ map: labelTexture(s.label, s.d.toFixed(2), s.c), transparent: true, depthWrite: false, opacity: 0 })),
    [],
  );
  const band = useMemo(() => new THREE.MeshBasicMaterial({ color: "#e8e1fa", transparent: true, opacity: 0.4, depthWrite: false }), []);
  const reveal = useRef(0);
  const step = useReady();
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const { a, b, w } = frame();
    const k = step(dt);
    place(g, a.chart, b.chart, w, k);
    const target = lerp(val(a.chart.reveal, true, 0.05, 0.75), val(b.chart.reveal, false), w);
    reveal.current += (target - reveal.current) * k;
    const per = line.index!.count / SEG;
    line.setDrawRange(0, Math.floor(reveal.current * SEG) * per);
    g.rotation.y += (cinema.pointer.x * 0.15 - 0.12 - g.rotation.y) * k;
    SERIES.forEach((_, i) => {
      const on = smoothstep(i / (SERIES.length - 1) - 0.08, i / (SERIES.length - 1) + 0.02, reveal.current);
      const d = dots.current[i];
      if (d) d.scale.setScalar(Math.max(0.001, on));
      labelMats[i].opacity = on;
    });
  });
  const baseY = (2.31 - 2.17) * 7;
  return (
    <group ref={group}>
      <mesh material={band} position={[0, baseY, -0.05]}>
        <planeGeometry args={[4.9, 0.6]} />
      </mesh>
      <mesh geometry={line} material={lineMat} />
      {xy.map((p, i) => (
        <group key={i} position={p}>
          <mesh ref={(el) => void (dots.current[i] = el)} material={dotMats[i]}>
            <sphereGeometry args={[0.13, 32, 24]} />
          </mesh>
          <mesh ref={(el) => void (labels.current[i] = el)} material={labelMats[i]} position={[0, i % 2 ? 0.5 : -0.5, 0]}>
            <planeGeometry args={[1.1, 0.34]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- tension bars

const BARS = [
  { label: "Box braids", t: 0.7 },
  { label: "Knotless", t: 0.45 },
  { label: "Twists", t: 0.4 },
  { label: "Glueless wig", t: 0.25 },
  { label: "Out", t: 0.05 },
];
const toneOf = (t: number) => (t >= 0.6 ? new THREE.Color("#b42318") : t >= 0.35 ? new THREE.Color("#c98a10") : new THREE.Color("#1e7a4e"));

function Bars() {
  const group = useRef<THREE.Group>(null);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const geometry = useMemo(() => {
    const g = new RoundedBoxGeometry(0.62, 1, 0.62, 4, 0.08);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  const mats = useMemo(() => BARS.map(() => new THREE.MeshPhysicalMaterial({ color: "#b42318", roughness: 0.3, clearcoat: 1 })), []);
  const labels = useMemo(() => BARS.map((b) => new THREE.MeshBasicMaterial({ map: labelTexture(b.label, `${Math.round(b.t * 100)}% tension`), transparent: true, depthWrite: false })), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const step = useReady();
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const { a, b, w } = frame();
    const k = step(dt);
    const vis = place(g, a.bars, b.bars, w, k);
    const sort = lerp(val(a.bars.sort, true, 0.1, 0.7), val(b.bars.sort, false), w);
    g.rotation.y += (cinema.pointer.x * 0.2 - 0.35 - g.rotation.y) * k;
    g.rotation.x += (0.18 - g.rotation.x) * k;
    BARS.forEach((bar, i) => {
      const m = bars.current[i];
      if (!m) return;
      // Every option starts as tall as the style asked for, then drops to its own tension.
      const t = lerp(BARS[0].t, bar.t, i === 0 ? 0 : smoothstep(i * 0.12, i * 0.12 + 0.45, sort));
      m.scale.y += (Math.max(0.03, t * 3.2) - m.scale.y) * k;
      tmp.copy(toneOf(t));
      mats[i].color.lerp(tmp, k);
      labels[i].opacity = vis;
    });
  });
  return (
    <group ref={group}>
      {BARS.map((bar, i) => (
        <group key={bar.label} position={[(i - 2) * 0.95, 0, 0]}>
          <mesh ref={(el) => void (bars.current[i] = el)} geometry={geometry} material={mats[i]} />
          <mesh material={labels[i]} position={[0, -0.32, 0.4]}>
            <planeGeometry args={[1.05, 0.33]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- glow

function Glow() {
  const sprite = useRef<THREE.Sprite>(null);
  const material = useMemo(() => new THREE.SpriteMaterial({ map: glowTexture(), color: "#c9b8f4", transparent: true, depthWrite: false, opacity: 0 }), []);
  const step = useReady();
  useFrame((state, dt) => {
    const s = sprite.current;
    if (!s) return;
    const { a, b, w } = frame();
    const k = step(dt, 2.5);
    dampVec(s.position, lerp3(at(a.glow), at(b.glow), w), k);
    const sc = lerp(a.glow.scale, b.glow.scale, w) * sizeK() * (1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03 * timeScale());
    s.scale.setScalar(s.scale.x + (sc - s.scale.x) * k);
    material.opacity += (lerp(a.glow.opacity, b.glow.opacity, w) * 0.85 - material.opacity) * k;
  });
  return <sprite ref={sprite} material={material} renderOrder={-1} />;
}

// ---------------------------------------------------------------- canvas

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 12], fov: 30, near: 0.1, far: 60 }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
    >
      <Rig />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} />
      <directionalLight position={[-6, -2, 4]} intensity={0.6} color="#d9ccff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -6]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-6, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[8, 3, 1]} color="#efe8ff" />
        <Lightformer form="rect" intensity={1.2} position={[6, -1, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 3, 1]} />
        <Lightformer form="circle" intensity={2} position={[0, 0, 8]} scale={4} />
      </Environment>
      <Glow />
      <Hairline />
      <Cards />
      <Gauge />
      <Chart />
      <Bars />
    </Canvas>
  );
}
