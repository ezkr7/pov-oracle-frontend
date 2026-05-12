import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ChevronDown } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';

const SESSION_KEY = 'oracle_chat_messages';

const ANTHROPIC_SYSTEM =
  'You are the PoV Oracle AI assistant. You help users understand their AI agent verification history, escrow transactions, and certificates. You are knowledgeable about blockchain notarization, hallucination detection, and AI agent accountability. Keep responses concise and helpful.';

const PERSONA_CONFIG = {
  developer: {
    subtitle: 'Dev Mode',
    intro: 'Oracle AI ready. Query verifications, escrows, or certificates.',
    placeholder: 'Query the oracle... e.g. GET /escrow?agent=buyer-001',
  },
  business: {
    subtitle: 'Business Intelligence',
    intro: "Good to see you. I can pull up transaction reports, escrow summaries, revenue activity, and deal history. What would you like to review?",
    placeholder: 'Ask about your business activity...',
  },
  personal: {
    subtitle: 'Observer Mode',
    intro: "Welcome 👁️ I'm Oracle. I'll give you clear, plain-English summaries of what was verified, what was flagged, and why it matters — no jargon.",
    placeholder: 'Ask what was verified, flagged, or why something matters...',
  },
};

/**
 * Calls Anthropic Messages API. Uses the shared PoV Oracle system prompt (not persona-specific prompts).
 */
async function runOracleQuery(userMessage) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey || String(apiKey).trim() === '') {
    return {
      answer:
        'Anthropic API key is missing. Add VITE_ANTHROPIC_API_KEY to your .env (Vite exposes only variables prefixed with VITE_).',
      apiCall: null,
      apiResult: null,
    };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': String(apiKey).trim(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: ANTHROPIC_SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return {
        answer: res.ok ? 'Could not parse API response.' : `Request failed (${res.status}).`,
        apiCall: null,
        apiResult: null,
      };
    }

    if (!res.ok) {
      const msg = data?.error?.message || data?.message || raw.slice(0, 200) || `HTTP ${res.status}`;
      return {
        answer: `Anthropic API error (${res.status}): ${msg}`,
        apiCall: null,
        apiResult: null,
      };
    }

    const block = Array.isArray(data.content) ? data.content.find((b) => b.type === 'text') : null;
    const text = block?.text ?? (typeof data.content?.[0]?.text === 'string' ? data.content[0].text : null);
    const answer = text != null && String(text).trim() !== '' ? String(text).trim() : 'No text in response.';

    return { answer, apiCall: null, apiResult: null };
  } catch (err) {
    return {
      answer: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      apiCall: null,
      apiResult: null,
    };
  }
}

function RecordCard({ rec, persona }) {
  const id = rec.verification_id || rec.escrow_id || rec.id;
  const amount = rec.amount_usd != null ? `$${Number(rec.amount_usd).toFixed(2)}` : null;
  const status = rec.status || 'unknown';
  const statusColor =
    status === 'passed' || status === 'released' || status === 'confirmed'
      ? 'text-emerald-400'
      : status === 'failed' || status === 'disputed'
        ? 'text-red-400'
        : 'text-yellow-400';

  return (
    <div className="bg-background/60 border border-border rounded-lg p-3 mt-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-muted-foreground truncate max-w-[160px]">{id}</span>
        <span className={`font-semibold capitalize ${statusColor}`}>{status}</span>
      </div>
      {amount && <p className="font-semibold mt-1">{amount}</p>}
      {(rec.buyer_agent_id || rec.asset_type) && (
        <p className="text-muted-foreground mt-0.5">
          {rec.buyer_agent_id || ''} {rec.asset_type ? `· ${rec.asset_type}` : ''}
        </p>
      )}
    </div>
  );
}

export default function OracleAssistant() {
  const { persona } = usePersona();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || [];
    } catch {
      return [];
    }
  });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const prevPersonaRef = useRef(persona);
  useEffect(() => {
    if (prevPersonaRef.current !== persona) {
      prevPersonaRef.current = persona;
      const intro = PERSONA_CONFIG[persona]?.intro || PERSONA_CONFIG.developer.intro;
      setMessages([{ role: 'assistant', content: intro, id: Date.now() }]);
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [persona]);

  useEffect(() => {
    if (open && messages.length === 0) {
      const intro = PERSONA_CONFIG[persona]?.intro || PERSONA_CONFIG.developer.intro;
      setMessages([{ role: 'assistant', content: intro, id: Date.now() }]);
    }
  }, [open, persona]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    const { answer, apiCall, apiResult } = await runOracleQuery(text);

    const records = Array.isArray(apiResult)
      ? apiResult
      : Array.isArray(apiResult?.escrows)
        ? apiResult.escrows
        : Array.isArray(apiResult?.verifications)
          ? apiResult.verifications
          : apiResult && !apiResult.error && typeof apiResult === 'object' && (apiResult.escrow_id || apiResult.verification_id)
            ? [apiResult]
            : [];

    setMessages((m) => [
      ...m,
      {
        role: 'assistant',
        content: answer,
        apiCall: persona === 'developer' ? apiCall : null,
        records,
        id: Date.now() + 1,
      },
    ]);
    setLoading(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: open ? 'none' : 'flex' }}
        aria-label="Open Oracle Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 flex flex-col bg-card border-l border-border shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Oracle</p>
                  <p className="text-xs text-muted-foreground">{PERSONA_CONFIG[persona]?.subtitle || 'Dev Mode'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    sessionStorage.removeItem(SESSION_KEY);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-secondary text-foreground rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.apiCall && (
                      <div className="mt-1.5 px-2 py-1 bg-background/60 border border-border rounded-lg text-xs font-mono text-muted-foreground">
                        <span className="text-emerald-400">GET</span> {msg.apiCall.replace('GET ', '')}
                      </div>
                    )}
                    {msg.records && msg.records.length > 0 && (
                      <div className="space-y-1">
                        {msg.records.slice(0, 5).map((rec, i) => (
                          <RecordCard key={i} rec={rec} persona={persona} />
                        ))}
                        {msg.records.length > 5 && (
                          <p className="text-xs text-muted-foreground pl-1">+{msg.records.length - 5} more records</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder={PERSONA_CONFIG[persona]?.placeholder || PERSONA_CONFIG.developer.placeholder}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity hover:opacity-90"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
