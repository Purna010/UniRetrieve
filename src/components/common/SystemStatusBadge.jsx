import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SystemStatusBadge() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/health', {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth({ status: 'offline' });
      }
    } catch (err) {
      setHealth({ status: 'offline' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHealthy = health?.status === 'healthy';
  const isOffline = health?.status === 'offline' || !health;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
          isOffline
            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
            : isHealthy
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
        }`}
        title="View live system microservices status"
      >
        <span className="relative flex h-2 w-2">
          {!isOffline && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOffline ? 'bg-red-500' : isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </span>
        <span className="hidden sm:inline">
          {loading && !health
            ? 'Checking...'
            : isOffline
            ? 'Services Offline'
            : isHealthy
            ? 'All Services Active'
            : 'Partial Active'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 p-4 rounded-xl glass-panel bg-[#0d131f]/95 border border-white/10 shadow-2xl backdrop-blur-xl z-50 text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Microservices Status
                </h4>
                <p className="text-[10px] text-white/40">Real-time health telemetry</p>
              </div>
              <button
                onClick={checkHealth}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                disabled={loading}
              >
                {loading ? '...' : '↻ Refresh'}
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Database */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🍃</span>
                  <div>
                    <p className="text-white/90 font-medium text-[11px]">MongoDB Engine</p>
                    <p className="text-[10px] text-white/40">Port 27017</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    health?.services?.database?.status === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {health?.services?.database?.status || 'Disconnected'}
                </span>
              </div>

              {/* Blockchain */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⛓️</span>
                  <div>
                    <p className="text-white/90 font-medium text-[11px]">Hardhat Blockchain</p>
                    <p className="text-[10px] text-white/40">
                      {health?.services?.blockchain?.blockNumber !== null &&
                      health?.services?.blockchain?.blockNumber !== undefined
                        ? `Block #${health.services.blockchain.blockNumber}`
                        : 'Port 8545'}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    health?.services?.blockchain?.status === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {health?.services?.blockchain?.status || 'Offline'}
                </span>
              </div>

              {/* Vision AI */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">👁️</span>
                  <div>
                    <p className="text-white/90 font-medium text-[11px]">YOLOv5 Vision AI</p>
                    <p className="text-[10px] text-white/40">Python Flask 5001</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    health?.services?.visionAI?.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {health?.services?.visionAI?.status || 'Offline'}
                </span>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔔</span>
                  <div>
                    <p className="text-white/90 font-medium text-[11px]">Push & Email Hub</p>
                    <p className="text-[10px] text-white/40">VAPID + Ethereal</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    health?.services?.notifications?.webPushStatus === 'ready'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {health?.services?.notifications?.webPushStatus === 'ready' ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>

            {health?.uptimeSeconds !== undefined && (
              <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-[10px] text-white/30">
                <span>Backend Uptime</span>
                <span>{Math.floor(health.uptimeSeconds / 60)}m {health.uptimeSeconds % 60}s</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
