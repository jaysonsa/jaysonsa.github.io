import { useMemo } from 'react';
import { floorTexture, signTexture } from './textures.js';
import { Plant } from './parts.jsx';

const WALL = '#ece6dc';

export default function Room() {
  const floor = useMemo(() => floorTexture(), []);
  const logo = useMemo(() => signTexture('VIRTUAL OFFICE', { bg: '#1f2937', fg: '#fdba74', w: 1024, h: 160, size: 84 }), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial map={floor} roughness={0.85} />
      </mesh>

      {/* Back and left walls only, so the room stays open toward the camera */}
      <mesh receiveShadow position={[0, 2.5, -9.1]}>
        <boxGeometry args={[24.4, 5, 0.2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[-12.1, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 18.2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>

      {/* Baseboards */}
      <mesh position={[0, 0.08, -8.98]}>
        <boxGeometry args={[24, 0.16, 0.04]} />
        <meshStandardMaterial color="#9a8a74" />
      </mesh>
      <mesh position={[-11.98, 0.08, 0]}>
        <boxGeometry args={[0.04, 0.16, 18]} />
        <meshStandardMaterial color="#9a8a74" />
      </mesh>

      {/* Window above the farm corner */}
      <group position={[-11.99, 3, 5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[3.8, 1.8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[3.6, 1.6]} />
          <meshBasicMaterial color="#bfe3ff" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.06, 1.6]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Sign on the back wall */}
      <mesh position={[-3.5, 4.35, -8.99]}>
        <planeGeometry args={[3.2, 0.5]} />
        <meshBasicMaterial map={logo} toneMapped={false} />
      </mesh>

      <Plant position={[-3.6, 0, -8.3]} />
      <Plant position={[3.6, 0, -8.3]} scale={0.9} />
      <Plant position={[-11.2, 0, -8.2]} scale={1.1} />
      <Plant position={[-11.2, 0, 8.2]} scale={0.8} />
    </group>
  );
}
