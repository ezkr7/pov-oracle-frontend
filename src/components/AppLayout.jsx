import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TutorialOverlay from './TutorialOverlay';
import PersonaSelector from './PersonaSelector';
import OracleAssistant from './OracleAssistant';
import PersonaTabBar from './PersonaTabBar';
import { usePersona } from '@/lib/PersonaContext';

export default function AppLayout() {
  const { persona, setPersona } = usePersona();
  const location = useLocation();
  const navigate = useNavigate();
  const welcomeShown = useRef(false);

  useEffect(() => {
    if (!persona) {
      // Check if onboarded — if not, send to onboarding
      const onboarded = localStorage.getItem('pov-oracle-onboarded');
      if (!onboarded) {
        navigate('/onboarding');
        return;
      }
    }
    // Show welcome back toast for returning users
    if (persona && !welcomeShown.current) {
      welcomeShown.current = true;
      try {
        const userData = JSON.parse(localStorage.getItem('pov-oracle-user') || '{}');
        const name = userData.name?.split(' ')[0];
        if (name) {
          // Simple toast via DOM — avoid importing toast to keep it lightweight
          const el = document.createElement('div');
          el.textContent = `Welcome back, ${name} 👋`;
          el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a2e;border:1px solid rgba(0,255,136,0.3);color:#fff;padding:10px 20px;border-radius:12px;font-size:14px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 3000);
        }
      } catch {}
    }
  }, [persona, navigate]);

  if (!persona) {
    return <PersonaSelector />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Header />
      {/* Extra bottom padding on mobile/tablet to clear the fixed tab bar */}
      <main className="pb-0 lg:pb-0">
        <div className="pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <TutorialOverlay />
      <OracleAssistant />
      <PersonaTabBar />
    </div>
  );
}