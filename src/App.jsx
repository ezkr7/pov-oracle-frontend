import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { PersonaProvider } from '@/lib/PersonaContext';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Escrow from '@/pages/Escrow';
import Certificates from '@/pages/Certificates';
import Verify from '@/pages/Verify';
import Landing from '@/pages/Landing';
import Onboarding from '@/pages/Onboarding';
import AddAgent from '@/pages/AddAgent';

function RedirectToLogin({ next }) {
  useEffect(() => {
    base44.auth.redirectToLogin(next);
  }, [next]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );
}

/** Normalize pathname so `/` and `/landing` match regardless of trailing slash. */
function isPublicLandingPath(pathname) {
  const p = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return p === '/' || p === '/landing';
}

/**
 * Landing only: no useAuth() — renders immediately without Base44 auth / public-settings wait.
 */
function PublicLandingShell() {
  return (
    <PersonaProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
      </Routes>
    </PersonaProvider>
  );
}

/**
 * Everything except `/` and `/landing`: auth + public settings gate, then protected app routes.
 */
function AuthGatedApp() {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <PersonaProvider>
      <Routes>
        <Route path="/signup" element={<RedirectToLogin next="/onboarding" />} />
        <Route path="/login" element={<RedirectToLogin next="/dashboard" />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/add-agent" element={<AddAgent />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/escrow" element={<Escrow />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/verify" element={<Verify />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PersonaProvider>
  );
}

function RouterShell() {
  const location = useLocation();
  if (isPublicLandingPath(location.pathname)) {
    return <PublicLandingShell />;
  }
  return <AuthGatedApp />;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <RouterShell />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
