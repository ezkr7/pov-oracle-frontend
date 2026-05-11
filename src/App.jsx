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

const PUBLIC_PATHS = ['/', '/landing', '/signup', '/login', '/onboarding', '/add-agent'];

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  // Always render public routes immediately — no auth gate
  if (isPublic) {
    return (
      <PersonaProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/signup" element={<RedirectToLogin next="/onboarding" />} />
          <Route path="/login" element={<RedirectToLogin next="/dashboard" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/add-agent" element={<AddAgent />} />
        </Routes>
      </PersonaProvider>
    );
  }

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
        {/* App routes */}
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
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App