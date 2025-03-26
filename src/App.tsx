
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Meditations from "./pages/Meditations";
import Breathing from "./pages/Breathing";
import Planner from "./pages/Planner";
import Journal from "./pages/Journal";
import Soundscapes from "./pages/Soundscapes";
import DailyQuote from "./pages/DailyQuote";
import Admin from "./pages/Admin";
import AdminMeditations from "./pages/admin/Meditations";
import AdminSoundscapes from "./pages/admin/Soundscapes";
import AdminQuotes from "./pages/admin/Quotes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="balanced-mind-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/meditations" element={<Meditations />} />
            <Route path="/breathing" element={<Breathing />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/soundscapes" element={<Soundscapes />} />
            <Route path="/daily-quote" element={<DailyQuote />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/meditations" element={<AdminMeditations />} />
            <Route path="/admin/soundscapes" element={<AdminSoundscapes />} />
            <Route path="/admin/quotes" element={<AdminQuotes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
