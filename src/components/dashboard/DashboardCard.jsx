import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import SkeletonCard from '../SkeletonCard';
import HttpMethodBadge from '../HttpMethodBadge';
import JsonToggle from '../JsonToggle';

export default function DashboardCard({
  title,
  icon: Icon,
  emoji,
  children,
  loading,
  onRefresh,
  onClick,
  method,
  endpoint,
  elapsed,
  data,
  persona,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 20px 60px -12px hsl(var(--primary) / 0.15)' }}
      onClick={onClick}
      className="relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {persona === 'personal' && emoji && <span className="text-lg">{emoji}</span>}
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <HttpMethodBadge method={method} endpoint={endpoint} elapsed={elapsed} />

        {loading ? <SkeletonCard /> : (
          <div className="mt-3 space-y-3">
            {children}
          </div>
        )}

        <JsonToggle data={data} />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </motion.div>
  );
}