import React from 'react';

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-border-subtle">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-border"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-sidebar-border rounded"></div>
            <div className="h-3 w-24 bg-sidebar-border rounded"></div>
          </div>
        </div>
      </td>
      <td className="p-4 hidden md:table-cell">
        <div className="h-4 w-40 bg-sidebar-border rounded"></div>
      </td>
      <td className="p-4 hidden lg:table-cell">
        <div className="h-4 w-24 bg-sidebar-border rounded"></div>
      </td>
      <td className="p-4">
        <div className="h-8 w-24 bg-sidebar-border rounded-lg"></div>
      </td>
      <td className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-sidebar-border rounded-lg"></div>
          <div className="h-8 w-8 bg-sidebar-border rounded-lg"></div>
        </div>
      </td>
    </tr>
  );
}
