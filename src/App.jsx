import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- REACTIVE CURSOR LIGHT (3D) ---
function CursorLight() {
  const lightRef = useRef();
  useFrame((state) => {
    const x = (state.pointer.x * state.viewport.width) / 2;
    const y = (state.pointer.y * state.viewport.height) / 2;
    lightRef.current.position.lerp(new THREE.Vector3(x, y, 2), 0.1);
  });
  return <pointLight ref={lightRef} intensity={15} color="#00E5FF" distance={25} />;
}

// --- 3D INTERACTIVE GLOW TEXT ---
function FloatingWord({ children, position, rotation, scale = 1, color = "#00E5FF" }) {
  const textRef = useRef();
  useFrame((state) => {
    textRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.003;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
      <Text
        ref={textRef} position={position} rotation={rotation} scale={scale}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        letterSpacing={0.15}
      >
        {children}
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.6} 
          toneMapped={false} 
          roughness={0}
        />
      </Text>
    </Float>
  );
}

// --- CENTRAL REACTIVE GEOMETRY ---
function CentralReactiveShape() {
  const meshRef = useRef();
  const wireframeRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.05;
    meshRef.current.rotation.y += delta * 0.1;
    wireframeRef.current.rotation.x -= delta * 0.05;
    wireframeRef.current.rotation.y -= delta * 0.08;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, state.pointer.x * 0.8, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, state.pointer.y * 0.8, 0.05);
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={2.4} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#0A0A10" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh ref={wireframeRef} position={[0, 0, 0]} scale={2.6}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#00E5FF" wireframe={true} transparent opacity={0.04} />
      </mesh>
    </Float>
  );
}

const projects = [
  { title: "E-Commerce Microservices", desc: "Highly scalable backend utilizing Docker containers, integrating Stripe API and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist Web App", desc: "Full-stack application for tracking user media via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF3366" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time document editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs with a high-performance backend.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Centralized command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#EAB308" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI API featuring user credits and asynchronous generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF3366" }
];

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF3366] transition-transform duration-500 ease-out group-hover:scale-x-100" />
  </a>
);

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-[#030305] text-gray-200 antialiased selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth relative min-h-screen overflow-x-hidden">
      
      {/* --- LAYER 0: HTML DOM SPOTLIGHT (RESTORED) --- */}
      <div 
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.07), transparent 80%)`
        }}
      />

      {/* --- LAYER 1: 3D BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }} shadows>
          <color attach="background" args={['#030305']} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, -5]} intensity={0.6} color="#FF3366" />
          <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#00E5FF" />
          <CursorLight />
          <Environment preset="night" />
          <CentralReactiveShape />
          
          {/* Enhanced Visibility Floating Words */}
          <FloatingWord position={[-7, 4, -5]} rotation={[0, 0.2, 0]} scale={1.4} color="#11111a">ARCHITECTURE</FloatingWord>
          <FloatingWord position={[7, 5, -8]} rotation={[0, -0.3, 0]} scale={1.1} color="#11111a">ENGINEERING</FloatingWord>
          <FloatingWord position={[0, -6, -10]} rotation={[-0.2, 0, 0]} scale={2.5} color="#11111a">SHIVANG</FloatingWord>

          <ContactShadows position={[0, -5, 0]} opacity={0.8} scale={25} blur={2.5} far={5} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full z-50 bg-[#030305]/40 backdrop-blur-xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-6">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <div className="hidden md:flex gap-10">
            <NavLink href="#about">Journey</NavLink>
            <NavLink href="#skills">Competencies</NavLink>
            <NavLink href="#projects">Builds</NavLink>
            <NavLink href="#contact">Connect</NavLink>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-300 p-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg></button>
        </nav>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center pointer-events-none relative w-full pt-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start pointer-events-auto max-w-3xl">
            <h1 className="text-6xl sm:text-7xl md:text-[8.5rem] font-black text-white mb-4 tracking-tighter leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF3366]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-10 leading-relaxed font-light max-w-2xl">Full-Stack Architect specializing in high-performance digital systems and precision backends.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href="#projects" className="bg-[#00E5FF] text-black px-10 py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white transition-all duration-500 shadow-[0_0_20px_rgba(0,229,255,0.3)]">Execute builds</a>
              <a href="/resume.pdf" target="_blank" className="bg-transparent border border-white/20 text-white px-10 py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">Get Resume</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-32 pointer-events-none w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pointer-events-auto">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5 flex flex-col justify-center">
              <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed font-light">Born and raised in Zambia, I brought my drive across the globe to engineer high-performance software in Canada. Currently based in Ottawa, pushing boundaries.</p>
              <div className="flex gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 w-1/2 rounded-2xl text-center shadow-xl"><h3 className="text-4xl font-black text-[#00E5FF]">3+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">Years Coding</p></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 w-1/2 rounded-2xl text-center shadow-xl"><h3 className="text-4xl font-black text-[#FF3366]">10+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-bold">System Builds</p></div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7 space-y-12 border-l-2 border-white/5 ml-4 relative">
              {[ {i:"🎓", y:"2024 - Present", t:"Algonquin College | Ottawa", p:"Advanced Diploma in Computer Programming & Analysis. Systems focus."},
                 {i:"💻", y:"2021 - 2023", t:"Fraser International College | BC", p:"Computer Science Pathway. Specializing in algorithm engineering."}
              ].map((step, idx) => (
                <div key={idx} className="relative pl-10 group">
                  <div className={`absolute -left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border flex items-center justify-center transition-all ${idx === 0 ? "border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.5)]": "border-purple-500"}`}>{step.i}</div>
                  <div className={`bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-white/20 transition-all shadow-2xl`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? "text-cyan-400": "text-purple-400"}`}>{step.y}</span>
                    <h3 className="text-2xl font-bold text-white mt-2 tracking-tight">{step.t}</h3>
                    <p className="text-gray-400 text-sm mt-3 leading-relaxed">{step.p}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CORE COMPETENCIES */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 pointer-events-none w-full relative">
            <h2 className="text-6xl font-black text-white mb-12 tracking-tighter">Core <span className="text-[#00E5FF]">Competencies.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-auto">
                {[ { t: "Programming", i: "💻", s: [{n: "Java", v: "90%"}, {n: "Python", v: "85%"}, {n: "JavaScript", v: "85%"}] },
                   { t: "Frontend Dev", i: "🖥️", s: [{n: "React.js", v: "90%"}, {n: "HTML/CSS", v: "95%"}, {n: "Tailwind", v: "85%"}] },
                   { t: "Backend & APIs", i: "⚙️", s: [{n: "Node.js", v: "85%"}, {n: "Express.js", v: "85%"}, {n: "REST APIs", v: "90%"}] },
                   { t: "Databases", i: "🗄️", s: [{n: "MongoDB", v: "85%"}, {n: "MySQL", v: "90%"}, {n: "PostgreSQL", v: "75%"}] },
                   { t: "Data Arch", i: "📊", s: [{n: "Power BI", v: "90%"}, {n: "DAX", v: "85%"}, {n: "Star Schema", v: "85%"}] },
                   { t: "Cloud & DevOps", i: "☁️", s: [{n: "Git / GitHub", v: "95%"}, {n: "AWS / Cloud", v: "80%"}, {n: "CI/CD", v: "85%"}] }
                ].map((card, idx) => (
                    <div key={idx} className="bg-[#0A0A12]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-500 shadow-2xl group flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-8 tracking-tight uppercase tracking-widest flex items-center gap-3">
                            <span className="text-2xl">{card.i}</span> {card.t}
                        </h3>
                        <div className="space-y-6 mt-auto">
                            {card.s.map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2"><span>{skill.n}</span><span className="text-white">{skill.v}</span></div>
                                    <div className="w-full bg-white/5 rounded-full h-[2px] overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF3366] transition-all duration-1000 w-0 group-hover:w-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" style={{ maxWidth: skill.v }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS (FIXED TAGS & MAGNETIC GLARE) */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-20 pointer-events-none w-full relative">
            <h2 className="text-6xl font-black text-white mb-16 tracking-tighter">System <span className="text-[#A855F7]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pointer-events-auto [perspective:1500px]">
                {projects.map((p, i) => (
                    <motion.div 
                        key={i} 
                        className="bg-[#0A0A12]/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden h-[360px] flex flex-col group"
                        style={{ transformStyle: "preserve-3d" }}
                        whileHover={{ y: -15, rotateX: -5, rotateY: 5, borderColor: `${p.color}40`, boxShadow: `0 25px 50px ${p.color}15` }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all duration-500" style={{ background: p.color }}></div>
                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight [transform:translateZ(30px)] tracking-tight">{p.title}</h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed mb-auto [transform:translateZ(10px)]">{p.desc}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-auto [transform:translateZ(20px)]">
                            {p.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[9px] font-black border border-white/10 px-3 py-1 rounded-full uppercase text-gray-500 group-hover:text-white transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center w-full">
            <h2 className="text-5xl font-black text-white mb-12 tracking-tighter text-center">Offline <span className="text-[#FF3366]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pointer-events-auto">
              {[ {i:"🏋️‍♂️",t:"Iron & Discipline",d:"6-day splits focusing on heavy compound progression."},
                 {i:"🎮",t:"Gaming & Logic",d:"Strategy, PC optimization and competitive mechanics."},
                 {i:"🌍",t:"Hiking & Travel",d:"Exploration, perspective and trail navigation."}
              ].map((h,x)=>(
                <div key={x} className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-10 rounded-3xl text-center hover:border-white/20 transition-all duration-300 shadow-xl group">
                  <div className="text-6xl mb-6 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">{h.i}</div>
                  <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-widest">{h.t}</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">{h.d}</p>
                </div>
              ))}
            </div>
        </section>

        {/* TERMINAL CONTACT (FLOATING CARD - NO CUTOFF) */}
        <section id="contact" className="w-full py-40 flex items-center justify-center relative z-30 min-h-[70vh]">
          <div className="max-w-4xl mx-auto px-6 pointer-events-auto flex flex-col items-center w-full">
            <div className="bg-[#030305]/60 backdrop-blur-3xl border border-white/10 p-12 md:p-16 rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center relative overflow-hidden group w-full">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#FF3366]"></div>
              <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready.</span></h2>
              <p className="text-gray-400 mb-12 text-xl font-light">Available for Internships. Initialize a secure ping via link.</p>
              <div className="flex items-center justify-center gap-3 mb-14 bg-white/5 w-max mx-auto px-10 py-4 rounded-full border border-white/10">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-3 w-3 rounded-full bg-green-500"></span></span>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-green-400">Available For New Projects</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-10 py-5 rounded-2xl text-white font-bold transition-all duration-500 hover:bg-white hover:text-black hover:-translate-y-1">GitHub ↗</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-10 py-5 rounded-2xl text-white font-bold transition-all duration-500 hover:bg-[#00E5FF] hover:text-black hover:-translate-y-1">LinkedIn ↗</a>
                <a href="mailto:ayarshivang27@gmail.com" className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 px-10 py-5 rounded-2xl text-white font-bold transition-all duration-500 hover:bg-[#FF3366] hover:text-black hover:-translate-y-1">Email ✉</a>
              </div>
            </div>
            <p className="mt-24 text-center text-[10px] font-bold tracking-[0.5em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </section>

      </div>
    </div>
  );
}