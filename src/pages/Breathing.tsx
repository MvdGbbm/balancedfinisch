
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import BreathingAnimation, { BreathingTechnique } from "@/components/breathing/breathing-animation";
import { BreathingCounter } from "@/components/breathing/breathing-counter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

// Mock data for available breathing exercises from backend
// This would be replaced with actual API call in a real implementation
const availableBreathingExercises = [
  { id: '1', name: '4-7-8', technique: '4-7-8' as BreathingTechnique },
  { id: '2', name: 'Box Breathing', technique: 'box-breathing' as BreathingTechnique },
  { id: '3', name: 'Diafragma', technique: 'diaphragmatic' as BreathingTechnique },
  // Additional exercises would be loaded from backend
];

const Breathing = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>('4-7-8');
  const counterRef = React.useRef<{ resetCount: () => void } | null>(null);

  const handleAnimationReset = () => {
    // Reset counter if it exists
    if (counterRef.current && counterRef.current.resetCount) {
      counterRef.current.resetCount();
    }
  };

  const handleTechniqueChange = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    handleAnimationReset();
  };

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            {/* Dropdown menu for breathing exercises */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-sm">
                  {availableBreathingExercises.find(ex => ex.technique === selectedTechnique)?.name || 'Select Technique'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                {availableBreathingExercises.map((exercise) => (
                  <DropdownMenuItem 
                    key={exercise.id}
                    className={`${selectedTechnique === exercise.technique ? 'bg-primary/10 font-medium' : ''} cursor-pointer`}
                    onClick={() => handleTechniqueChange(exercise.technique)}
                  >
                    {exercise.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 shadow-sm">
            <BreathingAnimation 
              technique={selectedTechnique} 
              onReset={handleAnimationReset}
            />
            
            <BreathingCounter ref={counterRef} />
          </div>
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
