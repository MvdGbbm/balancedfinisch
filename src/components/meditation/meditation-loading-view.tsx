
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const MeditationLoadingView: React.FC = () => {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
};
