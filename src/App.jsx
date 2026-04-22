import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Environment, ContactShadows, MeshTransmissionMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// --- 3D FLOATING TEXT COMPONENT ---
function FloatingWord({ children, position, rotation, scale = 1, color = "#4f46e5" }) {
  const textRef = useRef();
  
  // Adds a slight subtle hover effect to each word
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
// This sits in the middle until you replace it with a real 3D model
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
    alert('Message transmission initiated!');
  };

  return (
    <div className="bg-[#02040a] text-gray-200 antialiased selection:bg-cyan-500 selection:text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* --- LAYER 1: 3D ENVIRONMENT --- */}
      <div className="absolute inset-0 z-0 cursor-crosshair">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <color attach="background" args={['#02040a']} />
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#06b6d4" />
          <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={2} color="#8b5cf6" />
          
          <Environment preset="city" />
          <CameraRig />

          {/* Central Glass Object (Replace with <primitive object={gltf.scene} /> later) */}
          <CentralGlassShape />

          {/* Floating Tech Stack & Aesthetic Words */}
          <FloatingWord position={[-5, 3, -4]} rotation={[0, 0.2, 0]} scale={1.5} color="#06b6d4">FULL-STACK</FloatingWord>
          <FloatingWord position={[6, 4, -6]} rotation={[0, -0.3, 0]} scale={1.2} color="#8b5cf6">NODE.JS</FloatingWord>
          <FloatingWord position={[-7, -2, -5]} rotation={[0, 0.5, 0]} scale={1} color="#10b981">MONGODB</FloatingWord>
          <FloatingWord position={[5, -3, -3]} rotation={[0, -0.2, 0]} scale={1.8} color="#eab308">JAVA / OOP</FloatingWord>
          <FloatingWord position={[-3, 5, -8]} rotation={[0, 0.1, 0]} scale={0.8} color="#ef4444">POWER BI</FloatingWord>
          <FloatingWord position={[8, 0, -4]} rotation={[0, -0.4, 0]} scale={1.3} color="#0ea5e9">REACT</FloatingWord>
          
          {/* Subtle Background Elements */}
          <FloatingWord position={[-8, -5, -10]} rotation={[0, 0.4, 0]} scale={0.6} color="#475569">RTX 4050</FloatingWord>
          <FloatingWord position={[7, 6, -12]} rotation={[0, -0.1, 0]} scale={0.7} color="#475569">OCTANE</FloatingWord>

          {/* Floor Reflection */}
          <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} color="#06b6d4" />
        </Canvas>
      </div>

      {/* --- LAYER 2: HTML UI OVERLAY --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#02040a]/30 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-white tracking-widest">
            <span className="text-cyan-400">&lt;/&gt;</span> SHIVANG
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
            <a href="#projects" className="hover:text-cyan-400 transition-colors">Projects</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20 min-h-screen pointer-events-none flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          
          {/* Left Text UI */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start pointer-events-auto bg-[#02040a]/20 p-8 rounded-3xl backdrop-blur-sm border border-white/5"
          >
            <span className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold tracking-widest mb-6">
              SYSTEM.READY
            </span>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
              Shivang <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Ayar.</span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed mt-4 drop-shadow-md">
              Computer Programming Analyst. Engineering highly optimized full-stack applications and immersive WebGL experiences. 
            </p>
            
            <div className="flex gap-4">
              <a href="#projects" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-all">
                View Architecture
              </a>
              <a href="#contact" className="border border-white/20 hover:border-white/60 text-white px-8 py-3 rounded-xl font-bold transition-all hover:bg-white/5">
                Initialize Contact
              </a>
            </div>
          </motion.div>
          
        </div>
      </main>

    </div>
  );
}