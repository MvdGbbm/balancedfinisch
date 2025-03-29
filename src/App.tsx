
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Meditations from './pages/Meditations';
import Breathing from './pages/Breathing';
import Music from './pages/Music';
import Soundscapes from './pages/Soundscapes';
import Journal from './pages/Journal';
import DailyQuote from './pages/DailyQuote';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/theme-provider';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="balanced-mind-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/meditations" element={<Meditations />} />
          <Route path="/breathing" element={<Breathing />} />
          <Route path="/music" element={<Music />} />
          <Route path="/soundscapes" element={<Soundscapes />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/daily-quote" element={<DailyQuote />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default App;
