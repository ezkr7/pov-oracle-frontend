import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePersona } from '@/lib/PersonaContext';

export default function Footer() {
  const { setShowTutorial, setTutorialDone } = usePersona();

  const replayTutorial = () => {
    setTutorialDone(false);
    setShowTutorial(true);
  };

  return (
    <footer className="border-t border-border/50 mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          <span>PoV Oracle — AI Agent Notary & Escrow</span>
        </div>
        <Button variant="ghost" size="sm" onClick={replayTutorial} className="text-muted-foreground gap-2">
          <HelpCircle className="w-4 h-4" />
          Replay Tutorial
        </Button>
      </div>
    </footer>
  );
}