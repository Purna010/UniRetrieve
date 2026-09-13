import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastVariants } from '../../animations/variants';
import { useApp } from '../../context/AppContext';

const iconMap = {
  success: { icon: '✓', color: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10' },
  error: { icon: '✕', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
  info: { icon: 'ℹ', color: 'text-neon-cyan', border: 'border-neon-cyan/30', bg: 'bg-neon-cyan/10' },
  warning: { icon: '⚠', color: 'text-neon-orange', border: 'border-neon-orange/30', bg: 'bg-neon-orange/10' },
};

function Toast({ toast }) {
  const style = iconMap[toast.type] || iconMap.info;
  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm max-w-sm w-full
        ${style.border} ${style.bg} shadow-2xl`}
    >
      <span className={`text-lg font-bold ${style.color} mt-0.5`}>{style.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
