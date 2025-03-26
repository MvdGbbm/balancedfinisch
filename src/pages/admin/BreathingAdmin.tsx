
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Save, Trash2, Waves } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BreathingTechnique } from "@/lib/types";

const BreathingAdmin = () => {
  const [breathingTechniques, setBreathingTechniques] = useState<BreathingTechnique[]>([]);
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  
  // Load breathing techniques from localStorage when component mounts
  useEffect(() => {
    const savedPatterns = localStorage.getItem('breathingPatterns');
    if (savedPatterns) {
      try {
        const parsedPatterns = JSON.parse(savedPatterns);
        setBreathingTechniques(parsedPatterns);
      } catch (error) {
        console.error("Error loading breathing patterns:", error);
        // If there's an error, use default patterns
        setBreathingTechniques([]);
      }
    }
  }, []);
  
  // Form for editing patterns
  const form = useForm<BreathingTechnique>({
    defaultValues: {
      id: "",
      name: "",
      technique: "",
      description: "",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      veraUrl: "",
      marcoUrl: "",
    }
  });

  const handleSelectTechnique = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    form.reset({
      ...technique
    });
  };

  const handleCreateNew = () => {
    // Generate a temporary ID for the new pattern
    const newId = `temp_${Date.now()}`;
    const newTechnique = {
      id: newId,
      name: "New Technique",
      technique: "new-technique",
      description: "Description of the technique",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      veraUrl: "",
      marcoUrl: "",
    };
    setSelectedTechnique(newTechnique);
    form.reset(newTechnique);
  };

  // Save breathing patterns to localStorage
  const saveToLocalStorage = (techniques: BreathingTechnique[]) => {
    localStorage.setItem('breathingPatterns', JSON.stringify(techniques));
  };

  const handleSave = (data: BreathingTechnique) => {
    // If selectedTechnique exists in breathingTechniques, update it
    const existingTechniqueIndex = breathingTechniques.findIndex(p => p.id === selectedTechnique?.id);
    let updated: BreathingTechnique[];
    
    if (existingTechniqueIndex >= 0) {
      // Update existing technique
      updated = [...breathingTechniques];
      updated[existingTechniqueIndex] = { ...data, id: selectedTechnique!.id };
      setBreathingTechniques(updated);
      setSelectedTechnique(updated[existingTechniqueIndex]);
      toast.success("Breathing technique updated");
    } else {
      // Add new technique with a permanent ID
      const newTechnique = {
        ...data,
        id: `${Date.now()}`
      };
      updated = [...breathingTechniques, newTechnique];
      setBreathingTechniques(updated);
      setSelectedTechnique(newTechnique);
      toast.success("New breathing technique added");
    }
    
    // Save to localStorage
    saveToLocalStorage(updated);
  };

  const handleDelete = (id: string) => {
    const filtered = breathingTechniques.filter(p => p.id !== id);
    setBreathingTechniques(filtered);
    setSelectedTechnique(null);
    form.reset({
      id: "",
      name: "",
      technique: "",
      description: "",
      inhale: 4,
      hold1: 0,
      exhale: 4,
      hold2: 0,
      cycles: 4,
      veraUrl: "",
      marcoUrl: "",
    });
    saveToLocalStorage(filtered);
    toast.success("Breathing technique deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Breathing Techniques</h1>
            <p className="text-muted-foreground">
              Manage breathing techniques in the app
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Technique
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of breathing techniques */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>All Techniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cycles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breathingTechniques.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No techniques added yet. Create your first one!
                        </TableCell>
                      </TableRow>
                    ) : (
                      breathingTechniques.map((technique) => (
                        <TableRow 
                          key={technique.id}
                          className={`cursor-pointer ${selectedTechnique?.id === technique.id ? 'bg-primary/10' : ''}`}
                          onClick={() => handleSelectTechnique(technique)}
                        >
                          <TableCell className="font-medium">{technique.name}</TableCell>
                          <TableCell>{technique.cycles}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Edit form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedTechnique ? `Edit: ${selectedTechnique.name}` : "Select a technique"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTechnique ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="technique"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Technique ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., box-breathing, 4-7-8" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
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
                            <FormLabel>Inhale (seconds)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="exhale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exhale (seconds)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hold1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hold after inhale (seconds)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hold2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hold after exhale (seconds)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cycles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of cycles</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" max="20" onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="veraUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vera Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="marcoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marco Audio URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button type="submit" className="mr-2">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDelete(selectedTechnique.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  Select a breathing technique to edit, or create a new one.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BreathingAdmin;
