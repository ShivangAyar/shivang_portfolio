import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';

// --- SLOWER HACKER LOADING SCREEN ---
const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 2) + 1; 
        if (next >= 89) setStatus("89% ALLOWING ACCESS...");
        else if (next >= 54) setStatus("54% VERIFIED USER");
        else if (next >= 33) setStatus("33% SCANNING IF YOU ARE HUMAN...");
        return next > 100 ? 100 : next;
      });
    }, 180);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0, filter: "blur(20px)" }} 
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[1000] bg-[#010102] flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-full max-w-xs space-y-12">
        <div className="space-y-4">
          <h2 className="text-[#00E5FF] font-mono text-[10px] tracking-[0.5em] animate-pulse uppercase">Security Protocol Active</h2>
          <div className="h-[1.5px] w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
        <p className="text-white font-black text-xs tracking-[0.2em] uppercase h-10 flex items-center justify-center leading-relaxed">{status}</p>
      </div>
    </motion.div>
  );
};

// --- MOBILE REACTOR CORE WITH FLOATING HUD ---
function MechanicalCore({ scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const isAssembled = scrollY < 150; 

  const cubeData = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 64; i++) {
      const targetPos = new THREE.Vector3((i%4)-1.5, (Math.floor(i/4)%4)-1.5, (Math.floor(i/16)%4)-1.5).multiplyScalar(1.05);
      const randomPos = new THREE.Vector3((Math.random()-0.5)*30, (Math.random()-0.5)*30, (Math.random()-0.5)*20);
      const randomRot = new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      temp.push({ targetPos, randomPos, randomRot });
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();
  const cP = useMemo(() => cubeData.map(d => d.randomPos.clone()), []);
  const cR = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), []);

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * (isAssembled ? 0.3 : 0.05);
    cubeData.forEach((data, i) => {
      const tP = isAssembled ? data.targetPos : data.randomPos;
      const tR = isAssembled ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      cP[i].lerp(tP, isAssembled ? 0.12 : 0.01);
      cR[i].slerp(tR, isAssembled ? 0.12 : 0.01);
      dummy.position.copy(cP[i]);
      if (!isAssembled) dummy.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
      dummy.quaternion.copy(cR[i]);
      dummy.scale.setScalar(isAssembled ? 1 : 0.65);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, 64]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={isAssembled ? "#00E5FF" : "#020202"} metalness={1} roughness={0.1} emissive={isAssembled ? "#00E5FF" : "#000"} emissiveIntensity={0.5} />
      </instancedMesh>
      {isAssembled && <pointLight intensity={15} color="#FF8C00" distance={12} />}
      {["SHIVANG", "ARCHITECTURE", "LOGIC", "SYSTEMS"].map((t, i) => (
        <HUDLabel key={t} text={t} offset={[[0, 5, 0], [7, 0, 0], [-7, -2, 0], [0, -5, 0]][i]} isAssembled={isAssembled} p={i * 0.5} />
      ))}
    </group>
  );
}

function HUDLabel({ text, offset, isAssembled, p }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const dX = Math.sin(t * 0.2 + p) * (isAssembled ? 0.5 : 20);
      const dY = Math.cos(t * 0.2 + p) * (isAssembled ? 0.5 : 15);
      ref.current.position.lerp(new THREE.Vector3(offset[0] + dX, offset[1] + dY, isAssembled ? 0 : -10), 0.03);
      ref.current.lookAt(state.camera.position);
    }
  });
  return <Text ref={ref} fontSize={0.5} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" color="#00E5FF" emissive="#00E5FF" emissiveIntensity={isAssembled ? 5 : 0.1} transparent opacity={isAssembled ? 1 : 0.15}>{text}</Text>;
}

// --- SEQUENTIAL REACTIVE BARS (DESKTOP EFFECT) ---
const CompCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  const active = useInView(ref, { amount: 0.4, once: true });
  return (
    <div ref={ref} className="bg-[#050507]/60 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col h-[420px]">
      <div className="flex justify-between items-center mb-10 text-white"><h3 className="text-xl font-black uppercase tracking-widest">{title}</h3><span className="text-3xl">{icon}</span></div>
      <div className="space-y-10 mt-auto">
        {skills.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase mb-3 transition-colors" style={{ color: active ? 'white' : '' }}><span>{s.n}</span><span style={{ color: active ? '#00E5FF' : '' }}>{s.v}</span></div>
            <div className="flex gap-2 h-[5px] overflow-hidden bg-white/2 rounded-full">
              {[...Array(12)].map((_, idx) => (
                <motion.div key={idx} initial={{ backgroundColor: "#14141B" }} animate={active ? { backgroundColor: idx * (100/12) < parseInt(s.v) ? "#00E5FF" : "#14141B" } : {}} transition={{ delay: active ? (i * 0.1 + idx * 0.04) : 0 }} className="flex-1 rounded-sm" style={{ backgroundImage: active && idx * (100/12) < parseInt(s.v) ? 'linear-gradient(to right, #00E5FF, #FF8C00)' : 'none' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MobileView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#010102] text-gray-200 overflow-x-hidden touch-pan-y">
      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      <div className="fixed inset-0 z-[-1] pointer-events-none"><Canvas dpr={[1, 2]}><PerspectiveCamera makeDefault position={[0, 0, 35]} fov={75} /><ambientLight intensity={0.5} /><MechanicalCore scrollY={scrollY} /><ContactShadows position={[0, -12, 0]} opacity={0.4} scale={50} blur={3} color="#00E5FF" /></Canvas></div>
      <div className="relative z-10 w-full flex flex-col px-6">
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#010102]/70 backdrop-blur-3xl border-b border-white/5 h-20 flex items-center justify-between px-6">
          <div className="text-xl font-black text-white">SHIVANG<span className="text-[#00E5FF]">.</span></div>
          <button onClick={() => setIsMenuOpen(true)} className="text-[#00E5FF] p-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </nav>
        {/* ... Rest of your Navigation and Hero Section ... */}
        
        <section id="stacks" className="py-20 space-y-8"><h2 className="text-6xl font-black text-white mb-16 tracking-tighter uppercase text-center">Arsenal.</h2>
          <CompCard title="Lang" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"}]} />
          <CompCard title="Front" icon="🖥️" skills={[{n:"React",v:"90%"},{n:"HTML",v:"95%"},{n:"Tailwind",v:"85%"}]} />
          <CompCard title="Back" icon="⚙️" skills={[{n:"Node",v:"85%"},{n:"REST",v:"90%"},{n:"WS",v:"75%"}]} />
        </section>

        {/* ... Remaining Sections (Builds, Offline, Footer) ... */}
      </div>
    </div>
  );
}