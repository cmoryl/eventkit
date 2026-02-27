// Template Workflow Modal - Select template, customize, and export

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowLeft, ArrowRight, Check, Download, Sparkles, 
  FileText, Palette, Layout, Printer 
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EditableTemplate, UserTemplateInstance, TemplateFieldValue } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';
import { 
  getTemplatesForAsset, 
  getUniversalTemplates, 
  getTemplateById,
  TEMPLATE_STATS 
} from '@/config/editableTemplates';
import { Brand } from '@/types/studio.types';
import { TemplateSelector } from './TemplateSelector';
import { TemplateEditor } from './TemplateEditor';
import { toast } from 'sonner';

type WorkflowStep = 'select' | 'customize' | 'export';

interface TemplateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: string;
  assetName: string;
  brand: Brand | null;
  onExport?: (instance: UserTemplateInstance, format: string) => void;
}

export const TemplateWorkflowModal: React.FC<TemplateWorkflowModalProps> = ({
  isOpen,
  onClose,
  assetType,
  assetName,
  brand,
  onExport
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<EditableTemplate | null>(null);
  const [templateInstance, setTemplateInstance] = useState<UserTemplateInstance | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf');

  // Get templates for this asset type
  const availableTemplates = useMemo(() => {
    const assetTypeEnum = Object.values(AssetType).find(
      t => t === assetType || t.toLowerCase() === assetType.toLowerCase()
    );
    if (assetTypeEnum) {
      return getTemplatesForAsset(assetTypeEnum);
    }
    return getUniversalTemplates();
  }, [assetType]);

  // Initialize template instance when template is selected
  const handleSelectTemplate = (template: EditableTemplate) => {
    setSelectedTemplate(template);
    
    // Create initial instance with brand colors if available
    const instance: UserTemplateInstance = {
      id: `instance-${Date.now()}`,
      templateId: template.id,
      userId: 'current-user',
      name: `${assetName} - ${template.name}`,
      fieldValues: template.fields.map(field => ({
        fieldId: field.id,
        value: field.defaultValue || ''
      })),
      colorOverrides: brand?.styles ? {
        primary: brand.styles.primary_color || template.defaultColors.primary,
        secondary: brand.styles.secondary_color || template.defaultColors.secondary,
        accent: brand.styles.accent_color || template.defaultColors.accent,
        text: template.defaultColors.text,
        background: template.defaultColors.background
      } : undefined,
      fontOverrides: brand?.styles ? {
        heading: brand.styles.heading_font || template.defaultFonts.heading,
        body: brand.styles.body_font || template.defaultFonts.body
      } : undefined,
      exportFormat: 'pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTemplateInstance(instance);
    setCurrentStep('customize');
  };

  // Update field value in instance
  const handleFieldChange = (fieldId: string, value: string) => {
    if (!templateInstance) return;
    
    setTemplateInstance(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fieldValues: prev.fieldValues.map(fv =>
          fv.fieldId === fieldId ? { ...fv, value } : fv
        ),
        updatedAt: new Date().toISOString()
      };
    });
  };

  // Handle export
  const handleExport = () => {
    if (!templateInstance || !selectedTemplate) return;
    
    // TODO: Implement actual export logic
    toast.success(`Exporting ${assetName} as ${exportFormat.toUpperCase()}...`);
    
    if (onExport) {
      onExport({
        ...templateInstance,
        exportFormat
      }, exportFormat);
    }
    
    onClose();
  };

  // Navigation
  const goBack = () => {
    if (currentStep === 'customize') {
      setCurrentStep('select');
    } else if (currentStep === 'export') {
      setCurrentStep('customize');
    }
  };

  const goNext = () => {
    if (currentStep === 'customize') {
      setCurrentStep('export');
    }
  };

  // Step indicator
  const steps = [
    { id: 'select', label: 'Select Template', icon: Layout },
    { id: 'customize', label: 'Customize', icon: Palette },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] sm:h-[90vh] p-0 overflow-hidden" hideClose onInteractOutside={(e) => e.preventDefault()}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b bg-muted/30">
            <div className="flex items-center gap-4">
              {currentStep !== 'select' && (
                <Button variant="ghost" size="icon" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h2 className="text-lg font-semibold">{assetName}</h2>
                <p className="text-sm text-muted-foreground">
                  {availableTemplates.length} templates available
                </p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <React.Fragment key={step.id}>
                    <div 
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                        isActive && "bg-primary text-primary-foreground",
                        isCompleted && "bg-primary/20 text-primary",
                        !isActive && !isCompleted && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-8 h-0.5 rounded",
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Template */}
              {currentStep === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto p-6"
                >
                  <TemplateSelector
                    assetType={assetType as AssetType}
                    onSelect={handleSelectTemplate}
                    selectedTemplateId={selectedTemplate?.id}
                  />
                </motion.div>
              )}
              
              {/* Step 2: Customize Template */}
              {currentStep === 'customize' && selectedTemplate && templateInstance && (
                <motion.div
                  key="customize"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full"
                >
                  <TemplateEditor
                    template={selectedTemplate}
                    initialValues={templateInstance.fieldValues}
                    onSave={(instance) => {
                      setTemplateInstance(instance);
                      setCurrentStep('export');
                    }}
                  />
                </motion.div>
              )}
              
              {/* Step 3: Export Options */}
              {currentStep === 'export' && selectedTemplate && (
                <motion.div
                  key="export"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full overflow-y-auto p-6"
                >
                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* Preview */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">Ready to Export</h3>
                      <p className="text-muted-foreground">
                        Your {assetName} is ready. Choose an export format below.
                      </p>
                    </div>
                    
                    {/* Template Preview Thumbnail */}
                    <div 
                      className="mx-auto w-64 h-48 rounded-lg border-2 border-dashed border-border flex items-center justify-center"
                      style={{ background: selectedTemplate.background.value }}
                    >
                      <div className="text-center text-sm text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{selectedTemplate.name}</p>
                        <p className="text-xs">
                          {selectedTemplate.dimensions.widthInches}" × {selectedTemplate.dimensions.heightInches}"
                        </p>
                      </div>
                    </div>
                    
                    {/* Export Format Selection */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Export Format</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { format: 'pdf', label: 'PDF', desc: 'Print-ready, vector', icon: FileText },
                          { format: 'png', label: 'PNG', desc: 'High quality, transparent', icon: Sparkles },
                          { format: 'jpg', label: 'JPG', desc: 'Compressed, web-ready', icon: Printer }
                        ].map(({ format, label, desc, icon: Icon }) => (
                          <button
                            key={format}
                            className={cn(
                              "p-4 rounded-lg border-2 text-left transition-all",
                              exportFormat === format
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => setExportFormat(format as any)}
                          >
                            <Icon className={cn(
                              "h-6 w-6 mb-2",
                              exportFormat === format ? "text-primary" : "text-muted-foreground"
                            )} />
                            <div className="font-medium">{label}</div>
                            <div className="text-xs text-muted-foreground">{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Print Specs Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span>{selectedTemplate.dimensions.widthInches}" × {selectedTemplate.dimensions.heightInches}"</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolution:</span>
                          <span>{selectedTemplate.dpi} DPI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color Mode:</span>
                          <span>{selectedTemplate.colorMode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bleed:</span>
                          <span>{selectedTemplate.dimensions.bleedInches}"</span>
                        </div>
                      </div>
                      {selectedTemplate.vendorId && (
                        <Badge variant="secondary" className="mt-2">
                          Optimized for {selectedTemplate.vendorId}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Export Button */}
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export as {exportFormat.toUpperCase()}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Footer - Navigation */}
          {currentStep === 'customize' && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
              <Button variant="outline" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
              <Button onClick={goNext}>
                Continue to Export
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateWorkflowModal;
