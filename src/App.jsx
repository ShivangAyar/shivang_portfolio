import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, ContactShadows, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- REACTIVE CURSOR LIGHT ---
function CursorLight() {
  const lightRef = useRef();
  useFrame((state) => {
    const x = (state.pointer.x * state.viewport.width) / 2;
    const y = (state.pointer.y * state.viewport.height) / 2;
    lightRef.current.position.lerp(new THREE.Vector3(x, y, 5), 0.1);
  });
  return <pointLight ref={lightRef} intensity={25} color="#00E5FF" distance={35} />;
}

// --- FLOWING DATA PARTICLES ---
function FlowParticles({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const sRef = useRef();
  useFrame((state) => {
    sRef.current.rotation.y += 0.001;
    sRef.current.rotation.x += 0.0005;
  });

  return (
    <Points ref={sRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#FF8C00" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.4} />
    </Points>
  );
}

// --- THE HYPER-PRISM REACTOR ---
function HyperPrism() {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const mX = state.pointer.x;
    const mY = state.pointer.y;

    // Core Rotation & Distortion
    coreRef.current.rotation.x += delta * 0.2;
    coreRef.current.rotation.y += delta * 0.3;
    coreRef.current.position.lerp(new THREE.Vector3(mX * 2, mY * 2, 0), 0.05);

    // Mechanical Ring Logic (Reacts to Mouse Speed)
    const speedBase = delta * 1;
    ring1Ref.current.rotation.z += speedBase + Math.abs(mX) * 0.1;
    ring2Ref.current.rotation.x += speedBase + Math.abs(mY) * 0.1;
    ring3Ref.current.rotation.y += speedBase + Math.abs(mX + mY) * 0.1;

    const scale = isMobile ? 1.2 : 2.2;
    coreRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group>
      {/* Central Glass Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial 
          color="#050505" 
          speed={3} 
          distort={0.4} 
          roughness={0} 
          metalness={1} 
          emissive="#FF8C00" 
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Kinetic Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.015, 16, 100]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[4.2, 0.01, 16, 100]} />
        <meshStandardMaterial color="#FF8C00" emissive="#FF8C00" emissiveIntensity={1.5} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[4.8, 0.008, 16, 100]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1} opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

// --- BACKGROUND TEXT ---
function FloatingWord({ children, position, scale = 1, color = "#11111a" }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Text
        position={position} scale={scale}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        {children}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
      </Text>
    </Float>
  );
}

// --- PROJECT DATA ---
const projects = [
  { title: "E-Commerce Microservices", desc: "Scaleable backend utilizing Docker, Stripe API, and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist Web App", desc: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF8C00" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for document editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps Dashboard", desc: "Command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#EAB308" },
  { title: "AI SaaS Generator", desc: "SaaS wrapping OpenAI featuring user credits and async generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF8C00" }
];

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-transform duration-500 group-hover:scale-x-100" />
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
      
      {/* DOM SPOTLIGHT */}
      <div className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.1), transparent 80%)` }} />

      {/* SCENE */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <color attach="background" args={['#020204']} />
          <ambientLight intensity={0.5} />
          <CursorLight />
          <HyperPrism />
          <FlowParticles count={1500} />
          
          <FloatingWord position={[-10, 8, -12]} scale={1.2} color="#151525">ARCHITECTURE</FloatingWord>
          <FloatingWord position={[10, -6, -8]} scale={1} color="#151525">FULL-STACK</FloatingWord>
          <FloatingWord position={[-8, -10, -10]} scale={1.5} color="#151525">MERN STACK</FloatingWord>
          <FloatingWord position={[0, -15, -20]} scale={3} color="#151525">SHIVANG</FloatingWord>

          <ContactShadows position={[0, -10, 0]} opacity={0.7} scale={40} blur={2} far={15} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* NAV */}
        <nav className="fixed top-0 w-full z-50 bg-[#020204]/60 backdrop-blur-3xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-8">
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
        <section className="max-w-7xl mx-auto px-6 min-h-screen flex items-center pointer-events-none relative w-full pt-20">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2 }} className="flex flex-col items-start pointer-events-auto max-w-4xl">
            <div className="mb-6 px-4 py-1 border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.4em] uppercase">System Architect</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9.5rem] font-black text-white mb-4 tracking-tighter leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-8 mb-12 font-light max-w-2xl border-l-2 border-[#FF8C00] pl-6">Engineering scalable digital ecosystems with immersive architectures.</p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <a href="#projects" className="bg-white text-black px-12 py-5 text-xs font-black tracking-[0.3em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all duration-500 shadow-xl">Execute builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/20 text-white px-12 py-5 text-xs font-black tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">Get Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-40 pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-5">
              <h2 className="text-6xl font-black text-white mb-10 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-8 text-xl font-light leading-relaxed">Born and raised in Zambia, now engineering software in Canada. Mastery and progression define my discipline.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0A0A12]/80 border border-white/5 p-8 rounded-3xl text-center shadow-2xl group hover:border-[#00E5FF]/40 transition-all">
                  <h3 className="text-5xl font-black text-white group-hover:text-[#00E5FF] transition-colors">3+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-bold">Years Coding</p>
                </div>
                <div className="bg-[#0A0A12]/80 border border-white/5 p-8 rounded-3xl text-center shadow-2xl group hover:border-[#FF8C00]/40 transition-all">
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
                  <div className="absolute -left-[21px] top-2 w-10 h-10 rounded-full bg-[#020204] border-2 flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(0,229,255,0.2)]" style={{ borderColor: step.c }}>{step.i}</div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] hover:border-white/20 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: step.c }}>{step.y}</span>
                    <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">{step.t}</h3>
                    <p className="text-gray-400 text-lg mt-4 font-light leading-relaxed">{step.p}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-32 pointer-events-auto">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-16 tracking-tighter">Core <br/><span className="text-[#00E5FF]">Competencies.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { t: "Programming", i: "💻", s: [{n: "Java", v: "90%"}, {n: "Python", v: "85%"}, {n: "JavaScript", v: "85%"}, {n: "C#", v: "70%"}] },
                  { t: "Frontend Dev", i: "🖥️", s: [{n: "React.js", v: "90%"}, {n: "HTML5/CSS3", v: "95%"}, {n: "Tailwind CSS", v: "85%"}, {n: "Bootstrap", v: "80%"}] },
                  { t: "Backend & APIs", i: "⚙️", s: [{n: "Node.js", v: "85%"}, {n: "Express.js", v: "85%"}, {n: "RESTful APIs", v: "90%"}, {n: "WebSockets", v: "75%"}] },
                  { t: "Databases", i: "🗄️", s: [{n: "MongoDB", v: "85%"}, {n: "MySQL", v: "90%"}, {n: "PostgreSQL", v: "75%"}, {n: "NoSQL", v: "85%"}] },
                  { t: "Data Arch", i: "📊", s: [{n: "Power BI", v: "90%"}, {n: "DAX", v: "85%"}, {n: "Star Schema", v: "85%"}, {n: "ETL", v: "80%"}] },
                  { t: "Cloud & DevOps", i: "☁️", s: [{n: "Git / GitHub", v: "95%"}, {n: "AWS (EC2/S3)", v: "80%"}, {n: "Docker", v: "75%"}, {n: "CI/CD", v: "85%"}] }
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
                                        <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-all duration-[1.5s] w-0 group-hover:w-full shadow-[0_0_15px_#00E5FF]" style={{ maxWidth: skill.v }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-40 pointer-events-auto">
            <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right">System <span className="text-[#A855F7]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 [perspective:2000px]">
                {projects.map((p, i) => (
                    <motion.div 
                        key={i} 
                        className="bg-[#0A0A12]/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden h-[400px] flex flex-col group cursor-pointer"
                        style={{ transformStyle: "preserve-3d" }}
                        whileHover={{ y: -20, rotateX: -10, rotateY: 10, borderColor: `${p.color}50`, boxShadow: `0 40px 100px ${p.color}15` }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all duration-700" style={{ background: p.color }}></div>
                        <h3 className="text-3xl font-bold text-white mb-6 leading-tight [transform:translateZ(50px)] tracking-tighter">{p.title}</h3>
                        <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto [transform:translateZ(20px)]">{p.desc}</p>
                        <div className="flex flex-wrap gap-3 mt-auto">
                            {p.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] font-black border border-white/10 px-4 py-1 rounded-full uppercase text-gray-500 group-hover:text-white transition-all">{tag}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-6 py-40 pointer-events-auto">
            <h2 className="text-6xl font-black text-white mb-16 tracking-tighter text-center">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
              {[ {i:"🏋️‍♂️",t:"Iron & Discipline",d:"6-day splits focusing on heavy compound progression and optimization."},
                 {i:"🎮",t:"Gaming & Logic",d:"Strategic exploration, PC tuning, and mechanics optimization."},
                 {i:"🌍",t:"Hiking & Travel",d:"Exploration of unfamiliar terrain to seek equilibrium."}
              ].map((h,x)=>(
                <div key={x} className="bg-[#0A0A12]/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[2.5rem] text-center hover:border-white/20 transition-all shadow-2xl group">
                  <div className="text-7xl mb-8 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110">{h.i}</div>
                  <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-[0.2em]">{h.t}</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-lg">{h.d}</p>
                </div>
              ))}
            </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="w-full py-60 flex items-center justify-center relative z-30 pointer-events-auto">
          <div className="max-w-5xl mx-auto px-6 flex flex-col items-center w-full">
            <div className="bg-[#020204]/80 backdrop-blur-3xl border border-white/10 p-16 md:p-24 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center relative overflow-hidden group w-full">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#FF8C00] shadow-[0_0_20px_#00E5FF]"></div>
              <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready.</span></h2>
              <p className="text-gray-400 mb-16 text-2xl font-light max-w-2xl mx-auto">Available for high-impact collaborations. Initialize a secure transmission below.</p>
              <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
                <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]"></span></span>
                <span className="text-xs font-black tracking-[0.4em] uppercase text-green-400">Secure Line Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <a href="https://github.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 hover:-translate-y-2">GitHub</a>
                <a href="https://linkedin.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500 hover:-translate-y-2">LinkedIn</a>
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