
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

// Import admin pages
import AdminStreams from './pages/admin/Streams';
import AdminQuotes from './pages/admin/Quotes';
import AdminSoundscapes from './pages/admin/Soundscapes';
import AdminMeditations from './pages/admin/Meditations';
import AdminMusic from './pages/admin/Music';
import AdminBreathing from './pages/admin/Breathing';

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
          
          {/* Admin routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/streams" element={<AdminStreams />} />
          <Route path="/admin/quotes" element={<AdminQuotes />} />
          <Route path="/admin/soundscapes" element={<AdminSoundscapes />} />
          <Route path="/admin/meditations" element={<AdminMeditations />} />
          <Route path="/admin/music" element={<AdminMusic />} />
          <Route path="/admin/breathing" element={<AdminBreathing />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default App;
