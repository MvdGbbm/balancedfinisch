
import React from "react";
import { useTheme } from "./theme-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Lock, FileMusic, Quote, Home, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Frontend" },
    { path: "/admin", icon: Lock, label: "Admin" },
    { path: "/admin/meditations", icon: FileMusic, label: "Meditaties" },
    { path: "/admin/soundscapes", icon: FileMusic, label: "Geluiden" },
    { path: "/admin/music", icon: Music, label: "Muziek" },
    { path: "/admin/quotes", icon: Quote, label: "Quotes" },
  ];

  return (
    <div className={cn("flex flex-col min-h-screen w-full bg-background", className)}>
      <header className="sticky top-0 z-40 w-full glass-morphism border-b py-3 px-4 backdrop-blur-lg transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-medium">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="sticky top-16 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
        <nav className="flex overflow-x-auto p-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 mr-2", 
                location.pathname === item.path && "bg-secondary text-foreground"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
      
      <main className="flex-1 px-4 py-4 overflow-auto animate-fade-in">
        {children}
      </main>
    </div>
  );
}
