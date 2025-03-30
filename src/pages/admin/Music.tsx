
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MusicTab } from "@/components/admin/music/music-tab";
import { FavoritesTab } from "@/components/admin/music/favorites-tab";
import { PlaylistsTab } from "@/components/admin/music/playlists-tab";
import { StreamingTab } from "@/components/admin/music/streaming-tab";
import { Music as MusicIcon, Heart, ListMusic, Radio } from "lucide-react";

const Music = () => {
  const [activeTab, setActiveTab] = useState("music");

  return (
    <AdminLayout>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MusicIcon className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Muziek</h1>
        </div>
        <p className="text-muted-foreground">
          Beheer alle muziek, favorieten, afspeellijsten en streaming links
        </p>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="music" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <MusicIcon className="h-4 w-4" />
              <span>Muziek</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>Favorieten</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              <span>Afspeellijsten</span>
            </TabsTrigger>
            <TabsTrigger value="streaming" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span>Streaming</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="music">
            <MusicTab />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesTab />
          </TabsContent>

          <TabsContent value="playlists">
            <PlaylistsTab />
          </TabsContent>

          <TabsContent value="streaming">
            <StreamingTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Music;
