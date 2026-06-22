import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-3 flex gap-4 animate-pulse">
      <div className="w-20 h-20 bg-sidebar-border rounded-lg shrink-0"></div>
      <div className="flex-1 space-y-2 py-1">
        <div className="w-3/4 h-4 bg-sidebar-border rounded"></div>
        <div className="w-1/2 h-3 bg-sidebar-border rounded"></div>
        <div className="w-1/3 h-4 bg-sidebar-border rounded mt-2"></div>
      </div>
      <div className="flex flex-col items-end justify-between py-1">
        <div className="w-8 h-4 bg-sidebar-border rounded-full"></div>
        <div className="w-6 h-6 bg-sidebar-border rounded"></div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border-subtle p-4 animate-pulse mb-3">
      <div className="flex justify-between items-center mb-3">
        <div className="w-24 h-4 bg-sidebar-border rounded"></div>
        <div className="w-16 h-3 bg-sidebar-border rounded"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-full h-3 bg-sidebar-border rounded"></div>
        <div className="w-5/6 h-3 bg-sidebar-border rounded"></div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-subtle">
        <div className="w-20 h-4 bg-sidebar-border rounded"></div>
        <div className="w-24 h-8 bg-sidebar-border rounded-lg"></div>
      </div>
    </div>
  );
}
