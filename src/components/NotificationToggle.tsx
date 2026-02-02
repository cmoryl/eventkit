import React from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationToggleProps {
  className?: string;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({ className }) => {
  const { isSupported, permission, isEnabled, toggleNotifications } = useNotifications();

  if (!isSupported) {
    return null;
  }

  const getIcon = () => {
    if (permission === 'denied') {
      return <BellOff className="w-4 h-4 text-muted-foreground" />;
    }
    if (isEnabled) {
      return <BellRing className="w-4 h-4 text-primary" />;
    }
    return <Bell className="w-4 h-4" />;
  };

  const getTooltip = () => {
    if (permission === 'denied') {
      return 'Notifications blocked by browser';
    }
    if (isEnabled) {
      return 'Notifications enabled (click to disable)';
    }
    return 'Enable notifications for background generation';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={toggleNotifications}
            disabled={permission === 'denied'}
          >
            {getIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltip()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
