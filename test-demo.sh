#!/usr/bin/env bash
# PoV Oracle demo — python3 urllib only. chmod +x test-demo.sh && ./test-demo.sh
set -uo pipefail

export POV_BASE="${POV_DEMO_BASE_URL:-https://pov-oracle-production.up.railway.app}"
export POV_SUFFIX="${POV_DEMO_SUFFIX:-$(date +%s)}"

echo "PoV Oracle demo — base: $POV_BASE suffix: $POV_SUFFIX"

python3 - <<'PY'
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ["POV_BASE"].rstrip("/")
SUFFIX = os.environ["POV_SUFFIX"]
LISTING_URL = "https://pov-oracle-production.up.railway.app/api/status"
BGAURDED_SELLER = "bgaurded-verification-service"
# BGaurded Cloud notarization (Railway). Override with BGAURDED_NOTORIZE_URL if needed.
BGAURDED_NOTORIZE = os.environ.get(
    "BGAURDED_NOTORIZE_URL",
    "https://bgaurded-cloud-production-749e.up.railway.app/notarize?agent_id=pov-oracle",
).strip()

BUYER_EMAIL = f"povdemo+{SUFFIX}-buyer@example.com"
SELLER_EMAIL = f"povdemo+{SUFFIX}-seller@example.com"
# Valid Solana pubkeys for registration
BUYER_WALLET = os.environ.get("POV_DEMO_BUYER_WALLET", "So11111111111111111111111111111111111111112").strip()
SELLER_WALLET = os.environ.get("POV_DEMO_SELLER_WALLET", "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").strip()

out = {
    "buyer_id": None,
    "seller_id": None,
    "verification_passed": None,
    "verification_id": None,
    "certificate_issued": False,
    "cert_ref": None,
    "bgaurded_notarized": False,
    "bgaurded_note": "",
}


def req(method: str, url: str, body=None, headers=None, timeout=10.0):
    h = {"Accept": "application/json", "Content-Type": "application/json"}
    if headers:
        h.update(headers)
    data = None if body is None else json.dumps(body).encode("utf-8")
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            return resp.status, json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(raw) if raw.strip() else {"error": raw[:300]}
        except json.JSONDecodeError:
            return e.code, {"error": raw[:300]}
    except urllib.error.URLError as e:
        return 0, {"error": str(e.reason) if getattr(e, "reason", None) else str(e)}


def _id_candidates(prefix: str):
    """Fresh timestamp IDs first; then suffixes if that second collided or id was taken without api_key."""
    yield f"{prefix}-{SUFFIX}"
    for n in range(2, 500):
        yield f"{prefix}-{SUFFIX}-{n}"


def register_until_api_key(role: str, email: str, wallet: str, id_prefix: str) -> tuple[str, str]:
    """
    POST register-agent until we get a fresh api_key.
    Handles 'already registered' (no api_key) by trying the next unique agent_id.
    """
    last = None
    for agent_id in _id_candidates(id_prefix):
        st, j = req(
            "POST",
            f"{BASE}/api/v1/oracle/register-agent",
            {
                "agent_id": agent_id,
                "role": role,
                "human_email": email,
                "solana_wallet": wallet,
                "display_name": f"Demo {role}",
            },
        )
        last = (agent_id, st, j)
        key = j.get("api_key") if isinstance(j, dict) else None
        if st == 200 and j.get("registered") and isinstance(key, str) and key.startswith("pov_live_"):
            return agent_id, key
        # Log and retry: collision, already registered without key, etc.
        print(
            f"    try {agent_id!r}: HTTP {st} registered={j.get('registered')!r} "
            f"has_api_key={bool(isinstance(key, str) and key.startswith('pov_live_'))}",
            flush=True,
        )
    print(f"register-agent failed: exhausted candidates. Last: {last}", flush=True)
    sys.exit(1)


print("[1] register-agent buyer …", flush=True)
BUYER_ID, buyer_key = register_until_api_key("buyer", BUYER_EMAIL, BUYER_WALLET, "demo-agent")
out["buyer_id"] = BUYER_ID
print(f"REGISTERED buyer agent_id={BUYER_ID!r}", flush=True)

print("[1b] register-agent seller …", flush=True)
SELLER_ID, _seller_key = register_until_api_key("seller", SELLER_EMAIL, SELLER_WALLET, "demo-seller")
out["seller_id"] = SELLER_ID
print(f"REGISTERED seller agent_id={SELLER_ID!r}", flush=True)

print("[2] request-verification (BGaurded seller, fee waived) …", flush=True)
st, rv = req(
    "POST",
    f"{BASE}/api/v1/oracle/request-verification",
    {
        "agent_id": BUYER_ID,
        "seller_agent_id": BGAURDED_SELLER,
        "counterparty_agent_id": BGAURDED_SELLER,
        "agent_pubkey": BUYER_WALLET,
        "asset_type": "service",
        "service_description": "Demo verification against oracle /api/status JSON (BGaurded partner path).",
        "product_data": {"url": LISTING_URL, "price": 0, "specs": {}},
        "seller_product_data": {"url": LISTING_URL, "price": 0, "specs": {}},
        "counterparty_product_data": {"url": LISTING_URL, "price": 0, "specs": {}},
        "transaction_amount_usd": 0,
    },
    headers={"X-API-Key": buyer_key},
    timeout=22.0,
)
if st != 200:
    print(f"FATAL request-verification HTTP {st}: {str(rv)[:800]}", flush=True)
    sys.exit(1)
out["verification_passed"] = rv.get("verification_passed")
out["verification_id"] = rv.get("verification_id")
vid = out["verification_id"]
if not vid:
    print(f"FATAL request-verification returned no verification_id: {str(rv)[:800]}", flush=True)
    sys.exit(1)
print(
    f"VERIFIED verification_id={vid!r} verification_passed={out['verification_passed']!r}",
    flush=True,
)

time.sleep(0.15)
print("[3] issue-pov-certificate …", flush=True)
st, cert = req(
    "POST",
    f"{BASE}/api/v1/oracle/issue-pov-certificate",
    {
        "verification_id": vid,
        "agent_id": BUYER_ID,
        "product_data": {"url": LISTING_URL},
        "manifest": {
            "manifest_id": f"demo-manifest-{SUFFIX}",
            "agent_id": BUYER_ID,
            "counterparty_agent_id": BGAURDED_SELLER,
            "items": [],
        },
    },
    headers={"X-API-Key": buyer_key},
    timeout=12.0,
)
if st == 200 and cert.get("pov_certificate"):
    out["certificate_issued"] = True
    out["cert_ref"] = cert.get("bgaurded_ref") or cert.get("manifest_id")
    print(f"CERTIFICATE ISSUED ref={out.get('cert_ref')!r}", flush=True)
else:
    print(f"WARN issue-pov-certificate HTTP {st}: {str(cert)[:400]}", flush=True)

time.sleep(0.15)
print("[4] BGaurded Cloud POST notarize (best-effort) …", flush=True)
hc = rv.get("hallucination_check") if isinstance(rv.get("hallucination_check"), dict) else {}
conf = hc.get("confidence_score")
try:
    conf_pct = int(round(float(conf) * 100)) if conf is not None else None
except (TypeError, ValueError):
    conf_pct = None
conf_s = f"{conf_pct}%" if conf_pct is not None else "n/a"
n_body = {
    "action": f"PoV Oracle verified transaction for agent {BUYER_ID}",
    "thought_process": (
        f"PoV Oracle validated listing/counterparty claims for verification_id={vid}, "
        f"evidence from {LISTING_URL}, model confidence: {conf_s}."
    ),
    "evidence_url": LISTING_URL,
    "impact_score": 8,
    "category": "ACTION",
    "task_id": str(vid),
}
bst, bj = req(
    "POST",
    BGAURDED_NOTORIZE,
    n_body,
    headers={"X-Partner-ID": "bgaurded"},
    timeout=35.0,
)
out["bgaurded_note"] = f"HTTP {bst} {bj if isinstance(bj, dict) else str(bj)[:200]}"
print(f"    {out['bgaurded_note']}", flush=True)
if 200 <= bst < 300:
    out["bgaurded_notarized"] = True

print("", flush=True)
print("----------------------------------------------------------------", flush=True)
print(" SUMMARY", flush=True)
print("----------------------------------------------------------------", flush=True)
print(f"  Buyer agent ID:        {BUYER_ID}", flush=True)
print(f"  Seller agent ID:       {SELLER_ID}", flush=True)
print(f"  verification_id:      {out['verification_id']}", flush=True)
print(f"  verification_passed:  {out['verification_passed']}", flush=True)
print(f"  Certificate issued:   {out['certificate_issued']}", flush=True)
print(f"  BGaurded notarized:   {out['bgaurded_notarized']}", flush=True)
if out.get("cert_ref"):
    print(f"  Certificate ref:      {out['cert_ref']}", flush=True)
print("----------------------------------------------------------------", flush=True)
sys.exit(0)
PY

echo ""
echo "Dashboard: https://povoracle.com/dashboard"
