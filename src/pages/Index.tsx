import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Sunrise, BookOpen, Quote, Heart, Music, Radio, RefreshCw, Headphones, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Define admin menu items matching the image
const adminFeatures = [
  {
    title: "Meditaties",
    description: "Beheer meditatie audio",
    icon: Headphones,
    color: "modern-card-blue",
    iconBg: "icon-container-blue",
    path: "/admin/meditations"
  },
  {
    title: "Inspiratie quotes",
    description: "Beheer dagelijkse quotes",
    icon: Quote,
    color: "modern-card-orange",
    iconBg: "icon-container-orange",
    path: "/admin/quotes"
  },
  {
    title: "Muziek",
    description: "Beheer muziekbibliotheek",
    icon: Music,
    color: "modern-card-pink",
    iconBg: "icon-container-pink",
    path: "/admin/muziek"
  },
  {
    title: "Streaming Links",
    description: "Beheer radiostreams",
    icon: Radio,
    color: "modern-card-purple",
    iconBg: "icon-container-purple",
    path: "/admin/streams"
  },
  {
    title: "Ademhaling",
    description: "Beheer ademhalingsoefeningen",
    icon: RefreshCw,
    color: "modern-card-green",
    iconBg: "icon-container-green",
    path: "/admin/breathing"
  }
];

// User-facing features
const features = [
  {
    title: "Meditaties",
    description: "Ontdek geleide meditaties voor elke gemoedstoestand",
    icon: Sunrise,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-300",
    path: "/meditations"
  },
  {
    title: "Ademhalingsoefeningen",
    description: "Verbeter je ademhaling met visuele oefeningen",
    icon: RefreshCw,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-300",
    path: "/breathing"
  },
  {
    title: "Dagboek",
    description: "Houd je emotionele reis bij en zie je voortgang",
    icon: BookOpen,
    color: "bg-rose-100 dark:bg-rose-900/30",
    textColor: "text-rose-600 dark:text-rose-300",
    path: "/journal"
  },
  {
    title: "Dagelijkse Quote",
    description: "Inspiratie voor elke dag van de week",
    icon: Quote,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-300",
    path: "/daily-quote"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { currentQuote, meditations } = useApp();
  const [displayMeditations, setDisplayMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminView, setShowAdminView] = useState(false);
  
  useEffect(() => {
    // Get url path to check if we're on admin
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setShowAdminView(true);
    }
    
    setDisplayMeditations(meditations.slice(0, 3));
    setLoading(false);
  }, [meditations]);
  
  const getRecentMeditations = () => {
    return displayMeditations.length > 0 ? displayMeditations : [];
  };
  
  // If we're in the admin view, show the admin features
  if (showAdminView) {
    return (
      <MobileLayout showNav={false}>
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="font-bold tracking-tight mb-2 text-2xl">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Beheer alle content voor de Balanced Mind app
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {adminFeatures.map((feature) => (
              <Card 
                key={feature.title} 
                className={feature.color} 
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={feature.iconBg}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MobileLayout>
    );
  }
  
  // User-facing home page
  return (
    <MobileLayout>
      <section className="space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-bold tracking-tight mb-2 text-2xl">Balanced Mind Meditation</h1>
          <p className="text-muted-foreground">
            Vind innerlijke rust en verbeter je welzijn
          </p>
        </div>
        
        {currentQuote && (
          <Card className="glass-morphism border overflow-hidden animate-scale-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Quote className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="italic mb-2">{currentQuote.text}</p>
                  <div className="text-sm text-muted-foreground text-right">
                    — {currentQuote.author}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-right">
                <button onClick={() => navigate("/daily-quote")} className="text-sm text-primary hover:underline">
                  Meer quotes →
                </button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Recente Meditaties</h2>
            <button onClick={() => navigate("/meditations")} className="text-sm text-primary hover:underline">
              Alle bekijken
            </button>
          </div>
          
          {loading ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Meditaties laden...</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {getRecentMeditations().map(meditation => (
                <Card 
                  key={meditation.id} 
                  className="flex-shrink-0 w-40 overflow-hidden modern-card" 
                  onClick={() => navigate("/meditations")}
                >
                  <div 
                    className="h-24 bg-cover bg-center" 
                    style={{
                      backgroundImage: `url(${meditation.coverImageUrl})`
                    }} 
                  />
                  <CardContent className="p-3">
                    <div className="text-sm font-medium truncate">
                      {meditation.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {meditation.duration} min
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getRecentMeditations().length === 0 && (
                <div className="text-center p-4 w-full">
                  <p className="text-muted-foreground">Geen meditaties gevonden</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {features.map(feature => (
            <Card 
              key={feature.title} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300 animate-scale-in bg-navy-950 border border-white/10" 
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="p-4">
                <div className={cn("p-2 rounded-full w-fit mb-2", feature.color)}>
                  <feature.icon className={cn("h-5 w-5", feature.textColor)} />
                </div>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="bg-accent-blue/10 text-accent-blue border-accent-blue/30 hover:bg-accent-blue/20"
          >
            <Lock className="h-4 w-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      </section>
    </MobileLayout>
  );
};

export default Index;
