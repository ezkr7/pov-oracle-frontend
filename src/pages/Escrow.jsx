import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { usePersona } from '@/lib/PersonaContext';
import { fetchEscrows } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import JsonToggle from '@/components/JsonToggle';
import HttpMethodBadge from '@/components/HttpMethodBadge';
import SkeletonCard from '@/components/SkeletonCard';

const timelineSteps = ['opened', 'delivered', 'confirmed', 'released'];

function EscrowTimeline({ currentStatus }) {
  const statusIndex = timelineSteps.indexOf(currentStatus?.toLowerCase());

  return (
    <div className="flex items-center gap-1 mt-3">
      {timelineSteps.map((step, i) => {
        const active = i <= statusIndex;
        const isCurrent = i === statusIndex;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                active
                  ? isCurrent ? 'bg-primary text-primary-foreground border-primary' : 'bg-primary/30 text-primary border-primary/50'
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {i + 1}
              </div>
              <span className={`text-[10px] mt-1 capitalize ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
            {i < timelineSteps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded ${i < statusIndex ? 'bg-primary/50' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Escrow() {
  const { persona, term } = usePersona();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    const matchSearch = !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (r.status || '').toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {persona === 'personal' ? `🔒 ${term('escrows')}` : term('escrows')}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {persona === 'personal'
            ? 'Track your safe payment holds between AI agents'
            : 'Monitor and manage escrow agreements'}
        </p>
      </motion.div>

      <HttpMethodBadge method="GET" endpoint="/api/v1/oracle/list-agent-escrows" elapsed={elapsed} />

      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search escrows..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="released">Released</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl"><SkeletonCard /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Lock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {persona === 'personal' ? '🔐 No safe payment holds yet' : 'No escrow records found'}
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
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{rec.escrow_id || rec.id || `Escrow ${i + 1}`}</span>
                <div className="flex items-center gap-2">
                  {rec.amount_usd != null && (
                    <span className="text-sm font-bold text-primary">${Number(rec.amount_usd).toFixed(2)}</span>
                  )}
                  <StatusBadge status={rec.status || 'open'} />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                {rec.buyer_agent_id && <span>Buyer: {rec.buyer_agent_id}</span>}
                {rec.seller_agent_id && <span>Seller: {rec.seller_agent_id}</span>}
                {rec.expires_at && (
                  <span>Expires: {new Date(rec.expires_at).toLocaleString()}</span>
                )}
              </div>
              <EscrowTimeline currentStatus={rec.status || 'open'} />
              <JsonToggle data={rec} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}