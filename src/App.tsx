
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileLayout } from "@/components/mobile-layout";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";

const Index = lazy(() => import("./pages/Index"));
const DailyQuote = lazy(() => import("./pages/DailyQuote"));
const Meditations = lazy(() => import("./pages/Meditations"));
const Music = lazy(() => import("./pages/Music"));
const Soundscapes = lazy(() => import("./pages/Soundscapes"));
const Breathing = lazy(() => import("./pages/Breathing"));
const Journal = lazy(() => import("./pages/Journal"));
const Planner = lazy(() => import("./pages/Planner"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Import MusicUpload page
import MusicUpload from "./pages/MusicUpload";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="calm-app-theme">
      <AppProvider>
        <Router>
          <MobileLayout>
            <Suspense fallback={<div>Loading...</div>}>
              {/* Main Routes */}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/daily-quote" element={<DailyQuote />} />
                <Route path="/meditations" element={<Meditations />} />
                <Route path="/music" element={<Music />} />
                <Route path="/soundscapes" element={<Soundscapes />} />
                <Route path="/breathing" element={<Breathing />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/planner" element={<Planner />} />
              
                {/* Music Upload route */}
                <Route path="/music-upload" element={<MusicUpload />} />
              
                {/* Admin root route */}
                <Route path="/admin" element={<Admin />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </MobileLayout>
          <Toaster />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
