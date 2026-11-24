import { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { getState, select } from '../store.js';
import { commandWalk } from '../team.js';
import { labelLayer } from './labelLayer.js';
import { makeCanvasTexture, signTexture } from './textures.js';
import { Chicken, Palm, Scatter } from './Outdoor.jsx';
import { FARM, FARM_PALMS, rng, teepeePositions } from '../world.js';

// JER Gamefarm: long straight rows of striped, numbered teepees on a bright lawn,
// each with a tethered rooster, receding toward the horizon.

const RED = '#b0123a';
const YELLOW = '#f2c230';
const BLUE = '#1d4fd8';

const { COLS, Z_STEP, ROWS, AISLE_Z, X_GATE, X_FAR, Z_MIN, Z_MAX } = FARM;
const DETAILED_COLS = 2; // nearest columns get individual numbered faces

function stripes(ctx, w, h) {
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, w / 3, h);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(w / 3, 0, w / 3, h);
  ctx.fillStyle = BLUE;
  ctx.fillRect((2 * w) / 3, 0, w / 3 + 1, h);
}

function numberedFace(n) {
  return makeCanvasTexture(128, 192, (ctx, w, h) => {
    stripes(ctx, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(n).padStart(3, '0'), w / 2, h * 0.3);
  });
}

function grassTexture() {
  const r = rng(5);
  const tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#9fcd45';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const shade = r();
      ctx.fillStyle = shade > 0.7 ? 'rgba(120,150,40,.5)' : shade > 0.4 ? 'rgba(190,220,90,.45)' : 'rgba(140,110,60,.25)';
      ctx.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  return tex;
}

function useLayout() {
  return useMemo(() => {
    const r = rng(11);
    return teepeePositions().map((t) => ({
      ...t,
      n: t.row * COLS + t.col + 1,
      jitter: (r() - 0.5) * 0.5,
      face: r() * Math.PI * 2,
    }));
  }, []);
}

function NumberedTeepee({ x, z, n, sides, top }) {
  const face = useMemo(() => numberedFace(n), [n]);
  return (
    <mesh castShadow receiveShadow position={[x, 0.5, z]}>
      <boxGeometry args={[0.5, 1, 0.7]} />
      <meshStandardMaterial attach="material-0" map={face} roughness={0.8} />
      <meshStandardMaterial attach="material-1" map={sides.back} roughness={0.8} />
      <meshStandardMaterial attach="material-2" color={top} />
      <meshStandardMaterial attach="material-3" color={top} />
      <meshStandardMaterial attach="material-4" color={BLUE} roughness={0.8} />
      <meshStandardMaterial attach="material-5" color={RED} roughness={0.8} />
    </mesh>
  );
}

const ROOSTER_BODIES = ['#7c2d12', '#1f2937', '#f5f5f4', '#b45309', '#9a3412', '#292524', '#c2410c'];

export default function Farm() {
  const [hover, setHover] = useState(false);
  const teepees = useLayout();
  const grass = useMemo(() => grassTexture(), []);
  const plain = useMemo(() => makeCanvasTexture(64, 96, (ctx, w, h) => stripes(ctx, w, h)), []);
  const sign = useMemo(
    () => signTexture('JER GAMEFARM', { bg: '#7f1d1d', fg: '#fde68a', w: 1024, h: 200, size: 120 }),
    [],
  );

  const detailed = teepees.filter((t) => t.col < DETAILED_COLS);
  const rest = teepees.filter((t) => t.col >= DETAILED_COLS);

  const restBoxes = useMemo(() => rest.map((t) => [t.x, 0.5, t.z, 1]), [rest]);
  const roosters = useMemo(() => rest.map((t) => [t.x + t.jitter, 0, t.z + 1.5, t.face]), [rest]);
  const bodies = useMemo(() => roosters.map(([x, , z, r]) => [x, 0.3, z, [0.8, 0.75, 1.1], r]), [roosters]);
  const heads = useMemo(
    () => roosters.map(([x, , z, r]) => [x + Math.sin(r) * 0.22, 0.6, z + Math.cos(r) * 0.22, 1, r]),
    [roosters],
  );
  const tails = useMemo(
    () => roosters.map(([x, , z, r]) => [x - Math.sin(r) * 0.24, 0.48, z - Math.cos(r) * 0.24, 1, r]),
    [roosters],
  );
  const shrubs = useMemo(() => {
    const r = rng(23);
    return teepees
      .filter((t) => r() < 0.12 && t.row < ROWS - 1 && Math.abs(t.z + Z_STEP / 2 - AISLE_Z) > 1.2)
      .map((t) => [t.x + (r() - 0.5), 0.45, t.z + Z_STEP / 2 + (r() - 0.5) * 0.8, 0.7 + r() * 0.6, r() * 6]);
  }, [teepees]);
  const restMaterials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ map: plain, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: plain, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: '#7f1d1d' }),
      new THREE.MeshStandardMaterial({ color: '#7f1d1d' }),
      new THREE.MeshStandardMaterial({ color: BLUE, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: RED, roughness: 0.8 }),
    ],
    [plain],
  );

  const xFar = X_FAR;
  const zMin = Z_MIN;
  const zMax = Z_MAX;
  const fencePosts = useMemo(() => {
    const out = [];
    for (let x = X_GATE; x >= xFar; x -= 2) {
      out.push([x, 0.45, zMin, 1]);
      out.push([x, 0.45, zMax, 1]);
    }
    for (let z = zMin; z <= zMax; z += 2) {
      out.push([xFar, 0.45, z, 1]);
      if (Math.abs(z - AISLE_Z) > 2) out.push([X_GATE, 0.45, z, 1]);
    }
    return out;
  }, [xFar, zMin, zMax]);

  const fieldW = X_GATE - xFar;
  const fieldD = zMax - zMin;
  const cx = (X_GATE + xFar) / 2;
  const cz = (zMin + zMax) / 2;

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
      {/* Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.004, cz]} receiveShadow>
        <planeGeometry args={[fieldW, fieldD]} />
        <meshStandardMaterial map={grass} color={hover ? '#f0ffd8' : '#ffffff'} roughness={1} />
      </mesh>
      {/* Main dirt aisle from the gate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx + 2, 0.01, AISLE_Z]} receiveShadow>
        <planeGeometry args={[fieldW + 4, 1.4]} />
        <meshStandardMaterial color="#c8a46a" roughness={1} />
      </mesh>

      {/* Numbered teepees nearest the office */}
      {detailed.map((t) => (
        <NumberedTeepee key={t.n} x={t.x} z={t.z} n={t.n} sides={{ back: plain }} top="#7f1d1d" />
      ))}
      {detailed.map((t, i) => (
        <Chicken
          key={`c${t.n}`}
          position={[t.x + t.jitter, 0, t.z + 1.5]}
          rotation={t.face}
          color={ROOSTER_BODIES[i % ROOSTER_BODIES.length]}
          tail={i % 2 ? '#14532d' : '#111827'}
          phase={i * 0.6}
        />
      ))}

      {/* The rest of the field, instanced */}
      <Scatter items={restBoxes} castShadow material={restMaterials}>
        <boxGeometry args={[0.5, 1, 0.7]} />
      </Scatter>
      <Scatter items={bodies} colors={ROOSTER_BODIES} castShadow>
        <sphereGeometry args={[0.24, 10, 8]} />
        <meshStandardMaterial roughness={0.8} />
      </Scatter>
      <Scatter items={heads} colors={['#dc2626']}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial roughness={0.8} />
      </Scatter>
      <Scatter items={tails} colors={['#14532d', '#111827', '#065f46']}>
        <coneGeometry args={[0.13, 0.34, 6]} />
        <meshStandardMaterial roughness={0.8} />
      </Scatter>

      {/* Young palms between teepees */}
      <Scatter items={shrubs}>
        <coneGeometry args={[0.45, 0.9, 6]} />
        <meshStandardMaterial color="#4d7c2a" roughness={1} flatShading />
      </Scatter>

      {/* Perimeter fence */}
      <Scatter items={fencePosts} castShadow>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
        <meshStandardMaterial color="#f5f5f4" />
      </Scatter>

      {/* Gate facing the office */}
      <group position={[X_GATE, 0, AISLE_Z]} rotation={[0, Math.PI / 2, 0]}>
        {[-2.2, 2.2].map((x) => (
          <mesh key={x} castShadow position={[x, 1.8, 0]}>
            <boxGeometry args={[0.35, 3.6, 0.35]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
        ))}
        <mesh castShadow position={[0, 3.4, 0]}>
          <boxGeometry args={[5.2, 1.0, 0.2]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
        <mesh position={[0, 3.4, 0.11]}>
          <planeGeometry args={[4.9, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
        <mesh position={[0, 3.4, -0.11]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[4.9, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>


      {FARM_PALMS.map((p, i) => (
        <Palm key={i} {...p} />
      ))}

      <Html position={[-34, 4, 0]} center zIndexRange={[20, 0]} portal={labelLayer}>
        <button
          type="button"
          className={`station-label farm-label${hover ? ' is-active' : ''}`}
          onClick={() => select('farm-ledger')}
        >
          JER Gamefarm
        </button>
      </Html>
    </group>
  );
}
