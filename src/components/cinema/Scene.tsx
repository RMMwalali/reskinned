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
import { HAIR_CODES, findCode } from "@/lib/codes";
import { cinema } from "./store";
import { KEYS, blendWeight, lerp, lerp3, smoothstep, type Key, type SwatchLayout, type V3 } from "./keyframes";
import { dotTexture, glowTexture, photoCardTexture, ringTexture, swatchTexture } from "./textures";

// ---------------------------------------------------------------------------
// Shared helpers

const SAMPLE = "#271D18"; // the demo hair sample used throughout the story
const NEUTRAL = "#2B211C";
const CYCLE = ["1", "1B", "2", "4", "30", "27"];
const MATCH = HAIR_CODES.findIndex((c) => c.code === "1B");

/** Live positions other actors need (particles fly from the bundle to the orb). */
const live = {
  bundle: new THREE.Vector3(),
  bundleScale: 0,
  orb: new THREE.Vector3(),
  orbScale: 0,
};

function frame(): { a: Key; b: Key; w: number } {
  const i = Math.min(cinema.index, KEYS.length - 1);
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  return { a: KEYS[i], b, w: blendWeight(cinema.local) };
}

const at = (k: { pos: V3; n: V3 }) => (cinema.narrow ? k.n : k.pos);
const sizeK = () => (cinema.narrow ? 0.6 : 1);
const damp = (dt: number, lambda = 4) => 1 - Math.exp(-lambda * dt);
const timeScale = () => (cinema.reducedMotion ? 0 : 1);

function dampVec(v: THREE.Vector3, t: V3, k: number) {
  v.x += (t[0] - v.x) * k;
  v.y += (t[1] - v.y) * k;
  v.z += (t[2] - v.z) * k;
}

// ---------------------------------------------------------------------------
// Camera rig: gentle pointer parallax, responsive framing

function Rig() {
  const { camera, size } = useThree();
  useFrame((_, dt) => {
    cinema.narrow = size.width < 760;
    const k = damp(dt, 2.5);
    const tx = cinema.pointer.x * 0.35;
    const ty = cinema.pointer.y * 0.22;
    const tz = cinema.narrow ? 14 : 12;
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    camera.lookAt(0, cinema.narrow ? 0.5 : 0, 0);
  });
  return null;
}

// ---------------------------------------------------------------------------
// Swatch cards — the colour ring in 3D

type T = { p: V3; r: V3; s: number };

function layout(kind: SwatchLayout, i: number, n: number, time: number): T {
  switch (kind) {
    case "fan": {
      const a = THREE.MathUtils.degToRad(-54 + (108 * i) / (n - 1));
      const R = 1.15;
      return { p: [-Math.sin(a) * R, -1.05 + Math.cos(a) * R, i * 0.014], r: [0, 0, a], s: 1 };
    }
    case "stack":
      return { p: [i * 0.025, -i * 0.015, -i * 0.05], r: [0, 0, (i - n / 2) * 0.012], s: 1 };
    case "orbit": {
      if (i === MATCH) return { p: [0, 0, 2.35], r: [0, 0, 0], s: 1.12 };
      const j = i < MATCH ? i : i - 1;
      const phi = (Math.PI * 2 * j) / (n - 1) + time * 0.16;
      const R = 2.05;
      return { p: [Math.sin(phi) * R, Math.cos(phi * 2) * 0.12, Math.cos(phi) * R], r: [0, phi, 0], s: 0.7 };
    }
    case "arc": {
      const d = i - (n - 1) / 2;
      return { p: [d * 0.62, -Math.abs(d) * 0.03, -Math.abs(d) * 0.12], r: [0, -d * 0.06, d * 0.02], s: 1 };
    }
  }
}

function Swatches() {
  const group = useRef<THREE.Group>(null);
  const cards = useRef<(THREE.Mesh | null)[]>([]);
  const n = HAIR_CODES.length;
  const geometry = useMemo(() => new RoundedBoxGeometry(0.6, 2.4, 0.06, 4, 0.05), []);
  const materials = useMemo(
    () =>
      HAIR_CODES.map(
        (c) =>
          new THREE.MeshPhysicalMaterial({
            map: swatchTexture(c.hex, c.code, c.name),
            roughness: 0.42,
            clearcoat: 0.55,
            clearcoatRoughness: 0.28,
            sheen: 0.6,
            sheenRoughness: 0.4,
            sheenColor: new THREE.Color("#ffffff"),
            transparent: true,
          }),
      ),
    [],
  );
  const time = useRef(0);
  const ready = useRef(false);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    time.current += dt * timeScale();
    const { a, b, w } = frame();
    const k = ready.current ? damp(dt, 3.2) : 1;
    ready.current = true;

    const gp = lerp3(at(a.swatch), at(b.swatch), w);
    dampVec(g.position, gp, k);
    const gs = lerp(a.swatch.scale, b.swatch.scale, w) * sizeK();
    g.scale.setScalar(g.scale.x + (gs - g.scale.x) * k);
    const idle = Math.sin(state.clock.elapsedTime * 0.35) * 0.07 * timeScale();
    const gr = lerp3(a.swatch.rot, b.swatch.rot, w);
    g.rotation.x += (gr[0] - cinema.pointer.y * 0.08 - g.rotation.x) * k;
    g.rotation.y += (gr[1] + idle + cinema.pointer.x * 0.16 - g.rotation.y) * k;
    g.rotation.z += (gr[2] - g.rotation.z) * k;

    const op = lerp(a.swatch.opacity, b.swatch.opacity, w);
    g.visible = op > 0.01 && g.scale.x > 0.02;

    for (let i = 0; i < n; i++) {
      const m = cards.current[i];
      if (!m) continue;
      const A = layout(a.swatch.layout, i, n, time.current);
      const B = layout(b.swatch.layout, i, n, time.current);
      dampVec(m.position, lerp3(A.p, B.p, w), k);
      const r = lerp3(A.r, B.r, w);
      m.rotation.x += (r[0] - m.rotation.x) * k;
      m.rotation.y += (r[1] - m.rotation.y) * k;
      m.rotation.z += (r[2] - m.rotation.z) * k;
      const s = lerp(A.s, B.s, w);
      m.scale.setScalar(m.scale.x + (s - m.scale.x) * k);
      const mat = materials[i];
      mat.opacity += (op - mat.opacity) * k;
      mat.depthWrite = mat.opacity > 0.95;
    }
  });

  return (
    <group ref={group}>
      {HAIR_CODES.map((c, i) => (
        <mesh
          key={c.code}
          ref={(el) => {
            cards.current[i] = el;
          }}
          geometry={geometry}
          material={materials[i]}
          renderOrder={i}
        />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Hair bundle — strands whose colour and curl change with the story

function buildBundle(count: number) {
  const parts: THREE.BufferGeometry[] = [];
  let seed = 42;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const TOP = 1.3;
  for (let i = 0; i < count; i++) {
    const gx = (rand() + rand() + rand()) / 3 - 0.5; // denser in the middle
    const x0 = gx * 1.5;
    const z0 = (rand() - 0.5) * 0.32;
    const len = 2.55 * (0.82 + rand() * 0.18);
    const geo = new THREE.CylinderGeometry(0.021, 0.012, len, 5, 64, true);
    geo.translate(x0, TOP - len / 2, z0);
    const vc = geo.attributes.position.count;
    const phase = rand() * Math.PI * 2;
    const shadeV = 0.72 + rand() * 0.5;
    geo.setAttribute("aPhase", new THREE.Float32BufferAttribute(new Array(vc).fill(phase), 1));
    geo.setAttribute("aLen", new THREE.Float32BufferAttribute(new Array(vc).fill(len), 1));
    geo.setAttribute("aRootX", new THREE.Float32BufferAttribute(new Array(vc).fill(x0), 1));
    geo.setAttribute("aShade", new THREE.Float32BufferAttribute(new Array(vc).fill(shadeV), 1));
    geo.deleteAttribute("uv");
    parts.push(geo);
  }
  return mergeGeometries(parts)!;
}

function Bundle() {
  const group = useRef<THREE.Group>(null);
  const narrowAtMount = typeof window !== "undefined" && window.innerWidth < 760;
  const geometry = useMemo(() => buildBundle(narrowAtMount ? 80 : 140), [narrowAtMount]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uCurl: { value: 0 } }), []);
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: NEUTRAL,
      roughness: 0.46,
      sheen: 1,
      sheenRoughness: 0.32,
      sheenColor: new THREE.Color("#c9c2d6"),
      clearcoat: 0.15,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uCurl = uniforms.uCurl;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform float uTime; uniform float uCurl;
          attribute float aPhase; attribute float aLen; attribute float aRootX; attribute float aShade;
          varying float vShade;`,
        )
        .replace(
          "#include <begin_vertex>",
          `vec3 transformed = vec3(position);
          float t = clamp((1.3 - position.y) / aLen, 0.0, 1.0);
          float shrink = mix(1.0, 0.74, uCurl);
          transformed.y = 1.3 - (1.3 - position.y) * shrink;
          float freq = mix(0.6, 12.0, uCurl * uCurl);
          float amp = mix(0.012, 0.065, uCurl) * smoothstep(0.0, 0.12, t);
          float ang = t * freq * 6.2831 + aPhase;
          transformed.x += sin(ang) * amp;
          transformed.z += cos(ang) * amp * uCurl;
          transformed.x += aRootX * t * (0.14 + 0.3 * uCurl);
          transformed.x += sin(uTime * 0.7 + aPhase + t * 2.0) * 0.035 * t * (1.0 - 0.6 * uCurl);
          vShade = aShade;`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\nvarying float vShade;`)
        .replace("#include <color_fragment>", `#include <color_fragment>\ndiffuseColor.rgb *= vShade;`);
    };
    m.customProgramCacheKey = () => "rangi-hair";
    return m;
  }, [uniforms]);
  const weftMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1411", roughness: 0.5, clearcoat: 0.3 }), []);
  const weftGeo = useMemo(() => new RoundedBoxGeometry(1.62, 0.16, 0.36, 3, 0.06), []);
  const target = useMemo(() => new THREE.Color(), []);
  const ready = useRef(false);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    uniforms.uTime.value += dt * timeScale();
    const { a, b, w } = frame();
    const k = ready.current ? damp(dt, 3.2) : 1;
    ready.current = true;

    dampVec(g.position, lerp3(at(a.bundle), at(b.bundle), w), k);
    const vis = lerp(a.bundle.vis, b.bundle.vis, w);
    const s = lerp(a.bundle.scale, b.bundle.scale, w) * sizeK() * (0.001 + 0.999 * vis);
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k);
    g.visible = g.scale.x > 0.02;
    g.rotation.y += (cinema.pointer.x * 0.25 + Math.sin(state.clock.elapsedTime * 0.3) * 0.12 * timeScale() - g.rotation.y) * k;

    const curlOf = (c: number | "scroll", current: boolean) => (c === "scroll" ? (current ? smoothstep(0.1, 0.82, cinema.local) : 0) : c);
    const curl = lerp(curlOf(a.bundle.curl, true), curlOf(b.bundle.curl, false), w);
    uniforms.uCurl.value += (curl - uniforms.uCurl.value) * k;

    const colourOf = (mode: Key["bundle"]["colour"], current: boolean) => {
      if (mode === "sample") return SAMPLE;
      if (mode === "cycle") {
        const idx = current ? Math.min(CYCLE.length - 1, Math.floor(cinema.local * CYCLE.length * 1.05)) : 0;
        return findCode(CYCLE[idx])!.hex;
      }
      return NEUTRAL;
    };
    target.set(w < 0.5 ? colourOf(a.bundle.colour, true) : colourOf(b.bundle.colour, false));
    material.color.lerp(target, damp(dt, 5));
    weftMat.color.copy(material.color).multiplyScalar(0.55);

    live.bundle.copy(g.position);
    live.bundleScale = g.scale.x;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} />
      <mesh geometry={weftGeo} material={weftMat} position={[0, 1.36, 0]} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Colour orb with an orbiting caption

function Orb() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const sphereMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#a7a1ab",
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        sheen: 0.25,
        sheenColor: new THREE.Color("#e6d9cc"),
        envMapIntensity: 0.55,
      }),
    [],
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: ringTexture("measured on you  ·  closest code 1B  ·  natural black  ·  ΔE 1.6  ·  "),
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    [],
  );
  const grey = useMemo(() => new THREE.Color("#a7a1ab"), []);
  const sample = useMemo(() => new THREE.Color(SAMPLE), []);
  const target = useMemo(() => new THREE.Color(), []);
  const ready = useRef(false);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const { a, b, w } = frame();
    const k = ready.current ? damp(dt, 3.2) : 1;
    ready.current = true;
    dampVec(g.position, lerp3(at(a.orb), at(b.orb), w), k);
    const s = lerp(a.orb.scale, b.orb.scale, w) * sizeK();
    g.scale.setScalar(Math.max(0.0001, g.scale.x + (s - g.scale.x) * k));
    g.visible = g.scale.x > 0.02;
    const fillOf = (f: number | "scroll", current: boolean) => (f === "scroll" ? (current ? smoothstep(0.05, 0.6, cinema.local) : 0) : f);
    const fill = lerp(fillOf(a.orb.fill, true), fillOf(b.orb.fill, false), w);
    target.copy(grey).lerp(sample, fill);
    sphereMat.color.lerp(target, damp(dt, 4));
    if (ring.current) {
      ringMat.opacity += (fill * (g.scale.x > 0.2 ? 1 : 0) - ringMat.opacity) * k;
      ring.current.quaternion.copy(state.camera.quaternion);
      ring.current.rotateZ(state.clock.elapsedTime * -0.18 * timeScale());
    }
    live.orb.copy(g.position);
    live.orbScale = g.scale.x;
  });

  return (
    <group ref={group}>
      <mesh material={sphereMat}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <mesh ref={ring} material={ringMat}>
        <planeGeometry args={[3.3, 3.3]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Particles — measured pixels travelling from the hair into the orb

function Particles() {
  const COUNT = 420;
  const points = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    let seed = 9;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: COUNT }, () => {
      const dir = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      return { off: rand(), sx: (rand() - 0.5) * 1.2, sy: rand() * 2.2 - 1.1, lift: 0.6 + rand() * 0.9, dir, speed: 0.22 + rand() * 0.16 };
    });
  }, []);
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.06,
        map: dotTexture(),
        color: SAMPLE,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        sizeAttenuation: true,
      }),
    [],
  );
  const t = useRef(0);
  const s0 = useMemo(() => new THREE.Vector3(), []);
  const s1 = useMemo(() => new THREE.Vector3(), []);
  const c = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const p = points.current;
    if (!p) return;
    t.current += dt * (cinema.reducedMotion ? 0.02 : 1);
    const { a, b, w } = frame();
    const on = lerp(a.particles, b.particles, w);
    material.opacity += (on * 0.9 - material.opacity) * damp(dt, 4);
    p.visible = material.opacity > 0.01;
    if (!p.visible) return;
    for (let i = 0; i < COUNT; i++) {
      const sd = seeds[i];
      const u = (t.current * sd.speed + sd.off) % 1;
      s0.set(live.bundle.x + sd.sx * live.bundleScale, live.bundle.y + sd.sy * live.bundleScale, live.bundle.z + 0.2);
      s1.copy(sd.dir).multiplyScalar(live.orbScale * 0.95).add(live.orb);
      c.copy(s0).add(s1).multiplyScalar(0.5);
      c.y += sd.lift * (cinema.narrow ? 0.5 : 1);
      c.z += 0.6;
      const iu = 1 - u;
      positions[i * 3] = iu * iu * s0.x + 2 * iu * u * c.x + u * u * s1.x;
      positions[i * 3 + 1] = iu * iu * s0.y + 2 * iu * u * c.y + u * u * s1.y;
      positions[i * 3 + 2] = iu * iu * s0.z + 2 * iu * u * c.z + u * u * s1.z;
    }
    (p.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={points} material={material} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
}

// ---------------------------------------------------------------------------
// Photo cards — the three capture angles

const FRAME_SPREAD: T[] = [
  { p: [-1.08, 0.08, -0.5], r: [0, 0.44, 0.05], s: 0.92 },
  { p: [0, 0, 0.1], r: [0, 0, 0], s: 1 },
  { p: [1.08, -0.08, -0.5], r: [0, -0.44, -0.05], s: 0.92 },
];

function Frames() {
  const group = useRef<THREE.Group>(null);
  const cards = useRef<(THREE.Mesh | null)[]>([]);
  const geometry = useMemo(() => new RoundedBoxGeometry(1.3, 1.75, 0.05, 4, 0.09), []);
  const views = useMemo(
    () =>
      ([
        ["right", "Turn right"],
        ["front", "Front"],
        ["left", "Turn left"],
      ] as const).map(
        ([v, l]) =>
          new THREE.MeshPhysicalMaterial({
            map: photoCardTexture(v, l),
            roughness: 0.5,
            clearcoat: 0.4,
            transparent: true,
            opacity: 0,
          }),
      ),
    [],
  );
  const ready = useRef(false);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const { a, b, w } = frame();
    const k = ready.current ? damp(dt, 3.2) : 1;
    ready.current = true;
    dampVec(g.position, lerp3(at(a.frames), at(b.frames), w), k);
    const s = lerp(a.frames.scale, b.frames.scale, w) * sizeK();
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k);
    g.rotation.y += (cinema.pointer.x * 0.2 - 0.12 - g.rotation.y) * k;
    g.rotation.x += (-cinema.pointer.y * 0.1 - g.rotation.x) * k;
    const spread = lerp(a.frames.spread, b.frames.spread, w);
    const op = lerp(a.frames.opacity, b.frames.opacity, w);
    g.visible = op > 0.01;
    for (let i = 0; i < 3; i++) {
      const m = cards.current[i];
      if (!m) continue;
      const S = FRAME_SPREAD[i];
      const stack: T = { p: [0, 0, -i * 0.04], r: [0, 0, 0], s: 1 };
      const bob = Math.sin(state.clock.elapsedTime * 0.8 + i * 1.7) * 0.05 * timeScale();
      dampVec(m.position, [lerp(stack.p[0], S.p[0], spread), lerp(stack.p[1], S.p[1], spread) + bob, lerp(stack.p[2], S.p[2], spread)], k);
      m.rotation.y += (lerp(0, S.r[1], spread) - m.rotation.y) * k;
      m.rotation.z += (lerp(0, S.r[2], spread) - m.rotation.z) * k;
      m.scale.setScalar(m.scale.x + (lerp(1, S.s, spread) - m.scale.x) * k);
      views[i].opacity += (op - views[i].opacity) * k;
      views[i].depthWrite = views[i].opacity > 0.95;
    }
  });

  return (
    <group ref={group}>
      {views.map((mat, i) => (
        <mesh
          key={i}
          ref={(el) => {
            cards.current[i] = el;
          }}
          geometry={geometry}
          material={mat}
        />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Frosted glow behind the focal object

function Glow() {
  const sprite = useRef<THREE.Sprite>(null);
  const material = useMemo(
    () => new THREE.SpriteMaterial({ map: glowTexture(), color: "#c9b8f4", transparent: true, depthWrite: false, opacity: 0 }),
    [],
  );
  const ready = useRef(false);
  useFrame((state, dt) => {
    const s = sprite.current;
    if (!s) return;
    const { a, b, w } = frame();
    const k = ready.current ? damp(dt, 2.5) : 1;
    ready.current = true;
    dampVec(s.position, lerp3(at(a.glow), at(b.glow), w), k);
    const sc = lerp(a.glow.scale, b.glow.scale, w) * sizeK() * (1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03 * timeScale());
    s.scale.setScalar(s.scale.x + (sc - s.scale.x) * k);
    material.opacity += (lerp(a.glow.opacity, b.glow.opacity, w) * 0.85 - material.opacity) * k;
  });
  return <sprite ref={sprite} material={material} renderOrder={-1} />;
}

// ---------------------------------------------------------------------------

export default function Scene() {
  return (
    <Canvas
      className="rangi-canvas"
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
      <Swatches />
      <Bundle />
      <Orb />
      <Particles />
      <Frames />
    </Canvas>
  );
}
