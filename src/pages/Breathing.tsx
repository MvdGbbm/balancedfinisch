
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathExercise } from "@/components/breathing/breath-exercise";
import { BreathingMusicPlayer } from "@/components/breathing/breathing-music-player";
import BreathingAnimation, { BreathingTechnique } from "@/components/breathing/breathing-animation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Breathing = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>('4-7-8');

  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in min-h-full p-4 rounded-lg bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/10 backdrop-blur-sm">
        <Tabs defaultValue="animation" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="animation">Begeleide ademhaling</TabsTrigger>
            <TabsTrigger value="exercise">Ademhalingsoefeningen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="animation">
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <div className="inline-flex rounded-md shadow-sm">
                  <button 
                    onClick={() => setSelectedTechnique('4-7-8')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      selectedTechnique === '4-7-8' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    4-7-8
                  </button>
                  <button 
                    onClick={() => setSelectedTechnique('box-breathing')}
                    className={`px-4 py-2 text-sm font-medium ${
                      selectedTechnique === 'box-breathing' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Box Breathing
                  </button>
                  <button 
                    onClick={() => setSelectedTechnique('diaphragmatic')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      selectedTechnique === 'diaphragmatic' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Diafragma
                  </button>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 shadow-sm">
                <BreathingAnimation technique={selectedTechnique} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exercise">
            <BreathExercise />
          </TabsContent>
        </Tabs>
        
        <BreathingMusicPlayer />
      </div>
    </MobileLayout>
  );
};

export default Breathing;
