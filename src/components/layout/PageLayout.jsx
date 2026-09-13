import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import ToastContainer from '../ui/ToastContainer';
import { pageVariants, pageTransition } from '../../animations/variants';

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-dark-base flex flex-col relative overflow-hidden">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-neon-purple/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-neon-cyan/5 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-neon-pink/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <motion.main
          key={window.location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8"
        >
          <Outlet />
        </motion.main>
        <ToastContainer />
        <footer className="border-t border-white/5 py-4 px-6 text-center backdrop-blur-md bg-white/5 mt-auto">
          <p className="text-xs text-white/40">
            UniRetrieve © 2025 · AI-Powered Lost & Found · 
            <span className="text-neon-cyan/60 ml-1">Blockchain Secured</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
