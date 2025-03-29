
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreathingPattern } from "@/lib/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceUrlLoader } from "./breathing-exercise/audio/voice-url-loader";
import { BreathingControls } from "./breathing-exercise/breathing-controls";
import { BreathingAudioManager } from "./breathing-exercise/breathing-audio-manager";
import { BreathingExerciseState } from "./breathing-exercise/types";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreathingExerciseTestProps {
  pattern: BreathingPattern | null;
}

export function BreathingExerciseTest({
  pattern
}: BreathingExerciseTestProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"exercise" | "voice">("exercise");
  const { veraVoiceUrls, marcoVoiceUrls } = useVoiceUrlLoader();
  
  // Exercise state
  const [state, setState] = useState<BreathingExerciseState>({
    isActive: false,
    currentPhase: "inhale",
    currentCycle: 1,
    secondsLeft: pattern?.inhale || 0,
    progress: 0,
    circleScale: 1,
    activeVoice: null,
    exerciseCompleted: false,
    audioError: false,
    currentAudioUrl: ""
  });

  if (!pattern) {
    return <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Selecteer een ademhalingspatroon om te testen.
        </CardContent>
      </Card>;
  }

  // Verify pattern has all required fields
  const validatePattern = (p: BreathingPattern): boolean => {
    if (!p.inhale || !p.exhale || !p.cycles) {
      toast.error("Ademhalingspatroon is onvolledig. Controleer de configuratie.");
      return false;
    }
    return true;
  };
  
  if (!validatePattern(pattern)) {
    return <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Ongeldig ademhalingspatroon. Controleer de waarden.
        </CardContent>
      </Card>;
  }

  const handleReset = () => {
    setState({
      isActive: false,
      currentPhase: "inhale",
      currentCycle: 1,
      secondsLeft: pattern.inhale,
      progress: 0,
      circleScale: 1,
      activeVoice: null,
      exerciseCompleted: false,
      audioError: false,
      currentAudioUrl: ""
    });
  };

  const goToFrontend = () => {
    navigate("/breathing");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Test Ademhalingsoefening</CardTitle>
        <Button variant="outline" size="sm" onClick={goToFrontend}>
          <Home className="h-4 w-4 mr-2" />
          Frontend
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="exercise" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "exercise" | "voice")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="exercise">Ademhalingstechnieken</TabsTrigger>
            <TabsTrigger value="voice">Stem Configuratie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercise" className="space-y-4">
            <div className="space-y-4">
              <BreathingControls 
                pattern={pattern}
                isActive={state.isActive}
                activeVoice={state.activeVoice}
                onReset={handleReset}
                setState={setState}
                state={state}
              />

              {state.isActive && (
                <BreathingAudioManager 
                  pattern={pattern}
                  state={state}
                  setState={setState}
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Huidige fase</h3>
                  <div className="text-xl font-bold">
                    {state.currentPhase === "inhale" && "Inademen"}
                    {state.currentPhase === "hold1" && "Vasthouden"}
                    {state.currentPhase === "exhale" && "Uitademen"}
                    {state.currentPhase === "hold2" && "Vasthouden"}
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Cyclus</h3>
                  <div className="text-xl font-bold">
                    {state.currentCycle} / {pattern.cycles}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="voice">
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Voice Configuratie Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Vera Stem</h3>
                      <ul className="space-y-1 text-sm">
                        <li>Inademen: {veraVoiceUrls.inhale ? "✅" : "❌"}</li>
                        <li>Vasthouden: {veraVoiceUrls.hold ? "✅" : "❌"}</li>
                        <li>Uitademen: {veraVoiceUrls.exhale ? "✅" : "❌"}</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Marco Stem</h3>
                      <ul className="space-y-1 text-sm">
                        <li>Inademen: {marcoVoiceUrls.inhale ? "✅" : "❌"}</li>
                        <li>Vasthouden: {marcoVoiceUrls.hold ? "✅" : "❌"}</li>
                        <li>Uitademen: {marcoVoiceUrls.exhale ? "✅" : "❌"}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-muted-foreground">
                    De stemconfiguratie kan worden ingesteld op het tabblad "Stem Configuratie" hierboven.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
