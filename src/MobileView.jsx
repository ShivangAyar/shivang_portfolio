import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';

// --- HACKER LOADING PROTOCOL ---
const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1200);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 2) + 1; 
        if (next >= 89) setStatus("89% ALLOWING ACCESS...");
        else if (next >= 54) setStatus("54% VERIFIED USER");
        else if (next >= 33) setStatus("33% SCANNING IF YOU ARE HUMAN...");
        return next > 100 ? 100 : next;
      });
    }, 150); 
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 1 }} className="fixed inset-0 z-[1000] bg-[#010102] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-full max-w-xs space-y-12">
        <div className="space-y-4">
          <h2 className="text-[#00E5FF] font-mono text-[10px] tracking-[0.5em] animate-pulse uppercase">Security Protocol Active</h2>
          <div className="h-[1.5px] w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" style={{ width: progress + "%" }} />
          </div>
        </div>
        <p className="text-white font-black text-xs tracking-[0.2em] uppercase h-10 flex items-center justify-center leading-relaxed">{status}</p>
      </div>
    </motion.div>
  );
};

// --- MECHANICAL SNAP CORE (Exact Desktop logic mapped to scroll) ---
function MechanicalCore({ scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;
  
  // Logic: Assembled at top, disperses as you scroll down
  const isActive = scrollY < 150;

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 20);
          const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          temp.push({ targetPos, randomPos, randomRot, index: i++ });
        }
      }
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();
  const cP = useMemo(() => cubeData.map(d => d.randomPos.clone()), [cubeData]);
  const cR = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), [cubeData]);

  const words = useMemo(() => [
    { text: "SHIVANG", phase: 0, offset: [0, 4, 0] },
    { text: "ARCHITECTURE", phase: 2, offset: [4, 1, 1] },
    { text: "MERN STACK", phase: 3.5, offset: [-4, -2, 1] },
    { text: "SYSTEMS", phase: 5, offset: [0, -4, 0] }
  ], []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isActive ? 0.25 : 0.05);
    cubeData.forEach((data, i) => {
      const tP = isActive ? data.targetPos : data.randomPos;
      const tR = isActive ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      cP[i].lerp(tP, 0.08); cR[i].slerp(tR, 0.08);
      dummy.position.copy(cP[i]);
      if (!isActive) dummy.position.y += Math.sin(t + i) * 0.005;
      dummy.quaternion.copy(cR[i]);
      dummy.scale.setScalar(isActive ? 1 : 0.6);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial 
          color="#00E5FF" 
          metalness={1} 
          roughness={0.05} 
          emissive={isActive ? "#00E5FF" : "#000"} 
          emissiveIntensity={isActive ? 0.5 : 0.1} 
        />
      </instancedMesh>
      {isActive && <pointLight intensity={20} color="#FF8C00" distance={10} />}
      {words.map((w, i) => <FloatingHUDText key={i} text={w.text} isActive={isActive} offset={w.offset} phase={w.phase} />)}
    </group>
  );
}

function FloatingHUDText({ text, isActive, offset, phase }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const driftX = Math.sin(t * 0.4 + phase) * (isActive ? 1 : 5);
      const driftY = Math.cos(t * 0.3 + phase) * (isActive ? 1 : 5);
      ref.current.position.lerp(new THREE.Vector3(isActive ? offset[0] + driftX : driftX, isActive ? offset[1] + driftY : driftY, isActive ? 0 : -10), 0.03);
      ref.current.lookAt(state.camera.position);
    }
  });
  return <Text ref={ref} fontSize={0.4} color="#00E5FF" emissive="#00E5FF" emissiveIntensity={isActive ? 4 : 0.2} transparent opacity={isActive ? 0.9 : 0.15}>{text}</Text>;
}

// --- SEQUENTIAL SCROLL-REACTIVE SKILLS (Reset on scroll past) ---
const CompCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  // once: false ensures it resets when scrolling out of view
  const isInView = useInView(ref, { amount: 0.3, once: false }); 
  return (
    <div ref={ref} className="bg-[#050507]/60 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col h-[400px]">
      <h3 className="text-xl font-bold text-white mb-8 tracking-tighter uppercase flex items-center gap-4"><span className="text-2xl">{icon}</span> {title}</h3>
      <div className="space-y-10 mt-auto">{skills.map((skill, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase mb-3 transition-colors" style={{ color: isInView ? 'white' : '' }}><span>{skill.n}</span><span style={{ color: isInView ? "#00E5FF" : "" }}>{skill.v}</span></div>
          <div className="flex gap-2 h-[5px] overflow-hidden bg-white/2 rounded-full">
            {[...Array(12)].map((_, idx) => (
              <motion.div 
                key={idx} 
                initial={{ backgroundColor: "#14141B" }} 
                animate={isInView ? { backgroundColor: idx * (100/12) < parseInt(skill.v) ? "#00E5FF" : "#14141B" } : { backgroundColor: "#14141B" }} 
                transition={{ delay: isInView ? (i * 0.1 + idx * 0.04) : 0 }} 
                className="flex-1 rounded-sm" 
                style={{ backgroundImage: isInView && idx * (100/12) < parseInt(skill.v) ? 'linear-gradient(to right, #00E5FF, #FF8C00)' : 'none' }} 
              />
            ))}
          </div>
        </div>
      ))}</div>
    </div>
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
    <footer id="connect" className="py-40 flex items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 text-[8px] font-mono text-[#00E5FF]">
        {Array.from({length: 40}).map((_,i) => (
          <motion.div key={i} animate={{ y: [0, 100, 0], opacity: [0, 1, 0] }} transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }}>
            {Math.random() > 0.5 ? '10110' : 'SHIVANG'}
          </motion.div>
        ))}
      </div>

      <div className="w-full bg-[#020203] border-2 border-[#00E5FF]/30 p-12 rounded-[4rem] shadow-[0_0_80px_rgba(0,229,255,0.08)] relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/5 to-transparent h-4 w-full animate-scanline pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" />
        
        <motion.h2 
          animate={{ skewX: [0, -5, 5, 0], x: [0, -1, 1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 4 }}
          className="text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-none text-center"
        >
          Terminal <br/><span className="text-[#00E5FF]">Ready.</span>
        </motion.h2>

        <div className="bg-black/50 border border-white/5 p-5 rounded-2xl mb-12 font-mono text-[9px] text-[#00E5FF]/60 text-left min-h-[90px] backdrop-blur-md">
          {logs.map((line, idx) => (
            <div key={idx} className="flex gap-2 mb-1"><span className="text-[#FF8C00]">#</span> {line}</div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all text-center">GitHub</a>
          <a href="https://linkedin.com/in/shivangayar/" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all text-center">LinkedIn</a>
          <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all text-center">Email</a>
        </div>
        
        <p className="mt-40 text-[10px] font-black tracking-[1.5em] text-gray-800 uppercase leading-relaxed text-center">© 2026 SHIVANG AYAR.<br/>ARCHITECTED WITH INTENT.</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
        .animate-scanline { animation: scanline 8s linear infinite; }
      `}} />
    </footer>
  );
};

export default function MobileView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { window.removeEventListener('scroll', handleScroll); document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-[#010102] text-gray-200 overflow-x-hidden selection:bg-[#00E5FF]">
      
      {/* OVERFLOW FIX: Forces body background to black on mobile bounce */}
      <style dangerouslySetInnerHTML={{__html: `
        html, body { background-color: #010102 !important; overscroll-behavior-y: none; overflow-x: hidden; }
      `}} />

      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          {/* HARD BACKGROUND LOCK TO PREVENT WHITE OVERSCROLL GAP */}
          <color attach="background" args={['#010102']} />
          <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={55} />
          <ambientLight intensity={0.5} />
          <Environment preset="night" />
          <MechanicalCore scrollY={scrollY} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full z-50 bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-6">
          <div className="text-xl font-black text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>SHIVANG<span className="text-[#00E5FF]">.</span></div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 p-2 z-[110]"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg></button>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 z-[105] bg-[#010102] flex flex-col items-center justify-center gap-10">
              {['About', 'Skills', 'Builds', 'Connect'].map(t => <a key={t} href={`#${t.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-widest">{t}</a>)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section className="px-6 min-h-screen flex items-center pt-20"><motion.div initial={{ opacity: 0, y: 20 }} animate={!isLoading ? { opacity: 1, y: 0 } : {}} className="flex flex-col items-start z-40">
          <div className="mb-6 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black uppercase tracking-widest">Architecture & Logic</div>
          <h1 className="text-6xl font-black text-white mb-6 leading-none tracking-tighter uppercase leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]">Ayar.</span></h1>
          <p className="text-lg text-gray-400 mb-12 border-l-2 border-[#FF8C00] pl-6 leading-relaxed font-light text-left">Designing high-performance full-stack architectures and resilient digital systems.</p>
          <div className="flex flex-col gap-6 w-full"><a href="#builds" className="bg-white text-black px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest shadow-2xl">Execute Builds</a><a href="/resume.pdf" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest">Resume ↓</a></div>
        </motion.div></section>

        {/* ABOUT ME SECTION */}
        <section id="about" className="px-6 py-32 flex flex-col gap-10"><div className="w-full text-left">
          <h2 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase">About <span className="text-[#00E5FF]">Me.</span></h2>
          <p className="text-gray-400 text-lg font-light leading-relaxed">Born and raised in Zambia, now operating in Ottawa. My approach to engineering is purely objective: Build, Optimize, and Master.</p>
        </div></section>

        {/* TIMELINE */}
        <section className="px-6 py-10 space-y-12 border-l-2 border-[#00E5FF]/20 ml-2">
          {[{y:"2024 - PRES", t:"Algonquin College", d:"Advanced Diploma in Computer Programming. Enterprise focus."},
            {y:"2021 - 2023", t:"Fraser International College", d:"Computer Science Pathway. Specialized algorithm design."}].map((item, idx) => (
            <div key={idx} className="relative pl-10"><div className={`absolute -left-[11px] top-2 w-5 h-5 rounded-full shadow-[0_0_15px_#00E5FF] ${idx === 0 ? 'bg-[#00E5FF]' : 'bg-purple-500'}`} />
              <div className="bg-[#050507]/40 p-8 rounded-[3rem] border border-white/5 shadow-2xl"><span className="text-[10px] font-black text-gray-500 tracking-[0.3em]">{item.y}</span><h3 className="text-xl font-black text-white mt-4 tracking-tight">{item.t}</h3><p className="text-gray-400 text-sm mt-4 font-light leading-relaxed">{item.d}</p></div>
            </div>
          ))}
        </section>

        {/* TECHNICAL ARSENAL (ALL 6 ADDED & REACTIVE) */}
        <section id="skills" className="px-6 py-32 space-y-8">
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter uppercase text-center">Core Stacks.</h2>
          <CompCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"}]} />
          <CompCard title="Frontend Dev" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML5/CSS3",v:"95%"},{n:"Tailwind",v:"85%"}]} />
          <CompCard title="Backend & APIs" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"Express.js",v:"85%"},{n:"REST APIs",v:"90%"}]} />
          <CompCard title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"PostgreSQL",v:"75%"}]} />
          <CompCard title="Analytics" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"}]} />
          <CompCard title="DevOps" icon="☁️" skills={[{n:"Git / GitHub",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"}]} />
        </section>

        {/* SYSTEM BUILDS */}
        <section id="builds" className="px-6 py-40 space-y-10">
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter uppercase text-right">System Builds.</h2>
          {[ {title: "Microservices", d: "Scalable ecosystem using Node.js and Docker. Integrated Stripe API."},
             {title: "Watchlist App", d: "Engineered a full-stack media tracking application using the MERN stack."}
          ].map((p, i) => (
          <div key={i} className="bg-[#050507]/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00E5FF]/20 m-6" /><h3 className="text-3xl font-black text-white mb-6 uppercase leading-tight tracking-tighter">{p.title}</h3><p className="text-gray-400 text-lg mb-8 leading-relaxed font-light">{p.d}</p></div>
        ))}</section>

        {/* OFFLINE PROTOCOL */}
        <section id="offline" className="px-6 py-32 space-y-8 text-center">
          <h2 className="text-5xl font-black text-white mb-16 tracking-tighter uppercase italic">Offline Protocol.</h2>
          {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focus, applying progressive overload."},
             {i:"🎮",t:"Logic",d:"Hardware tuning and competitive tactical shooters."},
             {i:"🌍",t:"Equilibrium",d:"Hiking and exploration of terrain to reset the digital buffer."}
          ].map((h,x)=>(
            <motion.div key={x} initial={{scale:0.9, opacity: 0}} whileInView={{scale:1, opacity: 1}} transition={{duration: 0.6}} viewport={{once: true}} className="bg-[#050507]/40 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl"><div className="text-7xl mb-10">{h.i}</div><h3 className="text-2xl font-black text-white uppercase tracking-widest">{h.t}</h3><p className="text-gray-500 text-lg mt-6 font-light leading-relaxed">{h.d}</p></motion.div>
          ))}</section>

        <ReactiveFooter />
      </div>
    </div>
  );
}