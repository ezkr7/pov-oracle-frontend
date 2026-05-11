import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Briefcase, Heart, ArrowRight } from 'lucide-react';
import { usePersona } from '@/lib/PersonaContext';

const personas = [
  {
    id: 'developer',
    icon: Code,
    title: 'Developer',
    description: 'Technical UI with code snippets, JSON data, and API references',
    gradient: 'from-emerald-500/20 to-emerald-900/20',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'business',
    icon: Briefcase,
    title: 'Business Owner',
    description: 'Clean fintech UI with charts, dollar amounts, and status badges',
    gradient: 'from-amber-500/20 to-amber-900/20',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  {
    id: 'personal',
    icon: Heart,
    title: 'Non-Technical',
    description: 'Friendly UI with plain English explanations and step-by-step guides',
    gradient: 'from-violet-500/20 to-violet-900/20',
    border: 'border-violet-500/30',
    iconColor: 'text-violet-400',
  },
];

export default function PersonaSelector() {
  const { setPersona, setShowTutorial, tutorialDone } = usePersona();

  const handleSelect = (id) => {
    setPersona(id);
    if (!tutorialDone) {
      setTimeout(() => setShowTutorial(true), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
    >
      <div className="max-w-4xl w-full px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">PoV Oracle</h1>
          </div>
          <p className="text-gray-400 text-lg">Choose your experience</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(p.id)}
              className={`relative group text-left p-8 rounded-2xl border ${p.border} bg-gradient-to-br ${p.gradient} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl`}
            >
              <p.icon className={`w-8 h-8 ${p.iconColor} mb-4`} />
              <h3 className="text-xl font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{p.description}</p>
              <div className={`flex items-center gap-2 ${p.iconColor} text-sm font-medium`}>
                <span>Select</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}