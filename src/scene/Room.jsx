import { useMemo } from 'react';
import { floorTexture, signTexture } from './textures.js';
import { Plant } from './parts.jsx';

const WALL = '#f4f1ec';
const FRAME = '#2f3542';

// Colour-blocked accent panels behind each work zone (playful tech-office look, no logos).
const PANELS = [
  { x0: -10.4, x1: -3.7, color: '#5b8def' },
  { x0: -2.7, x1: 2.7, color: '#4cb071' },
  { x0: 3.4, x1: 9.4, color: '#f6c445' },
  { x0: 9.6, x1: 11.6, color: '#ef5b4c' },
];

function GlassRun({ z0, z1 }) {
  const len = z1 - z0;
  const mid = (z0 + z1) / 2;
  const count = Math.max(1, Math.round(len / 1.7));
  const mullions = Array.from({ length: count + 1 }, (_, i) => z0 + (len * i) / count);
  return (
    <group position={[-12.05, 0, 0]}>
      <mesh position={[0, 0.14, mid]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.28, len]} />
        <meshStandardMaterial color={FRAME} />
      </mesh>
      <mesh position={[0, 4.85, mid]} castShadow>
        <boxGeometry args={[0.24, 0.3, len]} />
        <meshStandardMaterial color={FRAME} />
      </mesh>
      {mullions.map((z) => (
        <mesh key={z} position={[0, 2.5, z]} castShadow>
          <boxGeometry args={[0.16, 4.5, 0.08]} />
          <meshStandardMaterial color={FRAME} />
        </mesh>
      ))}
      <mesh position={[0, 2.5, mid]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[len, 4.45]} />
        <meshStandardMaterial color="#cfe8ff" transparent opacity={0.16} roughness={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Room() {
  const floor = useMemo(() => floorTexture(), []);
  const logo = useMemo(() => signTexture('VIRTUAL OFFICE', { bg: '#ffffff', fg: '#1f2937', w: 1024, h: 160, size: 84 }), []);

  return (
    <group>
      {/* Building slab (diorama edge) */}
      <mesh position={[0, -0.21, 0]} receiveShadow>
        <boxGeometry args={[24.6, 0.4, 18.6]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24.4, 18.4]} />
        <meshStandardMaterial map={floor} roughness={0.85} />
      </mesh>

      {/* Back wall with colour-blocked panels */}
      <mesh receiveShadow castShadow position={[0, 2.5, -9.1]}>
        <boxGeometry args={[24.4, 5, 0.2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {PANELS.map((p) => (
        <mesh key={p.x0} position={[(p.x0 + p.x1) / 2, 2.2, -8.99]} receiveShadow>
          <boxGeometry args={[p.x1 - p.x0, 4.4, 0.01]} />
          <meshStandardMaterial color={p.color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-3.2, 4.6, -8.97]}>
        <planeGeometry args={[3.2, 0.5]} />
        <meshBasicMaterial map={logo} toneMapped={false} />
      </mesh>

      {/* Left wall: glass with a solid section for the whiteboard */}
      <GlassRun z0={-9.2} z1={-1.9} />
      <GlassRun z0={2.9} z1={9.2} />
      <mesh receiveShadow castShadow position={[-12.1, 2.5, 0.5]}>
        <boxGeometry args={[0.2, 5, 4.8]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.08, -8.98]}>
        <boxGeometry args={[24, 0.16, 0.04]} />
        <meshStandardMaterial color="#9a8a74" />
      </mesh>

      <Plant position={[-3.4, 0, -8.3]} />
      <Plant position={[3.0, 0, -8.3]} scale={0.9} />
      <Plant position={[-11.3, 0, -8.3]} scale={1.1} />
      <Plant position={[-11.3, 0, 3.6]} scale={0.8} />
    </group>
  );
}
