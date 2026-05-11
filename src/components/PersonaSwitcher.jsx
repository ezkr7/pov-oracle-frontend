import React from 'react';
import { motion } from 'framer-motion';
import { Code, Briefcase, Eye } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';

const options = [
  { id: 'developer', icon: Code, label: 'Dev' },
  { id: 'business', icon: Briefcase, label: 'Biz' },
  { id: 'personal', icon: Eye, label: 'Observer' },
];

export default function PersonaSwitcher() {
  const { persona, setPersona } = usePersona();

  return (
    <div id="persona-switcher" className="flex items-center bg-secondary rounded-full p-1 gap-0.5">
      {options.map((opt) => {
        const active = persona === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setPersona(opt.id)}
            title={opt.label}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-medium transition-colors duration-200 ${
              active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {active && (
              <motion.div
                layoutId="persona-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <opt.icon className="w-3.5 h-3.5 relative z-10 shrink-0" />
            <span className="relative z-10 hidden sm:inline whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}