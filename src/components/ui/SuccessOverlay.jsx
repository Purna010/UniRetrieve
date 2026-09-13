import React from 'react';

export default function SuccessOverlay({ isVisible, message, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in">
      <div className="glass-panel border-neon-cyan/40 bg-dark-panel/90 max-w-sm w-full p-10 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,245,255,0.2)]">
        {/* Background glowing circles */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-neon-cyan/20 blur-[50px] rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neon-purple/20 blur-[50px] rounded-full" />

        {/* Animated Checkmark */}
        <div className="relative mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-neon-cyan/10 border-2 border-neon-cyan flex items-center justify-center relative">
            <svg
              className="w-10 h-10 text-neon-cyan"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-glow-cyan">Success!</h2>
        
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          {message || "Your report has been submitted and registered successfully."}
        </p>

        {/* Loading/Redirect Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-neon-cyan to-neon-purple w-full animate-progress-bar" />
      </div>
    </div>
  );
}
