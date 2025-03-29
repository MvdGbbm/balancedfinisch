
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import { VoiceURLs } from "./types";

interface VoiceUrlFormProps {
  title: string;
  voiceUrls: VoiceURLs;
  onSave: (urls: VoiceURLs) => void;
}

export function VoiceUrlForm({ title, voiceUrls, onSave }: VoiceUrlFormProps) {
  const form = useForm<VoiceURLs & { disableHold: boolean }>({
    defaultValues: {
      ...voiceUrls,
      disableHold: !voiceUrls.hold // If hold URL is empty, we consider it disabled
    }
  });

  // Update form when voiceUrls change
  React.useEffect(() => {
    form.reset({
      ...voiceUrls,
      disableHold: !voiceUrls.hold // If hold URL is empty, we consider it disabled
    });
  }, [voiceUrls, form]);

  const handleSubmit = (data: VoiceURLs & { disableHold: boolean }) => {
    const { disableHold, ...urlData } = data;
    
    // If hold is disabled, clear the hold URL
    if (disableHold) {
      urlData.hold = "";
    }
    
    onSave(urlData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Audio URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://voorbeeld.com/start.mp3" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="inhale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inademen Audio URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://voorbeeld.com/adem-in.mp3" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="disableHold"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Vasthouden Audio URL uitschakelen</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vasthouden Audio URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="https://voorbeeld.com/vasthouden.mp3" 
                      disabled={form.watch("disableHold")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="exhale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uitademen Audio URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://voorbeeld.com/adem-uit.mp3" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Opslaan
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
