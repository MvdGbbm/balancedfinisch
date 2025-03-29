
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Soundscape } from "@/lib/types";

interface SoundscapeSelectorProps {
  soundscapes: Soundscape[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SoundscapeSelector: React.FC<SoundscapeSelectorProps> = ({
  soundscapes,
  value,
  onChange,
  placeholder = "Selecteer een geluid..."
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {soundscapes.map((soundscape) => (
          <SelectItem key={soundscape.id} value={soundscape.id}>
            {soundscape.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
