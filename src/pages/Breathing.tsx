
import React, { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { BreathingCircle } from "@/components/breathing-circle";
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
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { 
  Droplet, 
  Heart, 
  Brain, 
  Moon, 
  Zap,
  Info,
  RefreshCw,
  Music
} from "lucide-react";
import { meditations } from "@/data/meditations";

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
  const [selectedMeditationId, setSelectedMeditationId] = useState(meditations[0].id);
  
  // Reset breath count when pattern changes
  useEffect(() => {
    setBreathCount(0);
  }, [selectedPatternId]);
  
  const selectedPattern = breathingPatterns.find(
    (pattern) => pattern.id === selectedPatternId
  ) || breathingPatterns[0];
  
  const selectedMeditation = meditations.find(
    (meditation) => meditation.id === selectedMeditationId
  ) || meditations[0];
  
  const handleBreathComplete = () => {
    setBreathCount((prevCount) => prevCount + 1);
  };
  
  const handlePatternChange = (value: string) => {
    setSelectedPatternId(value);
    // The breathCount will be reset in the useEffect
  };
  
  const handleMeditationChange = (value: string) => {
    setSelectedMeditationId(value);
  };
  
  const resetBreathCount = () => {
    setBreathCount(0);
  };
  
  const PatternIcon = selectedPattern.icon;
  
  return (
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Balanced Mind Meditatie</h1>
        </div>
        
        {/* Meditation Music Selector */}
        <Card className="glass-morphism border-t border-t-blue-500/30">
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <Music className="text-blue-400" />
              <div>
                <CardTitle className="text-base">Meditatie Muziek</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Select 
              value={selectedMeditationId}
              onValueChange={handleMeditationChange}
            >
              <SelectTrigger className="w-full mb-3">
                <SelectValue placeholder="Selecteer meditatie audio" />
              </SelectTrigger>
              <SelectContent>
                {meditations.map((meditation) => (
                  <SelectItem key={meditation.id} value={meditation.id} className="flex items-center">
                    <span>{meditation.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <AudioPlayer 
              audioUrl={selectedMeditation.audioUrl}
              title={selectedMeditation.title}
              showTitle={false}
            />
          </CardContent>
        </Card>
        
        <Card className="glass-morphism border-t border-t-blue-500/30">
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <PatternIcon className={selectedPattern.color} />
              <div>
                <CardTitle className="text-base">{selectedPattern.name}</CardTitle>
                <CardDescription className="text-xs">
                  {selectedPattern.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
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
            
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-blue-500/10 p-2 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Inademen</p>
                <p className="text-lg font-semibold text-blue-500">{selectedPattern.inhaleDuration / 1000}s</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Vasthouden</p>
                <p className="text-lg font-semibold text-amber-500">{selectedPattern.holdDuration / 1000}s</p>
              </div>
              <div className="rounded-lg bg-indigo-500/10 p-2 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground">Uitademen</p>
                <p className="text-lg font-semibold text-indigo-500">{selectedPattern.exhaleDuration / 1000}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center py-4">
          <BreathingCircle
            inhaleDuration={selectedPattern.inhaleDuration}
            holdDuration={selectedPattern.holdDuration}
            exhaleDuration={selectedPattern.exhaleDuration}
            onBreathComplete={handleBreathComplete}
          />
        </div>
        
        <div className="text-center bg-gray-900/40 py-3 rounded-xl backdrop-blur-sm relative">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-1">
            {breathCount}
          </div>
          <p className="text-sm text-muted-foreground">Volledige ademhalingen</p>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-white"
            onClick={resetBreathCount}
            title="Reset teller"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <Card className="neo-morphism bg-gray-900/40 backdrop-blur-sm">
          <CardHeader className="py-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-sm">Voordelen van Ademhalingsoefeningen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs pt-0">
            <ul className="space-y-2">
              {benefitsList.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Droplet className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
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
