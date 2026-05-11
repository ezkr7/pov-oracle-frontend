import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, ExternalLink, ChevronDown } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';
import { base44 } from '@/api/base44Client';
import { BASE_URL } from '@/lib/api';

const SESSION_KEY = 'oracle_chat_messages';

const PERSONA_CONFIG = {
  developer: {
    subtitle: 'Dev Mode',
    intro: 'Oracle AI ready. Query verifications, escrows, or certificates.',
    placeholder: 'Query the oracle... e.g. GET /escrow?agent=buyer-001',
    systemPrompt: `You are Oracle, a terse senior-engineer AI assistant for PoV Oracle (an AI agent notary/escrow service).
Speak like a senior backend engineer. Be direct and concise. Use technical terminology freely — verifications, escrows, certificates, signatures, pubkeys, Ed25519.
Show field names and IDs. Keep responses to 2-4 sentences. When data is found, summarize counts and key fields.
When nothing found, say: "No records matched. Verify the agent_id or escrow_id and retry."`,
  },
  business: {
    subtitle: 'Business Intelligence',
    intro: "Good to see you. I can pull up transaction reports, escrow summaries, revenue activity, and deal history. What would you like to review?",
    placeholder: 'Ask about your business activity...',
    systemPrompt: `You are Oracle, a sharp financial analyst and business intelligence assistant for PoV Oracle.
Speak like a professional business consultant. Lead every response with dollar amounts, deal counts, and business impact.
Use phrases like "I've located 3 transactions totaling $420.00" or "Your escrow pipeline currently holds $1,250 in active deals."
Never show raw JSON or technical field names unless explicitly asked. Keep language professional and corporate.
When no data is found, say exactly: "No activity recorded in this period. Once transactions begin processing they will appear here."`,
  },
  personal: {
    subtitle: 'Observer Mode',
    intro: "Welcome 👁️ I'm Oracle. I'll give you clear, plain-English summaries of what was verified, what was flagged, and why it matters — no jargon.",
    placeholder: 'Ask what was verified, flagged, or why something matters...',
    systemPrompt: `You are Oracle, a clear and neutral observer assistant for PoV Oracle.
Your job is to summarize what happened in plain English — what was verified, what was flagged, and why it matters.
Use simple, precise language. No jargon, no technical terms. Short paragraphs.
FORBIDDEN: "Ed25519", "lamports", "pubkey", "agent_id", "JSON", "API endpoint", "escrow_id".
Instead say: "verification check" for verification, "held payment" for escrow, "proof record" for certificate.
Always explain the significance: what was the outcome, does it matter, is there anything to act on.
When results are found, lead with a clear summary: "Here's what happened:" followed by bullet points.
When no data found, say: "Nothing on record for that. Try a different agent name or date range."`,
  },
};

async function runOracleQuery(userMessage, persona) {
  // Determine intent and make API call
  const lower = userMessage.toLowerCase();
  let apiResult = null;
  let apiCall = null;

  // Extract potential IDs
  const idMatch = userMessage.match(/[a-zA-Z0-9_-]{6,}/g);
  const escrowIdMatch = idMatch?.find(id => id.toLowerCase().includes('escrow') || id.toLowerCase().includes('esc'));
  const agentIdMatch = idMatch?.find(id => id.toLowerCase().includes('agent') || id.toLowerCase().includes('buyer') || id.toLowerCase().includes('seller'));
  const anyId = idMatch?.[0];

  if (lower.includes('escrow') && anyId) {
    const endpoint = `/api/v1/oracle/get-escrow-status?escrow_id=${anyId}`;
    apiCall = `GET ${endpoint}`;
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      apiResult = await res.json();
    } catch { apiResult = { error: 'fetch failed' }; }
  } else if ((lower.includes('agent') || lower.includes('buyer') || lower.includes('seller') || lower.includes('transaction') || lower.includes('verification') || lower.includes('certificate')) && anyId) {
    const qid = agentIdMatch || anyId;
    const endpoint = `/api/v1/oracle/list-agent-escrows?agent_id=${qid}`;
    apiCall = `GET ${endpoint}`;
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      apiResult = await res.json();
    } catch { apiResult = { error: 'fetch failed' }; }
  } else if (lower.includes('list') || lower.includes('all') || lower.includes('recent') || lower.includes('yesterday') || lower.includes('today') || lower.includes('may') || lower.includes('april') || lower.includes('june')) {
    const endpoint = `/api/v1/oracle/list-agent-escrows?agent_id=all`;
    apiCall = `GET ${endpoint}`;
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      apiResult = await res.json();
    } catch { apiResult = { error: 'fetch failed' }; }
  }

  // Build AI prompt
  const config = PERSONA_CONFIG[persona] || PERSONA_CONFIG.developer;
  const contextStr = apiResult ? `\n\nDATA FROM API (${apiCall}):\n${JSON.stringify(apiResult, null, 2).slice(0, 2000)}` : '';
  const prompt = `${config.systemPrompt}\n\nUser message: "${userMessage}"${contextStr}\n\nRespond to the user based on the data above. If there is no API data, answer from general knowledge about PoV Oracle.`;

  try {
    const answer = await base44.integrations.Core.InvokeLLM({ prompt });
    return { answer, apiCall, apiResult };
  } catch {
    return { answer: "Sorry, I couldn't process that right now.", apiCall, apiResult };
  }
}

function RecordCard({ rec, persona }) {
  const id = rec.verification_id || rec.escrow_id || rec.id;
  const amount = rec.amount_usd != null ? `$${Number(rec.amount_usd).toFixed(2)}` : null;
  const status = rec.status || 'unknown';
  const statusColor = status === 'passed' || status === 'released' || status === 'confirmed' ? 'text-emerald-400' : status === 'failed' || status === 'disputed' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className="bg-background/60 border border-border rounded-lg p-3 mt-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-mono text-muted-foreground truncate max-w-[160px]">{id}</span>
        <span className={`font-semibold capitalize ${statusColor}`}>{status}</span>
      </div>
      {amount && <p className="font-semibold mt-1">{amount}</p>}
      {(rec.buyer_agent_id || rec.asset_type) && (
        <p className="text-muted-foreground mt-0.5">{rec.buyer_agent_id || ''} {rec.asset_type ? `· ${rec.asset_type}` : ''}</p>
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
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || []; } catch { return []; }
  });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Reset messages when persona changes
  const prevPersonaRef = useRef(persona);
  useEffect(() => {
    if (prevPersonaRef.current !== persona) {
      prevPersonaRef.current = persona;
      const intro = PERSONA_CONFIG[persona]?.intro || PERSONA_CONFIG.developer.intro;
      setMessages([{ role: 'assistant', content: intro, id: Date.now() }]);
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [persona]);

  // Add intro message when first opened with no history
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
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    const { answer, apiCall, apiResult } = await runOracleQuery(text, persona);

    const records = Array.isArray(apiResult)
      ? apiResult
      : Array.isArray(apiResult?.escrows)
      ? apiResult.escrows
      : Array.isArray(apiResult?.verifications)
      ? apiResult.verifications
      : apiResult && !apiResult.error && typeof apiResult === 'object' && (apiResult.escrow_id || apiResult.verification_id)
      ? [apiResult]
      : [];

    setMessages((m) => [...m, {
      role: 'assistant',
      content: answer,
      apiCall: persona === 'developer' ? apiCall : null,
      records,
      id: Date.now() + 1,
    }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
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

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 flex flex-col bg-card border-l border-border shadow-2xl"
          >
            {/* Header */}
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
                  onClick={() => { setMessages([]); sessionStorage.removeItem(SESSION_KEY); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-secondary text-foreground rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {/* Dev API call display */}
                    {msg.apiCall && (
                      <div className="mt-1.5 px-2 py-1 bg-background/60 border border-border rounded-lg text-xs font-mono text-muted-foreground">
                        <span className="text-emerald-400">GET</span> {msg.apiCall.replace('GET ', '')}
                      </div>
                    )}
                    {/* Record cards */}
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

            {/* Input */}
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