import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

function CursorLight() {
  const lightRef = useRef();
  useFrame((state) => {
    const x = (state.pointer.x * state.viewport.width) / 2;
    const y = (state.pointer.y * state.viewport.height) / 2;
    lightRef.current.position.lerp(new THREE.Vector3(x, y, 2), 0.1);
  });
  return <pointLight ref={lightRef} intensity={10} color="#00E5FF" distance={20} />;
}

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

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message transmitted securely.');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-[#030305] text-gray-200 antialiased selection:bg-[#00E5FF] selection:text-black font-sans scroll-smooth relative min-h-screen">
      
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />

      <div 
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.04), transparent 60%)`
        }}
      />

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

      <div className="relative z-30 w-full">
        <nav className="fixed top-0 w-full z-50 bg-[#030305]/60 backdrop-blur-2xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              SHIVANG<span className="text-[#00E5FF]">.</span>
            </div>
            
            <div className="hidden md:flex gap-10 text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">
              <a href="#about" className="hover:text-[#00E5FF] transition-colors duration-300">Journey</a>
              <a href="#skills" className="hover:text-[#FF3366] transition-colors duration-300">Competencies</a>
              <a href="#projects" className="hover:text-[#00E5FF] transition-colors duration-300">Builds</a>
              <a href="#contact" className="hover:text-[#FF3366] transition-colors duration-300">Connect</a>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="md:hidden absolute top-24 left-0 w-full bg-[#030305]/95 backdrop-blur-2xl border-b border-white/5 flex flex-col items-center py-10 gap-10"
              >
                <a href="#about" onClick={closeMobileMenu} className="text-xs font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#00E5FF] transition-colors">Journey</a>
                <a href="#skills" onClick={closeMobileMenu} className="text-xs font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#FF3366] transition-colors">Competencies</a>
                <a href="#projects" onClick={closeMobileMenu} className="text-xs font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#00E5FF] transition-colors">Builds</a>
                <a href="#contact" onClick={closeMobileMenu} className="text-xs font-bold tracking-[0.3em] text-gray-300 uppercase hover:text-[#FF3366] transition-colors">Connect</a>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <section className="max-w-7xl mx-auto px-6 pt-48 pb-20 min-h-screen flex items-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-start pointer-events-auto max-w-3xl"
          >
            <h1 className="text-7xl md:text-[8rem] font-black text-white mb-6 tracking-tighter leading-[0.9]">
              Shivang <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF3366]">Ayar.</span>
            </h1>
            <p className="text-2xl text-gray-400 mt-6 mb-12 leading-relaxed font-light max-w-2xl">
              Software Engineer & Data Architect. Specializing in high-performance full-stack applications and precision backend systems.
            </p>
            <a href="#projects" className="bg-transparent border border-[#00E5FF] text-[#00E5FF] px-10 py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#00E5FF] hover:text-black transition-all duration-500">
              Execute Portfolio
            </a>
          </motion.div>
        </section>

        <section id="about" className="max-w-7xl mx-auto px-6 py-40 min-h-screen flex flex-col justify-center pointer-events-none">
          <div className="pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
            
            <motion.div 
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <h2 className="text-6xl font-black text-white mb-8 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-6 leading-relaxed font-light text-xl">
                Born and raised in Zambia, I brought my drive across the globe to engineer high-performance software in Canada. Currently based in Ottawa, pushing the boundaries of web architecture.
              </p>
              <p className="text-gray-400 mb-12 leading-relaxed font-light text-xl">
                I approach code with the same rigid discipline I apply to my 6-day gym splits—focused entirely on heavy lifting, optimization, and constant progression. Whether I am building a MERN application, tuning my hardware, or hiking unfamiliar trails, the objective is always mastery.
              </p>
              
              <div className="bg-gradient-to-br from-[#0A0A12] to-[#05050A] border border-[#00E5FF]/20 p-8 w-full rounded-2xl flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,229,255,0.05)] hover:border-[#00E5FF]/50 transition-all duration-500">
                <h3 className="text-5xl font-black text-[#00E5FF] mb-2 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">10+</h3>
                <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-bold">System Architectures Deployed</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="lg:col-span-6"
            >
              <h2 className="text-5xl font-black text-white mb-12 tracking-tighter">My <span className="text-[#FF3366]">Journey.</span></h2>
              <div className="border-l border-gray-800/50 ml-6 space-y-12">
                
                <div className="relative pl-10 group">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#030305] border-2 border-[#00E5FF] group-hover:bg-[#00E5FF] transition-colors duration-500 shadow-[0_0_15px_rgba(0,229,255,0.5)]"></div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-[#00E5FF]/30 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <h3 className="text-2xl font-bold text-white tracking-tight">Computer Programming & Analysis</h3>
                      <span className="text-[10px] text-[#00E5FF] font-bold tracking-widest uppercase border border-[#00E5FF]/30 px-4 py-2 rounded-full">2024 - Present</span>
                    </div>
                    <p className="text-[#00E5FF] font-medium text-sm mb-4 tracking-wide">Algonquin College | Ottawa, ON</p>
                    <p className="text-gray-400 font-light text-base leading-relaxed">Specializing in full-stack architecture, advanced object-oriented design, and database systems engineering.</p>
                  </div>
                </div>

                <div className="relative pl-10 group">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#030305] border-2 border-gray-600 group-hover:border-[#FF3366] transition-colors duration-500"></div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-[#FF3366]/30 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <h3 className="text-2xl font-bold text-white tracking-tight">Computer Science Pathway</h3>
                      <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase border border-gray-700 px-4 py-2 rounded-full">2021 - 2023</span>
                    </div>
                    <p className="text-[#FF3366] font-medium text-sm mb-4 tracking-wide">Fraser International College (SFU) | Vancouver, BC</p>
                    <p className="text-gray-400 font-light text-base leading-relaxed">Built a rigorous foundation in algorithms, computation theory, and core software engineering principles.</p>
                  </div>
                </div>

                <div className="relative pl-10 group">
                  <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#030305] border-2 border-gray-700 transition-colors duration-500"></div>
                  <div className="bg-[#0A0A12]/40 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-gray-600/30 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <h3 className="text-2xl font-bold text-gray-300 tracking-tight">Operations Leadership</h3>
                      <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase border border-gray-800 px-4 py-2 rounded-full">2020 - 2021</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm mb-4 tracking-wide">Industrial Linings Ltd. | Chingola, Zambia</p>
                    <p className="text-gray-500 font-light text-base leading-relaxed">Supervised teams and modernized inventory tracking databases prior to relocating for software engineering.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        <section id="skills" className="max-w-7xl mx-auto px-6 py-40 pointer-events-none">
          <div className="pointer-events-auto">
            
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-6xl font-black text-white mb-12 tracking-tighter">Key <span className="text-[#FF3366]">Milestones.</span></motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex items-center gap-8 hover:border-[#00E5FF]/30 transition-all duration-500">
                <div className="w-20 h-20 rounded-2xl bg-[#00E5FF]/5 flex items-center justify-center text-[#00E5FF] text-3xl border border-[#00E5FF]/10 shadow-[0_0_20px_rgba(0,229,255,0.1)]">🏆</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Hackathon SDLC Execution</h3>
                  <p className="text-base text-gray-400 font-light">Delivered functional MVP Chatbot in &lt;24hrs</p>
                </div>
              </div>
              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex items-center gap-8 hover:border-[#FF3366]/30 transition-all duration-500">
                <div className="w-20 h-20 rounded-2xl bg-[#FF3366]/5 flex items-center justify-center text-[#FF3366] text-3xl border border-[#FF3366]/10 shadow-[0_0_20px_rgba(255,51,102,0.1)]">⚡</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Algorithm Optimization</h3>
                  <p className="text-base text-gray-400 font-light">Achieved O(1) time complexity & 100% accuracy in Java</p>
                </div>
              </div>
              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex items-center gap-8 hover:border-purple-500/30 transition-all duration-500">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/5 flex items-center justify-center text-purple-400 text-3xl border border-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]">📈</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Data Architecture Impact</h3>
                  <p className="text-base text-gray-400 font-light">Reduced data analysis time by 90% using Star Schema</p>
                </div>
              </div>
              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 flex items-center gap-8 hover:border-yellow-500/30 transition-all duration-500">
                <div className="w-20 h-20 rounded-2xl bg-yellow-500/5 flex items-center justify-center text-yellow-400 text-3xl border border-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]">⚙️</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Operations Leadership</h3>
                  <p className="text-base text-gray-400 font-light">Increased order processing efficiency by 20% in logistics</p>
                </div>
              </div>
            </div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-6xl font-black text-white mb-12 tracking-tighter">Core <span className="text-[#00E5FF]">Competencies.</span></motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-10 rounded-3xl border border-white/5 hover:border-[#00E5FF]/30 transition-all duration-500 shadow-2xl group">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4 tracking-tight"><span className="text-[#00E5FF] text-3xl opacity-80">&lt;/&gt;</span> Languages & UI</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>Java / OOP</span><span className="text-[#00E5FF]">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>JavaScript (ES6+)</span><span className="text-[#00E5FF]">85%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1 rounded-full w-0 group-hover:w-[85%] transition-all duration-1000 delay-100 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>React.js</span><span className="text-[#00E5FF]">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 delay-200 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>HTML5 / CSS3</span><span className="text-[#00E5FF]">95%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1 rounded-full w-0 group-hover:w-[95%] transition-all duration-1000 delay-300 ease-out shadow-[0_0_10px_rgba(0,229,255,0.8)]"></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-10 rounded-3xl border border-white/5 hover:border-[#FF3366]/30 transition-all duration-500 shadow-2xl group">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4 tracking-tight"><span className="text-[#FF3366] text-3xl opacity-80">⚙️</span> Server & Arch</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>Node.js / Express</span><span className="text-[#FF3366]">85%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[85%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,51,102,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>MongoDB (NoSQL)</span><span className="text-[#FF3366]">85%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[85%] transition-all duration-1000 delay-100 ease-out shadow-[0_0_10px_rgba(255,51,102,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>MySQL / SQL</span><span className="text-[#FF3366]">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 delay-200 ease-out shadow-[0_0_10px_rgba(255,51,102,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>Python</span><span className="text-[#FF3366]">80%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[80%] transition-all duration-1000 delay-300 ease-out shadow-[0_0_10px_rgba(255,51,102,0.8)]"></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A12]/40 backdrop-blur-xl p-10 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-500 shadow-2xl group">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4 tracking-tight"><span className="text-purple-400 text-3xl opacity-80">☁️</span> Data & Cloud</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>Power BI / DAX</span><span className="text-purple-400">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>Git / GitHub</span><span className="text-purple-400">95%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[95%] transition-all duration-1000 delay-100 ease-out shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>Docker / CI-CD</span><span className="text-purple-400">75%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[75%] transition-all duration-1000 delay-200 ease-out shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-gray-400 uppercase mb-3"><span>AWS / Vercel</span><span className="text-purple-400">80%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1 rounded-full w-0 group-hover:w-[80%] transition-all duration-1000 delay-300 ease-out shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section id="projects" className="max-w-7xl mx-auto px-6 py-40 min-h-screen flex flex-col justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-6xl font-black text-white mb-16 tracking-tighter">System <span className="text-[#FF3366]">Builds.</span></motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              <div className="bg-[#0A0A12]/60 backdrop-blur-xl p-12 rounded-3xl border border-white/5 hover:border-[#00E5FF]/40 transition-all duration-500 group relative overflow-hidden shadow-2xl hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00E5FF]/10 to-transparent rounded-bl-full -z-10 group-hover:from-[#00E5FF]/20 transition-colors duration-500"></div>
                <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">Movie Watchlist Web App</h3>
                <p className="text-gray-400 mb-10 leading-relaxed text-lg font-light">Engineered a complete full-stack web application for tracking user media. Built RESTful APIs with Express for secure CRUD operations, integrated with a highly flexible NoSQL MongoDB architecture.</p>
                <div className="flex gap-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#00E5FF] uppercase border border-[#00E5FF]/30 px-4 py-2 rounded-full">Node.js</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#00E5FF] uppercase border border-[#00E5FF]/30 px-4 py-2 rounded-full">MongoDB</span>
                </div>
              </div>

              <div className="bg-[#0A0A12]/60 backdrop-blur-xl p-12 rounded-3xl border border-white/5 hover:border-[#FF3366]/40 transition-all duration-500 group relative overflow-hidden shadow-2xl hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FF3366]/10 to-transparent rounded-bl-full -z-10 group-hover:from-[#FF3366]/20 transition-colors duration-500"></div>
                <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">Voice AI Chatbot</h3>
                <p className="text-gray-400 mb-10 leading-relaxed text-lg font-light">Executed during a 24-hour hackathon. Developed an emotion-aware chatbot by integrating Voice APIs with a Node.js backend, achieving &lt;200ms latency on asynchronous streams.</p>
                <div className="flex gap-4">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#FF3366] uppercase border border-[#FF3366]/30 px-4 py-2 rounded-full">React</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#FF3366] uppercase border border-[#FF3366]/30 px-4 py-2 rounded-full">Voice APIs</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}