
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
  veraUrl?: string;  // Field for Vera voice URL
  marcoUrl?: string; // Field for Marco voice URL
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

const AdminBreathing = () => {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  
  // Audio configuration section
  const [generalAudioUrls, setGeneralAudioUrls] = useState<{
    vera: { inhale: string; hold: string; exhale: string; };
    marco: { inhale: string; hold: string; exhale: string; };
  }>({
    vera: { inhale: "", hold: "", exhale: "" },
    marco: { inhale: "", hold: "", exhale: "" }
  });
  
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
    
    // Load voice URLs
    const savedVeraUrls = localStorage.getItem('veraVoiceUrls');
    const savedMarcoUrls = localStorage.getItem('marcoVoiceUrls');
    
    if (savedVeraUrls) {
      try {
        const parsedUrls = JSON.parse(savedVeraUrls);
        setGeneralAudioUrls(prev => ({
          ...prev,
          vera: parsedUrls
        }));
      } catch (error) {
        console.error("Error loading Vera URLs:", error);
      }
    }
    
    if (savedMarcoUrls) {
      try {
        const parsedUrls = JSON.parse(savedMarcoUrls);
        setGeneralAudioUrls(prev => ({
          ...prev,
          marco: parsedUrls
        }));
      } catch (error) {
        console.error("Error loading Marco URLs:", error);
      }
    }
  }, []);
  
  // Form for editing patterns - updated with new URL fields
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
      veraUrl: "",
      marcoUrl: "",
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
      inhaleUrl: "",
      exhaleUrl: "",
      hold1Url: "",
      hold2Url: "",
      veraUrl: "",
      marcoUrl: "",
    });
    saveToLocalStorage(filtered);
    toast.success("Ademhalingstechniek verwijderd");
  };
  
  // Functions to handle general voice URL updates
  const handleVeraUrlChange = (type: 'inhale' | 'hold' | 'exhale', value: string) => {
    setGeneralAudioUrls(prev => {
      const updated = {
        ...prev,
        vera: {
          ...prev.vera,
          [type]: value
        }
      };
      
      // Save to localStorage
      localStorage.setItem('veraVoiceUrls', JSON.stringify(updated.vera));
      
      return updated;
    });
  };
  
  const handleMarcoUrlChange = (type: 'inhale' | 'hold' | 'exhale', value: string) => {
    setGeneralAudioUrls(prev => {
      const updated = {
        ...prev,
        marco: {
          ...prev.marco,
          [type]: value
        }
      };
      
      // Save to localStorage
      localStorage.setItem('marcoVoiceUrls', JSON.stringify(updated.marco));
      
      return updated;
    });
  };
  
  // Function to test audio
  const playAudio = (url: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        toast.error("Kon audio niet afspelen. Controleer de URL.");
      });
    } else {
      toast.error("Geen audio URL ingesteld");
    }
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

                      {/* Replaced with veraUrl */}
                      <FormField
                        control={form.control}
                        name="veraUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Link className="h-4 w-4" />
                              <span>Audio URL voor Vera stem</span>
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

                      {/* Replaced with marcoUrl */}
                      <FormField
                        control={form.control}
                        name="marcoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Link className="h-4 w-4" />
                              <span>Audio URL voor Marco stem</span>
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

                      {/* We keep one empty spot for balance */}
                      <div></div>
                    </div>

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
        
        {/* Voice configuration section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Stem Configuratie</h2>
          <p className="text-muted-foreground mb-4">
            Configureer de audio URLs voor de ademhalingsfasen voor Vera en Marco stemmen.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vera voice configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Vera Stem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel>Adem in</FormLabel>
                    <Input 
                      value={generalAudioUrls.vera.inhale} 
                      onChange={e => handleVeraUrlChange('inhale', e.target.value)}
                      placeholder="https://..." 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(generalAudioUrls.vera.inhale)}
                    disabled={!generalAudioUrls.vera.inhale}
                  >
                    Afspelen
                  </Button>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel>Houd vast</FormLabel>
                    <Input 
                      value={generalAudioUrls.vera.hold} 
                      onChange={e => handleVeraUrlChange('hold', e.target.value)}
                      placeholder="https://..." 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(generalAudioUrls.vera.hold)}
                    disabled={!generalAudioUrls.vera.hold}
                  >
                    Afspelen
                  </Button>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel>Adem uit</FormLabel>
                    <Input 
                      value={generalAudioUrls.vera.exhale} 
                      onChange={e => handleVeraUrlChange('exhale', e.target.value)}
                      placeholder="https://..." 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(generalAudioUrls.vera.exhale)}
                    disabled={!generalAudioUrls.vera.exhale}
                  >
                    Afspelen
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Marco voice configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Marco Stem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel>Adem in</FormLabel>
                    <Input 
                      value={generalAudioUrls.marco.inhale} 
                      onChange={e => handleMarcoUrlChange('inhale', e.target.value)}
                      placeholder="https://..." 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(generalAudioUrls.marco.inhale)}
                    disabled={!generalAudioUrls.marco.inhale}
                  >
                    Afspelen
                  </Button>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel>Houd vast</FormLabel>
                    <Input 
                      value={generalAudioUrls.marco.hold} 
                      onChange={e => handleMarcoUrlChange('hold', e.target.value)}
                      placeholder="https://..." 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(generalAudioUrls.marco.hold)}
                    disabled={!generalAudioUrls.marco.hold}
                  >
                    Afspelen
                  </Button>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel>Adem uit</FormLabel>
                    <Input 
                      value={generalAudioUrls.marco.exhale} 
                      onChange={e => handleMarcoUrlChange('exhale', e.target.value)}
                      placeholder="https://..." 
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => playAudio(generalAudioUrls.marco.exhale)}
                    disabled={!generalAudioUrls.marco.exhale}
                  >
                    Afspelen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBreathing;
