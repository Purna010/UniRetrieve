import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { fadeInDown, fadeInUp } from '../animations/variants';

export default function AuthPage() {
  const { login, ssoLogin, register, demoUsers } = useApp();
  const [mode, setMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleDemoLogin = async (role) => {
    const user = demoUsers.find(u => u.role === role);
    if (user) {
      await login(user.email, 'password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email, password);
    } else if (mode === 'register') {
      await register(name, email, password, studentId);
    }
  };

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Campus Background Image with Dark Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/campus-bg.png')`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-[#070b14]/80 backdrop-blur-[1px] bg-gradient-to-b from-[#0f172a]/90 via-[#070b14]/75 to-[#0b1120]/95" />
      </div>

      {/* Ambient background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-neon-purple/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-neon-cyan/10 blur-[140px]" />
      </div>

      <motion.div
        {...fadeInDown}
        className="w-full max-w-md glass-panel p-8 space-y-8 flex flex-col items-center text-center relative z-10 overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-neon-cyan/20 blur-[80px] pointer-events-none" />

        <div className="z-10 relative space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center">
            <span className="text-neon-cyan font-bold text-3xl" style={{ fontFamily: 'JetBrains Mono, monospace' }}>U</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'dev' && 'Developer Mode'}
            </h1>
            <p className="text-white/50 text-sm mt-2">
              {mode === 'dev' ? 'Select a demo user to sign in' : 'Sign in to UniRetrieve lost & found'}
            </p>
          </div>
        </div>

        <div className="w-full z-10 relative flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg mb-4">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${mode === 'login' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${mode === 'register' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            Register
          </button>
          <button
            onClick={() => setMode('dev')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${mode === 'dev' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            Dev Mode
          </button>
        </div>

        <div className="w-full z-10 relative">
          <AnimatePresence mode="wait">
            {mode === 'dev' ? (
              <motion.div
                key="dev"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-left"
              >
                <div className="space-y-3">
                  <button
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full glass-card hover:bg-neon-purple/20 border-neon-purple/30 hover:border-neon-purple/60 text-left px-4 py-3 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-neon-purple transition-colors">Login as Admin</p>
                      <p className="text-xs text-white/40">Hamsaveeni (Campus Faculty)</p>
                    </div>
                    <span className="text-neon-purple/50 group-hover:text-neon-purple">→</span>
                  </button>

                  <button
                    onClick={() => handleDemoLogin('user')}
                    className="w-full glass-card hover:bg-neon-cyan/20 border-neon-cyan/30 hover:border-neon-cyan/60 text-left px-4 py-3 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">Login as Reporter</p>
                      <p className="text-xs text-white/40">Anush Kumar (Student)</p>
                    </div>
                    <span className="text-neon-cyan/50 group-hover:text-neon-cyan">→</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="auth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4 text-left"
              >
                {mode === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/60">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-white/60">Student ID Number</label>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="STUDENT123"
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/60">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/60">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  />
                </div>

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-neon-cyan/70 hover:text-neon-cyan transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-neon-cyan/80 to-neon-purple/80 hover:from-neon-cyan hover:to-neon-purple text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]"
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#0b1120] px-3 text-[10px] font-mono uppercase tracking-wider text-white/40 absolute">
                    or institutional identity
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => ssoLogin('anush@univ.edu')}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg bg-white/5 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-white text-xs font-bold transition-all group shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                >
                  <span className="text-amber-400 text-sm">🎓</span>
                  <span className="group-hover:text-amber-300">Sign in with University ERP (SAML / OAuth)</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="text-xs text-white/30 z-10 relative pt-4">
          By continuing, you agree to UniRetrieve's Terms of Service and Privacy Policy.
        </div>
      </motion.div>
    </div>
  );
}
