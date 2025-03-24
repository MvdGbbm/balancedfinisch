import React from "react";
import { useTheme } from "./theme-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Home, Sunrise, Clock, BookOpen, Music, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  className?: string;
}

export function MobileLayout({
  children,
  showNav = true,
  className
}: MobileLayoutProps) {
  const {
    theme,
    setTheme
  } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [{
    path: "/",
    icon: Home,
    label: "Home"
  }, {
    path: "/meditations",
    icon: Sunrise,
    label: "Meditaties"
  }, {
    path: "/breathing",
    icon: Sunrise,
    label: "Ademhaling"
  }, {
    path: "/music",
    icon: Music,
    label: "Muziek"
  }, {
    path: "/journal",
    icon: BookOpen,
    label: "Dagboek"
  }, {
    path: "/soundscapes",
    icon: Music,
    label: "Geluiden"
  }, {
    path: "/daily-quote",
    icon: Quote,
    label: "Quote"
  }];

  return <div className={cn("flex flex-col min-h-screen w-full bg-background", className)}>
      <header className="sticky top-0 z-40 w-full glass-morphism border-b py-3 px-4 backdrop-blur-lg transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/public/logo.svg" alt="Balanced Mind" className="h-8 w-8" onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjRDMTguNjI3NCAyNCAyNCAxOC42Mjc0IDI0IDEyQzI0IDUuMzcyNTggMTguNjI3NCAwIDEyIDBDNS4zNzI1OCAwIDAgNS4zNzI1OCAwIDEyQzAgMTguNjI3NCA1LjM3MjU4IDI0IDEyIDI0WiIgZmlsbD0iIzNBQTBGRiIvPjxwYXRoIGQ9Ik0xMiAxOEM4LjY4NjI5IDE4IDYgMTUuMzEzNyA2IDEyQzYgOC42ODYyOSA4LjY4NjI5IDYgMTIgNkMxNS4zMTM3IDYgMTggOC42ODYyOSAxOCAxMkMxOCAxNS4zMTM3IDE1LjMxMzcgMTggMTIgMThaTTEyIDE2QzE0LjIwOTEgMTYgMTYgMTQuMjA5MSAxNiAxMkMxNiA5Ljc5MDg2IDE0LjIwOTEgOCAxMiA4QzkuNzkwODYgOCA4IDkuNzkwODYgOCAxMkM4IDE0LjIwOTEgOS43OTA4NiAxNiAxMiAxNloiIGZpbGw9IndoaXRlIi8+PC9zdmc+";
          }} />
            <h1 className="text-lg font-medium">Balanced Mind Meditation</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-4 overflow-auto animate-fade-in">
        {children}
      </main>
      
      {showNav && <div className="sticky bottom-0 z-40 w-full glass-morphism border-t">
          <nav className="flex justify-around py-2">
            {navItems.map(item => <Button key={item.path} variant="ghost" size="sm" className={cn("flex flex-col items-center gap-1 rounded-lg px-2 py-1.5", location.pathname === item.path && "bg-secondary text-foreground")} onClick={() => navigate(item.path)}>
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>)}
          </nav>
        </div>}
    </div>;
}
