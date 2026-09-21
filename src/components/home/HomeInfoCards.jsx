import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    id: 1,
    category: 'AI Matching',
    question: 'How does the AI image matching algorithm work?',
    answer: 'UniRetrieve uses deep convolutional neural networks to extract visual feature embeddings from uploaded photos. It analyzes contours, textures, brand logos, colors, and dimensional ratios to cross-reference lost and found entries, recognizing items accurately even from varying angles and lighting.'
  },
  {
    id: 2,
    category: 'Student ID OCR',
    question: 'What happens if an ID card, student badge, or ATM card is found?',
    answer: 'Our integrated OCR (Optical Character Recognition) engine reads text on cards, detecting Student USN/Roll Numbers, names, and academic departments. It automatically matches against campus records and flags the owner for immediate alerts.'
  },
  {
    id: 3,
    category: 'Student Privacy',
    question: 'Is my personal phone number or email address shared publicly?',
    answer: 'Never. Contact details remain strictly private. All initial communication and coordination happen exclusively through UniRetrieve’s authenticated, encrypted in-app messaging system.'
  },
  {
    id: 4,
    category: 'Campus Handover',
    question: 'Where should found items be dropped off or claimed on campus?',
    answer: 'Finders can coordinate directly with the verified owner via chat, or deposit the item at the Campus Central Security Office (Admin Block Ground Floor). Campus security staff log official custody into the system.'
  },
  {
    id: 5,
    category: 'Verification Proof',
    question: 'How do I prove ownership of a lost item?',
    answer: 'Owners can verify by unlocking electronic devices in front of the finder/security officer, describing unique markings, stickers, or serial numbers, or presenting their matching student ID badge.'
  },
  {
    id: 6,
    category: 'Campus Access',
    question: 'Is UniRetrieve free for all campus students and faculty?',
    answer: 'Yes! UniRetrieve is 100% free and accessible to all enrolled students, faculty members, researchers, and campus staff with their institutional credentials.'
  }
];

const STEPS = [
  {
    num: '01',
    title: 'Snap & Report',
    icon: '📸',
    tag: 'Quick Upload',
    desc: 'Take a photo of the lost or found item. Tag the campus location (Library, Canteen, Mechanical Block, etc.) and add key specs.'
  },
  {
    num: '02',
    title: 'AI Scan & OCR',
    icon: '⚡',
    tag: 'Neural Matching',
    desc: 'Our neural vision model generates image embeddings while OCR automatically reads student IDs, USNs, and identifying text.'
  },
  {
    num: '03',
    title: 'Instant Match Alert',
    icon: '🎯',
    tag: 'Confidence Score',
    desc: 'When high similarity is detected between lost and found reports, both parties receive instant notification alerts.'
  },
  {
    num: '04',
    title: 'Chat & Handover',
    icon: '🤝',
    tag: 'Safe Claim',
    desc: 'Connect through private chat, verify ownership with security checks, and arrange safe handover at the campus security desk.'
  }
];

export default function HomeInfoCards() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'about', 'how', 'faq'
  const [openFaq, setOpenFaq] = useState(1);
  const [faqQuery, setFaqQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'AI Matching', 'Student ID OCR', 'Student Privacy', 'Campus Handover', 'Verification Proof', 'Campus Access'];

  const filteredFaqs = FAQS.filter(f => {
    const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchQuery = !faqQuery || 
      f.question.toLowerCase().includes(faqQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <section id="info-cards-section" className="space-y-8 w-full">
      {/* Section Header & View Selector Tabs */}
      <div className="glass-panel p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase font-mono">
              Campus Guide & Help Center
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How UniRetrieve <span className="text-amber-400">Works For You</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl">
            Everything you need to know about AI image recognition, student ID tracking, custody handovers, and FAQs.
          </p>
        </div>

        {/* Dual-Color Amber Gold Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-xl self-start md:self-center">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All Overview
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'about'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            About App
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'how'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            How To Use
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Campus FAQ
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="space-y-8 w-full">
        {/* CARD 1: ABOUT APP */}
        {(activeTab === 'all' || activeTab === 'about') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-panel border-white/10 p-6 sm:p-8 space-y-6 rounded-2xl hover:border-amber-500/40 transition-all shadow-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                  <span>✦</span> Campus Ecosystem
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  About <span className="text-amber-400">UniRetrieve</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Automated, intelligent lost & found network designed specifically for our university campus.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0 text-amber-400">
                🏛️
              </div>
            </div>

            <p className="text-sm text-white/75 leading-relaxed max-w-4xl">
              Spanning multiple academic departments, residential hostels, libraries, and laboratories, misplacing an essential item—such as a laptop, calculator, student ID badge, or notebook—causes severe academic stress. <strong className="text-amber-400 font-medium">UniRetrieve</strong> replaces outdated paper notices with an automated recovery ecosystem powered by deep computer vision, optical character recognition, and secure student-to-student verification.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-colors space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <span>🤖</span>
                  <span>Deep Vision AI</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Extracts multi-dimensional visual embeddings to compare colors, contours, and brand logos.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-colors space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <span>📝</span>
                  <span>Student ID OCR</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Optical character extraction instantly reads student USN, roll numbers, and names on lost cards.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-colors space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <span>⛓</span>
                  <span>Blockchain Ledger</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Tamper-proof smart contract entries log custody transitions for high-value campus belongings.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-colors space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <span>💬</span>
                  <span>Encrypted Chat</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Private student-to-student in-app messaging without exposing personal phone numbers or emails.
                </p>
              </div>
            </div>

            {/* Live Campus Performance Metrics */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-center">
                <p className="text-lg sm:text-xl font-black text-amber-400 font-mono">&lt; 2.5s</p>
                <p className="text-[11px] text-white/50 mt-0.5">Match Latency</p>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-center">
                <p className="text-lg sm:text-xl font-black text-white font-mono">98.4%</p>
                <p className="text-[11px] text-white/50 mt-0.5">OCR Detection</p>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-center">
                <p className="text-lg sm:text-xl font-black text-amber-400 font-mono">100%</p>
                <p className="text-[11px] text-white/50 mt-0.5">Privacy Guard</p>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-center">
                <p className="text-lg sm:text-xl font-black text-white font-mono">0 Spam</p>
                <p className="text-[11px] text-white/50 mt-0.5">Verified Campus</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* CARD 2: HOW TO USE */}
        {(activeTab === 'all' || activeTab === 'how') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="glass-panel border-white/10 p-6 sm:p-8 space-y-6 rounded-2xl hover:border-amber-500/40 transition-all shadow-lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                  <span>⚡</span> 4-Step Process
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  How To <span className="text-amber-400">Use UniRetrieve</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  A straightforward, secure workflow to recover lost belongings or report found items on campus.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0 text-amber-400">
                🚀
              </div>
            </div>

            {/* 4 Step Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-white/8 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        STEP {step.num}
                      </span>
                      <span className="text-xl">{step.icon}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5">
                      {step.title}
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                    <span>{step.tag}</span>
                    <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/60">
                Found or misplaced something on campus right now? Log it to notify the campus community immediately.
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/report"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-amber-500 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] text-center"
                >
                  Report Item Now
                </Link>
                <Link
                  to="/items"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-white glass-card border-white/15 hover:border-amber-400 hover:text-amber-400 text-center transition-all"
                >
                  Browse Reports
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* CARD 3: CAMPUS FAQ */}
        {(activeTab === 'all' || activeTab === 'faq') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="glass-panel border-white/10 p-6 sm:p-8 space-y-6 rounded-2xl hover:border-amber-500/40 transition-all shadow-lg"
          >
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                  <span>❓</span> Frequently Asked Questions
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Campus <span className="text-amber-400">FAQ</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Answers to the most common questions regarding item claims, privacy, AI recognition, and verification.
                </p>
              </div>

              {/* FAQ Search Bar */}
              <div className="relative w-full md:w-80">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={faqQuery}
                  onChange={(e) => setFaqQuery(e.target.value)}
                  placeholder="Search FAQ questions..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
                {faqQuery && (
                  <button
                    onClick={() => setFaqQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 items-center pt-1 border-t border-white/5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    selectedCategory === cat
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                      : 'border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ Accordion Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.length === 0 ? (
                <div className="md:col-span-2 text-center py-10 text-white/40 text-xs glass-card border-white/5 p-6 rounded-xl">
                  No matching questions found for "{faqQuery}". Try another keyword or reset the category filter.
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isOpen
                          ? 'bg-white/6 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                          : 'bg-white/3 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block mb-1">
                            {faq.category}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-white leading-snug">
                            {faq.question}
                          </span>
                        </div>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white/50 border border-white/10 transition-transform flex-shrink-0 mt-0.5 ${isOpen ? 'rotate-180 text-amber-400 border-amber-500/40' : ''}`}>
                          ▼
                        </span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-white/70 leading-relaxed border-t border-white/5">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Support Footer */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
              <div className="flex items-center gap-2">
                <span>🛡️</span>
                <span>Need physical custody check or emergency assistance?</span>
              </div>
              <span className="text-amber-400 font-semibold">
                Campus Security Office (Ground Floor, Admin Block)
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
