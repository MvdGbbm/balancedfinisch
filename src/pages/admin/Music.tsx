import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Soundscape } from "@/lib/types";

// Define the type for the tag
type Tag = {
  id: string;
  label: string;
};

const AdminMusic: React.FC = () => {
  const { toast } = useToast();
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<Partial<Soundscape>>({
    defaultValues: {
      title: "",
      url: "",
      isActive: true,
      volume: 50,
      imageUrl: "",
      tags: [],
      category: "nature",
    },
  });

  useEffect(() => {
    const storedSoundscapes = localStorage.getItem("soundscapes");
    if (storedSoundscapes) {
      setSoundscapes(JSON.parse(storedSoundscapes));
    }

    const storedTags = localStorage.getItem("soundscapeTags");
    if (storedTags) {
      setTags(JSON.parse(storedTags));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("soundscapes", JSON.stringify(soundscapes));
  }, [soundscapes]);

  useEffect(() => {
    localStorage.setItem("soundscapeTags", JSON.stringify(tags));
  }, [tags]);

  const handleCreateSoundscape = (data: Partial<Soundscape>) => {
    const newSoundscape: Omit<Soundscape, "id"> = {
      title: data.title || "New Soundscape",
      url: data.url || "",
      isActive: data.isActive ?? true,
      volume: data.volume ?? 50,
      imageUrl: data.imageUrl || "",
      tags: data.tags || [],
      category: data.category || "nature"
    };
    
    addSoundscape(newSoundscape);
    setOpenDialog(false);
  };

  const handleEditSoundscape = (data: Partial<Soundscape>) => {
    if (!selectedSoundscape) return;

    const updatedSoundscapes = soundscapes.map((soundscape) =>
      soundscape.id === selectedSoundscape.id
        ? { ...soundscape, ...data }
        : soundscape
    );
    setSoundscapes(updatedSoundscapes);
    setSelectedSoundscape(null);
    setOpenDialog(false);
    toast({
      title: "Geluidscape bijgewerkt!",
      description: "De geluidscape is succesvol bijgewerkt.",
    });
  };

  const addSoundscape = (newSoundscape: Omit<Soundscape, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const soundscapeWithId: Soundscape = { ...newSoundscape, id };
    setSoundscapes([...soundscapes, soundscapeWithId]);
    toast({
      title: "Geluidscape toegevoegd!",
      description: "De geluidscape is succesvol toegevoegd.",
    });
  };

  const deleteSoundscape = (id: string) => {
    setSoundscapes(soundscapes.filter((soundscape) => soundscape.id !== id));
    toast({
      title: "Geluidscape verwijderd!",
      description: "De geluidscape is succesvol verwijderd.",
    });
  };

  const handleOpenDialog = () => {
    setSelectedSoundscape(null);
    form.reset();
    setOpenDialog(true);
  };

  const handleSelectSoundscape = (soundscape: Soundscape) => {
    setSelectedSoundscape(soundscape);
    form.reset(soundscape);
    setOpenDialog(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() === "") return;
    const tag: Tag = { id: Math.random().toString(36).substring(7), label: newTag.trim() };
    setTags([...tags, tag]);
    setNewTag("");
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const handleUpload = async (file: File) => {
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      // Simulate successful upload
      toast({
        title: "Bestand succesvol geupload!",
        description: file.name,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError("Er is een fout opgetreden tijdens het uploaden.");
      toast({
        variant: "destructive",
        title: "Upload mislukt",
        description: uploadError || "Er is een fout opgetreden.",
      });
    } finally {
      setIsUploadModalOpen(false);
      setUploadProgress(0);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geluidscapes</h1>
            <p className="text-muted-foreground">
              Beheer de geluidscapes in de applicatie
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Geluidscape toevoegen
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {soundscapes.map((soundscape) => (
            <Card key={soundscape.id} className="bg-secondary">
              <CardHeader>
                <CardTitle>{soundscape.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <p className="text-sm text-muted-foreground">
                    URL: {soundscape.url}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Afbeelding: {soundscape.imageUrl}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Categorie: {soundscape.category}
                  </p>
                  <div className="flex items-center mt-2">
                    <Label htmlFor={`active-${soundscape.id}`} className="mr-2">
                      Actief:
                    </Label>
                    <Switch
                      id={`active-${soundscape.id}`}
                      checked={soundscape.isActive}
                      disabled
                    />
                  </div>
                  <div className="mt-2">
                    Tags:
                    <div className="flex flex-wrap gap-1 mt-1">
                      {soundscape.tags?.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId);
                        return (
                          tag && (
                            <Badge key={tag.id} variant="secondary">
                              {tag.label}
                            </Badge>
                          )
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="col-span-1 flex justify-end items-center">
                  <Button onClick={() => handleSelectSoundscape(soundscape)}>
                    Bewerken
                  </Button>
                  <Button
                    variant="destructive"
                    className="ml-2"
                    onClick={() => deleteSoundscape(soundscape.id)}
                  >
                    Verwijderen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Soundscape</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSoundscape ? "Geluidscape bewerken" : "Geluidscape toevoegen"}
            </DialogTitle>
            <DialogDescription>
              Maak en beheer geluidscapes voor de applicatie.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={
                selectedSoundscape
                  ? form.handleSubmit(handleEditSoundscape)
                  : form.handleSubmit(handleCreateSoundscape)
              }
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel</FormLabel>
                    <FormControl>
                      <Input placeholder="Nieuwe geluidscape" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/soundscape.mp3" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Afbeelding URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer een categorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nature">Natuur</SelectItem>
                        <SelectItem value="city">Stad</SelectItem>
                        <SelectItem value="space">Ruimte</SelectItem>
                        <SelectItem value="underwater">Onderwater</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value || 50]}
                        max={100}
                        step={1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Actief</FormLabel>
                      <FormDescription>
                        Zet de geluidscape aan of uit.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedSoundscape) {
                          const updatedTags = form.getValues("tags") || [];
                          if (updatedTags.includes(tag.id)) {
                            form.setValue(
                              "tags",
                              updatedTags.filter((t) => t !== tag.id)
                            );
                          } else {
                            form.setValue("tags", [...updatedTags, tag.id]);
                          }
                        }
                      }}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Nieuwe tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button type="button" size="sm" onClick={handleAddTag}>
                  Tag toevoegen
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
                {selectedSoundscape && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (selectedSoundscape) {
                        deleteSoundscape(selectedSoundscape.id);
                        setOpenDialog(false);
                      }
                    }}
                  >
                    Verwijderen
                  </Button>
                )}
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {selectedSoundscape ? "Opslaan" : "Toevoegen"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bestand Uploaden</DialogTitle>
            <DialogDescription>
              Upload een nieuw audiobestand naar de server.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="upload">Selecteer bestand:</Label>
              <Input
                type="file"
                id="upload"
                className="hidden"
                onChange={(e) => {
                  const file = (e.target.files as FileList)[0];
                  if (file) {
                    handleUpload(file);
                  }
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById("upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Bestand kiezen
              </Button>
            </div>
            {uploadProgress > 0 && (
              <div>
                Upload Progress: {uploadProgress}%
                <Progress value={uploadProgress} />
              </div>
            )}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Separator className="my-4" />
      <div>
        <h2 className="text-lg font-semibold">Tags beheren</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="relative">
              {tag.label}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={() => handleDeleteTag(tag.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Input
            type="text"
            placeholder="Nieuwe tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <Button type="button" size="sm" onClick={handleAddTag}>
            Tag toevoegen
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMusic;

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
);
DialogHeader.displayName = "DialogHeader";

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  FormDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-lg border p-4 [&_svg]:h-4 [&_svg]:w-4",
        variant === "destructive"
          ? "border-destructive text-destructive"
          : "border-muted",
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertCircle = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-4 w-4", className)}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
));
AlertCircle.displayName = "AlertCircle";

interface AlertTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";
