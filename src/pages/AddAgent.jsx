import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, ArrowLeft, ArrowRight } from 'lucide-react';
import RoleSelector from '@/components/RoleSelector';

function InputField({ label, type = 'text', value, onChange, placeholder, helper }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#a0a8b8' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${focused ? '#00ff88' : 'rgba(255,255,255,0.1)'}` }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {helper && <p className="text-xs text-gray-600 mt-1.5">{helper}</p>}
    </div>
  );
}

export default function AddAgent() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual');
  const [agentId, setAgentId] = useState('');
  const [role, setRole] = useState('buyer');
  const [nickname, setNickname] = useState('');
  const [wallet, setWallet] = useState('');
  const [pastedId, setPastedId] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(null);

  const snippet = `POST https://pov-oracle-production.up.railway.app/api/v1/oracle/register-agent
{
  "role": "buyer",
  "human_email": "your@email.com",
  "display_name": "My Agent"
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    const finalId = (mode === 'manual' ? agentId : pastedId) || `agent_${Math.random().toString(36).slice(2, 10)}`;
    const finalNick = (mode === 'manual' ? nickname : '') || `Agent ${finalId.slice(0, 6)}`;

    // Save agent to localStorage
    const existing = JSON.parse(localStorage.getItem('pov-oracle-agents') || '[]');
    const newAgent = { id: finalId, nickname: finalNick, role: mode === 'manual' ? role : 'buyer', wallet, status: 'active' };
    localStorage.setItem('pov-oracle-agents', JSON.stringify([...existing, newAgent]));

    setSuccess(finalNick);
  };

  const handleReset = () => {
    setAgentId(''); setNickname(''); setWallet(''); setPastedId('');
    setRole('buyer'); setSuccess(null);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
               style={{ background: 'rgba(0,255,136,0.15)' }}>
            <CheckCircle className="w-8 h-8" style={{ color: '#00ff88' }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Agent Connected!</h2>
          <p className="text-gray-400 mb-8">
            <span className="font-semibold" style={{ color: '#00ff88' }}>{success}</span> has been connected successfully.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={handleReset}
              className="w-full py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#e8eaf0' }}>
              Add Another Agent
            </button>
            <Link to="/dashboard">
              <button className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: '#00ff88', color: '#0a0a0f' }}>
                Go to Dashboard
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Connect Another Agent</h1>
            <p className="text-gray-500 text-sm">Add a new AI agent to your PoV Oracle account.</p>
          </div>

          <div className="p-8 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[['manual', 'Manual Setup'], ['auto', 'Auto Registration']].map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)}
                  className="p-4 rounded-xl border text-sm font-medium transition-all"
                  style={{ border: mode === m ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)', background: mode === m ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.03)', color: mode === m ? '#00ff88' : '#9ca3af' }}>
                  {label}
                </button>
              ))}
            </div>

            {mode === 'manual' ? (
              <div className="space-y-4">
                <InputField label="Agent ID" value={agentId} onChange={setAgentId} placeholder="e.g. my-seller-agent-002" helper="Leave blank and we will generate one for you" />
                <RoleSelector value={role} onChange={setRole} />
                <InputField label="Agent Nickname" value={nickname} onChange={setNickname} placeholder="My Seller Agent" helper="What you want to call this agent in the dashboard" />
                <InputField label="Solana Wallet Address" value={wallet} onChange={setWallet} placeholder="Your Solana wallet address" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Have your agent call our registration endpoint automatically:</p>
                <div className="relative rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                    <span className="text-xs text-gray-500 font-mono">register-agent</span>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-auto" style={{ color: '#7dd3fc' }}>{snippet}</pre>
                </div>
                <InputField label="Paste your agent_id here" value={pastedId} onChange={setPastedId} placeholder="agent_abc123xyz" helper="Your agent returned this in the response" />
              </div>
            )}

            <button onClick={handleConnect}
              className="mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#00ff88', color: '#0a0a0f' }}>
              Connect Agent <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}