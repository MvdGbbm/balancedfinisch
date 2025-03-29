
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlannerEvent, Meditation } from "@/lib/types";

interface EventItemProps {
  event: PlannerEvent;
  meditations: Meditation[];
  onToggleCompletion: (id: string) => void;
  onEdit: (event: PlannerEvent) => void;
  onDelete: (id: string) => void;
}

export function EventItem({
  event,
  meditations,
  onToggleCompletion,
  onEdit,
  onDelete,
}: EventItemProps) {
  return (
    <Card 
      className={cn(
        "neo-morphism overflow-hidden border-l-4 transition-colors",
        event.completed 
          ? "border-l-green-500 bg-green-50/50 dark:bg-green-900/10" 
          : "border-l-blue-500"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={event.completed}
            onCheckedChange={() => onToggleCompletion(event.id)}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className={cn(
                "font-medium truncate",
                event.completed && "line-through text-muted-foreground"
              )}>
                {event.title}
              </h3>
              
              <div className="flex items-center gap-1 ml-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(event)}
                >
                  <span className="sr-only">Bewerken</span>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onDelete(event.id)}
                >
                  <span className="sr-only">Verwijderen</span>
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {event.time && (
                <span className="text-xs text-muted-foreground">
                  Tijd: {event.time}
                </span>
              )}
              
              {event.duration && (
                <span className="text-xs text-muted-foreground">
                  Duur: {event.duration} min
                </span>
              )}
              
              {event.meditationId && (
                <span className="text-xs text-primary">
                  {meditations.find(m => m.id === event.meditationId)?.title || "Meditatie"}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
