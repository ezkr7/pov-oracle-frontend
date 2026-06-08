import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus, Trash2, Settings } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';

const STATUS_COLORS = {
  developer: { active: '#00ff88', pending: '#fbbf24', suspended: '#ef4444' },
  business:  { active: '#f59e0b', pending: '#fbbf24', suspended: '#ef4444' },
  personal:  { active: '#a78bfa', pending: '#c4b5fd', suspended: '#ef4444' },
};

const ROLE_EMOJI = { buyer: '🛒', seller: '🏪', both: '🔄' };

function loadAgents() {
  try {
    const stored = JSON.parse(localStorage.getItem('pov-oracle-agents') || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveAgents(agents) {
  localStorage.setItem('pov-oracle-agents', JSON.stringify(agents));
}

export default function AgentDropdown() {
  const { persona } = usePersona();
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const ref = useRef(null);

  const refresh = () => {
    const list = loadAgents();
    setAgents(list);
    setSelected((prev) => {
      if (!prev) return list[0] ?? null;
      const still = list.find((a) => a.id === prev.id);
      return still ?? list[0] ?? null;
    });
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (open) refresh(); }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setConfirmDelete(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!persona) return null;

  const colors = STATUS_COLORS[persona] || STATUS_COLORS.developer;
  const dotColor = (status) => colors[status] || '#4b5563';
  const isMono = persona === 'developer';
  const addAgentLabel = persona === 'personal' ? '➕ Connect another agent' : '+ Add Agent';
  const addAgentColor = persona === 'business' ? '#f59e0b' : persona === 'personal' ? '#a78bfa' : undefined;

  const handleDelete = (agentId) => {
    const updated = agents.filter((a) => a.id !== agentId);
    saveAgents(updated);
    setAgents(updated);
    setConfirmDelete(null);
    if (selected?.id === agentId) {
      setSelected(updated[0] ?? null);
    }
  };

  const displayName = (agent) => {
    if (persona === 'personal') return `${ROLE_EMOJI[agent.role] || ''} ${agent.nickname}`;
    return agent.nickname;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 min-h-[44px] rounded-lg text-sm transition-colors hover:bg-secondary ${isMono ? 'font-mono' : 'font-sans'}`}
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {selected && (
          <span className="w-2 h-2 rounded-full shrink-0"
            style={{ background: dotColor(selected.status) }} />
        )}
        <span className="text-foreground font-medium max-w-[80px] sm:max-w-[120px] truncate">
          {selected ? displayName(selected) : 'Select Agent'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>

          {agents.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-muted-foreground">
              No agents yet.
            </div>
          ) : (
            <div className="p-1.5 max-h-64 overflow-y-auto">
              {agents.map((agent) => (
                <div key={agent.id} className={`flex items-center gap-1 rounded-lg transition-colors ${selected?.id === agent.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                  {/* Main select area */}
                  <button
                    onClick={() => { setSelected(agent); setOpen(false); setConfirmDelete(null); }}
                    className="flex-1 flex items-start gap-2.5 px-3 py-2.5 text-left min-w-0"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ background: dotColor(agent.status) }} />
                    <div className="min-w-0">
                      {persona === 'developer' ? (
                        <>
                          <p className="text-sm font-medium text-foreground font-mono truncate">{agent.nickname}</p>
                          <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">{agent.id}</p>
                        </>
                      ) : persona === 'business' ? (
                        <>
                          <p className="text-sm font-bold text-foreground truncate">{agent.nickname}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{agent.role}</p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">
                          {ROLE_EMOJI[agent.role] || ''} {agent.nickname}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Action buttons */}
                  <div className="flex items-center gap-0.5 pr-2 shrink-0">
                    <Link to="/add-agent" onClick={() => setOpen(false)}
                      title="Edit agent"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Settings className="w-3.5 h-3.5" />
                    </Link>
                    {confirmDelete === agent.id ? (
                      <button
                        onClick={() => handleDelete(agent.id)}
                        title="Confirm delete"
                        className="px-2 py-1 rounded-md text-xs font-semibold transition-colors"
                        style={{ background: '#ef4444', color: '#fff' }}>
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(agent.id); }}
                        title="Remove agent"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-secondary transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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
