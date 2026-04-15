import { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF, Html, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AVATAR_URL = "https://models.readyplayer.me/64ad67207604603347c61f2f.glb?morphTargets=Oculus+Visemes";

// --- FALLBACK SPHERE COMPONENT (Phase 2) ---
function FallbackSphere({ isSpeaking }: { isSpeaking: boolean }) {
  const distortValue = isSpeaking ? 0.6 : 0.3;
  const speedValue = isSpeaking ? 5 : 2;
  return (
    <Float speed={speedValue} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1.2, 64, 64]}>
        <MeshDistortMaterial color="#00f2ff" distort={distortValue} speed={speedValue} metalness={1} roughness={0} />
      </Sphere>
    </Float>
  );
}

// --- HUMANOID COMPONENT ---
function HumanoidLayer({ isSpeaking, onError }: { isSpeaking: boolean, onError: () => void }) {
  try {
    const { scene, nodes } = useGLTF(AVATAR_URL);
    
    useFrame((state) => {
      const time = state.clock.getElapsedTime();
      if (scene) scene.position.y = -3 + Math.sin(time) * 0.05;

      const mouthOpen = isSpeaking ? Math.abs(Math.sin(time * 15)) * 0.8 : 0;
      
      Object.values(nodes).forEach((node: any) => {
        if (node.morphTargetInfluences && node.morphTargetDictionary) {
          const jawIndex = node.morphTargetDictionary['jawOpen'];
          if (jawIndex !== undefined) node.morphTargetInfluences[jawIndex] = mouthOpen;
          const aaIndex = node.morphTargetDictionary['viseme_aa'];
          if (aaIndex !== undefined) node.morphTargetInfluences[aaIndex] = mouthOpen * 0.5;
        }
      });
    });

    return <primitive object={scene} scale={3} position={[0, -3, 0]} />;
  } catch (e) {
    onError();
    return null;
  }
}

export function Avatar({ isSpeaking = false }: { isSpeaking?: boolean }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }} onError={() => setHasError(true)}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={1.5} />
        <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={2} />
        
        <Suspense fallback={<Html center className="text-cyan-400 animate-pulse text-xs tracking-widest">Loading 3D Assets...</Html>}>
          {hasError ? (
            <FallbackSphere isSpeaking={isSpeaking} />
          ) : (
            <HumanoidLayer isSpeaking={isSpeaking} onError={() => setHasError(true)} />
          )}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
