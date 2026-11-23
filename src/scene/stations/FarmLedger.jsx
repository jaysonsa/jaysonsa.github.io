import { useMemo } from 'react';
import Station from '../Station.jsx';
import { Chair, Desk, Laptop, Mug, Plant } from '../parts.jsx';
import { ledgerTexture } from '../textures.js';

// BeeOne's desk beside the glass wall, looking out at the farm.
// Local +x points into the room; the window (and the farm) is toward -x.
export default function FarmLedger() {
  const ledger = useMemo(() => ledgerTexture(), []);
  return (
    <Station id="farm-ledger" labelY={2.9} ring={{ position: [0.4, 0, 0], radius: 1.9 }}>
      <Desk w={1.6} d={0.8} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="#d6c2a4">
        <Laptop texture={ledger} position={[0, 0, 0.05]} />
        <Mug position={[0.55, 0, 0.15]} color="#9b6bdf" />
        {/* Small notebook */}
        <mesh castShadow position={[-0.5, 0.012, 0.1]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.22, 0.024, 0.3]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      </Desk>
      <Chair position={[0.9, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="#9b6bdf" />
      <Plant position={[0, 0, -1.3]} scale={0.7} />
    </Station>
  );
}
