
import React, { useState } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { MeditationCard } from "@/components/meditation/meditation-card";
import { MeditationDetailDialog } from "@/components/meditation/meditation-detail-dialog";
import { Meditation } from "@/lib/types";
import { filterMeditations } from "@/utils/meditation-utils";
import { toast } from "sonner";

const Meditations = () => {
  const { meditations, setCurrentMeditation, deleteMeditation } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [selectedDurations, setSelectedDurations] = useState<number[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter meditations based on search, category, and durations
  const filteredMeditations = filterMeditations(
    meditations,
    searchQuery,
    selectedCategory,
    selectedDurations
  );

  // Group meditations by category
  const categories = Array.from(
    new Set(filteredMeditations.map((m) => m.category))
  ).sort();

  const handleMeditationClick = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setDetailDialogOpen(true);
  };

  const handlePlayMeditation = (meditation: Meditation) => {
    setCurrentMeditation(meditation);
    // Close dialog after selecting
    setDetailDialogOpen(false);
  };

  const handleDeleteMeditation = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze meditatie wilt verwijderen?")) {
      deleteMeditation(id);
      toast("Meditatie succesvol verwijderd");
    }
  };

  return (
    <MobileLayout>
      <div className="container px-4 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Meditaties</h1>
          <p className="text-muted-foreground">
            Ontdek geleide meditaties voor elke stemming
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Zoek meditaties..."
            className="pl-9 pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {isFiltersOpen && (
          <div className="mb-6">
            {/* Simple duration selector */}
            <div className="space-y-2">
              <h3 className="font-medium">Duur</h3>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30].map((duration) => (
                  <Button
                    key={duration}
                    variant={selectedDurations.includes(duration) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedDurations(prev =>
                        prev.includes(duration)
                          ? prev.filter(d => d !== duration)
                          : [...prev, duration]
                      );
                    }}
                  >
                    {duration} min
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mb-4">
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Alle
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(
                      selectedCategory === category ? null : category
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-medium">{category}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {filteredMeditations
                    .filter((m) => m.category === category)
                    .map((meditation) => (
                      <MeditationCard
                        key={meditation.id}
                        meditation={meditation}
                        isSelected={false}
                        onClick={() => handleMeditationClick(meditation)}
                        showDeleteButton={true}
                        onDelete={() => handleDeleteMeditation(meditation.id)}
                      />
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Geen meditaties gevonden voor je zoekopdracht."
                  : "Geen meditaties gevonden."}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedMeditation && (
        <MeditationDetailDialog
          meditation={selectedMeditation}
          soundscapes={[]}
          isOpen={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          currentSoundscapeId={null}
          onSoundscapeChange={() => {}}
          guidedMeditations={[]}
          onGuidedMeditationSelect={() => {}}
        />
      )}
    </MobileLayout>
  );
};

export default Meditations;
