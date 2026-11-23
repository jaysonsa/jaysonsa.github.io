import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { REDUCED_MOTION, select } from '../store.js';
import { labelLayer } from './labelLayer.js';

// Stylised low-poly person built from primitives. Faces +z by default.
// Poses: 'stand', 'sit' (typing at a desk), 'point' (presenting), 'gesture' (explaining).

const HEAD_R = 0.17;

function Limb({ radius, length, color, y }) {
  return (
    <mesh castShadow position={[0, y, 0]}>
      <capsuleGeometry args={[radius, length, 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Hair({ style, color }) {
  const mat = <meshStandardMaterial color={color} roughness={0.9} />;
  const cap = (thetaLength = Math.PI * 0.55, tilt = -0.35) => (
    <mesh castShadow rotation={[tilt, 0, 0]}>
      <sphereGeometry args={[HEAD_R * 1.07, 20, 12, 0, Math.PI * 2, 0, thetaLength]} />
      {mat}
    </mesh>
  );
  switch (style) {
    case 'spiky':
      return (
        <group>
          {cap()}
          {[
            [0, 0.17, 0.02, 0],
            [0.08, 0.15, -0.02, -0.4],
            [-0.08, 0.15, -0.02, 0.4],
            [0.04, 0.14, 0.09, -0.2],
            [-0.05, 0.14, 0.08, 0.2],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[0.2, 0, r]}>
              <coneGeometry args={[0.045, 0.12, 6]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    case 'long':
      return (
        <group>
          {cap(Math.PI * 0.6)}
          <mesh castShadow position={[0, -0.12, -0.08]}>
            <boxGeometry args={[0.34, 0.36, 0.14]} />
            {mat}
          </mesh>
        </group>
      );
    case 'bob':
      return (
        <group>
          {cap(Math.PI * 0.68, -0.2)}
          <mesh castShadow position={[0, -0.05, -0.06]}>
            <boxGeometry args={[0.37, 0.16, 0.24]} />
            {mat}
          </mesh>
        </group>
      );
    case 'curly':
      return (
        <group>
          {cap(Math.PI * 0.5)}
          {[
            [0, 0.16, 0],
            [0.1, 0.13, 0.04],
            [-0.1, 0.13, 0.04],
            [0.12, 0.08, -0.07],
            [-0.12, 0.08, -0.07],
            [0, 0.12, -0.11],
            [0.06, 0.15, 0.09],
            [-0.06, 0.15, 0.09],
            [0, 0.03, -0.15],
          ].map(([x, y, z], i) => (
            <mesh key={i} castShadow position={[x, y, z]}>
              <sphereGeometry args={[0.065, 10, 8]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    case 'bun':
      return (
        <group>
          {cap()}
          <mesh castShadow position={[0, 0.17, -0.1]}>
            <sphereGeometry args={[0.075, 12, 10]} />
            {mat}
          </mesh>
        </group>
      );
    default:
      return cap();
  }
}

function Accessory({ type }) {
  if (type === 'glasses') {
    return (
      <group position={[0, 0.02, HEAD_R * 0.93]}>
        {[-0.065, 0.065].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <torusGeometry args={[0.042, 0.009, 6, 16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}
        <mesh>
          <boxGeometry args={[0.04, 0.008, 0.008]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    );
  }
  if (type === 'headphones' || type === 'headset') {
    return (
      <group>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[HEAD_R * 1.12, 0.018, 6, 24, Math.PI]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * HEAD_R * 1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.055, 0.05, 14]} />
            <meshStandardMaterial color={type === 'headset' ? '#ec4899' : '#ef4444'} />
          </mesh>
        ))}
        {type === 'headset' && (
          <mesh position={[0.12, -0.09, 0.09]} rotation={[0.4, 0.6, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        )}
      </group>
    );
  }
  if (type === 'hat') {
    return (
      <group position={[0, 0.1, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.33, 0.33, 0.02, 24]} />
          <meshStandardMaterial color="#e9c46a" roughness={1} />
        </mesh>
        <mesh castShadow position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.13, 20]} />
          <meshStandardMaterial color="#e9c46a" roughness={1} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.182, 0.182, 0.035, 20]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      </group>
    );
  }
  return null;
}

export default function Person({
  name,
  station,
  accent = '#f97316',
  pose = 'stand',
  look = {},
  position,
  rotation = 0,
  phase = 0,
}) {
  const {
    skin = '#e0ac69',
    hair = 'short',
    hairColor = '#2b1a10',
    shirt = '#3b82f6',
    pants = '#1f2937',
    shoes = '#f8fafc',
    accessory,
  } = look;

  const sitting = pose === 'sit';
  const hipY = sitting ? 0.52 : 0.9;
  const shoulderY = hipY + 0.5;
  const headY = hipY + 0.8;

  const torso = useRef();
  const head = useRef();
  const armL = useRef();
  const armR = useRef();
  const elbowL = useRef();
  const elbowR = useRef();
  const body = useRef();

  useFrame(({ clock }) => {
    if (REDUCED_MOTION) return;
    const t = clock.elapsedTime + phase;
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 2) * 0.012;
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.45) * (sitting ? 0.15 : 0.35);
      head.current.rotation.x = sitting ? 0.18 + Math.sin(t * 0.7) * 0.04 : Math.sin(t * 0.6) * 0.05;
    }
    if (pose === 'sit') {
      if (elbowL.current) elbowL.current.rotation.x = -1.25 + Math.max(0, Math.sin(t * 14)) * 0.12;
      if (elbowR.current) elbowR.current.rotation.x = -1.25 + Math.max(0, Math.sin(t * 14 + 1.6)) * 0.12;
    } else if (pose === 'point') {
      if (armR.current) armR.current.rotation.x = -1.25 + Math.sin(t * 1.2) * 0.08;
      if (armL.current) armL.current.rotation.x = Math.sin(t * 1.1) * 0.05;
    } else if (pose === 'gesture') {
      if (elbowL.current) elbowL.current.rotation.x = -1.0 + Math.sin(t * 2.1) * 0.25;
      if (elbowR.current) elbowR.current.rotation.x = -1.0 + Math.sin(t * 2.1 + 2) * 0.25;
      if (body.current) body.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    } else {
      if (armL.current) armL.current.rotation.x = Math.sin(t * 1.3) * 0.06;
      if (armR.current) armR.current.rotation.x = -Math.sin(t * 1.3) * 0.06;
      if (body.current) body.current.position.x = Math.sin(t * 0.8) * 0.015;
    }
  });

  // Initial joint angles per pose.
  const arm = {
    sit: { sx: -0.35, sz: 0.12, ex: -1.25 },
    point: { sx: 0, sz: 0.08, ex: -0.1 },
    gesture: { sx: -0.2, sz: 0.15, ex: -1.0 },
    stand: { sx: 0, sz: 0.08, ex: -0.15 },
  }[pose];
  const right = pose === 'point' ? { sx: -1.25, sz: -0.25, ex: -0.15 } : { ...arm, sz: -arm.sz };

  const leg = (side) => (
    <group position={[side * 0.1, hipY, 0]} rotation={[sitting ? -Math.PI / 2 : 0, 0, 0]}>
      <Limb radius={0.075} length={0.28} color={pants} y={-0.21} />
      <group position={[0, -0.42, 0]} rotation={[sitting ? Math.PI / 2 : 0, 0, 0]}>
        <Limb radius={0.068} length={0.28} color={pants} y={-0.21} />
        <mesh castShadow position={[0, -0.44, 0.05]}>
          <boxGeometry args={[0.13, 0.08, 0.26]} />
          <meshStandardMaterial color={shoes} />
        </mesh>
      </group>
    </group>
  );

  const armGroup = (side, ref, elbowRef, a) => (
    <group ref={ref} position={[side * 0.25, shoulderY, 0]} rotation={[a.sx, 0, a.sz]}>
      <Limb radius={0.062} length={0.16} color={shirt} y={-0.14} />
      <group ref={elbowRef} position={[0, -0.27, 0]} rotation={[a.ex, 0, 0]}>
        <Limb radius={0.055} length={0.15} color={skin} y={-0.13} />
        <mesh castShadow position={[0, -0.28, 0]}>
          <sphereGeometry args={[0.058, 12, 10]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <group ref={body}>
        {leg(-1)}
        {leg(1)}
        <mesh castShadow position={[0, hipY + 0.02, 0]}>
          <boxGeometry args={[0.38, 0.16, 0.26]} />
          <meshStandardMaterial color={pants} roughness={0.8} />
        </mesh>
        <group ref={torso} position={[0, hipY + 0.06, 0]}>
          <mesh castShadow position={[0, 0.25, 0]} scale={[1.15, 1, 0.72]}>
            <capsuleGeometry args={[0.2, 0.2, 8, 16]} />
            <meshStandardMaterial color={shirt} roughness={0.75} />
          </mesh>
        </group>
        {armGroup(-1, armL, elbowL, arm)}
        {armGroup(1, armR, elbowR, right)}
        <mesh position={[0, shoulderY + 0.08, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.1, 10]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <group ref={head} position={[0, headY, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[HEAD_R, 24, 18]} />
            <meshStandardMaterial color={skin} roughness={0.65} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * HEAD_R * 0.98, -0.01, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color={skin} />
            </mesh>
          ))}
          {[-0.062, 0.062].map((x) => (
            <mesh key={x} position={[x, 0.02, HEAD_R * 0.9]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          ))}
          <mesh position={[0, -0.06, HEAD_R * 0.9]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.035, 0.008, 6, 12, Math.PI]} />
            <meshStandardMaterial color="#7f1d1d" />
          </mesh>
          <Hair style={hair} color={hairColor} />
          <Accessory type={accessory} />
        </group>
      </group>

      {name && (
        <Html position={[0, headY + 0.5, 0]} center zIndexRange={[19, 0]} portal={labelLayer}>
          <button
            type="button"
            className="name-tag"
            style={{ '--tag': accent }}
            onClick={() => station && select(station)}
          >
            {name}
          </button>
        </Html>
      )}
    </group>
  );
}
