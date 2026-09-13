import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import ItemCard from '../components/items/ItemCard';
import { SkeletonCard } from '../components/ui/Skeletons';
import { mockCategories } from '../data/mockItems';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';

const FILTERS = ['All', 'Lost', 'Found', 'Matched', 'Claimed'];

export default function HomePage() {
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
    <div className="space-y-8">
      {/* Hero */}
      <motion.section {...fadeInUp} className="relative overflow-hidden rounded-2xl glass-panel p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan drop-shadow-md backdrop-blur-md">
              ✦ AI-Powered Matching
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neon-purple/20 border border-neon-purple/30 text-neon-purple drop-shadow-md backdrop-blur-md">
              ⛓ Blockchain Secured
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg tracking-tight">
            Lost Something? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple drop-shadow-sm">We'll Find It.</span>
          </h1>
          <p className="text-white/70 text-base lg:text-lg max-w-xl leading-relaxed drop-shadow-sm font-medium">
            UniRetrieve uses AI image matching and geospatial analysis to reunite lost items with their owners across campus.
          </p>
        </div>
      </motion.section>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="space-y-4"
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
            placeholder="Search items by name, description..."
            className="glass-input pl-11"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-white/30 mr-1">Type:</span>
          {FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                typeFilter === f
                  ? 'glass-card border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10'
                  : 'glass-card border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-white/30 mr-1">Category:</span>
          {mockCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                categoryFilter === cat
                  ? 'glass-card border-neon-purple/50 text-neon-purple bg-neon-purple/10'
                  : 'glass-card border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          Showing <span className="text-white font-semibold">{filtered.length}</span> items
        </p>
        <p className="text-xs text-white/25">Updated live</p>
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
          className="text-center py-20 text-white/20"
        >
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
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
