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
        <meshBasicMaterial color="#00E5FF" wireframe={true} transparent opacity={0.03} />
      </mesh>
    </Float>
  );
}

const projects = [
  { title: "E-Commerce Microservices", desc: "Highly scalable backend utilizing Docker containers, integrating Stripe API and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist Web App", desc: "Full-stack application for tracking user media via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF3366" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time document editing.", tags: ["Socket.io", "Next.js"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating Voice APIs with a high-performance backend.", tags: ["React", "AI APIs"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Centralized command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "CI/CD"], color: "#EAB308" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI API featuring user credits and asynchronous generation.", tags: ["React", "OpenAI"], color: "#FF3366" }
];

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF3366] transition-transform duration-500 group-hover:scale-x-100" />
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
      
      {/* 3D REACTIVE BACKGROUND (Pinned) */}
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
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-300 p-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </nav>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center pointer-events-none relative w-full pt-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start pointer-events-auto max-w-3xl">
            <h1 className="text-6xl sm:text-7xl md:text-[8.5rem] font-black text-white mb-4 tracking-tighter leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF3366]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-10 leading-relaxed font-light max-w-2xl">Full-Stack Architect specializing in high-performance digital systems and precision backends.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href="#projects" className="bg-transparent border border-[#00E5FF] text-[#00E5FF] px-10 py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500">Execute builds</a>
              <a href="/resume.pdf" target="_blank" className="bg-transparent border border-white/20 text-white px-10 py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">Get Resume</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-20 pointer-events-none w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pointer-events-auto">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5">
              <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">Born and raised in Zambia, now engineering software in Ottawa. I build with the same discipline I apply to my 6-day gym split—constant progression and optimization.</p>
              <div className="flex gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 w-1/2 rounded-2xl text-center"><h3 className="text-4xl font-black text-[#00E5FF]">3+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Years Coding</p></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 w-1/2 rounded-2xl text-center"><h3 className="text-4xl font-black text-[#FF3366]">10+</h3><p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">System Builds</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7 space-y-10 border-l-2 border-white/5 ml-4">
              <div className="relative pl-10 group">
                <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(0,229,255,1)]"></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-2xl">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">2024 - Present</span>
                  <h3 className="text-xl font-bold text-white mt-2">Algonquin College | Ottawa</h3>
                  <p className="text-gray-400 text-sm mt-3">Computer Programming & Analysis - Systems Engineering Focus.</p>
                </div>
              </div>
              <div className="relative pl-10 group">
                <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-purple-500"></div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-2xl">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">2021 - 2023</span>
                  <h3 className="text-xl font-bold text-white mt-2">Fraser International College | BC</h3>
                  <p className="text-gray-400 text-sm mt-3">Computer Science Pathway - Algorithm Foundations.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CORE COMPETENCIES */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 pointer-events-none w-full">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-12 tracking-tighter">Core <span className="text-[#00E5FF]">Competencies.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-auto">
            {[
              { t: "Programming", s: [{n: "Java", v: "90%"}, {n: "Python", v: "85%"}, {n: "JavaScript", v: "85%"}] },
              { t: "Frontend Dev", s: [{n: "React.js", v: "90%"}, {n: "HTML/CSS", v: "95%"}, {n: "Tailwind", v: "85%"}] },
              { t: "Backend & APIs", s: [{n: "Node.js", v: "85%"}, {n: "Express.js", v: "85%"}, {n: "REST APIs", v: "90%"}] },
              { t: "Databases", s: [{n: "MongoDB", v: "85%"}, {n: "MySQL", v: "90%"}, {n: "PostgreSQL", v: "75%"}] },
              { t: "Data Architecture", s: [{n: "Power BI", v: "90%"}, {n: "DAX", v: "85%"}, {n: "Star Schema", v: "85%"}] },
              { t: "Cloud & DevOps", s: [{n: "Git / GitHub", v: "95%"}, {n: "AWS / Cloud", v: "80%"}, {n: "CI/CD", v: "85%"}] }
            ].map((card, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-[#00E5FF]/40 transition-all duration-500 shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 tracking-tight">{card.t}</h3>
                <div className="space-y-5">
                  {card.s.map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2"><span>{skill.n}</span><span>{skill.v}</span></div>
                      <div className="w-full bg-white/5 rounded-full h-[3px] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF3366] transition-all duration-1000 w-0 group-hover:w-full" style={{ maxWidth: skill.v }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-20 pointer-events-none w-full">
            <h2 className="text-5xl font-black text-white mb-16 tracking-tighter">System <span className="text-[#A855F7]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pointer-events-auto">
              {projects.map((proj, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden h-[300px]">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all" style={{ background: proj.color }}></div>
                  <h3 className="text-2xl font-bold text-white mb-4">{proj.title}</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed mb-8">{proj.desc}</p>
                  <div className="flex flex-wrap gap-2 absolute bottom-10">
                    {proj.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-bold border border-white/20 px-3 py-1 rounded-full uppercase text-gray-400">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </section>

        {/* CONTACT - SMALLER FLOATING CARD (FIXES CUTOFF) */}
        <section id="contact" className="w-full min-h-[50vh] flex items-center justify-center pointer-events-none relative pb-32">
          <div className="max-w-3xl mx-auto px-6 pointer-events-auto w-full">
            <div className="bg-[#030305]/60 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-2xl text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#FF3366]"></div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready.</span></h2>
              <p className="text-gray-400 mb-10 text-lg font-light">Available for Internships. Initialize a secure ping via link.</p>
              
              <div className="flex items-center justify-center gap-3 mb-12 bg-white/5 w-max mx-auto px-8 py-3 rounded-full border border-white/10">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-3 w-3 rounded-full bg-green-500"></span></span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-green-400">Available For New Projects</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="https://github.com" className="bg-white/5 hover:bg-[#00E5FF] hover:text-black border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all duration-500">GitHub ↗</a>
                <a href="https://linkedin.com" className="bg-white/5 hover:bg-[#FF3366] hover:text-black border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all duration-500">LinkedIn ↗</a>
                <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 hover:bg-white hover:text-black border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all duration-500">Email ✉</a>
              </div>
            </div>
            <p className="mt-16 text-center text-[10px] font-bold tracking-[0.4em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </section>

      </div>
    </div>
  );
}