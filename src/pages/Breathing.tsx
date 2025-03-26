
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import BreathingAnimation from "@/components/breathing/breathing-animation";
import { type BreathingTechnique } from "@/components/breathing/breathing-animation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Breathing = () => {
  const [technique, setTechnique] = useState<BreathingTechnique>('4-7-8');

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold text-center">Ademhalingsoefeningen</h1>
          
          <div className="w-full max-w-xs">
            <Select 
              value={technique} 
              onValueChange={(value) => setTechnique(value as BreathingTechnique)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer techniek" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="4-7-8">4-7-8 Techniek</SelectItem>
                  <SelectItem value="box-breathing">Box Breathing</SelectItem>
                  <SelectItem value="diaphragmatic">Diafragmatisch ademen</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <BreathingAnimation technique={technique} />
        </div>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
