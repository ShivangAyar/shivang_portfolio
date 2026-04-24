import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, ContactShadows, Edges, PerspectiveCamera, Environment, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';

// --- THE MECHANICAL SNAP CORE ---
function MechanicalCore({ isHovered, scrollY, isMobile }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4; // 4x4x4 = 64 high-poly cubes
  const count = gridSize ** 3;

  // Combine hover state and scroll state to control assembly (Pic 1 Logic)
  // At top (scrollY < 100), assemble on hover. When scrolled past hero, always disperse.
  const isActive = isMobile ? (scrollY < 150) : (isHovered && scrollY < 150);

  // Generate home positions (sphere shell) and random positions
  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          // Precise Target Grid Position
          const targetPos = new THREE.Vector3(
            x - (gridSize - 1) / 2,
            y - (gridSize - 1) / 2,
            z - (gridSize - 1) / 2
          ).multiplyScalar(1.05);

          // Chaotic Start Position (Dispersed Void)
          const randomPos = new THREE.Vector3(
            (Math.random() - 0.5) * (isMobile ? 30 : 50),
            (Math.random() - 0.5) * (isMobile ? 30 : 50),
            (Math.random() - 0.5) * 20
          );
          
          const randomRot = new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );

          temp.push({ targetPos, randomPos, randomRot, index: i++ });
        }
      }
    }
    return temp;
  }, [isMobile]);

  const dummy = new THREE.Object3D();
  // Animation refs to avoid re-renders
  const currentPositions = useMemo(() => cubeData.map(d => d.randomPos.clone()), [cubeData]);
  const currentRotations = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), [cubeData]);

  const words = useMemo(() => [
    { text: "SHIVANG", offset: [0, 4.5, 0], p: 0.1 },
    { text: "ARCHITECTURE", offset: [6, 0, 0], p: 0.5 },
    { text: "MERN STACK", offset: [-6, 0, 0], p: 0.8 },
    { text: "FULL-STACK", offset: [0, -4.5, 0], p: 1.2 }
  ], []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    // Rotation speeds up on assembly
    groupRef.current.rotation.y += delta * (isActive ? 0.3 : 0.1);
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;

    cubeData.forEach((data, i) => {
      const targetP = isActive ? data.targetPos : data.randomPos;
      const targetR = isActive ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);

      // Smooth mechanical snapping animation
      currentPositions[i].lerp(targetP, 0.08);
      currentRotations[i].slerp(targetR, 0.08);

      dummy.position.copy(currentPositions[i]);
      // Subtle float drift in dispersed mode
      if (!isActive) {
        dummy.position.y += Math.sin(t + i) * 0.01;
      }
      dummy.quaternion.copy(currentRotations[i]);
      
      // Scale pulse on assembly
      const s = isActive ? 1.0 : 0.7;
      dummy.scale.set(s, s, s);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[isMobile ? 0 : 2, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial 
          color={isActive ? "#020202" : "#050505"} 
          roughness={0.1} 
          metalness={1} 
        />
      </instancedMesh>

      {/* PIC 1 FIX: Internal Point Light - Intense Amber Glow illuminates the core */}
      <pointLight position={[0,0,0]} intensity={1.5} color="#FF8C00" distance={10} />

      {words.map((w, i) => (
        <FloatingHUDText key={i} text={w.text} isActive={isActive} offset={w.offset} phase={w.p} />
      ))}
    </group>
  );
}

function FloatingHUDText({ text, isActive, offset, phase }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
        // Simple drift offset when dispersed
        const driftX = Math.sin(t * 0.5 + phase) * (isActive ? 1 : 12);
        const driftY = Math.cos(t * 0.5 + phase) * (isActive ? 1 : 10);
        ref.current.position.lerp(new THREE.Vector3(offset[0] + driftX, offset[1] + driftY, isActive ? 0 : -5), 0.05);
        ref.current.lookAt(state.camera.position);
    }
  });
  return (
    <Text
      ref={ref}
      fontSize={0.5}
      font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      color="white"
      emissive={isActive ? "#00E5FF" : "#11111a"}
      emissiveIntensity={isActive ? 3 : 0.5}
      transparent
      opacity={isActive ? 1 : 0.3}
    >
      {text}
    </Text>
  );
}

// --- CURSOR VOID LIGHT (Fixes Pic 1 Darkness) ---
function CursorLight() {
  const lightRef = useRef();
  const { viewport } = useThree();
  useFrame((state) => {
    const x = (state.pointer.x * viewport.width) / 2;
    const y = (state.pointer.y * viewport.height) / 2;
    lightRef.current.position.set(x, y, 5);
  });
  return <pointLight ref={lightRef} intensity={5} color="#00E5FF" distance={30} />;
}

// --- DASHBOARD UI COMPONENTS (Restored with PIC 2/3 Fixes) ---
const NavLink = ({ href, children, isActive }) => (
    <a href={href} className={`group relative py-2 text-[10px] font-black tracking-[0.3em] uppercase transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
        {children}
        {isActive && (
            // PIC 2 FIX: Animated Shared Layout Line for perfect slider active states
            <motion.span layoutId="nav-active" className="absolute bottom-0 left-0 h-[2px] w-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
        )}
        <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-transform duration-500 group-hover:scale-x-100" />
    </a>
);

const CompetencyCard = ({ title, icon, skills }) => (
  <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-700 shadow-2xl group flex flex-col h-[380px]">
    <h3 className="text-xl font-bold text-white mb-10 tracking-widest uppercase flex items-center gap-4">
      {/* PIC 2 FIX: Emojis are clear and colorful */}
      <span className="text-3xl filter-none opacity-100">{icon}</span> {title}
    </h3>
    <div className="space-y-8 mt-auto">
      {skills.map((s, i) => (
        <div key={i}>
          <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-widest">
            <span>{s.n}</span><span className="text-white">{s.v}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-[3px] overflow-hidden">
            {/* PIC 2 FIX: Sliders are colorful (Cyan -> Amber theme based) */}
            <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-all duration-1000 w-0 group-hover:w-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" style={{ maxWidth: s.v }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const journeyData = [
  { year: "2024 - Present", title: "Algonquin College | Ottawa", desc: "Specialized in MERN stack development and cloud microservices (Docker/AWS). Focusing on system architecting and scalable solution design.", icon: "🎓", color: "#00E5FF" },
  { year: "2021 - 2023", title: "Fraser International College | BC", desc: "Advanced pathways in Computer Science. Specialized expertise in algorithmic problem solving, data structures, and foundational object-oriented programming (OOP) in Java.", icon: "💻", color: "#A855F7" }
];

const projects = [
  { title: "Microservices Platform", desc: "Highly scalable backend utilizing Docker containers and JWT auth.", tags: ["Node.js", "Docker", "Stripe API"], color: "#00E5FF" },
  { title: "RESTful Media Tracker", desc: "Full-stack application for tracking user media via RESTful APIs.", tags: ["Express.js", "NoSQL", "JWT"], color: "#FF8C00" },
  { title: "Real-Time Collaboration", desc: "Live-syncing workspace environment using WebSockets and Next.js.", tags: ["Socket.io", "Redis", "Web RTC"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs.", tags: ["OpenAI", "WebRTC", "MERN Stack"], color: "#00E5FF" },
  { title: "GitHub DevOps CI/CD", desc: "Centralized command center for GitHub Actions and metrics.", tags: ["Python", "AWS EC2", "DAX ETL"], color: "#FF8C00" },
  { title: "AI Image SaaS Generator", desc: "SaaS wrap featuring user credits and async image generation.", tags: ["React", "OpenAI API", "MERN Stack"], color: "#A855F7" }
];

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => {
        setScrollY(window.scrollY);
        // Navbar Active Section Observer
        const sections = ["about", "skills", "projects", "contact"];
        for(const id of sections) {
            const el = document.getElementById(id);
            if(el && el.getBoundingClientRect().top < 100) {
                setActiveSection(id);
            }
        }
    };
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="bg-[#010102] text-gray-200 antialiased selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth relative min-h-screen overflow-x-hidden">
      
      {/* PIC 1 FIX: Global 2D VOID LIGHT Tracker illuminates the whole background */}
      <div className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{ background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.06), transparent 85%)` }} />

      {/* 3D SCENE */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas dpr={[1, 2]}>
          {/* PIC 1 FIX: Position pulled back, internal lighting fixed, hover/scroll dispersal locked */}
          <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 22 : 16]} fov={isMobile ? 70 : 40} />
          <color attach="background" args={['#010102']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[mousePos.x / 100, -mousePos.y / 100, 10]} intensity={1.5} color="#00E5FF" />
          <Environment preset="night" />
          <MechanicalCore isHovered={isHovered} scrollY={scrollY} isMobile={isMobile} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col px-6 md:px-16">
        
        {/* NAVBAR */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-10 md:px-20">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <div className="hidden md:flex gap-12">
            <NavLink href="#about" isActive={activeSection === "about"}>Journey</NavLink>
            <NavLink href="#skills" isActive={activeSection === "skills"}>Stacks</NavLink>
            <NavLink href="#projects" isActive={activeSection === "projects"}>Builds</NavLink>
            <NavLink href="#contact" isActive={activeSection === "contact"}>Connect</NavLink>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white p-2 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#010102] flex flex-col items-center justify-center gap-10 backdrop-blur-3xl">
              <NavLink href="#about" onClick={()=>setIsMenuOpen(false)}>Journey</NavLink>
              <NavLink href="#skills" onClick={()=>setIsMenuOpen(false)}>Stacks</NavLink>
              <NavLink href="#projects" onClick={()=>setIsMenuOpen(false)}>Builds</NavLink>
              <NavLink href="#contact" onClick={()=>setIsMenuOpen(false)}>Connect</NavLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center relative w-full pt-20" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start max-w-4xl z-40">
            <div className="mb-8 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase">MERN Architecture Void</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9.5rem] font-black text-white mb-6 tracking-tighter leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l border-white/10 pl-8 leading-relaxed">Designing high-performance full-stack architectures and resilient digital systems.</p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <a href="#projects" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all duration-500 shadow-xl">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-500">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY (PIC 3 Fixes) */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-40 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-5">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-10 tracking-tighter leading-tight">Objective <br/>Driven <span className="text-[#00E5FF]">Mastery.</span></h2>
              <p className="text-gray-400 mb-8 text-xl font-light leading-relaxed">Born and raised in Zambia, operating in Ottawa. Mastering software discipline through structured system architecting.</p>
              <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="bg-[#0A0A12]/60 border border-white/5 p-8 rounded-2xl text-center"><h3 className="text-4xl font-black text-white">3+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-black">Years</p></div>
                <div className="bg-[#0A0A12]/60 border border-white/5 p-8 rounded-2xl text-center"><h3 className="text-4xl font-black text-white">10+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-black">Builds</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-7 space-y-10 border-l border-white/5 pl-10 relative">
              {journeyData.map((step, idx) => (
                <div key={idx} className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-10 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#00E5FF] to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />
                  <span className="text-3xl absolute top-0 right-0 p-8 filter-none opacity-20">{step.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{step.year}</span>
                  {/* PIC 3 FIX: Text colors are correct - white title, gray desc */}
                  <h3 className="text-2xl md:text-3xl font-black text-white mt-4 tracking-tight" style={{color: step.color}}>{step.title}</h3>
                  <p className="text-gray-400 text-lg mt-4 font-light leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CORE COMPETENCIES (RESTORED PIC 2/3) */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 w-full">
            <h2 className="text-6xl md:text-7xl font-black text-white mb-16 tracking-tighter">Technical <span className="text-[#00E5FF]">Stacks.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CompetencyCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JavaScript",v:"85%"},{n:"C#",v:"70%"}]} />
                <CompetencyCard title="Frontend Dev" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML5/CSS3",v:"95%"},{n:"Tailwind",v:"85%"},{n:"Next.js",v:"80%"}]} />
                <CompetencyCard title="Backend & APIs" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"Express.js",v:"85%"},{n:"REST APIs",v:"90%"},{n:"WebSockets",v:"75%"}]} />
                <CompetencyCard title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"PostgreSQL",v:"75%"},{n:"NoSQL",v:"85%"}]} />
                <CompetencyCard title="Data Arch" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"},{n:"ETL",v:"80%"}]} />
                <CompetencyCard title="Cloud & DevOps" icon="☁️" skills={[{n:"Git / GitHub",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"},{n:"CI/CD",v:"85%"}]} />
            </div>
        </section>

        {/* PROJECTS (RESTORED) */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-40">
            <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right leading-none">System <br/><span className="text-[#FF8C00]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:2000px]">
                {projects.map((p, i) => (
                    <motion.div key={i} className="bg-[#0A0A12]/40 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden h-[420px] flex flex-col group cursor-pointer"
                        whileHover={{ y: -15, rotateX: -7, rotateY: 7, borderColor: `${p.color}20`, boxShadow: `0 30px 60px ${p.color}10` }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all duration-700" style={{ background: p.color }}></div>
                        <h3 className="text-3xl font-bold text-white mb-6 leading-tight tracking-tighter">{p.title}</h3>
                        <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto">{p.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-8">
                            {p.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-black border border-white/10 px-4 py-1.5 rounded-full uppercase text-gray-500 group-hover:text-white transition-colors">{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* OFFLINE PROTOCOL (PIC 2/3 FIX) */}
        <section className="max-w-7xl mx-auto px-6 py-40 flex flex-col items-center w-full">
            <h2 className="text-5xl font-black text-white mb-16 tracking-tighter italic">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day splits focusing on heavy compound progressive overload."},
                 {i:"🎮",t:"Logic",d:"Strategy based gaming and PC architecture tuning."},
                 {i:"🌍",t:"Equilibrium",d:"Hiking unfamiliar trails to reset the digital buffer."}
              ].map((h,x)=>(
                // PIC 2 FIX: Emojis are colorful
                <div key={x} className="bg-[#0A0A12]/60 border border-white/5 p-12 rounded-[2.5rem] text-center hover:border-white/20 transition-all shadow-2xl group pointer-events-auto">
                  <div className="text-7xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-20 group-hover:opacity-100">{h.i}</div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest">{h.t}</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-lg">{h.d}</p>
                </div>
              ))}
            </div>
        </section>

        {/* CONTACT ("TERMINAL READY") - FIXED VISIBILITY & ALIGNMENT */}
        <section id="contact" className="w-full py-60 flex items-center justify-center relative px-6 md:px-0">
          <div className="max-w-5xl w-full bg-[#030305] border border-[#00E5FF]/20 p-16 md:p-24 rounded-[4rem] shadow-[0_0_80px_rgba(0,229,255,0.1)] text-center relative overflow-hidden group">
            {/* Command Accents - Only visible on desktop, hidden on mobile for alignment */}
            <div className="absolute top-0 left-0 p-8 text-[8px] font-mono text-gray-700 text-left uppercase hidden md:block leading-relaxed">System_Ready: true<br/>User_Auth: true<br/>Location: Ottawa_CA</div>
            <div className="absolute top-0 right-0 p-8 text-[8px] font-mono text-gray-700 text-right uppercase hidden md:block leading-relaxed">Latency: 12ms<br/>Encryption: AES-256<br/>Status: Scanning...</div>
            
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00] shadow-[0_0_20px_#00E5FF]" />
            
            {/* PIC 2 FIX: Terminal Ready is centered on mobile and visible */}
            <h2 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter leading-[0.9]">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2>
            
            <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
              <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]"></span></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-green-400">Secure Protocol Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
              <a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all hover:-translate-y-2 duration-500">GitHub</a>
              <a href="https://www.linkedin.com/in/shivangayar/" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all hover:-translate-y-2 duration-500">LinkedIn</a>
              <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all hover:-translate-y-2 duration-500">Email</a>
            </div>
            
            <p className="mt-32 text-[11px] font-black tracking-[1em] text-gray-800 uppercase">© 2026 SHIVANG AYAR. CRAFTED WITH INTENT.</p>
          </div>
        </footer>

      </div>

      <style>{`
        /* Picard Scanline Animation */
        @keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(500%); } }
        .animate-scanline { animation: scanline 3s linear infinite; }
      `}</style>
    </div>
  );
}