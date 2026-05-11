import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';

const STATUS_COLORS = {
  developer: { active: '#00ff88', pending: '#fbbf24', suspended: '#ef4444' },
  business:  { active: '#f59e0b', pending: '#fbbf24', suspended: '#ef4444' },
  personal:  { active: '#a78bfa', pending: '#c4b5fd', suspended: '#ef4444' },
};

const ROLE_EMOJI = { buyer: '🛒', seller: '🏪', both: '🔄' };

export default function AgentDropdown() {
  const { persona } = usePersona();
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pov-oracle-agents') || '[]');
    const list = stored.length > 0 ? stored : [
      { id: 'agent_demo001', nickname: 'Demo Buyer', role: 'buyer', status: 'active' },
    ];
    setAgents(list);
    setSelected(list[0]);
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!persona) return null;

  const colors = STATUS_COLORS[persona] || STATUS_COLORS.developer;

  const dotColor = (status) => colors[status] || '#4b5563';

  const isMono = persona === 'developer';
  const isFriendly = persona === 'personal';

  const addAgentLabel = persona === 'personal' ? '➕ Connect another agent' : '+ Add Agent';
  const addAgentColor = persona === 'business' ? '#f59e0b' : persona === 'personal' ? '#a78bfa' : undefined;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 min-h-[44px] rounded-lg text-sm transition-colors hover:bg-secondary ${isMono ? 'font-mono' : isFriendly ? 'font-friendly' : 'font-sans'}`}
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {selected && (
          <span className="w-2 h-2 rounded-full shrink-0"
            style={{ background: dotColor(selected.status) }} />
        )}
        <span className="text-foreground font-medium max-w-[80px] sm:max-w-[120px] truncate">
          {selected
            ? (persona === 'personal'
                ? `${ROLE_EMOJI[selected.role] || ''} ${selected.nickname}`
                : selected.nickname)
            : 'Select Agent'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
          <div className="p-1.5 max-h-60 overflow-y-auto">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => { setSelected(agent); setOpen(false); }}
                className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-secondary ${
                  selected?.id === agent.id ? 'bg-secondary' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                  style={{ background: dotColor(agent.status) }} />
                <div className="min-w-0">
                  {persona === 'developer' && (
                    <>
                      <p className="text-sm font-medium text-foreground font-mono truncate">{agent.nickname}</p>
                      <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">{agent.id}</p>
                    </>
                  )}
                  {persona === 'business' && (
                    <>
                      <p className="text-sm font-bold text-foreground truncate">{agent.nickname}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{agent.role}</p>
                    </>
                  )}
                  {persona === 'personal' && (
                    <p className="text-sm font-medium text-foreground font-friendly truncate">
                      {ROLE_EMOJI[agent.role] || ''} {agent.nickname}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-1.5">
            <Link to="/add-agent" onClick={() => setOpen(false)}>
              <button
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
                style={{ color: addAgentColor || undefined }}
              >
                {!addAgentColor && <Plus className="w-4 h-4" />}
                <span className={addAgentColor ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}>
                  {addAgentLabel}
                </span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}