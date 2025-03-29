
import { useState, useEffect } from "react";
import { BreathingPattern } from "@/components/breathing-page/types";
import { defaultBreathingPatterns } from "@/components/breathing-page/constants";

export function useBreathingPatterns() {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);

  // Load patterns from localStorage on initialization
  useEffect(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingPatterns(parsedPatterns);
        if (parsedPatterns.length > 0) {
          setSelectedPattern(parsedPatterns[0]);
        }
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        setBreathingPatterns(defaultBreathingPatterns);
        setSelectedPattern(defaultBreathingPatterns[0]);
      }
    } else {
      setSelectedPattern(defaultBreathingPatterns[0]);
    }
  }, []);

  const handleSelectPattern = (patternId: string) => {
    const pattern = breathingPatterns.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern);
      return true;
    }
    return false;
  };

  return {
    breathingPatterns,
    selectedPattern,
    setBreathingPatterns,
    setSelectedPattern,
    handleSelectPattern
  };
}
