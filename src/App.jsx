import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';

// --- THE MECHANICAL SNAP CORE ---
function MechanicalCore({ isHovered, scrollY, isMobile }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = Math.pow(gridSize, 3);

  // LOGIC: Assemble ONLY at top. Desktop needs hover. Mobile auto-assembles at top.
  const isAssembled = isMobile ? (scrollY < 120) : (isHovered && scrollY < 120);

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3(
            (Math.random() - 0.5) * (isMobile ? 30 : 60),
            (Math.random() - 0.5) * (isMobile ? 30 : 60),
            (Math.random() - 0.5) * 25
          );
          const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          temp.push({ targetPos, randomPos, randomRot, index: i++ });
        }
      }
    }
    return temp;
  }, [isMobile]);

  const dummy = new THREE.Object3D();
  const currentPositions = useMemo(() => cubeData.map(d => d.randomPos.clone()), [cubeData]);
  const currentRotations = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), [cubeData]);

  const words = useMemo(() => [
    { text: "SHIVANG", offset: [0, 5, 0], p: 0.1 },
    { text: "ARCHITECTURE", offset: [7.5, 0, 0], p: 0.5 },
    { text: "MERN STACK", offset: [-7.5, -2, 0], p: 0.9 },
    { text: "FULL-STACK", offset: [0, -5, 0], p: 1.3 }
  ], []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isAssembled ? 0.25 : 0.02); // Slow drift
    
    cubeData.forEach((data, i) => {
      const targetP = isAssembled ? data.targetPos : data.randomPos;
      const targetR = isAssembled ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      
      currentPositions[i].lerp(targetP, isAssembled ? 0.1 : 0.012); // Slow dispersal
      currentRotations[i].slerp(targetR, isAssembled ? 0.1 : 0.012);
      
      dummy.position.copy(currentPositions[i]);
      if (!isAssembled) dummy.position.y += Math.sin(t + i) * 0.01;
      dummy.quaternion.copy(currentRotations[i]);
      dummy.scale.setScalar(isAssembled ? 1 : 0.6);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[isMobile ? 0 : 3.5, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        {/* PIC 2 FIX: Cube material updated to a more visible metallic teal when dispersed */}
        <meshStandardMaterial color={isAssembled ? "#00E5FF" : "#021a1a"} metalness={1} roughness={0.1} />
      </instancedMesh>
      {isAssembled && <pointLight intensity={10} color="#FF8C00" distance={10} />}
      {words.map((w, i) => (
        <FloatingHUDText key={i} text={w.text} offset={w.offset} isAssembled={isAssembled} p={w.p} />
      ))}
    </group>
  );
}

function FloatingHUDText({ text, offset, isAssembled, p }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
        // Natural Slow Drift Engine
        const driftX = Math.sin(t * 0.2 + p) * (isAssembled ? 0.6 : 18);
        const driftY = Math.cos(t * 0.2 + p) * (isAssembled ? 0.6 : 14);
        ref.current.position.lerp(new THREE.Vector3(offset[0] + driftX, offset[1] + driftY, isAssembled ? 0 : -10), 0.03);
        ref.current.lookAt(state.camera.position);
    }
  });
  return (
    <Text ref={ref} fontSize={0.65} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" color="#00E5FF" emissive="#00E5FF" emissiveIntensity={isAssembled ? 5 : 0.1} transparent opacity={isAssembled ? 1 : 0.2}>
      {text}
    </Text>
  );
}

// --- DUAL-MODE REACTIVE COMPETENCY CARD ---
const CompetencyCard = ({ title, icon, skills, isMobile }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isHovered, setIsHovered] = useState(false);

  // Logic: Mobile triggers on scroll. Laptop triggers on hover.
  const active = isMobile ? isInView : isHovered;

  return (
    <div 
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#0A0A12]/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-700 shadow-2xl group flex flex-col h-[420px]"
    >
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-black text-white tracking-[0.3em] uppercase">{title}</h3>
        <span className="text-3xl filter-none grayscale-0">{icon}</span>
      </div>
      <div className="space-y-10 mt-auto">
        {skills.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-widest transition-colors duration-500" style={{ color: active ? 'white' : '' }}>
              <span>{s.n}</span><span style={{ color: active ? '#00E5FF' : '' }}>{s.v}</span>
            </div>
            <div className="flex gap-2 h-[5px] overflow-hidden bg-white/5 rounded-full">
              {[...Array(12)].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ backgroundColor: "#1A1A24" }}
                  animate={active ? { backgroundColor: idx * (100/12) < parseInt(s.v) ? "#00E5FF" : "#1A1A24" } : { backgroundColor: "#1A1A24" }}
                  transition={{ delay: active ? (idx * 0.05 + i * 0.1) : 0, duration: 0.3 }}
                  className="flex-1 rounded-sm"
                  style={{ backgroundImage: active && idx * (100/12) < parseInt(s.v) ? 'linear-gradient(to right, #00E5FF, #FF8C00)' : 'none', boxShadow: active && idx * (100/12) < parseInt(s.v) ? '0 0 10px rgba(0,229,255,0.4)' : 'none' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("Journey");

  useEffect(() => {
    // Breakpoint calibration set to professional level
    const checkRes = () => setIsMobile(window.innerWidth < 1024);
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    checkRes();
    window.addEventListener('resize', checkRes);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkRes);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="bg-[#010102] text-gray-200 antialiased selection:bg-[#00E5FF] font-sans scroll-smooth relative min-h-screen overflow-x-hidden">
      
      {/* 2D LIGHT TRACKER */}
      {!isMobile && (
        <div className="pointer-events-none fixed inset-0 z-20" style={{ background: `radial-gradient(850px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.05), transparent 85%)` }} />
      )}

      {/* PIC 1 FIX: NATURAL VOID ORDER - Scene is the background layer (Z-0) */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none" style={{ touchAction: 'none' }}>
        <Canvas dpr={[1, 2]}>
          {/* Mobile Zoom Calibration Set */}
          <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 26 : 18]} fov={isMobile ? 75 : 45} />
          <ambientLight intensity={0.5} />
          <Environment preset="night" />
          <MechanicalCore isHovered={isHovered} scrollY={scrollY} isMobile={isMobile} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={50} blur={2.5} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      {/* PIC 1 FIX: FOREGROUND CONTENT - Natural stacking (Relative void, content container follows) */}
      <div className="relative w-full flex flex-col px-6 md:px-16 pointer-events-auto overflow-y-auto">
        
        {/* NAVBAR */}
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-10 md:px-20">
          <div className="text-xl md:text-2xl font-black text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>SHIVANG<span className="text-[#00E5FF]">.</span></div>
          <div className="hidden md:flex gap-12 relative">
            {["Journey", "Stacks", "Builds", "Offline", "Connect"].map((t) => (
                <a key={t} href={`#${t.toLowerCase()}`} onClick={() => setActiveTab(t)} className="relative py-2 text-[10px] font-black tracking-[0.3em] uppercase text-gray-500 hover:text-white transition-colors">
                    {t}
                    {activeTab === t && (
                        // Cyan to Orange Shadow Slider (Pic 2 Fix)
                        <motion.div layoutId="nav-slider" className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] shadow-[0_0_15px_#00E5FF]" />
                    )}
                </a>
            ))}
          </div>
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-[#00E5FF] p-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 z-[200] bg-[#010102] flex flex-col items-center justify-center gap-12 pointer-events-auto">
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-[#00E5FF]"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
              {["Journey", "Stacks", "Builds", "Offline", "Connect"].map(t => <a key={t} href={`#${t.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-3xl font-black tracking-widest">{t}</a>)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center relative w-full pt-20" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start max-w-4xl z-40Hero">
            <div className="mb-6 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase">Architecture & Logic Void</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9.5rem] font-black text-white mb-4 tracking-tighter leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l-2 border-[#FF8C00] pl-8 leading-relaxed">Designing high-performance full-stack architectures and resilient digital systems.</p>
            <div className="flex gap-6 pointer-events-auto">
              <a href="#builds" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* JOURNEY - VERTICAL SPLIT CALENDAR (Pic 3 Fix) */}
        <section id="journey" className="max-w-7xl mx-auto px-6 py-40 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-40">
              <h2 className="text-6xl font-black text-white mb-10 tracking-tighter uppercase leading-none">The <br/><span className="text-[#00E5FF]">Timeline.</span></h2>
              <p className="text-gray-400 text-xl font-light leading-relaxed">My engineering journey across the globe—mastering software architecture one build at a time.</p>
            </div>
            <div className="lg:col-span-7 space-y-12 border-l-2 border-[#00E5FF]/20 ml-4 relative">
              <div className="relative pl-12 group">
                <div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]" />
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 transition-all hover:border-[#00E5FF]/30">
                  <span className="text-[10px] font-black tracking-[0.4em] text-gray-500">2024 - PRESENT</span>
                  <h3 className="text-3xl font-black text-white mt-4">Algonquin College | Ottawa</h3>
                  <p className="text-gray-400 text-lg mt-6 font-light leading-relaxed">Advanced Diploma in Computer Programming. Enterprise Java architectures, MERN stack ecosystems, and scalable cloud logic using Docker and AWS infrastructure.</p>
                </div>
              </div>
              <div className="relative pl-12 group">
                <div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full bg-purple-500 shadow-[0_0_15px_#A855F7]" />
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 transition-all hover:border-purple-500/30">
                  <span className="text-[10px] font-black tracking-[0.4em] text-gray-500">2021 - 2023</span>
                  <h3 className="text-3xl font-black text-white mt-4">Fraser International College | BC</h3>
                  <p className="text-gray-400 text-lg mt-6 font-light leading-relaxed">Computer Science Pathway. Foundational deep-dive into Big O efficiency, data structure optimization, and the core principles of OOP logic.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STACKS (Pic 2 Fixes) */}
        <section id="stacks" className="max-w-7xl mx-auto px-6 py-20 w-full">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-24 tracking-tighter text-center uppercase">Technical <span className="text-[#00E5FF]">Arsenal.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <CompetencyCard isMobile={isMobile} title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JavaScript",v:"85%"},{n:"C#",v:"70%"}]} />
            <CompetencyCard isMobile={isMobile} title="Frontend" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML5/CSS3",v:"95%"},{n:"Tailwind",v:"85%"},{n:"Next.js",v:"80%"}]} />
            <CompetencyCard isMobile={isMobile} title="Backend" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"Express.js",v:"85%"},{n:"REST APIs",v:"90%"},{n:"WebSockets",v:"75%"}]} />
            <CompetencyCard isMobile={isMobile} title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"PostgreSQL",v:"75%"},{n:"NoSQL",v:"85%"}]} />
            <CompetencyCard isMobile={isMobile} title="Analytics" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"},{n:"ETL",v:"80%"}]} />
            <CompetencyCard isMobile={isMobile} title="DevOps" icon="☁️" skills={[{n:"GitHub",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"},{n:"CI/CD",v:"85%"}]} />
          </div>
        </section>

        {/* BUILDS - EXPANDED DESCRIPTIONS (Pic 3 Fixes) */}
        <section id="builds" className="max-w-7xl mx-auto px-6 py-40">
          <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right uppercase">System <span className="text-[#FF8C00]">Builds.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: "E-Commerce Microservices", d: "Architected a scalable microservices ecosystem using Node.js and Docker. Integrated Stripe API for secure payment processing and implemented JWT-based authentication for user security.", t: ["Node.js", "Docker", "Stripe"] },
              { title: "Movie Watchlist App", d: "Engineered a full-stack media tracking application using the MERN stack. Designed a robust RESTful API to manage user watchlists and utilized MongoDB's NoSQL architecture for high-speed retrieval.", t: ["MongoDB", "Express", "Node"] },
              { title: "Real-Time Collaboration", d: "Developed a synchronized workspace using Socket.io and Next.js. Implemented real-time document editing and instant messaging through WebSockets, backed by a performance Redis caching layer.", t: ["Socket.io", "Next.js", "Redis"] },
              { title: "Voice AI Chatbot", d: "Built an advanced AI chatbot with integrated emotion recognition logic. Leveraged OpenAI's GPT models and WebRTC for low-latency voice communication and immersive user experience.", t: ["React", "OpenAI", "WebRTC"] },
              { title: "DevOps Metrics Hub", d: "Constructed a monitoring platform for GitHub Actions and AWS infrastructure. Developed an automated ETL pipeline using Python to summarize and visualize deployment metrics on a custom Power BI dashboard.", t: ["AWS", "Python", "GitHub"] },
              { title: "AI SaaS Generator", d: "Launched a SaaS platform for asynchronous AI image generation. Built with React and Tailwind CSS, featuring a credit-based user system and multi-modal API integration with OpenAI.", t: ["Tailwind", "React", "DALL-E"] }
            ].map((p, i) => (
              <motion.div key={i} whileHover={!isMobile ? { y: -15 } : {}} className="bg-[#0A0A12]/40 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden h-[520px] flex flex-col group cursor-pointer shadow-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00E5FF]/20 m-8 group-hover:border-[#00E5FF] transition-all" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF8C00]/20 m-8 group-hover:border-[#FF8C00] transition-all" />
                <h3 className="text-3xl font-black text-white mb-8 tracking-tight leading-tight uppercase">{p.title}</h3>
                <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto">{p.d}</p>
                <div className="flex flex-wrap gap-2 mt-10">
                  {p.t.map(tag => <span key={tag} className="text-[9px] font-black border border-white/10 px-4 py-1.5 rounded-full uppercase text-gray-500 group-hover:text-white group-hover:border-[#00E5FF]/50 transition-all">{tag}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* OFFLINE PROTOCOL (Hobbies Section Back - Pic 3 Fix) */}
        <section id="offline" className="max-w-7xl mx-auto px-10 py-40 w-full text-center">
            <h2 className="text-6xl font-black text-white mb-20 tracking-tighter uppercase italic">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[ {i:"🏋️‍♂️",t:"Iron & Discipline",d:"6-day compound split focus, applying progressive overload to software mastery."},
                 {i:"🎮",t:"Logic & Strategy",d:"Hardware tuning and competitive tactical shooters. Performance optimization is constant."},
                 {i:"🌍",t:"Nature Equilibrium",d:"Hiking and exploration of unfamiliar terrain to reset the digital buffer."}
              ].map((h,x)=>(
                <motion.div key={x} initial={{scale:0.95, opacity: 0}} whileInView={{scale:1, opacity: 1}} transition={{duration: 0.5}} className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 hover:border-[#FF8C00]/40 transition-all duration-500 group shadow-2xl">
                  <div className="text-7xl mb-10 filter-none opacity-100 group-hover:scale-110 transition-transform duration-500">{h.i}</div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">{h.t}</h3>
                  <p className="text-gray-500 text-lg mt-6 font-light leading-relaxed">{h.d}</p>
                </motion.div>
              ))}
            </div>
        </section>

        {/* COMMAND CENTER FOOTER (Alignments Fixed) */}
        <footer id="connect" className="w-full py-60 flex items-center justify-center">
          <div className="max-w-6xl w-full bg-[#020203] border-2 border-[#00E5FF]/40 p-16 md:p-24 rounded-[5rem] shadow-[0_0_120px_rgba(0,229,255,0.15)] text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-12 text-[8px] font-mono text-gray-700 text-left uppercase hidden md:block leading-loose opacity-40">System_Ready: true<br/>User_Auth: true<br/>Location: Ottawa_CA</div>
            <div className="absolute top-0 right-0 p-12 text-[8px] font-mono text-gray-700 text-right uppercase hidden md:block leading-loose opacity-40">Latency: 12ms<br/>Encryption: AES-256<br/>Status: Active</div>
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" />
            <h2 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2>
            <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
              <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]" /></span>
              <span className="text-[10px] font-black tracking-[0.5em] uppercase text-green-400">Secure Protocol Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-50">
              <a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all">GitHub</a>
              <a href="https://linkedin.com/in/shivangayar/" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all">LinkedIn</a>
              <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all">Email</a>
            </div>
            <p className="mt-40 text-[10px] font-black tracking-[1.5em] text-gray-800 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}