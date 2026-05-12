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
  for (const { data, ok } of results) {
    if (!ok || !data) continue;
    const arr = Array.isArray(data.verifications) ? data.verifications : [];
    for (const v of arr) {
      const vid = v?.verification_id ?? v?.id;
      if (vid == null || vid === '') continue;
      const key = String(vid);
      if (!byId.has(key)) byId.set(key, v);
    }
  }

  const verifications = [...byId.values()].sort((a, b) => {
    const ta = Date.parse(a?.created_at) || 0;
    const tb = Date.parse(b?.created_at) || 0;
    return tb - ta;
  });

  const anyOk = results.some((r) => r.ok);
  return {
    data: { verifications },
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