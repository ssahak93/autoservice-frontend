'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, User, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUploadAutoServiceAvatar } from '@/hooks/useAutoServiceAvatar';
import { useUpdateServiceInfo } from '@/hooks/useServiceInfoMutations';
import { useServiceInfoValidation } from '@/hooks/useServiceInfoValidation';
import { autoServicesService } from '@/lib/services/auto-services.service';
import { filesService } from '@/lib/services/files.service';
import { cn } from '@/lib/utils/cn';
import { getAvatarUrl } from '@/lib/utils/file';
import { validateFile, createImagePreview } from '@/lib/utils/fileValidation';

interface AutoServiceEditorProps {
  autoServiceId: string;
}

/**
 * Component for editing auto service basic info (name, avatar)
 * Can be used even when profile doesn't exist yet
 */
export function AutoServiceEditor({ autoServiceId }: AutoServiceEditorProps) {
  const t = useTranslations('myService.info');
  const queryClient = useQueryClient();
  const uploadAvatar = useUploadAutoServiceAvatar(autoServiceId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch auto service data
  const { data: autoService, isLoading } = useQuery({
    queryKey: ['autoService', autoServiceId],
    queryFn: async () => {
      const services = await autoServicesService.getAvailableAutoServices();
      return services.find((s) => s.id === autoServiceId);
    },
    enabled: !!autoServiceId,
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    });

    if (!validation.isValid) {
      setError(validation.error || t('invalidImage', { defaultValue: 'Invalid image file' }));
      return;
    }

    // Create preview
    try {
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
    } catch {
      setError(t('previewError', { defaultValue: 'Failed to create preview' }));
      return;
    }

    // Upload file
    try {
      await uploadAvatar.mutateAsync(file);
      setPreview(null);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!autoService?.avatarFile?.id) return;

    try {
      // Delete the file
      await filesService.deleteFile(autoService.avatarFile.id);
      // Update service to remove avatar
      await autoServicesService.updateAutoService(autoServiceId, {
        avatarFileId: '',
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['autoService', autoServiceId] });
      queryClient.invalidateQueries({ queryKey: ['availableAutoServices'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    } catch (error) {
      console.error('Failed to remove avatar', error);
    }
  };

  const isCompany = useMemo(
    () => autoService?.serviceType === 'company',
    [autoService?.serviceType]
  );

  const { schema } = useServiceInfoValidation(isCompany);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: autoService?.companyName || '',
      firstName: autoService?.firstName || '',
      lastName: autoService?.lastName || '',
    },
  });

  // Reset form when auto service data loads
  useEffect(() => {
    if (autoService) {
      reset({
        companyName: autoService.companyName || '',
        firstName: autoService.firstName || '',
        lastName: autoService.lastName || '',
      });
    }
  }, [autoService, reset]);

  const updateMutation = useUpdateServiceInfo();

  const onSubmit = (data: FormData) => {
    // Avatar is handled separately via useUploadAutoServiceAvatar hook
    // Only submit name changes here
    updateMutation.mutate(
      { autoServiceId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['autoService', autoServiceId] });
          queryClient.invalidateQueries({ queryKey: ['availableAutoServices'] });
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
      }
    );
  };

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />;
  }

  if (!autoService) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {t('title', { defaultValue: 'Service Information' })}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('editDescription', { defaultValue: 'Edit your service basic information' })}
        </p>
      </div>

      {/* Avatar Upload - Same logic as user profile avatar */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('avatar', { defaultValue: 'Avatar' })}
        </label>
        <div className={cn('relative')}>
          <div
            className="relative mx-auto h-32 w-32 overflow-hidden rounded-full sm:h-40 sm:w-40"
            suppressHydrationWarning
          >
            {preview || getAvatarUrl(autoService) ? (
              <Image
                src={preview || getAvatarUrl(autoService) || ''}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 128px, 160px"
                unoptimized
                suppressHydrationWarning
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400">
                <User className="h-16 w-16 text-white sm:h-20 sm:w-20" />
              </div>
            )}

            {/* Upload Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <label
                htmlFor="auto-service-avatar-upload"
                className="flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-white"
              >
                <Camera className="h-4 w-4" />
                <span>
                  {autoService?.avatarFile
                    ? t('changeAvatar', { defaultValue: 'Change' })
                    : t('uploadAvatar', { defaultValue: 'Upload' })}
                </span>
              </label>
            </div>

            {/* Remove button if avatar exists and not in preview mode */}
            {!preview && autoService?.avatarFile && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
                title="Remove avatar"
                disabled={uploadAvatar.isPending}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Preview Badge */}
          {preview && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white">
                <span>{t('preview', { defaultValue: 'Preview' })}</span>
                <button
                  type="button"
                  onClick={handleRemovePreview}
                  className="rounded-full hover:bg-primary-600"
                  aria-label={t('removePreview', { defaultValue: 'Remove preview' })}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <p className="mt-2 text-center text-sm text-error-600">{error}</p>}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            id="auto-service-avatar-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploadAvatar.isPending || isSubmitting || updateMutation.isPending}
          />

          {/* Upload Button (Mobile) */}
          <div className="mt-4 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending || isSubmitting || updateMutation.isPending}
              isLoading={uploadAvatar.isPending}
            >
              {autoService?.avatarFile
                ? t('changeAvatar', { defaultValue: 'Change Avatar' })
                : t('uploadAvatar', { defaultValue: 'Upload Avatar' })}
            </Button>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t('avatarHint', {
            defaultValue: 'Upload a profile picture for your auto service (optional)',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {isCompany ? (
          <div>
            <Input
              label={t('companyName', { defaultValue: 'Company Name' })}
              {...register('companyName')}
              error={errors.companyName?.message}
              required
            />
          </div>
        ) : (
          <>
            <div>
              <Input
                label={t('firstName', { defaultValue: 'First Name' })}
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
            </div>
            <div>
              <Input
                label={t('lastName', { defaultValue: 'Last Name' })}
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t('serviceType', { defaultValue: 'Service Type' })}
          </label>
          <p className="mt-1 capitalize text-gray-900 dark:text-white">
            {autoService.serviceType || '-'}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {t('serviceTypeNote', { defaultValue: 'Service type cannot be changed' })}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting || updateMutation.isPending}
        >
          {t('save', { defaultValue: 'Save Changes' })}
        </Button>
      </div>
    </form>
  );
}
