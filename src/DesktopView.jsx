import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const projectData = [
  { title: "E-Commerce Microservices", d: "Architected a scalable microservices ecosystem using Node.js and Docker. Integrated Stripe API for secure payment processing and implemented JWT-based authentication for enterprise-grade security.", t: ["Node.js", "Docker", "Stripe"] },
  { title: "Movie Watchlist App", d: "Engineered a full-stack media tracking application using the MERN stack. Designed a robust RESTful API to manage user watchlists and utilized MongoDB's NoSQL architecture for high-speed retrieval.", t: ["MongoDB", "Express", "Node"] },
  { title: "Real-Time Collaboration", d: "Developed a synchronized workspace using Socket.io and Next.js. Implemented real-time document editing and instant messaging through WebSockets, backed by a performance Redis caching layer.", t: ["Socket.io", "Next.js", "Redis"] },
  { title: "Voice AI Chatbot", d: "Built an advanced AI chatbot with integrated emotion recognition logic. Leveraged OpenAI's GPT models and WebRTC for low-latency voice communication and immersive user experience.", t: ["React", "OpenAI", "WebRTC"] },
  { title: "DevOps Metrics Hub", d: "Constructed a monitoring platform for GitHub Actions and AWS infrastructure. Developed an automated ETL pipeline using Python to aggregate and visualize deployment metrics on a custom Power BI dashboard.", t: ["AWS", "Python", "GitHub"] },
  { title: "AI SaaS Generator", d: "Launched a SaaS platform for asynchronous AI image generation. Built with React and Tailwind CSS, featuring a credit-based user system and multi-modal API integration with OpenAI.", t: ["Tailwind", "React", "DALL-E"] }
];

function Core({ isHovered, scrollY }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const isAssembled = isHovered && scrollY < 150;

  const cubeData = useMemo(() => {
    const temp = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        for (let z = 0; z < 4; z++) {
          const targetPos = new THREE.Vector3(x - 1.5, y - 1.5, z - 1.5).multiplyScalar(1.05);
          const randomPos = new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 25);
          const randomRot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          temp.push({ targetPos, randomPos, randomRot });
        }
      }
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();
  const currentPositions = useMemo(() => cubeData.map(d => d.randomPos.clone()), []);
  const currentRotations = useMemo(() => cubeData.map(d => new THREE.Quaternion().setFromEuler(d.randomRot)), []);

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * (isAssembled ? 0.3 : 0.05);
    cubeData.forEach((data, i) => {
      const targetP = isAssembled ? data.targetPos : data.randomPos;
      const targetR = isAssembled ? new THREE.Quaternion().set(0, 0, 0, 1) : new THREE.Quaternion().setFromEuler(data.randomRot);
      currentPositions[i].lerp(targetP, isAssembled ? 0.12 : 0.015);
      currentRotations[i].slerp(targetR, isAssembled ? 0.12 : 0.015);
      dummy.position.copy(currentPositions[i]);
      dummy.quaternion.copy(currentRotations[i]);
      dummy.scale.setScalar(isAssembled ? 1 : 0.6);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[4.5, 0, 0]}>
      <instancedMesh ref={meshRef} args={[null, null, 64]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#00E5FF" metalness={1} roughness={0.05} emissive={isAssembled ? "#00E5FF" : "#000"} emissiveIntensity={0.5} />
      </instancedMesh>
      {isAssembled && <pointLight intensity={30} color="#FF8C00" distance={15} />}
      {["SHIVANG", "ARCHITECTURE", "LOGIC", "SYSTEMS"].map((t, i) => (
        <Label key={t} text={t} offset={[[0, 5, 0], [8, 0, 0], [-8, -2, 0], [0, -5, 0]][i]} isAssembled={isAssembled} p={i * 0.5} />
      ))}
    </group>
  );
}

function Label({ text, offset, isAssembled, p }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const dX = Math.sin(t * 0.2 + p) * (isAssembled ? 0.5 : 25);
      const dY = Math.cos(t * 0.2 + p) * (isAssembled ? 0.5 : 20);
      ref.current.position.lerp(new THREE.Vector3(offset[0] + dX, offset[1] + dY, isAssembled ? 0 : -15), 0.03);
      ref.current.lookAt(state.camera.position);
    }
  });
  return <Text ref={ref} fontSize={0.7} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf" color="#00E5FF" emissive="#00E5FF" emissiveIntensity={isAssembled ? 5 : 0.1} transparent opacity={isAssembled ? 1 : 0.15} />;
}

const CompCard = ({ title, icon, skills }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="bg-[#0A0A12]/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-700 shadow-2xl group flex flex-col h-[420px]">
      <div className="flex justify-between items-center mb-10 text-white"><h3 className="text-xl font-black tracking-widest uppercase">{title}</h3><span className="text-3xl">{icon}</span></div>
      <div className="space-y-10 mt-auto">
        {skills.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase mb-3 tracking-widest transition-colors" style={{ color: hover ? 'white' : '' }}><span>{s.n}</span><span style={{ color: hover ? '#00E5FF' : '' }}>{s.v}</span></div>
            <div className="flex gap-2 h-[5px] overflow-hidden bg-white/2 rounded-full">
              {[...Array(12)].map((_, idx) => (
                <motion.div key={idx} initial={{ backgroundColor: "#14141B" }} animate={hover ? { backgroundColor: idx * (100/12) < parseInt(s.v) ? "#00E5FF" : "#14141B" } : { backgroundColor: "#14141B" }} transition={{ delay: hover ? (idx * 0.04 + i * 0.1) : 0 }} className="flex-1 rounded-sm" style={{ backgroundImage: hover && idx * (100/12) < parseInt(s.v) ? 'linear-gradient(to right, #00E5FF, #FF8C00)' : 'none' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DesktopView() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [tab, setTab] = useState("Journey");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMove);
    return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMove); };
  }, []);

  return (
    <div className="min-h-screen bg-[#010102] text-gray-200 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: `radial-gradient(950px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.05), transparent 85%)` }} />
      <div className="fixed inset-0 z-[-1] pointer-events-none"><Canvas dpr={[1, 2]}><PerspectiveCamera makeDefault position={[0, 0, 22]} fov={45} /><ambientLight intensity={0.5} /><Environment preset="night" /><Core isHovered={isHovered} scrollY={scrollY} /><ContactShadows position={[0, -12, 0]} opacity={0.4} scale={50} blur={3} far={20} color="#00E5FF" /></Canvas></div>
      <div className="relative z-10 w-full flex flex-col px-24">
        <nav className="fixed top-0 left-0 w-full z-[100] bg-[#010102]/70 backdrop-blur-3xl border-b border-white/5 h-24 flex items-center justify-between px-24">
          <div className="text-2xl font-black text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>SHIVANG<span className="text-[#00E5FF]">.</span></div>
          <div className="flex gap-12 relative">{["Journey", "Stacks", "Builds", "Offline", "Connect"].map(t => (<a key={t} href={`#${t.toLowerCase()}`} onClick={() => setTab(t)} className="relative py-2 text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white transition-colors">{t}{tab === t && <motion.div layoutId="nav-slider" className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#00E5FF] to-[#FF8C00] shadow-[0_0_15px_#00E5FF]" />}</a>))}</div>
        </nav>
        <section className="min-h-screen flex items-center pt-20" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl"><h1 className="text-[9.5rem] font-black text-white mb-4 tracking-tighter leading-[0.85]">Shivang <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF8C00]">Ayar.</span></h1><p className="text-2xl text-gray-400 mt-6 mb-12 font-light max-w-2xl border-l-2 border-[#FF8C00] pl-8 leading-relaxed">Designing high-performance full-stack architectures and resilient digital systems.</p><div className="flex gap-6"><a href="#builds" className="bg-white text-black px-12 py-5 text-[10px] font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-white transition-all">Execute Builds</a><a href="/resume.pdf" target="_blank" className="border border-white/10 text-white px-12 py-5 text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">Resume ↓</a></div></motion.div></section>
        <section id="journey" className="py-40 relative"><div className="grid grid-cols-12 gap-16"><div className="col-span-5 sticky top-40"><h2 className="text-6xl font-black text-white mb-10 tracking-tighter uppercase leading-none">The <br/><span className="text-[#00E5FF]">Timeline.</span></h2><p className="text-gray-400 text-xl font-light leading-relaxed">Mastering software architecture through engineering precision.</p></div><div className="col-span-7 space-y-12 border-l-2 border-[#00E5FF]/20 ml-4 relative">
          <div className="relative pl-12 group"><div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full shadow-[0_0_15px_#00E5FF] bg-[#00E5FF]" /><div className="bg-[#0A0A12]/60 p-10 rounded-[3rem] border border-white/5 transition-all hover:border-[#00E5FF]/30"><span className="text-[10px] font-black text-gray-500 tracking-[0.4em]">2024 - PRESENT</span><h3 className="text-3xl font-black text-white mt-4">Algonquin College | Ottawa</h3><p className="text-gray-400 text-lg mt-6 font-light leading-relaxed">Advanced Diploma in Computer Programming. Focused on Enterprise Microservices, Java OOP architectures, and high-scale cloud-native logic.</p></div></div>
          <div className="relative pl-12 group"><div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full shadow-[0_0_15px_#A855F7] bg-purple-500" /><div className="bg-[#0A0A12]/60 p-10 rounded-[3rem] border border-white/5 transition-all hover:border-purple-500/30"><span className="text-[10px] font-black text-gray-500 tracking-[0.4em]">2021 - 2023</span><h3 className="text-3xl font-black text-white mt-4">Fraser International College | BC</h3><p className="text-gray-400 text-lg mt-6 font-light leading-relaxed">Computer Science Pathway. Foundational deep-dive into Big O efficiency, data structure optimization, and OOP principles.</p></div></div>
        </div></div></section>
        <section id="stacks" className="py-20 w-full"><h2 className="text-8xl font-black text-white mb-24 tracking-tighter text-center uppercase">Technical <span className="text-[#00E5FF]">Arsenal.</span></h2><div className="grid grid-cols-3 gap-10">
          <CompCard title="Languages" icon="💻" skills={[{n:"Java",v:"90%"},{n:"Python",v:"85%"},{n:"JS",v:"85%"},{n:"C#",v:"70%"}]} /><CompCard title="Frontend" icon="🖥️" skills={[{n:"React.js",v:"90%"},{n:"HTML5/CSS3",v:"95%"},{n:"Tailwind",v:"85%"},{n:"Next.js",v:"80%"}]} /><CompCard title="Backend" icon="⚙️" skills={[{n:"Node.js",v:"85%"},{n:"Express.js",v:"85%"},{n:"REST APIs",v:"90%"},{n:"WebSockets",v:"75%"}]} /><CompCard title="Databases" icon="🗄️" skills={[{n:"MongoDB",v:"85%"},{n:"MySQL",v:"90%"},{n:"PostgreSQL",v:"75%"},{n:"NoSQL",v:"85%"}]} /><CompCard title="Analytics" icon="📊" skills={[{n:"Power BI",v:"90%"},{n:"DAX",v:"85%"},{n:"Star Schema",v:"85%"},{n:"ETL",v:"80%"}]} /><CompCard title="DevOps" icon="☁️" skills={[{n:"GitHub",v:"95%"},{n:"AWS",v:"80%"},{n:"Docker",v:"75%"},{n:"CI/CD",v:"85%"}]} />
        </div></section>
        <section id="builds" className="py-40"><h2 className="text-7xl font-black text-white mb-20 tracking-tighter text-right uppercase">System <span className="text-[#FF8C00]">Builds.</span></h2><div className="grid grid-cols-3 gap-10">{projectData.map((p, i) => (
          <motion.div key={i} whileHover={{ y: -15 }} className="bg-[#050507]/40 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden h-[540px] flex flex-col group cursor-pointer shadow-2xl"><div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00E5FF]/20 m-8 group-hover:border-[#00E5FF] transition-all" /><div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF8C00]/20 m-8 group-hover:border-[#FF8C00] transition-all" /><h3 className="text-3xl font-black text-white mb-10 tracking-tight leading-tight uppercase">{p.title}</h3><p className="text-gray-400 text-lg font-light leading-relaxed mb-auto">{p.d}</p><div className="flex flex-wrap gap-2 mt-10">{p.t.map(tag => <span key={tag} className="text-[9px] font-black border border-white/10 px-4 py-1.5 rounded-full uppercase text-gray-500 group-hover:text-white transition-all">{tag}</span>)}</div></motion.div>
        ))}</div></section>
        <section id="offline" className="py-40 w-full text-center"><h2 className="text-6xl font-black text-white mb-20 tracking-tighter uppercase italic">Offline <span className="text-[#FF8C00]">Protocol.</span></h2><div className="grid grid-cols-3 gap-10">
          {[ {i:"🏋️‍♂️",t:"Discipline",d:"6-day compound split focus, applying progressive overload to mastery."}, {i:"🎮",t:"Logic",d:"Hardware tuning and competitive tactical shooters for peak performance."}, {i:"🌍",t:"Equilibrium",d:"Hiking and exploration of terrain to reset the digital buffer."}
          ].map((h,x)=>(<motion.div key={x} initial={{scale:0.95, opacity: 0}} whileInView={{scale:1, opacity: 1}} className="bg-[#0A0A12]/40 p-12 rounded-[3.5rem] border border-white/5 hover:border-[#FF8C00]/40 transition-all duration-500 group shadow-2xl"><div className="text-7xl mb-10 opacity-100 group-hover:scale-110 transition-transform">{h.i}</div><h3 className="text-2xl font-black text-white uppercase tracking-widest">{h.t}</h3><p className="text-gray-500 text-lg mt-6 font-light leading-relaxed">{h.d}</p></motion.div>))}
        </div></section>
        <footer id="connect" className="py-60 flex items-center justify-center"><div className="max-w-6xl w-full bg-[#020203] border-2 border-[#00E5FF]/40 p-16 md:p-24 rounded-[5rem] shadow-2xl text-center relative overflow-hidden group"><div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00E5FF] via-white to-[#FF8C00]" /><h2 className="text-9xl font-black text-white mb-10 tracking-tighter uppercase leading-tight">Terminal <br/><span className="text-[#00E5FF]">Ready.</span></h2><div className="grid grid-cols-3 gap-8 relative z-50 mt-10"><a href="https://github.com/ayarshivang27" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all">GitHub</a><a href="https://linkedin.com/in/shivangayar/" target="_blank" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#00E5FF] hover:text-black transition-all">LinkedIn</a><a href="mailto:ayarshivang27@gmail.com" className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl text-white font-black tracking-widest uppercase hover:bg-[#FF8C00] hover:text-black transition-all">Email</a></div><p className="mt-40 text-[10px] font-black tracking-[1.5em] text-gray-800 uppercase">© 2026 SHIVANG AYAR. CRAFTED WITH INTENT.</p></div></footer>
      </div>
    </div>
  );
}