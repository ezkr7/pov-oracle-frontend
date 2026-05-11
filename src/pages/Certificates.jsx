import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, Copy, Check, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePersona } from '@/lib/PersonaContext';
import { fetchEscrows } from '@/lib/api';
import HttpMethodBadge from '@/components/HttpMethodBadge';
import SkeletonCard from '@/components/SkeletonCard';

function CertificateCard({ rec }) {
  const [copied, setCopied] = useState(false);
  const { persona } = usePersona();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(rec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{rec.verification_id || rec.id || 'Certificate'}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs gap-1.5">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 mb-3">
        {rec.asset_type && <p>Asset Type: <span className="text-foreground">{rec.asset_type}</span></p>}
        {rec.created_at && <p>Issued: <span className="text-foreground">{new Date(rec.created_at).toLocaleString()}</span></p>}
        {rec.signature && <p className="truncate">Signature: <span className="text-foreground font-mono">{rec.signature}</span></p>}
      </div>

      {rec.bguarded_anchor && (
        <a
          href={rec.bguarded_anchor}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          View BGaurded Anchor
        </a>
      )}

      {persona === 'developer' && (
        <pre className="mt-3 bg-background/80 border border-border rounded-lg p-3 text-xs font-mono overflow-auto max-h-48">
          {JSON.stringify(rec, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function Certificates() {
  const { persona, term } = usePersona();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEscrows();
      const items = Array.isArray(res.data) ? res.data : res.data?.escrows || [];
      setRecords(items);
      setElapsed(res.elapsed);
    } catch { setRecords([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter((r) => {
    if (!search) return true;
    return JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {persona === 'personal' ? `📜 ${term('certificates')}` : term('certificates')}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {persona === 'personal'
            ? 'Browse and verify your proofs of honest AI deals'
            : 'Browse issued verification certificates'}
        </p>
      </motion.div>

      <HttpMethodBadge method="GET" endpoint="/api/v1/oracle/list-agent-escrows" elapsed={elapsed} />

      <div className="relative mt-4 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by verification ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl"><SkeletonCard /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {persona === 'personal' ? '🏆 No proofs issued yet' : 'No certificates found'}
          </p>
          <Button variant="outline" className="mt-4" onClick={load}>Retry</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CertificateCard rec={rec} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}