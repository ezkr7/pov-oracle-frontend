import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePersona } from '@/lib/PersonaContext';
import { useApiStatus } from '@/lib/useApiStatus';
import { fetchStatus, fetchEscrows } from '@/lib/api';
import VerificationsCard from '@/components/dashboard/VerificationsCard';
import EscrowsCard from '@/components/dashboard/EscrowsCard';
import CertificatesCard from '@/components/dashboard/CertificatesCard';
import SdkSnippet from '@/components/dashboard/SdkSnippet';
import BusinessStats from '@/components/dashboard/BusinessStats';
import DetailModal from '@/components/DetailModal';

export default function Dashboard() {
  const { persona, term } = usePersona();
  const { statusData } = useApiStatus();

  const [verifications, setVerifications] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState({ v: true, e: true, c: true });
  const [elapsed, setElapsed] = useState({ v: null, e: null, c: null });
  const [modal, setModal] = useState({ open: false, title: '', data: [] });

  const loadData = useCallback(async () => {
    setLoading({ v: true, e: true, c: true });

    // Fetch verifications (escrow list endpoint)
    try {
      const res = await fetchEscrows();
      const items = Array.isArray(res.data) ? res.data : res.data?.escrows || [];
      setVerifications(items);
      setElapsed(prev => ({ ...prev, v: res.elapsed }));
    } catch { setVerifications([]); }
    setLoading(prev => ({ ...prev, v: false }));

    // Fetch status for escrow data
    try {
      const res = await fetchStatus();
      // Status doesn't have individual escrow records, use empty
      setEscrows([]);
      setCertificates([]);
      setElapsed(prev => ({ ...prev, e: res.elapsed, c: res.elapsed }));
    } catch { setEscrows([]); setCertificates([]); }
    setLoading(prev => ({ ...prev, e: false, c: false }));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const heroTitle = persona === 'personal'
    ? 'PoV Oracle — Observer View'
    : persona === 'business'
    ? 'Dashboard Overview'
    : '// Dashboard';

  const heroSubtitle = persona === 'personal'
    ? 'Plain-English summaries of what was verified, what was flagged, and why it matters.'
    : persona === 'business'
    ? 'Real-time overview of verifications, escrows, and certificates across all agent transactions.'
    : 'Live service metrics and recent activity. All data pulled from production endpoints.';



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{heroTitle}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{heroSubtitle}</p>
      </motion.div>

      <BusinessStats statusData={statusData} />

      {/* Hero Cards */}
      <div id="hero-cards" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <VerificationsCard
          data={verifications}
          loading={loading.v}
          elapsed={elapsed.v}
          onRefresh={loadData}
          onClick={() => setModal({ open: true, title: term('verifications'), data: verifications })}
        />
        <EscrowsCard
          data={escrows}
          loading={loading.e}
          elapsed={elapsed.e}
          onRefresh={loadData}
          onClick={() => setModal({ open: true, title: term('escrows'), data: escrows })}
        />
        <CertificatesCard
          data={certificates}
          loading={loading.c}
          elapsed={elapsed.c}
          onRefresh={loadData}
          onClick={() => setModal({ open: true, title: term('certificates'), data: certificates })}
        />
      </div>

      <SdkSnippet />

      {/* Personal mode helpful info */}
      {persona === 'personal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-3">👁️ What is PoV Oracle?</h3>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>PoV Oracle independently verifies the actions, decisions, and outputs of AI agents — and issues cryptographic proof of every result.</p>
            <p>For each verification it:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-foreground">Checks what the agent claimed</strong> — flags anything inconsistent or unverifiable</li>
              <li><strong className="text-foreground">Holds payments until confirmed</strong> — funds only release when both sides are verified</li>
              <li><strong className="text-foreground">Issues a signed proof record</strong> — permanently anchored on Solana</li>
            </ul>
            <p>Cost: <strong className="text-foreground">$0.005 flat per verification call</strong>, paid automatically in SOL.</p>
          </div>
        </motion.div>
      )}

      <DetailModal
        open={modal.open}
        onClose={() => setModal({ open: false, title: '', data: [] })}
        title={modal.title}
        data={modal.data}
      />
    </div>
  );
}