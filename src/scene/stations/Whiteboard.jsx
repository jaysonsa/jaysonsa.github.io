import { useMemo } from 'react';
import Station from '../Station.jsx';
import Bot from '../Bot.jsx';
import { whiteboardTexture } from '../textures.js';
import { entries } from '../../content.js';

// Skills whiteboard on the left wall. Local +z points into the room.
export default function Whiteboard() {
  const board = useMemo(() => whiteboardTexture(entries.skills.groups), []);
  return (
    <Station id="skills" rotation={[0, Math.PI / 2, 0]} labelY={4.1} ring={{ position: [0, 0, 1.3], radius: 1.8 }}>
      <mesh castShadow position={[0, 2.3, 0.14]}>
        <boxGeometry args={[4.4, 2.6, 0.06]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.3, 0.175]}>
        <planeGeometry args={[4.2, 2.45]} />
        <meshBasicMaterial map={board} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.0, 0.25]}>
        <boxGeometry args={[2.2, 0.05, 0.14]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      {['#ef4444', '#2563eb', '#16a34a'].map((c, i) => (
        <mesh key={c} position={[-0.6 + i * 0.25, 1.05, 0.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
      <Bot color="#facc15" position={[2.7, 0, 1.1]} rotation={-0.6} phase={1.7} />
    </Station>
  );
}
