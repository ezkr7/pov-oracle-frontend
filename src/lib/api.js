const BASE_URL = 'https://pov-oracle-production.up.railway.app';

function truthyConfig(value) {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  return false;
}

/**
 * Normalize /api/status flags so the dashboard always reads canonical snake_case.
 * Handles camelCase aliases and string booleans from proxies or older payloads.
 */
function coerceOracleStatusPayload(data) {
  if (data == null || typeof data !== 'object') return data;
  const d = data;
  const anyTrue = (...keys) => keys.some((k) => truthyConfig(d[k]));
  return {
    ...d,
    solana_rpc_configured: anyTrue('solana_rpc_configured', 'solanaRpcConfigured', 'solana_rpc_available'),
    ed25519_key_configured: anyTrue(
      'ed25519_key_configured',
      'ed25519KeyConfigured',
      'ed25519_configured',
      'signing_key_configured'
    ),
  };
}

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

/** Safe JSON for optional endpoints that may 404 with HTML before deploy. */
async function fetchJsonLoose(path) {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
    const elapsed = Math.round(performance.now() - start);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { _parseError: true };
    }
    return { data, elapsed, ok: res.ok, status: res.status };
  } catch {
    return { data: null, elapsed: Math.round(performance.now() - start), ok: false, status: 0 };
  }
}

export async function fetchStatus() {
  const raw = await apiFetch('/api/status');
  const data =
    raw.data != null && typeof raw.data === 'object' ? coerceOracleStatusPayload(raw.data) : raw.data;
  return { ...raw, data };
}

export async function fetchQuote() {
  return apiFetch('/api/quote');
}

export async function fetchEscrows() {
  return apiFetch('/api/v1/oracle/list-agent-escrows?agent_id=all');
}

/** Baseline demo / dashboard agents (always merged). */
const BASE_VERIFICATION_AGENT_IDS = [
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

const FALLBACK_EXTRA_AGENT_IDS = ['demo-agent-buyer', 'demo-seller'];

const DISCOVERY_SKIP = new Set(['bgaurded-verification-service']);

function uniqueAgentIds(ids) {
  const out = [];
  const seen = new Set();
  for (const id of ids) {
    if (typeof id !== 'string') continue;
    const t = id.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function isReasonableAgentId(id) {
  if (typeof id !== 'string') return false;
  const t = id.trim();
  if (t.length < 2 || t.length > 160) return false;
  if (/\s/.test(t)) return false;
  if (DISCOVERY_SKIP.has(t)) return false;
  return true;
}

/**
 * GET /api/v1/oracle/agents — returns { agents: [{ agent_id, ... }] } when deployed.
 */
async function fetchRegisteredAgentIds(limit = 50) {
  const { data, ok, status } = await fetchJsonLoose(`/api/v1/oracle/agents?limit=${encodeURIComponent(String(limit))}`);
  if (!ok || !data || typeof data !== 'object' || data._parseError) {
    return { ok: false, ids: [], status };
  }
  const agents = Array.isArray(data.agents) ? data.agents : [];
  const ids = agents
    .map((a) => (a && typeof a.agent_id === 'string' ? a.agent_id.trim() : ''))
    .filter(isReasonableAgentId);
  return { ok: true, ids, status };
}

function collectAgentIdsFromHistoryPayload(data, requestedAgentId) {
  const ids = new Set();
  if (typeof data?.agent_id === 'string' && data.agent_id.trim()) ids.add(data.agent_id.trim());
  if (typeof requestedAgentId === 'string' && requestedAgentId.trim()) ids.add(requestedAgentId.trim());
  const rows = Array.isArray(data?.verifications)
    ? data.verifications
    : Array.isArray(data?.records)
      ? data.records
      : [];
  for (const v of rows) {
    if (!v || typeof v !== 'object') continue;
    for (const k of ['agent_id', 'counterparty_agent_id', 'owner_agent_id']) {
      const x = v[k];
      if (typeof x === 'string' && x.trim()) ids.add(x.trim());
    }
  }
  return [...ids].filter(isReasonableAgentId);
}

export async function fetchVerifications() {
  const start = performance.now();
  const reg = await fetchRegisteredAgentIds(50);

  let agentIds = uniqueAgentIds([
    ...BASE_VERIFICATION_AGENT_IDS,
    ...(reg.ok ? reg.ids : [...FALLBACK_EXTRA_AGENT_IDS]),
  ]);

  let results = await Promise.all(
    agentIds.map((agentId) =>
      apiFetch(`/api/v1/oracle/agent-history/${encodeURIComponent(agentId)}?limit=50`)
    )
  );

  if (!reg.ok) {
    const discovered = new Set();
    for (let i = 0; i < results.length; i++) {
      const { data, ok } = results[i];
      if (!ok || !data) continue;
      for (const id of collectAgentIdsFromHistoryPayload(data, agentIds[i])) {
        discovered.add(id);
      }
    }
    const existing = new Set(agentIds);
    const more = [...discovered].filter((id) => !existing.has(id)).slice(0, 80);
    if (more.length > 0) {
      agentIds = uniqueAgentIds([...agentIds, ...more]);
      const extra = await Promise.all(
        more.map((agentId) =>
          apiFetch(`/api/v1/oracle/agent-history/${encodeURIComponent(agentId)}?limit=50`)
        )
      );
      results = [...results, ...extra];
    }
  }

  const elapsed = Math.round(performance.now() - start);

  const byId = new Map();
  for (let i = 0; i < results.length; i++) {
    const { data, ok } = results[i];
    const requestedAgentId = agentIds[i];
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
  return fetchStatus();
}

export async function verifyCertificate(certificateJson, publicKey) {
  return apiFetch('/api/v1/oracle/verify-certificate', {
    method: 'POST',
    body: JSON.stringify({ certificate: certificateJson, public_key: publicKey }),
  });
}

export { BASE_URL };
