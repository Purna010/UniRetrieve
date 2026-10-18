import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { fadeInUp, scaleIn } from '../animations/variants';
import { getScoreColor, formatDateTime } from '../utils/helpers';
import NeonButton from '../components/ui/NeonButton';
import { privacyRedactor } from '../utils/privacyRedactor';

function CircleScore({ score }) {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 40;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="#1a1a1a" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50" cy="50" r="40"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-bold font-mono"
          style={{ color }}
        >
          {score}%
        </motion.span>
      </div>
    </div>
  );
}

function ItemImageBox({ label, item, color }) {
  const colorMap = {
    blue: { border: 'border-neon-blue/40', bg: 'bg-neon-blue/5', text: 'text-neon-blue' },
    red: { border: 'border-red-500/40', bg: 'bg-red-500/5', text: 'text-red-400' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      {...fadeInUp}
      className={`glass-card ${c.border} ${c.bg} p-4 flex flex-col gap-3`}
    >
      <p className={`text-xs font-bold uppercase tracking-widest ${c.text} text-center`}>{label}</p>
      <div className="h-36 rounded-lg glass-panel flex items-center justify-center">
        {item?.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover rounded-lg" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/15">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">{label}</span>
          </div>
        )}
      </div>
      {item && (
        <div className="text-center">
          <p className="text-xs font-semibold text-white/70">{item.title}</p>
          <p className="text-xs text-white/30 mt-0.5">{item.category}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function MatchResultPage() {
  const { matchId } = useParams();
  const { matches, items, sendClaimRequest, sendZkClaimRequest, isLoading, currentUser } = useApp();
  const navigate = useNavigate();

  const match = matches.find(m => m.id === matchId);
  const lostItem = items.find(i => i.id === match?.lostItemId);
  const foundItem = items.find(i => i.id === match?.foundItemId);

  const [claimed, setClaimed] = useState(match?.claimRequestSent || false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState(1);
  const [studentId, setStudentId] = useState(currentUser?.studentId || '');
  const [studentCardPreview, setStudentCardPreview] = useState(null);
  const [idScanning, setIdScanning] = useState(false);
  const [idScanProgress, setIdScanProgress] = useState(0);
  const [uniqueMarks, setUniqueMarks] = useState('');
  const [contentsDesc, setContentsDesc] = useState('');
  const [useZkProof, setUseZkProof] = useState(true);
  const [autoRedactPii, setAutoRedactPii] = useState(true);
  const [isRedacted, setIsRedacted] = useState(false);
  const attempts = match?.claimAttempts || 0;

  const cardFileRef = useRef(null);

  const handleClaimClick = () => {
    if (attempts >= 3) {
      alert("Verification locked. Too many claim attempts. Please visit Campus Security (ADMIN001).");
      return;
    }
    setShowVerifyModal(true);
    setVerifyStep(1);
  };

  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const rawBase64 = reader.result;
      if (autoRedactPii) {
        try {
          const redacted = await privacyRedactor.redactImageClientSide(rawBase64);
          setStudentCardPreview(redacted);
          setIsRedacted(true);
        } catch (err) {
          setStudentCardPreview(rawBase64);
        }
      } else {
        setStudentCardPreview(rawBase64);
      }
    };
    reader.readAsDataURL(file);
    
    setIdScanning(true);
    setIdScanProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setIdScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIdScanning(false);
      }
    }, 200);
  };

  const handleVerifySubmit = async () => {
    if (!studentId.trim()) {
      alert("Student ID is required.");
      return;
    }
    if (!studentCardPreview) {
      alert("Please upload your student card ID.");
      return;
    }

    if (verifyStep === 1) {
      setVerifyStep(2);
      return;
    }

    
    if (!uniqueMarks.trim() || !contentsDesc.trim()) {
      alert("Please complete the challenge-response questions.");
      return;
    }

    let success;
    if (useZkProof) {
      // Zero-Knowledge Proof: Proves knowledge of private item features without plaintext disclosure
      const privateSecret = `${uniqueMarks.trim()} | ${contentsDesc.trim()}`;
      success = await sendZkClaimRequest(matchId, privateSecret, studentId);
    } else {
      success = await sendClaimRequest(matchId, {
        studentId,
        uniqueMarks,
        contentsDesc,
        proofImage: studentCardPreview
      });
    }

    if (success) {
      setClaimed(true);
      setShowVerifyModal(false);
    }
  };

  if (!match) {
    return (
      <div className="text-center py-20 text-white/30">
        <p className="text-4xl mb-3">🔗</p>
        <p>Match not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {}
      <motion.div
        {...scaleIn}
        className="glass-panel border-neon-purple/30 p-6 space-y-6 bg-neon-purple/5"
      >
        {}
        <motion.div {...fadeInUp} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs font-bold text-neon-green uppercase tracking-wider">AI Matched</span>
          </div>
          <h1 className="text-xl font-bold text-white">Possible Match Found!</h1>
          <p className="text-sm text-white/40 mt-1">
            Our AI found a {match.similarityScore}% similarity between these items
          </p>
        </motion.div>

        {}
        <div className="grid grid-cols-2 gap-4">
          <ItemImageBox label="Lost item img" item={lostItem} color="blue" />
          <ItemImageBox label="Found item img" item={foundItem} color="blue" />
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel border-neon-green/30 p-5 bg-neon-green/5"
        >
          <p className="text-xs font-bold text-neon-green uppercase tracking-wider text-center mb-4">Similarity Score</p>
          <div className="flex items-center justify-center gap-8">
            <CircleScore score={match.similarityScore} />
            <div className="space-y-2 text-right">
              <div>
                <p className="text-xs text-white/30">AI Confidence</p>
                <p className="text-sm font-semibold text-neon-cyan">{Math.round(match.aiConfidence * 100)}%</p>
              </div>
              <div>
                <p className="text-xs text-white/30">Location Match</p>
                <p className={`text-sm font-semibold ${match.locationMatch ? 'text-neon-green' : 'text-red-400'}`}>
                  {match.locationMatch ? '✓ Yes' : '✕ No'}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/30">Distance</p>
                <p className="text-sm font-semibold text-white">{match.locationDistance} km</p>
              </div>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel border-red-500/30 p-5 space-y-3 bg-red-500/5"
        >
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider text-center mb-3">Location Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-white/30 uppercase tracking-wider">Lost At</p>
              <p className="text-sm font-medium text-white">{lostItem?.location?.label || '—'}</p>
              <p className="text-xs text-white/25">{lostItem?.location?.zone}</p>
              {lostItem?.date && <p className="text-xs text-white/20">{formatDateTime(lostItem.date)}</p>}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-white/30 uppercase tracking-wider">Found At</p>
              <p className="text-sm font-medium text-white">{foundItem?.location?.label || '—'}</p>
              <p className="text-xs text-white/25">{foundItem?.location?.zone}</p>
              {foundItem?.date && <p className="text-xs text-white/20">{formatDateTime(foundItem.date)}</p>}
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 text-center">
            <p className="text-xs text-white/30">
              Approx. distance between locations: 
              <span className="text-neon-orange ml-1 font-semibold">{match.locationDistance} km</span>
            </p>
          </div>
        </motion.div>

        {}
        <div className="glass-card border-neon-cyan/20 bg-neon-cyan/5 px-4 py-3 text-center">
          <p className="text-xs text-white/25 mb-1">Blockchain Records</p>
          <div className="flex justify-center gap-4 font-mono text-xs">
            <span className="text-neon-cyan/60">Lost: {lostItem?.blockchainHash}</span>
            <span className="text-neon-cyan/60">Found: {foundItem?.blockchainHash}</span>
          </div>
        </div>

        {}
        <div className="flex justify-center pt-2">
          {claimed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-10 py-3.5 rounded-xl border border-neon-green/40 bg-neon-green/10 text-neon-green font-semibold text-sm text-center"
            >
              ✓ Claim Request Sent! Check Messages.
            </motion.div>
          ) : (
            <motion.button
              id="send-claim-btn"
              onClick={handleClaimClick}
              disabled={isLoading || attempts >= 3}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-3.5 rounded-xl border border-red-500/50 bg-red-500/10 text-white font-semibold
                hover:bg-red-500/20 hover:border-red-500/80 transition-all text-sm disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Claim Request'}
            </motion.button>
          )}
        </div>

        {}
        {claimed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <button
              onClick={() => navigate('/chat')}
              className="text-sm text-neon-cyan hover:text-neon-cyan/80 underline transition-colors"
            >
              Go to Chat with Finder →
            </button>
          </motion.div>
        )}
      </motion.div>

      {}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel border-neon-purple/40 bg-dark-panel w-full max-w-lg p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 blur-[50px] pointer-events-none rounded-full" />
              
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
                  Ownership Verification (Step {verifyStep}/2)
                </h3>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                >
                  ✕
                </button>
              </div>

              {}
              {verifyStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider" htmlFor="student-id-field">Student ID Card Number</label>
                    <input
                      id="student-id-field"
                      type="text"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      placeholder="e.g. STU2023001"
                      className="glass-input py-2.5 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">Student Card ID Proof (Scan)</label>
                    
                    <div className="relative h-40 rounded-xl border border-white/10 glass-panel bg-white/5 flex flex-col items-center justify-center overflow-hidden">
                      {studentCardPreview ? (
                        <>
                          <img src={studentCardPreview} alt="Student Card Preview" className="w-full h-full object-cover" />
                          {idScanning && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                              {}
                              <div className="absolute left-0 w-full h-0.5 bg-neon-green shadow-[0_0_8px_#00ff88] animate-scan-laser" />
                              <span className="text-xs font-bold text-neon-green font-mono uppercase tracking-widest">ID Scanning... {idScanProgress}%</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cardFileRef.current?.click()}
                          className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-all"
                        >
                          <span className="text-3xl">🪪</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Upload Student Card ID</span>
                        </button>
                      )}
                    </div>
                    
                    {studentCardPreview && !idScanning && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => cardFileRef.current?.click()}
                          className="text-[10px] text-neon-cyan/70 hover:text-neon-cyan transition-colors"
                        >
                          Reupload Card ID
                        </button>
                      </div>
                    )}
                    
                    <input
                      ref={cardFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCardUpload}
                      className="hidden"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-white/70">
                        <input
                          type="checkbox"
                          checked={autoRedactPii}
                          onChange={(e) => setAutoRedactPii(e.target.checked)}
                          className="rounded border-white/20 bg-white/5 text-neon-cyan focus:ring-0"
                        />
                        <span>🛡️ Auto-Redact Face & Sensitive PII</span>
                      </label>
                      {isRedacted && (
                        <span className="text-[10px] font-bold text-neon-green font-mono bg-neon-green/10 border border-neon-green/30 px-2 py-0.5 rounded">
                          PII Shield Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {}
              {verifyStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block" htmlFor="marks-field">
                      Challenge 1: Unique Item Marks / Scratches
                    </label>
                    <textarea
                      id="marks-field"
                      value={uniqueMarks}
                      onChange={e => setUniqueMarks(e.target.value)}
                      placeholder="e.g. Scratched on the bottom right corner, library sticker on the back..."
                      className="glass-input resize-none h-20 py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block" htmlFor="contents-field">
                      Challenge 2: Description of Hidden Contents
                    </label>
                    <textarea
                      id="contents-field"
                      value={contentsDesc}
                      onChange={e => setContentsDesc(e.target.value)}
                      placeholder="e.g. Contains CS textbooks, a black charger, and a red keyholder inside the front zipper..."
                      className="glass-input resize-none h-20 py-2 text-xs"
                    />
                  </div>

                  <div className="p-3 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 text-xs text-white/80 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-neon-cyan">
                      <input
                        type="checkbox"
                        checked={useZkProof}
                        onChange={(e) => setUseZkProof(e.target.checked)}
                        className="rounded border-neon-cyan/40 bg-black/40 text-neon-cyan focus:ring-0"
                      />
                      <span>🔒 Zero-Knowledge Proof (zk-SNARK) Verification Mode</span>
                    </label>
                    <p className="text-[11px] text-white/60 leading-relaxed pl-5">
                      Mathematically proves ownership on-chain using Groth16 cryptographic commitments without saving raw secret text on the public Ethereum ledger.
                    </p>
                  </div>

                  {}
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-[10px] text-red-400 flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <div>
                      <span className="font-bold">Fraud Alert Warning:</span> Any attempts to report false ownership proofs will result in student lockout, profile suspension, and referral to Campus Security (ADMIN001).
                    </div>
                  </div>
                </div>
              )}

              {}
              <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-6">
                <span className="text-[10px] text-white/30 uppercase tracking-wide">
                  Attempts Left: {3 - attempts}/3
                </span>
                
                <div className="flex gap-2">
                  {verifyStep === 2 && (
                    <button
                      onClick={() => setVerifyStep(1)}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-semibold hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                  )}
                  
                  <button
                    onClick={handleVerifySubmit}
                    disabled={idScanning || isLoading}
                    className="px-6 py-2 rounded-lg bg-neon-purple/20 border border-neon-purple/40 text-neon-purple hover:bg-neon-purple/30 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {verifyStep === 1 ? 'Next' : 'Submit Claim Verification'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
