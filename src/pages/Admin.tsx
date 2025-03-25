
import React from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Headphones, 
  Quote, 
  Waves, 
  Music, 
  Radio, 
  RefreshCw, 
  LayoutGrid 
} from "lucide-react";

interface AdminTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const AdminTile: React.FC<AdminTileProps> = ({ 
  title, 
  description, 
  icon, 
  onClick, 
  color 
}) => (
  <Card 
    className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
    style={{ borderLeftColor: color }}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-start">
        <div 
          className="rounded-full p-3 mr-4 flex items-center justify-center" 
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Admin: React.FC = () => {
  const navigate = useNavigate();
  
  const adminTiles = [
    {
      title: "Meditaties",
      description: "Beheer meditatie audio",
      icon: <Headphones className="h-5 w-5" style={{ color: "#8B5CF6" }} />,
      path: "/admin/meditations",
      color: "#8B5CF6" // Purple
    },
    {
      title: "Inspiratie",
      description: "Beheer dagelijkse quotes",
      icon: <Quote className="h-5 w-5" style={{ color: "#F97316" }} />,
      path: "/admin/quotes",
      color: "#F97316" // Orange
    },
    {
      title: "Soundscapes",
      description: "Beheer achtergrondgeluiden",
      icon: <Waves className="h-5 w-5" style={{ color: "#0EA5E9" }} />,
      path: "/admin/soundscapes",
      color: "#0EA5E9" // Blue
    },
    {
      title: "Muziek",
      description: "Beheer muziekbibliotheek",
      icon: <Music className="h-5 w-5" style={{ color: "#10B981" }} />,
      path: "/admin/music",
      color: "#10B981" // Green
    },
    {
      title: "Radio Streams",
      description: "Beheer radiostreams",
      icon: <Radio className="h-5 w-5" style={{ color: "#EC4899" }} />,
      path: "/admin/streams",
      color: "#EC4899" // Pink
    },
    {
      title: "Ademhaling",
      description: "Beheer ademhalingsoefeningen",
      icon: <RefreshCw className="h-5 w-5" style={{ color: "#EAB308" }} />,
      path: "/admin/breathing",
      color: "#EAB308" // Yellow
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Beheer de content en instellingen van de applicatie
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {adminTiles.map((tile, index) => (
          <AdminTile
            key={index}
            title={tile.title}
            description={tile.description}
            icon={tile.icon}
            color={tile.color}
            onClick={() => navigate(tile.path)}
          />
        ))}
      </div>
    </AdminLayout>
  );
};

export default Admin;
