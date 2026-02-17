'use client';

import { format, parseISO } from 'date-fns';
import { Calendar, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  useAvailabilityExceptions,
  type AvailabilityException,
} from '@/hooks/useAvailabilityExceptions';
import type { ProviderBranch } from '@/lib/services/provider-branch.service';
import { formatDateFull } from '@/lib/utils/date';
import { useUIStore } from '@/stores/uiStore';

interface BranchAvailabilityExceptionsManagerProps {
  branch: ProviderBranch;
}

export function BranchAvailabilityExceptionsManager({
  branch,
}: BranchAvailabilityExceptionsManagerProps) {
  const t = useTranslations('myService.availability');
  const locale = useLocale();
  const { showToast } = useUIStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingException, setEditingException] = useState<AvailabilityException | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    isAvailable: true,
    startTime: '',
    endTime: '',
    reason: '',
  });

  // Use custom hook for availability exceptions (SOLID - Single Responsibility)
  const { exceptions, isLoading, createMutation, updateMutation, deleteMutation } =
    useAvailabilityExceptions(branch.providerId);

  const resetForm = () => {
    setFormData({
      date: '',
      isAvailable: true,
      startTime: '',
      endTime: '',
      reason: '',
    });
  };

  const handleCreate = () => {
    if (!formData.date) {
      showToast(t('dateRequired', { defaultValue: 'Date is required' }), 'error');
      return;
    }

    createMutation.mutate(
      {
        date: formData.date,
        isAvailable: formData.isAvailable,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        reason: formData.reason || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleEdit = (exception: AvailabilityException) => {
    setEditingException(exception);
    setFormData({
      date: exception.date,
      isAvailable: exception.isAvailable,
      startTime: exception.startTime || '',
      endTime: exception.endTime || '',
      reason: exception.reason || '',
    });
  };

  const handleUpdate = () => {
    if (!editingException) return;

    updateMutation.mutate(
      {
        id: editingException.id,
        data: {
          isAvailable: formData.isAvailable,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          reason: formData.reason || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingException(null);
          resetForm();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        t('deleteConfirm', { defaultValue: 'Are you sure you want to delete this exception?' })
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingException(null);
    resetForm();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('exceptions', { defaultValue: 'Availability Exceptions' })}
        </h3>
        <Button onClick={openCreateModal} variant="primary" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t('addException', { defaultValue: 'Add Exception' })}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : exceptions.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('noExceptions', { defaultValue: 'No exceptions added yet' })}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDateFull(exception.date, locale)}
                  </span>
                  {exception.isAvailable ? (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                      {t('available', { defaultValue: 'Available' })}
                    </span>
                  ) : (
                    <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
                      {t('closed', { defaultValue: 'Closed' })}
                    </span>
                  )}
                </div>
                {exception.startTime && exception.endTime && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {exception.startTime} - {exception.endTime}
                  </p>
                )}
                {exception.reason && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {exception.reason}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(exception)}
                  variant="ghost"
                  size="sm"
                  title={t('edit', { defaultValue: 'Edit' })}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(exception.id)}
                  variant="ghost"
                  size="sm"
                  title={t('delete', { defaultValue: 'Delete' })}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingException) && (
        <Modal
          isOpen={isCreateModalOpen || !!editingException}
          onClose={closeModals}
          title={
            editingException
              ? t('editException', { defaultValue: 'Edit Exception' })
              : t('addException', { defaultValue: 'Add Exception' })
          }
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('date', { defaultValue: 'Date' })}
              </label>
              <DatePicker
                value={formData.date ? parseISO(formData.date) : null}
                onChange={(date) =>
                  setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })
                }
                disabled={!!editingException}
                minDate={new Date()}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded border-gray-300"
                />
                {t('isAvailable', { defaultValue: 'Available on this day' })}
              </label>
            </div>

            {formData.isAvailable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('startTime', { defaultValue: 'Start Time' })}
                    </label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('endTime', { defaultValue: 'End Time' })}
                    </label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reason', { defaultValue: 'Reason (optional)' })}
              </label>
              <Input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder={t('reasonPlaceholder', {
                  defaultValue: 'e.g., Holiday, Special event',
                })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={closeModals} variant="ghost">
                <X className="mr-2 h-4 w-4" />
                {t('cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                onClick={editingException ? handleUpdate : handleCreate}
                variant="primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                {editingException
                  ? t('save', { defaultValue: 'Save' })
                  : t('create', { defaultValue: 'Create' })}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
