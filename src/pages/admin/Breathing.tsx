
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Save, Trash2, Link } from "lucide-react";
import { toast } from "sonner";
import { BreathingExerciseTest } from "@/components/admin/breathing-exercise-test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for breathing patterns
type BreathingPattern = {
  id: string;
  name: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  description?: string;
  inhaleUrl?: string;
  exhaleUrl?: string;
  hold1Url?: string;
  hold2Url?: string;
};

// Define voice URL type
type VoiceURLs = {
  inhale: string;
  hold: string;
  exhale: string;
};

// Sample data - in a real application this would come from the database
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
  },
];

// Default voice URLs
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
  
  // Voice URL states
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceURLs>(defaultVoiceUrls.marco);
  
  // Load breathing patterns from localStorage when component mounts
  useEffect(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingPatterns(parsedPatterns);
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        // If there's an error, use default patterns
        setBreathingPatterns(defaultBreathingPatterns);
        localStorage.setItem('breathingPatterns', JSON.stringify(defaultBreathingPatterns));
      }
    } else {
      // If no saved patterns, initialize with defaults
      localStorage.setItem('breathingPatterns', JSON.stringify(defaultBreathingPatterns));
    }
    
    // Load voice URLs from localStorage
    loadVoiceUrls();
  }, []);
  
  const loadVoiceUrls = () => {
    // Load Vera voice URLs
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
    
    // Load Marco voice URLs
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
  
  // Form for editing patterns
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
      inhaleUrl: "",
      exhaleUrl: "",
      hold1Url: "",
      hold2Url: "",
    }
  });

  const handleSelectPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    form.reset({
      ...pattern
    });
  };

  const handleCreateNew = () => {
    // Generate a temporary ID for the new pattern
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
    };
    setSelectedPattern(newPattern);
    form.reset(newPattern);
  };

  // Save breathing patterns to localStorage
  const saveToLocalStorage = (patterns: BreathingPattern[]) => {
    localStorage.setItem('breathingPatterns', JSON.stringify(patterns));
  };

  const handleSave = (data: BreathingPattern) => {
    // If selectedPattern exists in breathingPatterns, update it
    const existingPatternIndex = breathingPatterns.findIndex(p => p.id === selectedPattern?.id);
    let updated: BreathingPattern[];
    
    if (existingPatternIndex >= 0) {
      // Update existing pattern
      updated = [...breathingPatterns];
      updated[existingPatternIndex] = { ...data, id: selectedPattern!.id };
      setBreathingPatterns(updated);
      setSelectedPattern(updated[existingPatternIndex]);
      toast.success("Ademhalingstechniek bijgewerkt");
    } else {
      // Add new pattern with a permanent ID
      const newPattern = {
        ...data,
        id: `${Date.now()}`
      };
      updated = [...breathingPatterns, newPattern];
      setBreathingPatterns(updated);
      setSelectedPattern(newPattern);
      toast.success("Nieuwe ademhalingstechniek toegevoegd");
    }
    
    // Save to localStorage
    saveToLocalStorage(updated);
  };

  const handleDelete = (id: string) => {
    const filtered = breathingPatterns.filter(p => p.id !== id);
    setBreathingPatterns(filtered);
    setSelectedPattern(null);
    form.reset({
      id: "",
      name: "",
      description: "",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
    });
    saveToLocalStorage(filtered);
    toast.success("Ademhalingstechniek verwijderd");
  };
  
  // Handle voice URL changes
  const handleVeraUrlChange = (field: keyof VoiceURLs, value: string) => {
    const updatedUrls = { ...veraVoiceUrls, [field]: value };
    setVeraVoiceUrls(updatedUrls);
  };
  
  const handleMarcoUrlChange = (field: keyof VoiceURLs, value: string) => {
    const updatedUrls = { ...marcoVoiceUrls, [field]: value };
    setMarcoVoiceUrls(updatedUrls);
  };
  
  // Save voice URLs to localStorage
  const saveVoiceUrls = () => {
    localStorage.setItem('veraVoiceUrls', JSON.stringify(veraVoiceUrls));
    localStorage.setItem('marcoVoiceUrls', JSON.stringify(marcoVoiceUrls));
    toast.success("Stem audio URLs opgeslagen");
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
              {/* List of breathing patterns */}
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

              {/* Edit form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedPattern ? `Bewerk: ${selectedPattern.name}` : "Selecteer een techniek"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPattern ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
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
                                  <Input {...field} type="number" min="1" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="inhaleUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Link className="h-4 w-4" />
                                  <span>Audio URL voor inademen</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://..." />
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
                                  <Input {...field} type="number" min="0" onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hold1Url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Link className="h-4 w-4" />
                                  <span>Audio URL voor vasthouden</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://..." />
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
                                  <Input {...field} type="number" min="1" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="exhaleUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Link className="h-4 w-4" />
                                  <span>Audio URL voor uitademen</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://..." />
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
                                  <Input {...field} type="number" min="0" onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hold2Url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Link className="h-4 w-4" />
                                  <span>Audio URL voor vasthouden na uitademen</span>
                                </FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://..." />
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
                                <Input {...field} type="number" min="1" max="20" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                              </FormControl>
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
              {/* Vera Voice Config */}
              <Card>
                <CardHeader>
                  <CardTitle>Vera Stem Configuratie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Inademen Audio URL</FormLabel>
                      <Input
                        placeholder="https://..."
                        value={veraVoiceUrls.inhale}
                        onChange={(e) => handleVeraUrlChange('inhale', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Vasthouden Audio URL</FormLabel>
                      <Input
                        placeholder="https://..."
                        value={veraVoiceUrls.hold}
                        onChange={(e) => handleVeraUrlChange('hold', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Deze audio wordt gebruikt voor beide vasthoud-fases</p>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Uitademen Audio URL</FormLabel>
                      <Input
                        placeholder="https://..."
                        value={veraVoiceUrls.exhale}
                        onChange={(e) => handleVeraUrlChange('exhale', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="button" onClick={saveVoiceUrls}>
                        <Save className="mr-2 h-4 w-4" />
                        Opslaan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Marco Voice Config */}
              <Card>
                <CardHeader>
                  <CardTitle>Marco Stem Configuratie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Inademen Audio URL</FormLabel>
                      <Input
                        placeholder="https://..."
                        value={marcoVoiceUrls.inhale}
                        onChange={(e) => handleMarcoUrlChange('inhale', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Vasthouden Audio URL</FormLabel>
                      <Input
                        placeholder="https://..."
                        value={marcoVoiceUrls.hold}
                        onChange={(e) => handleMarcoUrlChange('hold', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Deze audio wordt gebruikt voor beide vasthoud-fases</p>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Uitademen Audio URL</FormLabel>
                      <Input
                        placeholder="https://..."
                        value={marcoVoiceUrls.exhale}
                        onChange={(e) => handleMarcoUrlChange('exhale', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="button" onClick={saveVoiceUrls}>
                        <Save className="mr-2 h-4 w-4" />
                        Opslaan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Test section for breathing exercise with audio */}
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
