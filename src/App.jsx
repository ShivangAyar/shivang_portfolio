import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, ContactShadows, Points, PointMaterial, Edges, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- THE FUSION REACTOR (Assembling Logic) ---
function FusionReactor({ isHovered }) {
  const groupRef = useRef();
  const shardCount = 50; 
  
  const shards = useMemo(() => {
    const temp = [];
    for (let i = 0; i < shardCount; i++) {
      // Structure: Panels forming a technical sphere shell
      const phi = Math.acos(-1 + (2 * i) / shardCount);
      const theta = Math.sqrt(shardCount * Math.PI) * phi;
      const targetPos = new THREE.Vector3().setFromSphericalCoords(3.2, phi, theta);
      const targetRot = new THREE.Euler(phi, theta, 0);

      // Chaos: Blown out into a wide field
      const randomPos = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 18
      );
      const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      temp.push({ targetPos, targetRot, randomPos, randomRot, speed: 0.2 + Math.random() * 0.4 });
    }
    return temp;
  }, []);

  const shardRefs = useRef([]);
  const wordRefs = useRef([]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isHovered ? 0.3 : 0.05);

    shardRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const s = shards[i];
      const destPos = isHovered ? s.targetPos : s.randomPos;
      const destRot = isHovered ? s.targetRot : s.randomRot;

      mesh.position.lerp(destPos, 0.05);
      mesh.quaternion.slerp(new THREE.Quaternion().setFromEuler(destRot), 0.05);
      
      if (!isHovered) {
        mesh.position.y += Math.sin(t * s.speed) * 0.004;
      }
    });

    // Words reaction logic
    wordRefs.current.forEach((word, i) => {
        if (!word) return;
        const targetPos = isHovered ? word.userData.lockPos : word.userData.idlePos;
        word.position.lerp(targetPos, 0.05);
        word.lookAt(state.camera.position);
    });
  });

  return (
    <group ref={groupRef}>
      {shards.map((_, i) => (
        <mesh key={i} ref={(el) => (shardRefs.current[i] = el)}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshStandardMaterial 
            color={isHovered ? "#00E5FF" : "#11111a"} 
            emissive={isHovered ? "#00E5FF" : "#FF8C00"}
            emissiveIntensity={isHovered ? 3 : 0.2}
            transparent 
            opacity={isHovered ? 0.8 : 0.3}
            side={THREE.DoubleSide}
          />
          <Edges color={isHovered ? "#fff" : "#00E5FF"} opacity={0.5} />
        </mesh>
      ))}

      {/* REACTIVE HUD WORDS */}
      <AssemblableText ref={(el) => (wordRefs.current[0] = el)} text="SHIVANG" lockPos={[0, 4.5, 0]} idlePos={[-8, 6, -5]} isHovered={isHovered} />
      <AssemblableText ref={(el) => (wordRefs.current[1] = el)} text="ARCHITECTURE" lockPos={[4.5, 0, 0]} idlePos={[10, -5, -5]} isHovered={isHovered} />
      <AssemblableText ref={(el) => (wordRefs.current[2] = el)} text="MERN STACK" lockPos={[-4.5, 0, 0]} idlePos={[-10, -8, -5]} isHovered={isHovered} />
      <AssemblableText ref={(el) => (wordRefs.current[3] = el)} text="FULL-STACK" lockPos={[0, -4.5, 0]} idlePos={[8, 4, -5]} isHovered={isHovered} />

      {/* The Central Energy Core */}
      <mesh scale={isHovered ? 1.8 : 0.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial 
          color="#FF8C00" 
          emissive="#FF8C00" 
          emissiveIntensity={isHovered ? 8 : 1} 
          distort={isHovered ? 0.4 : 0.2} 
          speed={3}
        />
      </mesh>
    </group>
  );
}

const AssemblableText = React.forwardRef(({ text, lockPos, idlePos, isHovered }, ref) => {
    return (
        <Text
            ref={ref}
            userData={{ lockPos: new THREE.Vector3(...lockPos), idlePos: new THREE.Vector3(...idlePos) }}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            fontSize={isHovered ? 0.5 : 1.2}
            color="white"
            emissive="white"
            emissiveIntensity={isHovered ? 2 : 0.1}
            transparent
            opacity={isHovered ? 1 : 0.2}
        >
            {text}
        </Text>
    );
});

// --- DATA ---
const projects = [
  { title: "E-Commerce Microservices", desc: "Scaleable backend utilizing Docker, Stripe API, and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist App", desc: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF8C00" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#FF8C00" },
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

      {/* 3D SCENE */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={40} />
          <color attach="background" args={['#010102']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[mousePos.x / 100, -mousePos.y / 100, 10]} intensity={1.5} color="#00E5FF" />
          <FusionReactor isHovered={isHovered} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full z-50 bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-10">
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
        <section 
          className="max-w-7xl mx-auto px-6 min-h-screen flex items-center relative w-full pt-20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start max-w-4xl z-40">
            <div className="mb-8 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase">Architecture & Systems</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-black text-white mb-6 tracking-tighter leading-[0.9]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l border-white/10 pl-8 leading-relaxed">Designing high-performance full-stack architectures and resilient digital systems.</p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <a href="#projects" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all duration-500 shadow-xl">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-500">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY (RESTORED SPLIT LAYOUT) */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-40 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-5">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-10 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-8 text-xl font-light leading-relaxed">Born and raised in Zambia, now operating in Ottawa. My approach to engineering is purely objective: Build, Optimize, and Master.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A12]/60 border border-white/5 p-8 rounded-2xl text-center"><h3 className="text-4xl font-black text-white">3+</h3><p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2 font-black">Years</p></div>
                <div className="bg-[#0A0A12]/60 border border-white/5 p-8 rounded-2xl text-center"><h3 className="text-4xl font-black text-white">10+</h3><p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2 font-black">Builds</p></div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="lg:col-span-7 space-y-12 border-l-2 border-[#00E5FF]/20 ml-4 relative">
              {[ {i:"🎓", y:"2024 - Present", t:"Algonquin College", p:"Advanced Diploma in Computer Programming. Systems focus.", c:"#00E5FF"},
                 {i:"💻", y:"2021 - 2023", t:"Fraser International College", p:"Computer Science Pathway. Algorithmic foundations.", c:"#A855F7"}
              ].map((step, idx) => (
                <div key={idx} className="relative pl-12 group">
                  <div className={`absolute -left-[18px] top-2 w-8 h-8 rounded-full bg-[#030305] border flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(0,229,255,0.2)]`} style={{ borderColor: step.c }}>{step.i}</div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-10 rounded-3xl transition-all hover:border-white/20 shadow-2xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: step.c }}>{step.y}</span>
                    <h3 className="text-2xl font-bold text-white mt-4 tracking-tight">{step.t}</h3>
                    <p className="text-gray-400 text-base mt-4 font-light leading-relaxed">{step.p}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CORE COMPETENCIES (RESTORED 6-CARD GRID) */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 w-full">
            <h2 className="text-6xl md:text-7xl font-black text-white mb-16 tracking-tighter">Core <span className="text-[#00E5FF]">Stacks.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[ { t: "Programming", i: "💻", s: [{n: "Java", v: "90%"}, {n: "Python", v: "85%"}, {n: "JavaScript", v: "85%"}] },
                   { t: "Frontend Dev", i: "🖥️", s: [{n: "React.js", v: "90%"}, {n: "HTML5/CSS3", v: "95%"}, {n: "Tailwind", v: "85%"}] },
                   { t: "Backend & APIs", i: "⚙️", s: [{n: "Node.js", v: "85%"}, {n: "Express.js", v: "85%"}, {n: "REST APIs", v: "90%"}] },
                   { t: "Databases", i: "🗄️", s: [{n: "MongoDB", v: "85%"}, {n: "MySQL", v: "90%"}, {n: "PostgreSQL", v: "75%"}] },
                   { t: "Data Arch", i: "📊", s: [{n: "Power BI", v: "90%"}, {n: "DAX", v: "85%"}, {n: "Star Schema", v: "85%"}] },
                   { t: "Cloud & DevOps", i: "☁️", s: [{n: "Git / GitHub", v: "95%"}, {n: "AWS", v: "80%"}, {n: "Docker", v: "75%"}] }
                ].map((card, idx) => (
                    <div key={idx} className="bg-[#0A0A12]/40 border border-white/5 p-10 rounded-3xl hover:border-[#00E5FF]/40 transition-all shadow-2xl group flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-8 tracking-tighter uppercase flex items-center gap-4">
                            <span className="text-2xl">{card.i}</span> {card.t}
                        </h3>
                        <div className="space-y-6 mt-auto">
                            {card.s.map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2"><span>{skill.n}</span><span className="text-white">{skill.v}</span></div>
                                    <div className="w-full bg-white/5 rounded-full h-[2px] overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] transition-all duration-1000 w-0 group-hover:w-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" style={{ maxWidth: skill.v }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* PROJECTS (RESTORED 6 PROJECTS + HOVER) */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-40">
            <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right">System <span className="text-[#FF8C00]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:2000px]">
                {projects.map((p, i) => (
                    <motion.div 
                        key={i} 
                        className="bg-[#0A0A12]/40 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden h-[420px] flex flex-col group cursor-pointer"
                        whileHover={{ y: -15, rotateX: -7, rotateY: 7, borderColor: `${p.color}30`, boxShadow: `0 30px 60px ${p.color}15` }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
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

        {/* TERMINAL FOOTER */}
        <footer id="contact" className="w-full py-60 flex items-center justify-center relative z-30">
          <div className="max-w-5xl mx-auto px-6 flex flex-col items-center w-full">
            <div className="bg-[#010102]/80 backdrop-blur-3xl border border-white/10 p-16 md:p-24 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center relative overflow-hidden group w-full">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" />
              <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-tight">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2>
              <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
                <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]"></span></span>
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-green-400">Secure Transmission Line</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <a href="https://github.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 hover:-translate-y-2">GitHub</a>
                <a href="https://linkedin.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500 hover:-translate-y-2">LinkedIn</a>
                <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all duration-500 hover:-translate-y-2">Email</a>
              </div>
            </div>
            <p className="mt-32 text-center text-[11px] font-black tracking-[0.8em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}