import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-[#00E5FF] font-mono text-3xl tracking-[0.2em] font-black uppercase flex items-center justify-center gap-3">
          <span>&lt;/&gt;</span> Shivang Ayar
        </h2>
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" style={{ width: progress + "%" }} />
        </div>
        <p className="text-gray-400 font-black text-sm tracking-widest uppercase leading-relaxed">
          Welcome to my realm <br /> hope you enjoy it 🚀
        </p>
      </div>
    </motion.div>
  );
};

// --- MECHANICAL SNAP CORE (Cinematic Intro & Enhanced Visibility) ---
function MechanicalCore({ scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;
  
  // Assembled on Page 1, Disperses on scroll down
  const isActive = scrollY < 150;

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          // Desktop requires wider dispersion
          const randomPos = new THREE.Vector3((Math.random() - 0.5) * 45, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 20);
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
    
    // Scale up the cube when it's the centerpiece on load
    const targetScale = isActive ? 1.5 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    cubeData.forEach((data, i) => {
      const tP = isActive ? data.targetPos : data.randomPos;
      const tR = isActive ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      cP[i].lerp(tP, 0.08); cR[i].slerp(tR, 0.08);
      dummy.position.copy(cP[i]);
      if (!isActive) {
        dummy.position.y += Math.sin(t + i) * 0.005;
        dummy.position.x += Math.cos(t * 0.5 + i) * 0.005;
      }
      dummy.quaternion.copy(cR[i]);
      dummy.scale.setScalar(isActive ? 1 : 0.6);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        {/* ENHANCED VISIBILITY: Faint cyan emissive glow when scattered */}
        <meshStandardMaterial 
          color={isActive ? "#002222" : "#050A0F"} 
          roughness={0.2} 
          metalness={0.9} 
          emissive={isActive ? "#001111" : "#00E5FF"}
          emissiveIntensity={isActive ? 0.2 : 0.15}
        />
      </instancedMesh>
      {isActive && <pointLight intensity={30} color="#FF8C00" distance={20} />}
    </group>
  );
}

// --- DESKTOP SLIDER BARS (Hover-Reactive) ---
const CompCard = ({ title, icon, skills }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#0A0A15]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col h-[400px] hover:border-white/20 transition-all cursor-crosshair"
    >
      <h3 className="text-2xl font-bold text-white mb-10 tracking-tighter uppercase flex items-center gap-4"><span className="text-3xl">{icon}</span> {title}</h3>
      <div className="space-y-10 mt-auto">{skills.map((skill, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-3 transition-colors" style={{ color: isHovered ? 'white' : '' }}><span>{skill.n}</span><span style={{ color: isHovered ? "#00E5FF" : "" }}>{skill.v}</span></div>
          <div className="w-full bg-white/5 rounded-full h-[3px] overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }} 
              animate={{ width: isHovered ? skill.v : "0%" }} 
              transition={{ duration: 0.8, delay: isHovered ? i * 0.1 : 0, ease: "easeOut" }} 
              className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] shadow-[0_0_10px_rgba(0,229,255,0.8)]" 
            />
          </div>
        </div>
      ))}</div>
    </div>
  );
};

// --- CRAZY TERMINAL FOOTER (Desktop Layout) ---
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
      setLogs(prev => [...prev.slice(-4), data[i]]);
      i = (i + 1) % data.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer id="connect" className="pt-60 pb-12 flex flex-col items-center justify-center relative overflow-hidden px-10">
      {/* Background Binary Rain */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden flex flex-wrap gap-8 text-[10px] font-mono text-[#00E5FF] justify-center">
        {Array.from({length: 80}).map((_,i) => (
          <motion.div key={i} animate={{ y: [0, 150, 0], opacity: [0, 1, 0] }} transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }}>
            {Math.random() > 0.5 ? '10110' : 'SHIVANG'}
          </motion.div>
        ))}
      </div>

      {/* Terminal Container */}
      <div className="w-full max-w-6xl mx-auto bg-[#020203] border-2 border-[#00E5FF]/30 p-16 md:p-24 rounded-[4rem] shadow-[0_0_100px_rgba(0,229,255,0.08)] relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/5 to-transparent h-8 w-full animate-scanline pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" />
        
        <motion.h2 
          animate={{ skewX: [0, -5, 5, 0], x: [0, -2, 2, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 5 }}
          className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tighter uppercase leading-none text-center"
        >
          Terminal <br/><span className="text-[#00E5FF]">Ready.</span>
        </motion.h2>

        <div className="max-w-2xl mx-auto bg-black/50 border border-white/5 p-6 rounded-2xl mb-16 font-mono text-[11px] text-[#00E5FF]/60 text-left min-h-[140px] backdrop-blur-md flex flex-col justify-end">
          {logs.map((line, idx) => (
            <div key={idx} className="flex gap-3 mb-1"><span className="text-[#FF8C00]">#</span> {line}</div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 text-sm shadow-xl">
            <span className="text-2xl">🐙</span> GitHub
          </a>
          <a href="https://linkedin.com/in/shivangayar/" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all flex items-center justify-center gap-4 text-sm shadow-xl">
            <span className="text-2xl">💼</span> LinkedIn
          </a>
          <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all flex items-center justify-center gap-4 text-sm shadow-xl">
            <span className="text-2xl">✉️</span> Email
          </a>
        </div>
      </div>

      {/* Split Copyright */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-16 px-4 text-[10px] font-black tracking-[0.4em] text-gray-600 uppercase z-20 relative">
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

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-xs font-black tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-transform duration-500 group-hover:scale-x-100 shadow-[0_0_10px_#00E5FF]" />
  </a>
);

// --- DATA ---
const projectsData = [
  { title: "E-Commerce Microservices", desc: "Scaleable backend utilizing Docker, Stripe API, and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist App", desc: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF8C00" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#FF8C00" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI featuring user credits and async generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF8C00" }
];

export default function DesktopView() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#010102] text-gray-200 overflow-x-hidden selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth">
      
      <style dangerouslySetInnerHTML={{__html: `
        html, body { background-color: #010102 !important; }
        /* Custom Scrollbar for Desktop */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #010102; }
        ::-webkit-scrollbar-thumb { background: #00E5FF40; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #00E5FF; }
      `}} />

      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <color attach="background" args={['#010102']} />
          <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={40} />
          <ambientLight intensity={1.5} />
          <Environment preset="night" />
          <MechanicalCore scrollY={scrollY} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={50} blur={2.5} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* PREMIUM DESKTOP NAVBAR */}
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#010102]/60 backdrop-blur-3xl border-b border-white/5 h-24 flex items-center justify-between px-10">
          <div className="text-2xl font-black text-white cursor-pointer flex items-center" onClick={() => window.scrollTo(0,0)}>
            <span className="text-[#00E5FF] font-mono mr-3 tracking-tighter">&lt;/&gt;</span>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <div className="hidden md:flex gap-10 items-center">
            <NavLink href="#about">Journey</NavLink>
            <NavLink href="#skills">Competencies</NavLink>
            <NavLink href="#projects">Builds</NavLink>
            <NavLink href="#contact">Connect</NavLink>
          </div>
        </nav>

        {/* PAGE 1: CUBE ONLY (Centerpiece with Scroll Fade/Click) */}
        <section className="h-[100vh] w-full flex flex-col items-center justify-end pb-16 z-20">
          <div style={{ opacity: Math.max(0, 1 - scrollY / 200) }} className="transition-opacity duration-100">
            <motion.button 
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
              animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center gap-3 text-[#00E5FF] mix-blend-screen cursor-pointer hover:text-white transition-colors"
            >
              <span className="text-[10px] tracking-[0.4em] font-black uppercase text-center">Scroll to find out more</span>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
            </motion.button>
          </div>
        </section>

        {/* PAGE 2: NAME TRANSITION (Hero) */}
        <section id="hero" className="px-10 min-h-[80vh] flex items-center pt-10 z-40 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }} 
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-start"
          >
            <h1 className="text-8xl md:text-[9rem] font-black text-white mb-6 tracking-tighter uppercase leading-[0.85]">
              Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span>
            </h1>
            <p className="text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l border-[#FF8C00] pl-8 leading-relaxed">
              Designing high-performance full-stack architectures and resilient digital systems.
            </p>
            <div className="flex gap-6">
              <a href="#projects" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY */}
        <section id="about" className="max-w-7xl mx-auto px-10 py-40 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-5">
              <h2 className="text-6xl font-black text-white mb-10 tracking-tighter uppercase">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-10 text-xl font-light leading-relaxed">Born and raised in Zambia, now operating in Ottawa. My approach to engineering is purely objective: Build, Optimize, and Master.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0A0A15]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center shadow-xl"><h3 className="text-5xl font-black text-white">3+</h3><p className="text-xs text-gray-500 uppercase tracking-widest mt-3 font-black">Years</p></div>
                <div className="bg-[#0A0A15]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center shadow-xl"><h3 className="text-5xl font-black text-white">10+</h3><p className="text-xs text-gray-500 uppercase tracking-widest mt-3 font-black">Builds</p></div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-7 space-y-12 border-l-2 border-[#00E5FF]/20 ml-4 relative">
              {[ {i:"🎓", y:"2024 - Present", t:"Algonquin College", p:"Advanced Diploma in Computer Programming. Enterprise focus.", c:"#00E5FF"},
                 {i:"💻", y:"2021 - 2023", t:"Fraser International College", p:"Computer Science Pathway. Specialized expertise in algorithm design.", c:"#A855F7"}
              ].map((step, idx) => (
                <div key={idx} className="relative pl-12 group">
                  <div className={`absolute -left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(0,229,255,0.2)]`} style={{ borderColor: step.c }}>{step.i}</div>
                  <div className="bg-[#0A0A15]/80 backdrop-blur-xl border border-white/10 p-10 rounded-3xl transition-all hover:border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: step.c }}>{step.y}</span>
                    <h3 className="text-2xl font-bold text-white mt-4 tracking-tight">{step.t}</h3>
                    <p className="text-gray-400 text-base mt-4 font-light leading-relaxed">{step.p}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* COMPETENCIES (HOVER REACTIVE SKILLS) */}
        <section id="skills" className="max-w-7xl mx-auto px-10 py-32 w-full">
            <h2 className="text-7xl font-black text-white mb-16 tracking-tighter text-center uppercase">Core <span className="text-[#00E5FF]">Stacks.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CompCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"}]} />
                <CompCard title="Frontend Dev" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML5/CSS3",v:"95%"},{n:"Tailwind",v:"85%"}]} />
                <CompCard title="Backend & APIs" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"Express.js",v:"85%"},{n:"REST APIs",v:"90%"}]} />
                <CompCard title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"PostgreSQL",v:"75%"}]} />
                <CompCard title="Analytics" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"}]} />
                <CompCard title="DevOps" icon="☁️" skills={[{n:"Git / GitHub",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"}]} />
            </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="max-w-7xl mx-auto px-10 py-40 w-full">
            <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right uppercase">System <span className="text-[#FF8C00]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:2000px]">
                {projectsData.map((p, i) => (
                    <motion.div 
                        key={i} 
                        className="bg-[#0A0A15]/80 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/10 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden h-[450px] flex flex-col group cursor-pointer"
                        whileHover={{ y: -15, rotateX: -7, rotateY: 7, borderColor: `${p.color}50`, boxShadow: `0 30px 60px ${p.color}20` }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all duration-700" style={{ background: p.color }}></div>
                        <h3 className="text-3xl font-bold text-white mb-6 leading-tight tracking-tighter uppercase relative z-10">{p.title}</h3>
                        <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto relative z-10">{p.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-8 relative z-10">
                            {p.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] font-black border border-white/10 px-5 py-2 rounded-full uppercase text-gray-400 group-hover:text-white transition-colors">{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-10 py-40 flex flex-col items-center w-full">
            <h2 className="text-6xl font-black text-white mb-16 tracking-tighter text-center uppercase italic">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pointer-events-auto">
              {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focusing on progressive overload."},
                 {i:"🎮",t:"Logic",d:"Competitive strategy and hardware optimization."},
                 {i:"🌍",t:"Equilibrium",d:"Hiking and trail exploration to maintain technical focus."}
              ].map((h,x)=>(
                <div key={x} className="bg-[#0A0A15]/80 backdrop-blur-xl border border-white/10 p-14 rounded-[3rem] text-center hover:border-white/30 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.8)] group">
                  <div className="text-7xl mb-10 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110">{h.i}</div>
                  <h3 className="text-2xl font-black text-white mb-5 uppercase tracking-[0.3em]">{h.t}</h3>
                  <p className="text-gray-400 font-light leading-relaxed text-lg">{h.d}</p>
                </div>
              ))}
            </div>
        </section>

        <ReactiveFooter />

      </div>
    </div>
  );
}