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
          setTimeout(onComplete, 1000); // Wait 1s at 100%
          return 100;
        }
        // Slowed down progress increment
        const next = prev + Math.floor(Math.random() * 2) + 1; 
        
        if (next >= 89) setStatus("89% ALLOWING ACCESS...");
        else if (next >= 54) setStatus("54% VERIFIED USER");
        else if (next >= 33) setStatus("33% SCANNING IF YOU ARE HUMAN...");
        
        return next > 100 ? 100 : next;
      });
    }, 180); // Interval increased to 180ms for a slower feel
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
        <p className="text-white font-black text-xs tracking-[0.2em] uppercase h-10 flex items-center justify-center leading-relaxed">
          {status}
        </p>
        <div className="text-[8px] font-mono text-gray-800 uppercase tracking-widest opacity-50">
          User_Auth: Pending | encrypted_link: true
        </div>
      </div>
    </motion.div>
  );
};

// --- MOBILE REACTOR (Scroll-Disperse Logic) ---
function MechanicalCore({ scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;
  
  // Logic: Intact at the top, Disperse as you scroll past home (150px threshold)
  const isAssembled = scrollY < 150; 

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 20
          );
          const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          temp.push({ targetPos, randomPos, randomRot, index: i++ });
        }
      }
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();
  const currentPositions = useMemo(() => cubeData.map(d => d.randomPos.clone()), []);
  const currentRotations = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isAssembled ? 0.25 : 0.05);
    
    cubeData.forEach((data, i) => {
      const targetP = isAssembled ? data.targetPos : data.randomPos;
      const targetR = isAssembled ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);

      currentPositions[i].lerp(targetP, isAssembled ? 0.1 : 0.015);
      currentRotations[i].slerp(targetR, isAssembled ? 0.1 : 0.01);

      dummy.position.copy(currentPositions[i]);
      if (!isAssembled) {
        dummy.position.y += Math.sin(t + i) * 0.005;
      }
      dummy.quaternion.copy(currentRotations[i]);
      dummy.scale.setScalar(isAssembled ? 1 : 0.6);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        {/* Obsidian-Teal material from Desktop build */}
        <meshStandardMaterial color={isAssembled ? "#002222" : "#020202"} roughness={0.1} metalness={0.9} />
      </instancedMesh>
      {isAssembled && <pointLight intensity={25} color="#FF8C00" distance={12} />}
    </group>
  );
}

// --- AUTO-CHARGING SKILL CARDS ---
const CompCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="bg-[#0A0A12]/60 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col h-[380px]">
      <div className="flex justify-between items-center mb-10 text-white">
        <h3 className="text-lg font-black uppercase tracking-widest">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="space-y-8 mt-auto">
        {skills.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-3 transition-colors duration-700" style={{ color: isInView ? 'white' : '' }}>
              <span>{s.n}</span><span style={{ color: isInView ? '#00E5FF' : '' }}>{s.v}</span>
            </div>
            <div className="flex gap-1.5 h-[4px] overflow-hidden bg-white/2 rounded-full">
              {[...Array(10)].map((_, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ backgroundColor: "#14141B" }} 
                  animate={isInView ? { backgroundColor: idx * 10 < parseInt(s.v) ? "#00E5FF" : "#14141B" } : {}} 
                  transition={{ delay: i * 0.1 + idx * 0.05 }} 
                  className="flex-1 rounded-sm" 
                  style={{ backgroundImage: isInView && idx * 10 < parseInt(s.v) ? 'linear-gradient(to right, #00E5FF, #FF8C00)' : 'none' }} 
                />
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
    <div className="min-h-screen bg-[#010102] text-gray-200 overflow-x-hidden selection:bg-[#00E5FF] touch-pan-y">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      {/* 3D BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 26]} fov={75} />
          <ambientLight intensity={0.5} />
          <Environment preset="night" />
          <MechanicalCore scrollY={scrollY} />
          <ContactShadows position={[0, -12, 0]} opacity={0.4} scale={40} blur={3} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col px-6">
        {/* NAVBAR */}
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#010102]/70 backdrop-blur-3xl border-b border-white/5 h-20 flex items-center justify-between px-6">
          <div className="text-xl font-black text-white">SHIVANG<span className="text-[#00E5FF]">.</span></div>
          <button onClick={() => setIsMenuOpen(true)} className="text-[#00E5FF] p-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </nav>

        {/* MOBILE MENU OVERLAY */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "tween", duration: 0.4 }} 
              className="fixed inset-0 z-[200] bg-[#010102] flex flex-col items-center justify-center gap-12 pointer-events-auto"
            >
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-[#00E5FF]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              {["Journey", "Stacks", "Builds", "Offline", "Connect"].map(t => (
                <a key={t} href={`#${t.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-3xl font-black tracking-widest uppercase hover:text-[#00E5FF]">{t}</a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION */}
        <section className="min-h-screen flex items-center pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={!isLoading ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1 }}>
            <h1 className="text-6xl font-black text-white mb-6 leading-none tracking-tighter uppercase">
              Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]">Ayar.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-12 border-l-2 border-[#FF8C00] pl-6 leading-relaxed font-light">
              Designing high-performance full-stack architectures and systems.
            </p>
            <div className="flex flex-col gap-6 w-full">
              <a href="#builds" className="bg-white text-black px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest shadow-2xl">Execute Builds</a>
              <a href="/resume.pdf" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* JOURNEY - VERTICAL SPINE */}
        <section id="journey" className="py-32 space-y-12 border-l-2 border-[#00E5FF]/20 ml-2">
          {[{y:"2024 - PRES", t:"Algonquin College", d:"Advanced Diploma in Computer Programming. Focused on Enterprise Microservices."}, 
            {y:"2021 - 2023", t:"Fraser International College", d:"Computer Science Pathway. Deep-dive into Big O efficiency and OOP design."}].map((item, idx) => (
            <div key={idx} className="relative pl-10">
              <div className={`absolute -left-[11px] top-2 w-5 h-5 rounded-full shadow-[0_0_15px_#00E5FF] ${idx === 0 ? 'bg-[#00E5FF]' : 'bg-purple-500'}`} />
              <div className="bg-[#0A0A12]/60 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                <span className="text-[10px] font-black text-gray-500 tracking-[0.4em]">{item.y}</span>
                <h3 className="text-2xl font-black text-white mt-4 tracking-tight">{item.t}</h3>
                <p className="text-gray-400 text-base mt-4 font-light leading-relaxed">{item.d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* TECHNICAL ARSENAL - AUTO-CHARGING */}
        <section id="stacks" className="py-20 space-y-8">
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter uppercase text-center">Arsenal.</h2>
          <CompCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"}]} />
          <CompCard title="Frontend" icon="🖥️" skills={[{n:"React",v:"90%"},{n:"HTML/CSS",v:"95%"},{n:"Tailwind",v:"85%"}]} />
          <CompCard title="Backend" icon="⚙️" skills={[{n:"Node",v:"85%"},{n:"REST",v:"90%"},{n:"WS",v:"75%"}]} />
        </section>

        {/* OFFLINE PROTOCOL - SCROLL REACTION */}
        <section id="offline" className="py-32 space-y-8 text-center">
          <h2 className="text-5xl font-black text-white mb-16 tracking-tighter uppercase italic">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
          {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focus."}, 
             {i:"🎮",t:"Logic",d:"Hardware tuning & shooters."}, 
             {i:"🌍",t:"Equilibrium",d:"Hiking to reset the buffer."}].map((h,x)=>(
            <motion.div 
              key={x} 
              initial={{ scale: 0.9, opacity: 0 }} 
              whileInView={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.6, delay: x * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="bg-[#0A0A12]/60 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl"
            >
              <div className="text-7xl mb-10 group-hover:scale-110 transition-transform">{h.i}</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">{h.t}</h3>
              <p className="text-gray-500 text-lg mt-6 leading-relaxed font-light">{h.d}</p>
            </motion.div>
          ))}
        </section>

        {/* FOOTER */}
        <footer id="connect" className="py-40 flex items-center justify-center text-center">
          <div className="w-full bg-[#020203] border-2 border-[#00E5FF]/40 p-12 rounded-[5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]" />
            <h2 className="text-6xl font-black text-white mb-10 tracking-tighter uppercase leading-none">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2>
            <div className="flex flex-col gap-6 mt-10">
              <a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase">GitHub</a>
              <a href="https://linkedin.com/in/shivangayar/" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase">LinkedIn</a>
              <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase">Email</a>
            </div>
            <p className="mt-40 text-[10px] font-black tracking-[1.5em] text-gray-800 uppercase leading-relaxed">
              © 2026 SHIVANG AYAR.<br/>ARCHITECTED WITH INTENT.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}