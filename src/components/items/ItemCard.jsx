import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TypeBadge, StatusBadge, CategoryBadge, BlockchainBadge } from '../ui/Badges';
import { truncate, formatDate, timeAgo } from '../../utils/helpers';

function ItemImageBox({ item }) {
  return (
    <div className="h-40 rounded-lg glass-panel flex items-center justify-center relative overflow-hidden group">
      {item.images && item.images.length > 0 ? (
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-white/20">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">No image</span>
        </div>
      )}
      {/* Type badge overlay */}
      <div className="absolute top-2 left-2">
        <TypeBadge type={item.type} />
      </div>
    </div>
  );
}

export default function ItemCard({ item, showMatch = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.matchId && item.status === 'matched') {
      navigate(`/match/${item.matchId}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`glass-card p-4 hover:border-white/20 
        ${item.matchId ? 'cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}`}
      onClick={handleClick}
    >
      <ItemImageBox item={item} />

      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>

        <CategoryBadge category={item.category} />

        {item.ocrText && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mt-1">
            <span>📝</span>
            <span className="truncate" title={item.ocrText}>Detected: "{truncate(item.ocrText, 32)}"</span>
          </div>
        )}

        <p className="text-xs text-white/40 leading-relaxed">
          {truncate(item.description, 90)}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{item.location?.label || item.location?.address || 'Location unspecified'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{timeAgo(item.createdAt)}</span>
        </div>

        {item.blockchainHash && (
          <div className="pt-1">
            <BlockchainBadge hash={item.blockchainHash} />
          </div>
        )}

        {item.status === 'matched' && item.matchId && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/match/${item.matchId}`); }}
            className="w-full mt-2 py-2 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 
              border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all"
          >
            ✦ View Match Details
          </button>
        )}
      </div>
    </motion.div>
  );
}
