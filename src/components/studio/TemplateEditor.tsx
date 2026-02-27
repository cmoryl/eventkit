// Template Editor Component - Field-based template editing

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Type, Image, Palette, Upload, Eye, EyeOff, 
  Undo2, Redo2, Download, ChevronDown, ChevronUp,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { EditableTemplate, TemplateField, TemplateFieldValue, UserTemplateInstance } from '@/types/editableTemplate.types';

interface TemplateEditorProps {
  template: EditableTemplate;
  onSave?: (instance: UserTemplateInstance) => void;
  onExport?: (format: string) => void;
  onClose?: () => void;
  initialValues?: TemplateFieldValue[];
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onExport,
  onClose,
  initialValues = []
}) => {
  // Field values state
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    template.fields.forEach(field => {
      const existing = initialValues.find(v => v.fieldId === field.id);
      values[field.id] = existing?.value || field.defaultValue || '';
    });
    return values;
  });

  // Style overrides
  const [styleOverrides, setStyleOverrides] = useState<Record<string, Partial<TemplateField['style']>>>({});

  // UI state
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showGuides, setShowGuides] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ fields: true, style: true });
  const [zoom, setZoom] = useState<number>(1);

  // Get field groups
  const fieldGroups = React.useMemo(() => {
    const groups: Record<string, TemplateField[]> = { ungrouped: [] };
    template.fields.forEach(field => {
      const groupName = field.group || 'ungrouped';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(field);
    });
    return groups;
  }, [template.fields]);

  // Update field value
  const updateFieldValue = useCallback((fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  // Update style override
  const updateStyleOverride = useCallback((fieldId: string, style: Partial<TemplateField['style']>) => {
    setStyleOverrides(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], ...style }
    }));
  }, []);

  // Get merged style for a field
  const getMergedStyle = (field: TemplateField) => ({
    ...field.style,
    ...styleOverrides[field.id]
  });

  // Render field input based on type
  const renderFieldInput = (field: TemplateField) => {
    const value = fieldValues[field.id] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className="bg-background"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={field.maxLines || 3}
            className="bg-background resize-none"
          />
        );
      
      case 'image':
      case 'logo':
        return (
          <div className="space-y-2">
            {value ? (
              <div className="relative group">
                <img src={value} alt={field.name} className="w-full h-24 object-contain rounded border" />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => updateFieldValue(field.id, '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">{field.placeholder || 'Upload image'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept={field.acceptedFormats?.map(f => `.${f}`).join(',') || 'image/*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      updateFieldValue(field.id, url);
                    }
                  }}
                />
              </label>
            )}
          </div>
        );
      
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={value}
              onChange={(e) => updateFieldValue(field.id, e.target.value)}
              placeholder="#000000"
              className="flex-1 bg-background font-mono text-sm"
            />
          </div>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            className="bg-background"
          />
        );
      
      case 'qrcode':
        return (
          <Input
            value={value}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder={field.placeholder || 'Enter URL for QR code'}
            className="bg-background"
          />
        );
      
      default:
        return null;
    }
  };

  // Render style controls for selected field
  const renderStyleControls = (field: TemplateField) => {
    if (!['text', 'textarea'].includes(field.type)) return null;
    
    const style = getMergedStyle(field);
    
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Typography</Label>
        
        {/* Text alignment */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={style.textAlign === 'left' ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => updateStyleOverride(field.id, { textAlign: 'left' })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={style.textAlign === 'center' ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => updateStyleOverride(field.id, { textAlign: 'center' })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={style.textAlign === 'right' ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => updateStyleOverride(field.id, { textAlign: 'right' })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            size="sm"
            variant={style.fontWeight === 'bold' ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => updateStyleOverride(field.id, { 
              fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={style.fontStyle === 'italic' ? 'secondary' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => updateStyleOverride(field.id, { 
              fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Font size */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Font Size</Label>
            <span className="text-xs text-muted-foreground">{style.fontSize || 14}pt</span>
          </div>
          <Slider
            value={[style.fontSize || 14]}
            min={8}
            max={120}
            step={1}
            onValueChange={([v]) => updateStyleOverride(field.id, { fontSize: v })}
          />
        </div>
        
        {/* Text color */}
        <div className="flex items-center gap-2">
          <Label className="text-xs flex-shrink-0">Color</Label>
          <input
            type="color"
            value={style.color || '#000000'}
            onChange={(e) => updateStyleOverride(field.id, { color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <Input
            value={style.color || '#000000'}
            onChange={(e) => updateStyleOverride(field.id, { color: e.target.value })}
            className="flex-1 bg-background font-mono text-xs h-8"
          />
        </div>
      </div>
    );
  };

  // Base scale keeps the preview comfortably within the editor viewport.
  // `zoom` is a multiplier controlled by the dropdown (25%..200%).
  const baseScale = 0.5;
  const previewScale = baseScale * zoom;

  return (
    <div className="flex h-full bg-background">
      {/* Left Panel - Field Editor */}
      <div className="w-80 border-r border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">{template.name}</h3>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{template.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-muted px-2 py-0.5 rounded">{template.dimensions.widthInches}" × {template.dimensions.heightInches}"</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">{template.dpi} DPI</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">{template.colorMode}</span>
          </div>
        </div>

        {/* Fields */}
        <div className="p-4 space-y-4">
          <Collapsible 
            open={expandedGroups.fields} 
            onOpenChange={(open) => setExpandedGroups(prev => ({ ...prev, fields: open }))}
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-0 h-8">
                <span className="text-sm font-medium">Edit Content</span>
                {expandedGroups.fields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              {template.fields
                .filter(f => !['shape', 'divider'].includes(f.type))
                .map(field => (
                  <div 
                    key={field.id} 
                    className={cn(
                      "space-y-2 p-3 rounded-lg border transition-colors",
                      selectedFieldId === field.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {field.name}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.type === 'text' && <Type className="h-3 w-3 text-muted-foreground" />}
                      {(field.type === 'image' || field.type === 'logo') && <Image className="h-3 w-3 text-muted-foreground" />}
                      {field.type === 'color' && <Palette className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    {renderFieldInput(field)}
                    {selectedFieldId === field.id && renderStyleControls(field)}
                  </div>
                ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Center - Preview Canvas */}
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setShowGuides(!showGuides)}
            >
              {showGuides ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="text-xs">Guides</span>
            </Button>
            <Select value={String(zoom)} onValueChange={(v) => setZoom(Number(v))}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue placeholder={`${Math.round(zoom * 100)}%`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">25%</SelectItem>
                <SelectItem value="0.5">50%</SelectItem>
                <SelectItem value="0.75">75%</SelectItem>
                <SelectItem value="1">100%</SelectItem>
                <SelectItem value="1.5">150%</SelectItem>
                <SelectItem value="2">200%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={() => onExport?.('png')}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas - Scrollable & Pannable */}
        <div 
          className="flex-1 overflow-auto cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            const el = e.currentTarget;
            const startX = e.clientX;
            const startY = e.clientY;
            const scrollLeft = el.scrollLeft;
            const scrollTop = el.scrollTop;
            const onMove = (ev: MouseEvent) => {
              el.scrollLeft = scrollLeft - (ev.clientX - startX);
              el.scrollTop = scrollTop - (ev.clientY - startY);
            };
            const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        >
          <div className="min-w-full min-h-full flex items-center justify-center p-8">
          <div 
            className="relative bg-white shadow-2xl"
            style={{
              width: template.dimensions.widthPx * previewScale,
              height: template.dimensions.heightPx * previewScale
            }}
          >
            {/* Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: template.background.type === 'solid' 
                  ? template.background.value 
                  : template.background.value
              }}
            />

            {/* Bleed guide */}
            {showGuides && template.dimensions.bleedInches > 0 && (
              <div 
                className="absolute border border-dashed border-red-400 pointer-events-none"
                style={{
                  top: template.dimensions.bleedInches * template.dpi * previewScale,
                  left: template.dimensions.bleedInches * template.dpi * previewScale,
                  right: template.dimensions.bleedInches * template.dpi * previewScale,
                  bottom: template.dimensions.bleedInches * template.dpi * previewScale
                }}
              />
            )}

            {/* Safe zone guide */}
            {showGuides && template.dimensions.safeZoneInches > 0 && (
              <div 
                className="absolute border border-dashed border-green-400 pointer-events-none"
                style={{
                  top: (template.dimensions.bleedInches + template.dimensions.safeZoneInches) * template.dpi * previewScale,
                  left: (template.dimensions.bleedInches + template.dimensions.safeZoneInches) * template.dpi * previewScale,
                  right: (template.dimensions.bleedInches + template.dimensions.safeZoneInches) * template.dpi * previewScale,
                  bottom: (template.dimensions.bleedInches + template.dimensions.safeZoneInches) * template.dpi * previewScale
                }}
              />
            )}

            {/* Fields */}
            {template.fields.map(field => {
              const style = getMergedStyle(field);
              const value = fieldValues[field.id] || field.placeholder || '';
              
              return (
                <div
                  key={field.id}
                  className={cn(
                    "absolute transition-all",
                    selectedFieldId === field.id && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{
                    left: `${field.position.x}%`,
                    top: `${field.position.y}%`,
                    width: `${field.position.width}%`,
                    height: `${field.position.height}%`,
                    transform: field.position.rotation ? `rotate(${field.position.rotation}deg)` : undefined,
                    zIndex: field.position.zIndex || 1
                  }}
                  onClick={() => setSelectedFieldId(field.id)}
                >
                  {/* Text fields */}
                  {(field.type === 'text' || field.type === 'textarea') && (
                    <div
                      className="w-full h-full flex items-center overflow-hidden"
                      style={{
                        fontFamily: style.fontFamily,
                        fontSize: (style.fontSize || 14) * previewScale,
                        fontWeight: style.fontWeight as any,
                        fontStyle: style.fontStyle,
                        textAlign: style.textAlign as any,
                        lineHeight: style.lineHeight,
                        letterSpacing: style.letterSpacing,
                        textTransform: style.textTransform as any,
                        color: fieldValues[field.id] ? style.color : 'rgba(0,0,0,0.3)',
                        backgroundColor: style.backgroundColor,
                        borderRadius: style.borderRadius,
                        padding: style.backgroundColor ? '0.25em 0.5em' : 0
                      }}
                    >
                      {value}
                    </div>
                  )}

                  {/* Image/Logo fields */}
                  {(field.type === 'image' || field.type === 'logo') && (
                    <div className="w-full h-full flex items-center justify-center">
                      {fieldValues[field.id] ? (
                        <img 
                          src={fieldValues[field.id]} 
                          alt={field.name}
                          className="max-w-full max-h-full"
                          style={{
                            objectFit: style.objectFit as any,
                            borderRadius: style.borderRadius,
                            opacity: style.opacity
                          }}
                        />
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                          {field.placeholder || field.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shape fields */}
                  {field.type === 'shape' && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: style.backgroundColor,
                        borderRadius: style.borderRadius,
                        borderWidth: style.borderWidth,
                        borderStyle: style.borderStyle,
                        borderColor: style.borderColor,
                        opacity: style.opacity
                      }}
                    />
                  )}

                  {/* Divider fields */}
                  {field.type === 'divider' && (
                    <div
                      className="w-full"
                      style={{
                        height: 1,
                        backgroundColor: style.backgroundColor || '#e5e7eb'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
