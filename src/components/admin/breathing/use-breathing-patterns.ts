
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { BreathingPattern } from "./types";

const defaultBreathingPatterns: BreathingPattern[] = [
  {
    id: "1",
    name: "4-7-8 Techniek",
    description: "Een kalmerende ademhalingstechniek die helpt bij ontspanning",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5,
    animationEnabled: true,
    animationStyle: "glow",
    animationColor: "cyan",
    inhaleText: "Adem in",
    exhaleText: "Adem uit",
    hold1Text: "Vasthouden",
    hold2Text: "Vasthouden",
    circleSize: "medium",
    textSize: "medium",
    showCycleCount: true
  }, 
  {
    id: "2",
    name: "Box Breathing",
    description: "Vierkante ademhaling voor focus en kalmte",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4,
    animationEnabled: true,
    animationStyle: "glow",
    animationColor: "cyan",
    inhaleText: "Adem in",
    exhaleText: "Adem uit",
    hold1Text: "Vasthouden",
    hold2Text: "Vasthouden",
    circleSize: "medium",
    textSize: "medium",
    showCycleCount: true
  }, 
  {
    id: "3",
    name: "Relaxerende Ademhaling",
    description: "Eenvoudige techniek voor diepe ontspanning",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 6,
    animationEnabled: true,
    animationStyle: "pulse",
    animationColor: "blue",
    inhaleText: "Adem in",
    exhaleText: "Adem uit",
    hold1Text: "Vasthouden",
    hold2Text: "Vasthouden",
    circleSize: "medium",
    textSize: "medium",
    showCycleCount: true
  }
];

export function useBreathingPatterns() {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load patterns from storage on init
  useEffect(() => {
    loadPatternsFromStorage();
  }, []);

  // Load patterns from localStorage
  const loadPatternsFromStorage = useCallback(() => {
    setIsLoading(true);
    const savedPatterns = localStorage.getItem('breathingPatterns');
    
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingPatterns(parsedPatterns);
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        setBreathingPatterns(defaultBreathingPatterns);
        localStorage.setItem('breathingPatterns', JSON.stringify(defaultBreathingPatterns));
      }
    } else {
      localStorage.setItem('breathingPatterns', JSON.stringify(defaultBreathingPatterns));
    }
    
    setIsLoading(false);
  }, []);

  // Select a pattern
  const selectPattern = useCallback((pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
  }, []);

  // Create a new pattern
  const createNewPattern = useCallback(() => {
    const newId = `temp_${Date.now()}`;
    const newPattern: BreathingPattern = {
      id: newId,
      name: "Nieuwe Techniek",
      description: "Beschrijving van de techniek",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      animationEnabled: true,
      animationStyle: "grow",
      animationColor: "primary",
      inhaleText: "Adem in",
      exhaleText: "Adem uit",
      hold1Text: "Vasthouden",
      hold2Text: "Vasthouden",
      circleSize: "medium",
      textSize: "medium",
      showCycleCount: true
    };
    
    setSelectedPattern(newPattern);
    return newPattern;
  }, []);

  // Save a pattern
  const savePattern = useCallback((pattern: BreathingPattern) => {
    const existingPatternIndex = breathingPatterns.findIndex(p => p.id === pattern.id);
    let updatedPatterns: BreathingPattern[];
    
    if (existingPatternIndex >= 0) {
      // Update existing
      updatedPatterns = [...breathingPatterns];
      updatedPatterns[existingPatternIndex] = pattern;
      setBreathingPatterns(updatedPatterns);
      setSelectedPattern(pattern);
      toast.success("Ademhalingstechniek bijgewerkt");
    } else {
      // Create new
      const newPattern = {
        ...pattern,
        id: `${Date.now()}`
      };
      updatedPatterns = [...breathingPatterns, newPattern];
      setBreathingPatterns(updatedPatterns);
      setSelectedPattern(newPattern);
      toast.success("Nieuwe ademhalingstechniek toegevoegd");
    }
    
    // Save to localStorage
    localStorage.setItem('breathingPatterns', JSON.stringify(updatedPatterns));
    return updatedPatterns;
  }, [breathingPatterns]);

  // Delete a pattern
  const deletePattern = useCallback((id: string) => {
    const filteredPatterns = breathingPatterns.filter(p => p.id !== id);
    setBreathingPatterns(filteredPatterns);
    setSelectedPattern(null);
    
    // Save to localStorage
    localStorage.setItem('breathingPatterns', JSON.stringify(filteredPatterns));
    toast.success("Ademhalingstechniek verwijderd");
    
    return filteredPatterns;
  }, [breathingPatterns]);

  return {
    breathingPatterns,
    selectedPattern,
    isLoading,
    selectPattern,
    createNewPattern,
    savePattern,
    deletePattern,
    resetToDefaults: () => {
      localStorage.setItem('breathingPatterns', JSON.stringify(defaultBreathingPatterns));
      setBreathingPatterns(defaultBreathingPatterns);
      setSelectedPattern(null);
      toast.success("Ademhalingstechnieken gereset naar standaardwaarden");
    }
  };
}
