import React, { useState } from 'react';
import { TimelineItem } from '../types';
import {
  Clock,
  Plus,
  Trash2,
  GripVertical,
  MapPin,
  User,
  Timer,
  Calendar,
  Download,
  Copy,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { v4 as uuidv4 } from 'uuid';

interface TimelineBuilderProps {
  items: TimelineItem[];
  onUpdateItems: (items: TimelineItem[]) => void;
  eventDate?: string;
}

const TimelineBuilder: React.FC<TimelineBuilderProps> = ({
  items,
  onUpdateItems,
  eventDate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<TimelineItem>>({
    time: '09:00',
    duration: 60,
  });

  const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const totalDuration = items.reduce((sum, item) => sum + (item.duration || 0), 0);

  const handleAddItem = () => {
    if (!newItem.title || !newItem.time) return;

    const item: TimelineItem = {
      id: uuidv4(),
      time: newItem.time,
      title: newItem.title,
      description: newItem.description,
      location: newItem.location,
      responsible: newItem.responsible,
      duration: newItem.duration,
    };

    onUpdateItems([...items, item]);
    setNewItem({ time: '09:00', duration: 60 });
    setShowAddForm(false);
  };

  const handleUpdateItem = (id: string, updates: Partial<TimelineItem>) => {
    onUpdateItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter(item => item.id !== id));
  };

  const handleDuplicate = (item: TimelineItem) => {
    const newTime = new Date(`2000-01-01T${item.time}`);
    newTime.setMinutes(newTime.getMinutes() + (item.duration || 60));
    const timeStr = newTime.toTimeString().slice(0, 5);

    onUpdateItems([...items, {
      ...item,
      id: uuidv4(),
      time: timeStr,
      title: `${item.title} (Copy)`,
    }]);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleExportTimeline = () => {
    let text = `EVENT TIMELINE\n`;
    if (eventDate) text += `Date: ${eventDate}\n`;
    text += `\n${'='.repeat(50)}\n\n`;

    sortedItems.forEach(item => {
      text += `${item.time} - ${item.title}\n`;
      if (item.duration) text += `   Duration: ${formatDuration(item.duration)}\n`;
      if (item.location) text += `   Location: ${item.location}\n`;
      if (item.responsible) text += `   Lead: ${item.responsible}\n`;
      if (item.description) text += `   ${item.description}\n`;
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-timeline.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            {eventDate ? new Date(eventDate).toLocaleDateString() : 'Date TBD'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">{items.length} events</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Timer className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">{formatDuration(totalDuration)} total</span>
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleExportTimeline}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Button size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Event
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              type="time"
              value={newItem.time || '09:00'}
              onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
            />
            <Input
              placeholder="Event Title *"
              value={newItem.title || ''}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="sm:col-span-2"
            />
            <Input
              type="number"
              placeholder="Duration (min)"
              value={newItem.duration || ''}
              onChange={(e) => setNewItem({ ...newItem, duration: parseInt(e.target.value) || undefined })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Location"
              value={newItem.location || ''}
              onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
            />
            <Input
              placeholder="Responsible Person"
              value={newItem.responsible || ''}
              onChange={(e) => setNewItem({ ...newItem, responsible: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Description / Notes"
            value={newItem.description || ''}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            rows={2}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddItem} disabled={!newItem.title}>
              Add to Timeline
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        {sortedItems.length > 0 && (
          <div className="absolute left-[52px] top-0 bottom-0 w-0.5 bg-border" />
        )}

        <div className="space-y-4">
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No timeline events yet</p>
              <p className="text-sm mt-1">Add your first event to build your schedule</p>
            </div>
          ) : (
            sortedItems.map((item, index) => (
              <div key={item.id} className="flex gap-4 relative">
                {/* Time Column */}
                <div className="w-14 text-right flex-shrink-0">
                  <span className="text-sm font-medium text-foreground">{item.time}</span>
                </div>

                {/* Dot */}
                <div className="relative z-10 w-4 h-4 rounded-full bg-primary border-2 border-background flex-shrink-0 mt-1" />

                {/* Content Card */}
                <div className="flex-1 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {formatDuration(item.duration)}
                          </span>
                        )}
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                        )}
                        {item.responsible && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.responsible}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(item)}
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineBuilder;
