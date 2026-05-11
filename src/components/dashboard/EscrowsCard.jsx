import React from 'react';
import { Lock } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';
import DashboardCard from './DashboardCard';
import StatusBadge from '../StatusBadge';

export default function EscrowsCard({ data, loading, elapsed, onRefresh, onClick }) {
  const { persona, term } = usePersona();
  const records = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <DashboardCard
      title={persona === 'personal' ? `Active ${term('escrows')}` : 'Active Escrows'}
      icon={Lock}
      emoji="🔒"
      loading={loading}
      onRefresh={onRefresh}
      onClick={onClick}
      method="GET"
      endpoint="/api/status"
      elapsed={elapsed}
      data={data}
      persona={persona}
      delay={0.2}
    >
      {records.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">
            {persona === 'personal' ? '🔐 No active safe payment holds' : 'No active escrows'}
          </p>
          {persona === 'business' && (
            <p className="text-xs text-muted-foreground mt-1">$0.00 in flight</p>
          )}
        </div>
      ) : (
        records.map((rec, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <StatusBadge status={rec.status || 'open'} />
                {persona === 'business' && rec.amount_usd && (
                  <span className="text-sm font-semibold text-primary">${Number(rec.amount_usd).toFixed(2)}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {rec.buyer_agent_id || 'Buyer'} → {rec.seller_agent_id || 'Seller'}
              </p>
            </div>
          </div>
        ))
      )}
    </DashboardCard>
  );
}