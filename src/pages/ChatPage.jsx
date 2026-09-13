import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import ChatWindow from '../components/chat/ChatWindow';
import { getInitials, timeAgo } from '../utils/helpers';
import { fadeInUp, slideInLeft } from '../animations/variants';

export default function ChatPage() {
  const { chatId } = useParams();
  const { conversations, currentUser, activeConversation, setActiveConversation } = useApp();

  // Filter conversations where the current user is a participant
  const filteredConvs = React.useMemo(() => {
    return conversations.filter(conv =>
      conv.participants.some(p => p.id === currentUser?.id)
    );
  }, [conversations, currentUser]);

  const activeId = activeConversation;
  const setActiveId = setActiveConversation;

  React.useEffect(() => {
    if (chatId) {
      setActiveId(chatId);
    } else if (!activeId && filteredConvs.length > 0) {
      setActiveId(filteredConvs[0]?.id);
    }
  }, [chatId, filteredConvs, activeId, setActiveId]);

  const activeConv = conversations.find(c => c.id === activeId);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <motion.div {...fadeInUp}>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm text-white/40 mt-1">Chat with finders and owners</p>
      </motion.div>

      {/* Chat layout — outer blue bordered wrapper matching wireframe */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel overflow-hidden border-neon-cyan/25 bg-neon-cyan/5 drop-shadow-xl"
        style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}
      >
        <div className="flex h-full">
          {/* Conversation list — left sidebar */}
          <motion.div
            {...slideInLeft}
            className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col"
          >
            <div className="px-4 py-3.5 border-b border-white/5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 && (
                <div className="p-6 text-center text-white/20 text-sm">No conversations yet</div>
              )}
              {filteredConvs.map(conv => {
                const other = conv.participants.find(p => p.id !== currentUser.id);
                const isActive = conv.id === activeId;
                return (
                  <button
                    key={conv.id}
                    id={`conv-${conv.id}`}
                    onClick={() => setActiveId(conv.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-white/5 transition-all
                      ${isActive ? 'bg-neon-cyan/8 border-l-2 border-l-neon-cyan' : 'hover:bg-white/3'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple/60 to-neon-cyan/60 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {getInitials(other?.name || 'U')}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#111] 
                          ${other?.status === 'online' ? 'bg-neon-green' : 'bg-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
                            {other?.name}
                          </p>
                          {conv.unread > 0 && (
                            <span className="text-xs bg-neon-cyan text-black rounded-full w-4 h-4 flex items-center justify-center font-bold flex-shrink-0">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neon-cyan/50 truncate mb-0.5">{conv.itemTitle}</p>
                        <p className="text-xs text-white/25 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-white/15 mt-0.5">{timeAgo(conv.lastMessageTime)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Chat window — inner purple bordered panel matching wireframe */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeId ? (
              <div className="flex-1 flex flex-col h-full">
                {/* Inner border decoration matching wireframe */}
                <div className="flex-1 flex flex-col m-4 glass-panel border-neon-purple/30 bg-neon-purple/5 overflow-hidden">
                  <ChatWindow conversationId={activeId} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/20">
                <div className="text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
