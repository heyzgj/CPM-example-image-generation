// Image Compression Utilities for Project Storage

/**
 * Compresses an image blob to reduce storage footprint
 * @param blob - Original image blob
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality (0.1 - 1.0)
 * @returns Compressed image blob
 */
export async function compressImage(
  blob: Blob,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const { width: newWidth, height: newHeight } = calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob(
        (compressedBlob) => {
          if (compressedBlob) {
            resolve(compressedBlob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

// Note: Enhanced generateThumbnail function is implemented below with smart cropping and background processing

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const width = originalWidth;
  const height = originalHeight;

  // If image is smaller than max dimensions, don't upscale
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculate scaling ratio
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * Estimate the compression ratio achievable for an image
 */
export function estimateCompressionRatio(
  originalSize: number,
  imageType: string
): number {
  // Rough estimates based on image type
  switch (imageType.toLowerCase()) {
    case 'image/png':
      return 0.3; // PNG to JPEG can achieve ~70% reduction
    case 'image/jpeg':
    case 'image/jpg':
      return 0.6; // JPEG recompression ~40% reduction
    case 'image/webp':
      return 0.7; // WebP to JPEG ~30% reduction
    default:
      return 0.5; // Conservative estimate
  }
}

/**
 * Convert blob to data URL for display
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert data URL back to blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  
  return new Blob([u8arr], { type: mime });
}

// Advanced Image Compression Utilities for High-Performance Project Storage

/**
 * Performance metrics for optimization tracking
 */
interface CompressionMetrics {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  quality: number;
}

/**
 * Advanced compression options
 */
interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'auto';
  progressive?: boolean;
  adaptive?: boolean;
  preserveExif?: boolean;
}

/**
 * Background compression queue for better performance
 */
class CompressionQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private maxConcurrent = 2;
  private active = 0;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.active++;
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.active--;
          this.processNext();
        }
      });
      
      this.processNext();
    });
  }

  private processNext() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (task) {
      task();
    }
  }
}

// Global compression queue
const compressionQueue = new CompressionQueue();

/**
 * Advanced image compression with adaptive quality and format optimization
 * @param blob - Original image blob
 * @param options - Compression options
 * @returns Promise resolving to compressed image blob and metrics
 */
export async function compressImageAdvanced(
  blob: Blob,
  options: CompressionOptions = {}
): Promise<{ blob: Blob; metrics: CompressionMetrics }> {
  const startTime = performance.now();
  
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality: baseQuality = 0.8,
    format = 'auto',
    progressive = true,
    adaptive = true
    // preserveExif = false  // Currently unused
  } = options;

  return compressionQueue.add(async () => {
    const originalSize = blob.size;
    
    // Determine optimal format
    const optimalFormat = await determineOptimalFormat(blob, format);
    
    // Calculate adaptive quality based on image characteristics
    const adaptiveQuality = adaptive 
      ? await calculateAdaptiveQuality(blob, baseQuality)
      : baseQuality;

    const compressedBlob = await compressWithFormat(
      blob,
      optimalFormat,
      adaptiveQuality,
      maxWidth,
      maxHeight,
      progressive
    );

    const processingTime = performance.now() - startTime;
    
    const metrics: CompressionMetrics = {
      originalSize,
      compressedSize: compressedBlob.size,
      compressionRatio: compressedBlob.size / originalSize,
      processingTime,
      quality: adaptiveQuality
    };

    return { blob: compressedBlob, metrics };
  });
}

/**
 * Determine optimal image format based on content and browser support
 */
async function determineOptimalFormat(
  blob: Blob, 
  preferredFormat: 'jpeg' | 'webp' | 'auto'
): Promise<'jpeg' | 'webp'> {
  if (preferredFormat !== 'auto') {
    return preferredFormat;
  }

  // Check WebP support
  const supportsWebP = await checkWebPSupport();
  if (!supportsWebP) {
    return 'jpeg';
  }

  // Analyze image content to determine best format
  // const hasTransparency = await imageHasTransparency(blob);
  const complexity = await analyzeImageComplexity(blob);
  
  // WebP is better for complex images, JPEG for photos
  return complexity > 0.7 ? 'webp' : 'jpeg';
}

/**
 * Calculate adaptive quality based on image characteristics
 */
async function calculateAdaptiveQuality(blob: Blob, baseQuality: number): Promise<number> {
  const img = await loadImage(blob);
  
  // Factors that influence quality selection
  const area = img.width * img.height;
  const sizeRatio = blob.size / area; // bytes per pixel
  
  // Smaller images can use higher quality
  const sizeMultiplier = area > 1000000 ? 0.9 : 1.1;
  
  // High-detail images need higher quality
  const detailMultiplier = sizeRatio > 3 ? 1.1 : 0.95;
  
  const adaptiveQuality = Math.min(
    0.95, 
    Math.max(0.5, baseQuality * sizeMultiplier * detailMultiplier)
  );
  
  return adaptiveQuality;
}

/**
 * Compress image with specified format and options
 */
async function compressWithFormat(
  blob: Blob,
  format: 'jpeg' | 'webp',
  quality: number,
  maxWidth: number,
  maxHeight: number,
  progressive: boolean
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { 
      alpha: format === 'webp',
      willReadFrequently: false
    });

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate optimal dimensions
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image with optimal settings
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to blob with format-specific options
        const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
        
        // Note: Progressive encoding could be implemented here
        if (progressive && format === 'jpeg') {
          // Progressive JPEG encoding would be implemented here in a real scenario
          console.debug('Progressive encoding requested for JPEG');
        }
        
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              resolve(compressedBlob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      } finally {
        // Clean up memory
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Generate progressive thumbnail with blur-up effect
 */
export async function generateProgressiveThumbnail(
  blob: Blob,
  size: number = 200,
  blurSize: number = 20
): Promise<{ thumbnail: Blob; blurPlaceholder: Blob }> {
  const [thumbnail, blurPlaceholder] = await Promise.all([
    generateThumbnail(blob, size, 0.8),
    generateThumbnail(blob, blurSize, 0.3)
  ]);

  return { thumbnail, blurPlaceholder };
}

/**
 * Enhanced thumbnail generation with smart cropping
 */
export async function generateThumbnail(
  blob: Blob,
  size: number = 200,
  quality: number = 0.7
): Promise<Blob> {
  return compressionQueue.add(async () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: false });

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          canvas.width = size;
          canvas.height = size;

          // Smart cropping: detect focal point
          const focalPoint = detectFocalPoint(img);
          const sourceSize = Math.min(img.width, img.height);
          
          // Center crop around focal point
          const sourceX = Math.max(0, Math.min(
            img.width - sourceSize,
            focalPoint.x - sourceSize / 2
          ));
          const sourceY = Math.max(0, Math.min(
            img.height - sourceSize,
            focalPoint.y - sourceSize / 2
          ));

          // High-quality drawing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            size,
            size
          );

          canvas.toBlob(
            (thumbnail) => {
              if (thumbnail) {
                resolve(thumbnail);
              } else {
                reject(new Error('Failed to generate thumbnail'));
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image for thumbnail'));
      };
      
      img.src = URL.createObjectURL(blob);
    });
  });
}

/**
 * Helper functions for advanced compression features
 */

async function checkWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => resolve(webP.height === 2);
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// async function imageHasTransparency(blob: Blob): Promise<boolean> {
//   // Simple check for PNG format (which commonly has transparency)
//   return blob.type === 'image/png';
// }

async function analyzeImageComplexity(blob: Blob): Promise<number> {
  // Simplified complexity analysis based on file size vs dimensions
  const img = await loadImage(blob);
  const bytesPerPixel = blob.size / (img.width * img.height);
  
  // Higher bytes per pixel usually indicates more complexity
  return Math.min(1, bytesPerPixel / 4);
}

async function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

function detectFocalPoint(img: HTMLImageElement): { x: number; y: number } {
  // Simple center-based focal point detection
  // In a real implementation, this could use edge detection or face detection
  return {
    x: img.width / 2,
    y: img.height / 2
  };
} 