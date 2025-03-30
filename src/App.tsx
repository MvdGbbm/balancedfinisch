
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { AppProvider } from './context/AppContext';
import Index from './pages/Index';
import Meditations from './pages/Meditations';
import DailyQuote from './pages/DailyQuote';
import Journal from './pages/Journal';
import Planner from './pages/Planner';
import Breathing from './pages/Breathing';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import AdminMeditations from './pages/admin/Meditations';
import AdminBreathing from './pages/admin/Breathing';
import AdminQuotes from './pages/admin/Quotes';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppProvider>
          <Router>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/meditations" element={<Meditations />} />
                <Route path="/daily-quote" element={<DailyQuote />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/breathing" element={<Breathing />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/meditations" element={<AdminMeditations />} />
                <Route path="/admin/breathing" element={<AdminBreathing />} />
                <Route path="/admin/quotes" element={<AdminQuotes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
