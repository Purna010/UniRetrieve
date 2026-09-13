import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import StatCard from '../components/dashboard/StatCard';
import HeatmapWidget from '../components/map/HeatmapWidget';
import { fadeInUp } from '../animations/variants';

export default function AdminDashboardPage() {
  const { stats, zones, heatmapPoints, matches, items, resolveClaim, overrideLock } = useApp();
  const [activeTab, setActiveTab] = useState('analytics'); 
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  
  const disputes = matches.filter(m => 
    m.status === 'pending_claim' || 
    m.status === 'rejected' || 
    (m.claimAttempts && m.claimAttempts > 0)
  );

  const toggleExpand = (id) => {
    setExpandedMatchId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${activeTab === 'analytics' ? 'border-neon-cyan text-neon-cyan bg-white/5' : 'border-transparent text-white/50 hover:text-white/80'}`}
        >
          📊 Analytics Overview
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${activeTab === 'disputes' ? 'border-neon-purple text-neon-purple bg-white/5' : 'border-transparent text-white/50 hover:text-white/80'}`}
        >
          🛡️ Claims & Disputes Portal
          {matches.filter(m => m.status === 'pending_claim').length > 0 && (
            <span className="bg-neon-pink text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {matches.filter(m => m.status === 'pending_claim').length} New
            </span>
          )}
        </button>
      </div>

      {}
      {activeTab === 'analytics' && (
        <div className="glass-panel border-red-500/30 p-6 space-y-6 bg-red-500/5">
          {}
          <motion.div
            {...fadeInUp}
            className="glass-panel border-neon-purple/40 p-6 text-center bg-neon-purple/5"
          >
            <h1 className="text-2xl font-bold text-white mb-2 text-glow-purple">Admin Dashboard</h1>
            <p className="text-sm text-white/50">Platform metrics and high-loss zones</p>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel border-yellow-400/40 p-6 bg-yellow-400/5"
          >
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider text-center mb-5">Summary Of Items</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Lost" value={stats.totalLost} color="pink" />
              <StatCard label="Total Found" value={stats.totalFound} color="green" />
              <StatCard label="Total Matched" value={stats.totalMatched} color="purple" />
              <StatCard label="Total Claimed" value={stats.totalClaimed} color="cyan" />
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel border-neon-green/40 p-6 bg-neon-green/5"
          >
            <p className="text-xs font-bold text-neon-green uppercase tracking-wider text-center mb-5">Heatmap of lost locations</p>
            <div className="rounded-xl overflow-hidden glass-card border border-neon-green/20">
              <HeatmapWidget points={heatmapPoints} zones={zones} />
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel border-neon-pink/40 p-6 bg-neon-pink/5"
          >
            <p className="text-xs font-bold text-neon-pink uppercase tracking-wider text-center mb-5">Details of High item lost zones</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone, idx) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="glass-card border-neon-pink/20 bg-neon-pink/5 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white/90">{zone.name}</p>
                    <p className="text-xs text-white/40 mt-1">{zone.count} items reported</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold border
                    ${zone.trend.startsWith('+') ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-neon-green/10 text-neon-green border-neon-green/30'}`}
                  >
                    {zone.trend}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {}
      {activeTab === 'disputes' && (
        <div className="glass-panel border-neon-purple/30 p-6 space-y-6 bg-neon-purple/5">
          <motion.div {...fadeInUp} className="text-center pb-2 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white text-glow-purple">Claims & Handover Portal</h1>
            <p className="text-xs text-white/40 mt-1">Review student ownership proofs and manage security lockouts</p>
          </motion.div>

          {disputes.length === 0 ? (
            <div className="text-center py-20 text-white/30 italic">
              <p className="text-4xl mb-2">📁</p>
              <p>No active disputes or claims pending review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map(match => {
                const lostItem = items.find(i => i.id === match.lostItemId);
                const foundItem = items.find(i => i.id === match.foundItemId);
                const isExpanded = expandedMatchId === match.id;
                const isLocked = (match.claimAttempts || 0) >= 3;

                return (
                  <motion.div
                    key={match.id}
                    layout
                    className={`glass-panel border-l-4 transition-all duration-300 ${
                      isLocked 
                        ? 'border-red-500 bg-red-500/5' 
                        : match.status === 'pending_claim' 
                          ? 'border-neon-purple bg-neon-purple/5' 
                          : 'border-neon-green bg-neon-green/5'
                    }`}
                  >
                    {}
                    <div
                      onClick={() => toggleExpand(match.id)}
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          {lostItem?.title || 'Unknown Item'}
                          <span className="text-[10px] text-white/30 font-mono">({match.id})</span>
                        </h3>
                        <div className="flex gap-4 text-[10px] text-white/50">
                          <span>Similarity: <strong className="text-neon-green">{match.similarityScore}%</strong></span>
                          <span>Distance: <strong>{match.locationDistance} km</strong></span>
                          <span>Attempts: <strong className={isLocked ? 'text-red-400 font-bold' : 'text-white'}>{match.claimAttempts || 0}/3</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isLocked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 border border-red-500/40 text-red-400 uppercase">
                            Locked Out
                          </span>
                        ) : match.status === 'pending_claim' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-purple/20 border border-neon-purple/40 text-neon-purple uppercase">
                            Pending Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-green/20 border border-neon-green/40 text-neon-green uppercase">
                            {match.status}
                          </span>
                        )}
                        <span className="text-white/40 transform transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                          ▶
                        </span>
                      </div>
                    </div>

                    {}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 border-t border-white/5 pt-4 space-y-5 overflow-hidden"
                        >
                          {}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card bg-white/3 p-3 space-y-2 border border-neon-cyan/20">
                              <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider">Reported Lost By Owner</p>
                              <p className="text-xs font-semibold text-white">{lostItem?.reportedBy?.name} <span className="text-white/30 font-mono">({lostItem?.reportedBy?.id})</span></p>
                              <p className="text-xs text-white/70">{lostItem?.description}</p>
                              <p className="text-[10px] text-white/30">📍 {lostItem?.location?.label || 'Unknown location'}</p>
                            </div>

                            <div className="glass-card bg-white/3 p-3 space-y-2 border border-neon-green/20">
                              <p className="text-[10px] font-bold text-neon-green uppercase tracking-wider">Reported Found By Finder</p>
                              <p className="text-xs font-semibold text-white">{foundItem?.reportedBy?.name} <span className="text-white/30 font-mono">({foundItem?.reportedBy?.id})</span></p>
                              <p className="text-xs text-white/70">{foundItem?.description}</p>
                              <p className="text-[10px] text-white/30">📍 {foundItem?.location?.label || 'Unknown location'}</p>
                            </div>
                          </div>

                          {}
                          <div className="glass-card bg-white/3 p-4 border border-white/5 space-y-4">
                            <p className="text-xs font-bold text-white uppercase tracking-wider pb-1 border-b border-white/5">Verification Proof Documents</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase block">Student ID Number</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-white font-mono">{match.verification?.studentId || 'Not Provided'}</span>
                                  {match.ocrVerified !== undefined && (
                                    match.ocrVerified ? (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">OCR MATCHED</span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20" title="Student ID not found in image text">OCR MISMATCH</span>
                                    )
                                  )}
                                </div>
                              </div>
                              
                              <div className="md:col-span-2 space-y-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase block">Student ID Card Scan</span>
                                {match.verification?.proofImage ? (
                                  <div 
                                    className="relative w-36 h-20 rounded border border-white/10 overflow-hidden cursor-zoom-in group bg-white/5"
                                    onClick={() => setZoomImage(match.verification.proofImage)}
                                  >
                                    <img src={match.verification.proofImage} alt="ID Scan Proof" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded">Click to Zoom</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-white/30 italic block pt-1">No ID Image Uploaded</span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3 pt-2">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase block">Challenge 1: Unique Item Marks / Scratches</span>
                                <p className="text-xs text-white/80 bg-black/20 p-2 rounded border border-white/5">{match.verification?.uniqueMarks || 'No response provided.'}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase block">Challenge 2: Description of Hidden Contents</span>
                                <p className="text-xs text-white/80 bg-black/20 p-2 rounded border border-white/5">{match.verification?.contentsDesc || 'No response provided.'}</p>
                              </div>
                            </div>
                          </div>

                          {}
                          <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <div className="text-[10px] text-white/30">
                              Match registered: {new Date(match.matchedAt || Date.now()).toLocaleDateString()}
                            </div>

                            <div className="flex gap-2">
                              {isLocked ? (
                                <button
                                  onClick={() => overrideLock(match.id)}
                                  className="px-4 py-2 text-xs font-bold rounded border border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-all flex items-center gap-1.5"
                                >
                                  🔑 Override Lock / Reset Attempts
                                </button>
                              ) : match.status === 'pending_claim' ? (
                                <>
                                  <button
                                    onClick={() => resolveClaim(match.id, false)}
                                    className="px-4 py-2 text-xs font-bold rounded border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                  >
                                    Decline / Reject Proof
                                  </button>
                                  <button
                                    onClick={() => resolveClaim(match.id, true)}
                                    className="px-4 py-2 text-xs font-bold rounded border border-neon-green/50 bg-neon-green/10 text-neon-green hover:bg-neon-green/20 transition-all"
                                  >
                                    Approve Handover
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => overrideLock(match.id)}
                                  className="px-4 py-2 text-xs font-bold rounded border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                                >
                                  Reopen / Edit Claim
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
            onClick={() => setZoomImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-2xl max-h-[85vh] overflow-hidden rounded-lg border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-dark-panel p-2 relative"
              onClick={e => e.stopPropagation()}
            >
              <img src={zoomImage} alt="Verification Zoom Proof" className="max-w-full max-h-[75vh] object-contain rounded-md" />
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
