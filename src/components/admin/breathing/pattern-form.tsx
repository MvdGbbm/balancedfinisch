import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Trash2 } from "lucide-react";
import { BreathingPattern } from "./types";

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
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Selecteer een techniek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Selecteer een ademhalingstechniek om te bewerken, of maak een nieuwe aan.
          </div>
        </CardContent>
      </Card>
    );
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschrijving</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="inhale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inademen (seconden)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="1" 
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableHold1"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Vasthouden na inademen inschakelen</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hold1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vasthouden na inademen (seconden)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="0" 
                          disabled={!form.watch("enableHold1")}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="exhale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uitademen (seconden)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        min="1" 
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableHold2"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Vasthouden na uitademen inschakelen</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hold2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vasthouden na uitademen (seconden)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          min="0" 
                          disabled={!form.watch("enableHold2")}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="cycles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aantal cycli</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="1" 
                      max="20" 
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio URL bij begin oefening</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://voorbeeld.com/start.mp3" />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Deze audio wordt afgespeeld wanneer de ademhalingsoefening begint.
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio URL bij einde oefening</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://voorbeeld.com/einde.mp3" />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Deze audio wordt afgespeeld wanneer de ademhalingsoefening is voltooid.
                  </div>
                </FormItem>
              )}
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
