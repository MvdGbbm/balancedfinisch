import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Meditation } from "@/lib/types";
import { AudioPlayer } from "@/components/audio-player";
import { toast } from "sonner";
import { Play, Pause, Edit, Trash, Plus, Search, Music, Image, Tag, Clock, Calendar } from "lucide-react";

const Meditations = () => {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    // Load meditations from local storage or API
    const storedMeditations = localStorage.getItem("meditations");
    if (storedMeditations) {
      try {
        setMeditations(JSON.parse(storedMeditations));
      } catch (error) {
        console.error("Error parsing meditations:", error);
        toast.error("Error loading meditations");
      }
    }
  }, []);

  // Save meditations to local storage when they change
  useEffect(() => {
    localStorage.setItem("meditations", JSON.stringify(meditations));
  }, [meditations]);

  // Filter meditations based on search query and active tab
  const filteredMeditations = meditations.filter((meditation) => {
    const matchesSearch = meditation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meditation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meditation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "featured") return matchesSearch && meditation.isFeatured;
    return matchesSearch && meditation.category === activeTab;
  });

  const handleCreateMeditation = () => {
    setSelectedMeditation(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setTitle(meditation.title);
    setSubtitle(meditation.subtitle || "");
    setDescription(meditation.description);
    setAudioUrl(meditation.audioUrl);
    setCoverImageUrl(meditation.coverImageUrl);
    setCategory(meditation.category);
    setDurationSeconds(meditation.durationSeconds);
    setTags(meditation.tags || []);
    setIsFeatured(meditation.isFeatured || false);
    setIsDialogOpen(true);
  };

  const handleDeleteMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMeditation) {
      setMeditations(meditations.filter(m => m.id !== selectedMeditation.id));
      setIsDeleteDialogOpen(false);
      setSelectedMeditation(null);
      toast.success("Meditation deleted successfully");
    }
  };

  const handleSaveMeditation = () => {
    if (!title || !description || !audioUrl || !coverImageUrl || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newMeditation: Meditation = {
      id: selectedMeditation?.id || `meditation-${Date.now()}`,
      title,
      subtitle,
      description,
      audioUrl,
      coverImageUrl,
      category,
      durationSeconds,
      tags,
      isFeatured,
      createdAt: selectedMeditation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (selectedMeditation) {
      // Update existing meditation
      setMeditations(meditations.map(m => m.id === selectedMeditation.id ? newMeditation : m));
      toast.success("Meditation updated successfully");
    } else {
      // Create new meditation
      setMeditations([...meditations, newMeditation]);
      toast.success("Meditation created successfully");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setDescription("");
    setAudioUrl("");
    setCoverImageUrl("");
    setCategory("");
    setDurationSeconds(undefined);
    setTags([]);
    setTagInput("");
    setIsFeatured(false);
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTogglePreview = (meditation: Meditation) => {
    if (selectedMeditation?.id === meditation.id && isPreviewPlaying) {
      setIsPreviewPlaying(false);
      setSelectedMeditation(null);
    } else {
      setSelectedMeditation(meditation);
      setIsPreviewPlaying(true);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Meditations</h1>
        <Button onClick={handleCreateMeditation}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Meditation
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search meditations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="Guided">Guided</TabsTrigger>
            <TabsTrigger value="Sleep">Sleep</TabsTrigger>
            <TabsTrigger value="Focus">Focus</TabsTrigger>
            <TabsTrigger value="Stress Relief">Stress Relief</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all" ? "All Meditations" : 
                   activeTab === "featured" ? "Featured Meditations" : 
                   `${activeTab} Meditations`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeditations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No meditations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMeditations.map((meditation) => (
                        <TableRow key={meditation.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-md bg-cover bg-center"
                                style={{ backgroundImage: `url(${meditation.coverImageUrl})` }}
                              />
                              <div>
                                <div className="font-medium">{meditation.title}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {meditation.subtitle || meditation.description.substring(0, 50)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{meditation.category}</Badge>
                          </TableCell>
                          <TableCell>{formatDuration(meditation.durationSeconds)}</TableCell>
                          <TableCell>
                            {meditation.isFeatured ? (
                              <Badge variant="default" className="bg-primary">Featured</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleTogglePreview(meditation)}
                              >
                                {selectedMeditation?.id === meditation.id && isPreviewPlaying ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditMeditation(meditation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteMeditation(meditation)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedMeditation && isPreviewPlaying && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedMeditation.coverImageUrl})` }}
                />
                <div>
                  <div className="font-medium">{selectedMeditation.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedMeditation.subtitle || selectedMeditation.category}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsPreviewPlaying(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <AudioPlayer 
              audioUrl={selectedMeditation.audioUrl} 
            />
          </div>
        </div>
      )}

      {/* Create/Edit Meditation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMeditation ? "Edit Meditation" : "Create New Meditation"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Meditation title"
                />
              </div>
              
              <div>
                <Label htmlFor="subtitle">Subtitle (optional)</Label>
                <Input 
                  id="subtitle" 
                  value={subtitle} 
                  onChange={(e) => setSubtitle(e.target.value)} 
                  placeholder="Short subtitle"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Detailed description"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Guided">Guided</SelectItem>
                    <SelectItem value="Sleep">Sleep</SelectItem>
                    <SelectItem value="Focus">Focus</SelectItem>
                    <SelectItem value="Stress Relief">Stress Relief</SelectItem>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Nature Sounds">Nature Sounds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  value={durationSeconds || ""} 
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value) || undefined)} 
                  placeholder="Duration in seconds"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="featured" 
                  checked={isFeatured} 
                  onCheckedChange={(checked) => setIsFeatured(checked as boolean)} 
                />
                <Label htmlFor="featured">Featured meditation</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="audioUrl">Audio URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="audioUrl" 
                    value={audioUrl} 
                    onChange={(e) => setAudioUrl(e.target.value)} 
                    placeholder="URL to audio file"
                  />
                  <Button variant="outline" size="icon">
                    <Music className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="coverImageUrl" 
                    value={coverImageUrl} 
                    onChange={(e) => setCoverImageUrl(e.target.value)} 
                    placeholder="URL to cover image"
                  />
                  <Button variant="outline" size="icon">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {coverImageUrl && (
                <div className="aspect-video bg-cover bg-center rounded-md overflow-hidden">
                  <img 
                    src={coverImageUrl} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x225?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input 
                    id="tags" 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline" size="icon">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 ml-1" 
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeditation}>
              {selectedMeditation ? "Update Meditation" : "Create Meditation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{selectedMeditation?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Meditations;
