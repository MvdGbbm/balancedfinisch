
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      endUrl: "",
      animationEnabled: true,
      animationStyle: "grow",
      animationColor: "#00b8d9"
    }
  });

  // Reset form when selected pattern changes
  React.useEffect(() => {
    if (selectedPattern) {
      form.reset({
        ...selectedPattern,
        // Set default animation values if they don't exist
        animationEnabled: selectedPattern.animationEnabled !== undefined ? selectedPattern.animationEnabled : true,
        animationStyle: selectedPattern.animationStyle || "grow",
        animationColor: selectedPattern.animationColor || "#00b8d9"
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
        animationEnabled: true,
        animationStyle: "grow",
        animationColor: "#00b8d9"
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
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basis</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="animation">Animatie</TabsTrigger>
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
                </div>
              </TabsContent>
              
              <TabsContent value="timing">
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
                  
                  <FormField
                    control={form.control}
                    name="cycles"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
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
              
              <TabsContent value="audio">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="startUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio URL bij begin oefening</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://voorbeeld.com/start.mp3" />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Deze audio wordt afgespeeld wanneer de ademhalingsoefening begint.
                        </FormDescription>
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
                          <Input {...field} placeholder="https://voorbeeld.com/end.mp3" />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Deze audio wordt afgespeeld wanneer de ademhalingsoefening voltooid is.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="animation">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="animationEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Animatie inschakelen</FormLabel>
                          <FormDescription>
                            Schakel de animatie in tijdens de ademhalingsoefening.
                          </FormDescription>
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
                        <FormDescription>
                          Kies het type animatie voor de ademhalingscirkel.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="animationColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animatiekleur</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              {...field} 
                              type="color"
                              className="w-12 h-10 p-1"
                            />
                          </FormControl>
                          <Input 
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1"
                          />
                        </div>
                        <FormDescription>
                          Kies de kleur voor de ademhalingscirkel.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between pt-4">
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
