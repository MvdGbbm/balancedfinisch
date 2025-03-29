
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreathingPattern } from "@/lib/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVoiceUrlLoader } from "./breathing-exercise/audio/voice-url-loader";
import { BreathingControls } from "./breathing-exercise/breathing-controls";
import { BreathingAudioManager } from "./breathing-exercise/breathing-audio-manager";
import { BreathingExerciseState } from "./breathing-exercise/types";
import { Button } from "@/components/ui/button";
import { Home, Bug } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreathingExerciseTestProps {
  pattern: BreathingPattern | null;
}

export function BreathingExerciseTest({
  pattern
}: BreathingExerciseTestProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"exercise" | "voice" | "debug">("exercise");
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

  // Debug info
  useEffect(() => {
    if (state.isActive) {
      console.log("Test exercise state:", state);
    }
  }, [state]);

  // Debug voice URLs
  useEffect(() => {
    console.log("Vera voice URLs:", veraVoiceUrls);
    console.log("Marco voice URLs:", marcoVoiceUrls);
  }, [veraVoiceUrls, marcoVoiceUrls]);

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

  const toggleDebug = () => {
    console.log("Vera voice URLs:", veraVoiceUrls);
    console.log("Marco voice URLs:", marcoVoiceUrls);
    console.log("Current pattern:", pattern);
    console.log("Current state:", state);
    toast.info("Debug info logged to console");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Test Ademhalingsoefening</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleDebug}>
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </Button>
          <Button variant="outline" size="sm" onClick={goToFrontend}>
            <Home className="h-4 w-4 mr-2" />
            Frontend
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="exercise" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "exercise" | "voice" | "debug")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="exercise">Ademhalingstechnieken</TabsTrigger>
            <TabsTrigger value="voice">Stem Configuratie</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
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
                        <li>Inademen: {veraVoiceUrls.inhale ? `✅ (${veraVoiceUrls.inhale.substring(0, 30)}...)` : "❌"}</li>
                        <li>Vasthouden: {veraVoiceUrls.hold ? `✅ (${veraVoiceUrls.hold.substring(0, 30)}...)` : "❌"}</li>
                        <li>Uitademen: {veraVoiceUrls.exhale ? `✅ (${veraVoiceUrls.exhale.substring(0, 30)}...)` : "❌"}</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Marco Stem</h3>
                      <ul className="space-y-1 text-sm">
                        <li>Inademen: {marcoVoiceUrls.inhale ? `✅ (${marcoVoiceUrls.inhale.substring(0, 30)}...)` : "❌"}</li>
                        <li>Vasthouden: {marcoVoiceUrls.hold ? `✅ (${marcoVoiceUrls.hold.substring(0, 30)}...)` : "❌"}</li>
                        <li>Uitademen: {marcoVoiceUrls.exhale ? `✅ (${marcoVoiceUrls.exhale.substring(0, 30)}...)` : "❌"}</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-muted-foreground">
                    De stemconfiguratie kan worden ingesteld op het tabblad "Stem Configuratie" in het admin menu.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="debug">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Debug Informatie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Audio Status</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify({
                        activeVoice: state.activeVoice,
                        currentAudioUrl: state.currentAudioUrl,
                        audioError: state.audioError,
                        isActive: state.isActive
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Pattern</h3>
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(pattern, null, 2)}
                    </pre>
                  </div>
                  
                  <Button onClick={toggleDebug} className="w-full">
                    Log Debug Info to Console
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
