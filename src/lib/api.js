const BASE_URL = 'https://pov-oracle-production.up.railway.app';

async function apiFetch(path, options = {}) {
  const start = performance.now();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const elapsed = Math.round(performance.now() - start);
  const data = await res.json();
  return { data, elapsed, ok: res.ok, status: res.status };
}

export async function fetchStatus() {
  return apiFetch('/api/status');
}

export async function fetchQuote() {
  return apiFetch('/api/quote');
}

export async function fetchEscrows() {
  return apiFetch('/api/v1/oracle/list-agent-escrows?agent_id=all');
}

const VERIFICATION_HISTORY_AGENT_IDS = [
  'demo-agent',
  'demo-agent-v2',
  'demo-agent-2',
  'demo-agent-3',
  'demo-agent-4',
  'demo-agent-5',
  'demo-agent-6',
  'demo-agent-7',
  'demo-agent-8',
  'demo-agent-9',
  'demo-agent-10',
  'demo-seller',
];

export async function fetchVerifications() {
  const start = performance.now();
  const results = await Promise.all(
    VERIFICATION_HISTORY_AGENT_IDS.map((agentId) =>
      apiFetch(`/api/v1/oracle/agent-history/${encodeURIComponent(agentId)}?limit=50`)
    )
  );
  const elapsed = Math.round(performance.now() - start);

  const byId = new Map();
  for (let i = 0; i < results.length; i++) {
    const { data, ok } = results[i];
    const requestedAgentId = VERIFICATION_HISTORY_AGENT_IDS[i];
    if (!ok || !data) continue;
    const rows = Array.isArray(data.verifications)
      ? data.verifications
      : Array.isArray(data.records)
        ? data.records
        : [];
    const ownerFromApi = typeof data.agent_id === 'string' ? data.agent_id : requestedAgentId;
    for (const v of rows) {
      const vid = v?.verification_id ?? v?.id;
      if (vid == null || vid === '') continue;
      const key = String(vid);
      const enriched = { ...v, owner_agent_id: ownerFromApi };
      if (!byId.has(key)) byId.set(key, enriched);
    }
  }

  const verifications = [...byId.values()].sort((a, b) => {
    const ta = Date.parse(a?.created_at) || 0;
    const tb = Date.parse(b?.created_at) || 0;
    return tb - ta;
  });

  /** PoV has no GET /certificates list; issued certs are rows on agent-history with certificate_issued. */
  const certificates = verifications
    .filter((v) => v.certificate_issued === true)
    .map((v) => ({
      id: v.verification_id,
      verification_id: v.verification_id,
      asset_type: v.asset_type,
      timestamp: v.created_at,
      created_at: v.created_at,
      owner_agent_id: v.owner_agent_id,
      listing_hash: v.listing_hash,
    }));

  const anyOk = results.some((r) => r.ok);
  return {
    data: { verifications, certificates },
    elapsed,
    ok: anyOk,
    status: anyOk ? 200 : results.find((r) => r.status)?.status ?? 502,
  };
}

export async function fetchEscrowDashboard() {
  // The /escrow endpoint is HTML, use the API status for data
  return apiFetch('/api/status');
}

export async function verifyCertificate(certificateJson, publicKey) {
  return apiFetch('/api/v1/oracle/verify-certificate', {
    method: 'POST',
    body: JSON.stringify({ certificate: certificateJson, public_key: publicKey }),
  });
}

export { BASE_URL };