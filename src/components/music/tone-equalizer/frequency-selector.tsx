
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrequencySelectorProps } from "./types";
import { HEALING_FREQUENCIES } from "./constants";

export function FrequencySelector({ 
  selectedFrequency, 
  setSelectedFrequency,
  isActive,
  isInitialized
}: FrequencySelectorProps) {
  return (
    <div className="mb-3">
      <Select
        value={selectedFrequency}
        onValueChange={setSelectedFrequency}
        disabled={!isActive || !isInitialized}
      >
        <SelectTrigger className="w-full h-8 text-xs bg-blue-950/50 border-blue-800/50 focus:ring-blue-700/50">
          <SelectValue placeholder="Selecteer frequentie" />
        </SelectTrigger>
        <SelectContent className="bg-blue-950 border-blue-800 text-blue-100">
          {HEALING_FREQUENCIES.map((freq) => (
            <SelectItem key={freq.value} value={freq.value} className="text-xs">
              {freq.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
