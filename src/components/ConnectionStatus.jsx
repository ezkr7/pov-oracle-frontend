import React from 'react';
import { motion } from 'framer-motion';
import { usePersona } from '@/lib/PersonaContext';

export default function ConnectionStatus({ connectionStatus, lastElapsed }) {
  const { persona } = usePersona();

  const labels = {
    developer: { online: 'Online', connecting: 'Connecting...', offline: 'Offline' },
    business:  { online: 'Online', connecting: 'Connecting...', offline: 'Offline' },
    personal:  { online: 'Connected', connecting: 'Getting ready...', offline: 'Offline' },
  };

  const l = labels[persona] || labels.developer;

  const dotClass =
    connectionStatus === 'online'
      ? 'bg-emerald-400 animate-pulse'
      : connectionStatus === 'connecting'
      ? 'bg-yellow-400 animate-pulse'
      : 'bg-red-400';

  const text =
    connectionStatus === 'online'
      ? l.online
      : connectionStatus === 'connecting'
      ? l.connecting
      : l.offline;

  return (
    <motion.div
      className="flex items-center gap-1.5"
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`w-2 h-2 rounded-full ${dotClass}`} />
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {text}
        {persona === 'developer' && connectionStatus === 'online' && lastElapsed != null && (
          <span className="ml-1 opacity-60">· {lastElapsed}ms</span>
        )}
      </span>
    </motion.div>
  );
}