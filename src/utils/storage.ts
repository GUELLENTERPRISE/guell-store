/**
 * Storage utility functions for Supabase storage URLs
 * Centralizes storage URL generation to avoid hardcoded URLs
 */

const SUPABASE_URL = 'https://kvimldbhqcymkvmzjovx.supabase.co';
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

/**
 * Generates a Supabase storage URL for a given bucket and file path
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Complete storage URL
 */
export const getStorageUrl = (bucket: string, path: string): string => {
  if (!bucket || !path) {
    return '';
  }
  
  // Remove leading slashes to avoid double slashes
  const cleanPath = path.replace(/^\/+/, '');
  return `${STORAGE_URL}/${bucket}/${cleanPath}`;
};

/**
 * Generates a Supabase storage URL specifically for avatar images
 * @param path - The avatar file path
 * @returns Complete avatar storage URL
 */
export const getAvatarUrl = (path: string): string => {
  return getStorageUrl('avatars', path);
};

/**
 * Generates a Supabase storage URL for product images
 * @param path - The product image file path
 * @returns Complete product image storage URL
 */
export const getProductImageUrl = (path: string): string => {
  return getStorageUrl('product-images', path);
};

/**
 * Generates a Supabase storage URL for category images
 * @param path - The category image file path
 * @returns Complete category image storage URL
 */
export const getCategoryImageUrl = (path: string): string => {
  return getStorageUrl('category-images', path);
};

/**
 * Generates a Supabase storage URL for banner images
 * @param path - The banner image file path
 * @returns Complete banner image storage URL
 */
export const getBannerImageUrl = (path: string): string => {
  return getStorageUrl('banner-images', path);
};
