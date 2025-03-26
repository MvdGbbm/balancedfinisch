
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GuidedBreathingFormValues {
  veraUrl: string;
  marcoUrl: string;
}

const AdminGuidedBreathing = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<GuidedBreathingFormValues>({
    defaultValues: {
      veraUrl: "",
      marcoUrl: "",
    }
  });

  // Fetch current guided breathing audio URLs
  useEffect(() => {
    const fetchAudioUrls = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('guided_breathing')
          .select('voice_type, audio_url');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const veraUrl = data.find(item => item.voice_type === 'vera')?.audio_url || "";
          const marcoUrl = data.find(item => item.voice_type === 'marco')?.audio_url || "";
          
          form.reset({
            veraUrl,
            marcoUrl
          });
        }
      } catch (error) {
        console.error('Error fetching guided breathing audio URLs:', error);
        toast.error('Fout bij het ophalen van audio URL\'s');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAudioUrls();
  }, [form]);

  const handleSubmit = async (values: GuidedBreathingFormValues) => {
    try {
      setIsLoading(true);
      
      // Update Vera URL
      const veraResult = await supabase
        .from('guided_breathing')
        .update({ audio_url: values.veraUrl })
        .eq('voice_type', 'vera');
        
      if (veraResult.error) throw veraResult.error;
      
      // Update Marco URL
      const marcoResult = await supabase
        .from('guided_breathing')
        .update({ audio_url: values.marcoUrl })
        .eq('voice_type', 'marco');
        
      if (marcoResult.error) throw marcoResult.error;
      
      toast.success('Audio URL\'s succesvol opgeslagen');
    } catch (error) {
      console.error('Error updating guided breathing audio URLs:', error);
      toast.error('Fout bij het opslaan van audio URL\'s');
    } finally {
      setIsLoading(false);
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Allow empty URLs
    
    try {
      // Add https:// if not present
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Begeleide Ademhaling</h1>
            <p className="text-muted-foreground">
              Beheer de audio URL's voor de begeleide ademhaling
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Audio URL's</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="veraUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vera Stem URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/vera-audio.mp3" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        De audio-URL voor Vera's begeleide ademhaling
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="marcoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marco Stem URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/marco-audio.mp3" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        De audio-URL voor Marco's begeleide ademhaling
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Opslaan...' : 'Opslaan'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Audio Testen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Vera Audio</h3>
                {form.watch('veraUrl') ? (
                  <audio 
                    controls 
                    src={form.watch('veraUrl')} 
                    className="w-full" 
                    onError={(e) => {
                      console.error("Error loading Vera audio:", e);
                      toast.error("Fout bij het laden van Vera audio");
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground">Geen URL opgegeven</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Marco Audio</h3>
                {form.watch('marcoUrl') ? (
                  <audio 
                    controls 
                    src={form.watch('marcoUrl')} 
                    className="w-full"
                    onError={(e) => {
                      console.error("Error loading Marco audio:", e);
                      toast.error("Fout bij het laden van Marco audio");
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground">Geen URL opgegeven</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminGuidedBreathing;
