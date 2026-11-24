import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from '@react-three/postprocessing';
import { useStore } from '../store.js';

// Post-processing scaled to the device:
// high   = ambient occlusion + bloom + SMAA anti-aliasing + vignette
// medium = bloom + SMAA + vignette
// low    = vignette only
// The composer stays mounted across quality changes; unmounting it mid-session
// can leave the renderer without an active render loop.
export default function Effects() {
  const quality = useStore((s) => s.quality);
  const high = quality === 'high';
  const low = quality === 'low';
  return (
    <EffectComposer multisampling={low ? 2 : 0}>
      {high ? <N8AO aoRadius={1.4} distanceFalloff={1.2} intensity={2.2} halfRes /> : <></>}
      {!low ? <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.7} /> : <></>}
      {!low ? <SMAA /> : <></>}
      <Vignette offset={0.32} darkness={0.38} />
    </EffectComposer>
  );
}
