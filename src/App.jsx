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
          backside samples={4} thickness={1} chromaticAberration={0.5} 
          anisotropy={0.1} distortion={0.5} distortionScale={0.5} 
          temporalDistortion={0.1} color="#06b6d4"
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
      <div className="fixed inset-0 z-0 cursor-crosshair pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <color attach="background" args={['#02040a']} />
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#06b6d4" />
          <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={2} color="#8b5cf6" />
          <Environment preset="city" />
          <CameraRig />
          <CentralGlassShape />

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
              <a href="#skills" className="hover:text-cyan-400 transition-colors">Skills</a>
              <a href="#projects" className="hover:text-cyan-400 transition-colors">Architecture</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">Comm-Link</a>
            </div>
          </div>
        </nav>

        {/* --- ABOUT & TIMELINE SECTION --- */}
        <section id="about" className="max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-screen flex items-center pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full pointer-events-auto">
            
            {/* Left: Bio & Stats */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-purple-500 mb-6 drop-shadow-lg">YO! I'm Shivang</h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed bg-[#02040a]/30 p-8 rounded-3xl backdrop-blur-md border border-white/5 shadow-xl">
                <p>
                  I'm a Computer Programming student at Algonquin College. I build highly-optimized, full-stack web applications and interactive architectures using the MERN stack, Java, and WebGL.
                </p>
                <p>
                  My vibe? Engineering robust backends and creating frontend experiences that feel like native software.
                </p>
                <p>
                  When I am not optimizing my RTX 4050 to push max frames in Valorant, you'll catch me hitting a heavy 6-day split at the gym, or making sure my Jordan Spizikes stay perfectly clean. Always grinding, always building.
                </p>
                
                {/* Stat Cards */}
                <div className="flex gap-4 pt-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center w-1/2 hover:bg-white/10 transition">
                    <h3 className="text-3xl font-black text-cyan-400">Full-Stack</h3>
                    <p className="text-sm text-gray-400 font-medium">Developer</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center w-1/2 hover:bg-white/10 transition">
                    <h3 className="text-3xl font-black text-purple-400">10+</h3>
                    <p className="text-sm text-gray-400 font-medium">Projects Shipped</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Vertical Timeline */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-3xl font-bold text-white mb-8">My Journey</h2>
              <div className="border-l-2 border-cyan-500/30 ml-3 pl-8 space-y-10 relative">
                
                {/* Timeline Item 1 */}
                <div className="relative group">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#02040a] border-2 border-cyan-500 group-hover:bg-cyan-500 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                  <span className="text-sm text-cyan-400 font-bold tracking-wider uppercase mb-1 block">2024 - Present</span>
                  <div className="bg-[#02040a]/40 p-6 rounded-2xl backdrop-blur-md border border-white/5 hover:border-cyan-500/30 transition shadow-xl">
                    <h3 className="text-xl font-bold text-white">Adv. Dip. Computer Programming</h3>
                    <p className="text-cyan-400/80 text-sm font-semibold mb-2">Algonquin College</p>
                    <p className="text-gray-400 text-sm leading-relaxed">Specializing in Full-Stack Web Development, Database Architecture, and Systems Analysis.</p>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative group">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#02040a] border-2 border-purple-500 group-hover:bg-purple-500 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                  <span className="text-sm text-purple-400 font-bold tracking-wider uppercase mb-1 block">2020 - 2023</span>
                  <div className="bg-[#02040a]/40 p-6 rounded-2xl backdrop-blur-md border border-white/5 hover:border-purple-500/30 transition shadow-xl">
                    <h3 className="text-xl font-bold text-white">Operations & Logistics Leadership</h3>
                    <p className="text-purple-400/80 text-sm font-semibold mb-2">London Drugs / Industrial Linings</p>
                    <p className="text-gray-400 text-sm leading-relaxed">Managed high-volume e-commerce databases, automated inventory tracking via Excel, and led operational teams.</p>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative group">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#02040a] border-2 border-gray-500 group-hover:bg-gray-400 transition-colors"></div>
                  <span className="text-sm text-gray-400 font-bold tracking-wider uppercase mb-1 block">2021 - 2023</span>
                  <div className="bg-[#02040a]/40 p-6 rounded-2xl backdrop-blur-md border border-white/5 hover:border-gray-500/30 transition shadow-xl">
                    <h3 className="text-xl font-bold text-white">Computer Science Pathway</h3>
                    <p className="text-gray-400 text-sm font-semibold mb-2">Fraser International College (SFU)</p>
                    <p className="text-gray-400 text-sm leading-relaxed">Foundational studies in algorithms, computation, and software engineering principles.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* --- SKILLS GRID SECTION --- */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col justify-center pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 pointer-events-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white">My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Skills</span> & Expertise</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">A comprehensive overview of the technical stack and tools I use to engineer robust digital solutions.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-auto">
            
            {/* Card 1: Languages */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-cyan-400 text-2xl">&lt;/&gt;</span> Languages</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>Java / OOP</span><span className="text-cyan-400">90%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{width: '90%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>JavaScript (ES6+)</span><span className="text-cyan-400">85%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{width: '85%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>Python</span><span className="text-cyan-400">80%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-cyan-400 to-blue-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{width: '80%'}}></div></div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Web Dev */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-purple-400 text-2xl">🌐</span> Web Development</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>React.js</span><span className="text-purple-400">90%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-purple-400 to-pink-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{width: '90%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>Node.js / Express</span><span className="text-purple-400">85%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-purple-400 to-pink-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{width: '85%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>HTML5 / CSS3 / Tailwind</span><span className="text-purple-400">95%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-purple-400 to-pink-600 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" style={{width: '95%'}}></div></div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Databases & Tools */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-yellow-500/50 transition-all shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-yellow-400 text-2xl">🗄️</span> Data & Tools</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>MySQL / SQL</span><span className="text-yellow-400">90%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{width: '90%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>MongoDB (NoSQL)</span><span className="text-yellow-400">85%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{width: '85%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-300 mb-1"><span>Power BI / Git / AWS</span><span className="text-yellow-400">80%</span></div>
                  <div className="w-full bg-white/5 rounded-full h-1.5"><div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{width: '80%'}}></div></div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ... KEEP YOUR EXISTING PROJECTS AND CONTACT SECTIONS HERE ... */}
        {/* PROJECTS SECTION */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-16 tracking-tighter pointer-events-auto"
          >
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Builds.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-auto">
            {/* Project 1 */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-colors group">
              <h3 className="text-2xl font-bold text-white mb-3">Movie Watchlist Web App</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">A complete full-stack web application for tracking user media. Engineered RESTful APIs with Express for secure CRUD operations and integrated a flexible NoSQL database.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-xs font-bold">Node.js</span>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-xs font-bold">Express</span>
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs font-bold">MongoDB</span>
              </div>
            </motion.div>
            {/* Project 2 */}
            <motion.div whileHover={{ y: -5 }} className="bg-[#02040a]/40 p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-colors group">
              <h3 className="text-2xl font-bold text-white mb-3">Voice AI Chatbot</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Built during a 24-hour hackathon. Engineered an emotion-aware chatbot integrating Voice APIs with a backend handling asynchronous streams to achieve &lt;200ms latency.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-xs font-bold">React</span>
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded text-xs font-bold">Context API</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="max-w-3xl mx-auto px-6 py-32 min-h-[80vh] flex flex-col justify-center pointer-events-none">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="pointer-events-auto bg-[#02040a]/50 p-10 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 tracking-tighter">
              Initiate <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Comm-Link.</span>
            </h2>
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
              <input type="text" placeholder="Your Name" required onChange={(e) => setFormData({...formData, name: e.target.value})} className="p-4 bg-white/5 text-white rounded-xl outline-none focus:bg-white/10 border border-white/10 focus:border-cyan-500 transition-all" />
              <input type="email" placeholder="Your Email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="p-4 bg-white/5 text-white rounded-xl outline-none focus:bg-white/10 border border-white/10 focus:border-cyan-500 transition-all" />
              <textarea placeholder="Message Payload" rows="4" required onChange={(e) => setFormData({...formData, message: e.target.value})} className="p-4 bg-white/5 text-white rounded-xl outline-none focus:bg-white/10 border border-white/10 focus:border-cyan-500 transition-all resize-none"></textarea>
              <button type="submit" className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all">Transmit to Node.js</button>
            </form>
          </motion.div>
        </section>

      </div>
    </div>
  );
}