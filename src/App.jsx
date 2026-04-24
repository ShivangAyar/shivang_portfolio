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
  return <pointLight ref={lightRef} intensity={10} color="#00E5FF" distance={20} />;
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

// --- PROJECT DATA ---
const projects = [
  { title: "E-Commerce Microservices", desc: "Highly scalable backend utilizing Docker containers, integrating Stripe API for payment processing, and JWT for secure user authentication.", tags: ["Node.js", "Docker", "Stripe API"], color: "#00E5FF" },
  { title: "Movie Watchlist Web App", desc: "Engineered a full-stack web application for tracking user media. Built RESTful APIs with Express for secure CRUD operations via NoSQL.", tags: ["Node.js", "MongoDB", "Express"], color: "#FF3366" },
  { title: "Real-Time Collab Workspace", desc: "A live-syncing workspace engineered with WebSockets for real-time document editing and collaborative task management among multiple clients.", tags: ["Next.js", "Socket.io"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Executed during a 24-hour hackathon. Developed an emotion-aware chatbot by integrating Voice APIs with a Node backend (<200ms latency).", tags: ["React", "Voice APIs"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Centralized command center pulling metrics from GitHub Actions and AWS deployments, providing real-time build statuses and error logging.", tags: ["Python", "AWS", "CI/CD"], color: "#EAB308" },
  { title: "AI SaaS Image Generator", desc: "Fully functional SaaS wrapping the OpenAI API, featuring user credit systems, asynchronous image generation, and a sleek Tailwind UI.", tags: ["React", "OpenAI API"], color: "#FF3366" }
];

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-[#030305] text-gray-200 antialiased selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth relative min-h-screen overflow-x-hidden flex flex-col">
      
      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      <div className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block" style={{ background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.05), transparent 60%)` }} />
      
      {/* 3D CANVAS */}
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
          <FloatingWord position={[-6, -4, -6]} rotation={[0, 0.3, 0]} scale={1}>MERN</FloatingWord>
          <FloatingWord position={[8, -3, -4]} rotation={[0, -0.2, 0]} scale={1.5}>DATA</FloatingWord>
          <FloatingWord position={[0, -6, -10]} rotation={[-0.2, 0, 0]} scale={2.5}>SHIVANG</FloatingWord>
          <ContactShadows position={[0, -5, 0]} opacity={0.8} scale={25} blur={2.5} far={5} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex-grow flex flex-col">
        
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full z-50 bg-[#030305]/80 backdrop-blur-2xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-black tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              SHIVANG<span className="text-[#00E5FF]">.</span>
            </div>
            <div className="hidden md:flex gap-10 text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">
              <a href="#about" className="hover:text-[#00E5FF] transition-colors duration-300">Journey</a>
              <a href="#skills" className="hover:text-[#FF3366] transition-colors duration-300">Competencies</a>
              <a href="#projects" className="hover:text-[#00E5FF] transition-colors duration-300">Builds</a>
              <a href="#contact" className="hover:text-[#FF3366] transition-colors duration-300">Connect</a>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none p-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-20 left-0 w-full bg-[#030305]/95 backdrop-blur-3xl border-b border-white/10 flex flex-col items-center py-8 gap-8 shadow-2xl">
                <a href="#about" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#00E5FF]">Journey</a>
                <a href="#skills" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#FF3366]">Competencies</a>
                <a href="#projects" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#00E5FF]">Builds</a>
                <a href="#contact" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#FF3366]">Connect</a>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 pt-32 md:pt-48 pb-20 min-h-[90vh] flex items-center pointer-events-none relative">
          <div className="absolute top-1/2 left-0 w-64 h-64 md:w-96 md:h-96 bg-[#00E5FF]/20 rounded-full blur-[100px] md:blur-[150px] -z-10 mix-blend-screen"></div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="flex flex-col items-start pointer-events-auto max-w-3xl w-full">
            <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-black text-white mb-6 tracking-tighter leading-[1.1] md:leading-[0.9]">
              Shivang <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF3366]">Ayar.</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mt-4 md:mt-6 mb-10 md:mb-12 leading-relaxed font-light max-w-2xl">
              Software Engineer & Data Architect. Specializing in high-performance full-stack applications and precision backend systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href="#projects" className="w-full sm:w-auto text-center bg-transparent border border-[#00E5FF] text-[#00E5FF] px-8 py-4 md:px-10 md:py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)]">
                Execute Portfolio
              </a>
              <a href="/resume.pdf" target="_blank" className="w-full sm:w-auto text-center bg-transparent border border-white/20 text-white px-8 py-4 md:px-10 md:py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">
                Get Resume ↓
              </a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY CALENDAR */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col justify-center pointer-events-none relative">
          <div className="pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* LEFT: About Me Text & Stats */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:col-span-5 flex flex-col justify-center">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 md:mb-8 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-6 leading-relaxed font-light text-base md:text-lg">
                Born and raised in Zambia, I brought my drive across the globe to engineer high-performance software in Canada. Currently based in Ottawa, pushing the boundaries of web architecture.
              </p>
              <p className="text-gray-400 mb-10 md:mb-12 leading-relaxed font-light text-base md:text-lg">
                I approach code with the same rigid discipline I apply to my 6-day gym splits—focused entirely on heavy lifting, optimization, and constant progression.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="bg-[#0A0A12]/60 backdrop-blur-xl border border-white/5 p-6 w-full sm:w-1/2 rounded-2xl text-center hover:border-[#00E5FF]/50 transition-colors shadow-2xl">
                  <h3 className="text-4xl font-black text-[#00E5FF] mb-2">3+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Years Coding</p>
                </div>
                <div className="bg-[#0A0A12]/60 backdrop-blur-xl border border-white/5 p-6 w-full sm:w-1/2 rounded-2xl text-center hover:border-[#FF3366]/50 transition-colors shadow-2xl">
                  <h3 className="text-4xl font-black text-[#FF3366] mb-2">10+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">System Builds</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Journey Calendar Timeline */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="lg:col-span-7 mt-8 lg:mt-0">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tighter">My <span className="text-[#FF3366]">Journey.</span></h2>
              <div className="border-l-2 border-gray-800/50 ml-2 sm:ml-4 space-y-10 md:space-y-12">
                
                <div className="relative pl-6 sm:pl-10 group">
                  <div className="absolute -left-[17px] sm:-left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border border-[#00E5FF] flex items-center justify-center group-hover:bg-[#00E5FF] transition-all duration-500 shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                    <span className="text-[10px] group-hover:text-[#030305] text-[#00E5FF]">🎓</span>
                  </div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-6 sm:p-8 rounded-2xl hover:border-[#00E5FF]/30 transition-all shadow-xl hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-white/10 pb-4 gap-2">
                      <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">2024 - Present</span>
                      <span className="text-[10px] text-[#00E5FF] font-bold tracking-[0.2em] uppercase bg-[#00E5FF]/10 px-3 py-1 rounded-full border border-[#00E5FF]/20">Current</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Adv. Dip. Computer Programming</h3>
                    <p className="text-[#00E5FF] font-medium text-sm mb-4">Algonquin College | Ottawa, ON</p>
                    <p className="text-gray-400 font-light text-sm sm:text-base leading-relaxed">Specializing in full-stack architecture, advanced object-oriented design, and database systems engineering.</p>
                  </div>
                </div>

                <div className="relative pl-6 sm:pl-10 group">
                  <div className="absolute -left-[17px] sm:-left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border border-[#A855F7] flex items-center justify-center group-hover:bg-[#A855F7] transition-all duration-500">
                    <span className="text-[10px] group-hover:text-[#030305] text-[#A855F7]">💻</span>
                  </div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-6 sm:p-8 rounded-2xl hover:border-[#A855F7]/30 transition-all shadow-xl hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                      <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">2021 - 2023</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Computer Science Pathway</h3>
                    <p className="text-[#A855F7] font-medium text-sm mb-4">Fraser International College | Vancouver, BC</p>
                    <p className="text-gray-400 font-light text-sm sm:text-base leading-relaxed">Built a rigorous foundation in algorithms, computation theory, and core software engineering principles.</p>
                  </div>
                </div>

                <div className="relative pl-6 sm:pl-10 group">
                  <div className="absolute -left-[17px] sm:-left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border border-[#FF3366] flex items-center justify-center group-hover:bg-[#FF3366] transition-all duration-500">
                    <span className="text-[10px] group-hover:text-[#030305] text-[#FF3366]">⚙️</span>
                  </div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-6 sm:p-8 rounded-2xl hover:border-[#FF3366]/30 transition-all shadow-xl hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                      <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">2020 - 2021</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">Operations Leadership</h3>
                    <p className="text-[#FF3366] font-medium text-sm mb-4">Industrial Linings Ltd. | Chingola, Zambia</p>
                    <p className="text-gray-400 font-light text-sm sm:text-base leading-relaxed">Supervised teams and modernized inventory tracking databases prior to relocating for software engineering.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 pointer-events-none">
          <div className="pointer-events-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-10 md:mb-12 tracking-tighter text-center">Offline <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF3366]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-3xl text-center hover:border-[#00E5FF]/40 hover:-translate-y-2 transition-all duration-300 group shadow-xl">
                <div className="text-5xl mb-6 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">🏋️‍♂️</div>
                <h3 className="text-xl font-bold text-white mb-2">Iron & Discipline</h3>
                <p className="text-sm text-gray-500 font-light">6-day splits & progressive overload</p>
              </div>
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-3xl text-center hover:border-[#A855F7]/40 hover:-translate-y-2 transition-all duration-300 group shadow-xl">
                <div className="text-5xl mb-6 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">🎮</div>
                <h3 className="text-xl font-bold text-white mb-2">Gaming & Logic</h3>
                <p className="text-sm text-gray-500 font-light">Strategy, mechanics & logic optimization</p>
              </div>
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-3xl text-center hover:border-[#FF3366]/40 hover:-translate-y-2 transition-all duration-300 group shadow-xl">
                <div className="text-5xl mb-6 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">🌍</div>
                <h3 className="text-xl font-bold text-white mb-2">Hiking & Travel</h3>
                <p className="text-sm text-gray-500 font-light">Exploration & finding new perspectives</p>
              </div>
            </div>
          </div>
        </section>

        {/* MILESTONES & COMPETENCIES */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 md:py-32 pointer-events-none relative">
          <div className="absolute top-1/4 right-0 w-64 h-64 md:w-96 md:h-96 bg-[#FF3366]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 mix-blend-screen"></div>
          <div className="pointer-events-auto">
            
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black text-white mb-10 md:mb-12 tracking-tighter">Key <span className="text-[#FF3366]">Milestones.</span></motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 md:mb-32">
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col hover:border-[#00E5FF]/30 transition-all shadow-lg group">
                <div className="w-12 h-12 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] mb-4 group-hover:scale-110 transition-transform">🏆</div>
                <h3 className="text-lg font-bold text-white mb-1">Hackathon SDLC</h3>
                <p className="text-sm text-gray-400 font-light">Functional MVP Chatbot in &lt;24hrs</p>
              </div>
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col hover:border-[#A855F7]/30 transition-all shadow-lg group">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">⚡</div>
                <h3 className="text-lg font-bold text-white mb-1">Algorithmic Math</h3>
                <p className="text-sm text-gray-400 font-light">O(1) time complexity & 100% accuracy</p>
              </div>
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col hover:border-[#FF3366]/30 transition-all shadow-lg group">
                <div className="w-12 h-12 rounded-full bg-[#FF3366]/10 flex items-center justify-center text-[#FF3366] mb-4 group-hover:scale-110 transition-transform">📈</div>
                <h3 className="text-lg font-bold text-white mb-1">Data Architecture</h3>
                <p className="text-sm text-gray-400 font-light">90% reduction in query execution time</p>
              </div>
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col hover:border-yellow-500/30 transition-all shadow-lg group">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition-transform">⚙️</div>
                <h3 className="text-lg font-bold text-white mb-1">Ops Leadership</h3>
                <p className="text-sm text-gray-400 font-light">20% efficiency boost in processing</p>
              </div>
            </div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black text-white mb-10 md:mb-12 tracking-tighter">Core <span className="text-[#00E5FF]">Competencies.</span></motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-[#00E5FF]/30 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><span className="text-[#00E5FF] text-2xl">&lt;/&gt;</span> Programming</h3>
                <div className="space-y-5">
                  {[ {name: "Java", val: "90%"}, {name: "Python", val: "85%"}, {name: "JavaScript", val: "85%"}, {name: "C#", val: "70%"} ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-2"><span>{skill.name}</span><span className="text-[#00E5FF]">{skill.val}</span></div>
                      <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]" style={{ '--tw-group-hover-width': skill.val } }></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-[#A855F7]/30 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><span className="text-[#A855F7] text-2xl">🖥️</span> Frontend Dev</h3>
                <div className="space-y-5">
                  {[ {name: "React.js", val: "90%"}, {name: "HTML5/CSS3", val: "95%"}, {name: "Tailwind CSS", val: "85%"}, {name: "Bootstrap", val: "80%"} ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-2"><span>{skill.name}</span><span className="text-[#A855F7]">{skill.val}</span></div>
                      <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-[#A855F7] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{ '--tw-group-hover-width': skill.val } }></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-[#FF3366]/30 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><span className="text-[#FF3366] text-2xl">⚙️</span> Backend & APIs</h3>
                <div className="space-y-5">
                  {[ {name: "Node.js", val: "85%"}, {name: "Express.js", val: "85%"}, {name: "RESTful APIs", val: "90%"}, {name: "WebSockets", val: "75%"} ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-2"><span>{skill.name}</span><span className="text-[#FF3366]">{skill.val}</span></div>
                      <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-[#FF3366] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,51,102,0.8)]" style={{ '--tw-group-hover-width': skill.val } }></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-[#FF3366]/30 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><span className="text-[#FF3366] text-2xl">🗄️</span> Databases</h3>
                <div className="space-y-5">
                  {[ {name: "MongoDB", val: "85%"}, {name: "MySQL", val: "90%"}, {name: "PostgreSQL", val: "75%"}, {name: "NoSQL Design", val: "85%"} ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-2"><span>{skill.name}</span><span className="text-[#FF3366]">{skill.val}</span></div>
                      <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-[#FF3366] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,51,102,0.8)]" style={{ '--tw-group-hover-width': skill.val } }></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><span className="text-yellow-400 text-2xl">📊</span> Data & Analytics</h3>
                <div className="space-y-5">
                  {[ {name: "Power BI", val: "90%"}, {name: "DAX", val: "85%"}, {name: "Star Schema", val: "85%"}, {name: "ETL Processes", val: "80%"} ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-2"><span>{skill.name}</span><span className="text-yellow-400">{skill.val}</span></div>
                      <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-yellow-400 h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,179,8,0.8)]" style={{ '--tw-group-hover-width': skill.val } }></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-[#00E5FF]/30 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><span className="text-[#00E5FF] text-2xl">☁️</span> DevOps & Cloud</h3>
                <div className="space-y-5">
                  {[ {name: "Git / GitHub", val: "95%"}, {name: "AWS (EC2/S3)", val: "80%"}, {name: "Docker", val: "75%"}, {name: "CI/CD & Vercel", val: "85%"} ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase mb-2"><span>{skill.name}</span><span className="text-[#00E5FF]">{skill.val}</span></div>
                      <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]" style={{ '--tw-group-hover-width': skill.val } }></div></div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-20 md:py-32 pointer-events-none">
          <div className="pointer-events-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black text-white mb-10 md:mb-16 tracking-tighter">System <span className="text-[#A855F7]">Builds.</span></motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.map((proj, idx) => (
                <div key={idx} className="bg-[#0A0A12]/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/5 transition-all duration-500 group relative overflow-hidden shadow-2xl hover:-translate-y-2 hover:border-white/20">
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-colors duration-500 opacity-10 group-hover:opacity-20`} style={{ background: `linear-gradient(to bottom left, ${proj.color}, transparent)` }}></div>
                  <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{proj.title}</h3>
                  <p className="text-gray-400 mb-6 md:mb-8 leading-relaxed text-sm font-light h-auto sm:h-24">{proj.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {proj.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-bold tracking-[0.1em] uppercase border px-3 py-1 rounded-full text-gray-300 border-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TERMINAL CONTACT FOOTER */}
        <section id="contact" className="w-full bg-[#0A0A12]/90 backdrop-blur-2xl border-t border-white/5 pt-20 md:pt-32 pb-12 md:pb-16 pointer-events-none mt-10 md:mt-20 relative z-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-64 bg-[#00E5FF]/5 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pointer-events-auto flex flex-col items-center">
            <div className="bg-[#030305] border border-white/5 p-8 sm:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#FF3366]"></div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready</span></h2>
              <p className="text-gray-400 mb-8 sm:mb-10 font-light text-base sm:text-lg">I typically respond within 24 hours. For urgent matters, initialize a secure ping via email or LinkedIn.</p>
              
              <div className="flex items-center justify-center gap-3 mb-10 sm:mb-12 bg-white/5 w-full sm:w-max mx-auto px-6 sm:px-8 py-4 rounded-xl sm:rounded-full border border-white/5 shadow-inner">
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-green-400">Available for new projects</span>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#0A0A12] border border-white/10 px-8 py-4 rounded-xl sm:rounded-2xl text-white font-bold tracking-wide transition-all duration-300 hover:border-[#00E5FF]/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:-translate-y-1">
                  <span>GitHub</span> ↗
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#0A0A12] border border-white/10 px-8 py-4 rounded-xl sm:rounded-2xl text-white font-bold tracking-wide transition-all duration-300 hover:border-[#FF3366]/50 hover:shadow-[0_0_20px_rgba(255,51,102,0.2)] hover:-translate-y-1">
                  <span>LinkedIn</span> ↗
                </a>
                <a href="mailto:ayarshivang27@gmail.com" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#0A0A12] border border-white/10 px-8 py-4 rounded-xl sm:rounded-2xl text-white font-bold tracking-wide transition-all duration-300 hover:border-[#A855F7]/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:-translate-y-1">
                  <span>Email</span> ✉
                </a>
              </div>
            </div>
            <div className="mt-12 sm:mt-20 text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] text-gray-600 uppercase">© 2026 Shivang Ayar. Crafted with intent.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}