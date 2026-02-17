import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ProviderOption {
  id: string;
  name: string;
  role: 'owner' | 'manager' | 'employee';
  serviceType?: 'individual' | 'company';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  avatarFile?: {
    fileUrl: string;
  };
  hasBranch?: boolean;
  isApproved?: boolean; // Approval status from branch
}

interface ProviderState {
  selectedProviderId: string | null;
  availableProviders: ProviderOption[];
  setSelectedProviderId: (id: string | null) => void;
  setAvailableProviders: (providers: ProviderOption[]) => void;
  getSelectedProvider: () => ProviderOption | null;
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      selectedProviderId: null,
      availableProviders: [],
      setSelectedProviderId: (id) => {
        set({ selectedProviderId: id });
      },
      setAvailableProviders: (providers) => {
        set({ availableProviders: providers });
        // If no provider is selected and we have providers, select the first one
        const current = get();
        if (!current.selectedProviderId && providers.length > 0) {
          set({ selectedProviderId: providers[0].id });
        }
      },
      getSelectedProvider: () => {
        const state = get();
        if (!state.selectedProviderId) return null;
        return state.availableProviders.find((p) => p.id === state.selectedProviderId) || null;
      },
    }),
    {
      name: 'provider-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedProviderId: state.selectedProviderId,
      }),
    }
  )
);
