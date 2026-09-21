import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getInitials, timeAgo } from '../../utils/helpers';
import { fadeInDown } from '../../animations/variants';
import SystemStatusBadge from '../common/SystemStatusBadge';

const navLinks = [
  { to: '/', label: 'Home', icon: '◈' },
  { to: '/items', label: 'All Items', icon: '🔍' },
  { to: '/report', label: 'Report Item', icon: '＋' },
  { to: '/my-items', label: 'My Items', icon: '◉' },
  { to: '/chat', label: 'Messages', icon: '✉' },
  { to: '/admin', label: 'Admin', icon: '⚙' },
];

export default function Navbar() {
  const { currentUser, notifications, unreadCount, markAllRead, markRead, logout } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setNotifOpen(false);
    navigate(notif.link);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Dual Color Gradient bar top */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-white to-amber-500 relative z-50 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />

      <nav className="glass-panel rounded-none border-t-0 border-x-0 border-b border-white/10 z-40 relative backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center group-hover:border-amber-400 transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <span className="text-amber-400 font-bold text-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>U</span>
                <div className="absolute inset-0 rounded-xl bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="font-bold text-white text-lg tracking-tight">Uni</span>
                <span className="font-bold text-amber-400 text-lg tracking-tight text-glow-amber">Retrieve</span>
              </div>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                // Hide admin link if NOT admin
                if (link.to === '/admin' && currentUser.role !== 'admin') {
                  return null;
                }
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <span className="text-xs opacity-70">{link.icon}</span>
                    {link.label}
                  </NavLink>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <SystemStatusBadge />
              {/* Notifications */}
              <div className="relative">
                <button
                  id="notif-btn"
                  onClick={() => setNotifOpen(prev => !prev)}
                  className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black rounded-full text-xs flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      {...fadeInDown}
                      className="absolute right-0 top-12 w-80 glass-panel shadow-2xl overflow-hidden z-50 border border-white/10"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <span className="text-sm font-semibold text-white">Notifications</span>
                        <button onClick={markAllRead} className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium">
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors
                              ${!n.read ? 'bg-neon-cyan/3' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-neon-cyan' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold mb-0.5 ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                                <p className="text-xs text-white/40 leading-relaxed truncate">{n.message}</p>
                                <p className="text-xs text-white/25 mt-1">{timeAgo(n.time)}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar and Logout */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-xs font-bold text-white">
                  {getInitials(currentUser.name)}
                </div>
                <span className="hidden sm:block text-sm text-white/70 font-medium">{currentUser.name.split(' ')[0]}</span>
                <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
                <button
                  onClick={logout}
                  className="hidden sm:flex text-xs text-white/40 hover:text-red-400 transition-colors items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(prev => !prev)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(link => {
                  if (link.to === '/admin' && currentUser.role !== 'admin') return null;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${isActive ? 'text-neon-cyan bg-neon-cyan/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`
                      }
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </NavLink>
                  );
                })}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all mt-2 border-t border-white/5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
