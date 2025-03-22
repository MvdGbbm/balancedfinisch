
import React, { useState } from "react";
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

const breathingPatterns = [
  {
    id: "calm",
    name: "Kalmerende Ademhaling",
    description: "Ontspannende ademhaling om stress te verminderen",
    inhaleDuration: 4000,
    holdDuration: 2000,
    exhaleDuration: 6000,
  },
  {
    id: "focus",
    name: "Focus Ademhaling",
    description: "Ademhaling voor verbeterde concentratie",
    inhaleDuration: 5000,
    holdDuration: 2000,
    exhaleDuration: 5000,
  },
  {
    id: "energy",
    name: "Energie Ademhaling",
    description: "Krachtige ademhaling voor meer energie",
    inhaleDuration: 3000,
    holdDuration: 1000,
    exhaleDuration: 4000,
  },
  {
    id: "sleep",
    name: "Slaap Ademhaling",
    description: "Rustige ademhaling voor betere slaap",
    inhaleDuration: 6000,
    holdDuration: 3000,
    exhaleDuration: 7000,
  },
];

const Breathing = () => {
  const [selectedPatternId, setSelectedPatternId] = useState(breathingPatterns[0].id);
  const [breathCount, setBreathCount] = useState(0);
  
  const selectedPattern = breathingPatterns.find(
    (pattern) => pattern.id === selectedPatternId
  ) || breathingPatterns[0];
  
  const handleBreathComplete = () => {
    setBreathCount((prevCount) => prevCount + 1);
  };
  
  return (
    <MobileLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">Ademhalingsoefeningen</h1>
          <p className="text-muted-foreground">
            Volg het ritme om je ademhaling te verbeteren
          </p>
        </div>
        
        <Card className="glass-morphism">
          <CardHeader className="pb-2">
            <CardTitle>Ademhalingspatroon</CardTitle>
            <CardDescription>
              Kies een patroon dat bij je stemming past
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedPatternId}
              onValueChange={setSelectedPatternId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer een patroon" />
              </SelectTrigger>
              <SelectContent>
                {breathingPatterns.map((pattern) => (
                  <SelectItem key={pattern.id} value={pattern.id}>
                    {pattern.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-4 text-sm">
              <p>{selectedPattern.description}</p>
              <div className="mt-2 text-muted-foreground">
                <p>Inademen: {selectedPattern.inhaleDuration / 1000}s</p>
                <p>Vasthouden: {selectedPattern.holdDuration / 1000}s</p>
                <p>Uitademen: {selectedPattern.exhaleDuration / 1000}s</p>
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
        
        <div className="text-center">
          <div className="text-4xl font-bold text-primary animate-pulse-gentle">
            {breathCount}
          </div>
          <p className="text-muted-foreground">Volledige ademhalingen</p>
        </div>
        
        <Card className="neo-morphism mt-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Voordelen van Ademhalingsoefeningen</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Vermindert stress en angst</li>
              <li>Verbetert concentratie en focus</li>
              <li>Verlaagt de bloeddruk</li>
              <li>Bevordert beter slapen</li>
              <li>Verhoogt energieniveaus</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Breathing;
