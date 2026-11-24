import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Person from './Person.jsx';
import { getState, useStore } from '../store.js';
import { commandWalk, isHome, runtime, setControlled, TEAM } from '../team.js';
import { isWalkable } from '../nav.js';
import { steerVector } from '../input.js';

const SPEED = 3.4; // world units per second
const tmp = new THREE.Vector3();
const fwd = new THREE.Vector3();
const right = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function Walker({ m, phase }) {
  const controlled = useStore((s) => s.controlled === m.id);
  const group = useRef();
  const [moving, setMoving] = useState(false);
  const [atHome, setAtHome] = useState(true);

  useFrame(({ camera }, delta) => {
    const r = runtime[m.id];
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const steer = getState().controlled === m.id ? steerVector() : null;
    if (steer?.active) {
      // Direct WASD steering relative to the camera, sliding along obstacles.
      r.path = [];
      camera.getWorldDirection(fwd).setY(0).normalize();
      right.crossVectors(fwd, UP).normalize();
      tmp.copy(fwd).multiplyScalar(steer.y).addScaledVector(right, steer.x).normalize();
      const nx = r.pos.x + tmp.x * SPEED * dt;
      const nz = r.pos.z + tmp.z * SPEED * dt;
      const free = !isWalkable(r.pos.x, r.pos.z); // already inside a seat area: let them step out
      if (free || isWalkable(nx, nz)) r.pos.set(nx, 0, nz);
      else if (isWalkable(nx, r.pos.z)) r.pos.x = nx;
      else if (isWalkable(r.pos.x, nz)) r.pos.z = nz;
      r.heading = lerpAngle(r.heading, Math.atan2(tmp.x, tmp.z), 1 - Math.exp(-dt * 12));
      if (!moving) setMoving(true);
      if (atHome) setAtHome(false);
    } else if (r.path.length) {
      const target = r.path[0];
      tmp.subVectors(target, r.pos).setY(0);
      const dist = tmp.length();
      if (dist < 0.03) {
        r.pos.copy(target);
        r.path.shift();
      } else {
        tmp.normalize();
        r.pos.addScaledVector(tmp, Math.min(dist, SPEED * dt));
        r.heading = lerpAngle(r.heading, Math.atan2(tmp.x, tmp.z), 1 - Math.exp(-dt * 12));
      }
      if (!moving) setMoving(true);
      if (atHome) setAtHome(false);
    } else if (moving) {
      setMoving(false);
      if (isHome(m.id)) {
        r.heading = m.rotation;
        setAtHome(true);
      }
    } else if (atHome) {
      r.heading = lerpAngle(r.heading, m.rotation, 1 - Math.exp(-dt * 8));
    }
    g.position.copy(r.pos);
    g.rotation.y = r.heading;
  });

  const pose = moving ? 'walk' : atHome ? m.pose : 'stand';
  const take = () => setControlled(m.id);

  return (
    <group
      ref={group}
      position={m.home}
      rotation={[0, m.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 6) return;
        take();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      <Person
        name={m.name}
        accent={m.accent}
        pose={pose}
        look={m.look}
        phase={phase}
        controlled={controlled}
        onTagClick={take}
      />
    </group>
  );
}

// Fading ring where the teammate was told to go.
function Marker() {
  const marker = useStore((s) => s.marker);
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    if (!marker) {
      ref.current.visible = false;
      return;
    }
    const age = (Date.now() - marker.t) / 1000;
    ref.current.visible = age < 1.6;
    ref.current.position.set(marker.x, 0.04, marker.z);
    ref.current.scale.setScalar(0.6 + age * 0.6);
    ref.current.material.opacity = Math.max(0, 1 - age / 1.6);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.3, 0.42, 40]} />
      <meshBasicMaterial color="#f97316" transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

export default function Team() {
  return (
    <group>
      {/* Invisible ground that catches "walk here" clicks everywhere */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        onClick={(e) => {
          if (e.delta > 6 || !getState().controlled) return;
          e.stopPropagation();
          commandWalk(e.point);
        }}
      >
        <planeGeometry args={[160, 160]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {TEAM.map((m, i) => (
        <Walker key={m.id} m={m} phase={i * 1.3} />
      ))}
      <Marker />
    </group>
  );
}
