
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlannerEvent } from "@/lib/types";
import { EventDialog } from "@/components/planner/event-dialog";
import { DateGroup } from "@/components/planner/date-group";
import { groupEventsByDate, sortDates, isToday } from "@/components/planner/planner-utils";

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
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
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
    setDate(event.date || event.startDate || "");
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
        startDate: date,
        date, // Keep date for backwards compatibility
        time: time || undefined,
        duration: duration || undefined,
        meditationId: meditationId || undefined,
      });
    } else {
      addPlannerEvent({
        title,
        startDate: date,
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
  
  // Group and sort events
  const groupedEvents = groupEventsByDate(plannerEvents);
  const sortedDates = sortDates(groupedEvents, today);
  
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
            <Plus className="h-5 w-5" />
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
              <DateGroup
                key={date}
                date={date}
                events={groupedEvents[date]}
                meditations={meditations}
                onToggleCompletion={toggleEventCompletion}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                isToday={isToday(date, today)}
              />
            ))
          )}
        </div>
      </div>
      
      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={title}
        date={date}
        time={time}
        duration={duration}
        meditationId={meditationId}
        meditations={meditations}
        currentEventId={currentEventId}
        setTitle={setTitle}
        setDate={setDate}
        setTime={setTime}
        setDuration={setDuration}
        setMeditationId={setMeditationId}
        onSave={handleSaveEvent}
      />
    </MobileLayout>
  );
};

export default Planner;
