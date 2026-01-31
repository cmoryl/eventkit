import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset, VenueVideoAnalysis, AssetFolder } from '@/types';

// Default event details
const defaultEventDetails: EventDetails = {
  name: '',
  description: '',
  date: '',
  location: '',
  website: '',
  email: '',
  incorporateLocationStyle: false,
};

interface ProjectState {
  // Core project data
  eventDetails: EventDetails;
  logos: LogoAsset[];
  generatedAssets: GeneratedAsset[];
  folders: AssetFolder[];
  styleDescription: string;
  colorPalette: ColorInfo[];
  venueVideoAnalysis: VenueVideoAnalysis | null;
  
  // View state
  view: 'onboarding' | 'studio';
  
  // Generation state
  isGenerating: boolean;
  generationProgress: { current: number; total: number };
  
  // Actions - Event Details
  setEventDetails: (details: EventDetails) => void;
  updateEventDetails: (partial: Partial<EventDetails>) => void;
  
  // Actions - Logos
  setLogos: (logos: LogoAsset[]) => void;
  addLogo: (logo: LogoAsset) => void;
  removeLogo: (id: string) => void;
  
  // Actions - Assets
  setGeneratedAssets: (assets: GeneratedAsset[]) => void;
  addAsset: (asset: GeneratedAsset) => void;
  updateAsset: (id: string, updates: Partial<GeneratedAsset>) => void;
  removeAsset: (id: string) => void;
  toggleAssetFavorite: (id: string) => void;
  moveAssetToFolder: (assetId: string, folderId: string | null) => void;
  
  // Actions - Folders
  setFolders: (folders: AssetFolder[]) => void;
  addFolder: (folder: AssetFolder) => void;
  removeFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  
  // Actions - Style
  setStyleDescription: (desc: string) => void;
  setColorPalette: (palette: ColorInfo[]) => void;
  
  // Actions - Venue
  setVenueVideoAnalysis: (analysis: VenueVideoAnalysis | null) => void;
  
  // Actions - View
  setView: (view: 'onboarding' | 'studio') => void;
  
  // Actions - Generation
  setIsGenerating: (value: boolean) => void;
  setGenerationProgress: (progress: { current: number; total: number }) => void;
  
  // Actions - Project Management
  resetProject: () => void;
  loadProject: (data: Partial<ProjectState>) => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    immer((set) => ({
      // Initial state
      eventDetails: defaultEventDetails,
      logos: [],
      generatedAssets: [],
      folders: [],
      styleDescription: '',
      colorPalette: [],
      venueVideoAnalysis: null,
      view: 'onboarding',
      isGenerating: false,
      generationProgress: { current: 0, total: 0 },
      
      // Event Details Actions
      setEventDetails: (details) => set((state) => {
        state.eventDetails = details;
      }),
      
      updateEventDetails: (partial) => set((state) => {
        state.eventDetails = { ...state.eventDetails, ...partial };
      }),
      
      // Logo Actions
      setLogos: (logos) => set((state) => {
        state.logos = logos;
      }),
      
      addLogo: (logo) => set((state) => {
        state.logos.push(logo);
      }),
      
      removeLogo: (id) => set((state) => {
        state.logos = state.logos.filter(l => l.id !== id);
      }),
      
      // Asset Actions
      setGeneratedAssets: (assets) => set((state) => {
        state.generatedAssets = assets;
      }),
      
      addAsset: (asset) => set((state) => {
        state.generatedAssets.push(asset);
      }),
      
      updateAsset: (id, updates) => set((state) => {
        const index = state.generatedAssets.findIndex(a => a.id === id);
        if (index !== -1) {
          state.generatedAssets[index] = { ...state.generatedAssets[index], ...updates };
        }
      }),
      
      removeAsset: (id) => set((state) => {
        state.generatedAssets = state.generatedAssets.filter(a => a.id !== id);
      }),
      
      toggleAssetFavorite: (id) => set((state) => {
        const asset = state.generatedAssets.find(a => a.id === id);
        if (asset) {
          asset.isFavorite = !asset.isFavorite;
        }
      }),
      
      moveAssetToFolder: (assetId, folderId) => set((state) => {
        const asset = state.generatedAssets.find(a => a.id === assetId);
        if (asset) {
          asset.folderId = folderId || undefined;
        }
      }),
      
      // Folder Actions
      setFolders: (folders) => set((state) => {
        state.folders = folders;
      }),
      
      addFolder: (folder) => set((state) => {
        state.folders.push(folder);
      }),
      
      removeFolder: (id) => set((state) => {
        state.folders = state.folders.filter(f => f.id !== id);
        // Also remove folder reference from assets
        state.generatedAssets.forEach(a => {
          if (a.folderId === id) a.folderId = undefined;
        });
      }),
      
      renameFolder: (id, name) => set((state) => {
        const folder = state.folders.find(f => f.id === id);
        if (folder) folder.name = name;
      }),
      
      // Style Actions
      setStyleDescription: (desc) => set((state) => {
        state.styleDescription = desc;
      }),
      
      setColorPalette: (palette) => set((state) => {
        state.colorPalette = palette;
      }),
      
      // Venue Actions
      setVenueVideoAnalysis: (analysis) => set((state) => {
        state.venueVideoAnalysis = analysis;
      }),
      
      // View Actions
      setView: (view) => set((state) => {
        state.view = view;
      }),
      
      // Generation Actions
      setIsGenerating: (value) => set((state) => {
        state.isGenerating = value;
      }),
      
      setGenerationProgress: (progress) => set((state) => {
        state.generationProgress = progress;
      }),
      
      // Project Management
      resetProject: () => set((state) => {
        state.eventDetails = defaultEventDetails;
        state.logos = [];
        state.generatedAssets = [];
        state.folders = [];
        state.styleDescription = '';
        state.colorPalette = [];
        state.venueVideoAnalysis = null;
        state.view = 'onboarding';
        state.isGenerating = false;
        state.generationProgress = { current: 0, total: 0 };
      }),
      
      loadProject: (data) => set((state) => {
        if (data.eventDetails) state.eventDetails = data.eventDetails;
        if (data.logos) state.logos = data.logos;
        if (data.generatedAssets) state.generatedAssets = data.generatedAssets;
        if (data.folders) state.folders = data.folders;
        if (data.styleDescription !== undefined) state.styleDescription = data.styleDescription;
        if (data.colorPalette) state.colorPalette = data.colorPalette;
        if (data.venueVideoAnalysis !== undefined) state.venueVideoAnalysis = data.venueVideoAnalysis;
        if (data.view) state.view = data.view;
      }),
    })),
    { name: 'project-store' }
  )
);

// Selectors for optimized re-renders
export const selectEventDetails = (state: ProjectState) => state.eventDetails;
export const selectLogos = (state: ProjectState) => state.logos;
export const selectGeneratedAssets = (state: ProjectState) => state.generatedAssets;
export const selectColorPalette = (state: ProjectState) => state.colorPalette;
export const selectFolders = (state: ProjectState) => state.folders;
export const selectIsGenerating = (state: ProjectState) => state.isGenerating;
export const selectGenerationProgress = (state: ProjectState) => state.generationProgress;
export const selectView = (state: ProjectState) => state.view;
export const selectVenueVideoAnalysis = (state: ProjectState) => state.venueVideoAnalysis;

// Derived selectors
export const selectFavoriteAssets = (state: ProjectState) => 
  state.generatedAssets.filter(a => a.isFavorite);

export const selectAssetsByFolder = (folderId: string | null) => (state: ProjectState) =>
  state.generatedAssets.filter(a => 
    folderId === null ? !a.folderId : a.folderId === folderId
  );

export const selectLoadingAssets = (state: ProjectState) =>
  state.generatedAssets.filter(a => a.isLoading);

export const selectCompletedAssets = (state: ProjectState) =>
  state.generatedAssets.filter(a => !a.isLoading);
