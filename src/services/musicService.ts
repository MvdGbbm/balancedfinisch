
import { supabase } from "@/integrations/supabase/client";
import { MusicItem, Playlist } from "@/lib/types";

// Helper type to work around TypeScript limitations with Supabase
type SupabaseTable = any;

// Fetch all music items
export const fetchMusicItems = async (): Promise<MusicItem[]> => {
  const { data, error } = await supabase
    .from("music_items" as SupabaseTable)
    .select("*")
    .order("title");

  if (error) {
    console.error("Error fetching music items:", error);
    throw error;
  }

  return data as MusicItem[];
};

// Fetch music item by ID
export const fetchMusicItemById = async (id: string): Promise<MusicItem | null> => {
  const { data, error } = await supabase
    .from("music_items" as SupabaseTable)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching music item:", error);
    return null;
  }

  return data as MusicItem;
};

// Fetch all playlists
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const { data: playlistsData, error: playlistsError } = await supabase
    .from("playlists" as SupabaseTable)
    .select("*")
    .order("title");

  if (playlistsError) {
    console.error("Error fetching playlists:", playlistsError);
    throw playlistsError;
  }

  // Get playlist items for each playlist
  const playlists = await Promise.all(
    playlistsData.map(async (playlist: any) => {
      const { data: playlistItemsData, error: playlistItemsError } = await supabase
        .from("playlist_items" as SupabaseTable)
        .select("*, music_item_id(*)")
        .eq("playlist_id", playlist.id)
        .order("position");

      if (playlistItemsError) {
        console.error("Error fetching playlist items:", playlistItemsError);
        return {
          ...playlist,
          tracks: [],
        };
      }

      const tracks = playlistItemsData.map((item: any) => item.music_item_id) as MusicItem[];
      
      return {
        ...playlist,
        tracks,
      } as Playlist;
    })
  );

  return playlists;
};

// Upload audio file
export const uploadAudioFile = async (file: File): Promise<string | null> => {
  const filePath = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("audio")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading audio:", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("audio")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

// Upload cover image
export const uploadCoverImage = async (file: File): Promise<string | null> => {
  const filePath = `covers/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("audio")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading cover image:", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("audio")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

// Create or update music item
export const saveMusicItem = async (musicItem: Partial<MusicItem>): Promise<MusicItem | null> => {
  let query;
  
  const itemToSave = {
    title: musicItem.title,
    artist: musicItem.artist,
    description: musicItem.description,
    audio_url: musicItem.audioUrl,
    cover_image_url: musicItem.coverImageUrl,
    category: musicItem.category,
    tags: musicItem.tags,
    duration: musicItem.duration,
    waveform_data: musicItem.waveformData,
  } as SupabaseTable;
  
  if (musicItem.id) {
    // Update existing music item
    query = supabase
      .from("music_items" as SupabaseTable)
      .update({
        ...itemToSave,
        updated_at: new Date().toISOString(),
      } as SupabaseTable)
      .eq("id", musicItem.id)
      .select();
  } else {
    // Create new music item
    query = supabase
      .from("music_items" as SupabaseTable)
      .insert(itemToSave)
      .select();
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error saving music item:", error);
    return null;
  }

  return mapDatabaseToMusicItem(data[0]);
};

// Delete music item
export const deleteMusicItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("music_items" as SupabaseTable)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting music item:", error);
    return false;
  }

  return true;
};

// Create or update playlist
export const savePlaylist = async (playlist: Partial<Playlist>): Promise<Playlist | null> => {
  let playlistData;
  
  // Save the playlist
  if (playlist.id) {
    // Update existing playlist
    const { data, error } = await supabase
      .from("playlists" as SupabaseTable)
      .update({
        title: playlist.title,
        description: playlist.description,
        cover_image_url: playlist.coverImageUrl,
        updated_at: new Date().toISOString(),
      } as SupabaseTable)
      .eq("id", playlist.id)
      .select();
    
    if (error) {
      console.error("Error updating playlist:", error);
      return null;
    }
    
    playlistData = data[0];
  } else {
    // Create new playlist
    const { data, error } = await supabase
      .from("playlists" as SupabaseTable)
      .insert({
        title: playlist.title,
        description: playlist.description,
        cover_image_url: playlist.coverImageUrl,
      } as SupabaseTable)
      .select();
    
    if (error) {
      console.error("Error creating playlist:", error);
      return null;
    }
    
    playlistData = data[0];
  }
  
  // If tracks are provided, update playlist items
  if (playlist.tracks && playlistData.id) {
    // First remove existing items
    await supabase
      .from("playlist_items" as SupabaseTable)
      .delete()
      .eq("playlist_id", playlistData.id);
    
    // Then insert new items
    if (playlist.tracks.length > 0) {
      const playlistItems = playlist.tracks.map((track, index) => ({
        playlist_id: playlistData.id,
        music_item_id: track.id,
        position: index,
      }));
      
      const { error } = await supabase
        .from("playlist_items" as SupabaseTable)
        .insert(playlistItems as SupabaseTable);
      
      if (error) {
        console.error("Error updating playlist items:", error);
      }
    }
  }
  
  return {
    ...playlistData,
    tracks: playlist.tracks || [],
  } as Playlist;
};

// Delete playlist
export const deletePlaylist = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("playlists" as SupabaseTable)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting playlist:", error);
    return false;
  }

  return true;
};

// Helper function to map database fields to MusicItem
const mapDatabaseToMusicItem = (item: any): MusicItem => {
  return {
    id: item.id,
    title: item.title,
    artist: item.artist,
    description: item.description || "",
    audioUrl: item.audio_url,
    coverImageUrl: item.cover_image_url || "",
    category: item.category || "",
    tags: item.tags || [],
    duration: item.duration,
    waveformData: item.waveform_data,
    createdAt: item.created_at
  };
};
