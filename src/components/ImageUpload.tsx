import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: string;
  path?: string;
  onUpload: (path: string) => void;
  onRemove?: () => void;
  className?: string;
}

const ImageUpload = ({ bucket, path, onUpload, onRemove, className }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null
  );

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setPreviewUrl(data.publicUrl);
      onUpload(filePath);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Error uploading image');
      // TODO: handle error properly
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (path) {
      try {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([path]);
        
        if (error) throw error;
      } catch (error) {
        // Error handled silently - TODO: add proper error reporting
      }
    }
    
    setPreviewUrl(null);
    onRemove?.();
    toast.success('Image removed');
  };

  return (
    <div className={className}>
      <Label>Image</Label>
      {previewUrl ? (
        <div className="space-y-2">
          <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <Label htmlFor="image-upload" className="cursor-pointer">
            <span className="text-sm text-muted-foreground">Click to upload image</span>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
              className="hidden"
            />
          </Label>
          {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;