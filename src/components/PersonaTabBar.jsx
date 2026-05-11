import React from 'react';
import { motion } from 'framer-motion';
import { Code, Briefcase, Eye } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';

const tabs = [
  {
    id: 'developer',
    icon: Code,
    label: 'Dev',
    activeColor: '#00ff88',
    activeBg: 'rgba(0,255,136,0.12)',
  },
  {
    id: 'business',
    icon: Briefcase,
    label: 'Biz',
    activeColor: '#f59e0b',
    activeBg: 'rgba(245,158,11,0.12)',
  },
  {
    id: 'personal',
    icon: Eye,
    label: 'Observer',
    activeColor: '#a78bfa',
    activeBg: 'rgba(167,139,250,0.12)',
  },
];

export default function PersonaTabBar() {
  const { persona, setPersona } = usePersona();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: 'hsl(var(--background))',
        borderTop: '1px solid hsl(var(--border))',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = persona === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setPersona(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] relative transition-colors"
              style={{
                background: active ? tab.activeBg : 'transparent',
              }}
            >
              {active && (
                <motion.div
                  layoutId="tab-bar-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{ background: tab.activeColor }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className="w-5 h-5 transition-colors"
                style={{ color: active ? tab.activeColor : 'hsl(var(--muted-foreground))' }}
              />
              <span
                className="text-[10px] font-semibold tracking-wide transition-colors"
                style={{ color: active ? tab.activeColor : 'hsl(var(--muted-foreground))' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}