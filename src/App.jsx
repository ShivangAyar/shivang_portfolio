import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, ContactShadows, Points, PointMaterial, Edges, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- THE ASSEMBLING BLUEPRINT CORE ---
function AssemblingBlueprint({ isHovered }) {
  const groupRef = useRef();
  const shardCount = 42;
  
  // Generate home positions (forming an icosahedron/sphere shape) and random start positions
  const shards = useMemo(() => {
    const temp = [];
    for (let i = 0; i < shardCount; i++) {
      // Final target positions (structured)
      const phi = Math.acos(-1 + (2 * i) / shardCount);
      const theta = Math.sqrt(shardCount * Math.PI) * phi;
      const targetPos = new THREE.Vector3().setFromSphericalCoords(3, phi, theta);
      const targetRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      // Random "floating" positions (chaos)
      const randomPos = new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      );
      const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      temp.push({ targetPos, targetRot, randomPos, randomRot, speed: 0.2 + Math.random() * 0.5 });
    }
    return temp;
  }, []);

  const shardRefs = useRef([]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    
    // Rotate the entire group slowly
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;

    shardRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      
      const s = shards[i];
      // Define target based on hover state
      const destPos = isHovered ? s.targetPos : s.randomPos;
      const destRot = isHovered ? s.targetRot : s.randomRot;

      // Lerp positions for smooth assembly/disassembly
      mesh.position.lerp(destPos, 0.04);
      mesh.quaternion.slerp(new THREE.Quaternion().setFromEuler(destRot), 0.04);

      // Add a tiny bit of "float" to the chaotic state
      if (!isHovered) {
        mesh.position.y += Math.sin(t * s.speed) * 0.005;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {shards.map((_, i) => (
        <mesh key={i} ref={(el) => (shardRefs.current[i] = el)}>
          <tetrahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial 
            color={isHovered ? "#00E5FF" : "#11111a"} 
            emissive={isHovered ? "#00E5FF" : "#FF8C00"}
            emissiveIntensity={isHovered ? 2 : 0.2}
            transparent
            opacity={isHovered ? 0.9 : 0.4}
          />
          <Edges color={isHovered ? "#fff" : "#00E5FF"} threshold={15} />
        </mesh>
      ))}
      
      {/* Inner constant heart */}
      <mesh scale={isHovered ? 0.8 : 0.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            color="#FF8C00" 
            emissive="#FF8C00" 
            emissiveIntensity={isHovered ? 3 : 0.5} 
            toneMapped={false} 
        />
      </mesh>
    </group>
  );
}

// --- AMBIENT NEURAL PARTICLES ---
function NeuralEnvironment({ count = 800 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = (Math.random() - 0.5) * 30;
      p[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return p;
  }, [count]);

  const pRef = useRef();
  useFrame(() => {
    pRef.current.rotation.y += 0.0004;
  });

  return (
    <Points ref={pRef} positions={points} stride={3}>
      <PointMaterial transparent color="#00E5FF" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.15} />
    </Points>
  );
}

const projects = [
  { title: "E-Commerce Microservices", desc: "Scaleable backend utilizing Docker, Stripe API, and JWT authentication.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist Web App", desc: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF8C00" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for document editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps Dashboard", desc: "Command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#EAB308" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI featuring user credits and async generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF8C00" }
];

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-transform duration-500 group-hover:scale-x-100 shadow-[0_0_10px_#00E5FF]" />
  </a>
);

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-[#010102] text-gray-200 antialiased selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth relative min-h-screen overflow-x-hidden">
      
      {/* 2D LIGHT TRACKER */}
      <div className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{ background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.05), transparent 85%)` }} />

      {/* 3D SCENE (FIXED BACKGROUND) */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas shadow={false}>
          <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={40} />
          <color attach="background" args={['#010102']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
          <AssemblingBlueprint isHovered={isHovered} />
          <NeuralEnvironment count={1200} />
          
          <Float speed={1.5}>
            <Text position={[-12, 8, -15]} scale={1.2} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf">
              ARCHITECTURE
              <meshStandardMaterial color="#11111a" emissive="#11111a" emissiveIntensity={0.5} transparent opacity={0.4} />
            </Text>
          </Float>
          <Float speed={1.5}>
            <Text position={[12, -8, -12]} scale={1} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf">
              FULL-STACK
              <meshStandardMaterial color="#11111a" emissive="#11111a" emissiveIntensity={0.5} transparent opacity={0.4} />
            </Text>
          </Float>

          <ContactShadows position={[0, -12, 0]} opacity={0.4} scale={50} blur={2} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* NAV */}
        <nav className="fixed top-0 w-full z-50 bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-10">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <div className="hidden md:flex gap-12">
            <NavLink href="#about">Journey</NavLink>
            <NavLink href="#skills">Competencies</NavLink>
            <NavLink href="#projects">Builds</NavLink>
            <NavLink href="#contact">Connect</NavLink>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-300 p-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg></button>
        </nav>

        {/* HERO */}
        <section 
          className="max-w-7xl mx-auto px-6 min-h-screen flex items-center relative w-full pt-20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start max-w-4xl z-40">
            <div className="mb-8 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase">Architecture & Logic</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black text-white mb-6 tracking-tighter leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l border-white/10 pl-8 leading-relaxed">Designing high-performance full-stack architectures and resilient digital systems.</p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <a href="#projects" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all duration-500">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-500">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-40 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-5">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-10 tracking-tighter">The <span className="text-[#00E5FF]">Mindset.</span></h2>
              <p className="text-gray-400 mb-8 text-xl font-light leading-relaxed">Born and raised in Zambia, now operating in Ottawa. My approach to engineering is objective: Build, Optimize, and Master.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A12]/40 border border-white/5 p-8 rounded-2xl text-center"><h3 className="text-4xl font-black text-white">3+</h3><p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2 font-black">Years</p></div>
                <div className="bg-[#0A0A12]/40 border border-white/5 p-8 rounded-2xl text-center"><h3 className="text-4xl font-black text-white">10+</h3><p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2 font-black">Builds</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-7 space-y-10">
              {[ {y:"2024 - Present", t:"Algonquin College", p:"Computer Programming & Analysis. Enterprise Logic."},
                 {y:"2021 - 2023", t:"Fraser International College", p:"Computer Science Pathway. Algorithmic foundations."}
              ].map((step, idx) => (
                <div key={idx} className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-10 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#00E5FF] to-transparent opacity-30" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{step.y}</span>
                  <h3 className="text-2xl font-bold text-white mt-4 tracking-tight">{step.t}</h3>
                  <p className="text-gray-400 text-base mt-4 font-light">{step.p}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* COMPETENCIES */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 w-full">
            <h2 className="text-6xl md:text-7xl font-black text-white mb-16 tracking-tighter">Core <span className="text-[#00E5FF]">Stacks.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[ { t: "Programming", i: "💻", s: ["Java", "Python", "JavaScript", "C#"] },
                   { t: "Frontend", i: "🖥️", s: ["React.js", "HTML5/CSS3", "Tailwind", "Next.js"] },
                   { t: "Backend", i: "⚙️", s: ["Node.js", "Express.js", "REST APIs", "WebSockets"] },
                   { t: "Databases", i: "🗄️", s: ["MongoDB", "MySQL", "PostgreSQL", "NoSQL"] },
                   { t: "Architecture", i: "📊", s: ["Power BI", "DAX", "Star Schema", "ETL"] },
                   { t: "DevOps", i: "☁️", s: ["GitHub", "AWS", "Docker", "CI/CD"] }
                ].map((card, idx) => (
                    <div key={idx} className="bg-[#0A0A12]/40 border border-white/5 p-10 rounded-3xl hover:border-[#00E5FF]/40 transition-all shadow-2xl group">
                        <h3 className="text-xl font-black text-white mb-8 tracking-tighter uppercase flex items-center gap-4">
                            <span className="opacity-50">{card.i}</span> {card.t}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {card.s.map((skill, i) => (
                                <span key={i} className="text-[10px] font-bold border border-white/10 px-4 py-2 rounded-full uppercase text-gray-400 group-hover:text-white transition-colors">{skill}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-40">
            <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right">System <span className="text-[#FF8C00]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:2000px]">
                {projects.map((p, i) => (
                    <motion.div 
                        key={i} 
                        className="bg-[#0A0A12]/40 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden h-[420px] flex flex-col group cursor-pointer"
                        whileHover={{ y: -10, rotateX: -5, rotateY: 5, borderColor: `${p.color}30` }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 group-hover:opacity-10 transition-all duration-700" style={{ background: p.color }}></div>
                        <h3 className="text-3xl font-bold text-white mb-6 leading-tight tracking-tighter">{p.title}</h3>
                        <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto">{p.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-8">
                            {p.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-black border border-white/10 px-4 py-1.5 rounded-full uppercase text-gray-500 group-hover:text-white group-hover:border-white/20 transition-all">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-6 py-40 flex flex-col items-center w-full">
            <h2 className="text-5xl font-black text-white mb-16 tracking-tighter text-center">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focusing on progressive overload."},
                 {i:"🎮",t:"Logic",d:"Competitive strategy and hardware optimization."},
                 {i:"🌍",t:"Equilibrium",d:"Hiking and trail exploration to maintain technical focus."}
              ].map((h,x)=>(
                <div key={x} className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-12 rounded-[2.5rem] text-center hover:border-white/20 transition-all shadow-2xl group">
                  <div className="text-7xl mb-8 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105">{h.i}</div>
                  <h3 className="text-xl font-black text-white mb-4 uppercase tracking-[0.3em]">{h.t}</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-lg">{h.d}</p>
                </div>
              ))}
            </div>
        </section>

        {/* TERMINAL FOOTER */}
        <footer id="contact" className="w-full py-60 flex items-center justify-center relative z-30">
          <div className="max-w-5xl mx-auto px-6 flex flex-col items-center w-full">
            <div className="bg-[#010102]/80 backdrop-blur-3xl border border-white/10 p-16 md:p-24 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center relative overflow-hidden group w-full">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" />
              <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready.</span></h2>
              <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
                <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]"></span></span>
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-green-400">System Connected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <a href="https://github.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500">GitHub</a>
                <a href="https://linkedin.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500">LinkedIn</a>
                <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all duration-500">Email</a>
              </div>
            </div>
            <p className="mt-32 text-center text-[11px] font-black tracking-[0.8em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. CRAFTED WITH INTENT.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}