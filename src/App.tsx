import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileLayout } from "@/components/mobile-layout";
import { AppProvider } from "@/context/AppContext";
import { Toast } from "@/components/ui/toast";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";

const Index = lazy(() => import("./pages/Index"));
const DailyQuote = lazy(() => import("./pages/DailyQuote"));
const Meditations = lazy(() => import("./pages/Meditations"));
const Music = lazy(() => import("./pages/Music"));
const Soundscapes = lazy(() => import("./pages/Soundscapes"));
const Breathing = lazy(() => import("./pages/Breathing"));
const Journal = lazy(() => import("./pages/Journal"));
const Planner = lazy(() => import("./pages/Planner"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminMeditations = lazy(() => import("./pages/Admin/Meditations"));
const AdminQuotes = lazy(() => import("./pages/Admin/Quotes"));
const AdminSoundscapes = lazy(() => import("./pages/Admin/Soundscapes"));
const AdminMusic = lazy(() => import("./pages/Admin/Music"));
const AdminStreams = lazy(() => import("./pages/Admin/Streams"));
const AdminBreathing = lazy(() => import("./pages/Admin/Breathing"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Voeg de nieuwe MusicUpload pagina toe aan de import
import MusicUpload from "./pages/MusicUpload";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="calm-app-theme">
      <AppProvider>
        <AudioPlayerProvider>
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
                
                  {/* Voeg de nieuwe route toe */}
                  <Route path="/music-upload" element={<MusicUpload />} />
                
                  {/* Admin routes */}
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/meditations" element={<AdminMeditations />} />
                  <Route path="/admin/quotes" element={<AdminQuotes />} />
                  <Route path="/admin/soundscapes" element={<AdminSoundscapes />} />
                  <Route path="/admin/music" element={<AdminMusic />} />
                  <Route path="/admin/streams" element={<AdminStreams />} />
                  <Route path="/admin/breathing" element={<AdminBreathing />} />
                
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </MobileLayout>
          </Router>
          <Toast />
        </AudioPlayerProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
