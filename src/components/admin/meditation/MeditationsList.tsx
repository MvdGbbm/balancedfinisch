
import React from "react";
import { Meditation } from "@/lib/types";
import { MeditationCategoryCard } from "@/components/admin/meditation/MeditationCategoryCard";

interface MeditationsListProps {
  groupedMeditations: Record<string, Meditation[]>;
  onEditMeditation: (meditation: Meditation) => void;
  onEditCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onDeleteMeditation: (id: string) => void;
}

export const MeditationsList = ({
  groupedMeditations,
  onEditMeditation,
  onEditCategory,
  onDeleteCategory,
  onDeleteMeditation
}: MeditationsListProps) => {
  return (
    <div className="space-y-6 pb-20">
      {Object.entries(groupedMeditations).map(([category, meditationsList]) => (
        <MeditationCategoryCard
          key={category}
          category={category}
          meditations={meditationsList}
          onEditMeditation={onEditMeditation}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          onDeleteMeditation={onDeleteMeditation}
        />
      ))}
    </div>
  );
};
