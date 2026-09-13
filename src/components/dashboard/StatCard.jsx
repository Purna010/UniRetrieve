import React from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  cyan: {
    border: 'border-neon-cyan/30',
    bg: 'bg-neon-cyan/5',
    text: 'text-neon-cyan',
    icon: 'bg-neon-cyan/10 border-neon-cyan/20',
  },
  green: {
    border: 'border-neon-green/30',
    bg: 'bg-neon-green/5',
    text: 'text-neon-green',
    icon: 'bg-neon-green/10 border-neon-green/20',
  },
  purple: {
    border: 'border-neon-purple/30',
    bg: 'bg-neon-purple/5',
    text: 'text-neon-purple',
    icon: 'bg-neon-purple/10 border-neon-purple/20',
  },
  pink: {
    border: 'border-neon-pink/30',
    bg: 'bg-neon-pink/5',
    text: 'text-neon-pink',
    icon: 'bg-neon-pink/10 border-neon-pink/20',
  },
  orange: {
    border: 'border-neon-orange/30',
    bg: 'bg-neon-orange/5',
    text: 'text-neon-orange',
    icon: 'bg-neon-orange/10 border-neon-orange/20',
  },
};

export default function StatCard({ label, value, change, icon, color = 'cyan', delay = 0 }) {
  const c = colorMap[color] || colorMap.cyan;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`rounded-xl border ${c.border} ${c.bg} backdrop-blur-sm p-5
        transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-3xl font-bold ${c.text} font-mono`}>{value}</p>
          {change && (
            <p className="text-xs text-white/30 mt-1.5">{change}</p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg border ${c.icon} flex items-center justify-center text-lg`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
