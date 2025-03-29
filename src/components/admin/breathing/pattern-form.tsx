
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Save, Trash2 } from "lucide-react";
import { BreathingPattern } from "./types";

interface PatternFormProps {
  selectedPattern: BreathingPattern | null;
  onSave: (pattern: BreathingPattern) => void;
  onDelete: (id: string) => void;
}

export function PatternForm({ selectedPattern, onSave, onDelete }: PatternFormProps) {
  const form = useForm<BreathingPattern>({
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
      endUrl: ""
    }
  });

  // Reset form when selected pattern changes
  React.useEffect(() => {
    if (selectedPattern) {
      form.reset({
        ...selectedPattern
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
        endUrl: ""
      });
    }
  }, [selectedPattern, form]);

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
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
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
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
