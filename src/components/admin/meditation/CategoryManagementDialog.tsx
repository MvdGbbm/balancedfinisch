
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryManagementDialogProps {
  categories: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
}

export function CategoryManagementDialog({
  categories,
  isOpen,
  onOpenChange,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagementDialogProps) {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    onAddCategory(newCategory);
    setNewCategory("");
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory || !updatedCategoryName.trim()) return;
    onUpdateCategory(editingCategory, updatedCategoryName);
    setEditingCategory(null);
    setUpdatedCategoryName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Categorie Bewerken" : "Categorieën Beheren"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory 
              ? "Wijzig de naam van de categorie" 
              : "Voeg nieuwe categorieën toe of beheer bestaande categorieën"}
          </DialogDescription>
        </DialogHeader>
        
        {editingCategory ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="updatedCategoryName">Nieuwe categorienaam</Label>
              <Input
                id="updatedCategoryName"
                placeholder="Voer een nieuwe naam in"
                value={updatedCategoryName}
                onChange={(e) => setUpdatedCategoryName(e.target.value)}
              />
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingCategory(null);
                  setUpdatedCategoryName("");
                }}
              >
                Annuleren
              </Button>
              <Button onClick={handleUpdateCategory}>
                Bijwerken
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCategory">Nieuwe categorie</Label>
              <div className="flex gap-2">
                <Input
                  id="newCategory"
                  placeholder="Voer een categorienaam in"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button 
                  type="button" 
                  onClick={handleAddCategory}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Bestaande categorieën</Label>
              <div className="space-y-2 mt-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <div 
                      key={cat} 
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span>{cat}</span>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(cat);
                            setUpdatedCategoryName(cat);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => onDeleteCategory(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-2">
                    Geen categorieën gevonden
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
