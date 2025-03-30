
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Volume2, Play, Pause, Radio, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface BreathingControlsProps {
  activeVoice: string | null;
  isExerciseActive: boolean;
  veraVoiceUrls: {
    intro: string;
    inhale: string;
    hold: string;
    exhale: string;
    cycle: string;
    complete: string;
  };
  marcoVoiceUrls: {
    intro: string;
    inhale: string;
    hold: string;
    exhale: string;
    cycle: string;
    complete: string;
  };
  voiceVolume: number;
  musicVolume: number;
  onActivateVoice: (voice: string) => void;
  onPauseVoice: () => void;
  onVoiceVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  headerText: string;
  selectedPattern: any;
  startAudioRef: React.RefObject<HTMLAudioElement>;
  endAudioRef: React.RefObject<HTMLAudioElement>;
}

const BreathingControls: React.FC<BreathingControlsProps> = ({
  activeVoice,
  isExerciseActive,
  veraVoiceUrls,
  marcoVoiceUrls,
  voiceVolume,
  musicVolume,
  onActivateVoice,
  onPauseVoice,
  onVoiceVolumeChange,
  onMusicVolumeChange,
  headerText,
  selectedPattern,
  startAudioRef,
  endAudioRef,
}) => {
  const [activeTab, setActiveTab] = useState("voice");
  
  const handleVolumeChange = (values: number[]) => {
    onVoiceVolumeChange(values[0]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{headerText}</h3>
      
      <Tabs defaultValue="voice" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-2 w-full grid grid-cols-1">
          <TabsTrigger value="voice" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Stem</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="voice" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">Volume:</span>
              <Slider
                value={[voiceVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={activeVoice === "vera" && isExerciseActive ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center justify-center py-6",
                activeVoice === "vera" && isExerciseActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                if (activeVoice === "vera" && isExerciseActive) {
                  onPauseVoice();
                } else {
                  onActivateVoice("vera");
                }
              }}
              disabled={!selectedPattern}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                {activeVoice === "vera" && isExerciseActive ? (
                  <Pause className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Play className="h-5 w-5 text-primary" />
                )}
              </div>
              <span className="text-sm font-medium">Vera</span>
              <span className="text-xs text-muted-foreground mt-1">Vrouwelijke stem</span>
            </Button>
            
            <Button
              variant={activeVoice === "marco" && isExerciseActive ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center justify-center py-6",
                activeVoice === "marco" && isExerciseActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                if (activeVoice === "marco" && isExerciseActive) {
                  onPauseVoice();
                } else {
                  onActivateVoice("marco");
                }
              }}
              disabled={!selectedPattern}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                {activeVoice === "marco" && isExerciseActive ? (
                  <Pause className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Play className="h-5 w-5 text-primary" />
                )}
              </div>
              <span className="text-sm font-medium">Marco</span>
              <span className="text-xs text-muted-foreground mt-1">Mannelijke stem</span>
            </Button>
          </div>
          
          {isExerciseActive && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <Volume2 className="h-4 w-4 text-primary mr-2" />
                  <div>
                    <p className="text-sm font-medium">
                      Actieve begeleiding: {activeVoice === "vera" ? "Vera" : "Marco"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPattern?.name} - Ronde {selectedPattern?.cycles}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BreathingControls;
