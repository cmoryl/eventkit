import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUIStore } from '@/stores/uiStore';

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useUIStore.setState({
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
        toast: null,
        isExporting: false,
        isLoadingProject: false,
        isSavingToCloud: false,
        isGeneratingGuide: false,
      });
    });
  });

  describe('modals', () => {
    it('should open and close feature modals', () => {
      const { openModal, closeModal } = useUIStore.getState();
      
      act(() => {
        openModal('showQRGenerator');
      });

      expect(useUIStore.getState().showQRGenerator).toBe(true);

      act(() => {
        closeModal('showQRGenerator');
      });

      expect(useUIStore.getState().showQRGenerator).toBe(false);
    });

    it('should close all modals at once', () => {
      const { openModal, closeAllModals } = useUIStore.getState();
      
      act(() => {
        openModal('showQRGenerator');
        openModal('showAuthModal');
        openModal('showEventDashboard');
      });

      expect(useUIStore.getState().showQRGenerator).toBe(true);
      expect(useUIStore.getState().showAuthModal).toBe(true);
      expect(useUIStore.getState().showEventDashboard).toBe(true);

      act(() => {
        closeAllModals();
      });

      expect(useUIStore.getState().showQRGenerator).toBe(false);
      expect(useUIStore.getState().showAuthModal).toBe(false);
      expect(useUIStore.getState().showEventDashboard).toBe(false);
    });

    it('should set editing asset', () => {
      const { setEditingAsset } = useUIStore.getState();
      const mockAsset = { id: '1', type: 'BANNER' as any, title: 'Test', content: '', isLoading: false };
      
      act(() => {
        setEditingAsset(mockAsset);
      });

      expect(useUIStore.getState().editingAsset).toEqual(mockAsset);

      act(() => {
        setEditingAsset(null);
      });

      expect(useUIStore.getState().editingAsset).toBeNull();
    });

    it('should set AI editing asset and open modal', () => {
      const { setAiEditingAsset } = useUIStore.getState();
      const mockAsset = { id: '1', type: 'BANNER' as any, title: 'Test', content: 'data:image/png;base64,...', isLoading: false };
      
      act(() => {
        setAiEditingAsset(mockAsset);
      });

      expect(useUIStore.getState().aiEditingAsset).toEqual(mockAsset);
      expect(useUIStore.getState().showAIImageEdit).toBe(true);
    });
  });

  describe('toast', () => {
    it('should show and hide toast', () => {
      const { showToast, hideToast } = useUIStore.getState();
      
      act(() => {
        showToast('Success message', 'success');
      });

      expect(useUIStore.getState().toast).toEqual({
        message: 'Success message',
        type: 'success',
      });

      act(() => {
        hideToast();
      });

      expect(useUIStore.getState().toast).toBeNull();
    });

    it('should support different toast types', () => {
      const { showToast } = useUIStore.getState();
      
      const types: Array<'success' | 'error' | 'info' | 'warning'> = ['success', 'error', 'info', 'warning'];
      
      types.forEach(type => {
        act(() => {
          showToast(`${type} message`, type);
        });

        expect(useUIStore.getState().toast?.type).toBe(type);
      });
    });
  });

  describe('loading states', () => {
    it('should manage exporting state', () => {
      const { setIsExporting } = useUIStore.getState();
      
      expect(useUIStore.getState().isExporting).toBe(false);

      act(() => {
        setIsExporting(true);
      });

      expect(useUIStore.getState().isExporting).toBe(true);

      act(() => {
        setIsExporting(false);
      });

      expect(useUIStore.getState().isExporting).toBe(false);
    });

    it('should manage loading project state', () => {
      const { setIsLoadingProject } = useUIStore.getState();
      
      act(() => {
        setIsLoadingProject(true);
      });

      expect(useUIStore.getState().isLoadingProject).toBe(true);
    });

    it('should manage saving to cloud state', () => {
      const { setIsSavingToCloud } = useUIStore.getState();
      
      act(() => {
        setIsSavingToCloud(true);
      });

      expect(useUIStore.getState().isSavingToCloud).toBe(true);
    });
  });
});
