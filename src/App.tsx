
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Breathing from "./pages/Breathing";
import Meditations from "./pages/Meditations";
import Soundscapes from "./pages/Soundscapes";
import Music from "./pages/Music";
import Journal from "./pages/Journal";
import Planner from "./pages/Planner";
import DailyQuote from "./pages/DailyQuote";

// Admin routes
import Admin from "./pages/Admin";
import AdminMeditations from "./pages/admin/Meditations";
import AdminQuotes from "./pages/admin/Quotes";
import AdminSoundscapes from "./pages/admin/Soundscapes";
import AdminMusic from "./pages/admin/Music";
import AdminStreams from "./pages/admin/Streams";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Index />} />
      <Route path="/meditations" element={<Meditations />} />
      <Route path="/breathing" element={<Breathing />} />
      <Route path="/music" element={<Music />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/soundscapes" element={<Soundscapes />} />
      <Route path="/daily-quote" element={<DailyQuote />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/meditations" element={<AdminMeditations />} />
      <Route path="/admin/quotes" element={<AdminQuotes />} />
      <Route path="/admin/soundscapes" element={<AdminSoundscapes />} />
      <Route path="/admin/music" element={<AdminMusic />} />
      <Route path="/admin/streams" element={<AdminStreams />} />
      <Route path="*" element={<NotFound />} />
    </>
  )
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="balanced-mind-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
