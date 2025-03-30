
import React, { useState } from "react";
import { Meditation } from "@/lib/types";
import { Clock, Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MeditationCardProps {
  meditation: Meditation;
  isSelected: boolean;
  onClick: () => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  onShowDetails?: () => void;
}

export function MeditationCard({
  meditation,
  isSelected,
  onClick,
  showDeleteButton = false,
  onDelete,
  onShowDetails,
}: MeditationCardProps) {
  const { deleteMeditation } = useApp();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      deleteMeditation(meditation.id);
      toast({
        title: "Meditatie verwijderd",
        description: `${meditation.title} is verwijderd.`,
      });
    }
  };

  const handleShowDetails = (e: React.MouseEvent) => {
    if (onShowDetails) {
      e.stopPropagation();
      onShowDetails();
    }
  };

  return (
    <>
      <div
        onClick={onClick}
        className={cn(
          "group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg transition-all duration-300 hover:shadow-md",
          isSelected
            ? "ring-2 ring-primary ring-offset-2"
            : "bg-card hover:bg-accent/10"
        )}
      >
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={meditation.coverImageUrl}
            alt={meditation.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="font-medium">{meditation.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {meditation.description}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3.5 w-3.5" />
              <span>{meditation.duration} min</span>
            </div>

            <div className="flex items-center gap-2">
              {showDeleteButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onShowDetails ? handleShowDetails : undefined}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Meditatie verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{meditation.title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
