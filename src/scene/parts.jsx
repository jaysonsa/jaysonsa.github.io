// Reusable low-poly furniture.

export function Desk({ w = 2.4, d = 1, h = 0.75, color = '#e7d8c1', legColor = '#3a3f4b', position, rotation, children }) {
  const legs = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, h - 0.03, 0]}>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {legs.map(([sx, sz], i) => (
        <mesh key={i} castShadow position={[sx * (w / 2 - 0.08), (h - 0.06) / 2, sz * (d / 2 - 0.08)]}>
          <boxGeometry args={[0.06, h - 0.06, 0.06]} />
          <meshStandardMaterial color={legColor} />
        </mesh>
      ))}
      <group position={[0, h, 0]}>{children}</group>
    </group>
  );
}

// The sitter faces -z; the backrest is on +z.
export function Chair({ position, rotation, color = '#334155' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.55]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 0.84, 0.25]}>
        <boxGeometry args={[0.52, 0.6, 0.07]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

export function Screen({ texture, w, h, position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// Monitor standing on a surface; the screen faces +z.
export function Monitor({ texture, w = 1.1, h = 0.65, position, rotation }) {
  const cy = 0.36 + h / 2;
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.35, 0.03, 0.22]} />
        <meshStandardMaterial color="#2b2f38" />
      </mesh>
      <mesh castShadow position={[0, 0.2, -0.03]}>
        <boxGeometry args={[0.06, 0.34, 0.04]} />
        <meshStandardMaterial color="#2b2f38" />
      </mesh>
      <mesh castShadow position={[0, cy, -0.02]}>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
        <meshStandardMaterial color="#1b1e25" />
      </mesh>
      <Screen texture={texture} w={w} h={h} position={[0, cy, 0.007]} />
    </group>
  );
}

export function Laptop({ texture, position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[0, 0.012, 0]}>
        <boxGeometry args={[0.5, 0.024, 0.34]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.3} roughness={0.4} />
      </mesh>
      <group position={[0, 0.024, -0.17]} rotation={[-0.25, 0, 0]}>
        <mesh castShadow position={[0, 0.16, -0.008]}>
          <boxGeometry args={[0.5, 0.32, 0.016]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.3} roughness={0.4} />
        </mesh>
        <Screen texture={texture} w={0.46} h={0.28} position={[0, 0.16, 0.001]} />
      </group>
    </group>
  );
}

export function Mug({ position, color = '#f97316' }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.12, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.055, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.028, 0.01, 8, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function Plant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 0.5, 16]} />
        <meshStandardMaterial color="#c2410c" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.45, 16, 12]} />
        <meshStandardMaterial color="#3f8f4f" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.18, 1.22, 0.05]}>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color="#4ea35e" roughness={0.9} />
      </mesh>
    </group>
  );
}
