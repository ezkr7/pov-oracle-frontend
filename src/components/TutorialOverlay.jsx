import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersona } from '@/lib/PersonaContext';

const steps = [
  {
    target: '#hero-cards',
    title: 'Your Dashboard at a Glance',
    description: 'These three cards show your latest verifications, active escrows, and issued certificates. Click any card to see the full history.',
    position: 'bottom',
  },
  {
    target: '#persona-switcher',
    title: 'Switch Your View Anytime',
    description: 'Toggle between Developer, Business, and Non-Technical views. Each one adapts the entire interface to your preference.',
    position: 'bottom',
  },
  {
    target: '#fee-badge',
    title: 'Live Transaction Fee',
    description: 'This shows the current cost of a verification — just $0.03 in SOL. It refreshes every 30 seconds from live market data.',
    position: 'bottom',
  },
  {
    target: '#main-nav',
    title: 'Navigate the Platform',
    description: 'Dashboard gives you the overview. Transactions shows verification history. Escrow manages payment holds. Certificates shows proofs. Verify lets you check any certificate.',
    position: 'bottom',
  },
];

export default function TutorialOverlay() {
  const { showTutorial, setShowTutorial, setTutorialDone } = usePersona();
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!showTutorial) return;
    const updateRect = () => {
      const el = document.querySelector(steps[step]?.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [step, showTutorial]);

  if (!showTutorial) return null;

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      setStep(step + 1);
    }
  };

  const finish = () => {
    setShowTutorial(false);
    setTutorialDone(true);
    setStep(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Overlay background */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Highlight cutout */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute border-2 border-primary rounded-xl z-10 pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7), 0 0 30px hsl(var(--primary) / 0.3)',
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute z-20 max-w-sm mx-4"
          style={{
            top: targetRect ? targetRect.bottom + 24 : '50%',
            left: targetRect ? Math.min(Math.max(targetRect.left, 16), window.innerWidth - 400) : '50%',
            transform: targetRect ? 'none' : 'translate(-50%, -50%)',
          }}
        >
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                Step {step + 1} of {steps.length}
              </span>
              <button onClick={finish} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {currentStep.description}
            </p>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground">
                Skip
              </Button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {isLast ? 'Finish' : 'Next'}
                  {!isLast && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}