import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-card border border-border-subtle animate-pulse flex flex-col gap-3 min-w-[160px] max-w-[200px] h-[240px]">
      <div className="w-full h-32 bg-sidebar-border rounded-xl"></div>
      <div className="flex flex-col flex-1 justify-between">
        <div className="w-3/4 h-4 bg-sidebar-border rounded"></div>
        <div className="flex justify-between items-center">
          <div className="w-1/2 h-4 bg-sidebar-border rounded"></div>
          <div className="w-7 h-7 bg-sidebar-border rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function StoreSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-border-subtle animate-pulse flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-sidebar-border rounded-xl"></div>
        <div className="space-y-2">
          <div className="w-32 h-4 bg-sidebar-border rounded"></div>
          <div className="w-24 h-3 bg-sidebar-border rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex overflow-x-auto hide-scrollbar px-6 gap-3 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="min-w-[80px] h-10 bg-sidebar-border rounded-xl animate-pulse flex-shrink-0"></div>
      ))}
    </div>
  );
}
