
import React, { useEffect, useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, RefreshCw } from "lucide-react";
import { BreathingExercise } from "@/components/breathing/breathing-exercise";
import { BreathingSettings } from "@/components/breathing/core/types";
import { toast } from "sonner";

// Convert the admin breathing pattern to frontend breathing settings
const mapPatternToSettings = (pattern: any): BreathingSettings => {
  return {
    inhaleDuration: pattern.inhale || 4,
    holdDuration: pattern.hold1 || 0,
    exhaleDuration: pattern.exhale || 4,
    pauseDuration: pattern.hold2 || 0,
    cycles: pattern.cycles || 5,
    animated: pattern.animationEnabled !== false,
    animationStyle: pattern.animationStyle || "glow",
    animationColor: pattern.animationColor || "cyan",
    showCycleCount: pattern.showCycleCount !== false,
    circleSize: pattern.circleSize || "medium",
    textSize: pattern.textSize || "medium"
  };
};

const Breathing = () => {
  // State for breathing patterns
  const [patterns, setPatterns] = useState<any[]>([]);
  const [selectedPatternId, setSelectedPatternId] = useState<string>("");
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [breathingSettings, setBreathingSettings] = useState<BreathingSettings | null>(null);
  
  // Voice and audio state
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<any>(null);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<any>(null);
  const [selectedVoice, setSelectedVoice] = useState<"vera" | "marco" | "none">("none");
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.5);
  
  // Page state
  const [pageKey, setPageKey] = useState(Date.now());

  // Load breathing patterns and voice URLs from localStorage
  useEffect(() => {
    // Load breathing patterns
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setPatterns(parsedPatterns);
        
        // Select first pattern by default
        if (parsedPatterns.length > 0) {
          setSelectedPatternId(parsedPatterns[0].id);
          setSelectedPattern(parsedPatterns[0]);
          setBreathingSettings(mapPatternToSettings(parsedPatterns[0]));
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        toast.error("Fout bij het laden van ademhalingstechnieken");
      }
    }
    
    // Load voice URLs
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        setVeraVoiceUrls(JSON.parse(savedVeraUrls));
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
      }
    }
    
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        setMarcoVoiceUrls(JSON.parse(savedMarcoUrls));
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
      }
    }
  }, [pageKey]);

  // Handle pattern selection
  const handlePatternChange = (patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPatternId(patternId);
      setSelectedPattern(pattern);
      setBreathingSettings(mapPatternToSettings(pattern));
    }
  };

  // Get voice URLs based on selection
  const getSelectedVoiceUrls = () => {
    if (selectedVoice === "vera") {
      return veraVoiceUrls;
    } else if (selectedVoice === "marco") {
      return marcoVoiceUrls;
    }
    return null;
  };

  // Refresh page data
  const handleRefresh = () => {
    setPageKey(Date.now());
    toast.success("Gegevens vernieuwd");
  };

  return (
    <MobileLayout>
      <div key={pageKey} className="container py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Ademhalingsoefeningen</h1>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Pattern selector */}
          <Card>
            <CardHeader>
              <CardTitle>Kies een ademhalingstechniek</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPatternId} onValueChange={handlePatternChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecteer een techniek" />
                </SelectTrigger>
                <SelectContent>
                  {patterns.map(pattern => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedPattern && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedPattern.description}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Breathing exercise */}
          {breathingSettings && (
            <BreathingExercise 
              settings={breathingSettings}
              voiceUrls={getSelectedVoiceUrls()}
              onComplete={() => console.log("Exercise completed")}
            />
          )}
          
          {/* Voice selection */}
          <Card>
            <CardHeader>
              <CardTitle>Stem begeleiding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-2">
                  <Button 
                    variant={selectedVoice === "vera" ? "default" : "outline"}
                    onClick={() => setSelectedVoice(selectedVoice === "vera" ? "none" : "vera")}
                    disabled={!veraVoiceUrls}
                    className="flex-1"
                  >
                    Vera
                  </Button>
                  <Button 
                    variant={selectedVoice === "marco" ? "default" : "outline"}
                    onClick={() => setSelectedVoice(selectedVoice === "marco" ? "none" : "marco")}
                    disabled={!marcoVoiceUrls}
                    className="flex-1"
                  >
                    Marco
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Volume2 className="mr-2 h-4 w-4" />
                    <span className="text-sm">Stem volume</span>
                  </div>
                  <Slider
                    value={[voiceVolume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setVoiceVolume(value[0] / 100)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
