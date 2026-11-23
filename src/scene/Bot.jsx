import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { REDUCED_MOTION } from '../store.js';

// A small robot teammate. It faces +z by default.
export default function Bot({ color = '#f97316', position, rotation = 0, phase = 0 }) {
  const body = useRef();

  useFrame(({ clock }) => {
    if (!body.current || REDUCED_MOTION) return;
    const t = clock.elapsedTime + phase;
    body.current.position.y = 0.12 + Math.sin(t * 2) * 0.07;
    body.current.rotation.y = Math.sin(t * 0.6) * 0.35;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group ref={body} position={[0, 0.12, 0]}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <capsuleGeometry args={[0.3, 0.42, 8, 16]} />
          <meshStandardMaterial color="#eef1f5" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.305, 0.035, 8, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh castShadow position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.28, 24, 16]} />
          <meshStandardMaterial color="#eef1f5" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.22, 0.2]}>
          <boxGeometry args={[0.36, 0.14, 0.12]} />
          <meshStandardMaterial color="#0b0d12" roughness={0.2} />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 1.22, 0.265]}>
            <sphereGeometry args={[0.03, 12, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 1.55, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <sphereGeometry args={[0.04, 12, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
