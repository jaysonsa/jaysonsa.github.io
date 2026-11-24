import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import Lighting from './Lighting.jsx';
import Effects from './Effects.jsx';
import Room from './Room.jsx';
import Interior from './Interior.jsx';
import Team from './Team.jsx';
import Outdoor from './Outdoor.jsx';
import CameraRig from './CameraRig.jsx';
import AboutDesk from './stations/AboutDesk.jsx';
import AssetHub from './stations/AssetHub.jsx';
import KpiSentinel from './stations/KpiSentinel.jsx';
import PromoRadar from './stations/PromoRadar.jsx';
import CustomerInsights from './stations/CustomerInsights.jsx';
import FarmLedger from './stations/FarmLedger.jsx';
import Whiteboard from './stations/Whiteboard.jsx';
import Door from './stations/Door.jsx';
import { getState, MAX_QUALITY, QUALITY_LOCKED, setState, useStore } from '../store.js';

const LEVELS = ['low', 'medium', 'high'];
const DPR = { low: 1, medium: [1, 1.5], high: [1, 2] };

// Move quality one step up or down, never above what the device started with.
function stepQuality(delta) {
  const max = LEVELS.indexOf(MAX_QUALITY);
  const cur = LEVELS.indexOf(getState().quality);
  const next = LEVELS[Math.max(0, Math.min(max, cur + delta))];
  if (next !== getState().quality) setState({ quality: next });
}

// Tells the loading screen once the first frames have actually been drawn.
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) setState({ ready: true });
  });
  return null;
}

export default function Scene({ paused }) {
  const quality = useStore((s) => s.quality);

  return (
    <Canvas
      className="scene"
      shadows="soft"
      dpr={DPR[quality]}
      frameloop={paused ? 'never' : 'always'}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      // Starts far away; CameraRig glides in to the overview as an intro.
      camera={{ position: [46, 52, 66], fov: 40, near: 0.1, far: 600 }}
    >
      {!QUALITY_LOCKED && (
        <PerformanceMonitor
          bounds={(refresh) => (refresh > 90 ? [50, 90] : [40, 58])}
          flipflops={4}
          onDecline={() => stepQuality(-1)}
          onIncline={() => stepQuality(1)}
          onFallback={() => setState({ quality: 'low' })}
        />
      )}
      <Lighting />

      <Outdoor />
      <Room />
      <Interior />
      <AssetHub />
      <KpiSentinel />
      <PromoRadar />
      <CustomerInsights />
      <FarmLedger />
      <Whiteboard />
      <Door />
      <AboutDesk />
      <Team />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={4}
        maxDistance={95}
        minPolarAngle={0.3}
        maxPolarAngle={1.35}
      />
      <CameraRig />
      <Effects />
      <ReadySignal />
    </Canvas>
  );
}
