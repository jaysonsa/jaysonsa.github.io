import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Station, { ACCENT } from '../Station.jsx';
import Bot from '../Bot.jsx';
import { Chair, Desk, Monitor } from '../parts.jsx';
import { bannerTexture, thumbsTexture } from '../textures.js';

const FRAMES = [
  [-2, 3.3],
  [0, 3.3],
  [2, 3.3],
  [-2, 2.0],
  [0, 2.0],
  [2, 2.0],
];

// Gallery wall of banners + storage rack: a central image library.
export default function AssetHub() {
  const banners = useMemo(() => FRAMES.map((_, i) => bannerTexture(i)), []);
  const thumbs = useMemo(() => thumbsTexture(), []);
  const borders = useRef([]);
  const leds = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const lit = Math.floor(t / 1.1) % FRAMES.length;
    borders.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = i === lit ? 1.6 : 0;
    });
    leds.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = Math.sin(t * 6 + i * 1.7) > 0.2 ? 3 : 0.3;
    });
  });

  return (
    <Station id="asset-hub" labelY={4.4}>
      {/* Frames on the back wall (wall face is at local z = -3) */}
      {FRAMES.map(([x, y], i) => (
        <group key={i} position={[x, y, -2.96]}>
          <mesh>
            <boxGeometry args={[1.72, 1.12, 0.05]} />
            <meshStandardMaterial
              ref={(m) => (borders.current[i] = m)}
              color="#1f2937"
              emissive={ACCENT}
              emissiveIntensity={0}
            />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[1.6, 1.0]} />
            <meshBasicMaterial map={banners[i]} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Storage rack with blinking lights */}
      <group position={[-3.4, 0, -1.8]}>
        <mesh castShadow position={[0, 1.05, 0]}>
          <boxGeometry args={[0.9, 2.1, 0.8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[0.2, 0.35 + i * 0.3, 0.41]}>
            <boxGeometry args={[0.3, 0.04, 0.01]} />
            <meshStandardMaterial
              ref={(m) => (leds.current[i] = m)}
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={1}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <Desk w={2.2} d={0.9} position={[0.4, 0, -0.9]}>
        <Monitor texture={thumbs} w={1.15} h={0.7} position={[0, 0, -0.1]} />
      </Desk>
      <Chair position={[0.4, 0, 0.05]} />
      <Bot color="#22d3ee" position={[2.3, 0, 0.6]} rotation={-0.5} phase={0.4} />
    </Station>
  );
}
