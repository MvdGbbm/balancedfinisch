
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Breathing from "./pages/Breathing";
import Meditations from "./pages/Meditations";
import Journal from "./pages/Journal";
import Planner from "./pages/Planner";
import DailyQuote from "./pages/DailyQuote";

// Admin routes
import Admin from "./pages/Admin";
import AdminMeditations from "./pages/admin/Meditations";
import AdminQuotes from "./pages/admin/Quotes";
import AdminStreams from "./pages/admin/Streams";
import AdminBreathing from "./pages/admin/Breathing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Define the visible routes for navigation
const mainRoutes = [
  { path: "/", element: <Index /> },
  { path: "/meditations", element: <Meditations /> },
  { path: "/breathing", element: <Breathing /> },
  { path: "/journal", element: <Journal /> },
  { path: "/daily-quote", element: <DailyQuote /> },
  { path: "/admin", element: <Admin /> },
  { path: "*", element: <NotFound /> },
];

// Create the router with all routes including admin sub-routes (accessible but not shown in navigation)
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {mainRoutes.map((route) => (
        <Route 
          key={route.path} 
          path={route.path} 
          element={route.element} 
          errorElement={<ErrorBoundary />} 
        />
      ))}
      
      {/* Admin sub-routes - functional but not visible in navigation */}
      <Route path="/admin/meditations" element={<AdminMeditations />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/quotes" element={<AdminQuotes />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/streams" element={<AdminStreams />} errorElement={<ErrorBoundary />} />
      <Route path="/admin/breathing" element={<AdminBreathing />} errorElement={<ErrorBoundary />} />
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
