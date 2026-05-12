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
BGAURDED_NOTORIZE = os.environ.get("BGAURDED_NOTORIZE_URL", "https://bgaurded.com/notarize").strip()

BUYER_ID = "demo-agent"
SELLER_ID = "demo-seller"
BUYER_EMAIL = f"povdemo+{SUFFIX}-buyer@example.com"
SELLER_EMAIL = f"povdemo+{SUFFIX}-seller@example.com"
# Valid Solana pubkeys for registration
BUYER_WALLET = os.environ.get("POV_DEMO_BUYER_WALLET", "So11111111111111111111111111111111111111112").strip()
SELLER_WALLET = os.environ.get("POV_DEMO_SELLER_WALLET", "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").strip()

out = {
    "buyer_id": BUYER_ID,
    "seller_id": SELLER_ID,
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


def register(role: str, agent_id: str, email: str, wallet: str):
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
    if st != 200 or not j.get("registered"):
        print(f"register-agent failed HTTP {st}: {j}", flush=True)
        sys.exit(1)
    key = j.get("api_key")
    if not (isinstance(key, str) and key.startswith("pov_live_")):
        print(f"register-agent missing api_key: {j}", flush=True)
        sys.exit(1)
    return key


print("[1] register-agent buyer + seller …", flush=True)
buyer_key = register("buyer", BUYER_ID, BUYER_EMAIL, BUYER_WALLET)
register("seller", SELLER_ID, SELLER_EMAIL, SELLER_WALLET)

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
    print(f"    request-verification HTTP {st}: {str(rv)[:400]}", flush=True)
else:
    out["verification_passed"] = rv.get("verification_passed")
    out["verification_id"] = rv.get("verification_id")
    print(f"    verification_id={out['verification_id']!r} passed={out['verification_passed']!r}", flush=True)

vid = out["verification_id"]
if not vid:
    print("    (skip) no verification_id — certificate step omitted.", flush=True)
else:
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
        print(f"    issued ref={out.get('cert_ref')!r}", flush=True)
    else:
        print(f"    issue-pov-certificate HTTP {st}: {str(cert)[:400]}", flush=True)

time.sleep(0.15)
print("[4] BGaurded POST /notorize (best-effort) …", flush=True)
# Same general shape as PoV Oracle → BGaurded notarization payloads (see bgaurded-client.ts).
n_body = {
    "event": "pov_demo_client_notarize",
    "issued_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "buyer_agent_id": BUYER_ID,
    "seller_agent_id": BGAURDED_SELLER,
    "manifest_id": f"demo-manifest-{SUFFIX}",
}
if out.get("verification_id"):
    n_body["verification_id"] = str(out["verification_id"])
if out.get("cert_ref"):
    n_body["pov_certificate_sha256_hex"] = str(out["cert_ref"])

bst, bj = req("POST", BGAURDED_NOTORIZE, n_body, timeout=5.0)
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
