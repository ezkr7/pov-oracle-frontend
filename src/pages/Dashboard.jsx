import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePersona } from '@/lib/PersonaContext';
import { useApiStatus } from '@/lib/useApiStatus';
import { fetchStatus, fetchVerifications } from '@/lib/api';
import VerificationsCard from '@/components/dashboard/VerificationsCard';
import EscrowsCard from '@/components/dashboard/EscrowsCard';
import CertificatesCard from '@/components/dashboard/CertificatesCard';
import SdkSnippet from '@/components/dashboard/SdkSnippet';
import BusinessStats from '@/components/dashboard/BusinessStats';
import DetailModal from '@/components/DetailModal';

function mapVerificationRow(v) {
  const hash = v.listing_hash != null ? String(v.listing_hash) : '';
  const hashShort = hash.length > 14 ? `${hash.slice(0, 12)}…` : hash || '—';
  const owner = v.owner_agent_id != null && v.owner_agent_id !== '' ? String(v.owner_agent_id) : 'demo-agent';
  const passed = v.passed === true;
  return {
    verification_id: v.verification_id,
    passed,
    asset_type: v.asset_type,
    created_at: v.created_at,
    listing_hash: v.listing_hash,
    counterparty_agent_id: v.counterparty_agent_id,
    owner_agent_id: owner,
    agent_id: owner,
    status: passed ? 'verified' : 'failed',
    verdict: passed ? 'VERIFIED' : 'FAILED',
    claim_summary:
      v.asset_type && hash
        ? `${v.asset_type}: listing proof ${hashShort}`
        : hash
          ? `Listing proof ${hashShort}`
          : 'Verification record',
  };
}

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

    try {
      console.log('[Dashboard] loadData: calling fetchVerifications()');
      const res = await fetchVerifications();
      console.log(
        '[Dashboard] loadData: fetchVerifications result',
        'ok=',
        res.ok,
        'status=',
        res.status,
        'elapsed=',
        res.elapsed,
        'data keys=',
        res.data && typeof res.data === 'object' ? Object.keys(res.data) : res.data
      );
      const rawList = Array.isArray(res.data?.verifications) ? res.data.verifications : [];
      console.log('[Dashboard] loadData: verifications array length', rawList.length);
      if (rawList.length > 0) {
        console.log('[Dashboard] loadData: first row sample', rawList[0]);
      }
      const items = rawList.map(mapVerificationRow);
      setVerifications(items);
      setElapsed((prev) => ({ ...prev, v: res.elapsed }));
    } catch (e) {
      console.error('[Dashboard] loadData: fetchVerifications threw', e);
      setVerifications([]);
    }
    setLoading((prev) => ({ ...prev, v: false }));

    try {
      const res = await fetchStatus();
      setEscrows([]);
      setCertificates([]);
      setElapsed((prev) => ({ ...prev, e: res.elapsed, c: res.elapsed }));
    } catch {
      setEscrows([]);
      setCertificates([]);
    }
    setLoading((prev) => ({ ...prev, e: false, c: false }));
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(() => loadData(), 8000);
    return () => clearInterval(id);
  }, [loadData]);

  const heroTitle =
    persona === 'personal'
      ? 'PoV Oracle — Observer View'
      : persona === 'business'
        ? 'Dashboard Overview'
        : '// Dashboard';

  const heroSubtitle =
    persona === 'personal'
      ? 'Plain-English summaries of what was verified, what was flagged, and why it matters.'
      : persona === 'business'
        ? 'Real-time overview of verifications, escrows, and certificates across all agent transactions.'
        : 'Live service metrics and recent activity. All data pulled from production endpoints.';

  console.log(
    '[Dashboard] render:',
    'verifications.length=',
    verifications.length,
    'loading.v=',
    loading.v,
    'first=',
    verifications[0] ?? null
  );

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

      {persona === 'personal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-3">👁️ What is PoV Oracle?</h3>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              PoV Oracle independently verifies the actions, decisions, and outputs of AI agents — and issues
              cryptographic proof of every result.
            </p>
            <p>For each verification it:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-foreground">Checks what the agent claimed</strong> — flags anything
                inconsistent or unverifiable
              </li>
              <li>
                <strong className="text-foreground">Holds payments until confirmed</strong> — funds only release when
                both sides are verified
              </li>
              <li>
                <strong className="text-foreground">Issues a signed proof record</strong> — permanently anchored on
                Solana
              </li>
            </ul>
            <p>
              Cost: <strong className="text-foreground">$0.005 flat per verification call</strong>, paid automatically
              in SOL.
            </p>
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
