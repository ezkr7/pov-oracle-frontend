import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
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

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <PersonaProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/signup" element={<Onboarding />} />
            <Route path="/login" element={<Dashboard />} />
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
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
