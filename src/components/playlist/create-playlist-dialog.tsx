
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}

export function CreatePlaylistDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePlaylistDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Voer een naam in voor de afspeellijst");
      return;
    }
    
    onSubmit(name.trim());
    setName("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nieuwe afspeellijst</DialogTitle>
            <DialogDescription>
              Maak een nieuwe afspeellijst aan om je favoriete nummers te verzamelen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="playlist-name">Naam afspeellijst</Label>
            <Input
              id="playlist-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Mijn afspeellijst"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit">Aanmaken</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
