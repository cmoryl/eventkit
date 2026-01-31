import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GeneratedAsset } from '@/types';

interface ModalState {
  // Asset modals
  editingAsset: GeneratedAsset | null;
  viewingAsset: GeneratedAsset | null;
  downloadingAsset: GeneratedAsset | null;
  aiEditingAsset: GeneratedAsset | null;
  
  // Feature modals
  showQRGenerator: boolean;
  showAuthModal: boolean;
  showVideoModal: boolean;
  showAIImageEdit: boolean;
  showEventDashboard: boolean;
  showAdvancedExport: boolean;
  showBatchPrintExport: boolean;
  showVenuePreview: boolean;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState extends ModalState {
  // Toast
  toast: ToastState | null;
  
  // Loading states
  isExporting: boolean;
  isLoadingProject: boolean;
  isSavingToCloud: boolean;
  isGeneratingGuide: boolean;
  
  // Actions - Modals
  setEditingAsset: (asset: GeneratedAsset | null) => void;
  setViewingAsset: (asset: GeneratedAsset | null) => void;
  setDownloadingAsset: (asset: GeneratedAsset | null) => void;
  setAiEditingAsset: (asset: GeneratedAsset | null) => void;
  
  // Actions - Feature Modals
  openModal: (modal: keyof Omit<ModalState, 'editingAsset' | 'viewingAsset' | 'downloadingAsset' | 'aiEditingAsset'>) => void;
  closeModal: (modal: keyof Omit<ModalState, 'editingAsset' | 'viewingAsset' | 'downloadingAsset' | 'aiEditingAsset'>) => void;
  closeAllModals: () => void;
  
  // Actions - Toast
  showToast: (message: string, type: ToastState['type']) => void;
  hideToast: () => void;
  
  // Actions - Loading States
  setIsExporting: (value: boolean) => void;
  setIsLoadingProject: (value: boolean) => void;
  setIsSavingToCloud: (value: boolean) => void;
  setIsGeneratingGuide: (value: boolean) => void;
}

const initialModalState: ModalState = {
  editingAsset: null,
  viewingAsset: null,
  downloadingAsset: null,
  aiEditingAsset: null,
  showQRGenerator: false,
  showAuthModal: false,
  showVideoModal: false,
  showAIImageEdit: false,
  showEventDashboard: false,
  showAdvancedExport: false,
  showBatchPrintExport: false,
  showVenuePreview: false,
};

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      ...initialModalState,
      toast: null,
      isExporting: false,
      isLoadingProject: false,
      isSavingToCloud: false,
      isGeneratingGuide: false,
      
      // Asset Modal Actions
      setEditingAsset: (asset) => set({ editingAsset: asset }),
      setViewingAsset: (asset) => set({ viewingAsset: asset }),
      setDownloadingAsset: (asset) => set({ downloadingAsset: asset }),
      setAiEditingAsset: (asset) => set({ 
        aiEditingAsset: asset,
        showAIImageEdit: asset !== null 
      }),
      
      // Feature Modal Actions
      openModal: (modal) => set({ [modal]: true }),
      closeModal: (modal) => set({ [modal]: false }),
      closeAllModals: () => set(initialModalState),
      
      // Toast Actions
      showToast: (message, type) => set({ toast: { message, type } }),
      hideToast: () => set({ toast: null }),
      
      // Loading State Actions
      setIsExporting: (value) => set({ isExporting: value }),
      setIsLoadingProject: (value) => set({ isLoadingProject: value }),
      setIsSavingToCloud: (value) => set({ isSavingToCloud: value }),
      setIsGeneratingGuide: (value) => set({ isGeneratingGuide: value }),
    }),
    { name: 'ui-store' }
  )
);

// Selectors
export const selectToast = (state: UIState) => state.toast;
export const selectIsExporting = (state: UIState) => state.isExporting;
export const selectIsLoadingProject = (state: UIState) => state.isLoadingProject;
export const selectEditingAsset = (state: UIState) => state.editingAsset;
export const selectViewingAsset = (state: UIState) => state.viewingAsset;
