
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Save, Trash2 } from "lucide-react";
import { BreathingPattern } from "./types";
import { TextInput } from "./text-input";
import { BreathingDurationInput } from "./breathing-duration-input";
import { HoldControl } from "./hold-control";
import { AudioUrlInput } from "./audio-url-input";
import { EmptyPatternDisplay } from "./empty-pattern-display";

interface PatternFormProps {
  selectedPattern: BreathingPattern | null;
  onSave: (pattern: BreathingPattern) => void;
  onDelete: (id: string) => void;
}

export function PatternForm({ selectedPattern, onSave, onDelete }: PatternFormProps) {
  const form = useForm<BreathingPattern & { enableHold1: boolean; enableHold2: boolean }>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      startUrl: "",
      endUrl: "",
      enableHold1: false,
      enableHold2: false
    }
  });

  // Reset form when selected pattern changes
  React.useEffect(() => {
    if (selectedPattern) {
      form.reset({
        ...selectedPattern,
        enableHold1: selectedPattern.hold1 > 0,
        enableHold2: selectedPattern.hold2 > 0
      });
    } else {
      form.reset({
        id: "",
        name: "",
        description: "",
        inhale: 4,
        hold1: 0,
        exhale: 4,
        hold2: 0,
        cycles: 4,
        startUrl: "",
        endUrl: "",
        enableHold1: false,
        enableHold2: false
      });
    }
  }, [selectedPattern, form]);

  const handleSubmit = (data: BreathingPattern & { enableHold1: boolean; enableHold2: boolean }) => {
    const { enableHold1, enableHold2, ...patternData } = data;
    
    // If hold phases are disabled, set their durations to 0
    if (!enableHold1) {
      patternData.hold1 = 0;
    }
    
    if (!enableHold2) {
      patternData.hold2 = 0;
    }
    
    onSave(patternData);
  };

  if (!selectedPattern) {
    return <EmptyPatternDisplay />;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          {`Bewerk: ${selectedPattern.name}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <TextInput form={form} name="name" label="Naam" />
            <TextInput form={form} name="description" label="Beschrijving" isTextarea={true} />

            <div className="grid grid-cols-2 gap-4">
              <BreathingDurationInput 
                form={form} 
                name="inhale" 
                label="Inademen (seconden)" 
              />

              <HoldControl 
                form={form}
                name="hold1"
                enableName="enableHold1"
                label="Vasthouden na inademen (seconden)"
                enableLabel="Vasthouden na inademen inschakelen"
              />

              <BreathingDurationInput 
                form={form} 
                name="exhale" 
                label="Uitademen (seconden)" 
              />

              <HoldControl 
                form={form}
                name="hold2"
                enableName="enableHold2"
                label="Vasthouden na uitademen (seconden)"
                enableLabel="Vasthouden na uitademen inschakelen"
              />
            </div>

            <BreathingDurationInput 
              form={form} 
              name="cycles" 
              label="Aantal cycli" 
              min="1" 
              max="20" 
            />

            <AudioUrlInput 
              form={form}
              name="startUrl"
              label="Audio URL bij begin oefening"
              description="Deze audio wordt afgespeeld wanneer de ademhalingsoefening begint."
              placeholder="https://voorbeeld.com/start.mp3"
            />

            <AudioUrlInput 
              form={form}
              name="endUrl"
              label="Audio URL bij einde oefening"
              description="Deze audio wordt afgespeeld wanneer de ademhalingsoefening is voltooid."
              placeholder="https://voorbeeld.com/einde.mp3"
            />

            <div className="flex justify-between">
              <Button type="submit" className="mr-2">
                <Save className="mr-2 h-4 w-4" />
                Opslaan
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => onDelete(selectedPattern.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Verwijderen
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
