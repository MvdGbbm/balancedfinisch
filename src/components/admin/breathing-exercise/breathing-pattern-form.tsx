
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { BreathingPattern } from "@/lib/types";

interface BreathingPatternFormProps {
  form: UseFormReturn<BreathingPattern>;
  onSubmit: (data: BreathingPattern) => void;
  onDelete: (id: string) => void;
  selectedPattern: BreathingPattern | null;
}

export function BreathingPatternForm({ 
  form, 
  onSubmit, 
  onDelete, 
  selectedPattern 
}: BreathingPatternFormProps) {
  if (!selectedPattern) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Selecteer een ademhalingstechniek om te bewerken, of maak een nieuwe aan.
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
  );
}
