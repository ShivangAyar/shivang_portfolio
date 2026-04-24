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
  return <pointLight ref={lightRef} intensity={8} color="#00E5FF" distance={15} />;
}

function FloatingWord({ children, position, rotation, scale = 1, baseColor = "#1A1A24" }) {
  const textRef = useRef();
  useFrame((state) => {
    textRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.002;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        ref={textRef} position={position} rotation={rotation} scale={scale}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        letterSpacing={0.1}
      >
        {children}
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.3} />
      </Text>
    </Float>
  );
}

function CentralReactiveShape() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, state.pointer.x * 0.5, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, state.pointer.y * 0.5, 0.05);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={2.2} castShadow receiveShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#0A0A10" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]} scale={2.3}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#00E5FF" wireframe={true} transparent opacity={0.05} />
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
    <div className="bg-[#05050A] text-gray-200 antialiased selection:bg-[#FF3366] selection:text-white font-sans scroll-smooth relative">
      
      <div 
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.06), transparent 80%)`
        }}
      />

      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} shadows>
          <color attach="background" args={['#05050A']} />
          <ambientLight intensity={0.1} />
          <directionalLight position={[10, 10, -5]} intensity={0.5} color="#FF3366" />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#00E5FF" />
          <CursorLight />
          <Environment preset="night" />
          
          <CentralReactiveShape />

          <FloatingWord position={[-6, 3, -4]} rotation={[0, 0.2, 0]} scale={1.2}>ARCHITECTURE</FloatingWord>
          <FloatingWord position={[6, 4, -6]} rotation={[0, -0.3, 0]} scale={1}>ENGINEER</FloatingWord>
          <FloatingWord position={[-5, -3, -5]} rotation={[0, 0.3, 0]} scale={0.9}>MERN STACK</FloatingWord>
          <FloatingWord position={[7, -2, -3]} rotation={[0, -0.2, 0]} scale={1.3}>DATA</FloatingWord>
          <FloatingWord position={[0, -5, -8]} rotation={[-0.2, 0, 0]} scale={2}>SHIVANG</FloatingWord>

          <ContactShadows position={[0, -4, 0]} opacity={0.6} scale={20} blur={2} far={4} color="#00E5FF" />
        </Canvas>
      </div>

      <div className="relative z-30 w-full">
        <nav className="fixed top-0 w-full z-50 bg-[#05050A]/70 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl font-bold tracking-widest text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <span className="text-[#FF3366]">SHIVANG<span className="text-[#00E5FF]">.</span></span>
            </div>
            
            <div className="hidden md:flex gap-8 text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
              <a href="#about" className="hover:text-[#00E5FF] transition-colors">Journey</a>
              <a href="#skills" className="hover:text-[#FF3366] transition-colors">Competencies</a>
              <a href="#projects" className="hover:text-[#00E5FF] transition-colors">Builds</a>
              <a href="#contact" className="hover:text-[#FF3366] transition-colors">Connect</a>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="md:hidden absolute top-20 left-0 w-full bg-[#05050A]/95 backdrop-blur-xl border-b border-white/5 flex flex-col items-center py-8 gap-8"
              >
                <a href="#about" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase hover:text-[#00E5FF] transition-colors">Journey</a>
                <a href="#skills" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase hover:text-[#FF3366] transition-colors">Competencies</a>
                <a href="#projects" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase hover:text-[#00E5FF] transition-colors">Builds</a>
                <a href="#contact" onClick={closeMobileMenu} className="text-sm font-bold tracking-[0.2em] text-gray-300 uppercase hover:text-[#FF3366] transition-colors">Connect</a>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20 min-h-screen flex items-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-start pointer-events-auto max-w-2xl"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter leading-none">
              Shivang <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF3366]">Ayar.</span>
            </h1>
            <p className="text-xl text-gray-400 mt-8 mb-10 leading-relaxed font-light">
              Software Engineer & Data Architect. Specializing in high-performance full-stack applications and precision backend systems.
            </p>
            <a href="#projects" className="bg-white text-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#00E5FF] hover:text-white transition-all duration-300">
              Execute Portfolio
            </a>
          </motion.div>
        </section>

        <section id="about" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <div className="pointer-events-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:col-span-5 flex flex-col justify-center"
            >
              <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">About <span className="text-[#00E5FF]">Me.</span></h2>
              <p className="text-gray-400 mb-6 leading-relaxed font-light text-lg">
                Born and raised in Zambia, I brought my drive across the globe to engineer high-performance software in Canada. Currently, I am based in Ottawa, pushing the boundaries of web architecture.
              </p>
              <p className="text-gray-400 mb-10 leading-relaxed font-light text-lg">
                I approach code with the same rigid discipline I apply to my 6-day gym splits—focused entirely on heavy lifting, optimization, and constant progression. Whether I am building a MERN application, tuning my hardware, or hiking unfamiliar trails, the objective is always mastery.
              </p>
              <div className="flex gap-6">
                <div className="bg-[#0A0A10]/80 border border-[#00E5FF]/20 p-6 w-1/2 flex flex-col items-center justify-center text-center hover:border-[#00E5FF]/60 transition-colors">
                  <h3 className="text-4xl font-black text-[#00E5FF] mb-1">10+</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">System Builds</p>
                </div>
                <div className="bg-[#0A0A10]/80 border border-[#FF3366]/20 p-6 w-1/2 flex flex-col items-center justify-center text-center hover:border-[#FF3366]/60 transition-colors">
                  <h3 className="text-4xl font-black text-[#FF3366] mb-1">4.0</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">GPA</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <h2 className="text-4xl font-black text-white mb-10 tracking-tighter">My <span className="text-[#FF3366]">Journey.</span></h2>
              <div className="border-l border-gray-800 ml-4 space-y-10">
                
                <div className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#05050A] border-2 border-[#00E5FF] group-hover:bg-[#00E5FF] transition-colors shadow-[0_0_10px_rgba(0,229,255,0.5)]"></div>
                  <div className="bg-[#0A0A10]/60 border border-white/5 p-6 hover:border-[#00E5FF]/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">Computer Programming & Analysis</h3>
                      <span className="text-xs text-[#00E5FF] font-bold tracking-widest uppercase bg-[#00E5FF]/10 px-3 py-1 rounded">2024 - Present</span>
                    </div>
                    <p className="text-[#00E5FF] font-medium text-sm mb-3">Algonquin College | Ottawa, ON</p>
                    <p className="text-gray-400 font-light text-sm leading-relaxed">Specializing in full-stack architecture, advanced object-oriented design, and database systems engineering.</p>
                  </div>
                </div>

                <div className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#05050A] border-2 border-gray-600 group-hover:border-[#FF3366] transition-colors"></div>
                  <div className="bg-[#0A0A10]/60 border border-white/5 p-6 hover:border-[#FF3366]/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">Computer Science Pathway</h3>
                      <span className="text-xs text-gray-500 font-bold tracking-widest uppercase bg-white/5 px-3 py-1 rounded">2021 - 2023</span>
                    </div>
                    <p className="text-[#FF3366] font-medium text-sm mb-3">Fraser International College (SFU) | Vancouver, BC</p>
                    <p className="text-gray-400 font-light text-sm leading-relaxed">Built a rigorous foundation in algorithms, computation theory, and core software engineering principles.</p>
                  </div>
                </div>

                <div className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#05050A] border-2 border-gray-700 transition-colors"></div>
                  <div className="bg-[#0A0A10]/60 border border-white/5 p-6 hover:border-gray-600/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-300">Operations Leadership</h3>
                      <span className="text-xs text-gray-600 font-bold tracking-widest uppercase bg-white/5 px-3 py-1 rounded">2020 - 2021</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm mb-3">Industrial Linings Ltd. | Chingola, Zambia</p>
                    <p className="text-gray-500 font-light text-sm leading-relaxed">Supervised teams and modernized inventory tracking databases prior to relocating for software engineering.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        <section id="skills" className="max-w-7xl mx-auto px-6 py-32 pointer-events-none">
          <div className="pointer-events-auto">
            
            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">Key <span className="text-[#FF3366]">Milestones.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
              <div className="bg-gradient-to-br from-[#0A0A10] to-[#12121A] p-6 border border-white/5 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] text-2xl">🏆</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Hackathon SDLC Execution</h3>
                  <p className="text-sm text-gray-400">Delivered functional MVP Chatbot in &lt;24hrs</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#0A0A10] to-[#12121A] p-6 border border-white/5 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-[#FF3366]/10 flex items-center justify-center text-[#FF3366] text-2xl">⚡</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Algorithm Optimization</h3>
                  <p className="text-sm text-gray-400">Achieved O(1) time complexity & 100% accuracy in Java</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#0A0A10] to-[#12121A] p-6 border border-white/5 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl">📈</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Data Architecture Impact</h3>
                  <p className="text-sm text-gray-400">Reduced data analysis time by 90% using Star Schema</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#0A0A10] to-[#12121A] p-6 border border-white/5 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 text-2xl">⚙️</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Operations Leadership</h3>
                  <p className="text-sm text-gray-400">Increased order processing efficiency by 20% in logistics</p>
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">Core <span className="text-[#00E5FF]">Competencies.</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-[#0A0A10]/60 p-8 border border-white/5 hover:border-[#00E5FF]/50 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-[#00E5FF] text-2xl">&lt;/&gt;</span> Languages & UI</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>Java / OOP</span><span className="text-[#00E5FF]">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1.5 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>JavaScript (ES6+)</span><span className="text-[#00E5FF]">85%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1.5 rounded-full w-0 group-hover:w-[85%] transition-all duration-1000 delay-100 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>React.js</span><span className="text-[#00E5FF]">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1.5 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 delay-200 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>HTML5 / CSS3</span><span className="text-[#00E5FF]">95%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#00E5FF] to-[#FF3366] h-1.5 rounded-full w-0 group-hover:w-[95%] transition-all duration-1000 delay-300 ease-out"></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A10]/60 p-8 border border-white/5 hover:border-[#FF3366]/50 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-[#FF3366] text-2xl">⚙️</span> Server & Architecture</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>Node.js / Express</span><span className="text-[#FF3366]">85%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[85%] transition-all duration-1000 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>MongoDB (NoSQL)</span><span className="text-[#FF3366]">85%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[85%] transition-all duration-1000 delay-100 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>MySQL / SQL</span><span className="text-[#FF3366]">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 delay-200 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>Python</span><span className="text-[#FF3366]">80%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-[#FF3366] to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[80%] transition-all duration-1000 delay-300 ease-out"></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A10]/60 p-8 border border-white/5 hover:border-purple-500/50 transition-all shadow-xl group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-purple-400 text-2xl">☁️</span> Data & Cloud</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>Power BI / DAX</span><span className="text-purple-400">90%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[90%] transition-all duration-1000 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>Git / GitHub</span><span className="text-purple-400">95%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[95%] transition-all duration-1000 delay-100 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>Docker / CI-CD</span><span className="text-purple-400">75%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[75%] transition-all duration-1000 delay-200 ease-out"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-gray-300 mb-1"><span>AWS / Vercel</span><span className="text-purple-400">80%</span></div>
                    <div className="w-full bg-[#1A1A24] rounded-full h-1.5"><div className="bg-gradient-to-r from-purple-500 to-[#00E5FF] h-1.5 rounded-full w-0 group-hover:w-[80%] transition-all duration-1000 delay-300 ease-out"></div></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section id="projects" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <h2 className="text-4xl font-black text-white mb-12 tracking-tighter">System <span className="text-[#FF3366]">Builds.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-[#0A0A10]/80 p-10 border border-white/5 hover:border-[#00E5FF]/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-bl-full -z-10 group-hover:bg-[#00E5FF]/10 transition-colors"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Movie Watchlist Web App</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">Engineered a complete full-stack web application for tracking user media. Built RESTful APIs with Express for secure CRUD operations, integrated with a highly flexible NoSQL MongoDB architecture.</p>
                <div className="flex gap-3">
                  <span className="text-xs font-bold tracking-widest text-[#00E5FF] uppercase">Node.js</span>
                  <span className="text-xs font-bold tracking-widest text-[#00E5FF] uppercase">MongoDB</span>
                </div>
              </div>

              <div className="bg-[#0A0A10]/80 p-10 border border-white/5 hover:border-[#FF3366]/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3366]/5 rounded-bl-full -z-10 group-hover:bg-[#FF3366]/10 transition-colors"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Voice AI Chatbot</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">Executed during a 24-hour hackathon. Developed an emotion-aware chatbot by integrating Voice APIs with a Node.js backend, achieving &lt;200ms latency on asynchronous streams.</p>
                <div className="flex gap-3">
                  <span className="text-xs font-bold tracking-widest text-[#FF3366] uppercase">React</span>
                  <span className="text-xs font-bold tracking-widest text-[#FF3366] uppercase">Voice APIs</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}