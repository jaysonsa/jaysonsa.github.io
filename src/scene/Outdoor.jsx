import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { REDUCED_MOTION, getState, select } from '../store.js';
import { commandWalk } from '../team.js';
import { labelLayer } from './labelLayer.js';
import { signTexture } from './textures.js';
import { ACCENT } from './Station.jsx';

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Instanced mesh from a list of [x, y, z, scale, rotY] transforms.
function Scatter({ items, children, castShadow = false }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    items.forEach(([x, y, z, s, r = 0], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[null, null, items.length]} castShadow={castShadow} receiveShadow>
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
  [-38, -14, -10, 14],
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

function Palm({ position, lean = 0.12, rotation = 0, height = 5 }) {
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

const ROOSTERS = [
  ['#b45309', '#14532d'],
  ['#1f2937', '#065f46'],
  ['#f5f5f4', '#a8a29e'],
  ['#7c2d12', '#111827'],
  ['#c2410c', '#1e3a8a'],
];

// A-frame teepee shelter with a tethered rooster: the classic gamefowl setup.
function Teepee({ position, i }) {
  const [color, tail] = ROOSTERS[i % ROOSTERS.length];
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.85, 1.2, 4]} />
        <meshStandardMaterial color={i % 2 ? '#b07d45' : '#9a6a38'} roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 0.25, 0.42]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[0.36, 0.5]} />
        <meshStandardMaterial color="#3b2a1a" side={2} />
      </mesh>
      <mesh position={[1.0, 0.15, 0.3]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 6]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      <Chicken position={[0.9, 0, 0.9]} rotation={0.6 + i} color={color} tail={tail} phase={i * 0.7} />
    </group>
  );
}

function NipaHut({ position }) {
  return (
    <group position={position}>
      {[
        [-1.3, -1.0],
        [1.3, -1.0],
        [-1.3, 1.0],
        [1.3, 1.0],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} castShadow position={[x, 0.35, z]}>
          <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
          <meshStandardMaterial color="#6b4f2a" />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[3, 0.15, 2.4]} />
        <meshStandardMaterial color="#8b6b43" />
      </mesh>
      <mesh castShadow position={[0, 1.6, 0]}>
        <boxGeometry args={[2.7, 1.6, 2.1]} />
        <meshStandardMaterial color="#d9b77e" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 3.0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.6, 1.6, 4]} />
        <meshStandardMaterial color="#a3773a" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 1.4, 1.06]}>
        <planeGeometry args={[0.6, 1.1]} />
        <meshStandardMaterial color="#4a3320" />
      </mesh>
      <mesh position={[0.9, 1.75, 1.06]}>
        <planeGeometry args={[0.55, 0.45]} />
        <meshStandardMaterial color="#3b2a1a" />
      </mesh>
      <mesh castShadow position={[0, 0.35, 1.55]} rotation={[0.6, 0, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.9]} />
        <meshStandardMaterial color="#8b6b43" />
      </mesh>
    </group>
  );
}

function Fence({ x0, x1, z0, z1, gap }) {
  const posts = [];
  const step = 1.6;
  for (let x = x0; x <= x1 + 0.01; x += step) {
    posts.push([x, z0]);
    if (!(gap && Math.abs(x - gap) < 1.8)) posts.push([x, z1]);
  }
  for (let z = z0 + step; z < z1; z += step) {
    posts.push([x0, z]);
    posts.push([x1, z]);
  }
  const rails = [
    [(x0 + x1) / 2, z0, x1 - x0, 0],
    [x0, (z0 + z1) / 2, z1 - z0, Math.PI / 2],
    [x1, (z0 + z1) / 2, z1 - z0, Math.PI / 2],
  ];
  if (gap) {
    rails.push([(x0 + gap - 1.8) / 2, z1, gap - 1.8 - x0, 0]);
    rails.push([(gap + 1.8 + x1) / 2, z1, x1 - gap - 1.8, 0]);
  } else {
    rails.push([(x0 + x1) / 2, z1, x1 - x0, 0]);
  }
  return (
    <group>
      <Scatter items={posts.map(([x, z]) => [x, 0.5, z, 1])} castShadow>
        <boxGeometry args={[0.12, 1, 0.12]} />
        <meshStandardMaterial color="#8b5a2b" />
      </Scatter>
      {rails.map(([x, z, len, r], i) =>
        [0.35, 0.75].map((y) => (
          <mesh key={`${i}-${y}`} position={[x, y, z]} rotation={[0, r, 0]}>
            <boxGeometry args={[len, 0.07, 0.05]} />
            <meshStandardMaterial color="#a16207" />
          </mesh>
        )),
      )}
    </group>
  );
}

function Terraces() {
  const steps = [0, 1, 2, 3, 4, 5];
  return (
    <group position={[-52, 0, 2]}>
      {steps.map((i) => (
        <group key={i}>
          <mesh receiveShadow position={[-i * 4, i * 0.6 + 0.3, 0]}>
            <boxGeometry args={[4, 0.6 + i * 1.2, 26]} />
            <meshStandardMaterial color="#8b6b43" />
          </mesh>
          <mesh receiveShadow position={[-i * 4, i * 1.2 + 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.8, 25.6]} />
            <meshStandardMaterial color={i % 2 ? '#9ccc65' : '#7cb342'} roughness={1} />
          </mesh>
        </group>
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

function Farm() {
  const [hover, setHover] = useState(false);
  const sign = useMemo(
    () => signTexture('JER GAMEFARM', { bg: '#6b3f1d', fg: '#fde68a', w: 1024, h: 200, size: 120 }),
    [],
  );
  const teepees = useMemo(() => {
    const out = [];
    [-33, -30, -22, -19].forEach((x) => [-5, -1.5, 2, 5.5].forEach((z) => out.push([x, 0, z])));
    return out;
  }, []);

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 6) return;
        if (getState().controlled) commandWalk(e.point);
        else select('farm-ledger');
      }}
    >
      {/* Farm grounds */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.005, 2]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={hover ? '#a3d47a' : '#93c56c'} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.012, 3.5]} receiveShadow>
        <planeGeometry args={[1.8, 17]} />
        <meshStandardMaterial color="#cfa974" roughness={1} />
      </mesh>
      <Fence x0={-36} x1={-16} z0={-8} z1={12} gap={-26} />

      {/* Entrance arch with sign */}
      <group position={[-26, 0, 12.2]} rotation={[0, 0.35, 0]}>
        {[-2.3, 2.3].map((x) => (
          <mesh key={x} castShadow position={[x, 1.7, 0]}>
            <boxGeometry args={[0.3, 3.4, 0.3]} />
            <meshStandardMaterial color="#6b3f1d" />
          </mesh>
        ))}
        <mesh castShadow position={[0, 3.25, 0]}>
          <boxGeometry args={[5.4, 1.0, 0.18]} />
          <meshStandardMaterial color="#6b3f1d" />
        </mesh>
        <mesh position={[0, 3.25, 0.1]}>
          <planeGeometry args={[5.1, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
        <mesh position={[0, 3.25, -0.1]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[5.1, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>

      {teepees.map((p, i) => (
        <Teepee key={i} position={p} i={i} />
      ))}
      <NipaHut position={[-26, 0, -5.5]} />

      {/* Pond */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-19.5, 0.02, 9.3]}>
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial color="#5fb3d9" roughness={0.2} metalness={0.1} />
      </mesh>
      {[
        [-21.2, 9.0],
        [-18.1, 10.4],
        [-18.4, 8.0],
      ].map(([x, z]) => (
        <mesh key={x} castShadow position={[x, 0.12, z]} scale={[1, 0.6, 1]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#9ca3af" flatShading />
        </mesh>
      ))}

      {/* Hay bales */}
      {[
        [-34.4, 9.8],
        [-33.2, 9.8],
        [-33.8, 10.9],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} castShadow position={[x, 0.4, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.9, 16]} />
          <meshStandardMaterial color="#e0b44c" roughness={1} />
        </mesh>
      ))}

      <Palm position={[-17.2, 0, 11]} rotation={0.4} />
      <Palm position={[-35, 0, 11]} rotation={-0.6} height={5.6} />
      <Palm position={[-17.2, 0, -7.2]} rotation={2.4} height={4.6} />
      <Palm position={[-35, 0, -7.2]} rotation={-2.2} />
      <Palm position={[-29.5, 0, -7.5]} rotation={3} height={6} />

      <Html position={[-26, 6.2, 3]} center zIndexRange={[20, 0]} portal={labelLayer}>
        <button
          type="button"
          className={`station-label farm-label${hover ? ' is-active' : ''}`}
          style={{ '--accent-label': ACCENT }}
          onClick={() => select('farm-ledger')}
        >
          JER Gamefarm
        </button>
      </Html>
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
      <Terraces />
      <Farm />
      <Clouds />
    </group>
  );
}
