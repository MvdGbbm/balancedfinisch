
import React from "react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { BreathingPattern } from "./types";

interface TextInputProps {
  form: UseFormReturn<BreathingPattern & { enableHold1: boolean; enableHold2: boolean }>;
  name: "name" | "description";
  label: string;
  isTextarea?: boolean;
}

export function TextInput({ form, name, label, isTextarea = false }: TextInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isTextarea ? (
              <Textarea {...field} />
            ) : (
              <Input {...field} />
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
}
