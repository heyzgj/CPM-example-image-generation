import { UPLOAD_CONSTRAINTS, ERROR_MESSAGES } from './constants';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
}

/**
 * Validates uploaded file against our constraints
 */
export function validateFile(file: File): FileValidationResult {
  // Check file type
  if (!UPLOAD_CONSTRAINTS.allowedTypes.includes(file.type as 'image/jpeg' | 'image/png')) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.invalidFileType,
    };
  }

  // Check file size
  if (file.size > UPLOAD_CONSTRAINTS.maxFileSize) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.fileTooLarge,
    };
  }

  return {
    isValid: true,
    file,
  };
}

/**
 * Creates a preview URL for an image file
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Converts file to base64 string for API transmission
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads a blob as a file
 */
export function downloadImage(imageBlob: Blob, filename: string): void {
  const url = URL.createObjectURL(imageBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Checks if a string is a valid data URL
 */
export function isValidDataUrl(str: string): boolean {
  const dataUrlRegex = /^data:image\/(jpeg|jpg|png);base64,/;
  return dataUrlRegex.test(str);
} 