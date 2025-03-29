
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
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">Ontspannende Muziek</h1>
      <p className="text-muted-foreground">
        Luister naar rustgevende muziek voor meditatie en ontspanning
      </p>
    </div>
  );
}
