import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';

export default function BusinessStats({ statusData }) {
  const { persona } = usePersona();
  if (persona !== 'business') return null;

  const stats = [
    {
      label: 'Fee per Verification',
      value: '$0.005 total',
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Payment Mode',
      value: (statusData?.payment_mode || 'solana').toUpperCase(),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Solana RPC',
      value: statusData?.solana_rpc_configured ? 'Connected' : 'Offline',
      icon: CheckCircle,
      color: statusData?.solana_rpc_configured ? 'text-emerald-400' : 'text-red-400',
      bg: statusData?.solana_rpc_configured ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
    {
      label: 'Ed25519 Key',
      value: statusData?.ed25519_key_configured ? 'Configured' : 'Missing',
      icon: statusData?.ed25519_key_configured ? CheckCircle : AlertTriangle,
      color: statusData?.ed25519_key_configured ? 'text-emerald-400' : 'text-amber-400',
      bg: statusData?.ed25519_key_configured ? 'bg-emerald-400/10' : 'bg-amber-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-lg font-bold">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}