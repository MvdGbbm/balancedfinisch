
import React from "react";
import { useTheme } from "./theme-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  Lock, 
  Headphones, 
  Quote, 
  Home, 
  RefreshCw,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { 
      path: "/admin/meditations", 
      icon: Headphones, 
      label: "Meditaties", 
      description: "/admin/meditaties",
      accentColor: "accent-blue",
      iconBg: "icon-container-blue"
    },
    { 
      path: "/admin/quotes", 
      icon: Quote, 
      label: "Inspiratie quotes", 
      description: "/admin/quotes",
      accentColor: "accent-orange",
      iconBg: "icon-container-orange"
    },
    { 
      path: "/admin/muziek", 
      icon: Music, 
      label: "Muziek", 
      description: "/admin/muziek",
      accentColor: "accent-pink",
      iconBg: "icon-container-pink"
    },
    { 
      path: "/admin/breathing", 
      icon: RefreshCw, 
      label: "Ademhaling", 
      description: "/admin/ademhaling",
      accentColor: "accent-green",
      iconBg: "icon-container-green"
    },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen w-full bg-navy-950">
        <header className="sticky top-0 z-40 w-full glass-morphism border-b py-3 px-4 backdrop-blur-lg transition-all bg-navy-950/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-1 bg-accent-blue/10 text-accent-blue border-accent-blue/30 hover:bg-accent-blue/20"
              >
                <Home className="h-4 w-4" />
                <span>Frontend</span>
              </Button>
              <div className="flex items-center gap-2 ml-1">
                <Lock className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-medium">Dashboard</h1>
                <SidebarTrigger className="ml-1" />
              </div>
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
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-white/10 bg-navy-950/90 backdrop-blur-lg">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2">
                <Lock className="h-5 w-5" />
                <span className="text-sm font-medium">Admin Panel</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={location.pathname === "/admin"} 
                        onClick={() => navigate("/admin")}
                        className={location.pathname === "/admin" ? "bg-accent-blue/10 text-accent-blue" : ""}
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton 
                          isActive={location.pathname === item.path}
                          onClick={() => navigate(item.path)}
                          tooltip={item.description}
                          className={location.pathname === item.path ? `bg-${item.accentColor}/10 text-${item.accentColor}` : ""}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          
          <main className="flex-1 overflow-auto p-4 bg-navy-950">
            <div className={cn("space-y-6 animate-fade-in", className)}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
