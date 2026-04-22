import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Tracks the mouse to create the interactive background glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('Message sent to the Node backend successfully!');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Animation variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="bg-[#0a0f1c] text-gray-200 antialiased selection:bg-blue-500 selection:text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* Interactive Cursor Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), transparent 80%)`
        }}
      />

      {/* Hero Section */}
      <header className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0f1c] to-[#0a0f1c] -z-10"></div>
        
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.p variants={itemVariants} className="text-blue-500 font-bold tracking-[0.2em] uppercase mb-4 text-sm">
            Welcome to my portfolio
          </motion.p>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
            I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Shivang Ayar</span>
          </motion.h1>
          
          <motion.h2 variants={itemVariants} className="text-2xl md:text-4xl font-medium text-gray-400 mb-8">
            Full-Stack Developer <span className="text-gray-600">&</span> Data Architect
          </motion.h2>
          
          <motion.p variants={itemVariants} className="max-w-2xl text-gray-500 mb-10 text-lg leading-relaxed">
            Currently pursuing an Advanced Diploma in Computer Programming and Analysis. Architecting scalable backends and immersive frontend experiences.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex gap-6">
            <motion.a 
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              href="#projects" 
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all"
            >
              Explore Projects
            </motion.a>
          </motion.div>
        </motion.div>
      </header>

      {/* Showcase Projects Section */}
      <section id="projects" className="py-32 relative z-10 border-t border-gray-800/50 bg-[#0f1423]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-white mb-20 tracking-tight"
          >
            Featured <span className="text-blue-500">Architecture</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* React AI Project */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#151b2b] rounded-2xl p-8 border border-gray-800/80 hover:border-purple-500/50 transition-all duration-300 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <h3 className="text-2xl font-bold text-white mb-3">Voice AI Chatbot</h3>
              <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed">Engineered an emotion-aware chatbot integrating Voice APIs with a backend handling asynchronous streams to achieve &lt;200ms latency.</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold tracking-wide">React</span>
                <span className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-bold tracking-wide">Node.js</span>
              </div>
            </motion.div>

            {/* Data Project */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#151b2b] rounded-2xl p-8 border border-gray-800/80 hover:border-blue-500/50 transition-all duration-300 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <h3 className="text-2xl font-bold text-white mb-3">BI Dashboard</h3>
              <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed">Applied Star Schema modeling to a 50,000+ record dataset. Optimized query execution by 60% and wrote complex DAX expressions.</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-bold tracking-wide">Power BI</span>
                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold tracking-wide">MySQL</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Node.js Contact Form Section */}
      <section className="py-32 relative z-10 border-t border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">Initiate <span className="text-blue-500">Sequence</span></h2>
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-6 bg-[#151b2b] p-10 rounded-3xl shadow-2xl border border-gray-800/80">
            <input 
              type="text" placeholder="Designation (Name)" required
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="p-4 bg-[#0a0f1c] text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800 transition-all"
            />
            <input 
              type="email" placeholder="Comms Channel (Email)" required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="p-4 bg-[#0a0f1c] text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800 transition-all"
            />
            <textarea 
              placeholder="Transmit Payload (Message)" rows="4" required
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="p-4 bg-[#0a0f1c] text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800 transition-all resize-none"
            ></textarea>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors mt-4 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Transmit to Server
            </motion.button>
          </form>
        </div>
      </section>

    </div>
  );
}

export default App;