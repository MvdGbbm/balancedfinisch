
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
      animationEnabled: true,
      animationStyle: "grow",
      animationColor: "primary",
      inhaleText: "Adem in",
      exhaleText: "Adem uit",
      hold1Text: "Vasthouden",
      hold2Text: "Vasthouden"
    }
  });

  // Reset form when selected pattern changes
  React.useEffect(() => {
    if (selectedPattern) {
      form.reset({
        ...selectedPattern,
        animationEnabled: selectedPattern.animationEnabled !== false,
        animationStyle: selectedPattern.animationStyle || "grow",
        animationColor: selectedPattern.animationColor || "primary",
        inhaleText: selectedPattern.inhaleText || "Adem in",
        exhaleText: selectedPattern.exhaleText || "Adem uit",
        hold1Text: selectedPattern.hold1Text || "Vasthouden",
        hold2Text: selectedPattern.hold2Text || "Vasthouden"
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
        animationEnabled: true,
        animationStyle: "grow",
        animationColor: "primary",
        inhaleText: "Adem in",
        exhaleText: "Adem uit",
        hold1Text: "Vasthouden",
        hold2Text: "Vasthouden"
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
            <Tabs defaultValue="basic">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basisinstellingen</TabsTrigger>
                <TabsTrigger value="animation">Animatie</TabsTrigger>
                <TabsTrigger value="text">Teksten</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <div className="space-y-4">
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
                </div>
              </TabsContent>
              
              <TabsContent value="animation">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="animationEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Animatie inschakelen</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="animationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animatiestijl</FormLabel>
                        <Select
                          disabled={!form.watch("animationEnabled")}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecteer een animatiestijl" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="grow">Groeien</SelectItem>
                            <SelectItem value="glow">Gloeien</SelectItem>
                            <SelectItem value="pulse">Pulseren</SelectItem>
                            <SelectItem value="fade">Vervagen</SelectItem>
                            <SelectItem value="none">Geen</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="animationColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animatiekleur</FormLabel>
                        <Select
                          disabled={!form.watch("animationEnabled")}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecteer een kleur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primair</SelectItem>
                            <SelectItem value="cyan">Cyaan</SelectItem>
                            <SelectItem value="blue">Blauw</SelectItem>
                            <SelectItem value="green">Groen</SelectItem>
                            <SelectItem value="purple">Paars</SelectItem>
                            <SelectItem value="orange">Oranje</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="text">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="inhaleText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekst bij inademen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Adem in" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hold1Text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekst bij vasthouden na inademen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Vasthouden" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="exhaleText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekst bij uitademen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Adem uit" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hold2Text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tekst bij vasthouden na uitademen</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Vasthouden" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

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
