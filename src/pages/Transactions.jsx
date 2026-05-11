import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { usePersona } from '@/lib/PersonaContext';
import { fetchEscrows } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import JsonToggle from '@/components/JsonToggle';
import HttpMethodBadge from '@/components/HttpMethodBadge';
import SkeletonCard from '@/components/SkeletonCard';

export default function Transactions() {
  const { persona, term } = usePersona();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(null);
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

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
    const matchAsset = assetFilter === 'all' || (r.asset_type || r.asset?.type || '').toLowerCase() === assetFilter;
    const matchStatus = statusFilter === 'all' || (r.status || '').toLowerCase() === statusFilter;
    return matchSearch && matchAsset && matchStatus;
  });

  const pageTitle = persona === 'personal' ? `🔍 ${term('verifications')}` : term('verifications');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-1">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {persona === 'personal'
            ? 'Search through all trust checks performed by AI agents'
            : 'Search and filter verification records'}
        </p>
      </motion.div>

      <HttpMethodBadge method="GET" endpoint="/api/v1/oracle/list-agent-escrows" elapsed={elapsed} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={persona === 'personal' ? 'Search by agent or ID...' : 'Search by agent ID or verification ID...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={assetFilter} onValueChange={setAssetFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="Asset Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assets</SelectItem>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="on-chain">On-chain</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl">
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {persona === 'personal' ? 'No trust checks found. Try a different search!' : 'No verification records found'}
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
              onClick={() => setSelected(selected === i ? null : i)}
              className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{rec.verification_id || rec.escrow_id || rec.id || `Record ${i + 1}`}</span>
                <StatusBadge status={rec.status || 'unknown'} />
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                {rec.buyer_agent_id && <span>Buyer: {rec.buyer_agent_id}</span>}
                {rec.seller_agent_id && <span>Seller: {rec.seller_agent_id}</span>}
                {(rec.asset_type || rec.asset?.type) && <span>Asset: {rec.asset_type || rec.asset?.type}</span>}
                {rec.created_at && <span>{new Date(rec.created_at).toLocaleString()}</span>}
              </div>
              {selected === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <h4 className="text-sm font-semibold mb-2">
                    {persona === 'personal' ? '🔬 Fake Data Scanner Report' : 'Hallucination Check Report'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {rec.hallucination_report || 'Full report data not available for this record.'}
                  </p>
                  <JsonToggle data={rec} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}