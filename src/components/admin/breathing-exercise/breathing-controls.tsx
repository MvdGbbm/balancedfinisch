
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

  useEffect(() => {
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setVeraVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
      }
    }
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setMarcoVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
      }
    }
  }, []);

  const startWithVera = () => {
    if (isActive && activeVoice === "vera") {
      setState(prevState => ({...prevState, isActive: false, activeVoice: null}));
    } else {
      if (!veraVoiceUrls.inhale || !veraVoiceUrls.exhale) {
        toast.error("De Vera stem heeft minimaal inademings- en uitademings-URL's nodig");
        return;
      }
      
      setState(prevState => ({
        ...prevState, 
        isActive: true, 
        activeVoice: "vera", 
        exerciseCompleted: false
      }));
    }
  };

  const startWithMarco = () => {
    if (isActive && activeVoice === "marco") {
      setState(prevState => ({...prevState, isActive: false, activeVoice: null}));
    } else {
      if (!marcoVoiceUrls.inhale || !marcoVoiceUrls.exhale) {
        toast.error("De Marco stem heeft minimaal inademings- en uitademings-URL's nodig");
        return;
      }
      
      setState(prevState => ({
        ...prevState, 
        isActive: true, 
        activeVoice: "marco", 
        exerciseCompleted: false
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
