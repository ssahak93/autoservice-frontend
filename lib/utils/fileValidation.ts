/**
 * File validation utilities
 *
 * Single Responsibility: Only handles file validation logic
 * Open/Closed: Can be extended with new validation rules without modifying existing ones
 */

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a file based on provided options
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    maxSize = 5 * 1024 * 1024, // Default 5MB
    allowedTypes = ['image/'],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0) {
    const isValidType = allowedTypes.some((type) => file.type.startsWith(type));
    if (!isValidType) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Creates a preview URL for an image file
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
