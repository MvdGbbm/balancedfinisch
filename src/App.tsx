
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Index />} errorElement={<ErrorBoundary />} />
      <Route path="/meditations" element={<Meditations />} errorElement={<ErrorBoundary />} />
      <Route path="/music" element={<Music />} errorElement={<ErrorBoundary />} />
      <Route path="/journal" element={<Journal />} errorElement={<ErrorBoundary />} />
      <Route path="/soundscapes" element={<Soundscapes />} errorElement={<ErrorBoundary />} />
      <Route path="/daily-quote" element={<DailyQuote />} errorElement={<ErrorBoundary />} />
      <Route path="/admin" element={<Admin />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/meditations" element={<AdminMeditations />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/quotes" element={<AdminQuotes />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/soundscapes" element={<AdminSoundscapes />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/music" element={<AdminMusic />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/streams" element={<AdminStreams />} errorElement={<ErrorBoundary />} />
      <Route path="*" element={<NotFound />} />
    </>
  )
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="balanced-mind-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
