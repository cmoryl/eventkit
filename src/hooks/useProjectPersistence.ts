import { useState } from 'react';
import JSZip from 'jszip';
import type { EventDetails, GeneratedAsset, AssetFolder, ColorInfo, LogoAsset } from '../types';

interface UseProjectPersistenceProps {
  eventDetails: EventDetails;
  generatedAssets: GeneratedAsset[];
  logos: LogoAsset[];
  styleDescription: string;
  colorPalette: ColorInfo[];
  folders: AssetFolder[];
  onLoad: (data: any) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const useProjectPersistence = ({
  eventDetails,
  generatedAssets,
  logos,
  styleDescription,
  colorPalette,
  folders,
  onLoad,
  showToast
}: UseProjectPersistenceProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const handleSaveProject = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const assetsFolder = zip.folder("assets");

      // Process Generated Assets
      const processedAssets = await Promise.all(generatedAssets.map(async (asset) => {
        const newAsset = { ...asset };

        if (typeof asset.content === 'string' && asset.content.startsWith('data:')) {
          const ext = asset.content.split(';')[0].split('/')[1] || 'png';
          const filename = `${asset.id}.${ext}`;
          if (assetsFolder) {
            assetsFolder.file(filename, asset.content.split(',')[1], { base64: true });
            newAsset.content = `assets/${filename}`;
          }
        } else if (typeof asset.content === 'string' && asset.content.startsWith('blob:')) {
          try {
            const res = await fetch(asset.content);
            const blob = await res.blob();
            const ext = blob.type.split('/')[1] || 'png';
            const filename = `${asset.id}.${ext}`;
            if (assetsFolder) {
              assetsFolder.file(filename, blob);
              newAsset.content = `assets/${filename}`;
            }
          } catch (e) {
            console.warn("Failed to fetch blob", e);
          }
        }

        if (asset.backContent && asset.backContent.startsWith('data:')) {
          const ext = asset.backContent.split(';')[0].split('/')[1] || 'png';
          const filename = `${asset.id}_back.${ext}`;
          if (assetsFolder) {
            assetsFolder.file(filename, asset.backContent.split(',')[1], { base64: true });
            newAsset.backContent = `assets/${filename}`;
          }
        }

        return newAsset;
      }));

      // Process Logos
      const processedLogos = await Promise.all(logos.map(async (logo, index) => {
        const filename = `logo_${index}.png`;
        if (assetsFolder) {
          try {
            const res = await fetch(logo.url);
            const blob = await res.blob();
            assetsFolder.file(filename, blob);
          } catch (e) {
            console.warn("Failed to save logo", e);
          }
        }
        return { ...logo, url: `assets/${filename}`, file: undefined };
      }));

      const projectData = {
        version: '1.0',
        eventDetails,
        generatedAssets: processedAssets,
        logos: processedLogos,
        styleDescription,
        colorPalette,
        folders
      };

      zip.file("project.json", JSON.stringify(projectData, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventDetails.name.replace(/\s+/g, '_')}_design_kit.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Project saved successfully!", "success");
    } catch (error) {
      console.error("Save failed:", error);
      showToast("Failed to save project", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadProject = async (file: File) => {
    setIsLoadingProject(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const projectJson = await zip.file("project.json")?.async("string");

      if (!projectJson) {
        throw new Error("Invalid project file");
      }

      const projectData = JSON.parse(projectJson);

      // Restore assets
      const restoredAssets = await Promise.all(projectData.generatedAssets.map(async (asset: any) => {
        const newAsset = { ...asset };

        if (typeof asset.content === 'string' && asset.content.startsWith('assets/')) {
          const assetFile = await zip.file(asset.content)?.async("base64");
          if (assetFile) {
            const ext = asset.content.split('.').pop();
            newAsset.content = `data:image/${ext};base64,${assetFile}`;
          }
        }

        if (typeof asset.backContent === 'string' && asset.backContent.startsWith('assets/')) {
          const assetFile = await zip.file(asset.backContent)?.async("base64");
          if (assetFile) {
            const ext = asset.backContent.split('.').pop();
            newAsset.backContent = `data:image/${ext};base64,${assetFile}`;
          }
        }

        return newAsset;
      }));

      // Restore logos
      const restoredLogos = await Promise.all(projectData.logos.map(async (logo: any) => {
        if (typeof logo.url === 'string' && logo.url.startsWith('assets/')) {
          const logoFile = await zip.file(logo.url)?.async("blob");
          if (logoFile) {
            const file = new File([logoFile], logo.name || 'logo.png', { type: 'image/png' });
            return { ...logo, file, url: URL.createObjectURL(logoFile) };
          }
        }
        return logo;
      }));

      await onLoad({
        eventDetails: projectData.eventDetails,
        generatedAssets: restoredAssets,
        logos: restoredLogos,
        styleDescription: projectData.styleDescription || '',
        colorPalette: projectData.colorPalette || [],
        folders: projectData.folders || []
      });

      showToast("Project loaded successfully!", "success");
    } catch (error) {
      console.error("Load failed:", error);
      showToast("Failed to load project", "error");
    } finally {
      setIsLoadingProject(false);
    }
  };

  return {
    handleSaveProject,
    handleLoadProject,
    isExporting,
    isLoadingProject
  };
};
