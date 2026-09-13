import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatTime, getInitials } from '../../utils/helpers';
import { staggerItem } from '../../animations/variants';

function MessageBubble({ msg, isOwn }) {
  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-purple/50 to-neon-cyan/50 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-0.5">
        {getInitials(msg.senderName)}
      </div>

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isOwn && (
          <span className="text-xs text-white/30 px-1">{msg.senderName}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed backdrop-blur-md shadow-md ${
            isOwn
              ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/20 text-white rounded-tr-sm'
              : 'glass-card bg-white/5 border border-white/10 text-white/80 rounded-tl-sm'
          }`}
        >
          {msg.text}
        </div>
        <span className="text-xs text-white/20 px-1">{formatTime(msg.time)}</span>
      </div>
    </motion.div>
  );
}

export default function ChatWindow({ conversationId }) {
  const { messages, currentUser, sendMessage, conversations, socket, triggerSupportAI, matches, items, resolveClaim } = useApp();
  const [inputText, setInputText] = React.useState('');
  const [showIssues, setShowIssues] = React.useState(false);
  const [showReviewOverlay, setShowReviewOverlay] = React.useState(false);
  const [revealCardProof, setRevealCardProof] = React.useState(false);
  const bottomRef = useRef(null);

  const msgs = messages[conversationId] || [];
  const conv = conversations.find(c => c.id === conversationId);
  const otherParticipant = conv?.participants.find(p => p.id !== currentUser.id);

  useEffect(() => {
    if (conversationId && socket) {
      socket.emit('join_room', conversationId);
      return () => {
        socket.emit('leave_room', conversationId);
      };
    }
  }, [conversationId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(conversationId, inputText.trim());
    setInputText('');
  };

  const handleIssue = (type, label) => {
    sendMessage(conversationId, `[System Report]: ${label}`);
    triggerSupportAI(conversationId, type);
    setShowIssues(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conv) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
        Select a conversation
      </div>
    );
  }

  const isSystemChat = otherParticipant?.id === 'system_ai';

  // Find match verification details
  const associatedMatch = matches?.find(m => m.id === conv.matchId || `conv_${m.id}` === conv.id);
  const foundItem = items?.find(i => i.id === associatedMatch?.foundItemId);
  const isFinder = foundItem?.reportedBy?.id === currentUser.id;
  const hasClaimPending = associatedMatch?.status === 'pending_claim' && associatedMatch?.claimRequestSent && associatedMatch?.verification;

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md z-10 relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-sm font-bold text-white">
          {getInitials(otherParticipant?.name || 'U')}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{otherParticipant?.name}</p>
          <p className="text-xs text-white/30">
            {isSystemChat ? '🤖 System Assistant' : (otherParticipant?.role === 'finder' ? '🔍 Finder' : '👤 Owner')} · 
            <span className={`ml-1 ${otherParticipant?.status === 'online' ? 'text-neon-green' : 'text-white/25'}`}>
              {otherParticipant?.status === 'online' ? '● Online' : '○ Offline'}
            </span>
          </p>
        </div>
        
        {!isSystemChat && (
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white/30 mb-0.5">Re:</p>
              <p className="text-xs font-medium text-neon-cyan/70">{conv.itemTitle}</p>
            </div>
            
            <div className="relative">
              <button
                id="report-issue-btn"
                onClick={() => setShowIssues(!showIssues)}
                className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider
                  ${showIssues ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}`}
              >
                ⚠️ <span className="hidden md:inline">Report Issue</span>
              </button>
              
              <AnimatePresence>
                {showIssues && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 glass-panel border-white/10 bg-[#111] shadow-2xl p-2 z-[100]"
                  >
                    <p className="text-[10px] font-bold text-white/30 px-3 py-2 uppercase tracking-tighter">What is the issue?</p>
                    {[
                      { id: 'delay', label: 'Already a day / No response', icon: '⏳' },
                      { id: 'damaged', label: 'Item is damaged', icon: '❌' },
                      { id: 'wrong_item', label: 'Received wrong item', icon: '🔄' },
                      { id: 'abuse', label: 'Abusive behavior', icon: '🚫' },
                    ].map(issue => (
                      <button
                        key={issue.id}
                        onClick={() => handleIssue(issue.id, issue.label)}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all flex items-center gap-3"
                      >
                        <span className="text-sm">{issue.icon}</span>
                        {issue.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Review Verification Banner */}
      {hasClaimPending && isFinder && (
        <div className="px-5 py-3 bg-neon-purple/10 border-b border-neon-purple/20 flex flex-wrap items-center justify-between gap-3 relative overflow-hidden z-10">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-purple" />
          <div className="flex items-center gap-2">
            <span className="text-xs">🪪</span>
            <p className="text-[11px] font-medium text-white/90">
              Claimant has submitted identity and ownership verification responses.
            </p>
          </div>
          <button
            onClick={() => {
              setRevealCardProof(false);
              setShowReviewOverlay(true);
            }}
            className="px-3 py-1 rounded bg-neon-purple/20 border border-neon-purple/40 text-neon-purple text-[10px] font-bold uppercase hover:bg-neon-purple/30 transition-all"
          >
            Review Details
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <AnimatePresence>
          {msgs.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.senderId === currentUser.id}
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="px-5 py-4 border-t border-white/5 bg-white/5 backdrop-blur-md z-10 relative">
        {/* Quick Assistance Buttons for AI Chat */}
        {isSystemChat && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: 'Check My Report Status', icon: '📊' },
              { label: 'How UniRetrieve Works', icon: '💡' },
              { label: 'Talk to Security', icon: '👮' },
              { label: 'Report a System Bug', icon: '🐛' },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(conversationId, btn.label)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 hover:text-white hover:bg-neon-cyan/20 hover:border-neon-cyan/30 transition-all flex items-center gap-2"
              >
                <span>{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="text"
            id="chat-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message..."
            className="glass-input py-2.5 text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan 
              hover:bg-neon-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Review Details Overlay Modal */}
      <AnimatePresence>
        {showReviewOverlay && associatedMatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel border-neon-purple/40 bg-[#111] w-full max-w-md p-5 relative overflow-hidden text-left"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                <h4 className="text-white font-bold flex items-center gap-1.5 text-sm">
                  <span>🪪</span> Review Verification Details
                </h4>
                <button
                  onClick={() => setShowReviewOverlay(false)}
                  className="w-7 h-7 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-red-500/20 transition-all text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Claimant Student ID</span>
                  <p className="text-xs font-semibold text-neon-cyan font-mono mt-0.5">
                    {associatedMatch.verification.studentId}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Ownership Challenge Answers</span>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/3 text-xs leading-relaxed text-white/85 mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap font-sans">
                    {associatedMatch.verification.uniqueMarks}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">ID Card Document Proof</span>
                  <div className="relative h-44 rounded-lg overflow-hidden border border-white/10 glass-panel bg-white/5">
                    <img 
                      src={associatedMatch.verification.proofImage} 
                      alt="Student ID Card Proof" 
                      className={`w-full h-full object-cover transition-all duration-300 ${!revealCardProof ? 'blur-md brightness-50' : ''}`} 
                    />
                    
                    {!revealCardProof && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                        <button
                          type="button"
                          onClick={() => setRevealCardProof(true)}
                          className="px-4 py-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold text-[10px] uppercase hover:bg-neon-cyan/30 transition-all"
                        >
                          👁 Reveal Sensitive Card Proof
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-white/25 italic">For privacy, the student ID card is masked until explicitly revealed.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-6">
                <button
                  onClick={() => {
                    resolveClaim(associatedMatch.id, false);
                    setShowReviewOverlay(false);
                  }}
                  className="px-5 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all"
                >
                  Reject Claim
                </button>
                <button
                  onClick={() => {
                    resolveClaim(associatedMatch.id, true);
                    setShowReviewOverlay(false);
                  }}
                  className="px-5 py-2 rounded-lg bg-neon-green/20 border border-neon-green/40 text-neon-green hover:bg-neon-green/30 text-xs font-bold transition-all"
                >
                  Approve Claim
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
