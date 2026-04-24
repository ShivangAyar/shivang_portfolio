import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';

// --- CUSTOM HACKER LOADING PROTOCOL ---
const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1200);
          return 100;
        }
        return prev + Math.floor(Math.random() * 4) + 1;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 1 }} className="fixed inset-0 z-[1000] bg-[#030508] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-full max-w-xs space-y-8">
        <h2 className="text-[#00E5FF] font-mono text-2xl tracking-[0.2em] font-black uppercase flex items-center justify-center gap-2">
          <span>&lt;/&gt;</span> Shivang Ayar
        </h2>
        <div className="h-[1.5px] w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#FF8C00]" style={{ width: progress + "%" }} />
        </div>
        <p className="text-gray-400 font-medium text-[10px] tracking-widest uppercase leading-relaxed">
          Welcome to my realm <br /> hope you enjoy it 🚀
        </p>
      </div>
    </motion.div>
  );
};

// --- SUBTLE 3D STAR-DUST BACKGROUND ---
function DustParticles() {
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  const pointsRef = useRef();
  useFrame((state) => {
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#00E5FF" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// --- MECHANICAL SNAP CORE (Glassmorphism & Cinematic Scroll) ---
function MechanicalCore({ scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;
  
  const isActive = scrollY < 50;

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const expandedPos = targetPos.clone().multiplyScalar(3.5).add(new THREE.Vector3(
            (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10
          ));
          const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          temp.push({ targetPos, randomPos: expandedPos, randomRot, index: i++ });
        }
      }
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();
  const cP = useMemo(() => cubeData.map(d => d.randomPos.clone()), [cubeData]);
  const cR = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), [cubeData]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isActive ? 0.2 : 0.03);
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    
    const targetScale = isActive ? 1.4 : 1.1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    cubeData.forEach((data, i) => {
      const tP = isActive ? data.targetPos : data.randomPos;
      const tR = isActive ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      
      cP[i].lerp(tP, 0.06); 
      cR[i].slerp(tR, 0.06);
      dummy.position.copy(cP[i]);
      
      if (!isActive) dummy.position.y += Math.sin(t * 0.5 + i) * 0.01;
      
      dummy.quaternion.copy(cR[i]);
      dummy.scale.setScalar(isActive ? 1 : 0.5);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshPhysicalMaterial 
          color={isActive ? "#020813" : "#050A15"} 
          roughness={0.1} 
          metalness={0.8} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={isActive ? "#001122" : "#00E5FF"}
          emissiveIntensity={isActive ? 0.5 : 0.15}
        />
      </instancedMesh>
      {isActive && <pointLight intensity={30} color="#00E5FF" distance={20} />}
      <pointLight intensity={10} color="#7B61FF" position={[-10, 10, -10]} distance={20} />
    </group>
  );
}

// --- MOBILE SLIDER BARS (Continuous Glassmorphism) ---
const CompCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.3, once: false });
  return (
    <div ref={ref} className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col h-[380px] relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00E5FF] rounded-full blur-[60px] opacity-10 pointer-events-none" />
      <h3 className="text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-4 relative z-10"><span className="text-2xl">{icon}</span> {title}</h3>
      <div className="space-y-8 mt-auto relative z-10">{skills.map((skill, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] font-semibold text-gray-400 uppercase mb-3 transition-colors" style={{ color: isInView ? 'white' : '' }}><span>{skill.n}</span><span style={{ color: isInView ? "#00E5FF" : "" }}>{skill.v}</span></div>
          <div className="w-full bg-white/[0.05] rounded-full h-[2px] overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }} 
              animate={{ width: isInView ? skill.v : "0%" }} 
              transition={{ duration: 1.2, delay: isInView ? i * 0.15 : 0, ease: "easeOut" }} 
              className="h-full bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#FF8C00] shadow-[0_0_10px_rgba(0,229,255,0.8)]" 
            />
          </div>
        </div>
      ))}</div>
    </div>
  );
};

// --- HOLOGRAPHIC PROJECT CARDS ---
const PremiumProjectCard = ({ p, idx }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2, once: true });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      className="relative rounded-[2rem] p-[1px] overflow-hidden group"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#FF8C00] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Card Content */}
      <div className="relative bg-[#050A15]/90 backdrop-blur-3xl h-full p-8 rounded-[2rem] flex flex-col z-10 shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.08] transition-all duration-700" style={{ background: p.color }}></div>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl">{p.icon}</span>
          <h3 className="text-xl font-black text-white leading-tight tracking-tight uppercase relative z-10">{p.title}</h3>
        </div>
        
        <p className="text-gray-400 text-sm font-light leading-relaxed mb-8 relative z-10">{p.desc}</p>
        
        <div className="flex flex-wrap gap-2 mb-8 relative z-10 mt-auto">
          {p.tags.map((tag, tIdx) => (
            <span key={tIdx} className="text-[9px] font-bold bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full uppercase text-gray-300">{tag}</span>
          ))}
        </div>

        <div className="flex gap-3 relative z-10 w-full">
          <button className="flex-1 bg-white/[0.05] border border-white/10 py-3 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center">Execute</button>
          <button className="flex-1 border border-white/10 py-3 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:border-white/30 hover:text-white transition-all text-center">&lt;/&gt; Source</button>
        </div>
      </div>
    </motion.div>
  );
};

// --- CRAZY TERMINAL FOOTER ---
const ReactiveFooter = () => {
  const [logs, setLogs] = useState(["> Uplink Established", "> Syncing Ottawa_Node..."]);
  
  useEffect(() => {
    const data = [
      "> Encryption: AES-256 Verified",
      "> Status: Terminal Ready",
      "> Location: Ottawa_CA Detected",
      "> Port: 443 Scanning...",
      "> User_Auth: Level_01 Granted",
      "> Signal Strength: 98% Optimal"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-3), data[i]]);
      i = (i + 1) % data.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer id="connect" className="pt-40 pb-12 flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 text-[8px] font-mono text-[#00E5FF]">
        {Array.from({length: 40}).map((_,i) => (
          <motion.div key={i} animate={{ y: [0, 100, 0], opacity: [0, 1, 0] }} transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }}>
            {Math.random() > 0.5 ? '10110' : 'SHIVANG'}
          </motion.div>
        ))}
      </div>

      <div className="w-full bg-white/[0.01] backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-[0_0_80px_rgba(0,229,255,0.05)] relative z-10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/5 to-transparent h-4 w-full animate-scanline pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#FF8C00] opacity-50" />
        
        <motion.h2 
          animate={{ skewX: [0, -2, 2, 0], x: [0, -1, 1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 5 }}
          className="text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-none text-center"
        >
          Terminal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#7B61FF]">Ready.</span>
        </motion.h2>

        <div className="bg-black/40 border border-white/5 p-5 rounded-2xl mb-12 font-mono text-[9px] text-[#00E5FF]/80 text-left min-h-[90px] shadow-inner flex flex-col justify-end">
          {logs.map((line, idx) => (
            <div key={idx} className="flex gap-2 mb-1"><span className="text-[#FF8C00]">#</span> {line}</div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
            <span className="text-xl">🐙</span> GitHub
          </a>
          <a href="https://linkedin.com/in/shivangayar/" target="_blank" className="bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white font-bold tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all flex items-center justify-center gap-3">
            <span className="text-xl">💼</span> LinkedIn
          </a>
          <a href="mailto:ayarshivang27@gmail.com" className="bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-white font-bold tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all flex items-center justify-center gap-3">
            <span className="text-xl">✉️</span> Email
          </a>
        </div>
      </div>

      <div className="w-full flex justify-between items-center mt-10 px-2 text-[8px] font-bold tracking-[0.4em] text-gray-500 uppercase z-20 relative">
        <span className="text-left">© 2026 SHIVANG AYAR</span>
        <span className="text-right text-[#00E5FF]">MADE WITH INTENT</span>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
        .animate-scanline { animation: scanline 8s linear infinite; }
      `}} />
    </footer>
  );
};

// --- TAILORED PROJECTS DATA ---
const projectsData = [
  { title: "Watchlist Architecture", desc: "Engineered a full-stack media tracker utilizing Pug templates for dynamic UI, pure JavaScript client-side interactivity, and a robust NoSQL backend system.", tags: ["MongoDB", "Express", "JS", "Pug"], color: "#FF8C00", icon: "🎬" },
  { title: "Financial Ledger Engine", desc: "Developed a tailored tracking application in Visual Studio to monitor cash flow, recurring API subscriptions, and optimize utility expenses live.", tags: ["C#", "Visual Studio", ".NET"], color: "#00E5FF", icon: "📈" },
  { title: "E-Commerce Microservices", desc: "A scalable backend ecosystem for digital commerce, seamlessly handling secure Stripe payments and managing user authentication across nodes.", tags: ["Node.js", "Docker", "Stripe"], color: "#7B61FF", icon: "🛒" },
  { title: "Real-Time Collab Sync", desc: "A high-performance live document-editing platform allowing multiple concurrent users to type and collaborate without state conflicts.", tags: ["Socket.io", "Next.js", "Redis"], color: "#00E5FF", icon: "⚡" }
];

export default function MobileView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { window.removeEventListener('scroll', handleScroll); document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 overflow-x-hidden selection:bg-[#00E5FF]">
      
      {/* OVERFLOW FIX & DEEP SPACE BG */}
      <style dangerouslySetInnerHTML={{__html: `
        html, body { background-color: #030508 !important; overscroll-behavior-y: none; overflow-x: hidden; }
      `}} />

      {/* AMBIENT GLOW BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] bg-[#00E5FF] rounded-full blur-[120px] opacity-[0.04]" />
        <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[40%] bg-[#7B61FF] rounded-full blur-[120px] opacity-[0.04]" />
      </div>

      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={55} />
          <ambientLight intensity={1.5} />
          <Environment preset="city" />
          <DustParticles />
          <MechanicalCore scrollY={scrollY} />
          <ContactShadows position={[0, -10, 0]} opacity={0.3} scale={40} blur={2.5} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* PREMIUM NAVBAR */}
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#030508]/60 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center justify-between px-6">
          <div className="text-xl font-black text-white cursor-pointer flex items-center tracking-tight" onClick={() => window.scrollTo(0,0)}>
            <span className="text-[#00E5FF] font-mono mr-2">&lt;/&gt;</span>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="text-white hover:text-[#00E5FF] p-2 focus:outline-none transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </nav>

        {/* PREMIUM MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] bg-[#030508]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00E5FF]/10 via-transparent to-transparent pointer-events-none" />
              
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-white p-3 bg-white/5 hover:bg-[#00E5FF] hover:text-black transition-colors rounded-full border border-white/10 z-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <div className="flex flex-col gap-8 text-center relative z-10 w-full max-w-sm">
                <div className="text-[#00E5FF] font-mono text-xs tracking-[0.5em] uppercase mb-4 opacity-50">System Navigation</div>
                {['About', 'Skills', 'Builds', 'Offline'].map((t, i) => (
                  <motion.a 
                    key={t} 
                    href={`#${t.toLowerCase()}`} 
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    className="text-4xl font-black uppercase tracking-widest text-white border-b border-white/5 pb-4 w-full text-left flex justify-between items-center group"
                  >
                    <span>{t}</span>
                    <span className="text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </motion.a>
                ))}
                <motion.a 
                    href="#connect"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] py-5 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                >
                  Initialize Contact
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAGE 1: CUBE ONLY */}
        <section className="h-[90vh] w-full flex flex-col items-center justify-end pb-12 z-20 pointer-events-none">
          <div style={{ opacity: Math.max(0, 1 - scrollY / 150) }} className="transition-opacity duration-100 pointer-events-auto">
            <motion.button 
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
              animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-[#00E5FF] cursor-pointer"
            >
              <span className="text-[10px] tracking-[0.3em] font-bold uppercase text-center">Scroll to explore</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </motion.button>
          </div>
        </section>

        {/* PAGE 2: NAME TRANSITION (Hero) */}
        <section id="hero" className="px-6 min-h-[80vh] flex items-center pt-10 z-40">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }} 
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-start"
          >
            <h1 className="text-6xl font-black text-white mb-6 leading-none tracking-tighter uppercase leading-[0.85]">
              Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#7B61FF] to-[#FF8C00]">Ayar.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-12 border-l-2 border-[#7B61FF]/50 pl-6 leading-relaxed font-light text-left">
              Designing high-performance full-stack architectures and resilient digital systems.
            </p>
            <div className="flex flex-col gap-6 w-full">
              <a href="#builds" className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] px-12 py-5 text-[10px] font-bold uppercase text-center tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.1)] rounded-xl">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="bg-white/5 border border-white/10 text-white px-12 py-5 text-[10px] font-bold uppercase text-center tracking-widest rounded-xl">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT ME */}
        <section id="about" className="px-6 py-32 flex flex-col gap-10 relative z-30"><div className="w-full text-left">
          <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
          <p className="text-gray-400 text-lg font-light leading-relaxed">
            Currently pursuing a degree in Computer Programming and translating the skills learned so far into practical, real-world applications. My approach to engineering is purely objective: Build, Optimize, and Master.
          </p>
        </div></section>

        {/* NEURAL TIMELINE */}
        <section className="px-6 py-10 space-y-0 relative ml-4 z-30">
          <div className="absolute left-[25px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#00E5FF] via-[#7B61FF] to-transparent opacity-30" />
          
          {[ 
            {i:"🎓", y:"2024 - PRES", t:"Algonquin College", d:"Adv. Diploma in Computer Programming. Architecting enterprise-level APIs, full-stack applications, and object-oriented systems.", c:"#00E5FF"},
            {i:"💻", y:"2021 - 2023", t:"Fraser International College", d:"Computer Science Pathway. Established a rigorous foundation in algorithm design, data structures, and computational logic.", c:"#7B61FF"}
          ].map((item, idx) => (
            <div key={idx} className="relative pl-12 pb-16 group">
              <div className={`absolute -left-[3px] top-2 w-8 h-8 rounded-full bg-[#030508] border-2 flex items-center justify-center z-10 shadow-[0_0_15px_${item.c}40]`} style={{ borderColor: item.c }}>
                <span className="text-xs">{item.i}</span>
              </div>
              <div className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full opacity-50`} style={{ background: item.c }} />
                <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">{item.y}</span>
                <h3 className="text-xl font-bold text-white mt-3 tracking-tight">{item.t}</h3>
                <p className="text-gray-400 text-sm mt-3 font-light leading-relaxed">{item.d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* TECHNICAL ARSENAL */}
        <section id="skills" className="px-6 py-32 space-y-8 relative z-30">
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter uppercase text-center">Core <span className="text-[#00E5FF]">Stacks.</span></h2>
          <CompCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"}]} />
          <CompCard title="Frontend Dev" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML5/CSS3",v:"95%"},{n:"Tailwind",v:"85%"}]} />
          <CompCard title="Backend & APIs" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"Express.js",v:"85%"},{n:"REST APIs",v:"90%"}]} />
          <CompCard title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"PostgreSQL",v:"75%"}]} />
          <CompCard title="Analytics" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"}]} />
          <CompCard title="DevOps" icon="☁️" skills={[{n:"Git / GitHub",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"}]} />
        </section>

        {/* SYSTEM BUILDS (HOLOGRAPHIC CARDS) */}
        <section id="builds" className="px-6 py-40 space-y-10 relative z-30">
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter text-right">System <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#FF8C00]">Builds.</span></h2>
          {projectsData.map((p, i) => (
            <PremiumProjectCard key={i} p={p} idx={i} />
          ))}
        </section>

        {/* OFFLINE PROTOCOL */}
        <section id="offline" className="px-6 py-32 space-y-8 text-center relative z-30">
          <h2 className="text-5xl font-black text-white mb-16 tracking-tighter italic">Offline <span className="text-[#00E5FF]">Protocol.</span></h2>
          {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focus, applying progressive overload."},
             {i:"🎮",t:"Logic",d:"Hardware tuning and competitive tactical shooters."},
             {i:"🌍",t:"Equilibrium",d:"Hiking and exploration of terrain to reset the digital buffer."}
          ].map((h,x)=>(
            <motion.div key={x} initial={{scale:0.95, opacity: 0}} whileInView={{scale:1, opacity: 1}} transition={{duration: 0.5}} viewport={{once: true}} className="bg-white/[0.02] backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-lg">
              <div className="text-6xl mb-8 opacity-60">{h.i}</div>
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">{h.t}</h3>
              <p className="text-gray-400 text-sm mt-5 font-light leading-relaxed">{h.d}</p>
            </motion.div>
          ))}</section>

        <ReactiveFooter />
      </div>
    </div>
  );
}