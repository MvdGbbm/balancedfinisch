
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingCircle } from "@/components/breathing-circle";
import { MeditationMusicPlayer } from "@/components/meditation-music-player";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Droplet, 
  Heart, 
  Brain, 
  Moon, 
  Zap,
  Info,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

const breathingPatterns = [
  {
    id: "calm",
    name: "Ontspannende Ademhaling",
    description: "Ontspannende ademhaling om stress te verminderen",
    inhaleDuration: 4000,
    holdDuration: 2000,
    exhaleDuration: 6000,
    icon: Heart,
    color: "text-rose-500"
  },
  {
    id: "focus",
    name: "Focus Ademhaling",
    description: "Ademhaling voor verbeterde concentratie",
    inhaleDuration: 5000,
    holdDuration: 2000,
    exhaleDuration: 5000,
    icon: Brain,
    color: "text-blue-500"
  },
  {
    id: "energy",
    name: "Energie Ademhaling",
    description: "Krachtige ademhaling voor meer energie",
    inhaleDuration: 3000,
    holdDuration: 1000,
    exhaleDuration: 4000,
    icon: Zap,
    color: "text-amber-500"
  },
  {
    id: "sleep",
    name: "Slaap Ademhaling",
    description: "Rustige ademhaling voor betere slaap",
    inhaleDuration: 6000,
    holdDuration: 3000,
    exhaleDuration: 7000,
    icon: Moon,
    color: "text-indigo-500"
  },
];

const benefitsList = [
  "Vermindert stress en angst",
  "Verbetert concentratie en focus",
  "Verlaagt de bloeddruk",
  "Bevordert beter slapen",
  "Verhoogt energieniveaus"
];

const Breathing = () => {
  const [selectedPatternId, setSelectedPatternId] = useState(breathingPatterns[0].id);
  const [breathCount, setBreathCount] = useState(0);
  
  // Reset breath count when pattern changes
  useEffect(() => {
    setBreathCount(0);
  }, [selectedPatternId]);
  
  const selectedPattern = breathingPatterns.find(
    (pattern) => pattern.id === selectedPatternId
  ) || breathingPatterns[0];
  
  const handleBreathComplete = () => {
    setBreathCount((prevCount) => prevCount + 1);
  };
  
  const handlePatternChange = (value: string) => {
    setSelectedPatternId(value);
    // The breathCount will be reset in the useEffect
  };
  
  const resetBreathCount = () => {
    setBreathCount(0);
  };
  
  const PatternIcon = selectedPattern.icon;
  
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <MeditationMusicPlayer />
        
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">Ademhalingspatroon</h1>
          <p className="text-muted-foreground">
            Kies een patroon dat bij je stemming past
          </p>
        </div>
        
        <Card className="glass-morphism border-t border-t-blue-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PatternIcon className={selectedPattern.color} />
              <div>
                <CardTitle>{selectedPattern.name}</CardTitle>
                <CardDescription>
                  {selectedPattern.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedPatternId}
              onValueChange={handlePatternChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer een patroon" />
              </SelectTrigger>
              <SelectContent>
                {breathingPatterns.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <pattern.icon className={`h-4 w-4 ${pattern.color}`} />
                      <span>{pattern.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-blue-500/10 p-3 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Inademen</p>
                <p className="text-xl font-semibold text-blue-500">{selectedPattern.inhaleDuration / 1000}s</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Vasthouden</p>
                <p className="text-xl font-semibold text-amber-500">{selectedPattern.holdDuration / 1000}s</p>
              </div>
              <div className="rounded-lg bg-indigo-500/10 p-3 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Uitademen</p>
                <p className="text-xl font-semibold text-indigo-500">{selectedPattern.exhaleDuration / 1000}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center py-6">
          <BreathingCircle
            inhaleDuration={selectedPattern.inhaleDuration}
            holdDuration={selectedPattern.holdDuration}
            exhaleDuration={selectedPattern.exhaleDuration}
            onBreathComplete={handleBreathComplete}
          />
        </div>
        
        <div className="text-center bg-gray-900/40 py-4 rounded-xl backdrop-blur-sm flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent animate-pulse-gentle">
              {breathCount}
            </div>
            <Button 
              onClick={resetBreathCount} 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-gray-800/50"
              title="Reset teller"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground">Volledige ademhalingen</p>
        </div>
        
        <Card className="neo-morphism mt-6 bg-gray-900/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-base">Voordelen van Ademhalingsoefeningen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="space-y-3">
              {benefitsList.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Droplet className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
