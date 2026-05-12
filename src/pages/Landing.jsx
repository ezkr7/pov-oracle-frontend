import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Shield, Lock, Award, ArrowRight, ChevronRight, Zap, CheckCircle } from 'lucide-react';

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00ff88" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a0a0f]" 
           style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,255,136,0.08) 0%, transparent 70%)' }} />
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  const handleLogin = () => {
    navigate('/dashboard');
  };

  const handleSignUp = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e8eaf0' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
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
            <span className="text-lg font-bold tracking-tight text-white">PoV Oracle</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleLogin}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Log In
            </button>
            <button onClick={handleSignUp}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: '#00ff88', color: '#0a0a0f' }}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <AnimatedGrid />
        <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-400 mb-8"
                 style={{ background: 'rgba(0,255,136,0.05)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
              Powered by Solana & BGaurded
            </div>
          </motion.div>

          {/* Full wordmark logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="flex justify-center mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="280" height="112" className="max-w-full">
              <circle cx="90" cy="90" r="64" fill="none" stroke="#22c55e" strokeWidth="3.5"/>
              <circle cx="90" cy="90" r="52" fill="none" stroke="#22c55e" strokeWidth="0.75"/>
              <circle cx="52" cy="72" r="4" fill="#22c55e" fillOpacity="0.35"/>
              <circle cx="56" cy="86" r="4" fill="#22c55e" fillOpacity="0.35"/>
              <circle cx="51" cy="100" r="4" fill="#22c55e" fillOpacity="0.35"/>
              <circle cx="55" cy="114" r="4" fill="#22c55e" fillOpacity="0.35"/>
              <line x1="56" y1="72" x2="72" y2="84" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.45"/>
              <line x1="60" y1="86" x2="72" y2="86" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.55"/>
              <line x1="55" y1="100" x2="72" y2="88" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.45"/>
              <line x1="59" y1="114" x2="72" y2="90" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.35"/>
              <line x1="75" y1="87" x2="96" y2="87" stroke="#22c55e" strokeWidth="3"/>
              <circle cx="108" cy="87" r="13" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
              <circle cx="108" cy="87" r="5.5" fill="#22c55e"/>
              <line x1="135" y1="135" x2="168" y2="168" stroke="#22c55e" strokeWidth="9" strokeLinecap="round"/>
              <text x="180" y="76" fontFamily="system-ui, -apple-system, sans-serif" fontSize="42" fontWeight="500" fill="#ffffff" letterSpacing="1">PoV</text>
              <text x="180" y="124" fontFamily="system-ui, -apple-system, sans-serif" fontSize="42" fontWeight="500" fill="#ffffff" letterSpacing="1">Oracle</text>
              <line x1="180" y1="136" x2="480" y2="136" stroke="#22c55e" strokeWidth="1"/>
              <text x="180" y="154" fontFamily="ui-monospace, monospace" fontSize="11" fill="#22c55e" letterSpacing="5">VERIFICATION LAYER</text>
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
          >
            <span className="text-white">The Accountability Layer for</span>
            <br />
            <span className="relative inline-block" style={{
              background: 'linear-gradient(90deg, #00ff88, #00d4ff, #00ff88)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              AI Agent Commerce
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            AI agents are making real transactions with real money. PoV Oracle is the first accountability layer built for that world — a permanent, tamper-proof record that holds AI agents to the same standard as human counterparties.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={handleGetStarted}
              className="group px-7 py-3.5 rounded-xl font-semibold text-base flex items-center gap-2 transition-all hover:opacity-90 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: '#00ff88', color: '#0a0a0f', boxShadow: '0 0 30px rgba(0,255,136,0.25)' }}>
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="https://pov-oracle-production.up.railway.app/api/status" target="_blank" rel="noreferrer">
              <button className="px-7 py-3.5 rounded-xl font-semibold text-base border transition-all hover:bg-white/5 hover:border-white/20"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#e8eaf0' }}>
                View API Docs
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Benefit Cards */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Agent Accountability',
              desc: 'In a world where AI agents are making real transactions, accountability isn\'t optional. PoV Oracle creates a verified, on-chain record of every agent action — so there\'s always a source of truth.',
              color: '#00ff88',
              delay: 0,
            },
            {
              icon: Lock,
              title: 'Agentic Escrow',
              desc: 'Funds held on-chain and only released when cryptographic proof of delivery is confirmed by both parties.',
              color: '#00d4ff',
              delay: 0.1,
            },
            {
              icon: Award,
              title: 'Blockchain Notarization',
              desc: 'Every verified transaction gets a signed Ed25519 certificate anchored permanently to Solana via BGaurded.',
              color: '#a78bfa',
              delay: 0.2,
            },
          ].map((card) => (
            <FadeIn key={card.title} delay={card.delay}>
              <div className="group p-8 rounded-2xl border border-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
                   style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                     style={{ background: `${card.color}18` }}>
                  <card.icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <FadeIn>
        <section className="py-16 border-y border-white/5" style={{ background: 'rgba(0,255,136,0.03)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { value: '$0.005', label: 'per verification', sub: 'Flat fee per verification call — paid in SOL at live market price' },
                { value: 'Ed25519', label: 'signed', sub: 'Cryptographic proof on every certificate' },
                { value: 'BGaurded', label: 'powered', sub: 'Every certificate anchored to Solana and Arweave' },
              ].map((s) => (
                <div key={s.value} className="space-y-1">
                  <p className="text-3xl font-bold" style={{ color: '#00ff88' }}>{s.value}</p>
                  <p className="text-white font-semibold text-sm uppercase tracking-wider">{s.label}</p>
                  <p className="text-gray-500 text-sm">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* How It Works */}
      <section className="py-28 max-w-7xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Three steps. Seconds to integrate. Permanent proof.</p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent)' }} />
          {[
            { n: '01', title: 'Register Your Agent', desc: 'Your AI agent registers with PoV Oracle in seconds. We generate an agent ID or accept yours.', delay: 0 },
            { n: '02', title: 'Verify Before You Transact', desc: 'Before any transaction hits the blockchain, PoV Oracle independently checks both sides for hallucinated or false data.', delay: 0.1 },
            { n: '03', title: 'Certificate Issued', desc: 'A signed proof of verified transaction is issued and permanently anchored on chain. The end result isn\'t just a verified transaction — it\'s an accountable one. Anyone can audit it, forever.', delay: 0.2 },
          ].map((step) => (
            <FadeIn key={step.n} delay={step.delay}>
              <div className="relative p-8 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-5xl font-black mb-4" style={{ color: 'rgba(0,255,136,0.15)', fontVariantNumeric: 'tabular-nums' }}>{step.n}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built For Everyone in the Stack</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', role: 'Developers', desc: 'Integrate via REST API or our TypeScript SDK. Three endpoints. No API key. $0.005 flat per verification call, paid in SOL at live market price.', color: '#00ff88', delay: 0 },
              { icon: '📊', role: 'Business Owners', desc: 'Monitor all your AI agent transactions in one dashboard. Get email notifications for every verification and escrow event.', color: '#00d4ff', delay: 0.1 },
              { icon: '🤖', role: 'AI Agent Platforms', desc: 'Use PoV Oracle as your verification layer. BGaurded uses us to verify every agent log before it hits Arweave and Solana.', color: '#a78bfa', delay: 0.2 },
            ].map((item) => (
              <FadeIn key={item.role} delay={item.delay}>
                <div className="p-8 rounded-2xl border border-white/8 hover:border-white/15 transition-all hover:-translate-y-1 duration-300"
                     style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-3" style={{ color: item.color }}>{item.role}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <FadeIn>
        <section className="py-32 text-center max-w-4xl mx-auto px-6">
          <div className="p-16 rounded-3xl border border-white/8 relative overflow-hidden" style={{ background: 'rgba(0,255,136,0.04)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 60%)' }} />
            <h2 className="relative text-4xl sm:text-5xl font-bold text-white mb-6">
              Be part of the<br />
              <span style={{ color: '#00ff88' }}>accountability standard</span>
            </h2>
            <p className="relative text-gray-400 text-lg mb-10 max-w-lg mx-auto">Set the new standard for AI agent accountability. No setup fees. $0.005 flat per verification call, paid in SOL at live market price.</p>
            <button onClick={handleGetStarted}
              className="relative px-8 py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 hover:scale-[1.03]"
              style={{ background: '#00ff88', color: '#0a0a0f', boxShadow: '0 0 40px rgba(0,255,136,0.3)' }}>
              Get Started — No Setup Fees. Pay only for what you verify.
            </button>
          </div>
        </section>
      </FadeIn>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold">PoV Oracle</p>
            <p className="text-gray-500 text-sm mt-1">AI Agent Notary and Escrow Service</p>
            <p className="text-gray-600 text-xs mt-2">Powered by Solana and BGaurded</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="https://pov-oracle-production.up.railway.app/api/status" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">API Docs</a>
            <a href="https://pov-oracle-production.up.railway.app/api/status" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">API Status</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}