
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Plus } from "lucide-react";

export interface BreathingCounterHandle {
  resetCount: () => void;
}

export const BreathingCounter = forwardRef<BreathingCounterHandle, {}>((props, ref) => {
  const [count, setCount] = useState(0);
  const [activeVoice, setActiveVoice] = useState<"vera" | "marco" | null>(null);

  // Load count from localStorage on component mount
  useEffect(() => {
    const savedCount = localStorage.getItem("breathingCount");
    if (savedCount) {
      setCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save count to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("breathingCount", count.toString());
  }, [count]);

  const incrementCount = () => {
    setCount(prev => prev + 1);
  };

  const resetCount = () => {
    setCount(0);
    setActiveVoice(null);
  };

  // Expose resetCount method to parent component
  useImperativeHandle(ref, () => ({
    resetCount
  }));

  const handleVoiceClick = (voice: "vera" | "marco") => {
    if (activeVoice === voice) {
      setActiveVoice(null);
    } else {
      setActiveVoice(voice);
      incrementCount();
    }
  };

  return (
    <Card className="p-3 mt-4 bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-blue-900/30 shadow-sm">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            className={`px-3 py-1 h-8 ${activeVoice === "vera" ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" : ""}`}
            onClick={() => handleVoiceClick("vera")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Vera
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`px-3 py-1 h-8 ${activeVoice === "marco" ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800" : ""}`}
            onClick={() => handleVoiceClick("marco")}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Marco
          </Button>
        </div>
        
        <div className="flex justify-center items-center space-x-2">
          <div className="flex items-center px-3 h-8 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
            {count}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={resetCount}
            title="Reset teller"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

BreathingCounter.displayName = "BreathingCounter";
