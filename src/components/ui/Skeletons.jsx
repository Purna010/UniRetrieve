import React from 'react';

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 rounded-xl border border-white/5">
      <div className="skeleton h-40 rounded-lg mb-4" />
      <div className="skeleton h-4 rounded w-3/4 mb-2" />
      <div className="skeleton h-3 rounded w-1/2 mb-3" />
      <div className="flex gap-2">
        <div className="skeleton h-6 rounded-full w-16" />
        <div className="skeleton h-6 rounded-full w-20" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = 'full', height = 4 }) {
  return (
    <div className={`skeleton rounded w-${width} h-${height}`} />
  );
}

export function SkeletonText({ lines = 3 }) {
  const widths = ['full', '5/6', '4/5', '3/4', '2/3'];
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton rounded h-3`}
          style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 10 }) {
  return <div className={`skeleton rounded-full w-${size} h-${size}`} />;
}

export function SkeletonStatCard() {
  return (
    <div className="glass-card p-5 rounded-xl border border-white/5">
      <div className="skeleton h-3 rounded w-24 mb-3" />
      <div className="skeleton h-8 rounded w-16 mb-2" />
      <div className="skeleton h-3 rounded w-20" />
    </div>
  );
}
