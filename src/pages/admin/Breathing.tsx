
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { BreathingExerciseTest } from "@/components/admin/breathing-exercise-test";
import { PatternList } from "@/components/admin/breathing/pattern-list";
import { PatternForm } from "@/components/admin/breathing/pattern-form";
import { VoiceUrlForm } from "@/components/admin/breathing/voice-url-form";
import { useBreathingPatterns } from "@/components/admin/breathing/use-breathing-patterns";
import { useVoiceUrls } from "@/components/admin/breathing/use-voice-urls";

const AdminBreathing = () => {
  const [activeTab, setActiveTab] = useState<"patterns" | "voices">("patterns");
  const { 
    breathingPatterns, 
    selectedPattern, 
    selectPattern, 
    createNewPattern, 
    savePattern, 
    deletePattern 
  } = useBreathingPatterns();
  
  const { 
    veraVoiceUrls, 
    marcoVoiceUrls, 
    saveVeraVoiceUrls, 
    saveMarcoVoiceUrls 
  } = useVoiceUrls();

  const handleSelectPattern = (pattern: BreathingPattern) => {
    selectPattern(pattern);
  };

  const handleCreateNew = () => {
    createNewPattern();
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
              <PatternList 
                patterns={breathingPatterns}
                selectedPattern={selectedPattern}
                onSelectPattern={handleSelectPattern}
              />

              <PatternForm 
                selectedPattern={selectedPattern}
                onSave={savePattern}
                onDelete={deletePattern}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="voices">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VoiceUrlForm 
                title="Vera Stem Configuratie"
                voiceUrls={veraVoiceUrls}
                onSave={saveVeraVoiceUrls}
              />
              
              <VoiceUrlForm 
                title="Marco Stem Configuratie"
                voiceUrls={marcoVoiceUrls}
                onSave={saveMarcoVoiceUrls}
              />
            </div>
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
