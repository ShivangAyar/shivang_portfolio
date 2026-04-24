import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';

// --- THE MECHANICAL SNAP CORE ---
function MechanicalCore({ isHovered, isMobile, scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;

  // Assembly logic: On mobile, only assemble at the very top. On desktop, assemble on hover.
  const isAssembled = isMobile ? (scrollY < 100) : isHovered;

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3(
            (Math.random() - 0.5) * (isMobile ? 30 : 50),
            (Math.random() - 0.5) * (isMobile ? 30 : 50),
            (Math.random() - 0.5) * 20
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
    { text: "SHIVANG", offset: [0, 4.8, 0], p: 0.1 },
    { text: "ARCHITECTURE", offset: [6.5, 0, 0], p: 0.5 },
    { text: "MERN STACK", offset: [-6.5, 0, 0], p: 0.8 },
    { text: "FULL-STACK", offset: [0, -4.8, 0], p: 1.2 }
  ], []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isAssembled ? 0.2 : 0.04);
    
    cubeData.forEach((data, i) => {
      const targetP = isAssembled ? data.targetPos : data.randomPos;
      const targetR = isAssembled ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      
      currentPositions[i].lerp(targetP, isAssembled ? 0.1 : 0.015);
      currentRotations[i].slerp(targetR, isAssembled ? 0.1 : 0.015);
      
      dummy.position.copy(currentPositions[i]);
      dummy.quaternion.copy(currentRotations[i]);
      dummy.scale.setScalar(isAssembled ? 1 : 0.65);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[isMobile ? 0 : 3.5, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={isAssembled ? "#002A2A" : "#050505"} roughness={0} metalness={1} />
      </instancedMesh>
      {isAssembled && <pointLight intensity={15} color="#FF8C00" distance={12} />}
      {words.map((w, i) => (
        <FloatingHUDText key={i} text={w.text} isAssembled={isAssembled} offset={w.offset} phase={w.p} isMobile={isMobile} />
      ))}
    </group>
  );
}

function FloatingHUDText({ text, isAssembled, offset, phase, isMobile }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      const driftX = Math.sin(t * 0.3 + phase) * (isAssembled ? 0.6 : 15);
      const driftY = Math.cos(t * 0.3 + phase) * (isAssembled ? 0.6 : 12);
      ref.current.position.lerp(new THREE.Vector3(offset[0] + driftX, offset[1] + driftY, isAssembled ? 0 : -8), 0.03);
      ref.current.lookAt(state.camera.position);
    }
  });
  return (
    <Text ref={ref} fontSize={isMobile ? 0.45 : 0.55} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" color="#00E5FF" emissive="#00E5FF" emissiveIntensity={isAssembled ? 5 : 0.15} transparent opacity={isAssembled ? 1 : 0.2}>
      {text}
    </Text>
  );
}

// --- DASHBOARD UI COMPONENTS ---
const CompetencyCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  return (
    <motion.div 
      ref={ref} 
      whileHover={{ y: -5, borderColor: "rgba(0, 229, 255, 0.3)" }}
      className="bg-[#0A0A12]/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 transition-all duration-500 shadow-2xl group relative"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 text-3xl group-hover:opacity-30 transition-opacity">{icon}</div>
      <h3 className="text-sm font-black text-white mb-10 tracking-[0.4em] uppercase flex items-center gap-3">
        <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF]" /> {title}
      </h3>
      <div className="space-y-8">
        {skills.map((s, i) => (
          <div key={i} className="relative">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest group-hover:text-gray-300 transition-colors">
              <span>{s.n}</span><span className="text-[#00E5FF]">{s.v}</span>
            </div>
            <div className="flex gap-1.5 h-[5px]">
              {[...Array(12)].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ backgroundColor: "#14141B" }}
                  animate={isInView ? { backgroundColor: idx * (100/12) < parseInt(s.v) ? "#00E5FF" : "#14141B" } : {}}
                  transition={{ delay: idx * 0.05 + i * 0.1, duration: 0.4 }}
                  className="flex-1 rounded-sm group-hover:shadow-[0_0_8px_rgba(0,229,255,0.4)] transition-all"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const projectData = [
  { title: "E-Commerce Microservices", desc: "Scaleable backend utilizing Docker, Stripe API, and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist App", desc: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF8C00" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#FF8C00" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI featuring user credits and async generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF8C00" }
];

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    const handleScroll = () => setScrollY(window.scrollY);
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
      
      {/* 2D LIGHT TRACKER (LAPTOP ONLY) */}
      {!isMobile && (
        <div className="pointer-events-none fixed inset-0 z-20"
          style={{ background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.04), transparent 85%)` }} />
      )}

      {/* 3D SCENE - Positioned to side on Laptop, Center on Mobile */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 24 : 18]} fov={isMobile ? 65 : 45} />
          <color attach="background" args={['#010102']} />
          <ambientLight intensity={0.5} />
          <MechanicalCore isHovered={isHovered} isMobile={isMobile} scrollY={scrollY} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={50} blur={2} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full z-[100] bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 md:h-24 flex items-center justify-between px-8 md:px-16">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <div className="hidden md:flex gap-12">
            <a href="#about" className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#00E5FF] transition-colors">JOURNEY</a>
            <a href="#skills" className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#00E5FF] transition-colors">STACKS</a>
            <a href="#projects" className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#00E5FF] transition-colors">BUILDS</a>
            <a href="#contact" className="text-[10px] font-black tracking-widest text-gray-500 hover:text-[#00E5FF] transition-colors">CONNECT</a>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white p-2">
            <div className="w-6 h-4 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-[#00E5FF] transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`h-0.5 w-full bg-[#00E5FF] ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-full bg-[#00E5FF] transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[90] bg-[#010102]/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-12">
              <a href="#about" onClick={()=>setIsMenuOpen(false)} className="text-3xl font-black tracking-widest">JOURNEY</a>
              <a href="#skills" onClick={()=>setIsMenuOpen(false)} className="text-3xl font-black tracking-widest">STACKS</a>
              <a href="#projects" onClick={()=>setIsMenuOpen(false)} className="text-3xl font-black tracking-widest">BUILDS</a>
              <a href="#contact" onClick={()=>setIsMenuOpen(false)} className="text-3xl font-black tracking-widest text-[#00E5FF]">CONNECT</a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-8 min-h-screen flex items-center relative w-full pt-20" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex flex-col items-start max-w-4xl z-40">
            <div className="mb-6 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase">Architecting Digital Ecosystems</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9.5rem] font-black text-white mb-4 tracking-tighter leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l-2 border-[#FF8C00] pl-8 leading-relaxed">Designing high-performance full-stack architectures and resilient systems.</p>
            <div className="flex gap-6 pointer-events-auto">
              <a href="#projects" className="bg-white text-black px-10 py-5 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-[#00E5FF] hover:text-white transition-all shadow-2xl">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-10 py-5 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* ABOUT & JOURNEY */}
        <section id="about" className="max-w-7xl mx-auto px-10 py-40 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5">
              <h2 className="text-6xl font-black text-white mb-10 tracking-tighter">The <span className="text-[#00E5FF]">Mindset.</span></h2>
              <p className="text-gray-400 text-xl font-light leading-relaxed mb-12">Born in Zambia, operating in Ottawa. My approach is purely objective: Build, Optimize, Master.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-10 rounded-[2rem] border border-white/5"><h3 className="text-5xl font-black text-white">3+</h3><p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2 font-black">Years</p></div>
                <div className="bg-white/5 p-10 rounded-[2rem] border border-white/5"><h3 className="text-5xl font-black text-white">10+</h3><p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2 font-black">Builds</p></div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-[#00E5FF]/30 transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00E5FF] opacity-50" />
                <span className="text-[10px] font-bold text-[#00E5FF] tracking-[0.4em]">2024 - PRESENT</span>
                <h3 className="text-3xl font-black text-white mt-4 tracking-tight">Algonquin College</h3>
                <p className="text-gray-400 text-lg mt-4 font-light leading-relaxed">Advanced Diploma in Computer Programming. Focus on enterprise architecture and high-performance logic.</p>
              </div>
              <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-50" />
                <span className="text-[10px] font-bold text-purple-500 tracking-[0.4em]">2021 - 2023</span>
                <h3 className="text-3xl font-black text-white mt-4 tracking-tight">Fraser International College</h3>
                <p className="text-gray-400 text-lg mt-4 font-light leading-relaxed">Computer Science Pathway. Rigorous foundational expertise in algorithmic design and systems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPETENCIES */}
        <section id="skills" className="max-w-7xl mx-auto px-10 py-20 w-full">
          <h2 className="text-6xl md:text-7xl font-black text-white mb-16 tracking-tighter">Technical <span className="text-[#00E5FF]">Arsenal.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CompetencyCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JavaScript",v:"85%"},{n:"C#",v:"70%"}]} />
            <CompetencyCard title="Frontend" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML5/CSS3",v:"95%"},{n:"Tailwind",v:"85%"},{n:"Next.js",v:"80%"}]} />
            <CompetencyCard title="Backend" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"Express.js",v:"85%"},{n:"REST APIs",v:"90%"},{n:"WebSockets",v:"75%"}]} />
            <CompetencyCard title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"PostgreSQL",v:"75%"},{n:"NoSQL",v:"85%"}]} />
            <CompetencyCard title="Analytics" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"},{n:"ETL",v:"80%"}]} />
            <CompetencyCard title="DevOps" icon="☁️" skills={[{n:"GitHub",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"},{n:"CI/CD",v:"85%"}]} />
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="max-w-7xl mx-auto px-10 py-40">
          <h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right">System <span className="text-[#FF8C00]">Builds.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projectData.map((p, i) => (
              <motion.div key={i} whileHover={{ y: -15 }} className="bg-[#0A0A12]/60 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden h-[480px] flex flex-col group cursor-pointer shadow-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00E5FF]/20 m-6 group-hover:border-[#00E5FF] transition-all" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF8C00]/20 m-6 group-hover:border-[#FF8C00] transition-all" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/5 to-transparent h-40 w-full -translate-y-full group-hover:animate-scanline" />
                <h3 className="text-3xl font-black text-white mb-6 tracking-tight leading-tight uppercase">{p.title}</h3>
                <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto">{p.desc}</p>
                <div className="flex flex-wrap gap-2 mt-8">
                  {p.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-black border border-white/10 px-4 py-1.5 rounded-full uppercase text-gray-500 group-hover:text-white group-hover:border-[#00E5FF]/50 transition-all">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-10 py-40 w-full text-center">
            <h2 className="text-6xl font-black text-white mb-20 tracking-tighter italic">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focus."},
                 {i:"🎮",t:"Logic",d:"Hardware tuning & mechanics."},
                 {i:"🌍",t:"Equilibrium",d:"Hiking to clear the buffer."}
              ].map((h,x)=>(
                <div key={x} className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 hover:border-[#FF8C00]/40 transition-all duration-500 group shadow-2xl">
                  <div className="text-7xl mb-8 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">{h.i}</div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">{h.t}</h3>
                  <p className="text-gray-500 text-lg mt-4 font-light">{h.d}</p>
                </div>
              ))}
            </div>
        </section>

        {/* COMMAND CENTER FOOTER */}
        <footer id="contact" className="w-full py-60 flex items-center justify-center px-10">
          <div className="max-w-6xl w-full bg-[#030305] border border-white/10 p-16 md:p-24 rounded-[4.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-10 text-[8px] font-mono text-gray-700 text-left uppercase hidden md:block leading-loose opacity-40">System_Ready: true<br/>User_Auth: true<br/>Location: Ottawa_CA</div>
            <div className="absolute top-0 right-0 p-10 text-[8px] font-mono text-gray-700 text-right uppercase hidden md:block leading-loose opacity-40">Latency: 12ms<br/>Encryption: AES-256<br/>Status: Scanning...</div>
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00] shadow-[0_0_20px_#00E5FF]" />
            <h2 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2>
            <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
              <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]" /></span>
              <span className="text-[10px] font-black tracking-[0.5em] uppercase text-green-400">System Connected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-50">
              <a href="https://github.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500">GitHub</a>
              <a href="https://linkedin.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500">LinkedIn</a>
              <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all duration-500">Email</a>
            </div>
            <p className="mt-32 text-[10px] font-black tracking-[1em] text-gray-800 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </footer>

      </div>

      <style>{`
        @keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(300%); } }
        .animate-scanline { animation: scanline 3s linear infinite; }
        html, body { touch-action: pan-y; -webkit-overflow-scrolling: touch; background: #010102; overflow-x: hidden; }
      `}</style>
    </div>
  );
}