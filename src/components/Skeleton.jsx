import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded-[2rem] border border-white/10 p-6 ${className}`}>
    <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-white/10 rounded w-1/2"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
        <div className="w-10 h-10 bg-white/10 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded w-3/4"></div>
          <div className="h-2 bg-white/10 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-white/10 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export const SkeletonForm = () => (
  <div className="space-y-6 p-8 bg-white/5 rounded-[2rem] border border-white/10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-16"></div>
        <div className="h-12 bg-white/10 rounded-[1.5rem]"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-16"></div>
        <div className="h-12 bg-white/10 rounded-[1.5rem]"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-white/10 rounded w-16"></div>
      <div className="h-12 bg-white/10 rounded-[1.5rem]"></div>
    </div>
    <div className="flex gap-4">
      <div className="h-14 flex-1 bg-white/10 rounded-[2rem]"></div>
      <div className="h-14 w-32 bg-white/10 rounded-[2rem]"></div>
    </div>
  </div>
);

export const SkeletonModal = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg">
    <div className="w-full max-w-2xl bg-slate-800 rounded-[3rem] p-10 border border-white/10">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-white/10 rounded w-48"></div>
        <div className="w-10 h-10 bg-white/10 rounded-full"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export default { SkeletonCard, SkeletonTable, SkeletonForm, SkeletonModal };