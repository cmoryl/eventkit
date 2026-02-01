import React, { useRef, useState } from 'react';
import { 
  Save, FolderOpen, Download, Upload, MoreVertical, 
  Cloud, CloudOff, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProjectControlsProps {
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
  onSaveToCloud?: () => void;
  isSaving?: boolean;
  isLoadingProject?: boolean;
  isSavingToCloud?: boolean;
  isCloudEnabled?: boolean;
  hasUnsavedChanges?: boolean;
  projectName?: string;
  compact?: boolean;
}

export const ProjectControls: React.FC<ProjectControlsProps> = ({
  onSaveProject,
  onLoadProject,
  onSaveToCloud,
  isSaving = false,
  isLoadingProject = false,
  isSavingToCloud = false,
  isCloudEnabled = false,
  hasUnsavedChanges = false,
  projectName = 'Project',
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.zip')) {
        toast.error('Please select a valid project file (.zip)');
        return;
      }
      onLoadProject(file);
    }
    e.target.value = '';
  };

  const handleOpenProject = () => {
    fileInputRef.current?.click();
  };

  if (compact) {
    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          accept=".zip"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Project</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleOpenProject} disabled={isLoadingProject}>
              {isLoadingProject ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Open Project (.zip)
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onSaveProject} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Save as ZIP
            </DropdownMenuItem>
            
            {isCloudEnabled && onSaveToCloud && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSaveToCloud} disabled={isSavingToCloud}>
                  {isSavingToCloud ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Cloud className="h-4 w-4 mr-2" />
                  )}
                  Save to Cloud
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        accept=".zip"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenProject}
        disabled={isLoadingProject}
        className="gap-2"
      >
        {isLoadingProject ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Open</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onSaveProject}
        disabled={isSaving}
        className="gap-2"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Save</span>
      </Button>

      {isCloudEnabled && onSaveToCloud && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onSaveToCloud}
          disabled={isSavingToCloud}
          className={cn("gap-2", hasUnsavedChanges && "border-amber-500/50")}
        >
          {isSavingToCloud ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Cloud</span>
          {hasUnsavedChanges && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </Button>
      )}
    </div>
  );
};

export default ProjectControls;
