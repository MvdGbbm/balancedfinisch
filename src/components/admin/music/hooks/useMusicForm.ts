
import { useState, useEffect, useRef } from "react";
import { Soundscape } from "@/lib/types";
import { toast } from "sonner";
import { validateAndProcessAudioUrl, processUrl } from "../utils/audioUrlValidator";
import { saveSoundscapeToSupabase } from "../utils/saveSoundscape";

export const useMusicForm = (
  currentMusic: Soundscape | null,
  onSave: (music: Partial<Soundscape>) => void,
  onOpenChange: (open: boolean) => void,
  isOpen: boolean,
  categories: string[]
) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("Muziek"); // Default to "Muziek"
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [validatedUrl, setValidatedUrl] = useState("");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Load data from currentMusic when dialog opens
  useEffect(() => {
    if (currentMusic) {
      setTitle(currentMusic.title);
      setDescription(currentMusic.description);
      setAudioUrl(currentMusic.audioUrl);
      setCoverImageUrl(currentMusic.coverImageUrl);
      setTags([...currentMusic.tags]);
      setCategory(currentMusic.category);
      
      // Validate URL directly when loading an existing item
      if (currentMusic.audioUrl) {
        validateAndProcessAudioUrl(
          currentMusic.audioUrl,
          setIsValidatingUrl,
          setValidatedUrl,
          setIsUrlValid
        );
      }
    } else {
      resetForm();
    }
  }, [currentMusic, isOpen]);
  
  // Validate audioUrl when it changes
  useEffect(() => {
    if (audioUrl) {
      validateAndProcessAudioUrl(
        audioUrl,
        setIsValidatingUrl,
        setValidatedUrl,
        setIsUrlValid
      );
    } else {
      setValidatedUrl("");
      setIsUrlValid(true);
      setIsValidatingUrl(false);
    }
  }, [audioUrl]);
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setCoverImageUrl("");
    setTags([]);
    setCategory("Muziek"); // Reset to default category
    setIsPreviewPlaying(false);
    setValidatedUrl("");
    setIsUrlValid(true);
  };
  
  const handleAudioPreview = () => {
    if (audioUrl && isUrlValid) {
      setIsPreviewPlaying(!isPreviewPlaying);
    } else {
      toast.error("Voer eerst een geldige audio URL in om voor te luisteren");
    }
  };
  
  const handleAudioError = () => {
    toast.error("Kon de audio niet laden. Controleer of de URL correct is.");
    setIsPreviewPlaying(false);
    setIsUrlValid(false);
  };
  
  const handleSave = async () => {
    if (!title || !description || !audioUrl || !coverImageUrl) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    
    if (!isUrlValid) {
      toast.error("De audio URL is ongeldig. Controleer of de URL correct is.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Use validated URL if available, otherwise try to correct the URL
      const finalAudioUrl = validatedUrl || await validateAndProcessAudioUrl(
        audioUrl,
        setIsValidatingUrl,
        setValidatedUrl,
        setIsUrlValid
      );
      
      if (!validatedUrl) {
        toast.error("Kon de audio URL niet valideren. Controleer of de URL correct is.");
        setIsSaving(false);
        return;
      }
        
      const processedCoverImageUrl = processUrl(coverImageUrl);
      
      console.log("Soundscape opslaan met audioUrl:", finalAudioUrl || validatedUrl);
      
      // Save to Supabase and get the response
      const result = await saveSoundscapeToSupabase({
        title,
        description,
        audioUrl: finalAudioUrl || validatedUrl,
        coverImageUrl: processedCoverImageUrl,
        tags,
        category, // Include the selected category
        currentMusic
      });
      
      if (result.success) {
        // Call the onSave callback with the data from the response
        onSave(result.data || {
          id: currentMusic?.id,
          title,
          description,
          audioUrl: finalAudioUrl || validatedUrl,
          category, // Include the selected category
          coverImageUrl: processedCoverImageUrl,
          tags,
        });
        
        toast.success("Muziek succesvol opgeslagen");
        onOpenChange(false);
        resetForm();
      } else {
        toast.error("Er is een fout opgetreden bij het opslaan");
      }
    } catch (error) {
      console.error("Fout bij opslaan soundscape:", error);
      toast.error("Er is een fout opgetreden bij het opslaan");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    audioUrl,
    setAudioUrl,
    coverImageUrl,
    setCoverImageUrl,
    tags,
    setTags,
    category,
    setCategory,
    isPreviewPlaying,
    setIsPreviewPlaying,
    validatedUrl,
    isValidatingUrl,
    isUrlValid,
    isSaving,
    audioRef,
    handleAudioPreview,
    handleAudioError,
    handleSave
  };
};
