import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { REDUCED_MOTION } from '../store.js';
import Farm from './Farm.jsx';

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Instanced mesh from a list of [x, y, z, scale, rotY] transforms (scale may be [sx, sy, sz]).
export function Scatter({ items, children, castShadow = false, colors, material = null }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    items.forEach(([x, y, z, s, r = 0], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r);
      const sc = Array.isArray(s) ? new THREE.Vector3(...s) : new THREE.Vector3(s, s, s);
      m.compose(new THREE.Vector3(x, y, z), q, sc);
      ref.current.setMatrixAt(i, m);
      if (colors) ref.current.setColorAt(i, c.set(colors[i % colors.length]));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items, colors]);
  return (
    <instancedMesh ref={ref} args={[null, material, items.length]} castShadow={castShadow} receiveShadow>
      {children}
    </instancedMesh>
  );
}

function inRect([x, z], [x0, x1, z0, z1]) {
  return x > x0 && x < x1 && z > z0 && z < z1;
}

// Areas where trees must not grow: the building, the farm, and the camera's line of sight.
const KEEP_OUT = [
  [-14, 14, -11, 11],
  [-66, -13, -28, 28],
  [-14, 40, 9, 60],
  [12, 60, -4, 60],
];

function useTrees() {
  return useMemo(() => {
    const r = rng(42);
    const out = [];
    let guard = 0;
    while (out.length < 90 && guard++ < 4000) {
      const x = -60 + r() * 110;
      const z = -45 + r() * 75;
      if (KEEP_OUT.some((k) => inRect([x, z], k))) continue;
      out.push([x, z, 0.8 + r() * 0.7, r() * Math.PI * 2]);
    }
    return out;
  }, []);
}

function Trees() {
  const trees = useTrees();
  const trunks = useMemo(() => trees.map(([x, z, s, r]) => [x, 0.9 * s, z, s, r]), [trees]);
  const crowns = useMemo(() => trees.map(([x, z, s, r]) => [x, 2.5 * s, z, s, r]), [trees]);
  const crowns2 = useMemo(() => trees.map(([x, z, s, r]) => [x + 0.5 * s, 2.1 * s, z + 0.3 * s, s * 0.75, r]), [trees]);
  return (
    <group>
      <Scatter items={trunks} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 1.8, 7]} />
        <meshStandardMaterial color="#7c5a3a" />
      </Scatter>
      <Scatter items={crowns} castShadow>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#3f8f4f" roughness={1} flatShading />
      </Scatter>
      <Scatter items={crowns2} castShadow>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#58a85f" roughness={1} flatShading />
      </Scatter>
    </group>
  );
}

export function Palm({ position, lean = 0.12, rotation = 0, height = 5 }) {
  const fronds = [0, 1, 2, 3, 4, 5, 6];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group rotation={[lean, 0, 0]}>
        <mesh castShadow position={[0, height / 2, 0]}>
          <cylinderGeometry args={[0.13, 0.2, height, 8]} />
          <meshStandardMaterial color="#9c7a54" roughness={1} />
        </mesh>
        <group position={[0, height, 0]}>
          {fronds.map((i) => (
            <group key={i} rotation={[0, (i / fronds.length) * Math.PI * 2, 0]}>
              <mesh castShadow position={[0, -0.25, 0.9]} rotation={[0.55, 0, 0]} scale={[0.45, 0.06, 1.9]}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial color={i % 2 ? '#3f9b4f' : '#2f7f3f'} roughness={1} />
              </mesh>
            </group>
          ))}
          {[0, 2.1, 4.2].map((a) => (
            <mesh key={a} position={[Math.sin(a) * 0.18, -0.2, Math.cos(a) * 0.18]}>
              <sphereGeometry args={[0.13, 10, 8]} />
              <meshStandardMaterial color="#6b4f2a" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export function Chicken({ position, rotation = 0, color = '#b45309', tail = '#14532d', phase = 0 }) {
  const head = useRef();
  useFrame(({ clock }) => {
    if (!head.current || REDUCED_MOTION) return;
    const t = clock.elapsedTime + phase;
    head.current.rotation.x = Math.max(0, Math.sin(t * 1.7)) ** 6 * 0.9;
  });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.32, 0]} scale={[0.8, 0.75, 1.1]}>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.5, -0.26]} rotation={[-0.6, 0, 0]}>
        <coneGeometry args={[0.13, 0.36, 7]} />
        <meshStandardMaterial color={tail} roughness={0.8} />
      </mesh>
      <group ref={head} position={[0, 0.5, 0.18]}>
        <mesh castShadow position={[0, 0.1, 0.05]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.23, 0.04]}>
          <boxGeometry args={[0.03, 0.08, 0.12]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 0.09, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.03, 0.08, 6]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      </group>
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.08, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 6]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      ))}
    </group>
  );
}

function Clouds() {
  const group = useRef();
  const clouds = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 9 }, () => ({
      x: -120 + r() * 200,
      y: 28 + r() * 14,
      z: -110 + r() * 90,
      s: 2 + r() * 2.5,
    }));
  }, []);
  useFrame((_, dt) => {
    if (!group.current || REDUCED_MOTION) return;
    group.current.children.forEach((c) => {
      c.position.x += dt * 0.8;
      if (c.position.x > 110) c.position.x = -130;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[
            [0, 0, 0, 1.2],
            [1.3, -0.2, 0.2, 0.9],
            [-1.2, -0.25, 0, 0.85],
            [0.4, 0.5, -0.2, 0.8],
          ].map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]}>
              <sphereGeometry args={[r, 12, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Outdoor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[420, 420]} />
        <meshStandardMaterial color="#86c06c" roughness={1} />
      </mesh>

      {/* Rolling hills and distant mountains */}
      {[
        [-75, -6, -45, 28, '#6faa58'],
        [-25, -8, -70, 32, '#79b562'],
        [25, -8, -72, 30, '#6faa58'],
        [70, -7, -50, 26, '#84bd6b'],
        [-95, -6, 15, 26, '#79b562'],
      ].map(([x, y, z, r, c]) => (
        <mesh key={`${x}${z}`} position={[x, y, z]} scale={[1, 0.38, 1]} receiveShadow>
          <sphereGeometry args={[r, 24, 16]} />
          <meshStandardMaterial color={c} roughness={1} />
        </mesh>
      ))}
      {[
        [-110, -120, 38, 46],
        [-50, -140, 44, 58],
        [20, -145, 40, 50],
        [85, -125, 36, 42],
        [-150, -60, 34, 40],
      ].map(([x, z, r, h]) => (
        <mesh key={`${x}${z}`} position={[x, h / 2 - 2, z]}>
          <coneGeometry args={[r, h, 7]} />
          <meshStandardMaterial color="#8fb0c4" roughness={1} flatShading />
        </mesh>
      ))}

      <mesh position={[70, 80, -170]}>
        <sphereGeometry args={[8, 20, 16]} />
        <meshBasicMaterial color="#fff6c8" toneMapped={false} />
      </mesh>

      <Trees />
      <Farm />
      <Clouds />
    </group>
  );
}
