import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AutoServiceOption {
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
  hasProfile?: boolean;
}

interface AutoServiceState {
  selectedAutoServiceId: string | null;
  availableAutoServices: AutoServiceOption[];
  setSelectedAutoServiceId: (id: string | null) => void;
  setAvailableAutoServices: (services: AutoServiceOption[]) => void;
  getSelectedAutoService: () => AutoServiceOption | null;
}

export const useAutoServiceStore = create<AutoServiceState>()(
  persist(
    (set, get) => ({
      selectedAutoServiceId: null,
      availableAutoServices: [],
      setSelectedAutoServiceId: (id) => {
        set({ selectedAutoServiceId: id });
      },
      setAvailableAutoServices: (services) => {
        set({ availableAutoServices: services });
        // If no service is selected and we have services, select the first one
        const current = get();
        if (!current.selectedAutoServiceId && services.length > 0) {
          set({ selectedAutoServiceId: services[0].id });
        }
      },
      getSelectedAutoService: () => {
        const state = get();
        if (!state.selectedAutoServiceId) return null;
        return (
          state.availableAutoServices.find((s) => s.id === state.selectedAutoServiceId) || null
        );
      },
    }),
    {
      name: 'auto-service-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAutoServiceId: state.selectedAutoServiceId,
      }),
    }
  )
);
