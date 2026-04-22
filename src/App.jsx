import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';

// --- 3D COMPONENTS ---
const InteractiveShape = () => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  // Rotate the shape smoothly on every frame
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh 
        ref={meshRef} 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
      >
        <icosahedronGeometry args={[2, 4]} />
        <MeshDistortMaterial 
          color={hovered ? "#06b6d4" : "#6366f1"} 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.8} 
          roughness={0.2}
          distort={hovered ? 0.4 : 0.2} 
          speed={hovered ? 5 : 2}
        />
      </mesh>
    </Float>
  );
};

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    alert('Message transmission initiated!');
  };

  return (
    <div className="bg-[#020617] text-gray-200 antialiased selection:bg-cyan-500 selection:text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* --- LAYER 1: THE 3D WEBGL CANVAS --- */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#06b6d4" />
          <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
          
          <Environment preset="city" />
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
          
          <InteractiveShape />
          
          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        </Canvas>
      </div>

      {/* --- LAYER 2: HTML UI OVERLAY --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#020617]/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest">
            <span className="text-cyan-400">&lt;/&gt;</span> SHIVANG
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#about" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">Comm-Link</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20 min-h-screen pointer-events-none flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          
          {/* Left Text (pointer-events-auto allows clicking links despite the wrapper) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start pointer-events-auto"
          >
            <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold tracking-widest mb-6">
              SYSTEM ONLINE
            </span>
            
            <h1 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter mix-blend-difference">
              Shivang
            </h1>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-6 tracking-tighter">
              Ayar.
            </h1>
            
            <p className="text-lg text-gray-400 mb-8 max-w-md leading-relaxed">
              Full-Stack Architect & WebGL Enthusiast. Specializing in MERN stack applications, robust database design, and next-generation interactive experiences.
            </p>
            
            <div className="flex gap-4">
              <a href="#projects" className="bg-white text-black px-8 py-3 rounded-none font-bold hover:bg-gray-200 transition-all">
                EXECUTE / WORK
              </a>
              <a href="#contact" className="border border-white/20 hover:border-white/60 text-white px-8 py-3 rounded-none font-bold transition-all">
                PING SECURE
              </a>
            </div>
          </motion.div>
          
        </div>
      </main>

    </div>
  );
}