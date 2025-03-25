
import React from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Headphones, Quote, Waves, Music, Radio, RefreshCw } from "lucide-react";

interface AdminMenuCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const AdminMenuCard: React.FC<AdminMenuCardProps> = ({ title, description, icon, href }) => (
  <Card className="hover:bg-secondary/50 transition-colors">
    <Link to={href}>
      <CardContent className="flex flex-col space-y-2 p-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Link>
  </Card>
);

const Admin: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Beheer de content en instellingen van de applicatie
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminMenuCard
            title="Meditaties"
            description="Beheer meditatie audio"
            icon={<Headphones className="h-5 w-5" />}
            href="/admin/meditations"
          />
          <AdminMenuCard
            title="Inspiratie"
            description="Beheer dagelijkse quotes"
            icon={<Quote className="h-5 w-5" />}
            href="/admin/quotes"
          />
          <AdminMenuCard
            title="Soundscapes"
            description="Beheer achtergrondgeluiden"
            icon={<Waves className="h-5 w-5" />}
            href="/admin/soundscapes"
          />
          <AdminMenuCard
            title="Muziek"
            description="Beheer muziekbibliotheek"
            icon={<Music className="h-5 w-5" />}
            href="/admin/music"
          />
          <AdminMenuCard
            title="Radio Streams"
            description="Beheer radiostreams"
            icon={<Radio className="h-5 w-5" />}
            href="/admin/streams"
          />
          <AdminMenuCard
            title="Ademhaling"
            description="Beheer ademhalingsoefeningen"
            icon={<RefreshCw className="h-5 w-5" />}
            href="/admin/breathing"
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
