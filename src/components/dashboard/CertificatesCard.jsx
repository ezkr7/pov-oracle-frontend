import React from 'react';
import { Award } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';
import DashboardCard from './DashboardCard';

export default function CertificatesCard({ data, loading, elapsed, onRefresh, onClick }) {
  const { persona, term } = usePersona();
  const records = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <DashboardCard
      title={persona === 'personal' ? `Recent ${term('certificates')}` : 'Recent Certificates'}
      icon={Award}
      emoji="📜"
      loading={loading}
      onRefresh={onRefresh}
      onClick={onClick}
      method="GET"
      endpoint="/api/v1/oracle/agent-history (certificate_issued)"
      elapsed={elapsed}
      data={data}
      persona={persona}
      delay={0.3}
    >
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {persona === 'personal' ? '🏆 No proofs issued yet' : 'No certificates issued'}
        </p>
      ) : (
        records.map((rec, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{rec.verification_id || rec.id}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {rec.asset_type || 'Certificate'} · {rec.timestamp ? new Date(rec.timestamp).toLocaleDateString() : '—'}
              </p>
              {rec.bguarded_anchor && (
                <a
                  href={rec.bguarded_anchor}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  View on chain →
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </DashboardCard>
  );
}