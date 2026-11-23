import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Station from '../Station.jsx';
import Person from '../Person.jsx';
import { Chair, Desk, Monitor } from '../parts.jsx';
import { bannerTexture, radarTexture, signTexture, supportTexture } from '../textures.js';

const OURS = [
  [-2.6, 3.2],
  [-1.2, 3.2],
  [-2.6, 2.2],
  [-1.2, 2.2],
];
const THEIRS = [
  [0.4, 3.2],
  [1.8, 3.2],
  [0.4, 2.2],
  [1.8, 2.2],
];

// Radar that scans promotional banners, plus a webhook pipe that delivers term updates to the support desk.
export default function PromoRadar() {
  const radar = useMemo(() => radarTexture(), []);
  const ours = useMemo(() => OURS.map((_, i) => bannerTexture(i * 2, 'OURS')), []);
  const theirs = useMemo(() => THEIRS.map((_, i) => bannerTexture(i * 2 + 1, 'COMPETITOR')), []);
  const headOurs = useMemo(() => signTexture('OUR PROMOS', { bg: '#1f2937', fg: '#fdba74', size: 50 }), []);
  const headTheirs = useMemo(() => signTexture('COMPETITORS', { bg: '#1f2937', fg: '#a5b4fc', size: 50 }), []);
  const support = useMemo(() => supportTexture(), []);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.0, -0.6),
        new THREE.Vector3(0, 3.3, -0.6),
        new THREE.Vector3(1.4, 4.0, 2.2),
        new THREE.Vector3(3.0, 3.4, 4.4),
        new THREE.Vector3(3.0, 1.7, 4.6),
      ]),
    [],
  );

  const sweep = useRef();
  const dish = useRef();
  const packets = useRef([]);
  const blips = useRef([]);
  const csGlow = useRef();
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (sweep.current) sweep.current.rotation.y = -t * 1.4;
    if (dish.current) dish.current.rotation.y = Math.sin(t * 0.5) * 1.2;
    blips.current.forEach((m, i) => {
      if (m) m.emissiveIntensity = (Math.sin(t * 2 + i * 1.6) + 1) * 1.5;
    });
    let arriving = 0;
    packets.current.forEach((m, i) => {
      if (!m) return;
      const u = (t * 0.22 + i / 3) % 1;
      curve.getPointAt(u, tmp);
      m.position.copy(tmp);
      if (u > 0.9) arriving = Math.max(arriving, (u - 0.9) / 0.1);
    });
    if (csGlow.current) csGlow.current.intensity = 0.4 + arriving * 4;
  });

  return (
    <Station id="promo-radar" labelY={5}>
      {/* Banner board on the back wall (wall face at local z = -4) */}
      <mesh position={[-1.9, 3.85, -3.97]}>
        <planeGeometry args={[2.6, 0.32]} />
        <meshBasicMaterial map={headOurs} toneMapped={false} />
      </mesh>
      <mesh position={[1.1, 3.85, -3.97]}>
        <planeGeometry args={[2.6, 0.32]} />
        <meshBasicMaterial map={headTheirs} toneMapped={false} />
      </mesh>
      {[...OURS.map((p, i) => [p, ours[i]]), ...THEIRS.map((p, i) => [p, theirs[i]])].map(([[x, y], tex], i) => (
        <group key={i} position={[x, y, -3.96]}>
          <mesh>
            <boxGeometry args={[1.3, 0.84, 0.04]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[1.22, 0.76]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Radar table */}
      <group position={[0, 0, -0.6]}>
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <cylinderGeometry args={[1.05, 0.9, 0.9, 32]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.905, 0]}>
          <circleGeometry args={[0.98, 48]} />
          <meshBasicMaterial map={radar} toneMapped={false} />
        </mesh>
        <group ref={sweep} position={[0, 0.91, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.96, 32, 0, 0.7]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.35} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
        {[
          [0.4, 0.3],
          [-0.5, 0.2],
          [0.2, -0.6],
          [-0.3, -0.35],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.93, z]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshStandardMaterial
              ref={(m) => (blips.current[i] = m)}
              color={i % 2 ? '#a5b4fc' : '#fdba74'}
              emissive={i % 2 ? '#a5b4fc' : '#fdba74'}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Satellite dish */}
      <group position={[-2.4, 0, 0.6]}>
        <mesh castShadow position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.06, 0.1, 2.2, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} />
        </mesh>
        <group ref={dish} position={[0, 2.25, 0]}>
          <mesh castShadow rotation={[-Math.PI / 2.6, 0, 0]}>
            <sphereGeometry args={[0.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3.2]} />
            <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} metalness={0.2} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Webhook pipe with update packets */}
      <mesh>
        <tubeGeometry args={[curve, 80, 0.08, 10, false]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.28} roughness={0.1} depthWrite={false} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => (packets.current[i] = m)}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
      ))}

      {/* Support desk that receives the updates */}
      <Desk w={1.8} d={0.9} position={[3, 0, 5]}>
        <Monitor texture={support} w={1.0} h={0.62} position={[0, 0, -0.1]} />
      </Desk>
      <pointLight ref={csGlow} position={[3, 2, 5.4]} distance={4} color="#f97316" intensity={0.4} />
      <Chair position={[3, 0, 5.85]} color="#ec6fa8" />
      <Person
        pose="sit"
        position={[3, 0, 5.92]}
        rotation={Math.PI}
        phase={0.9}
        look={{ skin: '#e8b98a', hair: 'bob', hairColor: '#5a3a22', shirt: '#ec6fa8', pants: '#334155', accessory: 'headset' }}
      />
    </Station>
  );
}
