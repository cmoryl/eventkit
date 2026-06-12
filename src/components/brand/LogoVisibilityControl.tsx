import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import type { LogoVisibilityMode } from '@/services/logoVisibilityService';
import { getLogoVisibilityMode, setLogoVisibilityMode } from '@/services/logoVisibilityService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const options: Array<{
  value: LogoVisibilityMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    value: 'auto',
    label: 'Auto logo',
    icon: Sparkles,
    description: 'Required on brand-facing assets, optional/hidden on functional assets.',
  },
  {
    value: 'visible',
    label: 'Logo visible',
    icon: Eye,
    description: 'Ask generation to include the supplied logo on every visual asset.',
  },
  {
    value: 'hidden',
    label: 'Logo hidden',
    icon: EyeOff,
    description: 'Keep brand look and feel but do not place the logo on generated assets.',
  },
];

interface LogoVisibilityControlProps {
  compact?: boolean;
  className?: string;
  value?: LogoVisibilityMode;
  onChange?: (mode: LogoVisibilityMode) => void;
}

export const LogoVisibilityControl: React.FC<LogoVisibilityControlProps> = ({ compact = false, className, value, onChange }) => {
  const [internalMode, setInternalMode] = useState<LogoVisibilityMode>(() => getLogoVisibilityMode());
  const mode = value || internalMode;
  const activeOption = useMemo(() => options.find((option) => option.value === mode) || options[0], [mode]);

  const updateMode = (nextMode: LogoVisibilityMode) => {
    setLogoVisibilityMode(nextMode);
    setInternalMode(nextMode);
    onChange?.(nextMode);
    toast.success(`Logo visibility set to ${options.find((option) => option.value === nextMode)?.label}`);
  };

  if (compact) {
    return (
      <select
        className={cn('rounded-xl border border-border bg-background px-3 py-2 text-sm', className)}
        value={mode}
        onChange={(event) => updateMode(event.target.value as LogoVisibilityMode)}
        title={activeOption.description}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4', className)}>
      <div className="mb-3">
        <div className="text-sm font-semibold">Logo visibility</div>
        <p className="text-xs text-muted-foreground mt-1">Control whether the supplied brand logo appears on future generated assets.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === mode;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateMode(option.value)}
              className={cn(
                'rounded-xl border px-3 py-3 text-left transition hover:bg-secondary',
                isActive ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background'
              )}
            >
              <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4" />{option.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LogoVisibilityControl;
