
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BreathingExerciseTester } from "./breathing-exercise/breathing-exercise-tester";
import { BreathingPattern } from "@/lib/types";
interface BreathingExerciseTestProps {
  pattern: BreathingPattern | null;
}
export function BreathingExerciseTest({
  pattern
}: BreathingExerciseTestProps) {
  if (!pattern) {
    return <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Selecteer een ademhalingstechniek om te testen
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardContent>
        <BreathingExerciseTester pattern={pattern} />
      </CardContent>
    </Card>;
}
