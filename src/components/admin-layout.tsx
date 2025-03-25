
import React from "react";
import { useTheme } from "./theme-provider";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  Lock, 
  Headphones, 
  Music, 
  Quote, 
  Home, 
  RefreshCw,
  Waves,
  Radio
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
      label: "AdminMeditaties", 
      description: "/admin/meditaties"
    },
    { 
      path: "/admin/quotes", 
      icon: Quote, 
      label: "Admin Citaten", 
      description: "/admin/citaten"
    },
    { 
      path: "/admin/soundscapes", 
      icon: Waves, 
      label: "Beheerder Soundscapes", 
      description: "/admin/soundscapes"
    },
    { 
      path: "/admin/music", 
      icon: Music, 
      label: "AdminMusic", 
      description: "/admin/muziek"
    },
    { 
      path: "/admin/streams", 
      icon: Radio, 
      label: "Streaming Links", 
      description: "/admin/streams"
    },
    { 
      path: "/admin/breathing", 
      icon: RefreshCw, 
      label: "Beheerder Ademhaling", 
      description: "/admin/ademhaling"
    },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen w-full bg-background">
        <header className="sticky top-0 z-40 w-full glass-morphism border-b py-3 px-4 backdrop-blur-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-medium">Admin Dashboard</h1>
              <SidebarTrigger className="ml-2" />
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
          <Sidebar side="left" variant="sidebar" collapsible="icon">
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
            <SidebarFooter>
              <div className="px-3 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Frontend</span>
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
          
          <main className="flex-1 overflow-auto p-4">
            <div className={cn("space-y-6 animate-fade-in", className)}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
