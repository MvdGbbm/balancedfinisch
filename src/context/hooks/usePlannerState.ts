
import { useState, useEffect } from "react";
import { PlannerEvent } from "@/lib/types";
import { generateId } from "../utils";

export function usePlannerState() {
  const [plannerEvents, setPlannerEvents] = useState<PlannerEvent[]>([]);
  
  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedPlannerEvents = localStorage.getItem('plannerEvents');
      if (storedPlannerEvents) {
        setPlannerEvents(JSON.parse(storedPlannerEvents));
      }
    } catch (error) {
      console.error('Error loading planner events from localStorage:', error);
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('plannerEvents', JSON.stringify(plannerEvents));
    } catch (error) {
      console.error('Error saving planner events to localStorage:', error);
    }
  }, [plannerEvents]);
  
  // CRUD functions for planner events
  function addPlannerEvent(event: Omit<PlannerEvent, 'id'>) {
    const newEvent: PlannerEvent = {
      ...event,
      id: generateId(),
    };
    setPlannerEvents([...plannerEvents, newEvent]);
  }
  
  function updatePlannerEvent(id: string, event: Partial<PlannerEvent>) {
    setPlannerEvents(
      plannerEvents.map((e) => (e.id === id ? { ...e, ...event } : e))
    );
  }
  
  function deletePlannerEvent(id: string) {
    setPlannerEvents(plannerEvents.filter((e) => e.id !== id));
  }
  
  function toggleEventCompletion(id: string) {
    setPlannerEvents(
      plannerEvents.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      )
    );
  }
  
  return {
    plannerEvents,
    addPlannerEvent,
    updatePlannerEvent,
    deletePlannerEvent,
    toggleEventCompletion
  };
}
