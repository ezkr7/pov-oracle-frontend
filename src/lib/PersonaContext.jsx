import React, { createContext, useContext, useState, useEffect } from 'react';

const PersonaContext = createContext(null);

const PERSONA_KEY = 'pov-oracle-persona';
const TUTORIAL_KEY = 'pov-oracle-tutorial-done';
const ONBOARDED_KEY = 'pov-oracle-onboarded';

const personaLabels = {
  developer: 'Developer',
  business: 'Business Owner',
  personal: 'Observer',
};

const personaTerms = {
  developer: {
    verification: 'Verification',
    escrow: 'Escrow',
    certificate: 'Certificate',
    hallucination: 'Hallucination Detection',
    verifications: 'Verifications',
    escrows: 'Escrows',
    certificates: 'Certificates',
  },
  business: {
    verification: 'Verification',
    escrow: 'Escrow',
    certificate: 'Certificate',
    hallucination: 'Hallucination Detection',
    verifications: 'Verifications',
    escrows: 'Escrows',
    certificates: 'Certificates',
  },
  personal: {
    verification: 'Verification',
    escrow: 'Held Payment',
    certificate: 'Proof Record',
    hallucination: 'Flagged Issue',
    verifications: 'Verifications',
    escrows: 'Held Payments',
    certificates: 'Proof Records',
  },
};

export function PersonaProvider({ children }) {
  const [persona, setPersonaState] = useState(() => {
    return localStorage.getItem(PERSONA_KEY) || null;
  });
  const [tutorialDone, setTutorialDoneState] = useState(() => {
    return localStorage.getItem(TUTORIAL_KEY) === 'true';
  });
  const [showTutorial, setShowTutorial] = useState(false);

  const setPersona = (p) => {
    localStorage.setItem(PERSONA_KEY, p);
    setPersonaState(p);
    document.documentElement.setAttribute('data-persona', p);
  };

  const setTutorialDone = (done) => {
    localStorage.setItem(TUTORIAL_KEY, String(done));
    setTutorialDoneState(done);
  };

  useEffect(() => {
    if (persona) {
      document.documentElement.setAttribute('data-persona', persona);
    }
  }, [persona]);

  const term = (key) => {
    if (!persona) return personaTerms.developer[key] || key;
    return personaTerms[persona]?.[key] || key;
  };

  return (
    <PersonaContext.Provider value={{
      persona,
      setPersona,
      personaLabels,
      term,
      tutorialDone,
      setTutorialDone,
      showTutorial,
      setShowTutorial,
    }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}