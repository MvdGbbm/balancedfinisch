
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BreathingPattern } from "@/lib/types/breathing";
import { toast } from "sonner";

export function useBreathingPatterns() {
  const fetchBreathingPatterns = async (): Promise<BreathingPattern[]> => {
    const { data, error } = await supabase
      .from("breathing_patterns")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching breathing patterns:", error);
      throw new Error(error.message);
    }

    return data || [];
  };

  return useQuery({
    queryKey: ["breathing-patterns"],
    queryFn: fetchBreathingPatterns,
    onError: (error) => {
      console.error("Failed to fetch breathing patterns:", error);
      toast.error("Kon ademhalingspatronen niet laden");
    }
  });
}

// For admin updates
export async function createBreathingPattern(pattern: Omit<BreathingPattern, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("breathing_patterns")
    .insert(pattern)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBreathingPattern(id: string, pattern: Partial<Omit<BreathingPattern, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("breathing_patterns")
    .update(pattern)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBreathingPattern(id: string) {
  const { error } = await supabase
    .from("breathing_patterns")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
