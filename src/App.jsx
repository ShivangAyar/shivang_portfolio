import React, { useState } from 'react';
import { motion } from 'framer-motion';

function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="bg-[#040914] text-gray-200 antialiased selection:bg-cyan-500 selection:text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* --- FLOATING BACKGROUND OBJECTS --- */}
      {/* 1. Floating Ring (Torus) */}
      <motion.div 
        animate={{ y: [0, -40, 0], rotateX: [0, 20, 0], rotateY: [0, 45, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[10%] w-48 h-48 border-[24px] border-purple-600/20 rounded-full blur-[2px]"
      />
      
      {/* 2. Floating Diamond/Cube */}
      <motion.div 
        animate={{ y: [0, 50, 0], rotate: [45, 90, 45] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-[20%] w-40 h-40 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-3xl blur-[2px]"
      />

      {/* 3. Glowing Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />


      {/* --- GLASSMORPHISM NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#040914]/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="text-cyan-400">&lt;/&gt;</span> Shivang Ayar
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (SPLIT LAYOUT) --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Column: Text & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300 mb-6">
              Hey there!
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">Shivang</span>
            </h1>
            
            <h2 className="text-3xl md:text-4xl font-bold text-purple-500 mb-6">
              Full-Stack Architect
            </h2>
            
            <p className="text-lg text-gray-400 mb-8 max-w-md leading-relaxed">
              Computer Programming student at Algonquin College crafting dynamic web applications and scalable backends. Building robust tech that drives real-world impact.
            </p>
            
            <p className="text-sm font-semibold text-cyan-400 mb-8">
              Whatever you conceptualize, I can engineer it.
            </p>
            
            <div className="flex gap-4 mb-10">
              <a href="#projects" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2">
                View My Work <span className="text-xl">↗</span>
              </a>
              <a href="#contact" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
                Ping Me <span className="text-xl">✉</span>
              </a>
            </div>

            {/* Social Icons Placeholder */}
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                G
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                in
              </a>
            </div>
          </motion.div>

          {/* Right Column: Profile Image Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* The Image Card */}
            <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-1 shadow-2xl backdrop-blur-sm z-20">
              <div className="w-full h-full rounded-[20px] bg-[#0a101f] flex items-center justify-center overflow-hidden">
                {/* TODO: Put your image here! 
                  Replace this <p> tag with an <img src="/your-photo.png" className="w-full h-full object-cover" />
                */}
                <p className="text-gray-500 font-mono text-sm">Drop your photo here</p>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

    </div>
  );
}

export default App;