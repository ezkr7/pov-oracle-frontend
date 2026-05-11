import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import JsonToggle from './JsonToggle';
import StatusBadge from './StatusBadge';

export default function DetailModal({ open, onClose, title, data }) {
  if (!open) return null;
  const records = Array.isArray(data) ? data : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-2xl max-h-[80vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">{title}</h2>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-[60vh] p-5">
              {records.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No records found</p>
              ) : (
                <div className="space-y-4">
                  {records.map((rec, i) => (
                    <div key={i} className="bg-background/50 border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{rec.verification_id || rec.escrow_id || rec.id || `Record ${i + 1}`}</span>
                        <StatusBadge status={rec.status || 'unknown'} />
                      </div>
                      {rec.buyer_agent_id && (
                        <p className="text-xs text-muted-foreground">Buyer: {rec.buyer_agent_id}</p>
                      )}
                      {rec.seller_agent_id && (
                        <p className="text-xs text-muted-foreground">Seller: {rec.seller_agent_id}</p>
                      )}
                      {rec.amount_usd != null && (
                        <p className="text-sm font-semibold mt-1">${Number(rec.amount_usd).toFixed(2)}</p>
                      )}
                      {rec.asset_type && (
                        <p className="text-xs text-muted-foreground mt-1">Asset: {rec.asset_type}</p>
                      )}
                      {rec.created_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(rec.created_at).toLocaleString()}
                        </p>
                      )}
                      <JsonToggle data={rec} />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}