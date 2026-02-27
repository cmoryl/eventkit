import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Check, ChevronDown, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BrandEvent {
  knowledgeId: string;
  key: string;
  name: string;
  date?: string;
  location?: string;
  venue?: string;
  expectedAttendees?: number;
  brandId: string;
}

interface BrandEventSelectorProps {
  activeBrandId: string;
  className?: string;
  onEventSelected?: (event: BrandEvent | null) => void;
}

export const BrandEventSelector: React.FC<BrandEventSelectorProps> = ({
  activeBrandId,
  className,
  onEventSelected,
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<BrandEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<BrandEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!user || !activeBrandId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_knowledge')
        .select('id, key, value, category')
        .eq('user_id', user.id)
        .eq('knowledge_type', 'brand_preference')
        .like('key', `brandhub_event_${activeBrandId}%`);

      if (error) throw error;

      const parsed: BrandEvent[] = (data || []).map((row) => {
        const val = row.value as Record<string, unknown>;
        return {
          knowledgeId: row.id,
          key: row.key,
          name: (val.name as string) || (row.category as string) || 'Unnamed Event',
          date: val.date as string | undefined,
          location: (val.location as string) || (val.venue as string) || undefined,
          venue: val.venue as string | undefined,
          expectedAttendees: val.expectedAttendees as number | undefined,
          brandId: activeBrandId,
        };
      });

      setEvents(parsed);

      // Auto-select first event if none active or active doesn't belong to this brand
      if (parsed.length > 0 && (!activeEvent || activeEvent.brandId !== activeBrandId)) {
        setActiveEvent(parsed[0]);
        onEventSelected?.(parsed[0]);
      } else if (parsed.length === 0) {
        setActiveEvent(null);
        onEventSelected?.(null);
      }
    } catch (err) {
      console.error('Failed to load brand events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeBrandId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (events.length === 0) return null;

  const handleSelect = (event: BrandEvent) => {
    setActiveEvent(event);
    onEventSelected?.(event);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all",
            "bg-muted/50 hover:bg-muted border border-border/50 text-foreground",
            className
          )}
        >
          <CalendarDays className="w-3 h-3 text-muted-foreground" />
          <span className="max-w-[120px] truncate">
            {activeEvent?.name || 'Select Event'}
          </span>
          {events.length > 1 && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-1.5 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Brand Events
          </p>
        </div>
        {events.map((event) => (
          <DropdownMenuItem
            key={event.knowledgeId}
            onClick={() => handleSelect(event)}
            className="gap-2 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{event.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {event.date && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <CalendarDays className="w-2.5 h-2.5" />
                    {event.date}
                  </span>
                )}
                {event.location && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                    <MapPin className="w-2.5 h-2.5" />
                    {event.location}
                  </span>
                )}
                {event.expectedAttendees && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {event.expectedAttendees}
                  </span>
                )}
              </div>
            </div>
            {activeEvent?.knowledgeId === event.knowledgeId && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
