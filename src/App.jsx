import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows, MeshDistortMaterial, Sphere } from '@react-three/drei';
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
  return <pointLight ref={lightRef} intensity={25} color="#00E5FF" distance={30} />;
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
      <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} />
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
            emissive="#FF3366"
            emissiveIntensity={0.1}
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

// --- 3D BACKGROUND TEXT ---
function FloatingWord({ children, position, rotation, scale = 1, color = "#11111a" }) {
  const textRef = useRef();
  useFrame((state) => {
    textRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5) * 0.005;
  });
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        ref={textRef} position={position} rotation={rotation} scale={scale}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        {children}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
      </Text>
    </Float>
  );
}

const projects = [
  { title: "E-Commerce Microservices", desc: "Scaleable backend utilizing Docker containers, Stripe API, and JWT auth.", tags: ["Node.js", "Docker", "Stripe"], color: "#00E5FF" },
  { title: "Movie Watchlist Web App", desc: "Full-stack media tracker via RESTful APIs and NoSQL architecture.", tags: ["MongoDB", "Express", "Node"], color: "#FF3366" },
  { title: "Real-Time Collab Workspace", desc: "Live-syncing environment using WebSockets for real-time document editing.", tags: ["Socket.io", "Next.js", "Redis"], color: "#A855F7" },
  { title: "Voice AI Chatbot", desc: "Emotion-aware chatbot integrating OpenAI and Voice APIs with a high-performance backend.", tags: ["React", "OpenAI", "WebRTC"], color: "#00E5FF" },
  { title: "DevOps CI/CD Dashboard", desc: "Centralized command center for GitHub Actions and AWS deployment metrics.", tags: ["AWS", "Python", "GitHub"], color: "#EAB308" },
  { title: "AI SaaS Image Generator", desc: "SaaS wrapping OpenAI API featuring user credits and asynchronous generation.", tags: ["Tailwind", "React", "DALL-E"], color: "#FF3366" }
];

const NavLink = ({ href, children }) => (
  <a href={href} className="group relative py-2 text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase transition-colors hover:text-white">
    {children}
    <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#00E5FF] to-[#FF3366] transition-transform duration-500 ease-out group-hover:scale-x-100 shadow-[0_0_15px_#00E5FF]" />
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
      
      {/* HTML SPOTLIGHT */}
      <div className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{ background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.1), transparent 80%)` }} />

      {/* TECH GRID */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.04]" 
        style={{ backgroundImage: `linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      {/* 3D SCENE */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }} shadows>
          <color attach="background" args={['#020204']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#FF3366" />
          <directionalLight position={[-10, -10, 5]} intensity={0.5} color="#00E5FF" />
          <CursorLight />
          <Environment preset="night" />
          <CentralReactiveShape />
          
          <FloatingWord position={[-9, 7, -10]} rotation={[0, 0.1, 0]} scale={1.2} color="#151525">ARCHITECTURE</FloatingWord>
          <FloatingWord position={[9, -6, -8]} rotation={[0, -0.2, 0]} scale={1} color="#151525">FULL-STACK</FloatingWord>
          <FloatingWord position={[-7, -9, -12]} rotation={[0, 0.3, 0]} scale={1.5} color="#151525">MERN STACK</FloatingWord>
          <FloatingWord position={[0, -14, -18]} rotation={[-0.1, 0, 0]} scale={3} color="#151525">SHIVANG</FloatingWord>

          <ContactShadows position={[0, -9, 0]} opacity={0.7} scale={40} blur={2} far={10} color="#00E5FF" />
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
            <div className="mb-6 px-4 py-1 border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.4em] uppercase shadow-[0_0_15px_rgba(0,229,255,0.2)]">System Architect</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9.5rem] font-black text-white mb-4 tracking-tighter leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF3366]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-8 mb-12 leading-relaxed font-light max-w-2xl border-l-2 border-[#FF3366] pl-6">Engineering scalable digital ecosystems with immersive architectures.</p>
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
              <p className="text-gray-400 mb-8 text-xl font-light leading-relaxed">Born and raised in Zambia, now engineering software in Canada. I build with a focus on constant progression and mastery.</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0A0A12]/80 border border-white/5 p-8 rounded-3xl text-center shadow-2xl group hover:border-[#00E5FF]/40 transition-all">
                  <h3 className="text-5xl font-black text-white group-hover:text-[#00E5FF] transition-colors">3+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-bold">Years Coding</p>
                </div>
                <div className="bg-[#0A0A12]/80 border border-white/5 p-8 rounded-3xl text-center shadow-2xl group hover:border-[#FF3366]/40 transition-all">
                  <h3 className="text-5xl font-black text-white group-hover:text-[#FF3366] transition-colors">10+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-bold">System Builds</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7 space-y-12 border-l-2 border-[#00E5FF]/20 ml-4 relative">
              <div className="relative pl-12 group">
                <div className="absolute -left-[21px] top-2 w-10 h-10 rounded-full bg-[#020204] border-2 border-[#00E5FF] flex items-center justify-center shadow-[0_0_15px_#00E5FF]">🎓</div>
                <div className="bg-[#0A0A12]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] hover:border-white/20 transition-all">
                  <span className="text-[10px] font-black uppercase text-[#00E5FF]">2024 - Present</span>
                  <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">Algonquin College | Ottawa</h3>
                  <p className="text-gray-400 text-lg mt-4 font-light">Advanced Diploma in Computer Programming. Enterprise focus.</p>
                </div>
              </div>
              <div className="relative pl-12 group">
                <div className="absolute -left-[21px] top-2 w-10 h-10 rounded-full bg-[#020204] border-2 border-purple-500 flex items-center justify-center">💻</div>
                <div className="bg-[#0A0A12]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] hover:border-white/20 transition-all">
                  <span className="text-[10px] font-black uppercase text-purple-400">2021 - 2023</span>
                  <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">Fraser International College | BC</h3>
                  <p className="text-gray-400 text-lg mt-4 font-light">Computer Science Pathway. Algorithm design engineering.</p>
                </div>
              </div>
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
                        <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF3366] transition-all duration-[1.5s] w-0 group-hover:w-full shadow-[0_0_15px_#00E5FF]" style={{ maxWidth: skill.v }}></div>
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
              <motion.div key={i} className="bg-[#0A0A12]/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden h-[400px] flex flex-col group"
                whileHover={{ y: -20, rotateX: -10, rotateY: 10, borderColor: `${p.color}50`, boxShadow: `0 40px 100px ${p.color}15` }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full opacity-5 group-hover:opacity-20 transition-all duration-700" style={{ background: p.color }}></div>
                <h3 className="text-3xl font-bold text-white mb-6 tracking-tighter">{p.title}</h3>
                <p className="text-gray-400 text-lg font-light leading-relaxed mb-auto">{p.desc}</p>
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
            <h2 className="text-6xl font-black text-white mb-16 tracking-tighter text-center">Offline <span className="text-[#FF3366]">Protocol.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
              {[ {i:"🏋️‍♂️",t:"Iron & Discipline",d:"6-day split focus on heavy compound progression."},
                 {i:"🎮",t:"Gaming & Logic",d:"Strategy, PC optimization and competitive mechanics."},
                 {i:"🌍",t:"Hiking & Travel",d:"Trail exploration and seeking new perspectives."}
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
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] via-[#A855F7] to-[#FF3366] shadow-[0_0_20px_#00E5FF]"></div>
              <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">Terminal <span className="text-[#00E5FF]">Ready.</span></h2>
              <p className="text-gray-400 mb-16 text-2xl font-light max-w-2xl mx-auto">Currently available for high-impact collaborations.</p>
              <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-12 py-5 rounded-full border border-white/10">
                <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-4 w-4 rounded-full bg-green-500 shadow-[0_0_15px_#4ade80]"></span></span>
                <span className="text-xs font-black tracking-[0.4em] uppercase text-green-400">Secure Line Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <a href="https://github.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500 hover:-translate-y-2">GitHub</a>
                <a href="https://linkedin.com" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500 hover:-translate-y-2">LinkedIn</a>
                <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF3366] hover:text-black transition-all duration-500 hover:-translate-y-2">Email</a>
              </div>
            </div>
            <p className="mt-32 text-center text-[11px] font-black tracking-[0.8em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </section>

      </div>
    </div>
  );
}