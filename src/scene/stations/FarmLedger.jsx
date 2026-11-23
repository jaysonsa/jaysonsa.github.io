import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Station from '../Station.jsx';
import Bot from '../Bot.jsx';
import { Desk, Laptop } from '../parts.jsx';
import { ledgerTexture } from '../textures.js';
import { REDUCED_MOTION } from '../../store.js';

function Chicken({ position, rotation = 0, color = '#b45309', phase = 0 }) {
  const head = useRef();
  useFrame(({ clock }) => {
    if (!head.current || REDUCED_MOTION) return;
    const t = clock.elapsedTime + phase;
    const peck = Math.max(0, Math.sin(t * 1.7)) ** 6;
    head.current.rotation.x = peck * 0.9;
  });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.32, 0]} scale={[0.8, 0.75, 1.1]}>
        <sphereGeometry args={[0.24, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.48, -0.26]} rotation={[-0.6, 0, 0]}>
        <coneGeometry args={[0.13, 0.32, 8]} />
        <meshStandardMaterial color="#14532d" roughness={0.8} />
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

function Fence() {
  const posts = [];
  for (let x = -2.4; x <= 2.41; x += 0.6) posts.push([x, 1.9]);
  for (let z = -1.9; z < 1.9; z += 0.6) posts.push([2.4, z]);
  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.35, z]}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
      ))}
      {[0.25, 0.55].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 1.9]}>
            <boxGeometry args={[4.8, 0.06, 0.04]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
          <mesh position={[2.4, y, 0]}>
            <boxGeometry args={[0.04, 0.06, 3.8]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Personal project corner: a tiny farm with the expense app on a laptop.
export default function FarmLedger() {
  const ledger = useMemo(() => ledgerTexture(), []);
  return (
    <Station id="farm-ledger" labelY={2.8} ring={{ position: [0.6, 0, 0], radius: 3.2 }}>
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <boxGeometry args={[4.9, 0.06, 3.9]} />
        <meshStandardMaterial color="#86b35f" roughness={1} />
      </mesh>
      <Fence />

      {/* Coop */}
      <group position={[-1.4, 0.06, -1.1]}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[1.4, 1, 1.1]} />
          <meshStandardMaterial color="#9a3412" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.12, 0.6, 4]} />
          <meshStandardMaterial color="#44403c" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, 0.35, 0.56]}>
          <planeGeometry args={[0.4, 0.55]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      </group>

      <Chicken position={[0.4, 0.06, 0.3]} rotation={0.8} phase={0} />
      <Chicken position={[1.3, 0.06, -0.7]} rotation={-1.2} color="#7c2d12" phase={1.1} />
      <Chicken position={[-0.5, 0.06, 1.0]} rotation={2.4} color="#e7e5e4" phase={2.3} />

      <Desk w={1.4} d={0.8} position={[3.7, 0, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <Laptop texture={ledger} position={[0, 0, 0]} />
      </Desk>
      <Bot color="#4ade80" position={[3.9, 0, 1.3]} rotation={-0.8} phase={3} />
    </Station>
  );
}
