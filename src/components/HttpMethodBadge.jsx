import React from 'react';
import { usePersona } from '@/lib/PersonaContext';

const methodColors = {
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function HttpMethodBadge({ method, endpoint, elapsed }) {
  const { persona } = usePersona();
  if (persona !== 'developer') return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`px-1.5 py-0.5 rounded border font-mono font-bold ${methodColors[method] || ''}`}>
        {method}
      </span>
      {endpoint && (
        <span className="text-muted-foreground font-mono truncate max-w-[200px]">{endpoint}</span>
      )}
      {elapsed != null && (
        <span className="text-muted-foreground ml-auto">{elapsed}ms</span>
      )}
    </div>
  );
}