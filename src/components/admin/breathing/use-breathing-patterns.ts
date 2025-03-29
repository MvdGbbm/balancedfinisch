
import { useState, useEffect } from "react";
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
    startUrl: "",
    endUrl: ""
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
    startUrl: "",
    endUrl: ""
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
    startUrl: "",
    endUrl: ""
  }
];

export function useBreathingPatterns() {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);

  useEffect(() => {
    loadPatternsFromStorage();
  }, []);

  const loadPatternsFromStorage = () => {
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
  };

  const selectPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
  };

  const createNewPattern = () => {
    const newId = `temp_${Date.now()}`;
    const newPattern = {
      id: newId,
      name: "Nieuwe Techniek",
      description: "Beschrijving van de techniek",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      startUrl: "",
      endUrl: ""
    };
    setSelectedPattern(newPattern);
    return newPattern;
  };

  const savePattern = (pattern: BreathingPattern) => {
    const existingPatternIndex = breathingPatterns.findIndex(p => p.id === pattern.id);
    let updatedPatterns: BreathingPattern[];
    
    if (existingPatternIndex >= 0) {
      updatedPatterns = [...breathingPatterns];
      updatedPatterns[existingPatternIndex] = pattern;
      setBreathingPatterns(updatedPatterns);
      setSelectedPattern(pattern);
      toast.success("Ademhalingstechniek bijgewerkt");
    } else {
      const newPattern = {
        ...pattern,
        id: `${Date.now()}`
      };
      updatedPatterns = [...breathingPatterns, newPattern];
      setBreathingPatterns(updatedPatterns);
      setSelectedPattern(newPattern);
      toast.success("Nieuwe ademhalingstechniek toegevoegd");
    }
    
    localStorage.setItem('breathingPatterns', JSON.stringify(updatedPatterns));
    return updatedPatterns;
  };

  const deletePattern = (id: string) => {
    const filteredPatterns = breathingPatterns.filter(p => p.id !== id);
    setBreathingPatterns(filteredPatterns);
    setSelectedPattern(null);
    localStorage.setItem('breathingPatterns', JSON.stringify(filteredPatterns));
    toast.success("Ademhalingstechniek verwijderd");
    return filteredPatterns;
  };

  return {
    breathingPatterns,
    selectedPattern,
    selectPattern,
    createNewPattern,
    savePattern,
    deletePattern,
  };
}
