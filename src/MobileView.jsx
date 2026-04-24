import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import * as THREE from 'three';

const projectData = [
  { title: "Microservices", d: "Scalable ecosystem using Node.js/Docker. Integrated Stripe API and JWT auth.", t: ["Node.js", "Docker", "Stripe"] },
  { title: "Watchlist App", d: "MERN tracking app. Designed RESTful API and utilized MongoDB NoSQL architecture.", t: ["MongoDB", "Express", "Node"] },
  { title: "Real-Time Collab", d: "Synchronized workspace using Socket.io and Next.js with high-performance Redis.", t: ["Socket.io", "Next.js", "Redis"] },
  { title: "Voice AI Bot", d: "AI chatbot with emotion recognition logic. Leveraged OpenAI models and WebRTC.", t: ["React", "OpenAI", "WebRTC"] },
  { title: "DevOps Metrics", d: "Monitoring platform for GitHub Actions and AWS using Python ETL pipelines.", t: ["AWS", "Python", "GitHub"] },
  { title: "AI Generator", d: "SaaS platform for AI image generation featuring a credit-based user system.", t: ["Tailwind", "React", "DALL-E"] }
];

function Core({ scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const isAssembled = scrollY < 120;
  const cubeData = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 64; i++) {
      const targetPos = new THREE.Vector3((i%4)-1.5, (Math.floor(i/4)%4)-1.5, (Math.floor(i/16)%4)-1.5).multiplyScalar(1.05);
      const randomPos = new THREE.Vector3((Math.random()-0.5)*30, (Math.random()-0.5)*30, (Math.random()-0.5)*20);
      const randomRot = new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
      temp.push({ targetPos, randomPos, randomRot });
    }
    return temp;
  }, []);
  const dummy = new THREE.Object3D();
  const cP = useMemo(() => cubeData.map(d => d.randomPos.clone()), []);
  const cR = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), []);
  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * (isAssembled ? 0.3 : 0.03);
    cubeData.forEach((data, i) => {
      const tP = isAssembled ? data.targetPos : data.randomPos;
      const tR = isAssembled ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      cP[i].lerp(tP, isAssembled ? 0.12 : 0.01); cR[i].slerp(tR, isAssembled ? 0.12 : 0.01);
      dummy.position.copy(cP[i]); if (!isAssembled) dummy.position.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
      dummy.quaternion.copy(cR[i]); dummy.scale.setScalar(isAssembled ? 1 : 0.65);
      dummy.updateMatrix(); meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (<group ref={groupRef} position={[0, 0, 0]}><instancedMesh ref={meshRef} args={[null, null, 64]}><boxGeometry args={[0.9, 0.9, 0.9]} /><meshStandardMaterial color="#00E5FF" metalness={1} roughness={0.1} emissive={isAssembled ? "#00E5FF" : "#000"} emissiveIntensity={0.5} /></instancedMesh>{isAssembled && <pointLight intensity={15} color="#FF8C00" distance={12} />}</group>);
}

const CompCard = ({ title, icon, skills }) => {
  const ref = useRef(null);
  const active = useInView(ref, { amount: 0.4 });
  return (
    <div ref={ref} className="bg-[#050507]/60 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-10 text-white"><h3 className="text-xl font-black uppercase tracking-widest">{title}</h3><span className="text-3xl">{icon}</span></div>
      <div className="space-y-10 mt-auto">
        {skills.map((s, i) => (
          <div key={i}><div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase mb-3 transition-colors" style={{ color: active ? 'white' : '' }}><span>{s.n}</span><span style={{ color: active ? '#00E5FF' : '' }}>{s.v}</span></div>
            <div className="flex gap-2 h-[5px] overflow-hidden bg-white/2 rounded-full">{[...Array(10)].map((_, idx) => (
              <motion.div key={idx} initial={{ backgroundColor: "#14141B" }} animate={active ? { backgroundColor: idx * 10 < parseInt(s.v) ? "#00E5FF" : "#14141B" } : { backgroundColor: "#14141B" }} transition={{ delay: active ? (idx * 0.04 + i * 0.1) : 0 }} className="flex-1 rounded-sm" style={{ backgroundImage: active && idx * 10 < parseInt(s.v) ? 'linear-gradient(to right, #00E5FF, #FF8C00)' : 'none' }} />
            ))}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MobileView() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const handleScroll = () => setScrollY(window.scrollY); window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }, []);
  return (
    <div className="min-h-screen bg-[#010102] text-gray-200 overflow-x-hidden touch-pan-y">
      <div className="fixed inset-0 z-[-1] pointer-events-none"><Canvas dpr={[1, 2]}><PerspectiveCamera makeDefault position={[0, 0, 35]} fov={75} /><ambientLight intensity={0.5} /><Core scrollY={scrollY} /><ContactShadows position={[0, -12, 0]} opacity={0.4} scale={50} blur={3} far={20} color="#00E5FF" /></Canvas></div>
      <div className="relative z-10 w-full flex flex-col px-6">
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#010102]/70 backdrop-blur-3xl border-b border-white/5 h-20 flex items-center justify-between px-6"><div className="text-xl font-black text-white">SHIVANG<span className="text-[#00E5FF]">.</span></div><button onClick={() => setIsMenuOpen(true)} className="text-[#00E5FF] p-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg></button></nav>
        <AnimatePresence>{isMenuOpen && (<motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 z-[200] bg-[#010102] flex flex-col items-center justify-center gap-12"><button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-[#00E5FF]"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>{["Journey", "Stacks", "Builds", "Offline", "Connect"].map(t => <a key={t} href={`#${t.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-3xl font-black tracking-widest uppercase">{t}</a>)}</motion.div>)}</AnimatePresence>
        <section className="min-h-screen flex items-center pt-20"><div><h1 className="text-6xl font-black text-white mb-6 leading-none tracking-tighter">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]">Ayar.</span></h1><p className="text-lg text-gray-400 mb-12 border-l-2 border-[#FF8C00] pl-6 leading-relaxed">Designing high-performance full-stack architectures.</p><div className="flex flex-col gap-6"><a href="#builds" className="bg-white text-black px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest">Execute Builds</a><a href="/resume.pdf" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black uppercase text-center tracking-widest">Resume ↓</a></div></div></section>
        <section id="journey" className="py-32 space-y-12 border-l-2 border-[#00E5FF]/20 ml-2">
          {[{y:"2024 - PRES", t:"Algonquin College", d:"Advanced Diploma in Computer Programming. Focused on Enterprise Microservices."}, {y:"2021 - 2023", t:"FIC | BC", d:"Computer Science Pathway. Deep-dive into Big O efficiency and OOP logic."}].map((item, idx) => (
            <div key={idx} className="relative pl-10"><div className={`absolute -left-[11px] top-2 w-5 h-5 rounded-full shadow-[0_0_15px_#00E5FF] ${idx === 0 ? 'bg-[#00E5FF]' : 'bg-purple-500'}`} /><div className="bg-[#050507]/40 p-8 rounded-[3rem] border border-white/5 shadow-2xl"><span className="text-[10px] font-black text-gray-500 tracking-[0.3em]">{item.y}</span><h3 className="text-2xl font-black text-white mt-4 tracking-tight">{item.t}</h3><p className="text-gray-400 text-lg mt-4 font-light leading-relaxed">{item.d}</p></div></div>
          ))}
        </section>
        <section id="stacks" className="py-20 space-y-8"><h2 className="text-6xl font-black text-white mb-16 tracking-tighter uppercase text-center">Arsenal.</h2>
          <CompCard title="Lang" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"}]} /><CompCard title="Front" icon="🖥️" skills={[{n:"React",v:"90%"},{n:"HTML",v:"95%"},{n:"Tailwind",v:"85%"}]} /><CompCard title="Back" icon="⚙️" skills={[{n:"Node",v:"85%"},{n:"REST",v:"90%"},{n:"WS",v:"75%"}]} />
        </section>
        <section id="builds" className="py-40 space-y-10">{projectData.map((p, i) => (
          <div key={i} className="bg-[#050507]/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden"><div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00E5FF]/20 m-6" /><h3 className="text-3xl font-black text-white mb-6 uppercase leading-tight tracking-tighter">{p.title}</h3><p className="text-gray-400 text-lg mb-8 leading-relaxed">{p.d}</p><div className="flex flex-wrap gap-2">{p.t.map(tag => <span key={tag} className="text-[9px] font-black border border-white/10 px-4 py-1.5 rounded-full uppercase tracking-widest">{tag}</span>)}</div></div>
        ))}</section>
        <section id="offline" className="py-32 space-y-8 text-center">{[{i:"🏋️‍♂️",t:"Iron",d:"6-day compound split focus."}, {i:"🎮",t:"Logic",d:"Hardware tuning & shooters."}, {i:"🌍",t:"Nature",d:"Hiking to clear the buffer."}].map((h,x)=>(
          <motion.div key={x} initial={{scale:0.95, opacity: 0}} whileInView={{scale:1, opacity: 1}} className="bg-[#050507]/40 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl"><div className="text-7xl mb-10">{h.i}</div><h3 className="text-2xl font-black text-white uppercase tracking-widest">{h.t}</h3><p className="text-gray-500 text-lg mt-6 font-light leading-relaxed">{h.d}</p></motion.div>
        ))}</section>
        <footer id="connect" className="py-40 flex items-center justify-center">
          <div className="w-full bg-[#020203] border-2 border-[#00E5FF]/40 p-12 rounded-[5rem] shadow-2xl text-center relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]" /><h2 className="text-6xl font-black text-white mb-10 tracking-tighter uppercase leading-none">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2><div className="flex flex-col gap-6 mt-10"><a href="https://github.com/ayarshivang27" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase">GitHub</a><a href="https://linkedin.com/in/shivangayar/" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase">LinkedIn</a><a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase">Email</a></div><p className="mt-40 text-[10px] font-black tracking-[1.5em] text-gray-800 uppercase">© 2026 SHIVANG AYAR. CRAFTED WITH INTENT.</p></div>
        </footer>
      </div>
    </div>
  );
}