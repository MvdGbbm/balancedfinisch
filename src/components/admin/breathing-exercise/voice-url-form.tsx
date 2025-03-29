
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { VoiceUrls } from "@/components/admin/breathing-exercise/types";

interface VoiceUrlFormProps {
  form: UseFormReturn<VoiceUrls>;
  onSubmit: (data: VoiceUrls) => void;
  voiceName: string;
}

export function VoiceUrlForm({ form, onSubmit, voiceName }: VoiceUrlFormProps) {
  const [isHoldEnabled, setIsHoldEnabled] = React.useState<boolean>(!!form.getValues().hold);

  const handleHoldToggle = (checked: boolean) => {
    setIsHoldEnabled(checked);
    if (!checked) {
      form.setValue("hold", "");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4 text-sm text-muted-foreground">
          <p>Alleen de inadem- en uitademgeluiden zijn verplicht. De andere zijn optioneel.</p>
        </div>
        
        <FormField 
          control={form.control} 
          name="start" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Audio URL <span className="text-xs text-muted-foreground">(optioneel)</span></FormLabel>
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
              <FormLabel>Inademen Audio URL <span className="text-xs text-muted-foreground font-bold">(verplicht)</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://voorbeeld.com/adem-in.mp3" />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox 
            id="holdEnabled" 
            checked={isHoldEnabled} 
            onCheckedChange={handleHoldToggle} 
          />
          <label
            htmlFor="holdEnabled"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Vasthouden Audio inschakelen
          </label>
        </div>
        
        <FormField 
          control={form.control} 
          name="hold" 
          render={({ field }) => (
            <FormItem>
              <FormLabel className={!isHoldEnabled ? "text-muted-foreground" : ""}>
                Vasthouden Audio URL <span className="text-xs text-muted-foreground">(optioneel)</span>
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="https://voorbeeld.com/vasthouden.mp3" 
                  disabled={!isHoldEnabled}
                  className={!isHoldEnabled ? "bg-muted text-muted-foreground" : ""}
                />
              </FormControl>
              {!isHoldEnabled && (
                <FormDescription>
                  Vasthouden audio is uitgeschakeld en wordt niet doorgegeven aan de frontend.
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        
        <FormField 
          control={form.control} 
          name="exhale" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uitademen Audio URL <span className="text-xs text-muted-foreground font-bold">(verplicht)</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://voorbeeld.com/adem-uit.mp3" />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField 
          control={form.control} 
          name="end" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Einde Audio URL <span className="text-xs text-muted-foreground">(optioneel)</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://voorbeeld.com/einde.mp3" />
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
  );
}
