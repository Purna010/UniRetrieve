import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeInUp } from '../animations/variants';
import HomeInfoCards from '../components/home/HomeInfoCards';

export default function HomePage() {
  const scrollToGuide = () => {
    const el = document.getElementById('info-cards-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <motion.section 
        {...fadeInUp} 
        className="relative overflow-hidden rounded-2xl glass-panel p-8 sm:p-12 border border-white/10 shadow-2xl"
      >
        {/* Ambient Amber Glows */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Badges Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 drop-shadow-md backdrop-blur-md flex items-center gap-1.5">
              <span>✦</span> AI-Powered Visual Matching
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white drop-shadow-md backdrop-blur-md flex items-center gap-1.5">
              <span>⛓</span> Blockchain Handover Ledger
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 drop-shadow-md backdrop-blur-md flex items-center gap-1.5">
              <span>🏛</span> Campus-Wide Network
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg tracking-tight">
              Lost Something On Campus? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-amber-400 drop-shadow-sm">
                We'll Find It Fast.
              </span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed drop-shadow-sm font-normal pt-1">
              UniRetrieve integrates computer vision image embeddings, optical character recognition for student IDs, and campus-wide coordination to reunite lost belongings with their rightful owners.
            </p>
          </div>

          {/* Dual Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/report"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-black bg-amber-500 hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>＋</span>
              <span>Report Lost / Found</span>
            </Link>

            <Link
              to="/items"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white glass-card border-white/20 hover:border-amber-400 hover:text-amber-400 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>🔍</span>
              <span>Browse All Reports</span>
            </Link>

            <button
              onClick={scrollToGuide}
              className="px-5 py-3.5 rounded-xl font-semibold text-sm text-white/70 hover:text-white transition-all flex items-center gap-2"
            >
              <span>📖</span>
              <span>FAQ & How It Works ↓</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-500/30 transition-colors">
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">&lt; 2.5s</p>
          <p className="text-xs font-semibold text-white">AI Visual Match Speed</p>
          <p className="text-[11px] text-white/40">Real-time vector search</p>
        </div>

        <div className="glass-panel p-5 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-500/30 transition-colors">
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">98.4%</p>
          <p className="text-xs font-semibold text-white">Student ID OCR Accuracy</p>
          <p className="text-[11px] text-white/40">USN & Roll No detection</p>
        </div>

        <div className="glass-panel p-5 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-500/30 transition-colors">
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</p>
          <p className="text-xs font-semibold text-white">Encrypted Private Chat</p>
          <p className="text-[11px] text-white/40">No personal numbers leaked</p>
        </div>

        <div className="glass-panel p-5 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-500/30 transition-colors">
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">On-Chain</p>
          <p className="text-xs font-semibold text-white">Blockchain Verified</p>
          <p className="text-[11px] text-white/40">Official tamper-proof custody</p>
        </div>
      </div>

      {/* Interactive Platform Guide: About App, How to Use, FAQs */}
      <HomeInfoCards />

      {/* Bottom CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-8 sm:p-10 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Ready to reunite with your belongings?
          </h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl">
            Whether you misplaced an item in the labs or picked up a lost card in the canteen, UniRetrieve ensures swift, verified return.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/report"
            className="px-6 py-3 rounded-xl font-bold text-xs text-black bg-amber-500 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            Report An Item
          </Link>
          <Link
            to="/items"
            className="px-6 py-3 rounded-xl font-semibold text-xs text-white glass-card border-white/20 hover:border-amber-400 hover:text-amber-400 transition-all"
          >
            View Active Reports
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
