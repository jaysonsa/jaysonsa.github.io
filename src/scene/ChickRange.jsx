import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { REDUCED_MOTION } from '../store.js';
import { makeCanvasTexture, signTexture } from './textures.js';
import { Chicken } from './Outdoor.jsx';
import { Html } from '@react-three/drei';
import { setState } from '../store.js';
import { labelLayer } from './labelLayer.js';

// A netted free-range pen for chicks with a brooder house in the middle.

const W = 9; // along x
const D = 7; // along z
const H = 2.2; // net height
const HOUSE = { w: 3.2, d: 2.4, h: 1.6 };
const CHICKS = 36;
const CHICK_COLORS = ['#fde047', '#facc15', '#fef08a', '#d6a35c', '#292524', '#fde047'];

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

let netTex;
function netTexture() {
  if (netTex) return netTex;
  netTex = makeCanvasTexture(64, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(30,41,59,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, h);
    ctx.moveTo(w, 0);
    ctx.lineTo(0, h);
    ctx.stroke();
  });
  netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
  return netTex;
}

function NetPanel({ width, height, position, rotation }) {
  const tex = useMemo(() => {
    const t = netTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(width * 3, height * 3);
    return t;
  }, [width, height]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.2} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function roofGeometry(w, rise, length) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(0, rise);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
  g.translate(0, 0, -length / 2);
  return g;
}

function BrooderHouse() {
  const { w, d, h } = HOUSE;
  const roof = useMemo(() => roofGeometry(d + 0.5, 1.0, w + 0.4), [w, d]);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.9} />
      </mesh>
      {/* Roof ridge runs along x */}
      <mesh castShadow geometry={roof} position={[0, h, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#b91c1c" roughness={0.8} flatShading />
      </mesh>
      {/* Chick door and ramp on the front (+z) */}
      <mesh position={[0, 0.3, d / 2 + 0.01]}>
        <planeGeometry args={[0.6, 0.55]} />
        <meshStandardMaterial color="#3b2a1a" />
      </mesh>
      <mesh castShadow position={[0, 0.12, d / 2 + 0.45]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.9]} />
        <meshStandardMaterial color="#a16207" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.05, 1.0, d / 2 + 0.01]}>
          <planeGeometry args={[0.55, 0.4]} />
          <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Feeder({ position, color }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.08, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.45, 14]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Chicks wander inside the pen, avoiding the house.
function Chicks({ seed }) {
  const bodies = useRef();
  const heads = useRef();
  const chicks = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: CHICKS }, () => ({
      pos: new THREE.Vector2((r() - 0.5) * (W - 1), (r() - 0.5) * (D - 1)),
      target: new THREE.Vector2(),
      heading: r() * Math.PI * 2,
      speed: 0.35 + r() * 0.45,
      wait: r() * 2,
      phase: r() * 10,
      color: CHICK_COLORS[Math.floor(r() * CHICK_COLORS.length)],
      r,
    }));
  }, [seed]);

  const insideHouse = (p) => Math.abs(p.x) < HOUSE.w / 2 + 0.25 && Math.abs(p.y) < HOUSE.d / 2 + 0.25;
  const pickTarget = (c) => {
    do {
      c.target.set((c.r() - 0.5) * (W - 1), (c.r() - 0.5) * (D - 1));
    } while (insideHouse(c.target));
  };

  useLayoutEffect(() => {
    const color = new THREE.Color();
    chicks.forEach((c, i) => {
      if (insideHouse(c.pos)) c.pos.y = HOUSE.d / 2 + 0.6;
      pickTarget(c);
      bodies.current.setColorAt(i, color.set(c.color));
      heads.current.setColorAt(i, color.set(c.color));
    });
    bodies.current.instanceColor.needsUpdate = true;
    heads.current.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chicks]);

  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const one = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const dir = useMemo(() => new THREE.Vector2(), []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    chicks.forEach((c, i) => {
      if (!REDUCED_MOTION) {
        if (c.wait > 0) {
          c.wait -= dt;
        } else {
          dir.subVectors(c.target, c.pos);
          const dist = dir.length();
          if (dist < 0.05) {
            pickTarget(c);
            c.wait = 0.5 + c.r() * 2.5;
          } else {
            dir.multiplyScalar(1 / dist);
            c.pos.addScaledVector(dir, Math.min(dist, c.speed * dt));
            if (insideHouse(c.pos)) {
              c.pos.addScaledVector(dir, -c.speed * dt * 2);
              pickTarget(c);
            }
            c.heading = Math.atan2(dir.x, dir.y);
          }
        }
      }
      const peck = c.wait > 0 ? Math.max(0, Math.sin(t * 8 + c.phase)) * 0.05 : 0;
      const hop = c.wait > 0 ? 0 : Math.abs(Math.sin(t * 14 + c.phase)) * 0.025;
      q.setFromAxisAngle(up, c.heading);
      m.compose(v.set(c.pos.x, 0.09 + hop, c.pos.y), q, one);
      bodies.current.setMatrixAt(i, m);
      v.set(c.pos.x + Math.sin(c.heading) * 0.08, 0.18 + hop - peck, c.pos.y + Math.cos(c.heading) * 0.08);
      m.compose(v, q, one);
      heads.current.setMatrixAt(i, m);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodies} args={[null, null, CHICKS]} castShadow>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[null, null, CHICKS]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

export default function ChickRange({ position, number, seed = 1, label = false }) {
  const sign = useMemo(
    () => signTexture(`CHICK RANGE ${number}`, { bg: '#7f1d1d', fg: '#fde68a', w: 512, h: 128, size: 52 }),
    [number],
  );
  const posts = [];
  for (let x = -W / 2; x <= W / 2 + 0.01; x += W / 4) {
    posts.push([x, -D / 2]);
    posts.push([x, D / 2]);
  }
  for (let z = -D / 2 + D / 3; z < D / 2 - 0.01; z += D / 3) {
    posts.push([-W / 2, z]);
    posts.push([W / 2, z]);
  }

  return (
    <group position={position}>
      {/* Ground inside the pen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#b9a26a" roughness={1} />
      </mesh>
      {[
        [-2.8, -1.8, 1.6],
        [2.9, 1.9, 1.3],
        [-3, 2.2, 1.1],
      ].map(([x, z, r]) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, z]}>
          <circleGeometry args={[r, 20]} />
          <meshStandardMaterial color="#8fbf55" roughness={1} />
        </mesh>
      ))}

      {/* Net enclosure: posts, side nets, and a top net */}
      {posts.map(([x, z]) => (
        <mesh key={`${x},${z}`} castShadow position={[x, H / 2, z]}>
          <cylinderGeometry args={[0.05, 0.06, H, 8]} />
          <meshStandardMaterial color="#6b4f2a" />
        </mesh>
      ))}
      <NetPanel width={W} height={H} position={[0, H / 2, -D / 2]} />
      <NetPanel width={W} height={H} position={[0, H / 2, D / 2]} />
      <NetPanel width={D} height={H} position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
      <NetPanel width={D} height={H} position={[W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
      <NetPanel width={W} height={D} position={[0, H, 0]} rotation={[-Math.PI / 2, 0, 0]} />

      <BrooderHouse />
      <Feeder position={[-2.6, 0, 1.6]} color="#dc2626" />
      <Feeder position={[2.7, 0, -1.7]} color="#2563eb" />
      <Chicken position={[2.2, 0, 2.0]} rotation={-2.4} color="#b45309" tail="#7c2d12" phase={seed} />
      <Chicks seed={seed * 97} />

      {label && (
        <Html position={[0, H + 2, 0]} center zIndexRange={[20, 0]} portal={labelLayer}>
          <button
            type="button"
            className="station-label farm-label"
            data-spot="chicks"
            onClick={() => setState({ spot: 'chicks', selected: null })}
          >
            Chick Ranges
          </button>
        </Html>
      )}

      {/* Sign on the front net */}
      <group position={[0, H + 0.45, D / 2]}>
        <mesh>
          <boxGeometry args={[2.6, 0.62, 0.06]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[2.5, 0.55]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
