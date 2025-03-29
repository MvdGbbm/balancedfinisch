
import { PlannerEvent } from "@/lib/types";

// Group events by date
export function groupEventsByDate(events: PlannerEvent[]): Record<string, PlannerEvent[]> {
  return events.reduce((groups, event) => {
    const eventDate = event.date || event.startDate;
    if (!groups[eventDate]) {
      groups[eventDate] = [];
    }
    groups[eventDate].push(event);
    return groups;
  }, {} as Record<string, PlannerEvent[]>);
}

// Sort dates in ascending order (future first)
export function sortDates(groupedEvents: Record<string, PlannerEvent[]>, today: string): string[] {
  return Object.keys(groupedEvents).sort((a, b) => {
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
}

// Check if a date is today
export function isToday(dateString: string, today: string): boolean {
  return dateString === today;
}
