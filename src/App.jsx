import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    // This connects to your Node.js backend!
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

  return (
    <div className="bg-[#0f172a] text-gray-200 antialiased selection:bg-blue-500 selection:text-white min-h-screen">
      
      {/* Hero Section */}
      <header className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] -z-10"></div>
        <p className="text-blue-400 font-semibold tracking-widest uppercase mb-3">Welcome to my portfolio</p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Shivang Ayar</span> {/* [cite: 2] */}
        </h1>
        <h2 className="text-2xl md:text-4xl font-medium text-gray-400 mb-8">
          Full-Stack Developer & Data Architect
        </h2>
        <p className="max-w-2xl text-gray-400 mb-10">
          Currently pursuing an Advanced Diploma in Computer Programming and Analysis (CPA). {/* [cite: 4] */}
        </p>
        <div className="flex gap-4">
          <a href="#projects" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg shadow-blue-500/30">Explore Projects</a>
        </div>
      </header>

      {/* Showcase Projects Section */}
      <section id="projects" className="py-20 bg-[#141e33]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Featured <span className="text-blue-500">Projects</span></h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* React AI Project */}
            <div className="bg-[#0f172a] rounded-2xl p-8 border border-gray-800 hover:border-purple-500 hover:-translate-y-2 transition-all duration-300 shadow-xl group">
              <h3 className="text-2xl font-bold text-white mb-3">Voice AI Chatbot Front-End</h3> {/* [cite: 11] */}
              <p className="text-gray-400 mb-6 line-clamp-3">Built during a 24-hour hackathon. Engineered an emotion-aware chatbot integrating Voice APIs with a backend handling asynchronous streams to achieve &lt;200ms latency.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded text-xs font-semibold">React</span> {/* [cite: 11] */}
                <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded text-xs font-semibold">Node.js</span> {/* [cite: 11] */}
                <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs font-semibold">JavaScript</span> {/* [cite: 11] */}
              </div>
            </div>

            {/* Data Project */}
            <div className="bg-[#0f172a] rounded-2xl p-8 border border-gray-800 hover:border-yellow-500 hover:-translate-y-2 transition-all duration-300 shadow-xl group">
              <h3 className="text-2xl font-bold text-white mb-3">Business Intelligence Dashboard</h3> {/* [cite: 18] */}
              <p className="text-gray-400 mb-6 line-clamp-3">Applied Star Schema modeling to a 50,000+ record dataset. Optimized query execution by 60% and wrote complex DAX expressions.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs font-semibold">Power BI</span> {/* [cite: 18] */}
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded text-xs font-semibold">MySQL</span> {/* [cite: 18] */}
                <span className="px-3 py-1 bg-orange-900/30 text-orange-400 rounded text-xs font-semibold">DAX</span> {/* [cite: 18] */}
              </div>
            </div>

            {/* Java OOP Project */}
            <div className="bg-[#0f172a] rounded-2xl p-8 border border-gray-800 hover:border-red-500 hover:-translate-y-2 transition-all duration-300 shadow-xl group">
               <h3 className="text-2xl font-bold text-white mb-3">Battery Quality Control Program</h3> {/* [cite: 24] */}
               <p className="text-gray-400 mb-6 line-clamp-3">Java application achieving 100% accuracy in defect detection. Validated edge cases using robust JUnit testing and optimized algorithms for O(1) time complexity.</p>
               <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded text-xs font-semibold">Java</span> {/* [cite: 24] */}
                  <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded text-xs font-semibold">Object-Oriented Programming</span> {/* [cite: 24] */}
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Node.js Contact Form Section */}
      <section className="py-20 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-8">Let's <span className="text-blue-500">Connect</span></h2>
        <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
          <input 
            type="text" placeholder="Your Name" required
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="p-3 bg-gray-900 text-white rounded outline-none focus:border-blue-500 border border-transparent transition"
          />
          <input 
            type="email" placeholder="Your Email" required
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="p-3 bg-gray-900 text-white rounded outline-none focus:border-blue-500 border border-transparent transition"
          />
          <textarea 
            placeholder="Message" rows="4" required
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="p-3 bg-gray-900 text-white rounded outline-none focus:border-blue-500 border border-transparent transition"
          ></textarea>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition mt-2">
            Send to Node.js Backend
          </button>
        </form>
      </section>

      <footer className="bg-[#0f172a] py-10 text-center border-t border-gray-800">
        <a href="mailto:ayarshivang27@gmail.com" className="text-blue-500 hover:text-blue-400 font-semibold mb-8 inline-block">ayarshivang27@gmail.com</a> {/* [cite: 3] */}
        <p className="text-gray-600 text-sm">© 2026 Shivang Ayar. Powered by React & Node.</p>
      </footer>
    </div>
  );
}

export default App;