import React from 'react';
import { cn } from '@/lib/utils';
import { PlotStatus, PlotPlcType } from '@workspace/api-client-react';

export function StatusBadge({ status }: { status: PlotStatus }) {
  const statusStyles = {
    [PlotStatus.Available]: 'bg-green-100 text-green-800 border-green-200',
    [PlotStatus.Allotted]: 'bg-blue-100 text-blue-800 border-blue-200',
    [PlotStatus.Freeze]: 'bg-orange-100 text-orange-800 border-orange-200',
    [PlotStatus.Hold]: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', statusStyles[status])}>
      {status}
    </span>
  );
}

export function PlcBadge({ type }: { type: PlotPlcType }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', 
      type === PlotPlcType.PLC ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-700 border-gray-200'
    )}>
      {type === PlotPlcType.PLC ? 'PLC' : 'Non-PLC'}
    </span>
  );
}
