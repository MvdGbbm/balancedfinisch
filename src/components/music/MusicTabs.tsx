
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MusicTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const MusicTabs: React.FC<MusicTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <TabsList className="grid grid-cols-2 mb-4 sticky top-0 z-30 bg-background">
      <TabsTrigger value="playlists" onClick={() => onTabChange("playlists")}>
        Afspeellijsten
      </TabsTrigger>
      <TabsTrigger value="radio" onClick={() => onTabChange("radio")}>
        Streaming
      </TabsTrigger>
    </TabsList>
  );
}
