// TemplatePreviewRenderer – renders a visual thumbnail from EditableTemplate data
import React from 'react';
import { cn } from '@/lib/utils';
import type { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';

interface TemplatePreviewRendererProps {
  template: EditableTemplate;
  className?: string;
  /** Fixed pixel width of the preview container */
  width?: number;
}

const FieldPreview: React.FC<{ field: TemplateField; scale: number }> = ({ field, scale }) => {
  const base: React.CSSProperties = {
    position: 'absolute',
    left: `${field.position.x}%`,
    top: `${field.position.y}%`,
    width: `${field.position.width}%`,
    height: `${field.position.height}%`,
    overflow: 'hidden',
    zIndex: field.position.zIndex ?? 0,
    transform: field.position.rotation ? `rotate(${field.position.rotation}deg)` : undefined,
  };

  switch (field.type) {
    case 'text':
    case 'textarea': {
      const fs = Math.max(3, Math.min((field.style.fontSize ?? 14) * scale, 14));
      return (
        <div
          style={{
            ...base,
            color: field.style.color ?? '#1a1a1a',
            fontSize: `${fs}px`,
            fontWeight: (field.style.fontWeight as any) ?? 'normal',
            textAlign: (field.style.textAlign as any) ?? 'left',
            lineHeight: 1.15,
            letterSpacing: field.style.letterSpacing ? `${field.style.letterSpacing * scale * 0.3}px` : undefined,
            textTransform: (field.style.textTransform as any) ?? 'none',
            fontStyle: (field.style.fontStyle as any) ?? 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              field.style.textAlign === 'center'
                ? 'center'
                : field.style.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
            opacity: field.style.opacity ?? 1,
          }}
        >
          <span className="truncate leading-tight">{field.placeholder ?? field.defaultValue ?? field.name}</span>
        </div>
      );
    }

    case 'shape':
      return (
        <div
          style={{
            ...base,
            backgroundColor: field.style.backgroundColor,
            borderColor: field.style.borderColor,
            borderWidth: field.style.borderWidth ? `${Math.max(1, field.style.borderWidth * scale)}px` : undefined,
            borderStyle: (field.style.borderStyle as any) ?? (field.style.borderWidth ? 'solid' : undefined),
            borderRadius: field.style.borderRadius ? `${field.style.borderRadius * scale}px` : undefined,
            opacity: field.style.opacity ?? 1,
          }}
        />
      );

    case 'divider':
      return (
        <div
          style={{
            ...base,
            backgroundColor: field.style.backgroundColor ?? '#cccccc',
            opacity: field.style.opacity ?? 1,
          }}
        />
      );

    case 'logo':
      return (
        <div
          style={{
            ...base,
            border: '1px dashed',
            borderColor: 'rgba(128,128,128,0.35)',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.5,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2/5 h-2/5 opacity-40">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      );

    case 'image':
      return (
        <div
          style={{
            ...base,
            backgroundColor: 'rgba(128,128,128,0.12)',
            borderRadius: field.style.borderRadius ? `${field.style.borderRadius * scale}px` : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-1/3 h-1/3 opacity-25">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      );

    case 'qrcode':
      return (
        <div
          style={{
            ...base,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="w-3/4 h-3/4 grid grid-cols-3 grid-rows-3 gap-[1px]">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={cn("rounded-[0.5px]", [0,2,3,6].includes(i) ? "bg-black/60" : "bg-black/15")} />
            ))}
          </div>
        </div>
      );

    case 'icon':
      return (
        <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center', color: field.style.color ?? '#666', fontSize: `${Math.max(6, 20 * scale)}px` }}>
          {field.placeholder ?? '★'}
        </div>
      );

    default:
      return null;
  }
};

export const TemplatePreviewRenderer: React.FC<TemplatePreviewRendererProps> = ({
  template,
  className,
  width = 180,
}) => {
  const { dimensions, background } = template;
  const aspectRatio = dimensions.widthInches / dimensions.heightInches;
  const height = width / aspectRatio;
  const scale = width / (dimensions.widthPx || width);

  const bgStyle: React.CSSProperties = (() => {
    switch (background.type) {
      case 'solid':
        return { backgroundColor: background.value === 'transparent' ? '#e5e7eb' : background.value };
      case 'gradient':
        return { background: background.value };
      case 'pattern':
      case 'image':
        return { backgroundColor: '#e5e7eb', backgroundImage: `url(${background.value})`, backgroundSize: 'cover' };
      default:
        return { backgroundColor: '#ffffff' };
    }
  })();

  return (
    <div
      className={cn('relative overflow-hidden rounded-md', className)}
      style={{ width, height: Math.min(height, width * 1.4), ...bgStyle }}
    >
      {background.overlay && (
        <div className="absolute inset-0" style={{ backgroundColor: background.overlay }} />
      )}
      {template.fields.map(field => (
        <FieldPreview key={field.id} field={field} scale={scale} />
      ))}
    </div>
  );
};

export default TemplatePreviewRenderer;
