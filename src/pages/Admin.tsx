
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headphones, Quote, Waves, Music, Radio, RefreshCw, LayoutDashboard } from "lucide-react";

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
  const navigate = useNavigate();
  
  const handleTabChange = (value: string) => {
    if (value !== "dashboard") {
      navigate(`/admin/${value}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Beheer de content en instellingen van de applicatie
          </p>
        </div>

        <Tabs defaultValue="dashboard" onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full h-auto flex justify-start mb-6 bg-background border overflow-x-auto">
            <TabsTrigger value="dashboard" className="py-2.5 px-4">
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="meditations" className="py-2.5 px-4">
              <Headphones className="h-5 w-5 mr-2" />
              Meditaties
            </TabsTrigger>
            <TabsTrigger value="quotes" className="py-2.5 px-4">
              <Quote className="h-5 w-5 mr-2" />
              Inspiratie
            </TabsTrigger>
            <TabsTrigger value="soundscapes" className="py-2.5 px-4">
              <Waves className="h-5 w-5 mr-2" />
              Soundscapes
            </TabsTrigger>
            <TabsTrigger value="music" className="py-2.5 px-4">
              <Music className="h-5 w-5 mr-2" />
              Muziek
            </TabsTrigger>
            <TabsTrigger value="streams" className="py-2.5 px-4">
              <Radio className="h-5 w-5 mr-2" />
              Streams
            </TabsTrigger>
            <TabsTrigger value="breathing" className="py-2.5 px-4">
              <RefreshCw className="h-5 w-5 mr-2" />
              Ademhaling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Admin;
