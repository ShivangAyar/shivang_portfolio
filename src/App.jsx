import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows, MeshTransmissionMaterial, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- 3D INTERACTIVE TEXT ---
function FloatingWord({ children, position, rotation, scale = 1, color = "#4f46e5" }) {
  const textRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    // Smooth floating animation
    textRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001;
    // Smoothly scale up on hover
    textRef.current.scale.lerp(new THREE.Vector3(hovered ? scale * 1.2 : scale, hovered ? scale * 1.2 : scale, hovered ? scale * 1.2 : scale), 0.1);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Text
        ref={textRef}
        position={position}
        rotation={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        letterSpacing={0.05}
      >
        {children}
        <meshStandardMaterial 
          color={color} 
          emissive={hovered ? "#ffffff" : color} 
          emissiveIntensity={hovered ? 2 : 0.8} 
          toneMapped={false} 
        />
      </Text>
    </Float>
  );
}

// --- CENTRAL SCROLL-REACTIVE GLASS OBJECT ---
function CentralGlassShape() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    // Base rotation
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.15;
    
    // Scroll-linked reaction (Spins faster and shifts slightly as you scroll down)
    const scrollY = window.scrollY;
    meshRef.current.rotation.z = scrollY * 0.002;
    meshRef.current.position.y = Math.sin(scrollY * 0.005) * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1.8}>
        <torusKnotGeometry args={[1, 0.4, 256, 64]} />
        <MeshTransmissionMaterial 
          backside samples={8} thickness={1.5} chromaticAberration={1} 
          anisotropy={0.3} distortion={0.6} distortionScale={0.5} 
          temporalDistortion={0.2} color="#06b6d4"
        />
      </mesh>
    </Float>
  );
}

// --- MOUSE RIG FOR CAMERA PARALLAX ---
function CameraRig() {
  useFrame((state) => {
    state.camera.position.lerp(
      new THREE.Vector3((state.mouse.x * 3), (state.mouse.y * 3), 10),
      0.05
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('Transmission successful!');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="bg-[#02040a] text-gray-200 antialiased selection:bg-cyan-500 selection:text-white font-sans scroll-smooth">
      
      {/* --- LAYER 1: CINEMATIC 3D BACKGROUND --- */}
      <div className="fixed inset-0 z-0 cursor-crosshair pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <color attach="background" args={['#010206']} />
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={3} color="#06b6d4" />
          <spotLight position={[-10, -10, -10]} angle={0.2} penumbra={1} intensity={3} color="#8b5cf6" />
          
          <Environment preset="city" />
          <CameraRig />
          <Stars radius={50} depth={50} count={2000} factor={4} saturation={1} fade speed={1.5} />
          
          <CentralGlassShape />

          <FloatingWord position={[-5, 3, -4]} rotation={[0, 0.2, 0]} scale={1.2} color="#06b6d4">MERN STACK</FloatingWord>
          <FloatingWord position={[6, 4, -6]} rotation={[0, -0.3, 0]} scale={1} color="#8b5cf6">NODE.JS</FloatingWord>
          <FloatingWord position={[-6, -3, -5]} rotation={[0, 0.5, 0]} scale={1} color="#10b981">MONGODB</FloatingWord>
          <FloatingWord position={[5, -3, -3]} rotation={[0, -0.2, 0]} scale={1.5} color="#eab308">JAVA / OOP</FloatingWord>
          <FloatingWord position={[-3, 5, -8]} rotation={[0, 0.1, 0]} scale={0.8} color="#ef4444">POWER BI</FloatingWord>
          <FloatingWord position={[8, 0, -4]} rotation={[0, -0.4, 0]} scale={1.3} color="#0ea5e9">REACT</FloatingWord>

          <ContactShadows position={[0, -5, 0]} opacity={0.5} scale={30} blur={2.5} far={4} color="#06b6d4" />

          {/* POST PROCESSING: The "Stun" Factor */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
            <ChromaticAberration offset={[0.0015, 0.0015]} blendFunction={BlendFunction.NORMAL} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* --- LAYER 2: HTML UI OVERLAY --- */}
      <div className="relative z-10 w-full">
        
        {/* Sticky Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-[#010206]/60 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">&lt;/&gt;</span> SHIVANG
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
              <a href="#about" className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">About</a>
              <a href="#skills" className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">Skills</a>
              <a href="#projects" className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">Architecture</a>
              <a href="#contact" className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">Comm-Link</a>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-40 pb-20 min-h-screen flex items-center pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-start pointer-events-auto bg-[#010206]/40 p-10 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-bold tracking-widest mb-6 animate-pulse">
                SYSTEM.ONLINE
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
                Shivang <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">Ayar.</span>
              </h1>
              <p className="text-lg text-gray-300 mb-10 max-w-md leading-relaxed mt-4 drop-shadow-md">
                Computer Programming Analyst at Algonquin College. Engineering highly optimized MERN stack applications and next-generation WebGL architectures.
              </p>
              <div className="flex gap-4 w-full sm:w-auto">
                <a href="#projects" className="w-full sm:w-auto text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all duration-300">
                  View Architecture
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 pointer-events-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Arsenal</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pointer-events-auto">
            {/* Front End */}
            <div className="bg-[#010206]/40 p-8 rounded-[2rem] backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:-translate-y-2 transition-all duration-500 shadow-2xl group">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><span className="text-cyan-400">⚛️</span> Interface</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-300 mb-2"><span>React.js / WebGL</span><span className="text-cyan-400">90%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-2 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)] group-hover:w-[90%] w-0 transition-all duration-1000 ease-out"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-300 mb-2"><span>JavaScript (ES6+)</span><span className="text-cyan-400">85%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-2 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)] group-hover:w-[85%] w-0 transition-all duration-1000 delay-100 ease-out"></div></div>
                </div>
              </div>
            </div>

            {/* Back End */}
            <div className="bg-[#010206]/40 p-8 rounded-[2rem] backdrop-blur-xl border border-white/10 hover:border-purple-500/50 hover:-translate-y-2 transition-all duration-500 shadow-2xl group">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><span className="text-purple-400">⚙️</span> Server-Side</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-300 mb-2"><span>Node.js / Express</span><span className="text-purple-400">85%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full shadow-[0_0_15px_rgba(168,85,247,1)] group-hover:w-[85%] w-0 transition-all duration-1000 ease-out"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-300 mb-2"><span>Java / OOP</span><span className="text-purple-400">90%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full shadow-[0_0_15px_rgba(168,85,247,1)] group-hover:w-[90%] w-0 transition-all duration-1000 delay-100 ease-out"></div></div>
                </div>
              </div>
            </div>

            {/* Data */}
            <div className="bg-[#010206]/40 p-8 rounded-[2rem] backdrop-blur-xl border border-white/10 hover:border-yellow-500/50 hover:-translate-y-2 transition-all duration-500 shadow-2xl group">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><span className="text-yellow-400">🗄️</span> Architecture</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-300 mb-2"><span>MongoDB / NoSQL</span><span className="text-yellow-400">85%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full shadow-[0_0_15px_rgba(250,204,21,1)] group-hover:w-[85%] w-0 transition-all duration-1000 ease-out"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-300 mb-2"><span>MySQL / Power BI</span><span className="text-yellow-400">90%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full shadow-[0_0_15px_rgba(250,204,21,1)] group-hover:w-[90%] w-0 transition-all duration-1000 delay-100 ease-out"></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black text-white mb-16 tracking-tighter pointer-events-auto">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Builds.</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-auto">
            {/* Project 1 */}
            <div className="bg-[#010206]/40 p-10 rounded-[2rem] backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 group">
              <h3 className="text-3xl font-bold text-white mb-4">Movie Watchlist Web App</h3>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg">Engineered a complete full-stack web application for tracking user media. Built RESTful APIs with Express for secure CRUD operations, integrated with a highly flexible NoSQL MongoDB architecture.</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">Node.js</span>
                <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]">Express</span>
                <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">MongoDB</span>
              </div>
            </div>
            {/* Project 2 */}
            <div className="bg-[#010206]/40 p-10 rounded-[2rem] backdrop-blur-xl border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 group">
              <h3 className="text-3xl font-bold text-white mb-4">Voice AI Chatbot</h3>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg">Executed during a 24-hour hackathon under strict deadlines. Developed an emotion-aware chatbot by integrating Voice APIs with a Node.js backend, achieving &lt;200ms latency on asynchronous streams.</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">React</span>
                <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]">Voice APIs</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}