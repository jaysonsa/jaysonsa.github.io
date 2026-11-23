import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Room from './Room.jsx';
import CameraRig from './CameraRig.jsx';
import AboutDesk from './stations/AboutDesk.jsx';
import AssetHub from './stations/AssetHub.jsx';
import KpiSentinel from './stations/KpiSentinel.jsx';
import PromoRadar from './stations/PromoRadar.jsx';
import CustomerInsights from './stations/CustomerInsights.jsx';
import FarmLedger from './stations/FarmLedger.jsx';
import Whiteboard from './stations/Whiteboard.jsx';
import Door from './stations/Door.jsx';

const BG = '#151922';

export default function Scene({ paused }) {
  return (
    <Canvas
      className="scene"
      shadows
      dpr={[1, 2]}
      frameloop={paused ? 'never' : 'always'}
      camera={{ position: [15, 13, 17], fov: 40, near: 0.1, far: 200 }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 38, 75]} />
      <hemisphereLight args={['#fff4e6', '#3a3f4b', 1.1]} />
      <directionalLight
        castShadow
        position={[8, 16, 8]}
        intensity={1.8}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0005}
      />

      <Room />
      <AssetHub />
      <KpiSentinel />
      <PromoRadar />
      <CustomerInsights />
      <FarmLedger />
      <Whiteboard />
      <Door />
      <AboutDesk />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minDistance={4}
        maxDistance={60}
        minPolarAngle={0.3}
        maxPolarAngle={1.35}
      />
      <CameraRig />
    </Canvas>
  );
}
