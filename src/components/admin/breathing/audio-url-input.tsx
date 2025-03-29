
import React from "react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { BreathingPattern } from "./types";

interface AudioUrlInputProps {
  form: UseFormReturn<BreathingPattern & { enableHold1: boolean; enableHold2: boolean }>;
  name: "startUrl" | "endUrl";
  label: string;
  description: string;
  placeholder?: string;
}

export function AudioUrlInput({ 
  form, 
  name, 
  label, 
  description, 
  placeholder 
}: AudioUrlInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} placeholder={placeholder} />
          </FormControl>
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
        </FormItem>
      )}
    />
  );
}
