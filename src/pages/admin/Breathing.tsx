import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BreathingExerciseTest } from "@/components/admin/breathing-exercise-test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  endUrl: string;
};

type VoiceURLs = {
  inhale: string;
  hold: string;
  exhale: string;
};

const defaultBreathingPatterns: BreathingPattern[] = [
  {
    id: "1",
    name: "4-7-8 Techniek",
    description: "Een kalmerende ademhalingstechniek die helpt bij ontspanning",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 5,
    endUrl: "",
  },
  {
    id: "2",
    name: "Box Breathing",
    description: "Vierkante ademhaling voor focus en kalmte",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4, 
    cycles: 4,
    endUrl: "",
  },
  {
    id: "3",
    name: "Relaxerende Ademhaling",
    description: "Eenvoudige techniek voor diepe ontspanning",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 0,
    cycles: 6,
    endUrl: "",
  },
];

const defaultVoiceUrls: Record<string, VoiceURLs> = {
  vera: {
    inhale: "",
    hold: "",
    exhale: "",
  },
  marco: {
    inhale: "",
    hold: "",
    exhale: "",
  }
};

const AdminBreathing = () => {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [activeTab, setActiveTab] = useState<"patterns" | "voices">("patterns");
  
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);
  
  useEffect(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingPatterns(parsedPatterns);
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        setBreathingPatterns(defaultBreathingPatterns);
        localStorage.setItem('breathingPatterns', JSON.stringify(defaultBreathingPatterns));
      }
    } else {
      localStorage.setItem('breathingPatterns', JSON.stringify(defaultBreathingPatterns));
    }
    
    loadVoiceUrls();
  }, []);
  
  const loadVoiceUrls = () => {
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setVeraVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Vera voice URLs:", error);
        setVeraVoiceUrls(defaultVoiceUrls.vera);
      }
    }
    
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setMarcoVoiceUrls(parsedUrls);
      } catch (error) {
        console.error("Error loading Marco voice URLs:", error);
        setMarcoVoiceUrls(defaultVoiceUrls.marco);
      }
    }
  };
  
  const patternForm = useForm<BreathingPattern>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      endUrl: "",
    }
  });

  const veraForm = useForm<VoiceURLs>({
    defaultValues: veraVoiceUrls
  });

  const marcoForm = useForm<VoiceURLs>({
    defaultValues: marcoVoiceUrls
  });

  useEffect(() => {
    veraForm.reset(veraVoiceUrls);
  }, [veraVoiceUrls]);

  useEffect(() => {
    marcoForm.reset(marcoVoiceUrls);
  }, [marcoVoiceUrls]);

  const handleSelectPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    patternForm.reset({
      ...pattern
    });
  };

  const handleCreateNew = () => {
    const newId = `temp_${Date.now()}`;
    const newPattern = {
      id: newId,
      name: "Nieuwe Techniek",
      description: "Beschrijving van de techniek",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      endUrl: "",
    };
    setSelectedPattern(newPattern);
    patternForm.reset(newPattern);
  };

  const saveToLocalStorage = (patterns: BreathingPattern[]) => {
    localStorage.setItem('breathingPatterns', JSON.stringify(patterns));
  };

  const handleSave = (data: BreathingPattern) => {
    const existingPatternIndex = breathingPatterns.findIndex(p => p.id === selectedPattern?.id);
    let updated: BreathingPattern[];
    
    if (existingPatternIndex >= 0) {
      updated = [...breathingPatterns];
      updated[existingPatternIndex] = { ...data, id: selectedPattern!.id };
      setBreathingPatterns(updated);
      setSelectedPattern(updated[existingPatternIndex]);
      toast.success("Ademhalingstechniek bijgewerkt");
    } else {
      const newPattern = {
        ...data,
        id: `${Date.now()}`
      };
      updated = [...breathingPatterns, newPattern];
      setBreathingPatterns(updated);
      setSelectedPattern(newPattern);
      toast.success("Nieuwe ademhalingstechniek toegevoegd");
    }
    
    saveToLocalStorage(updated);
  };

  const handleDelete = (id: string) => {
    const filtered = breathingPatterns.filter(p => p.id !== id);
    setBreathingPatterns(filtered);
    setSelectedPattern(null);
    patternForm.reset({
      id: "",
      name: "",
      description: "",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      endUrl: "",
    });
    saveToLocalStorage(filtered);
    toast.success("Ademhalingstechniek verwijderd");
  };
  
  const handleVeraUrlChange = (field: keyof VoiceURLs, value: string) => {
    const updatedUrls = { ...veraVoiceUrls, [field]: value };
    setVeraVoiceUrls(updatedUrls);
  };
  
  const handleMarcoUrlChange = (field: keyof VoiceURLs, value: string) => {
    const updatedUrls = { ...marcoVoiceUrls, [field]: value };
    setMarcoVoiceUrls(updatedUrls);
  };
  
  const saveVoiceUrls = () => {
    localStorage.setItem('veraVoiceUrls', JSON.stringify(veraVoiceUrls));
    localStorage.setItem('marcoVoiceUrls', JSON.stringify(marcoVoiceUrls));
    toast.success("Stem audio URLs opgeslagen");
  };

  const onVeraSubmit = (data: VoiceURLs) => {
    setVeraVoiceUrls(data);
    localStorage.setItem('veraVoiceUrls', JSON.stringify(data));
    toast.success("Vera stem configuratie opgeslagen");
  };

  const onMarcoSubmit = (data: VoiceURLs) => {
    setMarcoVoiceUrls(data);
    localStorage.setItem('marcoVoiceUrls', JSON.stringify(data));
    toast.success("Marco stem configuratie opgeslagen");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ademhalingsoefeningen</h1>
            <p className="text-muted-foreground">
              Beheer de ademhalingsoefeningen in de app
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Techniek
          </Button>
        </div>
        
        <Tabs 
          defaultValue="patterns" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "patterns" | "voices")}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="patterns">Ademhalingstechnieken</TabsTrigger>
            <TabsTrigger value="voices">Stem Configuratie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="patterns">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Ademhalingstechnieken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {breathingPatterns.map((pattern) => (
                      <Button
                        key={pattern.id}
                        variant={selectedPattern?.id === pattern.id ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => handleSelectPattern(pattern)}
                      >
                        {pattern.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedPattern ? `Bewerk: ${selectedPattern.name}` : "Selecteer een techniek"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPattern ? (
                    <Form {...patternForm}>
                      <form onSubmit={patternForm.handleSubmit(handleSave)} className="space-y-4">
                        <FormField
                          control={patternForm.control}
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
                          control={patternForm.control}
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
                            control={patternForm.control}
                            name="inhale"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inademen (seconden)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="1" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={patternForm.control}
                            name="hold1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vasthouden na inademen (seconden)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="0" onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={patternForm.control}
                            name="exhale"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Uitademen (seconden)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="1" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={patternForm.control}
                            name="hold2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vasthouden na uitademen (seconden)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="0" onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={patternForm.control}
                          name="cycles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aantal cycli</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" max="20" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={patternForm.control}
                          name="endUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Audio URL bij einde oefening</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://voorbeeld.com/einde.mp3" />
                              </FormControl>
                              <div className="text-xs text-muted-foreground">Deze audio wordt afgespeeld wanneer de ademhalingsoefening is voltooid.</div>
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
                            onClick={() => handleDelete(selectedPattern.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Verwijderen
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      Selecteer een ademhalingstechniek om te bewerken, of maak een nieuwe aan.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="voices">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vera Stem Configuratie</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...veraForm}>
                    <form onSubmit={veraForm.handleSubmit(onVeraSubmit)} className="space-y-4">
                      <FormField
                        control={veraForm.control}
                        name="inhale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inademen Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://voorbeeld.com/adem-in.mp3" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={veraForm.control}
                        name="hold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vasthouden Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://voorbeeld.com/vasthouden.mp3" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={veraForm.control}
                        name="exhale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uitademen Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://voorbeeld.com/adem-uit.mp3" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Opslaan
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Marco Stem Configuratie</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...marcoForm}>
                    <form onSubmit={marcoForm.handleSubmit(onMarcoSubmit)} className="space-y-4">
                      <FormField
                        control={marcoForm.control}
                        name="inhale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inademen Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://voorbeeld.com/adem-in.mp3" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={marcoForm.control}
                        name="hold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vasthouden Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://voorbeeld.com/vasthouden.mp3" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={marcoForm.control}
                        name="exhale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uitademen Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://voorbeeld.com/adem-uit.mp3" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Opslaan
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Test Ademhalingsoefening</h2>
          <p className="text-muted-foreground mb-4">
            Test de ademhalingsoefening met audio begeleiding hieronder. Selecteer Vera of Marco om hun stem te horen.
          </p>
          <BreathingExerciseTest pattern={selectedPattern} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBreathing;
