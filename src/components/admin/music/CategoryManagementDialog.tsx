
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface CategoryManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  isOpen,
  onOpenChange,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Voer een categorienaam in");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error("Deze categorie bestaat al");
      return;
    }

    onAddCategory(newCategory.trim());
    setNewCategory("");
    toast.success("Categorie toegevoegd");
  };

  const handleDeleteCategory = (category: string) => {
    // Don't allow deleting "Muziek" category as it's the default
    if (category === "Muziek") {
      toast.error("De standaard categorie 'Muziek' kan niet worden verwijderd");
      return;
    }
    
    onDeleteCategory(category);
    toast.success("Categorie verwijderd");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Categorieën beheren</DialogTitle>
          <DialogDescription>
            Voeg nieuwe categorieën toe of verwijder bestaande categorieën.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="category">Nieuwe categorie</Label>
              <Input
                id="category"
                placeholder="Voer een categorienaam in"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
            </div>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-1" />
              Toevoegen
            </Button>
          </div>

          <div className="space-y-1">
            <Label>Bestaande categorieën</Label>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-1">
                  Geen categorieën gevonden
                </p>
              ) : (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-accent"
                    >
                      <span className="text-sm">{category}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={category === "Muziek"} // Prevent deleting default category
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Sluiten</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
