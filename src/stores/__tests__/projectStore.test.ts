import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProjectStore } from '@/stores/projectStore';

describe('ProjectStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetProject } = useProjectStore.getState();
    resetProject();
  });

  describe('eventDetails', () => {
    it('should set event details', () => {
      const { setEventDetails } = useProjectStore.getState();
      
      act(() => {
        setEventDetails({
          name: 'Test Event',
          description: 'A test event',
          date: '2024-01-01',
          location: 'Test Location',
          website: 'https://test.com',
          email: 'test@test.com',
          incorporateLocationStyle: true,
        });
      });

      const { eventDetails } = useProjectStore.getState();
      expect(eventDetails.name).toBe('Test Event');
      expect(eventDetails.location).toBe('Test Location');
    });

    it('should update partial event details', () => {
      const { setEventDetails, updateEventDetails } = useProjectStore.getState();
      
      act(() => {
        setEventDetails({
          name: 'Original',
          description: '',
          date: '',
          location: '',
          website: '',
          email: '',
          incorporateLocationStyle: false,
        });
      });

      act(() => {
        updateEventDetails({ name: 'Updated', description: 'New desc' });
      });

      const { eventDetails } = useProjectStore.getState();
      expect(eventDetails.name).toBe('Updated');
      expect(eventDetails.description).toBe('New desc');
    });
  });

  describe('generatedAssets', () => {
    it('should add an asset', () => {
      const { addAsset } = useProjectStore.getState();
      
      act(() => {
        addAsset({
          id: 'test-1',
          type: 'BANNER' as any,
          title: 'Test Banner',
          content: '',
          isLoading: true,
        });
      });

      const { generatedAssets } = useProjectStore.getState();
      expect(generatedAssets).toHaveLength(1);
      expect(generatedAssets[0].title).toBe('Test Banner');
    });

    it('should update an asset', () => {
      const { addAsset, updateAsset } = useProjectStore.getState();
      
      act(() => {
        addAsset({
          id: 'test-1',
          type: 'BANNER' as any,
          title: 'Test Banner',
          content: '',
          isLoading: true,
        });
      });

      act(() => {
        updateAsset('test-1', { content: 'generated-content', isLoading: false });
      });

      const { generatedAssets } = useProjectStore.getState();
      expect(generatedAssets[0].content).toBe('generated-content');
      expect(generatedAssets[0].isLoading).toBe(false);
    });

    it('should remove an asset', () => {
      const { addAsset, removeAsset } = useProjectStore.getState();
      
      act(() => {
        addAsset({ id: 'test-1', type: 'BANNER' as any, title: 'Banner 1', content: '', isLoading: false });
        addAsset({ id: 'test-2', type: 'BANNER' as any, title: 'Banner 2', content: '', isLoading: false });
      });

      expect(useProjectStore.getState().generatedAssets).toHaveLength(2);

      act(() => {
        removeAsset('test-1');
      });

      const { generatedAssets } = useProjectStore.getState();
      expect(generatedAssets).toHaveLength(1);
      expect(generatedAssets[0].id).toBe('test-2');
    });

    it('should toggle asset favorite', () => {
      const { addAsset, toggleAssetFavorite } = useProjectStore.getState();
      
      act(() => {
        addAsset({ id: 'test-1', type: 'BANNER' as any, title: 'Banner', content: '', isLoading: false, isFavorite: false });
      });

      act(() => {
        toggleAssetFavorite('test-1');
      });

      expect(useProjectStore.getState().generatedAssets[0].isFavorite).toBe(true);

      act(() => {
        toggleAssetFavorite('test-1');
      });

      expect(useProjectStore.getState().generatedAssets[0].isFavorite).toBe(false);
    });
  });

  describe('folders', () => {
    it('should add and remove folders', () => {
      const { addFolder, removeFolder } = useProjectStore.getState();
      
      act(() => {
        addFolder({ id: 'folder-1', name: 'My Folder' });
      });

      expect(useProjectStore.getState().folders).toHaveLength(1);

      act(() => {
        removeFolder('folder-1');
      });

      expect(useProjectStore.getState().folders).toHaveLength(0);
    });

    it('should move asset to folder', () => {
      const { addAsset, addFolder, moveAssetToFolder } = useProjectStore.getState();
      
      act(() => {
        addAsset({ id: 'test-1', type: 'BANNER' as any, title: 'Banner', content: '', isLoading: false });
        addFolder({ id: 'folder-1', name: 'My Folder' });
      });

      act(() => {
        moveAssetToFolder('test-1', 'folder-1');
      });

      expect(useProjectStore.getState().generatedAssets[0].folderId).toBe('folder-1');
    });
  });

  describe('project management', () => {
    it('should reset project to initial state', () => {
      const { setEventDetails, addAsset, resetProject } = useProjectStore.getState();
      
      act(() => {
        setEventDetails({
          name: 'Test Event',
          description: '',
          date: '',
          location: '',
          website: '',
          email: '',
          incorporateLocationStyle: false,
        });
        addAsset({ id: 'test-1', type: 'BANNER' as any, title: 'Banner', content: '', isLoading: false });
      });

      expect(useProjectStore.getState().eventDetails.name).toBe('Test Event');
      expect(useProjectStore.getState().generatedAssets).toHaveLength(1);

      act(() => {
        resetProject();
      });

      expect(useProjectStore.getState().eventDetails.name).toBe('');
      expect(useProjectStore.getState().generatedAssets).toHaveLength(0);
    });
  });
});
