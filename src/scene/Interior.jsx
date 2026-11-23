import { Plant } from './parts.jsx';

// Shared amenities that give the office a relaxed, playful tech-campus feel.

function BeanBag({ position, color, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]} scale={[1, 0.62, 1]}>
        <sphereGeometry args={[0.55, 20, 14]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 0.48, -0.25]} scale={[0.9, 0.7, 0.5]}>
        <sphereGeometry args={[0.45, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

function Lounge() {
  return (
    <group position={[-4.6, 0, 6.8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[2.3, 48]} />
        <meshStandardMaterial color="#f6c445" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} receiveShadow>
        <ringGeometry args={[1.6, 1.8, 48]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      <BeanBag position={[-1.2, 0, -0.6]} color="#5b8def" rotation={0.9} />
      <BeanBag position={[1.2, 0, -0.7]} color="#ef5b4c" rotation={-0.9} />
      <BeanBag position={[-1.1, 0, 0.9]} color="#4cb071" rotation={2.4} />
      <BeanBag position={[1.1, 0, 1.0]} color="#9b6bdf" rotation={-2.4} />
      <mesh castShadow position={[0, 0.2, 0.1]}>
        <cylinderGeometry args={[0.5, 0.45, 0.4, 24]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh castShadow position={[0.12, 0.46, 0.1]}>
        <cylinderGeometry args={[0.06, 0.05, 0.12, 12]} />
        <meshStandardMaterial color="#ef5b4c" />
      </mesh>
    </group>
  );
}

function PingPong() {
  return (
    <group position={[3, 0, 7.5]}>
      <mesh castShadow receiveShadow position={[0, 0.76, 0]}>
        <boxGeometry args={[2.74, 0.05, 1.52]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
      <mesh position={[0, 0.79, 0]}>
        <boxGeometry args={[2.74, 0.006, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[0.02, 0.15, 1.6]} />
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.8} />
      </mesh>
      {[
        [-1.2, -0.6],
        [1.2, -0.6],
        [-1.2, 0.6],
        [1.2, 0.6],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.37, z]} castShadow>
          <boxGeometry args={[0.06, 0.74, 0.06]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
      {[
        [-0.9, 0.3, '#ef4444'],
        [0.8, -0.35, '#111827'],
      ].map(([x, z, c]) => (
        <group key={c} position={[x, 0.8, z]} rotation={[0, 0.6, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.09, 16]} />
            <meshStandardMaterial color={c} side={2} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.3, 0.82, 0.2]}>
        <sphereGeometry args={[0.025, 10, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function SofaNook() {
  return (
    <group position={[10.3, 0, 7.6]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.6]} receiveShadow>
        <planeGeometry args={[3.4, 2.4]} />
        <meshStandardMaterial color="#ef5b4c" roughness={1} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[2.4, 0.4, 0.85]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh castShadow position={[0, 0.65, -0.35]}>
        <boxGeometry args={[2.4, 0.6, 0.18]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} castShadow position={[x, 0.45, 0]}>
          <boxGeometry args={[0.18, 0.5, 0.85]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      {[
        [-0.6, '#f6c445'],
        [0.6, '#5b8def'],
      ].map(([x, c]) => (
        <mesh key={x} castShadow position={[x, 0.62, -0.18]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.45, 0.4, 0.12]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.22, 1.1]}>
        <cylinderGeometry args={[0.45, 0.45, 0.06, 24]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.1, 1.1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function MicroKitchen() {
  return (
    <group position={[-9.2, 0, 8.3]}>
      <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[3, 0.9, 0.7]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <boxGeometry args={[3.05, 0.05, 0.75]} />
        <meshStandardMaterial color="#4cb071" />
      </mesh>
      <mesh castShadow position={[-0.9, 1.15, -0.05]}>
        <boxGeometry args={[0.4, 0.42, 0.35]} />
        <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.4, 1.0, 0]}>
        <cylinderGeometry args={[0.22, 0.15, 0.12, 20]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      {[
        [0.33, '#f97316'],
        [0.45, '#facc15'],
        [0.4, '#ef4444'],
      ].map(([x, c], i) => (
        <mesh key={c} position={[x + (i - 1) * 0.06, 1.1, (i - 1) * 0.07]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
      {[0.95, 1.1, 1.25].map((x, i) => (
        <mesh key={x} position={[x, 1.0, 0.1]}>
          <cylinderGeometry args={[0.04, 0.035, 0.1, 10]} />
          <meshStandardMaterial color={['#5b8def', '#ef5b4c', '#f6c445'][i]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Interior() {
  return (
    <group>
      <Lounge />
      <PingPong />
      <SofaNook />
      <MicroKitchen />
      <Plant position={[-1.6, 0, 8.4]} scale={1.1} />
      <Plant position={[6.0, 0, 8.4]} />
      <Plant position={[11.4, 0, 4.6]} scale={0.9} />
    </group>
  );
}
