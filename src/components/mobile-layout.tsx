
import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { Upload } from "lucide-react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <nav className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-lg border-b sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-foreground">
            <h1 className="font-bold text-lg">Calm App</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/music-upload" className="p-2">
            <Upload className="h-5 w-5" />
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
