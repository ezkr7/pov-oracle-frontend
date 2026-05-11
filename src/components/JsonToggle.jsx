import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersona } from '@/lib/PersonaContext';

export default function JsonToggle({ data }) {
  const { persona } = usePersona();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  if (persona !== 'developer') return null;

  const jsonStr = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <Code className="w-3 h-3" />
        {show ? 'Hide JSON' : 'Show JSON'}
      </button>
      {show && (
        <div className="mt-2 relative">
          <pre className="bg-background/80 border border-border rounded-lg p-3 text-xs overflow-auto max-h-48 font-mono">
            {jsonStr}
          </pre>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      )}
    </div>
  );
}