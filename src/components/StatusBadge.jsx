import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  passed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/15 text-red-400 border-red-500/20',
  open: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  delivered: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  released: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  disputed: 'bg-red-500/15 text-red-400 border-red-500/20',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status?.toLowerCase()] || 'bg-muted text-muted-foreground border-border';
  return (
    <Badge variant="outline" className={`${style} text-xs font-medium capitalize`}>
      {status || 'unknown'}
    </Badge>
  );
}