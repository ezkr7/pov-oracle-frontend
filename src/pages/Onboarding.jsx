import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, Code, Briefcase, Eye, ArrowRight } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';
import RoleSelector from '@/components/RoleSelector';

const STEPS = ['Connect Agent', 'Payment', 'Choose Persona'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
              style={{ background: i <= current ? '#00ff88' : 'rgba(255,255,255,0.07)', color: i <= current ? '#0a0a0f' : '#4b5563' }}>
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-xs hidden sm:block" style={{ color: i === current ? '#fff' : '#4b5563' }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="w-12 sm:w-20 h-px mx-1 transition-all"
              style={{ background: i < current ? '#00ff88' : 'rgba(255,255,255,0.08)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, helper, type = 'text' }) {
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

function StepAgent({ onNext }) {
  const [mode, setMode] = useState('manual');
  const [agentId, setAgentId] = useState('');
  const [role, setRole] = useState('buyer');
  const [nickname, setNickname] = useState('');
  const [wallet, setWallet] = useState('');
  const [pastedId, setPastedId] = useState('');
  const [copied, setCopied] = useState(false);

  const snippet = `POST https://pov-oracle-production.up.railway.app/api/v1/oracle/register-agent\n{\n  "role": "buyer",\n  "human_email": "your@email.com",\n  "display_name": "My Agent"\n}`;

  const handleNext = () => {
    const finalId = (mode === 'manual' ? agentId : pastedId) || `agent_${Math.random().toString(36).slice(2, 10)}`;
    const shortId = finalId.replace(/^agent_/, '').slice(0, 8);
    const finalNick = (mode === 'manual' ? nickname : '') || `Agent ${shortId}`;
    const agents = JSON.parse(localStorage.getItem('pov-oracle-agents') || '[]');
    const newAgent = { id: finalId, nickname: finalNick, role: mode === 'manual' ? role : 'buyer', wallet, status: 'active' };
    localStorage.setItem('pov-oracle-agents', JSON.stringify([...agents, newAgent]));
    onNext({ agentId: finalId, nickname: finalNick });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-bold text-white mb-2">Connect Your Agent</h2>
      <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Register your AI agent with PoV Oracle.</p>
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
          <InputField label="Agent ID" value={agentId} onChange={setAgentId} placeholder="my-buyer-agent-001" helper="Leave blank and we will generate one for you" />
          <RoleSelector value={role} onChange={setRole} />
          <InputField label="Agent Nickname" value={nickname} onChange={setNickname} placeholder="My Buyer Agent" helper="What you want to call this agent in the dashboard" />
          <InputField label="Solana Wallet Address" value={wallet} onChange={setWallet} placeholder="Your Solana wallet address" />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#9ca3af' }}>Have your agent call our registration endpoint:</p>
          <div className="relative rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <span className="text-xs text-gray-500 font-mono">register-agent</span>
              <button onClick={() => { navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-auto" style={{ color: '#7dd3fc' }}>{snippet}</pre>
          </div>
          <InputField label="Paste your agent_id here" value={pastedId} onChange={setPastedId} placeholder="agent_abc123xyz" helper="Your agent returned this in the response" />
        </div>
      )}
      <button onClick={handleNext}
        className="mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
        style={{ background: '#00ff88', color: '#0a0a0f' }}>
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function StepPayment({ onNext }) {
  const [mode, setMode] = useState('wallet');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletError, setWalletError] = useState('');
  const [agentWallet, setAgentWallet] = useState('');

  const connectPhantom = async () => {
    setWalletError('');
    const provider = window?.solana;
    if (!provider?.isPhantom) {
      window.open('https://phantom.app/', '_blank');
      setWalletError('Phantom not detected. Install it first, then come back.');
      return;
    }
    try {
      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      setWalletConnected(true);
    } catch (err) {
      setWalletError(err.message || 'Connection cancelled.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-bold text-white mb-2">Payment Setup</h2>
      <p className="text-sm mb-6" style={{ color: '#6b7280' }}>$0.005 flat per verification call, paid in SOL at live market price.</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[['wallet', 'Connect Phantom'], ['agent', 'Agent Pays']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className="p-4 rounded-xl border text-sm font-medium transition-all"
            style={{ border: mode === m ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)', background: mode === m ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.03)', color: mode === m ? '#00ff88' : '#9ca3af' }}>
            {label}
          </button>
        ))}
      </div>
      {mode === 'wallet' ? (
        <div className="space-y-4">
          {walletConnected ? (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Phantom Wallet Connected</p>
                <p className="text-xs font-mono mt-0.5 truncate" style={{ color: '#00ff88' }}>{walletAddress}</p>
              </div>
            </div>
          ) : (
            <button onClick={connectPhantom}
              className="w-full py-3.5 rounded-xl font-semibold text-sm border transition-all hover:bg-white/5 flex items-center justify-center gap-2"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#e8eaf0' }}>
              🟣 Connect Phantom Wallet
            </button>
          )}
          {walletError && (
            <p className="text-xs mt-1" style={{ color: '#f87171' }}>{walletError}</p>
          )}
          <p className="text-xs" style={{ color: '#4b5563' }}>Your wallet pays the $0.005 per verification fee automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#9ca3af' }}>Your agent can pay fees automatically by including its Solana wallet in API calls.</p>
          <InputField label="Agent Wallet Address" value={agentWallet} onChange={setAgentWallet} placeholder="Agent's Solana wallet address" helper="We accept payment at the time of each verification call" />
        </div>
      )}
      <button onClick={() => onNext({ paymentMode: mode, walletAddress: walletConnected ? walletAddress : agentWallet })}
        className="mt-8 w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
        style={{ background: '#00ff88', color: '#0a0a0f' }}>
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function StepPersona({ onFinish }) {
  const personas = [
    {
      id: 'developer',
      icon: Code,
      title: 'Developer',
      description: 'Technical UI with code snippets, JSON data, and API references',
      gradient: 'from-emerald-500/20 to-emerald-900/20',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      btnColor: '#00ff88',
    },
    {
      id: 'business',
      icon: Briefcase,
      title: 'Business Owner',
      description: 'Clean fintech UI with charts, dollar amounts, and status badges',
      gradient: 'from-amber-500/20 to-amber-900/20',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      btnColor: '#f59e0b',
    },
    {
      id: 'personal',
      icon: Eye,
      title: 'Observer',
      description: 'Plain-English summaries of what was verified, what was flagged, and why it matters — no technical jargon',
      gradient: 'from-violet-500/20 to-violet-900/20',
      border: 'border-violet-500/30',
      iconColor: 'text-violet-400',
      btnColor: '#a78bfa',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-bold text-white mb-2">Choose Your Experience</h2>
      <p className="text-sm mb-8" style={{ color: '#6b7280' }}>Pick the UI style that fits you best. You can change this anytime.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {personas.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFinish(p.id)}
            className={`relative group text-left p-6 rounded-2xl border ${p.border} bg-gradient-to-br ${p.gradient} backdrop-blur-sm transition-all duration-300 flex flex-col`}
          >
            <p.icon className={`w-7 h-7 ${p.iconColor} mb-4`} />
            <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6 flex-1">{p.description}</p>
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: p.btnColor }}>
              <span>Select</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { setPersona } = usePersona();

  const handleAgentDone = (data) => setStep(1);
  const handlePaymentDone = (data) => setStep(2);
  const handlePersonaDone = (personaId) => {
    setPersona(personaId);
    localStorage.setItem('pov-oracle-onboarded', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8 sm:py-16 overflow-x-hidden" style={{ background: '#0a0a0f' }}>
      <div className={`w-full ${step === 2 ? 'max-w-3xl' : 'max-w-lg'} px-0`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="32" height="32" className="shrink-0">
                <circle cx="90" cy="90" r="70" fill="none" stroke="#22c55e" strokeWidth="4"/>
                <circle cx="90" cy="90" r="57" fill="none" stroke="#22c55e" strokeWidth="0.75"/>
                <circle cx="52" cy="70" r="4.5" fill="#22c55e" fillOpacity="0.3"/>
                <circle cx="56" cy="84" r="4.5" fill="#22c55e" fillOpacity="0.3"/>
                <circle cx="51" cy="98" r="4.5" fill="#22c55e" fillOpacity="0.3"/>
                <circle cx="55" cy="112" r="4.5" fill="#22c55e" fillOpacity="0.3"/>
                <line x1="57" y1="70" x2="74" y2="82" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.45"/>
                <line x1="61" y1="84" x2="74" y2="84" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.55"/>
                <line x1="56" y1="98" x2="74" y2="86" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.45"/>
                <line x1="60" y1="112" x2="74" y2="88" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.35"/>
                <line x1="77" y1="86" x2="100" y2="86" stroke="#22c55e" strokeWidth="3"/>
                <circle cx="113" cy="86" r="14" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
                <circle cx="113" cy="86" r="6" fill="#22c55e"/>
                <line x1="139" y1="139" x2="176" y2="176" stroke="#22c55e" strokeWidth="10" strokeLinecap="round"/>
              </svg>
              <span className="text-lg font-bold text-white">PoV Oracle</span>
            </div>
            <p className="text-sm mt-3" style={{ color: '#6b7280' }}>Let's get you set up</p>
          </div>
          <StepIndicator current={step} />
          <div className="p-8 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <AnimatePresence mode="wait">
              {step === 0 && <StepAgent key="agent" onNext={handleAgentDone} />}
              {step === 1 && <StepPayment key="payment" onNext={handlePaymentDone} />}
              {step === 2 && <StepPersona key="persona" onFinish={handlePersonaDone} />}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}