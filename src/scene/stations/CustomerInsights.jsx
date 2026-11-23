import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Station from '../Station.jsx';
import { Desk, Monitor } from '../parts.jsx';
import { directoryTexture, sheetTexture } from '../textures.js';

const BAR_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6', '#f97316'];

// Data room: warehouse racks, live summary bars, a directory screen,
// and spreadsheet reports flying to a phone (scheduled Telegram reports).
export default function CustomerInsights() {
  const table = useMemo(() => directoryTexture(), []);
  const sheet = useMemo(() => sheetTexture(), []);
  const bars = useRef([]);
  const leds = useRef([]);
  const report = useRef();
  const phoneGlow = useRef();

  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.6, 1.3, 0.8),
        new THREE.Vector3(1.2, 2.6, 0.3),
        new THREE.Vector3(2.2, 2.2, -0.4),
        new THREE.Vector3(2.4, 1.45, -0.6),
      ]),
    [],
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    bars.current.forEach((m, i) => {
      if (!m) return;
      const h = 0.35 + (Math.sin(t * 0.9 + i * 1.1) + 1) * 0.45;
      m.scale.y = h;
      m.position.y = 0.32 + h / 2;
    });
    leds.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = Math.sin(t * 5 + i * 2.3) > 0 ? 3 : 0.3;
    });
    const cycle = (t % 4) / 4;
    if (report.current) {
      const visible = cycle < 0.6;
      report.current.visible = visible;
      if (visible) {
        path.getPointAt(cycle / 0.6, tmp);
        report.current.position.copy(tmp);
        report.current.rotation.y = t * 2;
      }
    }
    if (phoneGlow.current) phoneGlow.current.emissiveIntensity = cycle > 0.6 && cycle < 0.8 ? 2.5 : 0.6;
  });

  return (
    <Station id="customer-insights" labelY={3.3} ring={{ position: [0.3, 0, 0], radius: 2.6 }}>
      {/* Warehouse racks */}
      {[-1.9, -1.0].map((x, r) => (
        <group key={x} position={[x, 0, -1.1]}>
          <mesh castShadow position={[0, 1.0, 0]}>
            <boxGeometry args={[0.8, 2, 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, 0.35 + i * 0.32, 0.41]}>
              <boxGeometry args={[0.5, 0.04, 0.01]} />
              <meshStandardMaterial
                ref={(m) => (leds.current[r * 5 + i] = m)}
                color="#38bdf8"
                emissive="#38bdf8"
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Summary bars on a platform */}
      <group position={[0.6, 0, -0.9]}>
        <mesh receiveShadow castShadow position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.9, 1, 0.3, 32]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {BAR_COLORS.map((c, i) => (
          <mesh key={c} ref={(m) => (bars.current[i] = m)} position={[-0.55 + i * 0.22, 0.6, 0]} castShadow>
            <boxGeometry args={[0.16, 1, 0.16]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>

      <Desk w={1.8} d={0.9} position={[0.6, 0, 0.8]}>
        <Monitor texture={table} w={1.1} h={0.68} position={[0, 0, -0.1]} />
      </Desk>

      {/* Phone on a stand that receives the reports */}
      <group position={[2.4, 0, -0.6]}>
        <mesh castShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.14, 1.2, 12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh castShadow position={[0, 1.42, 0]} rotation={[-0.3, -0.5, 0]}>
          <boxGeometry args={[0.32, 0.56, 0.04]} />
          <meshStandardMaterial ref={phoneGlow} color="#0f172a" emissive="#2aabee" emissiveIntensity={0.6} />
        </mesh>
      </group>

      <mesh ref={report}>
        <planeGeometry args={[0.32, 0.4]} />
        <meshBasicMaterial map={sheet} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

    </Station>
  );
}
