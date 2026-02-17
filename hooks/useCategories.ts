import { useQuery } from '@tanstack/react-query';

import { categoriesService, type Category } from '@/lib/services/categories.service';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategory(code: string) {
  return useQuery<Category | null>({
    queryKey: ['categories', code],
    queryFn: () => categoriesService.getByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
