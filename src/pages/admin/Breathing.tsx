
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BreathingExerciseTest } from "@/components/admin/breathing-exercise-test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreathingPattern } from "@/lib/types";
import { VoiceUrls } from "@/components/admin/breathing-exercise/types";
import { BreathingPatternList } from "@/components/admin/breathing-exercise/breathing-pattern-list";
import { BreathingPatternEditor } from "@/components/admin/breathing-exercise/breathing-pattern-editor";
import { VoiceConfigSection } from "@/components/admin/breathing-exercise/voice-config-section";

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
    inhaleText: "Adem in via de neus",
    hold1Text: "Houd je adem vast",
    exhaleText: "Adem uit via de mond",
    inhaleUrl: "",
    exhaleUrl: ""
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
    inhaleText: "Inademen",
    hold1Text: "Vasthouden",
    exhaleText: "Uitademen",
    hold2Text: "Pauze",
    inhaleUrl: "",
    exhaleUrl: ""
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
    inhaleText: "Adem rustig in",
    hold1Text: "Even vasthouden",
    exhaleText: "Adem langzaam uit",
    inhaleUrl: "",
    exhaleUrl: ""
  }
];

const defaultVoiceUrls: Record<string, VoiceUrls> = {
  vera: {
    start: "",
    inhale: "",
    hold: "",
    exhale: "",
    end: ""
  },
  marco: {
    start: "",
    inhale: "",
    hold: "",
    exhale: "",
    end: ""
  }
};

const AdminBreathing = () => {
  const [breathingPatterns, setBreathingPatterns] = useState<BreathingPattern[]>(defaultBreathingPatterns);
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  const [activeTab, setActiveTab] = useState<"patterns" | "voices">("patterns");
  const [veraVoiceUrls, setVeraVoiceUrls] = useState<VoiceUrls>(defaultVoiceUrls.vera);
  const [marcoVoiceUrls, setMarcoVoiceUrls] = useState<VoiceUrls>(defaultVoiceUrls.marco);

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
      inhaleText: "",
      hold1Text: "",
      exhaleText: "",
      hold2Text: "",
      startUrl: "",
      endUrl: ""
    }
  });

  const veraForm = useForm<VoiceUrls>({
    defaultValues: veraVoiceUrls
  });

  const marcoForm = useForm<VoiceUrls>({
    defaultValues: marcoVoiceUrls
  });

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

  useEffect(() => {
    veraForm.reset(veraVoiceUrls);
  }, [veraVoiceUrls]);

  useEffect(() => {
    marcoForm.reset(marcoVoiceUrls);
  }, [marcoVoiceUrls]);

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

  const handleSelectPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    patternForm.reset({ ...pattern });
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
      startUrl: "",
      endUrl: ""
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
      updated[existingPatternIndex] = {
        ...data,
        id: selectedPattern!.id
      };
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
      startUrl: "",
      endUrl: ""
    });
    saveToLocalStorage(filtered);
    toast.success("Ademhalingstechniek verwijderd");
  };

  const onVeraSubmit = (data: VoiceUrls) => {
    setVeraVoiceUrls(data);
    localStorage.setItem('veraVoiceUrls', JSON.stringify(data));
    toast.success("Vera stem configuratie opgeslagen");
  };

  const onMarcoSubmit = (data: VoiceUrls) => {
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
          onValueChange={value => setActiveTab(value as "patterns" | "voices")} 
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="patterns">Ademhalingstechnieken</TabsTrigger>
            <TabsTrigger value="voices">Stem Configuratie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="patterns">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <BreathingPatternList 
                patterns={breathingPatterns}
                selectedPattern={selectedPattern}
                onPatternSelect={handleSelectPattern}
              />

              <BreathingPatternEditor 
                selectedPattern={selectedPattern}
                patternForm={patternForm}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="voices">
            <VoiceConfigSection 
              veraForm={veraForm}
              marcoForm={marcoForm}
              onVeraSubmit={onVeraSubmit}
              onMarcoSubmit={onMarcoSubmit}
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <BreathingExerciseTest pattern={selectedPattern} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBreathing;
