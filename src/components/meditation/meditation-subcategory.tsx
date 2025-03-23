
import React from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { MeditationItem } from "./meditation-item";
import { Meditation } from "@/lib/types";

interface MeditationSubcategoryProps {
  tag: string;
  meditations: Meditation[];
  selectedMeditationId: string | null;
  onSelectMeditation: (meditation: Meditation) => void;
}

export function MeditationSubcategory({ 
  tag, 
  meditations, 
  selectedMeditationId, 
  onSelectMeditation 
}: MeditationSubcategoryProps) {
  return (
    <Collapsible 
      key={tag}
      className="border rounded-lg overflow-hidden"
      defaultOpen={true}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
        <span className="font-medium capitalize">{tag}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="divide-y">
          {meditations.map((meditation) => (
            <MeditationItem
              key={meditation.id}
              meditation={meditation}
              isSelected={selectedMeditationId === meditation.id}
              onSelect={onSelectMeditation}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
