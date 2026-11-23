import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Station from '../Station.jsx';
import { Chair, Desk, Monitor, Screen } from '../parts.jsx';
import { barsTexture, drawChart, notifTexture } from '../textures.js';

const THRESHOLD = 45;
const GREEN = new THREE.Color('#22c55e');
const RED = new THREE.Color('#ef4444');
const DARK_RED = new THREE.Color('#5b1010');

// Monitoring room: a live (mock) metric chart, an alarm beacon, and a phone that receives the alert.
export default function KpiSentinel() {
  const chart = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 320;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas, ctx: canvas.getContext('2d'), tex };
  }, []);
  const bars = useMemo(() => barsTexture(5), []);
  const bars2 = useMemo(() => barsTexture(11), []);
  const notif = useMemo(() => notifTexture(), []);

  const data = useRef(Array.from({ length: 60 }, (_, i) => 68 + Math.sin(i * 0.45) * 6));
  const last = useRef(-1);
  const alarm = useRef(false);
  const beacon = useRef();
  const light = useRef();
  const popup = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (t - last.current > 0.12) {
      last.current = t;
      const phase = t % 12;
      let v = 68 + Math.sin(t * 1.3) * 6 + (Math.random() - 0.5) * 6;
      if (phase > 7 && phase < 10) v = 30 + Math.random() * 6;
      data.current.push(v);
      data.current.shift();
      alarm.current = data.current[data.current.length - 1] < THRESHOLD;
      drawChart(chart.ctx, chart.canvas.width, chart.canvas.height, data.current, THRESHOLD, alarm.current);
      chart.tex.needsUpdate = true;
    }

    const on = alarm.current;
    const blink = Math.sin(t * 12) > 0;
    if (beacon.current) {
      const c = on ? (blink ? RED : DARK_RED) : GREEN;
      beacon.current.color.copy(c);
      beacon.current.emissive.copy(c);
    }
    if (light.current) {
      light.current.color.copy(on ? RED : GREEN);
      light.current.intensity = on ? (blink ? 6 : 1) : 1.5;
    }
    if (popup.current) {
      const s = THREE.MathUtils.lerp(popup.current.scale.x, on ? 1 : 0.001, 0.15);
      popup.current.scale.setScalar(s);
      popup.current.position.y = 1.35 + Math.sin(t * 3) * 0.03;
    }
  });

  return (
    <Station id="anomaly-alerts" labelY={4.6}>
      {/* Big wall screen (wall face at local z = -2.5) */}
      <mesh position={[0, 3.1, -2.47]}>
        <boxGeometry args={[4.3, 2.2, 0.06]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <Screen texture={chart.tex} w={4.1} h={2.05} position={[0, 3.1, -2.43]} />

      <Desk w={3.6} d={1} position={[0, 0, -1]}>
        <Monitor texture={bars} w={0.9} h={0.55} position={[-1.15, 0, -0.15]} rotation={[0, 0.35, 0]} />
        <Monitor texture={chart.tex} w={1.1} h={0.6} position={[0, 0, -0.2]} />
        <Monitor texture={bars2} w={0.9} h={0.55} position={[1.15, 0, -0.15]} rotation={[0, -0.35, 0]} />

        {/* Alarm beacon */}
        <group position={[1.6, 0, 0.25]}>
          <mesh castShadow position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.08, 16]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <sphereGeometry args={[0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial ref={beacon} color="#22c55e" emissive="#22c55e" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <pointLight ref={light} position={[0, 0.5, 0]} distance={5} intensity={1.5} color="#22c55e" />
        </group>

        {/* Phone that receives the Telegram alert */}
        <group position={[-1.45, 0, 0.25]} rotation={[0, 0.3, 0]}>
          <mesh castShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[0.18, 0.02, 0.34]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh ref={popup} position={[0, 1.35, 0]} scale={0.001}>
            <planeGeometry args={[0.9, 0.35]} />
            <meshBasicMaterial map={notif} toneMapped={false} transparent />
          </mesh>
        </group>
      </Desk>
      <Chair position={[0, 0, 0.05]} color="#ef5b4c" />
    </Station>
  );
}
