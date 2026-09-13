import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const colorBorderMap = {
  cyan: 'border-neon-cyan/40',
  blue: 'border-neon-blue/40',
  purple: 'border-neon-purple/40',
  pink: 'border-neon-pink/40',
  green: 'border-neon-green/40',
  orange: 'border-neon-orange/40',
  yellow: 'border-yellow-400/40',
  red: 'border-red-500/40',
  white: 'border-white/10',
  none: 'border-white/5',
};

const glowMap = {
  cyan: 'hover:shadow-[0_0_25px_rgba(0,245,255,0.12)]',
  blue: 'hover:shadow-[0_0_25px_rgba(0,128,255,0.12)]',
  purple: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.12)]',
  pink: 'hover:shadow-[0_0_25px_rgba(255,0,110,0.12)]',
  green: 'hover:shadow-[0_0_25px_rgba(0,255,136,0.12)]',
  orange: 'hover:shadow-[0_0_25px_rgba(255,136,0,0.12)]',
  yellow: 'hover:shadow-[0_0_25px_rgba(255,220,0,0.12)]',
  red: 'hover:shadow-[0_0_25px_rgba(255,60,60,0.12)]',
  white: 'hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]',
  none: '',
};

export default function GlassCard({
  children,
  color = 'none',
  className = '',
  hover = true,
  animate = true,
  padding = true,
  onClick,
}) {
  const base = clsx(
    'rounded-xl border backdrop-blur-sm transition-all duration-300',
    'bg-[rgba(255,255,255,0.025)]',
    colorBorderMap[color] || colorBorderMap.none,
    hover && glowMap[color],
    hover && onClick && 'cursor-pointer',
    padding && 'p-5',
    className,
  );

  if (!animate) {
    return <div className={base} onClick={onClick}>{children}</div>;
  }

  return (
    <motion.div
      className={base}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
