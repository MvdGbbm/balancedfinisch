
import { useState, useEffect } from "react";
import { Soundscape } from "@/lib/types";
import { useApp } from "@/context/AppContext";

export function useMusicTracks() {
  const { soundscapes } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter music tracks
  const musicTracks = soundscapes.filter(
    (track) => track.category === "Muziek"
  );

  const filteredTracks = searchQuery
    ? musicTracks.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : musicTracks;

  return {
    musicTracks,
    filteredTracks,
    searchQuery,
    setSearchQuery
  };
}
