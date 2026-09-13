import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale } from '../../animations/variants';
import clsx from 'clsx';

const colorMap = {
  cyan: {
    bg: 'bg-neon-cyan/10 hover:bg-neon-cyan/20',
    border: 'border-neon-cyan/40 hover:border-neon-cyan/70',
    text: 'text-neon-cyan',
    glow: 'hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]',
    solid: 'bg-neon-cyan text-black hover:bg-neon-cyan/90',
  },
  blue: {
    bg: 'bg-neon-blue/10 hover:bg-neon-blue/20',
    border: 'border-neon-blue/40 hover:border-neon-blue/70',
    text: 'text-neon-blue',
    glow: 'hover:shadow-[0_0_20px_rgba(0,128,255,0.3)]',
    solid: 'bg-neon-blue text-white hover:bg-neon-blue/90',
  },
  purple: {
    bg: 'bg-neon-purple/10 hover:bg-neon-purple/20',
    border: 'border-neon-purple/40 hover:border-neon-purple/70',
    text: 'text-neon-purple',
    glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    solid: 'bg-neon-purple text-white hover:bg-neon-purple/90',
  },
  pink: {
    bg: 'bg-neon-pink/10 hover:bg-neon-pink/20',
    border: 'border-neon-pink/40 hover:border-neon-pink/70',
    text: 'text-neon-pink',
    glow: 'hover:shadow-[0_0_20px_rgba(255,0,110,0.3)]',
    solid: 'bg-neon-pink text-white hover:bg-neon-pink/90',
  },
  green: {
    bg: 'bg-neon-green/10 hover:bg-neon-green/20',
    border: 'border-neon-green/40 hover:border-neon-green/70',
    text: 'text-neon-green',
    glow: 'hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]',
    solid: 'bg-neon-green text-black hover:bg-neon-green/90',
  },
  orange: {
    bg: 'bg-neon-orange/10 hover:bg-neon-orange/20',
    border: 'border-neon-orange/40 hover:border-neon-orange/70',
    text: 'text-neon-orange',
    glow: 'hover:shadow-[0_0_20px_rgba(255,136,0,0.3)]',
    solid: 'bg-neon-orange text-black hover:bg-neon-orange/90',
  },
  white: {
    bg: 'bg-white/5 hover:bg-white/10',
    border: 'border-white/20 hover:border-white/40',
    text: 'text-white',
    glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
    solid: 'bg-white text-black hover:bg-white/90',
  },
};

export default function NeonButton({
  children,
  onClick,
  color = 'cyan',
  variant = 'outline',  // 'outline' | 'solid' | 'ghost'
  size = 'md',          // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  type = 'button',
  icon = null,
  fullWidth = false,
  loading = false,
}) {
  const c = colorMap[color] || colorMap.cyan;

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variants = {
    outline: clsx(c.bg, c.border, c.text, c.glow, 'border'),
    solid: clsx(c.solid, 'border-transparent', c.glow),
    ghost: clsx('bg-transparent', c.text, 'hover:' + c.bg.split(' ')[0], 'border-transparent'),
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      {...hoverScale}
      className={clsx(
        'relative font-semibold rounded-lg transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon}
        {children}
      </span>
    </motion.button>
  );
}
