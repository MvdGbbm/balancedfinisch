
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlannerEvent } from "@/lib/types";

const Planner = () => {
  const { 
    plannerEvents, 
    meditations,
    addPlannerEvent, 
    updatePlannerEvent, 
    deletePlannerEvent,
    toggleEventCompletion
  } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [meditationId, setMeditationId] = useState<string | undefined>(undefined);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  
  const resetForm = () => {
    setTitle("");
    setDate(new Date().toISOString().split('T')[0]);
    setTime("");
    setDuration(undefined);
    setMeditationId(undefined);
    setCurrentEventId(null);
  };
  
  const handleOpenNewEvent = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleEditEvent = (event: PlannerEvent) => {
    setTitle(event.title);
    setDate(event.date || "");
    setTime(event.time || "");
    setDuration(event.duration);
    setMeditationId(event.meditationId);
    setCurrentEventId(event.id);
    setIsDialogOpen(true);
  };
  
  const handleDeleteEvent = (id: string) => {
    const confirmDelete = window.confirm("Weet je zeker dat je dit evenement wilt verwijderen?");
    if (confirmDelete) {
      deletePlannerEvent(id);
    }
  };
  
  const handleSaveEvent = () => {
    if (!title.trim() || !date) return;
    
    if (currentEventId) {
      updatePlannerEvent(currentEventId, {
        title,
        startDate: date, // Use startDate which is required
        date, // Keep date for backwards compatibility
        time: time || undefined,
        duration: duration || undefined,
        meditationId: meditationId || undefined,
      });
    } else {
      addPlannerEvent({
        title,
        startDate: date, // Use startDate which is required
        date, // Keep date for backwards compatibility
        time: time || undefined,
        duration: duration || undefined,
        meditationId: meditationId || undefined,
        completed: false,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };
  
  // Group events by date for display
  const groupedEvents = plannerEvents.reduce((groups, event) => {
    const eventDate = event.date || event.startDate;
    if (!groups[eventDate]) {
      groups[eventDate] = [];
    }
    groups[eventDate].push(event);
    return groups;
  }, {} as Record<string, PlannerEvent[]>);
  
  // Sort dates in ascending order (future first)
  const today = new Date().toISOString().split('T')[0];
  
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    const todayDate = new Date(today);
    
    // Today should be first
    if (dateA.toDateString() === todayDate.toDateString()) return -1;
    if (dateB.toDateString() === todayDate.toDateString()) return 1;
    
    // Then future dates in ascending order
    if (dateA >= todayDate && dateB >= todayDate) return dateA.getTime() - dateB.getTime();
    
    // Future dates before past dates
    if (dateA >= todayDate) return -1;
    if (dateB >= todayDate) return 1;
    
    // Past dates in descending order
    return dateB.getTime() - dateA.getTime();
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
  
  // Check if a date is today
  const isToday = (dateString: string) => {
    return dateString === today;
  };
  
  // Sort events within a date by time
  const sortEventsByTime = (events: PlannerEvent[]) => {
    return [...events].sort((a, b) => {
      // Events with time come before events without time
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      if (!a.time && !b.time) return 0;
      
      // Sort by time
      return a.time!.localeCompare(b.time!);
    });
  };
  
  return (
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Planner</h1>
          <Button 
            onClick={handleOpenNewEvent}
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Plan je meditaties en houd je voortgang bij
        </p>
        
        <div className="space-y-6 pb-24">
          {sortedDates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                Je hebt nog geen evenementen gepland.
              </p>
              <Button onClick={handleOpenNewEvent}>
                Plan je eerste meditatie
              </Button>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="space-y-2 animate-slide-in">
                <div className="flex items-center gap-2">
                  <h2 className={cn(
                    "text-sm font-medium",
                    isToday(date) ? "text-primary" : "text-muted-foreground"
                  )}>
                    {isToday(date) ? "Vandaag" : formatDate(date)}
                  </h2>
                  {isToday(date) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Vandaag
                    </span>
                  )}
                </div>
                
                {sortEventsByTime(groupedEvents[date]).map((event) => (
                  <Card 
                    key={event.id} 
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
                          onCheckedChange={() => toggleEventCompletion(event.id)}
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
                                onClick={() => handleEditEvent(event)}
                              >
                                <span className="sr-only">Bewerken</span>
                                <Calendar className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <span className="sr-only">Verwijderen</span>
                                <Calendar className="h-3.5 w-3.5" />
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
                ))}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* New/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentEventId ? "Bewerk Activiteit" : "Nieuwe Activiteit"}
            </DialogTitle>
            <DialogDescription>
              Plan je meditatie of andere welzijnsactiviteit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                placeholder="Bijv. Ochtendmeditatie"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Tijd (optioneel)</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duur (minuten, optioneel)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Bijv. 10"
                value={duration || ""}
                onChange={(e) => setDuration(
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meditation">Meditatie (optioneel)</Label>
              <Select 
                value={meditationId || ""} 
                onValueChange={(value) => setMeditationId(value || undefined)}
              >
                <SelectTrigger id="meditation">
                  <SelectValue placeholder="Selecteer een meditatie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Geen meditatie</SelectItem>
                  {meditations.map((meditation) => (
                    <SelectItem key={meditation.id} value={meditation.id}>
                      {meditation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveEvent}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Planner;
