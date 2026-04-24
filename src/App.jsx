import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- REACTIVE CURSOR LIGHT (3D) ---
function CursorLight() {
  const lightRef = useRef();
  useFrame((state) => {
    const x = (state.pointer.x * state.viewport.width) / 2;
    const y = (state.pointer.y * state.viewport.height) / 2;
    lightRef.current.position.lerp(new THREE.Vector3(x, y, 3), 0.1);
  });
  return <pointLight ref={lightRef} intensity={20} color="#00E5FF" distance={25} />;
}

// --- FRACTAL DATA SHARDS ---
function DataShards({ count = 40 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -5 + Math.random() * 10;
      const yFactor = -5 + Math.random() * 10;
      const zFactor = -5 + Math.random() * 10;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += (state.pointer.x * 1000 - particle.mx) * 0.01;
      particle.my += (state.pointer.y * 1000 - particle.my) * 0.01;
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <dodecahedronGeometry args={[0.1, 0]} />
      {/* UPDATE 1: Switched shards to Amber emissive */}
      <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={1} />
    </instancedMesh>
  );
}

// --- CENTRAL NEURAL CORE ---
function CentralReactiveShape() {
  const meshRef = useRef();
  const outerRef = useRef();
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 4);
    meshRef.current.rotation.y = Math.sin(time / 2);
    outerRef.current.rotation.y -= delta * 0.2;
    
    // Smooth Scale Reaction
    const targetScale = isMobile ? 1.4 : 2.6;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    // Parallax
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, state.pointer.x * 1.5, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, state.pointer.y * 1.5, 0.05);
  });

  return (
    <group>
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1, 2]} />
          <MeshDistortMaterial 
            color="#050505" 
            speed={4} 
            distort={0.4} 
            roughness={0} 
            metalness={1} 
            emissive="#FF8C00" // UPDATE 2: Core emissive changed to Amber
            emissiveIntensity={0.05}
          />
        </mesh>
        
        {/* Glowing Wireframe Cage */}
        <mesh ref={outerRef} scale={1.2}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#00E5FF" wireframe transparent opacity={0.1} />
        </mesh>
      </Float>
      
      <DataShards count={isMobile ? 20 : 50} />
    </group>
  );
}

// --- 3D FLOATING BACKGROUND TEXT ---
function FloatingWord({ children, position, rotation, scale = 1, color = "#11111a" }) {
  const textRef = useRef();
  useFrame((state) => {
    textRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.005;
    textRef.current.position.x += Math.cos(state.clock.elapsedTime * 0.3 + position[1]) * 0.002;
  });
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        ref={textRef} position={position} rotation={rotation} scale={scale}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        letterSpacing={0.2}
      >
        {children}
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={1.2} 
          toneMapped={false} 
        />
      </Text>
    </Float>
  );
}

// --- PROJECT DATA ---
const projects = [
  { title: "E-Commerce Microservices", desc: "Highly scalable backend utilizing Docker containers, integrating Stripe API and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist Web App", desc: "Full-stack application for tracking user media via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF8C00" }, // Amber Replace
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time document editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs with a high-performance backend.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Centralized command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#EAB308" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI API featuring user credits and asynchronous generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF8C00" } // Amber Replace
];

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    {/* UPDATE 3: Gradient slider changed to Amber/Cyan */}
    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-transform duration-500 ease-out group-hover:scale-x-100 shadow-[0_0_10px_#00E5FF]" />
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
    <div className="bg-[#020204] text-gray-200 antialiased selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth relative min-h-screen overflow-x-hidden">
      
      {/* 2D HTML SPOTLIGHT */}
      <div 
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{ background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.09), transparent 80%)` }}
      />

      {/* TECH GRID OVERLAY */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
      />

      {/* 3D BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }} shadows>
          <color attach="background" args={['#020204']} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#FF8C00" /> {/* UPDATE 4: Amber Directional Light */}
          <directionalLight position={[-10, -10, 5]} intensity={0.5} color="#00E5FF" />
          <CursorLight />
          <Environment preset="night" />
          
          <CentralReactiveShape />
          
          {/* Background Words */}
          <FloatingWord position={[-8, 6, -8]} rotation={[0, 0.1, 0]} scale={1.2} color="#151525">ARCHITECTURE</FloatingWord>
          <FloatingWord position={[8, -5, -6]} rotation={[0, -0.2, 0]} scale={1} color="#151525">FULL-STACK</FloatingWord>
          <FloatingWord position={[-6, -8, -10]} rotation={[0, 0.3, 0]} scale={1.5} color="#151525">MERN STACK</FloatingWord>
          <FloatingWord position={[0, -12, -15]} rotation={[-0.1, 0, 0]} scale={3} color="#151525">SHIVANG</FloatingWord>
          <FloatingWord position={[10, 8, -12]} rotation={[0, -0.1, 0]} scale={1.1} color="#151525">ENGINEERING</FloatingWord>

          <ContactShadows position={[0, -8, 0]} opacity={0.6} scale={40} blur={2} far={10} color="#00E5FF" />
        </Canvas>
      </div>

      {/* MAIN OVERLAY CONTENT */}
      <div className="relative z-30 w-full flex flex-col">
        
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full z-50 bg-[#020204]/60 backdrop-blur-3xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-8">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
            SHIVANG<span className="text-[#00E5FF] group-hover:text-[#FF8C00] transition-colors duration-500">.</span>
          </div>
          <div className="hidden md:flex gap-12">
            <NavLink href="#about">Journey</NavLink>
            <NavLink href="#skills">Competencies</NavLink>
            <NavLink href="#projects">Builds</NavLink>
            <NavLink href="#contact">Connect</NavLink>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-300 p-2 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </nav>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center pointer-events-none relative w-full pt-20">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="flex flex-col items-start pointer-events-auto max-w-4xl">
            <div className="mb-6 px-4 py-1 border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.4em] uppercase">System Architect</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9.5rem] font-black text-white mb-4 tracking-tighter leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00] animate-gradient-x">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-8 mb-12 leading-relaxed font-light max-w-2xl pl-6">Engineering scalable digital ecosystems with immersive frontend architectures.</p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <a href="#projects" className="group relative overflow-hidden bg-white text-black px-12 py-5 text-xs font-black tracking-[0.3em] uppercase transition-all duration-500">
                <span className="relative z-10 group-hover:text-white transition-colors duration-500">Execute builds</span>
                <div className="absolute inset-0 bg-[#00E5FF] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </a>
              <a href="/resume.pdf" target="_blank" className="border border-white/20 text-white px-12 py-5 text-xs font-black tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">Get Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-40 pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-5 flex flex-col justify-center">
              <h2 className="text-6xl font-black text-white mb-10 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-8 text-xl font-light leading-relaxed">Born and raised in Zambia, I brought my drive across the globe to engineer software in Canada. Mastery and progression define my discipline.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0A0A12]/80 border border-white/5 p-8 rounded-3xl text-center shadow-2xl hover:border-[#00E5FF]/40 transition-colors group">
                  <h3 className="text-5xl font-black text-white group-hover:text-[#00E5FF] transition-colors">3+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-bold">Years Coding</p>
                </div>
                <div className="bg-[#0A0A12]/80 border border-white/5 p-8 rounded-3xl text-center shadow-2xl hover:border-[#FF8C00]/40 transition-colors group"> {/* Amber Accent */}
                  <h3 className="text-5xl font-black text-white group-hover:text-[#FF8C00] transition-colors">10+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-bold">System Builds</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7 space-y-12 border-l-2 border-[#00E5FF]/20 ml-4 relative">
              {[ {i:"🎓", y:"2024 - Present", t:"Algonquin College | Ottawa", p:"Advanced Diploma in Computer Programming. Enterprise focus.", c:"#00E5FF"},
                 {i:"💻", y:"2021 - 2023", t:"Fraser International College | BC", p:"Computer Science Pathway. specialized expertise in algorithm design.", c:"#A855F7"}
              ].map((step, idx) => (
                <div key={idx} className="relative pl-12 group">
                  <div className="absolute -left-[21px] top-2 w-10 h-10 rounded-full bg-[#020204] border-2 flex items-center justify-center transition-all duration-500" style={{ borderColor: step.c }}>{step.i}</div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] hover:border-white/20 transition-all shadow-2xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: step.c }}>{step.y}</span>
                    <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">{step.t}</h3>
                    <p className="text-gray-400 text-lg mt-4 leading-relaxed font-light">{step.p}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* COMPETENCIES */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-32 pointer-events-auto">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-16 tracking-tighter">Core <br/><span className="text-[#00E5FF]">Competencies.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { t: "Programming", i: "💻", s: [{n: "Java", v: "90%"}, {n: "Python", v: "85%"}, {n: "JavaScript", v: "85%"}, {n: "C#", v: "70%"}] },
                  { t: "Frontend Dev", i: "🖥️", s: [{n: "React.js", v: "90%"}, {n: "HTML5/CSS3", v: "95%"}, {n: "Tailwind CSS", v: "85%"}, {n: "Bootstrap", v: "80%"}] },
                  { t: "Backend & APIs", i: "⚙️", s: [{n: "Node.js", v: "85%"}, {n: "Express.js", v: "85%"}, {n: "REST APIs", v: "90%"}, {n: "WebSockets", v: "75%"}] },
                  { t: "Databases", i: "🗄️", s: [{n: "MongoDB", v: "85%"}, {n: "MySQL", v: "90%"}, {n: "PostgreSQL", v: "75%"}, {n: "NoSQL", v: "85%"}] },
                  { t: "Data Arch", i: "📊", s: [{n: "Power BI", v: "90%"}, {n: "DAX", v: "85%"}, {n: "Star Schema", v: "85%"}, {n: "ETL", v: "80%"}] },
                  { t: "Cloud & DevOps", i: "☁️", s: [{n: "Git / GitHub", v: "95%"}, {n: "AWS / Cloud", v: "80%"}, {n: "Docker", v: "75%"}, {n: "CI/CD", v: "85%"}] }
                ].map((card, idx) => (
                    <div key={idx} className="bg-[#0A0A12]/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-700 shadow-2xl group flex flex-col">
                        <h3 className="text-2xl font-bold text-white mb-10 tracking-tighter uppercase flex items-center gap-4">
                            <span className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">{card.i}</span> {card.t}
                        </h3>
                        <div className="space-y-8 mt-auto">
                            {card.s.map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-widest"><span>{skill.n}</span><span className="text-white">{skill.v}</span></div>
                                    <div className="w-full bg-white/5 rounded-full h-[2px] overflow-hidden">
                                        {/* UPDATE 5: Gradient changed to Cyan/Amber */}
                                        <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-all duration-[1.5s] w-0 group-hover:w-full shadow-[0_0_15px_#00E5FF]" style={{ maxWidth: skill.v }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-40 pointer-events-auto">
            <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right">System <span className="text-[#A855F7]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 [perspective:2000px]">
                {projects.map((p, i) => (
                    <motion.div 
                        key={i} 
                        className="bg-[#0A0A12]/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden h-[400px] flex flex-col group cursor-pointer"
                        style={{ transformStyle: "preserve-3d" }}
                        // UPDATE 6: Hover colors to match Cyan/Amber
                        whileHover={{ y: -20, rotateX: -10, rotateY: 10, borderColor: `${p.color}50`, boxShadow: `0 40px 100px ${p.color}15` }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all duration-700" style={{ background: p.color }}></div>
                        <h3 className="text-3xl font-bold text-white mb-6 leading-tight [transform:translateZ(50px)] tracking-tighter">{p.title}</h3>
                        <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto [transform:translateZ(20px)]">{p.desc}</p>
                        
                        <div className="flex flex-wrap gap-3 mt-auto [transform:translateZ(40px)]">
                            {p.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] font-black border border-white/10 px-4 py-1 rounded-full uppercase text-gray-500 group-hover:text-white group-hover:border-white/30 transition-all">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-6 py-40 pointer-events-auto">
            <h2 className="text-6xl font-black text-white mb-16 tracking-tighter text-center">Offline <span className="text-[#A855F7]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
              {[ {i:"🏋️‍♂️",t:"Iron & Discipline",d:"6-day splits focusing on compound progression and optimization."},
                 {i:"🎮",t:"Gaming & Logic",d:"Strategic exploration, PC tuning, and mechanics optimization."},
                 {i:"🌍",t:"Hiking & Travel",d:"Exploration of unfamiliar terrain to seek equilibrium."}
              ].map((h,x)=>(
                <div key={x} className="bg-[#0A0A12]/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[2.5rem] text-center hover:border-white/20 transition-all duration-500 shadow-2xl group">
                  <div className="text-7xl mb-8 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110">{h.i}</div>
                  <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-[0.2em]">{h.t}</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-lg">{h.d}</p>
                </div>
              ))}
            </div>
        </section>

        {/* CONTACT (The Floating Card) */}
        <section id="contact" className="w-full py-60 flex items-center justify-center relative z-30">
          <div className="max-w-5xl mx-auto px-6 pointer-events-auto flex flex-col items-center w-full">
            <div className="bg-[#020204]/80 backdrop-blur-3xl border border-white/10 p-16 md:p-24 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center relative overflow-hidden group w-full">
              {/* UPDATE 7: Top indicator changed to Amber/Cyan */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#FF8C00] shadow-[0_0_20px_#00E5FF]"></div>
              <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready.</span></h2>
              <p className="text-gray-400 mb-16 text-2xl font-light max-w-2xl mx-auto">Currently available for high-impact collaborations. Initialize a secure transmission below.</p>
              <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
                <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]"></span></span>
                <span className="text-xs font-black tracking-[0.4em] uppercase text-green-400">Secure Line Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <a href="https://github.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 hover:-translate-y-2">GitHub</a>
                <a href="https://linkedin.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500 hover:-translate-y-2">LinkedIn</a>
                {/* UPDATE 8: Email hover changed to Amber */}
                <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all duration-500 hover:-translate-y-2">Email</a>
              </div>
            </div>
            <p className="mt-32 text-center text-[11px] font-black tracking-[0.8em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </section>

      </div>
    </div>
  );
}