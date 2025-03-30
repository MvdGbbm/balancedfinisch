import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useApp } from "@/context/AppContext";
import { Meditation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ListMusic, Search } from "lucide-react";
import { MeditationFormDialog } from "@/components/admin/meditation/MeditationFormDialog";
import { CategoryManagementDialog } from "@/components/admin/meditation/CategoryManagementDialog";
import { MeditationCategoryCard } from "@/components/admin/meditation/MeditationCategoryCard";

const AdminMeditations = () => {
  const { meditations, addMeditation, updateMeditation, deleteMeditation } = useApp();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentMeditation, setCurrentMeditation] = useState<Meditation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  
  const handleOpenNew = () => {
    setCurrentMeditation(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (meditation: Meditation) => {
    setCurrentMeditation(meditation);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze meditatie wilt verwijderen?")) {
      deleteMeditation(id);
    }
  };
  
  const handleSaveMeditation = (meditationData: Partial<Meditation>) => {
    if (currentMeditation) {
      updateMeditation(currentMeditation.id, meditationData);
    } else {
      if (!meditationData.title || !meditationData.description || !meditationData.category || !meditationData.coverImageUrl) {
        console.error("Missing required fields for new meditation");
        return;
      }
      
      addMeditation({
        title: meditationData.title,
        description: meditationData.description,
        duration: meditationData.duration || 10,
        category: meditationData.category,
        coverImageUrl: meditationData.coverImageUrl,
        tags: meditationData.tags || [],
        audioUrl: meditationData.audioUrl || "",
        veraLink: meditationData.veraLink,
        marcoLink: meditationData.marcoLink
      });
    }
  };
  
  const handleAddCategory = (categoryName: string) => {
    addMeditation({
      title: `${categoryName} Meditatie`,
      description: `Een nieuwe meditatie in de ${categoryName} categorie.`,
      audioUrl: "",
      duration: 10,
      category: categoryName,
      coverImageUrl: "/placeholder.svg",
      tags: categoryName === "Geleide Meditaties" ? [] : [categoryName.toLowerCase()],
    });
    
    setIsCategoryDialogOpen(false);
  };
  
  const handleUpdateCategory = (oldCategory: string, newCategory: string) => {
    if (!oldCategory || !newCategory.trim()) return;
    
    meditations
      .filter(m => m.category === oldCategory)
      .forEach(m => {
        let updatedTags = [...m.tags];
        if (newCategory === "Geleide Meditaties") {
          updatedTags = [];
        } else if (oldCategory === "Geleide Meditaties") {
          updatedTags = [newCategory.toLowerCase()];
        } else {
          updatedTags = [...m.tags.filter(t => t !== oldCategory.toLowerCase()), newCategory.toLowerCase()];
        }
        
        updateMeditation(m.id, {
          ...m,
          category: newCategory,
          tags: updatedTags
        });
      });
    
    setEditingCategory(null);
    setUpdatedCategoryName("");
    setIsCategoryDialogOpen(false);
  };
  
  const handleDeleteCategory = (categoryName: string) => {
    if (window.confirm(`Weet je zeker dat je de categorie "${categoryName}" wilt verwijderen? Alle meditaties in deze categorie worden ook verwijderd.`)) {
      meditations
        .filter(m => m.category === categoryName)
        .forEach(m => {
          deleteMeditation(m.id);
        });
    }
  };
  
  const categories = Array.from(
    new Set(meditations.map((meditation) => meditation.category))
  ).sort();
  
  const filteredMeditations = meditations.filter(meditation => 
    meditation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meditation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meditation.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const groupedMeditations = filteredMeditations.reduce((acc, meditation) => {
    const category = meditation.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(meditation);
    return acc;
  }, {} as Record<string, Meditation[]>);
  
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meditaties Beheren</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
              <ListMusic className="h-4 w-4 mr-2" />
              Categorieën
            </Button>
            <Button onClick={handleOpenNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Meditatie
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Voeg nieuwe meditaties toe of bewerk bestaande content
          </p>
          
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Zoek meditaties..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-6 pb-20">
          {Object.entries(groupedMeditations).length > 0 ? (
            Object.entries(groupedMeditations).map(([category, meditationsList]) => (
              <MeditationCategoryCard
                key={category}
                category={category}
                meditations={meditationsList}
                onEditMeditation={handleEdit}
                onEditCategory={(cat) => {
                  setEditingCategory(cat);
                  setUpdatedCategoryName(cat);
                  setIsCategoryDialogOpen(true);
                }}
                onDeleteCategory={handleDeleteCategory}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Geen meditaties gevonden die aan je zoekopdracht voldoen." 
                  : "Er zijn nog geen meditaties. Voeg je eerste meditatie toe!"}
              </p>
              {!searchQuery && (
                <Button onClick={handleOpenNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Meditatie
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <MeditationFormDialog
        meditation={currentMeditation}
        categories={categories}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveMeditation}
      />
      
      <CategoryManagementDialog
        categories={categories}
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </AdminLayout>
  );
};

export default AdminMeditations;
