import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { REDUCED_MOTION, useStore } from '../store.js';
import { HOME, SPOTS, STATIONS } from '../stations.js';

const UP = new THREE.Vector3(0, 1, 0);

// Glides the camera to the selected station, or back to the overview.
export default function CameraRig() {
  const selected = useStore((s) => s.selected);
  const spot = useStore((s) => s.spot);
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const animating = useRef(false);
  const goalPos = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());

  const tall = size.width < size.height;
  const wide = size.width >= 900;

  useEffect(() => {
    // Optional ?view=cx,cy,cz,tx,ty,tz override for the overview (handy for sharing a specific angle).
    const custom = new URLSearchParams(window.location.search).get('view')?.split(',').map(Number);
    const home = custom?.length === 6 && custom.every(Number.isFinite)
      ? { camera: custom.slice(0, 3), target: custom.slice(3) }
      : tall
        ? HOME.tall
        : HOME.wide;
    const focus = selected ? STATIONS[selected].focus : spot ? SPOTS[spot] : home;
    const target = new THREE.Vector3(...focus.target);
    const pos = new THREE.Vector3(...focus.camera);

    // Portrait screens get a wider lens so more of the office fits.
    const fov = tall ? 52 : 40;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    if (selected) {
      const dist = pos.distanceTo(target);
      const dir = target.clone().sub(pos).normalize();
      const right = dir.clone().cross(UP).normalize();
      const screenUp = right.clone().cross(dir).normalize();
      let shift = new THREE.Vector3();
      if (tall) {
        // Bottom sheet covers the lower half: step back and pan so the station sits in the top half.
        pos.sub(target).multiplyScalar(1.35).add(target);
        shift = screenUp.multiplyScalar(-dist * 0.42);
      } else if (wide) {
        // Side panel covers the right: keep the station left of centre.
        pos.sub(target).multiplyScalar(1.12).add(target);
        shift = right.multiplyScalar(dist * 0.24);
      }
      target.add(shift);
      pos.add(shift);
    }

    goalPos.current.copy(pos);
    goalTarget.current.copy(target);
    animating.current = true;

    if (REDUCED_MOTION && controls) {
      camera.position.copy(pos);
      controls.target.copy(target);
      controls.update();
      animating.current = false;
    }
  }, [selected, spot, tall, wide, controls, camera]);

  useEffect(() => {
    if (!controls) return undefined;
    const stop = () => {
      animating.current = false;
    };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame((_, dt) => {
    if (!animating.current || !controls) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3.2);
    camera.position.lerp(goalPos.current, k);
    controls.target.lerp(goalTarget.current, k);
    controls.update();
    if (camera.position.distanceTo(goalPos.current) < 0.02 && controls.target.distanceTo(goalTarget.current) < 0.02) {
      animating.current = false;
    }
  });

  return null;
}
