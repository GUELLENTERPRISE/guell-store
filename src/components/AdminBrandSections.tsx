import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus, Edit } from "lucide-react";
import ColorPicker from "./ColorPicker";
import ImageUpload from "./ImageUpload";

interface BrandSection {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  button_text: string;
  image_path?: string;
  background_color: string;
  search_category?: string;
  display_order: number;
  is_active: boolean;
}

interface BrandSectionForm {
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  image_path: string;
  background_color: string;
  search_category: string;
  display_order: number;
  is_active: boolean;
}

const AdminBrandSections = () => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<BrandSectionForm>({
    title: "",
    subtitle: "",
    description: "",
    button_text: "Shop Now",
    image_path: "",
    background_color: "hsl(var(--primary))",
    search_category: "",
    display_order: 0,
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: brandSections = [], isLoading } = useQuery({
    queryKey: ["brand-sections-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_sections")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as BrandSection[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSection: Omit<BrandSectionForm, "id">) => {
      const { error } = await supabase
        .from("brand_sections")
        .insert([newSection]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-sections-admin"] });
      queryClient.invalidateQueries({ queryKey: ["brand-sections"] });
      toast.success("Brand section created successfully!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create brand section: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BrandSectionForm> & { id: string }) => {
      const { error } = await supabase
        .from("brand_sections")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-sections-admin"] });
      queryClient.invalidateQueries({ queryKey: ["brand-sections"] });
      toast.success("Brand section updated successfully!");
      setEditingSection(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update brand section: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("brand_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-sections-admin"] });
      queryClient.invalidateQueries({ queryKey: ["brand-sections"] });
      toast.success("Brand section deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete brand section: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      button_text: "Shop Now",
      image_path: "",
      background_color: "hsl(var(--primary))",
      search_category: "",
      display_order: 0,
      is_active: true,
    });
    setShowAddForm(false);
    setEditingSection(null);
  };

  const handleEdit = (section: BrandSection) => {
    setFormData({
      title: section.title,
      subtitle: section.subtitle || "",
      description: section.description || "",
      button_text: section.button_text,
      image_path: section.image_path || "",
      background_color: section.background_color,
      search_category: section.search_category || "",
      display_order: section.display_order,
      is_active: section.is_active,
    });
    setEditingSection(section.id);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSection) {
      updateMutation.mutate({ id: editingSection, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = (path: string) => {
    setFormData(prev => ({ ...prev, image_path: path }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image_path: "" }));
  };

  if (isLoading) {
    return <div className="p-6">Loading brand sections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Brand Sections</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm || editingSection !== null}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Brand Section
        </Button>
      </div>

      {(showAddForm || editingSection) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSection ? "Edit Brand Section" : "Add New Brand Section"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="button_text">Button Text *</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="search_category">Search Category</Label>
                  <Input
                    id="search_category"
                    value={formData.search_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, search_category: e.target.value }))}
                    placeholder="e.g., jewelry, clothing"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <ColorPicker
                  value={formData.background_color}
                  onChange={(color) => setFormData(prev => ({ ...prev, background_color: color }))}
                  label="Background Color"
                />
              </div>

              <div>
                <Label>Section Image</Label>
                <ImageUpload
                  bucket="category-images"
                  path={`brand-sections/${Date.now()}`}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  className="mt-2"
                />
                {formData.image_path && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Current image: {formData.image_path}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingSection ? "Update" : "Create"} Brand Section
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {brandSections.map((section) => (
          <Card key={section.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{section.title}</h3>
                    {!section.is_active && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {section.subtitle && (
                    <p className="text-sm font-medium text-muted-foreground">
                      {section.subtitle}
                    </p>
                  )}
                  {section.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Button: {section.button_text}</span>
                    {section.search_category && (
                      <span>Category: {section.search_category}</span>
                    )}
                    <span>Order: {section.display_order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: section.background_color }}
                    title={section.background_color}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(section)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(section.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBrandSections;