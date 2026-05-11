import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, Lock, Award, CheckCircle, Menu, X } from 'lucide-react';
import PersonaSwitcher from './PersonaSwitcher';
import { usePersona } from '@/lib/PersonaContext';
import { useApiStatus } from '@/lib/useApiStatus';
import ConnectionStatus from './ConnectionStatus';
import SolTicker from './SolTicker';
import AgentDropdown from './AgentDropdown';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Activity },
  { path: '/transactions', label: 'Transactions', icon: Shield },
  { path: '/escrow', label: 'Escrow', icon: Lock },
  { path: '/certificates', label: 'Certificates', icon: Award },
  { path: '/verify', label: 'Verify', icon: CheckCircle },
];

export default function Header() {
  const location = useLocation();
  const { persona, term } = usePersona();
  const { connectionStatus, lastElapsed, quote, quoteHistory } = useApiStatus();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getNavLabel = (item) => {
    if (persona === 'personal') {
      if (item.label === 'Transactions') return '🔍 ' + term('verifications');
      if (item.label === 'Escrow') return '🔒 ' + term('escrows');
      if (item.label === 'Certificates') return '📜 ' + term('certificates');
      if (item.label === 'Verify') return '✅ Verify';
      if (item.label === 'Dashboard') return '🏠 Home';
    }
    return item.label;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Logo + Agent Dropdown */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <AgentDropdown />
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
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
              <span className="text-base font-bold tracking-tight whitespace-nowrap">PoV Oracle</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav id="main-nav" className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{getNavLabel(item)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop: connection status + sol ticker + persona switcher */}
            <div className="hidden lg:flex items-center gap-2">
              <ConnectionStatus connectionStatus={connectionStatus} lastElapsed={lastElapsed} />
              <SolTicker quote={quote} quoteHistory={quoteHistory} />
            </div>

            {/* Persona switcher — desktop only */}
            <div className="hidden lg:block">
              <PersonaSwitcher />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border py-2 space-y-0.5"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {getNavLabel(item)}
              </Link>
            ))}
            {/* Connection status + SOL ticker in mobile menu */}
            <div className="flex items-center gap-3 px-3 py-2">
              <ConnectionStatus connectionStatus={connectionStatus} lastElapsed={lastElapsed} />
              <SolTicker quote={quote} quoteHistory={quoteHistory} />
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}