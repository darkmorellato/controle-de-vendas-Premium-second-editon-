import React from 'react';

export const LoadingOverlay = ({ isLoading, message = 'Carregando...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg">
      <div className="classic-frame p-10 rounded-[3rem] text-center">
        <div className="w-16 h-16 mx-auto mb-6 border-4 border-odoo-500/30 border-t-odoo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">{message}</p>
      </div>
    </div>
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 border-4 border-odoo-500/30 border-t-odoo-500 rounded-full animate-spin"></div>
      <p className="text-slate-400">Carregando...</p>
    </div>
  </div>
);

export const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
        <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="h-8 bg-white/10 rounded w-20 animate-pulse"></div>
      </div>
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`classic-frame p-6 rounded-[2rem] animate-pulse ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-white/10 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-1/3"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-white/10 rounded w-full"></div>
      <div className="h-3 bg-white/10 rounded w-3/4"></div>
    </div>
  </div>
);

export const InlineLoader = ({ size = 'sm' }) => {
  const sizes = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
  };

  return (
    <div className={`${sizes[size]} border-odoo-500/30 border-t-odoo-500 rounded-full animate-spin inline-block`}></div>
  );
};

export const DataTableSkeleton = () => (
  <div className="space-y-2">
    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`h-4 bg-white/10 rounded animate-pulse ${i === 1 ? 'w-1/4' : i === 5 ? 'w-20' : 'flex-1'}`}></div>
      ))}
    </div>
    {[1, 2, 3, 4, 5].map(row => (
      <div key={row} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
        {[1, 2, 3, 4, 5].map(col => (
          <div key={col} className={`h-4 bg-white/10 rounded animate-pulse ${col === 1 ? 'w-1/4' : col === 5 ? 'w-20' : 'flex-1'}`}></div>
        ))}
      </div>
    ))}
  </div>
);

export default {
  LoadingOverlay,
  PageLoader,
  SkeletonList,
  SkeletonCard,
  InlineLoader,
  DataTableSkeleton,
};