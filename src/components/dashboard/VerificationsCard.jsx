import React from 'react';
import { Shield } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';
import DashboardCard from './DashboardCard';
import StatusBadge from '../StatusBadge';

export default function VerificationsCard({ data, loading, elapsed, onRefresh, onClick }) {
  const { persona, term } = usePersona();
  const records = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <DashboardCard
      title={persona === 'personal' ? `Recent ${term('verifications')}` : 'Recent Verifications'}
      icon={Shield}
      emoji="🔍"
      loading={loading}
      onRefresh={onRefresh}
      onClick={onClick}
      method="GET"
      endpoint="/api/v1/oracle/list-agent-escrows"
      elapsed={elapsed}
      data={data}
      persona={persona}
      delay={0.1}
    >
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {persona === 'personal' ? '✨ No trust checks yet' : 'No verifications recorded'}
        </p>
      ) : (
        records.map((rec, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <StatusBadge status={rec.status || 'passed'} />
                <span className="text-xs text-muted-foreground truncate">
                  {rec.agent_id || rec.buyer_agent_id || 'Agent'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {rec.asset_type || rec.asset?.type || 'Unknown'} · {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        ))
      )}
    </DashboardCard>
  );
}