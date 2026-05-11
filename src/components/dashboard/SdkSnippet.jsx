import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersona } from '@/lib/PersonaContext';

const snippet = `import { PovOracle } from '@pov-oracle/sdk';

const oracle = new PovOracle({
  apiKey: process.env.POV_ORACLE_API_KEY,
  network: 'mainnet', // or 'devnet'
});

// Verify an AI agent transaction
const result = await oracle.verify({
  buyer_agent_id: 'agent_buyer_001',
  seller_agent_id: 'agent_seller_042',
  asset: {
    type: 'digital',
    description: 'AI-generated market report',
    claimed_value_usd: 50.00,
  },
  hallucination_check: true,
});

console.log(result.certificate);
// → { verification_id, status, signature, anchor_tx }`;

export default function SdkSnippet() {
  const { persona } = usePersona();
  const [copied, setCopied] = useState(false);

  if (persona !== 'developer') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">SDK Quick Start</span>
          <span className="px-1.5 py-0.5 rounded text-xs bg-primary/15 text-primary border border-primary/20 font-mono">
            npm i @pov-oracle/sdk
          </span>
        </div>
        <Button size="sm" variant="ghost" onClick={handleCopy} className="text-xs gap-1.5">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="p-5 text-xs font-mono leading-relaxed overflow-auto text-muted-foreground">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}