
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const AdminMusicLink = () => {
  return (
    <Button asChild variant="outline" size="sm" className="ml-auto">
      <Link to="/admin-music-overview">
        <Eye className="mr-2 h-4 w-4" />
        Bekijk alle muziek
      </Link>
    </Button>
  );
};
