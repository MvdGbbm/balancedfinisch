
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Play, VolumeX } from "lucide-react";
import { Soundscape } from "@/lib/types";
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

interface MusicTableProps {
  tracks: Soundscape[];
  previewUrl: string | null;
  isPlaying: boolean;
  onPreviewToggle: (track: Soundscape) => void;
  onEditMusic: (track: Soundscape) => void;
  onDeleteMusic: (id: string) => void;
}

export const MusicTable = ({
  tracks,
  previewUrl,
  isPlaying,
  onPreviewToggle,
  onEditMusic,
  onDeleteMusic,
}: MusicTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: "40%" }}>Titel</TableHead>
            <TableHead style={{ width: "20%" }}>Tags</TableHead>
            <TableHead>Audio Preview</TableHead>
            <TableHead style={{ width: "120px" }}>Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track) => (
            <TableRow key={track.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-md">
                    <img
                      src={track.coverImageUrl}
                      alt={track.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/40x40?text=Error";
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium">{track.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {track.description}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {track.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onPreviewToggle(track)}
                >
                  {previewUrl === track.audioUrl && isPlaying ? (
                    <>
                      <VolumeX className="h-4 w-4" /> Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Luister
                    </>
                  )}
                </Button>
                {previewUrl === track.audioUrl && isPlaying && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <span className="h-3 w-3 mr-1 animate-pulse text-primary">🔊</span>
                    <span>Nu spelend</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditMusic(track)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Muziek verwijderen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Weet je zeker dat je "{track.title}" wilt verwijderen?
                          Dit kan niet ongedaan worden gemaakt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuleren</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteMusic(track.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Verwijderen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
