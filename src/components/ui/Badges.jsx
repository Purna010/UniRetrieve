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
      <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/40">
        🔍 Lost
      </span>
    );
  }
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/10 text-white border border-white/30">
      📦 Found
    </span>
  );
}

export function OnlineBadge({ status }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${status === 'online' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]' : 'bg-gray-600'}`} />
  );
}

export function AIBadge() {
  return (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
      ✦ AI Verified
    </span>
  );
}

export function BlockchainBadge({ hash }) {
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-full flex items-center gap-1 bg-white/5 text-white/80 border border-white/15">
      ⛓ {hash ? hash.slice(0, 12) + '...' : 'On-chain'}
    </span>
  );
}
