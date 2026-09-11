// Image Optimization Utilities for GÜELL Platform
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Optimized image component props
interface OptimizedImageComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallback?: string;
  options?: {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    resize?: {
      width?: number;
      height?: number;
      fit?: 'cover' | 'contain' | 'fill';
    };
  };
}

// Main optimized image component
export const OptimizedImage: React.FC<OptimizedImageComponentProps> = ({
  src,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
  fallback,
  options = {}
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [webpSrc, setWebpSrc] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  // Optimize image on mount
  useEffect(() => {
    const optimizeImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simple optimization logic
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) return;

          // Set canvas dimensions
          const targetWidth = options.resize?.width || img.naturalWidth;
          const targetHeight = options.resize?.height || img.naturalHeight;
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Draw and optimize
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Convert to WebP if supported
          if (options.format === 'webp' && canvas.toDataURL) {
            canvas.toBlob((blob) => {
              if (blob) {
                const webpUrl = URL.createObjectURL(blob);
                setWebpSrc(webpUrl);
                setOptimizedSrc(webpUrl);
              }
            }, 'image/webp', options.quality || 0.8);
          } else {
            const optimizedUrl = canvas.toDataURL('image/jpeg', options.quality || 0.8);
            setOptimizedSrc(optimizedUrl);
          }
          
          setIsLoading(false);
        };

        img.onerror = () => {
          setError('Failed to load image');
          setIsLoading(false);
        };

        img.src = src;
      } catch (err) {
        setError('Optimization failed');
        setIsLoading(false);
      }
    };

    optimizeImage();
  }, [src, options]);

  if (error && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
      />
    );
  }

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <picture>
      {webpSrc && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onError={() => {
          if (fallback) {
            setError('Failed to load optimized image');
          }
        }}
      />
    </picture>
  );
};

// Hook for image optimization
export const useImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeImage = useCallback(async (file: File, options?: OptimizedImageComponentProps['options']) => {
    setIsOptimizing(true);
    
    try {
      // Create canvas for optimization
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');

      // Load image
      const img = new Image();
      img.onload = () => {
        // Set dimensions
        const targetWidth = options?.resize?.width || img.width;
        const targetHeight = options?.resize?.height || img.height;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw optimized image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `optimized-${file.name}`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setIsOptimizing(false);
        }, 'image/webp', options?.quality || 0.8);
      };

      img.onerror = () => {
        setIsOptimizing(false);
        throw new Error('Failed to load image');
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      setIsOptimizing(false);
      throw error;
    }
  }, []);

  return {
    optimizeImage,
    isOptimizing
  };
};

// Utility functions
export const imageUtils = {
  // Get image dimensions
  getDimensions: (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  // Validate image type
  isValidImageType: (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
  },

  // Get file size info
  getFileSize: (file: File): string => {
    const bytes = file.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const index = Math.min(i, sizes.length - 1);
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    
    return `${size} ${sizes[index]}`;
  }
};

export default OptimizedImage;
