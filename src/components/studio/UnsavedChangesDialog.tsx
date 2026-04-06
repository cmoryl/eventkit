import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Save } from 'lucide-react';

interface UnsavedChangesDialogProps {
  open: boolean;
  onDiscard: () => void;
  onSaveAndLeave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onDiscard,
  onSaveAndLeave,
  onCancel,
  isSaving,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            You have generated assets that haven't been saved to the cloud yet. Would you like to save before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel} disabled={isSaving}>
            Stay
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            disabled={isSaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Discard & Leave
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onSaveAndLeave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save & Leave'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
