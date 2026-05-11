import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ShieldCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePersona } from '@/lib/PersonaContext';
import { verifyCertificate } from '@/lib/api';
import HttpMethodBadge from '@/components/HttpMethodBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Verify() {
  const { persona } = usePersona();
  const [certJson, setCertJson] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);
    try {
      let parsed;
      try {
        parsed = JSON.parse(certJson);
      } catch {
        setResult({ valid: false, error: 'Invalid JSON format' });
        setLoading(false);
        return;
      }
      const res = await verifyCertificate(parsed, publicKey);
      setElapsed(res.elapsed);
      setResult({
        valid: res.data?.valid || res.data?.verified || false,
        payload: res.data,
        error: res.data?.error || null,
      });
    } catch (err) {
      setResult({ valid: false, error: err.message || 'Verification failed' });
    }
    setLoading(false);
  };

  const TooltipWrap = ({ children, tip }) => {
    if (persona !== 'personal') return children;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent><p className="text-xs max-w-[200px]">{tip}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {persona === 'personal' ? '✅ Verify a Certificate' : 'Verify Certificate'}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {persona === 'personal'
            ? 'Paste the proof and the key to check if a deal was real and honest'
            : 'Verify an Ed25519-signed certificate against a public key'}
        </p>
      </motion.div>

      <HttpMethodBadge method="POST" endpoint="/api/v1/oracle/verify-certificate" elapsed={elapsed} />

      <div className="mt-6 space-y-5">
        <div>
          <TooltipWrap tip="This is the JSON data you received as proof of a deal. Paste the entire thing here.">
            <Label className="flex items-center gap-1.5 mb-2">
              {persona === 'personal' ? '📄 Proof JSON' : 'Certificate JSON'}
              {persona === 'personal' && <Info className="w-3 h-3 text-muted-foreground" />}
            </Label>
          </TooltipWrap>
          <Textarea
            placeholder={persona === 'developer' ? '{\n  "verification_id": "...",\n  "signature": "...",\n  ...\n}' : 'Paste certificate JSON here...'}
            value={certJson}
            onChange={(e) => setCertJson(e.target.value)}
            className="min-h-[160px] font-mono text-sm"
          />
        </div>

        <div>
          <TooltipWrap tip="This is the public key of the signer. It proves who created the certificate.">
            <Label className="flex items-center gap-1.5 mb-2">
              {persona === 'personal' ? '🔑 Public Key' : 'Public Key (Ed25519)'}
              {persona === 'personal' && <Info className="w-3 h-3 text-muted-foreground" />}
            </Label>
          </TooltipWrap>
          <Input
            placeholder="Enter public key..."
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="font-mono"
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || !certJson.trim()}
          className="w-full h-12 text-base font-semibold gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
          ) : (
            <><ShieldCheck className="w-5 h-5" /> {persona === 'personal' ? 'Check This Proof' : 'Verify Certificate'}</>
          )}
        </Button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mt-8 rounded-2xl border-2 p-6 ${
              result.valid
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.valid ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h3 className={`text-xl font-bold ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.valid ? 'VALID' : 'INVALID'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {result.valid
                    ? (persona === 'personal' ? 'This proof is real and verified!' : 'Certificate signature verified successfully')
                    : (result.error || (persona === 'personal' ? 'This proof could not be verified' : 'Certificate verification failed'))}
                </p>
              </div>
            </div>

            {result.payload && persona === 'developer' && (
              <pre className="bg-background/50 border border-border rounded-lg p-4 text-xs font-mono overflow-auto max-h-64">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}