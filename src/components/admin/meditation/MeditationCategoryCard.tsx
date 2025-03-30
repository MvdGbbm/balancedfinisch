
import React from "react";
import { Meditation } from "@/lib/types";
import { MeditationCard } from "@/components/meditation/meditation-card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MeditationCategoryCardProps {
  category: string;
  meditations: Meditation[];
  onEditMeditation: (meditation: Meditation) => void;
  onEditCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onDeleteMeditation?: (id: string) => void;
}

export function MeditationCategoryCard({
  category,
  meditations,
  onEditMeditation,
  onEditCategory,
  onDeleteCategory,
  onDeleteMeditation,
}: MeditationCategoryCardProps) {
  const [meditationToDelete, setMeditationToDelete] = React.useState<string | null>(null);

  return (
    <Card key={category} className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">{category}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditCategory(category)}>
                <Edit className="h-4 w-4 mr-2" />
                Bewerk categorie
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDeleteCategory(category)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Verwijder categorie
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {meditations.map((meditation) => (
            <div key={meditation.id} className="relative group">
              <MeditationCard
                meditation={meditation}
                isSelected={false}
                onClick={() => onEditMeditation(meditation)}
              />
              {onDeleteMeditation && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMeditationToDelete(meditation.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <AlertDialog open={!!meditationToDelete} onOpenChange={(open) => !open && setMeditationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Meditatie verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze meditatie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (meditationToDelete && onDeleteMeditation) {
                  onDeleteMeditation(meditationToDelete);
                  setMeditationToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
