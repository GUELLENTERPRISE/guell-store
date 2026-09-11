
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminValidation } from './useAdminValidation';

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: string;
  inventory: number;
  brand?: string;
  color?: string;
  fabric_type?: string;
  origin?: string;
  is_featured: boolean;
  is_prime: boolean;
  is_guell_plus: boolean;
  images: string[];
  videos?: string[];
  specifications?: string;
  recommended_uses?: string[];
  monthly_sold_count?: number;
  shipped_from?: string;
  sold_by?: string;
  shippingAddress?: {street: string; city: string; state: string; zipCode: string; country: string};
  // CRO / presentation controls (must exist as columns in `products`)
  urgency_threshold?: number;
  show_secure_payment_badge?: boolean;
  show_satisfaction_badge?: boolean;
  show_fast_shipping_badge?: boolean;
}

interface UpdateProductData extends CreateProductData {
  id: string;
}

export const useAdminProducts = () => {
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: isValidatingAdmin } = useAdminValidation();

  const createProduct = useMutation({
    mutationFn: async (productData: CreateProductData) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Validate required fields
      if (!productData.name || !productData.description || productData.price < 0) {
        throw new Error('Invalid product data');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Product created successfully!');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please try again.');
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (productData: UpdateProductData) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { id, ...updateData } = productData;
      
      // Validate required fields
      if (!updateData.name || !updateData.description || updateData.price < 0) {
        throw new Error('Invalid product data');
      }

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Product updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    },
  });

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Validate file type and size
      const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      const allowedTypes = [...imageTypes, ...videoTypes];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, SVG images and MP4, WebM videos are allowed.');
      }

      // Different size limits for images and videos
      const isVideo = videoTypes.includes(file.type);
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for videos, 10MB for images
      
      if (file.size > maxSize) {
        const maxSizeText = isVideo ? '50MB' : '10MB';
        throw new Error(`File size too large. Maximum ${maxSizeText} allowed.`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    },
  });

  return {
    createProduct,
    updateProduct,
    uploadFile,
    uploadImage: uploadFile, // Keep backward compatibility
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
    isUploading: uploadFile.isPending,
    isAdmin,
    isValidatingAdmin,
  };
};
