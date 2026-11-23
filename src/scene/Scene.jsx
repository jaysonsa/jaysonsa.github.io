import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Room from './Room.jsx';
import Interior from './Interior.jsx';
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

const SKY = '#bfe3fb';

export default function Scene({ paused }) {
  return (
    <Canvas
      className="scene"
      shadows
      dpr={[1, 2]}
      frameloop={paused ? 'never' : 'always'}
      camera={{ position: [17, 16, 21], fov: 40, near: 0.1, far: 600 }}
    >
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 90, 300]} />
      <hemisphereLight args={['#eaf6ff', '#8aa86b', 1.15]} />
      <directionalLight
        castShadow
        position={[6, 26, 14]}
        intensity={2.1}
        color="#fff3dc"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={20}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-far={80}
        shadow-bias={-0.0006}
      />

      <Outdoor />
      <Interior />

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
        maxDistance={95}
        minPolarAngle={0.3}
        maxPolarAngle={1.35}
      />
      <CameraRig />
    </Canvas>
  );
}
