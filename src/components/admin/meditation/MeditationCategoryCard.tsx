
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

interface MeditationCategoryCardProps {
  category: string;
  meditations: Meditation[];
  onEditMeditation: (meditation: Meditation) => void;
  onEditCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export function MeditationCategoryCard({
  category,
  meditations,
  onEditMeditation,
  onEditCategory,
  onDeleteCategory,
}: MeditationCategoryCardProps) {
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
            <MeditationCard
              key={meditation.id}
              meditation={meditation}
              isSelected={false}
              onClick={() => onEditMeditation(meditation)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
