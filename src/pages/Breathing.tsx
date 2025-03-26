
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw } from "lucide-react";
import { BreathingTechnique } from "@/lib/types";

// Fallback default exercises if none exist in localStorage
const defaultBreathingExercises = [
  { 
    id: '1', 
    name: '4-7-8', 
    technique: '4-7-8',
    description: 'A calming breathing technique that helps with relaxation',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5
  },
  { 
    id: '2', 
    name: 'Box Breathing', 
    technique: 'box-breathing',
    description: 'Square breathing for focus and calm',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4
  },
  { 
    id: '3', 
    name: 'Diafragma', 
    technique: 'diaphragmatic',
    description: 'Deep breathing from the diaphragm for relaxation',
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    cycles: 6
  }
];

const Breathing = () => {
  const [breathingExercises, setBreathingExercises] = useState<BreathingTechnique[]>([]);
  
  // Load breathing exercises from localStorage
  useEffect(() => {
    const savedExercises = localStorage.getItem('breathingPatterns');
    if (savedExercises) {
      try {
        const parsedExercises = JSON.parse(savedExercises);
        setBreathingExercises(parsedExercises);
      } catch (error) {
        console.error("Error loading breathing exercises:", error);
        setBreathingExercises(defaultBreathingExercises);
      }
    } else {
      setBreathingExercises(defaultBreathingExercises);
    }
  }, []);

  return (
    <MobileLayout>
      <div className="space-y-6 min-h-full p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Ademhaling</h1>
          </div>
        </div>
        
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/30 backdrop-blur-sm -z-10" />
          
          <div className="grid gap-4 p-1">
            {/* Main breathing exercise component */}
            <BreathExercise />
            
            {/* Music player for ambient sounds */}
            <div className="mt-4">
              <BreathingMusicPlayer />
            </div>
          </div>
        </div>
        
        {/* Benefits of breathing exercises section */}
        <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 p-6 shadow-sm mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Voordelen van ademhalingsoefeningen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5">
                <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Stress verminderen</p>
                <p className="text-muted-foreground">Helpt bij het verlagen van het cortisolniveau</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-1.5">
                <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium">Betere focus</p>
                <p className="text-muted-foreground">Verhoogt concentratie en mentale helderheid</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-1.5">
                <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Betere slaap</p>
                <p className="text-muted-foreground">Kalmeert het zenuwstelsel voor het slapen</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-cyan-100 dark:bg-cyan-900/30 p-1.5">
                <RefreshCw className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="font-medium">Immuunsysteem</p>
                <p className="text-muted-foreground">Versterkt het natuurlijke immuunsysteem</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
