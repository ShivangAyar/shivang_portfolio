import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

// --- THE MECHANICAL SNAP CORE ---
function MechanicalCore({ isAssembled }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const gridSize = 4;
  const count = gridSize ** 3;
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;

  const cubeData = useMemo(() => {
    const temp = [];
    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3(
            (Math.random() - 0.5) * (isMobile ? 25 : 45),
            (Math.random() - 0.5) * (isMobile ? 25 : 45),
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

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * (isAssembled ? 0.2 : 0.04);
    
    cubeData.forEach((data, i) => {
      const targetP = isAssembled ? data.targetPos : data.randomPos;
      const targetR = isAssembled ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);

      currentPositions[i].lerp(targetP, isAssembled ? 0.1 : 0.02);
      currentRotations[i].slerp(targetR, isAssembled ? 0.1 : 0.02);

      dummy.position.copy(currentPositions[i]);
      if (!isAssembled) {
        dummy.position.y += Math.sin(t + i) * 0.005;
      }
      dummy.quaternion.copy(currentRotations[i]);
      dummy.scale.setScalar(isAssembled ? 1 : 0.6);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[isMobile ? 0 : 2.5, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={isAssembled ? "#00E5FF" : "#020202"} roughness={0.1} metalness={0.9} emissive={isAssembled ? "#00E5FF" : "#000"} emissiveIntensity={isAssembled ? 0.5 : 0} />
      </instancedMesh>
      {isAssembled && <pointLight intensity={20} color="#FF8C00" distance={10} />}
    </group>
  );
}

// --- REACTIVE COMPETENCY CARD ---
const CompetencyCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl flex flex-col shadow-2xl"
    >
      <h3 className="text-xl font-bold text-white mb-8 tracking-tighter uppercase flex items-center gap-4">
        <span className="text-2xl">{icon}</span> {title}
      </h3>
      <div className="space-y-6 mt-auto">
        {skills.map((skill, i) => (
          <div key={i}>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
              <span>{skill.n}</span><span className="text-white">{skill.v}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-[2px] overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={isInView ? { width: skill.v } : {}}
                transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] shadow-[0_0_10px_#00E5FF]" 
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const isHeroVisible = useInView(heroRef, { amount: 0.5 });

  return (
    <div className="bg-[#010102] text-gray-200 antialiased font-sans scroll-smooth relative min-h-screen overflow-x-hidden selection:bg-[#00E5FF] selection:text-black">
      
      {/* 3D SCENE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={50} />
          <ambientLight intensity={0.5} />
          <Environment preset="night" />
          <MechanicalCore isAssembled={isHeroVisible || isHovered} />
          <ContactShadows position={[0, -10, 0]} opacity={0.4} scale={40} blur={2} far={20} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full flex flex-col">
        {/* NAV & MOBILE MENU */}
        <nav className="fixed top-0 w-full z-[100] bg-[#010102]/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-6 md:px-12">
          <div className="text-xl md:text-2xl font-black text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            SHIVANG<span className="text-[#00E5FF]">.</span>
          </div>
          <div className="hidden md:flex gap-10">
            {['Journey', 'Stacks', 'Builds', 'Connect'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-[10px] font-black tracking-widest text-gray-400 hover:text-white transition-colors uppercase">{link}</a>
            ))}
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[#00E5FF] p-2 z-[110]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/>
            </svg>
          </button>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-[105] bg-[#010102] flex flex-col items-center justify-center gap-12"
            >
              {['Journey', 'Stacks', 'Builds', 'Connect'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white uppercase tracking-tighter hover:text-[#00E5FF] transition-colors">{link}</a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION */}
        <section ref={heroRef} className="max-w-7xl mx-auto px-6 min-h-screen flex items-center relative w-full pt-20" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-4xl">
            <div className="mb-6 px-4 py-1.5 border border-[#00E5FF]/20 bg-[#00E5FF]/5 text-[#00E5FF] text-[10px] font-black tracking-[0.5em] uppercase w-fit">Architecture & Logic</div>
            <h1 className="text-6xl sm:text-8xl md:text-[9.5rem] font-black text-white mb-6 tracking-tighter leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]">Ayar.</span></h1>
            <p className="text-lg md:text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l-2 border-[#FF8C00] pl-8 leading-relaxed">Designing high-performance systems and full-stack architectures.</p>
            <div className="flex flex-col sm:flex-row gap-6">
              <a href="#builds" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-white transition-all text-center">Execute Builds</a>
              <a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all text-center">Resume ↓</a>
            </div>
          </motion.div>
        </section>

        {/* STACKS (Competencies) */}
        <section id="stacks" className="max-w-7xl mx-auto px-6 py-32 w-full">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-16 tracking-tighter uppercase">Technical <span className="text-[#00E5FF]">Arsenal.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CompetencyCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"}]} />
            <CompetencyCard title="Frontend" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML/CSS",v:"95%"},{n:"Tailwind",v:"85%"}]} />
            <CompetencyCard title="Backend" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"REST APIs",v:"90%"},{n:"WebSockets",v:"75%"}]} />
            <CompetencyCard title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"NoSQL",v:"85%"}]} />
            <CompetencyCard title="Data Arch" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"}]} />
            <CompetencyCard title="DevOps" icon="☁️" skills={[{n:"Git",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"}]} />
          </div>
        </section>

        {/* OFFLINE PROTOCOL */}
        <section className="max-w-7xl mx-auto px-6 py-32 flex flex-col w-full">
          <h2 className="text-5xl font-black text-white mb-16 tracking-tighter text-center uppercase">Offline <span className="text-[#FF8C00]">Protocol.</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focus."},
               {i:"🎮",t:"Logic",d:"Hardware tuning & mechanics."},
               {i:"🌍",t:"Equilibrium",d:"Hiking and exploration."}
            ].map((h,x)=>(
              <motion.div 
                key={x} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#0A0A12]/40 border border-white/5 p-12 rounded-[2.5rem] text-center shadow-2xl group transition-all hover:border-[#FF8C00]/40"
              >
                <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-500">{h.i}</div>
                <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">{h.t}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{h.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TERMINAL FOOTER */}
        <footer id="connect" className="w-full py-40 px-6">
          <div className="max-w-5xl mx-auto bg-[#010102]/80 backdrop-blur-3xl border border-white/10 p-12 md:p-24 rounded-[4rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]" />
            <h2 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-tight uppercase">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2>
            <div className="flex items-center justify-center gap-4 mb-20 bg-white/5 w-max mx-auto px-8 py-4 rounded-full border border-white/10">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative h-3 w-3 rounded-full bg-green-500"></span></span>
              <span className="text-[10px] font-black tracking-widest uppercase text-green-400">Available For New Builds</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <a href="https://github.com" className="bg-white/5 border border-white/10 py-5 rounded-2xl text-white font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all">GitHub</a>
              <a href="https://linkedin.com" className="bg-white/5 border border-white/10 py-5 rounded-2xl text-white font-bold tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all">LinkedIn</a>
              <a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 py-5 rounded-2xl text-white font-bold tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all">Email</a>
            </div>
            <p className="mt-32 text-center text-[10px] font-black tracking-[0.5em] text-gray-700 uppercase">© 2026 SHIVANG AYAR. ARCHITECTED WITH INTENT.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}