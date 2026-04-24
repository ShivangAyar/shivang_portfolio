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
  return <pointLight ref={lightRef} intensity={12} color="#00E5FF" distance={25} />;
}

// --- 3D INTERACTIVE TEXT ---
function FloatingWord({ children, position, rotation, scale = 1, baseColor = "#12121A" }) {
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
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.5} />
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
    wireframeRef.current.position.x = THREE.MathUtils.lerp(wireframeRef.current.position.x, state.pointer.x * 0.8, 0.05);
    wireframeRef.current.position.y = THREE.MathUtils.lerp(wireframeRef.current.position.y, state.pointer.y * 0.8, 0.05);
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
      
      {/* 3D REACTIVE BACKGROUND (PINNED) */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }} shadows>
          <color attach="background" args={['#030305']} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, -5]} intensity={0.6} color="#FF3366" />
          <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#00E5FF" />
          <CursorLight />
          <Environment preset="night" />
          <CentralReactiveShape />
          <FloatingWord position={[-7, 4, -5]} rotation={[0, 0.2, 0]} scale={1.4}>ARCHITECTURE</FloatingWord>
          <FloatingWord position={[7, 5, -8]} rotation={[0, -0.3, 0]} scale={1.1}>ENGINEERING</FloatingWord>
          <FloatingWord position={[0, -6, -10]} rotation={[-0.2, 0, 0]} scale={2.5}>SHIVANG</FloatingWord>
          <ContactShadows position={[0, -5, 0]} opacity={0.8} scale={25} blur={2.5} far={5} color="#00E5FF" />
        </Canvas>
      </div>

      {/* OVERLAY CONTENT */}
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
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-300 p-2 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 z-[60] bg-[#030305]/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-12">
              <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-gray-400"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg></button>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black tracking-widest text-white uppercase">Journey</a>
              <a href="#skills" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black tracking-widest text-white uppercase">Competencies</a>
              <a href="#projects" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black tracking-widest text-white uppercase">Builds</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black tracking-widest text-white uppercase">Connect</a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center pointer-events-none relative w-full pt-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start pointer-events-auto max-w-3xl">
            <h1 className="text-6xl sm:text-7xl md:text-[8.5rem] font-black text-white mb-4 tracking-tighter leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF3366]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-10 leading-relaxed font-light max-w-2xl">Full-Stack Architect specializing in high-performance digital systems and precision backends.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href="#projects" className="bg-[#00E5FF] text-black px-10 py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white transition-all duration-500">Execute builds</a>
              <a href="/resume.pdf" target="_blank" className="bg-transparent border border-white/20 text-white px-10 py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">Get Resume</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY (RESTORED SPLIT LAYOUT) */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-32 pointer-events-none w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pointer-events-auto">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5">
              <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed font-light">Born and raised in Zambia, I brought my drive across the globe to engineer high-performance software in Canada. Currently based in Ottawa, pushing boundaries.</p>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed font-light">I approach code with rigid discipline—focused entirely on heavy lifting, optimization, and constant progression in the terminal and the gym.</p>
              <div className="flex gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 w-1/2 rounded-2xl text-center shadow-xl"><h3 className="text-4xl font-black text-[#00E5FF]">3+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Years Coding</p></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 w-1/2 rounded-2xl text-center shadow-xl"><h3 className="text-4xl font-black text-[#FF3366]">10+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">System Builds</p></div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7 space-y-12 border-l-2 border-white/5 ml-4">
              <div className="relative pl-10 group">
                <div className="absolute -left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border border-[#00E5FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.5)]">🎓</div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-[#00E5FF]/30 transition-all shadow-2xl">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">2024 - Present</span>
                  <h3 className="text-2xl font-bold text-white mt-2">Algonquin College | Ottawa</h3>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">Advanced Diploma in Computer Programming & Analysis. Systems Engineering focus.</p>
                </div>
              </div>
              <div className="relative pl-10 group">
                <div className="absolute -left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border border-[#A855F7] flex items-center justify-center">💻</div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-[#A855F7]/30 transition-all shadow-2xl">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">2021 - 2023</span>
                  <h3 className="text-2xl font-bold text-white mt-2">Fraser International College | BC</h3>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">Computer Science Pathway. Specialized foundation in algorithms and software engineering.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CORE COMPETENCIES (RESTORED 6-CARD GRID & ANIMATIONS) */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 pointer-events-none w-full">
          <h2 className="text-6xl font-black text-white mb-12 tracking-tighter">Core <span className="text-[#00E5FF]">Competencies.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-auto">
            {[
              { t: "Programming", s: [{n: "Java", v: "90%"}, {n: "Python", v: "85%"}, {n: "JavaScript", v: "85%"}, {n: "C#", v: "70%"}] },
              { t: "Frontend Dev", s: [{n: "React.js", v: "90%"}, {n: "HTML/CSS", v: "95%"}, {n: "Tailwind", v: "85%"}, {n: "Bootstrap", v: "80%"}] },
              { t: "Backend & APIs", s: [{n: "Node.js", v: "85%"}, {n: "Express.js", v: "85%"}, {n: "REST APIs", v: "90%"}, {n: "WebSockets", v: "75%"}] },
              { t: "Databases", s: [{n: "MongoDB", v: "85%"}, {n: "MySQL", v: "90%"}, {n: "PostgreSQL", v: "75%"}, {n: "NoSQL", v: "85%"}] },
              { t: "Data Arch", s: [{n: "Power BI", v: "90%"}, {n: "DAX", v: "85%"}, {n: "Star Schema", v: "85%"}, {n: "ETL", v: "80%"}] },
              { t: "Cloud & DevOps", s: [{n: "Git / GitHub", v: "95%"}, {n: "AWS", v: "80%"}, {n: "Docker", v: "75%"}, {n: "CI/CD", v: "85%"}] }
            ].map((card, idx) => (
              <div key={idx} className="bg-[#0A0A12]/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-500 shadow-2xl group">
                <h3 className="text-xl font-bold text-white mb-8 tracking-tight uppercase tracking-widest">{card.t}</h3>
                <div className="space-y-6">
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

        {/* PROJECTS (6 TOTAL) */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-20 w-full">
            <h2 className="text-6xl font-black text-white mb-16 tracking-tighter">System <span className="text-[#A855F7]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { t: "E-Commerce Microservices", d: "High-scale backend with Docker, Stripe API, and JWT authentication.", c: "#00E5FF" },
                { t: "Movie Watchlist App", d: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", c: "#FF3366" },
                { t: "Real-Time Collab", d: "Live-syncing environment using WebSockets for document editing.", c: "#A855F7" },
                { t: "Voice AI Chatbot", d: "Emotion-aware chatbot integrating Voice APIs with high performance.", c: "#00E5FF" },
                { t: "DevOps Dashboard", d: "Centralized hub for GitHub Actions and AWS deployment metrics.", c: "#EAB308" },
                { t: "AI SaaS Generator", d: "SaaS wrapping OpenAI featuring user credits and image generation.", c: "#FF3366" }
              ].map((p, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl group relative overflow-hidden h-[320px] flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all" style={{ background: p.c }}></div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{p.t}</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed mb-auto">{p.d}</p>
                  <div className="flex gap-2 mt-4"><span className="text-[9px] font-bold border border-white/10 px-3 py-1 rounded-full uppercase text-gray-500">Node.js</span><span className="text-[9px] font-bold border border-white/10 px-3 py-1 rounded-full uppercase text-gray-500">React</span></div>
                </div>
              ))}
            </div>
        </section>

        {/* OFFLINE PROTOCOL (3-COLUMN HOBBIES) */}
        <section className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center w-full">
            <h2 className="text-5xl font-black text-white mb-12 tracking-tighter text-center">Offline <span className="text-[#FF3366]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[
                {i:"🏋️‍♂️",t:"Iron & Discipline",d:"6-day splits focusing on heavy compound progression."},
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
        <section id="contact" className="w-full py-40 flex items-center justify-center relative z-30">
          <div className="max-w-4xl mx-auto px-6 w-full flex flex-col items-center">
            <div className="bg-[#030305]/80 backdrop-blur-3xl border border-white/10 p-12 md:p-16 rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,1)] text-center relative overflow-hidden group w-full">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#FF3366]"></div>
              <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready.</span></h2>
              <p className="text-gray-400 mb-12 text-xl font-light">Available for Internships. Initialize a secure ping via link.</p>
              
              <div className="flex items-center justify-center gap-3 mb-14 bg-white/5 w-max mx-auto px-10 py-4 rounded-full border border-white/10">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-3 w-3 rounded-full bg-green-500"></span></span>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-green-400">Secure Line Active</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a href="https://github.com" className="bg-[#0A0A12] border border-white/10 px-10 py-5 rounded-2xl font-bold transition-all duration-500 hover:border-[#00E5FF]/50 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:-translate-y-1">GitHub</a>
                <a href="https://linkedin.com" className="bg-[#0A0A12] border border-white/10 px-10 py-5 rounded-2xl font-bold transition-all duration-500 hover:border-[#FF3366]/50 hover:shadow-[0_0_30px_rgba(255,51,102,0.2)] hover:-translate-y-1">LinkedIn</a>
                <a href="mailto:ayarshivang27@gmail.com" className="bg-[#0A0A12] border border-white/10 px-10 py-5 rounded-2xl font-bold transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1">Email ✉</a>
              </div>
            </div>
            <p className="mt-24 text-center text-[10px] font-bold tracking-[0.5em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </section>

      </div>
    </div>
  );
}