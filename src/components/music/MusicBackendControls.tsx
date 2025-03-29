
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface MusicBackendControlsProps {
  onRefresh: () => void;
  onClearCache: () => void;
  isLoading: boolean;
}

export const MusicBackendControls: React.FC<MusicBackendControlsProps> = ({
  onRefresh,
  onClearCache,
  isLoading
}) => {
  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" className="flex-shrink-0 border-none bg-background/30 hover:bg-destructive/20" title="Cache leegmaken">
            <Trash className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cachegeheugen wissen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je het cachegeheugen wilt wissen? Hierdoor worden alle tijdelijk 
              opgeslagen gegevens verwijderd en moet de app opnieuw worden geladen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={onClearCache} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Wissen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading} className="flex-shrink-0 border-none bg-background/30 hover:bg-primary/20" title="Pagina verversen">
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
