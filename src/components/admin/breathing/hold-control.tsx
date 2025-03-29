
import React from "react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { BreathingPattern } from "./types";

interface HoldControlProps {
  form: UseFormReturn<BreathingPattern & { enableHold1: boolean; enableHold2: boolean }>;
  name: "hold1" | "hold2";
  enableName: "enableHold1" | "enableHold2";
  label: string;
  enableLabel: string;
}

export function HoldControl({ form, name, enableName, label, enableLabel }: HoldControlProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={enableName}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>{enableLabel}</FormLabel>
          </FormItem>
        )}
      />
      
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
                min="0" 
                disabled={!form.watch(enableName)}
                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
