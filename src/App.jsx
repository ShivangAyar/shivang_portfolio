import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- MATTE 3D INTERACTIVE TEXT ---
function FloatingWord({ children, position, rotation, scale = 1, color = "#94a3b8" }) {
  const textRef = useRef();
  
  useFrame((state) => {
    textRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001;
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        ref={textRef}
        position={position}
        rotation={rotation}
        scale={scale}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        letterSpacing={0.05}
      >
        {children}
        <meshStandardMaterial 
          color={color} 
          roughness={0.8}
          metalness={0.1}
        />
      </Text>
    </Float>
  );
}

// --- CENTRAL MATTE GEOMETRY ---
function CentralMatteShape() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.05;
    meshRef.current.rotation.y += delta * 0.1;
    
    // Subtle scroll-linked interaction
    const scrollY = window.scrollY;
    meshRef.current.position.y = Math.sin(scrollY * 0.002) * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]} scale={2}>
        <icosahedronGeometry args={[1, 0]} />
        {/* Wireframe overlay for that highly technical look */}
        <meshStandardMaterial 
          color="#0f172a" 
          roughness={0.9} 
          metalness={0.1} 
          wireframe={true}
          transparent={true}
          opacity={0.1}
        />
      </mesh>
      <mesh position={[0, 0, 0]} scale={1.98}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#1e293b" 
          roughness={1} 
          metalness={0} 
        />
      </mesh>
    </Float>
  );
}

// --- MOUSE RIG ---
function CameraRig() {
  useFrame((state) => {
    state.camera.position.lerp(
      new THREE.Vector3((state.mouse.x * 1.5), (state.mouse.y * 1.5), 10),
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
    alert('Transmission successful! Message logged.');
  };

  return (
    <div className="bg-[#0b0f19] text-gray-200 antialiased selection:bg-blue-500 selection:text-white font-sans scroll-smooth">
      
      {/* --- LAYER 1: MATTE 3D BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <color attach="background" args={['#0b0f19']} />
          <ambientLight intensity={0.4} />
          {/* Soft, diffused lighting for matte finish */}
          <directionalLight position={[10, 10, 5]} intensity={1} color="#38bdf8" />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#818cf8" />
          
          <Environment preset="city" />
          <CameraRig />
          
          <CentralMatteShape />

          <FloatingWord position={[-6, 3, -4]} rotation={[0, 0.2, 0]} scale={1} color="#334155">ARCHITECTURE</FloatingWord>
          <FloatingWord position={[6, 4, -6]} rotation={[0, -0.3, 0]} scale={0.8} color="#334155">NODE.JS</FloatingWord>
          <FloatingWord position={[-5, -3, -5]} rotation={[0, 0.3, 0]} scale={0.9} color="#334155">MONGODB</FloatingWord>
          <FloatingWord position={[5, -2, -3]} rotation={[0, -0.2, 0]} scale={1.2} color="#334155">SYSTEMS</FloatingWord>
          <FloatingWord position={[7, 0, -4]} rotation={[0, -0.4, 0]} scale={1.1} color="#334155">REACT</FloatingWord>

          <ContactShadows position={[0, -4, 0]} opacity={0.3} scale={20} blur={2.5} far={4} color="#000000" />
        </Canvas>
      </div>

      {/* --- LAYER 2: HTML UI OVERLAY --- */}
      <div className="relative z-10 w-full">
        
        {/* Sticky Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-[#0b0f19]/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <span className="text-blue-500">/</span> SHIVANG
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
              <a href="#journey" className="hover:text-blue-400 transition-colors">Journey</a>
              <a href="#skills" className="hover:text-blue-400 transition-colors">Skills</a>
              <a href="#projects" className="hover:text-blue-400 transition-colors">Projects</a>
              <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section id="home" className="max-w-7xl mx-auto px-6 pt-40 pb-20 min-h-screen flex items-center pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
              className="flex flex-col items-start pointer-events-auto bg-[#0f172a]/40 p-10 rounded-2xl backdrop-blur-md border border-gray-800 shadow-2xl"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                Shivang <span className="text-blue-500">Ayar.</span>
              </h1>
              <h2 className="text-2xl font-semibold text-gray-300 mb-6">Software Engineer & Data Architect</h2>
              <p className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed">
                Computer Programming Analyst engineering scalable full-stack applications and highly optimized digital architectures.
              </p>
              <a href="#projects" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all">
                View My Work
              </a>
            </motion.div>
          </div>
        </section>

        {/* JOURNEY SECTION */}
        <section id="journey" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pointer-events-auto w-full">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              
              {/* The "About Me" Narrative */}
              <div className="md:w-1/2">
                <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">My <span className="text-blue-500">Journey.</span></h2>
                <div className="space-y-6 text-gray-400 text-lg leading-relaxed bg-[#0f172a]/40 p-8 rounded-2xl backdrop-blur-md border border-gray-800 shadow-xl">
                  <p>
                    Currently pursuing my Advanced Diploma in Computer Programming and Analysis at Algonquin College. My focus is entirely on the full software development lifecycle—from designing robust MongoDB schemas to building clean, state-driven React interfaces.
                  </p>
                  <p>
                    I approach code the same way I approach the rest of my life: with discipline and an obsession for optimization. Whether I am writing complex DAX expressions, pushing through a heavy 6-day split at the gym, or squeezing every last frame out of my setup for a competitive Valorant match, I am always focused on maximizing performance.
                  </p>
                  <p>
                    My goal is simple: engineer software that is fast, reliable, and solves real-world business problems. 
                  </p>
                </div>
              </div>

              {/* The Timeline */}
              <div className="md:w-1/2 mt-12 md:mt-0">
                <div className="border-l-2 border-gray-800 ml-4 pl-8 space-y-12 relative">
                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#0b0f19] border-2 border-blue-500"></div>
                    <p className="text-sm text-blue-500 font-bold mb-1">Jan 2024 - Present</p>
                    <h3 className="text-xl font-bold text-white mb-2">Adv. Dip. Computer Programming</h3>
                    <p className="text-gray-400">Algonquin College | Ottawa, ON</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#0b0f19] border-2 border-gray-600"></div>
                    <p className="text-sm text-gray-500 font-bold mb-1">Dec 2021 - 2023</p>
                    <h3 className="text-xl font-bold text-white mb-2">Computer Science Pathway</h3>
                    <p className="text-gray-400">Fraser International College | Vancouver, BC</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="max-w-7xl mx-auto px-6 py-32 flex flex-col justify-center pointer-events-none">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-black text-white mb-12 tracking-tighter pointer-events-auto">
            Technical <span className="text-blue-500">Stack.</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto">
            <div className="bg-[#0f172a]/40 p-8 rounded-2xl backdrop-blur-md border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">Frontend</h3>
              <p className="text-gray-400 mb-2 font-medium">React.js</p>
              <p className="text-gray-400 mb-2 font-medium">JavaScript (ES6+)</p>
              <p className="text-gray-400 mb-2 font-medium">HTML5 / CSS3</p>
            </div>
            <div className="bg-[#0f172a]/40 p-8 rounded-2xl backdrop-blur-md border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">Backend & Data</h3>
              <p className="text-gray-400 mb-2 font-medium">Node.js / Express</p>
              <p className="text-gray-400 mb-2 font-medium">Java / OOP</p>
              <p className="text-gray-400 mb-2 font-medium">MongoDB / MySQL</p>
            </div>
            <div className="bg-[#0f172a]/40 p-8 rounded-2xl backdrop-blur-md border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">Tools & Cloud</h3>
              <p className="text-gray-400 mb-2 font-medium">Git / Docker</p>
              <p className="text-gray-400 mb-2 font-medium">Power BI / DAX</p>
              <p className="text-gray-400 mb-2 font-medium">AWS / Vercel</p>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="max-w-7xl mx-auto px-6 py-32 min-h-screen flex flex-col justify-center pointer-events-none">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-black text-white mb-12 tracking-tighter pointer-events-auto">
            Selected <span className="text-blue-500">Work.</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-auto">
            <div className="bg-[#0f172a]/40 p-8 rounded-2xl backdrop-blur-md border border-gray-800 hover:border-blue-500/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-3">Movie Watchlist Web App</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Full-stack web application tracking user media. Built RESTful APIs with Express for secure CRUD operations and integrated a flexible NoSQL MongoDB database.</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-semibold">Node.js</span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-semibold">MongoDB</span>
              </div>
            </div>
            <div className="bg-[#0f172a]/40 p-8 rounded-2xl backdrop-blur-md border border-gray-800 hover:border-blue-500/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-3">Voice AI Chatbot</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Developed an emotion-aware chatbot by integrating Voice APIs with a Node.js backend, handling asynchronous streams to achieve &lt;200ms latency.</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-semibold">React</span>
                <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-semibold">Voice APIs</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="max-w-3xl mx-auto px-6 py-32 flex flex-col justify-center pointer-events-none">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="pointer-events-auto bg-[#0f172a]/40 p-10 rounded-2xl backdrop-blur-md border border-gray-800">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tighter">Let's <span className="text-blue-500">Connect.</span></h2>
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <input type="text" placeholder="Name" required className="p-4 bg-[#0b0f19] text-white rounded-lg outline-none focus:border-blue-500 border border-gray-800 transition-all" />
              <input type="email" placeholder="Email" required className="p-4 bg-[#0b0f19] text-white rounded-lg outline-none focus:border-blue-500 border border-gray-800 transition-all" />
              <textarea placeholder="Message" rows="4" required className="p-4 bg-[#0b0f19] text-white rounded-lg outline-none focus:border-blue-500 border border-gray-800 transition-all resize-none"></textarea>
              <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-all">Send Message</button>
            </form>
          </motion.div>
        </section>

      </div>
    </div>
  );
}