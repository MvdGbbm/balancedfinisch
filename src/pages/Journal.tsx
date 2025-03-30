
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { useApp } from "@/context/AppContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Pencil, 
  Plus, 
  Trash2, 
  SmilePlus,
  Smile,
  Meh,
  Frown,
  Angry // Replaced FrownOpen with Angry which is available in Lucide
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { JournalEntry } from "@/lib/types";

const moodOptions = [
  { value: "happy", label: "Blij", icon: SmilePlus, color: "text-green-500" },
  { value: "calm", label: "Rustig", icon: Smile, color: "text-blue-500" },
  { value: "neutral", label: "Neutraal", icon: Meh, color: "text-gray-500" },
  { value: "sad", label: "Verdrietig", icon: Frown, color: "text-yellow-500" },
  { value: "anxious", label: "Angstig", icon: Angry, color: "text-red-500" }, // Changed to use Angry icon
];

const Journal = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<"happy" | "calm" | "neutral" | "sad" | "anxious">("neutral");
  const [tags, setTags] = useState<string[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  
  const resetForm = () => {
    setContent("");
    setSelectedMood("neutral");
    setTags([]);
    setCurrentEntryId(null);
  };
  
  const handleOpenNewEntry = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleEditEntry = (entry: JournalEntry) => {
    setContent(entry.content);
    setSelectedMood(entry.mood);
    setTags(entry.tags);
    setCurrentEntryId(entry.id);
    setIsDialogOpen(true);
  };
  
  const handleDeleteEntry = (id: string) => {
    const confirmDelete = window.confirm("Weet je zeker dat je dit dagboekbericht wilt verwijderen?");
    if (confirmDelete) {
      deleteJournalEntry(id);
    }
  };
  
  const handleSaveEntry = () => {
    if (!content.trim()) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (currentEntryId) {
      updateJournalEntry(currentEntryId, {
        content,
        mood: selectedMood,
        tags,
      });
    } else {
      addJournalEntry({
        date: today,
        content,
        mood: selectedMood,
        tags,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };
  
  const getMoodIcon = (mood: string) => {
    const moodOption = moodOptions.find((option) => option.value === mood);
    if (!moodOption) return null;
    
    const Icon = moodOption.icon;
    return <Icon className={cn("h-5 w-5", moodOption.color)} />;
  };
  
  // Group entries by date for display
  const groupedEntries = journalEntries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
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
    <MobileLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dagboek</h1>
          <Button 
            onClick={handleOpenNewEntry}
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Houd je emotionele reis bij en reflecteer op je groei
        </p>
        
        <div className="space-y-6 pb-24">
          {sortedDates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                Je hebt nog geen dagboekberichten geschreven.
              </p>
              <Button onClick={handleOpenNewEntry}>
                Schrijf je eerste bericht
              </Button>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {formatDate(date)}
                </h2>
                
                {groupedEntries[date].map((entry) => (
                  <Card 
                    key={entry.id} 
                    className="neo-morphism animate-slide-in"
                  >
                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        {getMoodIcon(entry.mood)}
                        <CardTitle className="text-base">{moodOptions.find(m => m.value === entry.mood)?.label}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm whitespace-pre-line">{entry.content}</p>
                      
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* New/Edit Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentEntryId ? "Bewerk Dagboek" : "Nieuw Dagboek"}
            </DialogTitle>
            <DialogDescription>
              Schrijf hoe je je vandaag voelt en reflecteer op je ervaringen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stemming</label>
              <div className="flex justify-between">
                {moodOptions.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.value}
                      type="button"
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg",
                        selectedMood === mood.value 
                          ? "bg-secondary" 
                          : "hover:bg-secondary/50"
                      )}
                      onClick={() => setSelectedMood(mood.value as any)}
                    >
                      <Icon className={cn("h-6 w-6 mb-1", mood.color)} />
                      <span className="text-xs">{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Dagboek</label>
              <Textarea
                placeholder="Schrijf je gedachten hier..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveEntry}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Journal;
