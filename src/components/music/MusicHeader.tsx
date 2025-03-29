
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MusicHeaderProps {
  onRefresh: () => void;
  onClearCache: () => void;
  isLoading: boolean;
}

export const MusicHeader: React.FC<MusicHeaderProps> = ({
  onRefresh,
  onClearCache,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Ontspannende Muziek</h1>
        <p className="text-muted-foreground">
          Luister naar rustgevende muziek voor meditatie en ontspanning
        </p>
      </div>
      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              title="Wis cachegeheugen"
              className="flex-shrink-0"
            >
              <Trash className="h-4 w-4 text-destructive" />
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
              <AlertDialogAction 
                onClick={onClearCache}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Wissen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex-shrink-0"
          title="Pagina verversen"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
