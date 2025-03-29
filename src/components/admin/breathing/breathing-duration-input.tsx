
import React from "react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { BreathingPattern } from "./types";

interface BreathingDurationInputProps {
  form: UseFormReturn<BreathingPattern & { enableHold1: boolean; enableHold2: boolean }>;
  name: "inhale" | "exhale" | "cycles";
  label: string;
  min?: string;
  max?: string;
}

export function BreathingDurationInput({ 
  form, 
  name, 
  label, 
  min = "1", 
  max 
}: BreathingDurationInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              {...field} 
              type="number" 
              min={min} 
              max={max}
              onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
