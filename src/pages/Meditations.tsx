
// This file should be fixed to avoid build errors

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile-layout";
import { MeditationCard } from "@/components/meditation/meditation-card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MeditationPlayerContainer } from "@/components/meditation/meditation-player-container";
import { MeditationDetailDialog } from "@/components/meditation/meditation-detail-dialog";
import { useApp } from "@/context/AppContext";
import { MeditationCategoryTabs } from "@/components/meditation/meditation-category-tabs";
import { MeditationFilters } from "@/components/meditation/meditation-filters";
import { useNavigate } from "react-router-dom";
import { groupBy } from "lodash";
import { Meditation } from "@/lib/types";
import { MeditationSubcategory } from "@/components/meditation/meditation-subcategory";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Main component
const MeditationsPage = () => {
  const { meditations, currentMeditation, setCurrentMeditation, deleteMeditation } = useApp();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [meditationToDelete, setMeditationToDelete] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailMeditation, setDetailMeditation] = useState<Meditation | null>(null);
  const navigate = useNavigate();
  
  // Filter meditations based on active tab and duration filter
  const filteredMeditations = meditations.filter(meditation => {
    const categoryMatch = activeTab === "all" || meditation.category === activeTab;
    const durationMatch = durationFilter === null || meditation.duration <= durationFilter;
    return categoryMatch && durationMatch;
  });
  
  // Group meditations by category
  const groupedMeditations = groupBy(filteredMeditations, "category");
  
  // Handle meditation selection
  const handleMeditationClick = (meditation: Meditation) => {
    setCurrentMeditation(meditation);
  };
  
  // Show detail dialog
  const handleShowDetail = (meditation: Meditation) => {
    setDetailMeditation(meditation);
    setShowDetailDialog(true);
  };
  
  // Handle delete meditation
  const handleDeleteClick = (id: string) => {
    setMeditationToDelete(id);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (meditationToDelete) {
      deleteMeditation(meditationToDelete);
      if (currentMeditation?.id === meditationToDelete) {
        setCurrentMeditation(null);
      }
      setShowDeleteDialog(false);
      setMeditationToDelete(null);
    }
  };
  
  // Navigation to admin
  const navigateToAdmin = () => {
    navigate("/admin/meditations");
  };
  
  // Check if we should render "all" meditations or groupBy category
  const shouldShowGrouped = activeTab === "all" && Object.keys(groupedMeditations).length > 0;
  
  // Get unique categories from the grouped meditations
  const categories = Object.keys(groupedMeditations);
  
  return (
    <MobileLayout>
      <div className="space-y-6 pb-32">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Meditaties</h1>
            <Button variant="outline" size="sm" onClick={navigateToAdmin}>
              Beheren
            </Button>
          </div>
          <p className="text-muted-foreground">
            Ontdek geleide meditaties voor rust en balans in je leven.
          </p>
        </div>
        
        <div className="space-y-4">
          <MeditationCategoryTabs 
            categories={categories}
            selectedCategory={activeTab}
            onCategoryChange={setActiveTab}
          />
          
          <MeditationFilters 
            categories={categories}
            selectedCategory={activeTab}
            searchQuery=""
            showFilters={true}
            onCategoryChange={setActiveTab}
            onSearchChange={() => {}}
            onToggleFilters={() => {}}
            onClearFilters={() => {}}
          />
        </div>
        
        <div className="space-y-6">
          {shouldShowGrouped ? (
            // Show grouped by category
            Object.entries(groupedMeditations).map(([category, meditations]) => (
              <MeditationSubcategory 
                key={category}
                tag={category}
                meditations={meditations}
                selectedMeditationId={currentMeditation?.id || null}
                onSelectMeditation={handleMeditationClick}
              />
            ))
          ) : (
            // Show filtered list
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeditations.map(meditation => (
                <MeditationCard
                  key={meditation.id}
                  meditation={meditation}
                  isSelected={currentMeditation?.id === meditation.id}
                  onClick={() => handleMeditationClick(meditation)}
                  showDeleteButton={true}
                  onDelete={() => handleDeleteClick(meditation.id)}
                  onShowDetails={() => handleShowDetail(meditation)}
                />
              ))}
            </div>
          )}
          
          {filteredMeditations.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Geen meditaties gevonden met deze filters.</p>
            </div>
          )}
        </div>
      </div>
      
      {currentMeditation && (
        <MeditationPlayerContainer
          isVisible={!!currentMeditation}
          selectedMeditation={currentMeditation}
        />
      )}
      
      {detailMeditation && (
        <MeditationDetailDialog
          meditation={detailMeditation}
          isOpen={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          soundscapes={[]}
          currentSoundscapeId={null}
          onSoundscapeChange={() => {}}
          guidedMeditations={[]}
          onGuidedMeditationSelect={() => {}}
        />
      )}
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Meditatie verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze meditatie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
};

export default MeditationsPage;
