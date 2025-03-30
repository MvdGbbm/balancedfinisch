
import React from "react";
import { cn } from "@/lib/utils";
import { PlannerEvent, Meditation } from "@/lib/types";
import { EventItem } from "./event-item";

interface DateGroupProps {
  date: string;
  events: PlannerEvent[];
  meditations: Meditation[];
  onToggleCompletion: (id: string) => void;
  onEdit: (event: PlannerEvent) => void;
  onDelete: (id: string) => void;
  isToday: boolean;
}

export function DateGroup({
  date,
  events,
  meditations,
  onToggleCompletion,
  onEdit,
  onDelete,
  isToday,
}: DateGroupProps) {
  // Sort events within a date by time
  const sortedEvents = [...events].sort((a, b) => {
    // Events with time come before events without time
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    if (!a.time && !b.time) return 0;
    
    // Sort by time
    return a.time!.localeCompare(b.time!);
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-2 animate-slide-in">
      <div className="flex items-center gap-2">
        <h2 className={cn(
          "text-sm font-medium",
          isToday ? "text-primary" : "text-muted-foreground"
        )}>
          {isToday ? "Vandaag" : formatDate(date)}
        </h2>
        {isToday && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Vandaag
          </span>
        )}
      </div>
      
      {sortedEvents.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          meditations={meditations}
          onToggleCompletion={onToggleCompletion}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
