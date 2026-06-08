import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export default function SolTicker({ quote, quoteHistory }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const price = parseFloat(
    quote?.sol_price_usd_live ?? quote?.sol_price_usd ?? quote?.price_usd ?? quote?.price ?? 0
  );
  const solAmount = price > 0 ? (0.005 / price).toFixed(6) : '—';

  const prev = quoteHistory.length >= 2 ? quoteHistory[quoteHistory.length - 2]?.price : null;
  const up = prev != null ? price >= prev : null;

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayPrice = price > 0 ? `$${price.toFixed(2)}` : '—';

  return (
    <div ref={ref} className="relative">
      <button
        id="fee-badge"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <motion.span
          key={displayPrice}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {displayPrice} SOL
        </motion.span>
        {up !== null && (
          up
            ? <TrendingUp className="w-3 h-3 text-emerald-400" />
            : <TrendingDown className="w-3 h-3 text-red-400" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 w-64 bg-card border border-border rounded-xl shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">SOL / USD</span>
                <span className="text-xs text-muted-foreground">
                via {quote?.price_source === 'coinGecko' ? 'CoinGecko'
                  : quote?.price_source === 'binance' ? 'Binance'
                  : quote?.price_source === 'dexScreener' ? 'DexScreener'
                  : quote?.price_source === 'cache' ? 'cache'
                  : 'live feed'}
              </span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live price */}
            <div className="flex items-end gap-2 mb-1">
              <motion.span
                key={displayPrice}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-bold"
              >
                {displayPrice}
              </motion.span>
              {up !== null && (
                up
                  ? <span className="flex items-center gap-0.5 text-emerald-400 text-xs mb-1"><TrendingUp className="w-3 h-3" /> Up</span>
                  : <span className="flex items-center gap-0.5 text-red-400 text-xs mb-1"><TrendingDown className="w-3 h-3" /> Down</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3">$0.005 = {solAmount} SOL</p>

            {/* Sparkline */}
            {quoteHistory.length > 1 && (
              <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quoteHistory}>
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }}
                      labelFormatter={() => ''}
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, 'SOL']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {quoteHistory.length <= 1 && (
              <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">
                Gathering price data...
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">Updates every 5 seconds</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}