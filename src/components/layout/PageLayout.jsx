import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import ToastContainer from '../ui/ToastContainer';
import { pageVariants, pageTransition } from '../../animations/variants';

export default function PageLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen bg-dark-base flex flex-col relative overflow-hidden">
      {/* Campus Background Image with Theme-Preserving Dark Overlay (Except Chat Page) */}
      {!isChatPage && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ 
            backgroundImage: `url('/campus-bg.png')`,
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-[#07090e]/82 backdrop-blur-[1px] bg-gradient-to-b from-[#0b0e14]/90 via-[#07090e]/75 to-[#0b0e14]/95" />
        </div>
      )}

      {/* Global Ambient Background - Amber Gold Warm Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/5 blur-[130px]" />
        <div className="absolute top-[40%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-amber-400/5 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-amber-600/5 blur-[130px]" />
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
        <footer className="border-t border-white/10 py-4 px-6 text-center backdrop-blur-md bg-white/5 mt-auto">
          <p className="text-xs text-white/50">
            UniRetrieve © 2025 · AI-Powered Lost & Found · 
            <span className="text-amber-400/80 ml-1 font-medium">Blockchain Secured</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
