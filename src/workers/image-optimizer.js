// Web Worker for image optimization

/* global self, OffscreenCanvas, createImageBitmap */

self.onmessage = async function(e) {
  const { imageData, options, id } = e.data;
  
  try {
    const optimizedData = await optimizeImageData(imageData, options);
    
    self.postMessage({
      id,
      success: true,
      data: optimizedData
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message
    });
  }
};

async function optimizeImageData(imageData, options) {
  const { width, height, quality = 80, format = 'webp', crop = false, resize = 'cover' } = options;
  
  return new Promise((resolve, reject) => {
    // Create offscreen canvas for image processing
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    // Create ImageBitmap from image data
    createImageBitmap(imageData)
      .then(bitmap => {
        try {
          // Calculate dimensions
          const { finalWidth, finalHeight } = calculateDimensions(
            bitmap.width, 
            bitmap.height, 
            width, 
            height, 
            resize
          );
          
          canvas.width = finalWidth;
          canvas.height = finalHeight;

          // Apply image processing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (crop) {
            // Crop to cover
            const sourceRatio = bitmap.width / bitmap.height;
            const targetRatio = finalWidth / finalHeight;
            
            let sourceX = 0, sourceY = 0, sourceWidth = bitmap.width, sourceHeight = bitmap.height;
            
            if (sourceRatio > targetRatio) {
              // Image is wider than target
              sourceHeight = bitmap.width / targetRatio;
              sourceY = (bitmap.height - sourceHeight) / 2;
            } else {
              // Image is taller than target
              sourceWidth = bitmap.height * targetRatio;
              sourceX = (bitmap.width - sourceWidth) / 2;
            }
            
            ctx.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, finalWidth, finalHeight);
          } else {
            // Resize without cropping
            ctx.drawImage(bitmap, 0, 0, finalWidth, finalHeight);
          }

          // Convert to desired format
          return canvas.convertToBlob({
            type: `image/${format}`,
            quality: quality / 100
          });
        } catch (error) {
          reject(error);
        }
      })
      .then(blob => {
        resolve({
          blob,
          width: canvas.width,
          height: canvas.height,
          size: blob.size
        });
      })
      .catch(reject);
  });
}

function calculateDimensions(originalWidth, originalHeight, targetWidth, targetHeight, resize) {
  let width = targetWidth;
  let height = targetHeight;
  
  if (!width && !height) {
    return { finalWidth: originalWidth, finalHeight: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (resize === 'contain') {
    // Fit within bounds
    if (width && height) {
      const targetRatio = width / height;
      if (aspectRatio > targetRatio) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }
    } else if (width) {
      height = width / aspectRatio;
    } else if (height) {
      width = height * aspectRatio;
    }
  } else if (resize === 'cover') {
    // Fill bounds (may crop)
    if (width && height) {
      const targetRatio = width / height;
      if (aspectRatio > targetRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    } else if (width) {
      height = width / aspectRatio;
    } else if (height) {
      width = height * aspectRatio;
    }
  }
  // 'fill' uses exact dimensions

  return { 
    finalWidth: width || originalWidth, 
    finalHeight: height || originalHeight 
  };
}
