import { useState } from 'react';
import { Html } from '@react-three/drei';
import { select, useStore } from '../store.js';
import { entries } from '../content.js';
import { STATIONS } from '../stations.js';
import { labelLayer } from './labelLayer.js';

export const ACCENT = '#f97316';


// Clickable wrapper: hover ring, floating label, and opening the case-study panel.
export default function Station({ id, rotation, labelY = 3.4, ring = { position: [0, 0, 0], radius: 2.2 }, children }) {
  const selected = useStore((s) => s.selected);
  const [hover, setHover] = useState(false);
  const active = hover || selected === id;

  return (
    <group
      position={STATIONS[id].position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 6) return; // ignore clicks that were really a drag
        select(id);
      }}
    >
      {children}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ring.position[0], 0.02, ring.position[2]]} visible={active}>
        <ringGeometry args={[ring.radius - 0.07, ring.radius, 64]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <Html position={[ring.position[0], labelY, ring.position[2]]} center zIndexRange={[20, 0]} portal={labelLayer}>
        <button
          type="button"
          className={`station-label${active ? ' is-active' : ''}`}
          onClick={() => select(id)}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          {entries[id].title}
        </button>
      </Html>
    </group>
  );
}
