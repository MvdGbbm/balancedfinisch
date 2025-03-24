
import React from "react";
import { Meditation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Radio } from "lucide-react";

interface RadioStreamItemProps {
  stream: Meditation;
  isSelected: boolean;
  onSelect: () => void;
}

export function RadioStreamItem({ stream, isSelected, onSelect }: RadioStreamItemProps) {
  return (
    <Card 
      className={`transition-all cursor-pointer hover:bg-accent/20 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          isSelected ? 'bg-primary/20' : 'bg-accent/30'
        }`}>
          <Radio className={`h-4 w-4 ${
            isSelected ? 'text-primary' : 'text-muted-foreground'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium line-clamp-1">{stream.title}</h3>
          {stream.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{stream.description}</p>
          )}
          <p className="text-xs text-muted-foreground opacity-70 mt-1">
            Audio URL: {stream.audioUrl.substring(0, 30)}...
          </p>
        </div>
        <Button 
          variant={isSelected ? "secondary" : "ghost"} 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="ml-auto shrink-0"
        >
          {isSelected ? "Geselecteerd" : "Selecteer"}
        </Button>
      </CardContent>
    </Card>
  );
}
