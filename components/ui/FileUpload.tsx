'use client';

import { Upload, X, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';

import { filesService, UploadedFile } from '@/lib/services/files.service';
import { useUIStore } from '@/stores/uiStore';

interface FileUploadProps {
  /** Accepted file types (e.g., 'image/*', '.pdf,.doc') */
  accept?: string;
  /** Maximum file size in MB */
  maxSize?: number;
  /** Maximum number of files (1 for single, >1 for multiple) */
  maxFiles?: number;
  /** Whether to allow multiple files */
  multiple?: boolean;
  /** Callback when files are uploaded */
  onUpload: (files: UploadedFile[]) => void;
  /** Callback when upload fails */
  onError?: (error: string) => void;
  /** Existing files to display */
  existingFiles?: UploadedFile[];
  /** Callback when a file is removed */
  onRemove?: (fileId: string) => void;
  /** Label for the upload button */
  label?: string;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** File category for organization (e.g., 'avatar', 'profile-photo', 'work-photo') */
  category?: string;
  /** Unique ID for the file input (required if multiple FileUpload components on same page) */
  inputId?: string;
}

export function FileUpload({
  accept = 'image/*',
  maxSize = 10,
  maxFiles = 1,
  multiple = false,
  onUpload,
  onError,
  existingFiles = [],
  onRemove,
  label = 'Upload File',
  disabled = false,
  category,
  inputId = 'file-upload-input',
}: FileUploadProps) {
  const { showToast } = useUIStore();
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<Array<{ file: File; preview?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Validate file count
    const totalFiles = existingFiles.length + files.length;
    if (maxFiles > 0 && totalFiles > maxFiles) {
      const error = `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`;
      showToast(error, 'error');
      onError?.(error);
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter((file) => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const error = `File size exceeds ${maxSize}MB limit`;
      showToast(error, 'error');
      onError?.(error);
      return;
    }

    // Create previews for images
    const previews = await Promise.all(
      files.map(async (file) => {
        if (file.type.startsWith('image/')) {
          const preview = URL.createObjectURL(file);
          return { file, preview };
        }
        return { file };
      })
    );

    setPreviewFiles((prev) => [...prev, ...previews]);

    // Upload files
    setUploading(true);
    try {
      const uploadedFiles = multiple
        ? await filesService.uploadFiles(files, category)
        : [await filesService.uploadFile(files[0], category)];

      // Clean up preview URLs
      previews.forEach((p) => {
        if (p.preview) {
          URL.revokeObjectURL(p.preview);
        }
      });

      setPreviewFiles([]);
      onUpload(uploadedFiles);
      showToast(
        `Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`,
        'success'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
      showToast(errorMessage, 'error');
      onError?.(errorMessage);

      // Clean up preview URLs on error
      previews.forEach((p) => {
        if (p.preview) {
          URL.revokeObjectURL(p.preview);
        }
      });
      setPreviewFiles([]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveExisting = async (fileId: string) => {
    try {
      await filesService.deleteFile(fileId);
      onRemove?.(fileId);
      showToast('File removed', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove file';
      showToast(errorMessage, 'error');
    }
  };

  const handleRemovePreview = (index: number) => {
    const preview = previewFiles[index];
    if (preview?.preview) {
      URL.revokeObjectURL(preview.preview);
    }
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className={`
            flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-2
            transition-colors
            ${
              disabled || uploading
                ? 'cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:bg-primary-900/20'
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>{label}</span>
            </>
          )}
        </label>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {maxFiles > 0 && `Max ${maxFiles} file${maxFiles > 1 ? 's' : ''}`} • Max size: {maxSize}MB
        </p>
      </div>

      {/* Preview Files (being uploaded) */}
      {previewFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {previewFiles.map((preview, index) => (
            <div key={index} className="group relative">
              {preview.preview ? (
                <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <Image
                    src={preview.preview}
                    alt={preview.file.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(index)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative flex aspect-square items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  {getFileIcon(preview.file.type)}
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(index)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400">
                {preview.file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files:</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {existingFiles.map((file) => (
              <div key={file.id} className="group relative">
                {file.mimeType.startsWith('image/') ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <Image
                      src={file.fileUrl}
                      alt={file.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(file.id)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative flex aspect-square flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    {getFileIcon(file.mimeType)}
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(file.id)}
                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <p
                  className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400"
                  title={file.originalName}
                >
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatFileSize(file.fileSize)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
