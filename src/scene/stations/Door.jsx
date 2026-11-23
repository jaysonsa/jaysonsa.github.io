import { useMemo } from 'react';
import Station from '../Station.jsx';
import { signTexture } from '../textures.js';

// Exit door on the back wall: opens the Contact panel.
export default function Door() {
  const sign = useMemo(() => signTexture('CONTACT', { bg: '#14532d', fg: '#bbf7d0', size: 64 }), []);
  return (
    <Station id="contact" labelY={3.6} ring={{ position: [0, 0, 1], radius: 1.3 }}>
      <mesh castShadow position={[0, 1.2, 0.05]}>
        <boxGeometry args={[1.6, 2.5, 0.1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 1.15, 0.11]}>
        <boxGeometry args={[1.36, 2.3, 0.04]} />
        <meshStandardMaterial color="#8a5a3c" roughness={0.7} />
      </mesh>
      <mesh position={[0.5, 1.1, 0.15]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 2.75, 0.06]}>
        <planeGeometry args={[1.1, 0.3]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.7, 0.6]} distance={3} intensity={1.2} color="#4ade80" />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.7]}>
        <planeGeometry args={[1.4, 0.8]} />
        <meshStandardMaterial color="#57534e" roughness={1} />
      </mesh>
    </Station>
  );
}
