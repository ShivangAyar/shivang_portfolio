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
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 1 }} className="fixed inset-0 z-[1000] bg-[#010102] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-full max-w-xs space-y-8">
        <h2 className="text-[#00E5FF] font-mono text-2xl tracking-[0.2em] font-black uppercase flex items-center justify-center gap-2">
          <span>&lt;/&gt;</span> Shivang Ayar
        </h2>
        <div className="h-[1.5px] w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" style={{ width: progress + "%" }} />
        </div>
        <p className="text-gray-400 font-black text-[10px] tracking-widest uppercase leading-relaxed">
          Welcome to my realm <br /> hope you enjoy it 🚀
        </p>
      </div>
    </motion.div>
  );
};

// --- MECHANICAL SNAP CORE (Cinematic Intro & Scroll Disperse) ---
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

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isActive ? 0.25 : 0.05);
    
    const targetScale = isActive ? 1.4 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

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
        <meshStandardMaterial color={isActive ? "#002222" : "#020202"} roughness={0.1} metalness={0.9} />
      </instancedMesh>
      {isActive && <pointLight intensity={25} color="#FF8C00" distance={15} />}
    </group>
  );
}

// --- DESKTOP SLIDER BARS (Continuous Gradient) ---
const CompCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.3, once: false });
  return (
    <div ref={ref} className="bg-[#0A0A15]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col h-[400px]">
      <h3 className="text-xl font-bold text-white mb-8 tracking-tighter uppercase flex items-center gap-4"><span className="text-2xl">{icon}</span> {title}</h3>
      <div className="space-y-10 mt-auto">{skills.map((skill, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase mb-3 transition-colors" style={{ color: isInView ? 'white' : '' }}><span>{skill.n}</span><span style={{ color: isInView ? "#00E5FF" : "" }}>{skill.v}</span></div>
          <div className="w-full bg-white/5 rounded-full h-[2px] overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }} 
              animate={{ width: isInView ? skill.v : "0%" }} 
              transition={{ duration: 1.2, delay: isInView ? i * 0.15 : 0, ease: "easeOut" }} 
              className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] shadow-[0_0_10px_rgba(0,229,255,0.8)]" 
            />
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
    <footer id="connect" className="pt-40 pb-12 flex flex-col items-center justify-center relative overflow-hidden px-6">
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
          <a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/5 border border-white/10 px-8 py-5 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
            <span className="text-xl">🐙</span> GitHub
          </a>
          <a href="https://linkedin.com/in/shivangayar/" target="_blank" className="bg-white/5 border border-white/10 px-8 py-5 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all flex items-center justify-center gap-3">
            <span className="text-xl">💼</span> LinkedIn
          </a>
          <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-8 py-5 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all flex items-center justify-center gap-3">
            <span className="text-xl">✉️</span> Email
          </a>
        </div>
      </div>

      <div className="w-full flex justify-between items-center mt-12 px-2 text-[8px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.4em] text-gray-600 uppercase z-20 relative">
        <span className="text-left">© 2026 SHIVANG AYAR</span>
        <span className="text-right">MADE WITH INTENT</span>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
        .animate-scanline { animation: scanline 8s linear infinite; }
      `}} />
    </footer>
  );
};

// --- FULL PROJECTS DATA ---
const projectsData = [
  { title: "E-Commerce Microservices", desc: "Scaleable backend utilizing Docker, Stripe API, and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist App", desc: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF8C00" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#FF8C00" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI featuring user credits and async generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF8C00" }
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
    <div className="min-h-screen bg-[#010102] text-gray-200 overflow-x-hidden selection:bg-[#00E5FF]">
      
      {/* OVERFLOW FIX */}
      <style dangerouslySetInnerHTML={{__html: `
        html, body { background-color: #010102 !important; overscroll-behavior-y: none; overflow-x: hidden; }
      `}} />

      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <color attach="background" args={['#010102']} />
          <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={55} />
          <ambientLight intensity={1.5} />
          <Environment preset="night" />
          <MechanicalCore scrollY={scrollY} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* ENHANCED NAVBAR */}
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#010102]/70 backdrop-blur-3xl border-b border-white/5 h-20 flex items-center justify-between px-6">
          <div className="text-xl font-black text-white cursor-pointer flex items-center" onClick={() => window.scrollTo(0,0)}>
            <span className="text-[#00E5FF] font-mono mr-2 tracking-tighter">&lt;/&gt;</span>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="text-[#00E5FF] p-2 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
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
              className="fixed inset-0 z-[200] bg-[#010102]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00E5FF]/10 via-transparent to-transparent pointer-events-none" />
              
              {/* Menu Close Button */}
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-white p-3 bg-white/5 hover:bg-[#00E5FF] hover:text-black transition-colors rounded-full border border-white/10 z-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
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
                    className="mt-8 bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                >
                  Initialize Contact
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PAGE 1: CUBE ONLY (With Scroll Arrow that Fades Out) */}
        <section className="h-[90vh] w-full flex flex-col items-center justify-end pb-12 z-20">
          <div style={{ opacity: Math.max(0, 1 - scrollY / 150) }} className="transition-opacity duration-100">
            <motion.button 
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
              animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center gap-2 text-[#00E5FF] mix-blend-screen cursor-pointer"
            >
              <span className="text-[10px] tracking-[0.3em] font-black uppercase text-center">Scroll to find out more</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </motion.button>
          </div>
        </section>

        {/* PAGE 2: NAME TRANSITION (Hero) */}
        <section id="hero" className="px-6 min-h-[80vh] flex items-center pt-10 z-40">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }} 
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-start"
          >
            <h1 className="text-6xl font-black text-white mb-6 leading-none tracking-tighter uppercase leading-[0.85]">
              Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]">Ayar.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-12 border-l-2 border-[#FF8C00] pl-6 leading-relaxed font-light text-left">
              Designing high-performance full-stack architectures and resilient digital systems.
            </p>
            <div className="flex flex-col gap-6 w-full">
              <a href="#builds" className="bg-white text-black px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest shadow-2xl">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT ME */}
        <section id="about" className="px-6 py-32 flex flex-col gap-10"><div className="w-full text-left">
          <h2 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase">About <span className="text-[#00E5FF]">Me.</span></h2>
          <p className="text-gray-400 text-lg font-light leading-relaxed">Born and raised in Zambia, now operating in Ottawa. My approach to engineering is purely objective: Build, Optimize, and Master.</p>
        </div></section>

        {/* TIMELINE */}
        <section className="px-6 py-10 space-y-12 border-l-2 border-[#00E5FF]/20 ml-2">
          {[{y:"2024 - PRES", t:"Algonquin College", d:"Advanced Diploma in Computer Programming. Enterprise focus."},
            {y:"2021 - 2023", t:"Fraser International College", d:"Computer Science Pathway. Specialized algorithm design."}].map((item, idx) => (
            <div key={idx} className="relative pl-10"><div className={`absolute -left-[11px] top-2 w-5 h-5 rounded-full shadow-[0_0_15px_#00E5FF] ${idx === 0 ? 'bg-[#00E5FF]' : 'bg-purple-500'}`} />
              <div className="bg-[#0A0A15]/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"><span className="text-[10px] font-black text-gray-500 tracking-[0.3em]">{item.y}</span><h3 className="text-xl font-black text-white mt-4 tracking-tight">{item.t}</h3><p className="text-gray-400 text-sm mt-4 font-light leading-relaxed">{item.d}</p></div>
            </div>
          ))}
        </section>

        {/* TECHNICAL ARSENAL */}
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
          {projectsData.map((p, i) => (
          <div key={i} className="bg-[#0A0A15]/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 m-6" style={{ borderColor: p.color }} />
            <h3 className="text-3xl font-black text-white mb-6 uppercase leading-tight tracking-tighter">{p.title}</h3>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light flex-grow">{p.desc}</p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {p.tags.map((tag, tIdx) => (
                <span key={tIdx} className="text-[9px] font-black border border-white/10 px-4 py-1.5 rounded-full uppercase text-gray-400">{tag}</span>
              ))}
            </div>
          </div>
        ))}</section>

        {/* OFFLINE PROTOCOL */}
        <section id="offline" className="px-6 py-32 space-y-8 text-center">
          <h2 className="text-5xl font-black text-white mb-16 tracking-tighter uppercase italic">Offline Protocol.</h2>
          {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focus, applying progressive overload."},
             {i:"🎮",t:"Logic",d:"Hardware tuning and competitive tactical shooters."},
             {i:"🌍",t:"Equilibrium",d:"Hiking and exploration of terrain to reset the digital buffer."}
          ].map((h,x)=>(
            <motion.div key={x} initial={{scale:0.9, opacity: 0}} whileInView={{scale:1, opacity: 1}} transition={{duration: 0.6}} viewport={{once: true}} className="bg-[#0A0A15]/80 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
              <div className="text-7xl mb-10">{h.i}</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-widest">{h.t}</h3>
              <p className="text-gray-400 text-lg mt-6 font-light leading-relaxed">{h.d}</p>
            </motion.div>
          ))}</section>

        <ReactiveFooter />
      </div>
    </div>
  );
}