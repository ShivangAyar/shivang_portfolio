import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

function MechanicalCore() {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;

  const cubeData = useMemo(() => {
    const temp = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 20);
          const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          temp.push({ targetPos, randomPos, randomRot });
        }
      }
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();
  const currentPositions = useMemo(() => cubeData.map(d => d.targetPos.clone()), [cubeData]);

  const words = useMemo(() => [
    { text: "SHIVANG", phase: Math.random() * 10, offset: [0, 4, 0] },
    { text: "MERN", phase: Math.random() * 10, offset: [3, 2, 2] },
    { text: "SYSTEMS", phase: Math.random() * 10, offset: [-3, -2, 2] }
  ], []);

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.25;
    cubeData.forEach((data, i) => {
      dummy.position.copy(currentPositions[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#002222" roughness={0.1} metalness={0.9} />
      </instancedMesh>
      <pointLight intensity={20} color="#FF8C00" distance={10} />
      {words.map((w, i) => (
        <FloatingHUDText key={i} text={w.text} offset={w.offset} phase={w.phase} />
      ))}
    </group>
  );
}

function FloatingHUDText({ text, offset, phase }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const driftX = Math.sin(t * 0.4 + phase) * 1.5;
      const driftY = Math.cos(t * 0.3 + phase) * 1.5;
      ref.current.position.set(offset[0] + driftX, offset[1] + driftY, offset[2]);
      ref.current.lookAt(state.camera.position);
    }
  });
  return (
    <Text ref={ref} fontSize={0.4} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" color="#00E5FF" emissive="#00E5FF" emissiveIntensity={4} transparent opacity={0.9}>
      {text}
    </Text>
  );
}

export default function MobileView() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="bg-[#010102] text-gray-200 antialiased font-sans scroll-smooth relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={55} />
          <ambientLight intensity={0.5} />
          <Environment preset="night" />
          <MechanicalCore />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        <nav className="fixed top-0 w-full z-50 bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-6">
          <div className="text-xl font-black text-white">SHIVANG<span className="text-[#00E5FF]">.</span></div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 p-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="fixed inset-0 z-40 bg-[#010102] flex flex-col items-center justify-center gap-10">
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase">Journey</a>
              <a href="#projects" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase">Builds</a>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="px-6 min-h-screen flex items-center relative w-full pt-20">
          <div className="flex flex-col items-start z-40">
            <h1 className="text-6xl font-black text-white mb-6 leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg text-gray-400 mt-6 mb-12 border-l border-white/10 pl-6 leading-relaxed">Designing architectures and digital systems.</p>
            <div className="flex flex-col gap-6 w-full">
              <a href="#projects" className="bg-white text-black px-12 py-5 text-[10px] font-black uppercase text-center">Execute Builds</a>
              <a href="/resume.pdf" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black uppercase text-center">Resume ↓</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}