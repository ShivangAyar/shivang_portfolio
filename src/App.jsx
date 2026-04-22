import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows, MeshTransmissionMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- 3D FLOATING TEXT COMPONENT ---
function FloatingWord({ children, position, rotation, scale = 1, color = "#4f46e5" }) {
  const textRef = useRef();
  
  useFrame((state) => {
    textRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Text
        ref={textRef}
        position={position}
        rotation={rotation}
        scale={scale}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        letterSpacing={0.05}
        lineHeight={1}
      >
        {children}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} toneMapped={false} />
      </Text>
    </Float>
  );
}

// --- CENTRAL INTERACTIVE GLASS OBJECT ---
function CentralGlassShape() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.1;
    meshRef.current.rotation.y += delta * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <MeshTransmissionMaterial 
          backside 
          samples={4} 
          thickness={1} 
          chromaticAberration={0.5} 
          anisotropy={0.1} 
          distortion={0.5} 
          distortionScale={0.5} 
          temporalDistortion={0.1} 
          color="#06b6d4"
        />
      </mesh>
    </Float>
  );
}

// --- MOUSE RIG FOR CAMERA PARALLAX ---
function CameraRig() {
  useFrame((state) => {
    state.camera.position.lerp(
      new THREE.Vector3((state.mouse.x * 2), (state.mouse.y * 2), 10),
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
      alert('Transmission successful! Message sent to Node.js backend.');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="bg-[#02040a] text-gray-200 antialiased selection:bg-cyan-500 selection:text-white font-sans scroll-smooth">
      
      {/* --- LAYER 1: FIXED 3D BACKGROUND --- */}
      {/* Changed to 'fixed' so it stays behind everything while you scroll */}
      <div className="fixed inset-0 z-0 cursor-crosshair pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <color attach="background" args={['#02040a']} />
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#06b6d4" />
          <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={2} color="#8b5cf6" />
          
          <Environment preset="city" />
          <CameraRig />
          <CentralGlassShape />

          {/* Floating Tech Stack Words (RTX 4050 Removed) */}
          <FloatingWord position={[-5, 3, -4]} rotation={[0, 0.2, 0]} scale={1.5} color="#06b6d4">FULL-STACK</FloatingWord>
          <FloatingWord position={[6, 4, -6]} rotation={[0, -0.3, 0]} scale={1.2} color="#8b5cf6">NODE.JS</FloatingWord>
          <FloatingWord position={[-7, -2, -5]} rotation={[0, 0.5, 0]} scale={1} color="#10b981">MONGODB</FloatingWord>
          <FloatingWord position={[5, -3, -3]} rotation={[0, -0.2, 0]} scale={1.8} color="#eab308">JAVA / OOP</FloatingWord>
          <FloatingWord position={[-3, 5, -8]} rotation={[0, 0.1, 0]} scale={0.8} color="#ef4444">POWER BI</FloatingWord>
          <FloatingWord position={[8, 0, -4]} rotation={[0, -0.4, 0]} scale={1.3} color="#0ea5e9">REACT</FloatingWord>
          <FloatingWord position={[7, 6, -12]} rotation={[0, -0.1, 0]} scale={0.7} color="#475569">OCTANE</FloatingWord>

          <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} color="#06b6d4" />
        </Canvas>
      </div>

      {/* --- LAYER 2: SCROLLABLE HTML CONTENT OVERLAY --- */}
      <div className="relative z-10 w-full">
        
        {/* Sticky Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-[#02040a]/40 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <span className="text-cyan-400">&lt;/&gt;</span> SHIVANG
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
              <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
              <a href="#projects" className="hover:text-cyan-400 transition-colors">Architecture</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">Comm-Link</a>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section id="about" className="max-w-7xl mx-auto px-6 pt-40 pb-20 min-h-screen flex items-center pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-start pointer-events-auto bg-[#02040a]/30 p-8 rounded-3xl backdrop-blur-md border border-white/5"
            >
              <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold tracking-widest mb-6">
                SYSTEM.READY
              </span>
              
              <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
                Shivang <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Ayar.</span>
              </h1>
              
              <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed mt-4 drop-shadow-md">
                Computer Programming student at Algonquin College. Engineering highly optimized full-stack MERN applications and immersive WebGL experiences. 
              </p>
              
              <div className="flex gap-4">
                <a href="#projects" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-all">
                  View Architecture
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-16 tracking-tighter pointer-events-auto"
          >
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Builds.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-auto">
            
            {/* Project 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-colors group"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Movie Watchlist Web App</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">A complete full-stack web application for tracking user media. Engineered RESTful APIs with Express for secure CRUD operations and integrated a flexible NoSQL database.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-xs font-bold">Node.js</span>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-xs font-bold">Express</span>
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs font-bold">MongoDB</span>
              </div>
            </motion.div>

            {/* Project 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-colors group"
            >
              <h3 className="text-2xl font-bold text-white mb-3">Voice AI Chatbot</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Built during a 24-hour hackathon. Engineered an emotion-aware chatbot integrating Voice APIs with a backend handling asynchronous streams to achieve &lt;200ms latency.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-xs font-bold">React</span>
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded text-xs font-bold">Context API</span>
              </div>
            </motion.div>

            {/* Project 3 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-yellow-500/50 transition-colors group"
            >
              <h3 className="text-2xl font-bold text-white mb-3">BI Dashboard</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Applied Star Schema modeling to a 50,000+ record dataset. Optimized query execution by 60% and wrote complex DAX expressions to automate KPI reporting.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded text-xs font-bold">Power BI</span>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-xs font-bold">MySQL</span>
              </div>
            </motion.div>
            
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="max-w-3xl mx-auto px-6 py-32 min-h-[80vh] flex flex-col justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="pointer-events-auto bg-[#02040a]/50 p-10 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 tracking-tighter">
              Initiate <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Comm-Link.</span>
            </h2>
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
              <input 
                type="text" placeholder="Your Name" required
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="p-4 bg-white/5 text-white rounded-xl outline-none focus:bg-white/10 border border-white/10 focus:border-cyan-500 transition-all placeholder-gray-500 font-medium"
              />
              <input 
                type="email" placeholder="Your Email" required
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="p-4 bg-white/5 text-white rounded-xl outline-none focus:bg-white/10 border border-white/10 focus:border-cyan-500 transition-all placeholder-gray-500 font-medium"
              />
              <textarea 
                placeholder="Message Payload" rows="4" required
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="p-4 bg-white/5 text-white rounded-xl outline-none focus:bg-white/10 border border-white/10 focus:border-cyan-500 transition-all placeholder-gray-500 font-medium resize-none"
              ></textarea>
              <button 
                type="submit" 
                className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                Transmit to Node.js Backend
              </button>
            </form>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-8 text-center text-gray-600 bg-[#02040a]/80 backdrop-blur-md relative z-10">
          <p className="text-sm font-medium tracking-wide">© 2026 Shivang Ayar. Powered by React Three Fiber.</p>
        </footer>

      </div>
    </div>
  );
}