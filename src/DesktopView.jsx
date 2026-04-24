import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- THE MECHANICAL SNAP CORE ---
function MechanicalCore({ isActive }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3((Math.random() - 0.5) * 35, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 20);
          const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          temp.push({ targetPos, randomPos, randomRot, index: i++ });
        }
      }
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();
  const currentPositions = useMemo(() => cubeData.map(d => d.randomPos.clone()), [cubeData]);
  const currentRotations = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), [cubeData]);

  const words = useMemo(() => [
    { text: "SHIVANG", phase: Math.random() * 10, offset: [0, 4, 0] },
    { text: "ARCHITECTURE", phase: Math.random() * 10, offset: [5, 2, 2] },
    { text: "MERN STACK", phase: Math.random() * 10, offset: [-5, -2, 2] },
    { text: "FULL-STACK", phase: Math.random() * 10, offset: [2, -4, -2] },
    { text: "SYSTEMS", phase: Math.random() * 10, offset: [-3, 3, -4] }
  ], []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isActive ? 0.25 : 0.05);
    
    cubeData.forEach((data, i) => {
      const targetP = isActive ? data.targetPos : data.randomPos;
      const targetR = isActive ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      currentPositions[i].lerp(targetP, isActive ? 0.08 : 0.015);
      currentRotations[i].slerp(targetR, isActive ? 0.08 : 0.01);
      dummy.position.copy(currentPositions[i]);
      if (!isActive) {
        dummy.position.y += Math.sin(t + i) * 0.005;
        dummy.position.x += Math.cos(t * 0.5 + i) * 0.005;
      }
      dummy.quaternion.copy(currentRotations[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[2.5, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={isActive ? "#002222" : "#020202"} roughness={0.1} metalness={0.9} />
      </instancedMesh>
      {isActive && <pointLight intensity={20} color="#FF8C00" distance={10} />}
      {words.map((w, i) => (
        <FloatingHUDText key={i} text={w.text} isActive={isActive} offset={w.offset} phase={w.phase} />
      ))}
    </group>
  );
}

function FloatingHUDText({ text, isActive, offset, phase }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const driftX = Math.sin(t * 0.4 + phase) * (isActive ? 1.5 : 8);
      const driftY = Math.cos(t * 0.3 + phase) * (isActive ? 1.5 : 8);
      const driftZ = Math.sin(t * 0.2 + phase) * (isActive ? 1 : 5);
      const targetX = isActive ? offset[0] + driftX : driftX * 2;
      const targetY = isActive ? offset[1] + driftY : driftY * 2;
      const targetZ = isActive ? offset[2] + driftZ : driftZ;
      ref.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.03);
      ref.current.lookAt(state.camera.position);
    }
  });
  return (
    <Text ref={ref} fontSize={0.6} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" color="#00E5FF" emissive="#00E5FF" emissiveIntensity={isActive ? 4 : 0.2} transparent opacity={isActive ? 0.9 : 0.25}>
      {text}
    </Text>
  );
}

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-transform duration-500 group-hover:scale-x-100 shadow-[0_0_10px_#00E5FF]" />
  </a>
);

export default function DesktopView() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-[#010102] text-gray-200 antialiased selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
        style={{ background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.04), transparent 85%)` }} />
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={40} />
          <color attach="background" args={['#010102']} />
          <ambientLight intensity={0.5} />
          <Environment preset="night" />
          <MechanicalCore isActive={isHovered} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        <nav className="fixed top-0 w-full z-50 bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-24 flex items-center justify-between px-10">
          <div className="text-2xl font-black tracking-tighter text-white">SHIVANG<span className="text-[#00E5FF]">.</span></div>
          <div className="flex gap-10">
            <NavLink href="#about">Journey</NavLink>
            <NavLink href="#skills">Competencies</NavLink>
            <NavLink href="#projects">Builds</NavLink>
            <NavLink href="#contact">Connect</NavLink>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center relative w-full pt-20" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start max-w-4xl z-40">
            <div className="mb-8 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase">Architecture & Logic</div>
            <h1 className="text-8xl md:text-[9rem] font-black text-white mb-6 tracking-tighter leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l border-white/10 pl-8 leading-relaxed">Designing high-performance full-stack architectures and resilient digital systems.</p>
            <div className="flex gap-6">
              <a href="#projects" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all duration-500">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-500">Resume ↓</a>
            </div>
          </motion.div>
        </section>
        {/* ... Include your other sections (About, Skills, etc.) here ... */}
      </div>
    </div>
  );
}