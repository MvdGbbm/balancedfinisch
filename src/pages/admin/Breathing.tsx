
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Save, Trash2, Link, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BreathingExerciseTest } from "@/components/admin/breathing-exercise-test";
import { useBreathingPatterns, createBreathingPattern, updateBreathingPattern, deleteBreathingPattern } from "@/hooks/use-breathing-patterns";
import { BreathingPattern } from "@/lib/types/breathing";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AdminBreathing = () => {
  const queryClient = useQueryClient();
  const { data: breathingPatterns = [], isLoading, error } = useBreathingPatterns();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  
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
      inhale_url: "",
      exhale_url: "",
      hold1_url: "",
      hold2_url: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  });

  const createMutation = useMutation({
    mutationFn: (pattern: Omit<BreathingPattern, "id" | "created_at" | "updated_at">) => 
      createBreathingPattern(pattern),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["breathing-patterns"] });
      setSelectedPattern(data);
      toast.success("Nieuwe ademhalingstechniek toegevoegd");
    },
    onError: (error) => {
      console.error("Error creating pattern:", error);
      toast.error("Kon ademhalingstechniek niet opslaan");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, pattern }: { id: string, pattern: Partial<Omit<BreathingPattern, "id" | "created_at" | "updated_at">> }) => 
      updateBreathingPattern(id, pattern),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["breathing-patterns"] });
      setSelectedPattern(data);
      toast.success("Ademhalingstechniek bijgewerkt");
    },
    onError: (error) => {
      console.error("Error updating pattern:", error);
      toast.error("Kon ademhalingstechniek niet bijwerken");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBreathingPattern(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["breathing-patterns"] });
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
        inhale_url: "",
        exhale_url: "",
        hold1_url: "",
        hold2_url: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      toast.success("Ademhalingstechniek verwijderd");
    },
    onError: (error) => {
      console.error("Error deleting pattern:", error);
      toast.error("Kon ademhalingstechniek niet verwijderen");
    }
  });

  const handleSelectPattern = (pattern: BreathingPattern) => {
    setSelectedPattern(pattern);
    form.reset({
      ...pattern
    });
  };

  const handleCreateNew = () => {
    // Create new pattern template with default values
    const newPattern: BreathingPattern = {
      id: "new", // Temporary ID, will be replaced on save
      name: "Nieuwe Techniek",
      description: "Beschrijving van de techniek",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      inhale_url: "",
      exhale_url: "",
      hold1_url: "",
      hold2_url: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedPattern(newPattern);
    form.reset(newPattern);
  };

  const handleSave = (data: BreathingPattern) => {
    const { id, created_at, updated_at, ...patternData } = data;
    
    if (id === "new" || !breathingPatterns.some(p => p.id === id)) {
      // Create new pattern
      createMutation.mutate(patternData);
    } else {
      // Update existing pattern
      updateMutation.mutate({ id, pattern: patternData });
    }
  };

  const handleDelete = (id: string) => {
    if (id === "new") {
      // Just reset the form for new unsaved patterns
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
        inhale_url: "",
        exhale_url: "",
        hold1_url: "",
        hold2_url: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else {
      // Delete from database
      deleteMutation.mutate(id);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

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

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-500">
                Er is een fout opgetreden bij het laden van de ademhalingstechnieken.
              </div>
            </CardContent>
          </Card>
        ) : (
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
                              <Textarea {...field} value={field.value || ""} />
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
                          name="inhale_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <Link className="h-4 w-4" />
                                <span>Audio URL voor inademen</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." value={field.value || ""} />
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
                          name="hold1_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <Link className="h-4 w-4" />
                                <span>Audio URL voor vasthouden</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." value={field.value || ""} />
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
                          name="exhale_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <Link className="h-4 w-4" />
                                <span>Audio URL voor uitademen</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." value={field.value || ""} />
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
                          name="hold2_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-1">
                                <Link className="h-4 w-4" />
                                <span>Audio URL voor vasthouden na uitademen</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." value={field.value || ""} />
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
                        <Button type="submit" className="mr-2" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Opslaan...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Opslaan
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleDelete(selectedPattern.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verwijderen...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Verwijderen
                            </>
                          )}
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
        )}
        
        {/* Test section for breathing exercise with audio */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Test Ademhalingsoefening</h2>
          <p className="text-muted-foreground mb-4">
            Test de ademhalingsoefening met audio begeleiding hieronder. De audio url's worden automatisch afgespeeld bij elke fase.
          </p>
          <BreathingExerciseTest pattern={selectedPattern} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBreathing;
