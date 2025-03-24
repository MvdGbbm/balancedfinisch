
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Sunrise, Clock, BookOpen, Music, Quote, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    icon: Sunrise,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-300",
    path: "/breathing"
  },
  {
    title: "Muziek",
    description: "Luister naar rustgevende muziek en afspeellijsten",
    icon: Music,
    color: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-300",
    path: "/music"
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
    title: "Soundscapes",
    description: "Ontspan met rustgevende natuurgeluiden en muziek",
    icon: Music,
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    textColor: "text-indigo-600 dark:text-indigo-300",
    path: "/soundscapes"
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
  
  useEffect(() => {
    setDisplayMeditations(meditations.slice(0, 3));
    setLoading(false);
  }, [meditations]);
  
  const getRecentMeditations = () => {
    return displayMeditations.length > 0 ? displayMeditations : [];
  };
  
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
                  className="flex-shrink-0 w-40 overflow-hidden neo-morphism animate-slide-in" 
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
              className={cn("overflow-hidden cursor-pointer neo-morphism hover:shadow-md transition-shadow duration-300 animate-scale-in")} 
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
      </section>
    </MobileLayout>
  );
};

export default Index;
