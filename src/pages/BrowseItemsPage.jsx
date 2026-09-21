import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ItemCard from '../components/items/ItemCard';
import { SkeletonCard } from '../components/ui/Skeletons';
import { mockCategories } from '../data/mockItems';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';

const FILTERS = ['All', 'Lost', 'Found', 'Matched', 'Claimed'];

export default function BrowseItemsPage() {
  const { items } = useApp();
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    return items?.filter(item => {
      const matchType = typeFilter === 'All' || item?.type === typeFilter.toLowerCase() || item?.status === typeFilter.toLowerCase();
      const matchCat = categoryFilter === 'All' || item?.category === categoryFilter;
      const matchSearch = !search || (item?.title || '').toLowerCase().includes(search.toLowerCase())
        || (item?.description || '').toLowerCase().includes(search.toLowerCase());
      return matchType && matchCat && matchSearch;
    }) || [];
  }, [items, typeFilter, categoryFilter, search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <motion.div {...fadeInUp} className="glass-panel p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase font-mono">
              Live Campus Repository
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            All Campus <span className="text-amber-400">Reports</span>
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Browse, search, and filter all items reported lost and found across university blocks and departments.
          </p>
        </div>

        <Link
          to="/report"
          className="px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-amber-500 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] self-start md:self-center flex items-center gap-2"
        >
          <span>＋</span>
          <span>Report Item</span>
        </Link>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="glass-panel p-5 space-y-4 border border-white/10"
      >
        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="item-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports by keyword, item title, or location..."
            className="glass-input pl-11 text-sm text-white placeholder-white/40 focus:border-amber-500/60"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-white/40 mr-1 font-medium">Status:</span>
          {FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setTypeFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                typeFilter === f
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 items-center pt-1 border-t border-white/5">
          <span className="text-xs text-white/40 mr-1 font-medium">Category:</span>
          {mockCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
                categoryFilter === cat
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-white/50">
          Showing <span className="text-amber-400 font-bold font-mono">{filtered.length}</span> active reports
        </p>
        <span className="text-[11px] text-white/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Realtime updates active
        </span>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel text-center py-20 text-white/30 border border-white/10 rounded-2xl"
        >
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-base font-semibold text-white/70">No matching reports found</p>
          <p className="text-xs mt-1 text-white/40">Try adjusting your filters or search keywords.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filtered.map(item => (
            <motion.div key={item.id} variants={staggerItem}>
              <ItemCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
