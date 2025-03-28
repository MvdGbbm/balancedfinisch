
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Define props for the component
interface BreathExerciseProps {
  exerciseType: "box" | "4-7-8";
  activeVoice: "vera" | "marco" | null;
  isPlayingVoice: boolean;
}

export function BreathExercise({ 
  exerciseType, 
  activeVoice, 
  isPlayingVoice 
}: BreathExerciseProps) {
  
  const getTechniqueText = () => {
    return exerciseType === "box" ? "Box Breathing" : "4-7-8 Techniek";
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">{getTechniqueText()}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {exerciseType === "box" 
              ? "4 seconden inademen, 4 seconden vasthouden, 4 seconden uitademen, 4 seconden pauze" 
              : "4 seconden inademen, 7 seconden vasthouden, 8 seconden uitademen"}
          </p>
          
          {activeVoice && (
            <p className="text-sm mt-2">
              Stembegeleiding: <span className="font-medium">{activeVoice === "vera" ? "Vera" : "Marco"}</span>
              {isPlayingVoice ? " (actief)" : " (gepauzeerd)"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
