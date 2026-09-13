import React from 'react';
import { getStatusClass, getStatusLabel } from '../../utils/helpers';

export function StatusBadge({ status }) {
  return (
    <span className={getStatusClass(status)}>
      {getStatusLabel(status)}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border bg-white/5 border-white/10 text-white/60 font-medium">
      {category}
    </span>
  );
}

export function TypeBadge({ type }) {
  if (type === 'lost') {
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
        style={{ background: 'rgba(255,60,60,0.15)', color: '#ff6b6b', border: '1px solid rgba(255,60,60,0.3)' }}>
        🔍 Lost
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
      style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>
      📦 Found
    </span>
  );
}

export function OnlineBadge({ status }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${status === 'online' ? 'bg-neon-green animate-pulse' : 'bg-gray-600'}`} />
  );
}

export function AIBadge() {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
      ✦ AI Verified
    </span>
  );
}

export function BlockchainBadge({ hash }) {
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
      style={{ background: 'rgba(0,245,255,0.08)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.2)' }}>
      ⛓ {hash ? hash.slice(0, 12) + '...' : 'On-chain'}
    </span>
  );
}
