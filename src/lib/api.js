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

export async function fetchVerifications() {
  return apiFetch('/api/v1/oracle/agent-history/demo-agent?limit=50');
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