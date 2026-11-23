import { useMemo } from 'react';
import Station from '../Station.jsx';
import { Chair, Desk, Laptop, Monitor, Mug, Plant } from '../parts.jsx';
import { codeTexture, signTexture } from '../textures.js';
import { profile } from '../../content.js';

// The owner's own desk: opens the About panel.
export default function AboutDesk() {
  const code = useMemo(() => codeTexture(4), []);
  const code2 = useMemo(() => codeTexture(9), []);
  const plate = useMemo(
    () => signTexture(profile.name || profile.handle, { bg: '#111827', fg: '#fdba74', size: 60 }),
    [],
  );

  return (
    <Station id="about" labelY={2.9} ring={{ position: [0, 0, 0.3], radius: 2.4 }}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.3]}>
        <planeGeometry args={[5, 3.6]} />
        <meshStandardMaterial color="#334a6e" roughness={1} />
      </mesh>
      <Desk w={2.8} d={1.2} color="#d6c2a4">
        <Monitor texture={code} w={1.2} h={0.7} position={[-0.25, 0, -0.25]} />
        <Laptop texture={code2} position={[0.85, 0, 0.05]} rotation={[0, -0.4, 0]} />
        <Mug position={[-1.1, 0, 0.2]} />
        <mesh castShadow position={[-0.25, 0.05, 0.47]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.7, 0.16, 0.02]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[-0.25, 0.055, 0.482]} rotation={[-0.5, 0, 0]}>
          <planeGeometry args={[0.66, 0.13]} />
          <meshBasicMaterial map={plate} toneMapped={false} />
        </mesh>
      </Desk>
      <Chair position={[-0.25, 0, 0.95]} color="#f97316" />
      <Plant position={[1.9, 0, -0.5]} scale={0.8} />
    </Station>
  );
}
