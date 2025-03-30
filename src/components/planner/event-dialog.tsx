
import React from "react";
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
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Meditation } from "@/lib/types";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  date: string;
  time: string;
  duration: number | undefined;
  meditationId: string | undefined;
  meditations: Meditation[];
  currentEventId: string | null;
  setTitle: (title: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setDuration: (duration: number | undefined) => void;
  setMeditationId: (id: string | undefined) => void;
  onSave: () => void;
}

export function EventDialog({
  isOpen,
  onClose,
  title,
  date,
  time,
  duration,
  meditationId,
  meditations,
  currentEventId,
  setTitle,
  setDate,
  setTime,
  setDuration,
  setMeditationId,
  onSave,
}: EventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button onClick={onSave}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
