import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { REDUCED_MOTION, useStore } from '../store.js';

// Day/night lighting rig. Everything blends from one 0..1 "night" value so the
// switch is a smooth dusk instead of a hard cut.

const DAY = {
  sky: new THREE.Color('#bfe3fb'),
  hemiSky: new THREE.Color('#eaf6ff'),
  hemiGround: new THREE.Color('#8aa86b'),
  sun: new THREE.Color('#fff3dc'),
};
const NIGHT = {
  sky: new THREE.Color('#0b1430'),
  hemiSky: new THREE.Color('#5b6b9a'),
  hemiGround: new THREE.Color('#1d2a1f'),
  sun: new THREE.Color('#9db4ff'),
};

// Warm interior lights that switch on after dark (over each work zone and the lounge).
const LAMPS = [
  [-6.6, 3.2, -5.6],
  [0, 3.2, -6],
  [7.5, 3.2, -4],
  [7.2, 3.2, 4.2],
  [1.5, 3.2, 3.5],
  [-6.5, 3.2, 6.5],
  [-9.6, 3.2, 5.2],
];

function useRoomEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
}

export default function Lighting() {
  const night = useStore((s) => s.night);
  const quality = useStore((s) => s.quality);
  const scene = useThree((s) => s.scene);
  useRoomEnvironment();

  const mix = useRef(night ? 1 : 0);
  const hemi = useRef();
  const sun = useRef();
  const lamps = useRef([]);
  const stars = useRef();
  const sunDisc = useRef();
  const moonDisc = useRef();
  const sky = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    scene.background = new THREE.Color();
    scene.fog = new THREE.Fog(new THREE.Color(), 90, 300);
  }, [scene]);

  useFrame((_, dt) => {
    const target = night ? 1 : 0;
    mix.current = REDUCED_MOTION ? target : THREE.MathUtils.damp(mix.current, target, 2.2, dt);
    const m = mix.current;

    sky.lerpColors(DAY.sky, NIGHT.sky, m);
    scene.background.copy(sky);
    scene.fog.color.copy(sky);
    scene.environmentIntensity = THREE.MathUtils.lerp(0.35, 0.05, m);

    if (hemi.current) {
      hemi.current.color.lerpColors(DAY.hemiSky, NIGHT.hemiSky, m);
      hemi.current.groundColor.lerpColors(DAY.hemiGround, NIGHT.hemiGround, m);
      hemi.current.intensity = THREE.MathUtils.lerp(1.0, 0.16, m);
    }
    if (sun.current) {
      sun.current.color.lerpColors(DAY.sun, NIGHT.sun, m);
      sun.current.intensity = THREE.MathUtils.lerp(2.0, 0.28, m);
    }
    lamps.current.forEach((l) => l && (l.intensity = m * 14));
    if (stars.current) stars.current.visible = m > 0.35;
    if (sunDisc.current) sunDisc.current.visible = m < 0.5;
    if (moonDisc.current) moonDisc.current.visible = m >= 0.5;
  });

  const lampCount = quality === 'low' ? 3 : LAMPS.length;

  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={sun}
        castShadow
        position={[6, 26, 14]}
        shadow-mapSize={quality === 'high' ? [2048, 2048] : [1024, 1024]}
        shadow-camera-left={-40}
        shadow-camera-right={20}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-far={80}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      {LAMPS.slice(0, lampCount).map((p, i) => (
        <pointLight key={i} ref={(l) => (lamps.current[i] = l)} position={p} color="#ffd29a" distance={9} decay={1.6} intensity={0} />
      ))}
      <group ref={stars} visible={night}>
        <Stars radius={180} depth={60} count={quality === 'low' ? 1500 : 4000} factor={5} saturation={0} fade speed={0.4} />
      </group>
      <mesh ref={sunDisc} position={[70, 80, -170]}>
        <sphereGeometry args={[8, 24, 16]} />
        <meshBasicMaterial color="#fff6c8" toneMapped={false} />
      </mesh>
      <mesh ref={moonDisc} position={[-60, 70, -160]} visible={false}>
        <sphereGeometry args={[6, 24, 16]} />
        <meshBasicMaterial color={[2.2, 2.2, 2.4]} toneMapped={false} />
      </mesh>
    </>
  );
}
