
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw } from "lucide-react";
import { BreathingPattern } from "@/lib/types";
import { toast } from "sonner";
import { BreathingExerciseState } from "./types";

interface BreathingControlsProps {
  pattern: BreathingPattern;
  isActive: boolean;
  activeVoice: "vera" | "marco" | null;
  onReset: () => void;
  setState: React.Dispatch<React.SetStateAction<BreathingExerciseState>>;
  state: BreathingExerciseState;
}

export function BreathingControls({ 
  pattern, 
  isActive, 
  activeVoice, 
  onReset,
  setState,
  state
}: BreathingControlsProps) {
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<{
    inhale: string;
    hold: string;
    exhale: string;
  }>({
    inhale: "",
    hold: "",
    exhale: ""
  });
  
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<{
    inhale: string;
    hold: string;
    exhale: string;
  }>({
    inhale: "",
    hold: "",
    exhale: ""
  });

  // Enhanced loading of voice URLs with logging
  useEffect(() => {
    try {
      const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
      if (savedVeraUrls) {
        const parsedUrls = JSON.parse(savedVeraUrls);
        console.log("Loaded Vera voice URLs:", parsedUrls);
        setVeraVoiceUrls(parsedUrls);
      } else {
        console.log("No Vera voice URLs found in localStorage");
      }
      
      const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
      if (savedMarcoUrls) {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        console.log("Loaded Marco voice URLs:", parsedUrls);
        setMarcoVoiceUrls(parsedUrls);
      } else {
        console.log("No Marco voice URLs found in localStorage");
      }
    } catch (error) {
      console.error("Error loading voice URLs from localStorage:", error);
      toast.error("Fout bij het laden van stem configuratie");
    }
  }, []);

  const startWithVera = () => {
    if (isActive && activeVoice === "vera") {
      setState(prevState => ({...prevState, isActive: false, activeVoice: null}));
      console.log("Stopping Vera voice guidance");
    } else {
      if (!veraVoiceUrls.inhale || !veraVoiceUrls.exhale) {
        console.error("Missing required Vera voice URLs", veraVoiceUrls);
        toast.error("De Vera stem heeft minimaal inademings- en uitademings-URL's nodig");
        return;
      }
      
      console.log("Starting exercise with Vera voice:", veraVoiceUrls);
      setState(prevState => ({
        ...prevState, 
        isActive: true, 
        activeVoice: "vera", 
        exerciseCompleted: false,
        // Initialize with first audio URL
        currentAudioUrl: veraVoiceUrls.inhale
      }));
    }
  };

  const startWithMarco = () => {
    if (isActive && activeVoice === "marco") {
      setState(prevState => ({...prevState, isActive: false, activeVoice: null}));
      console.log("Stopping Marco voice guidance");
    } else {
      if (!marcoVoiceUrls.inhale || !marcoVoiceUrls.exhale) {
        console.error("Missing required Marco voice URLs", marcoVoiceUrls);
        toast.error("De Marco stem heeft minimaal inademings- en uitademings-URL's nodig");
        return;
      }
      
      console.log("Starting exercise with Marco voice:", marcoVoiceUrls);
      setState(prevState => ({
        ...prevState, 
        isActive: true, 
        activeVoice: "marco", 
        exerciseCompleted: false,
        // Initialize with first audio URL
        currentAudioUrl: marcoVoiceUrls.inhale
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Button 
        onClick={onReset} 
        disabled={!pattern}
        variant="outline"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reset
      </Button>
      
      <Button 
        onClick={startWithVera} 
        disabled={!pattern || !(veraVoiceUrls.inhale && veraVoiceUrls.exhale)}
        variant={activeVoice === "vera" && isActive ? "destructive" : "default"}
        className="flex justify-center items-center"
      >
        {activeVoice === "vera" && isActive ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Stop Vera
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start met Vera
          </>
        )}
      </Button>
      
      <Button 
        onClick={startWithMarco} 
        disabled={!pattern || !(marcoVoiceUrls.inhale && marcoVoiceUrls.exhale)}
        variant={activeVoice === "marco" && isActive ? "destructive" : "default"}
        className="flex justify-center items-center"
      >
        {activeVoice === "marco" && isActive ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Stop Marco
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start met Marco
          </>
        )}
      </Button>
    </div>
  );
}
