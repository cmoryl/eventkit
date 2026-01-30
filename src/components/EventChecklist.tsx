import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { v4 as uuidv4 } from 'uuid';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItem[];
  isExpanded: boolean;
}

interface EventChecklistProps {
  eventDate?: string;
}

const DEFAULT_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'planning',
    name: '📋 Planning & Strategy',
    isExpanded: true,
    items: [
      { id: uuidv4(), text: 'Define event objectives and KPIs', completed: false, priority: 'high', category: 'planning' },
      { id: uuidv4(), text: 'Create event budget', completed: false, priority: 'high', category: 'planning' },
      { id: uuidv4(), text: 'Select and book venue', completed: false, priority: 'high', category: 'planning' },
      { id: uuidv4(), text: 'Set event date and time', completed: false, priority: 'high', category: 'planning' },
      { id: uuidv4(), text: 'Create project timeline', completed: false, priority: 'medium', category: 'planning' },
    ],
  },
  {
    id: 'branding',
    name: '🎨 Branding & Design',
    isExpanded: true,
    items: [
      { id: uuidv4(), text: 'Design event logo', completed: false, priority: 'high', category: 'branding' },
      { id: uuidv4(), text: 'Create color palette', completed: false, priority: 'high', category: 'branding' },
      { id: uuidv4(), text: 'Generate brand style guide', completed: false, priority: 'medium', category: 'branding' },
      { id: uuidv4(), text: 'Design print materials', completed: false, priority: 'medium', category: 'branding' },
      { id: uuidv4(), text: 'Create social media templates', completed: false, priority: 'medium', category: 'branding' },
    ],
  },
  {
    id: 'marketing',
    name: '📣 Marketing & Promotion',
    isExpanded: false,
    items: [
      { id: uuidv4(), text: 'Create marketing plan', completed: false, priority: 'high', category: 'marketing' },
      { id: uuidv4(), text: 'Set up event website/landing page', completed: false, priority: 'high', category: 'marketing' },
      { id: uuidv4(), text: 'Launch social media campaign', completed: false, priority: 'medium', category: 'marketing' },
      { id: uuidv4(), text: 'Send email invitations', completed: false, priority: 'high', category: 'marketing' },
      { id: uuidv4(), text: 'Create press release', completed: false, priority: 'low', category: 'marketing' },
    ],
  },
  {
    id: 'logistics',
    name: '🚚 Logistics & Operations',
    isExpanded: false,
    items: [
      { id: uuidv4(), text: 'Book catering', completed: false, priority: 'high', category: 'logistics' },
      { id: uuidv4(), text: 'Arrange AV equipment', completed: false, priority: 'high', category: 'logistics' },
      { id: uuidv4(), text: 'Order signage and banners', completed: false, priority: 'medium', category: 'logistics' },
      { id: uuidv4(), text: 'Arrange transportation', completed: false, priority: 'medium', category: 'logistics' },
      { id: uuidv4(), text: 'Confirm vendor contracts', completed: false, priority: 'high', category: 'logistics' },
    ],
  },
  {
    id: 'dayof',
    name: '🎉 Day-of Execution',
    isExpanded: false,
    items: [
      { id: uuidv4(), text: 'Brief staff and volunteers', completed: false, priority: 'high', category: 'dayof' },
      { id: uuidv4(), text: 'Set up registration desk', completed: false, priority: 'high', category: 'dayof' },
      { id: uuidv4(), text: 'Test all AV equipment', completed: false, priority: 'high', category: 'dayof' },
      { id: uuidv4(), text: 'Place all signage', completed: false, priority: 'medium', category: 'dayof' },
      { id: uuidv4(), text: 'Final walkthrough', completed: false, priority: 'high', category: 'dayof' },
    ],
  },
  {
    id: 'postevent',
    name: '📊 Post-Event',
    isExpanded: false,
    items: [
      { id: uuidv4(), text: 'Send thank you emails', completed: false, priority: 'high', category: 'postevent' },
      { id: uuidv4(), text: 'Collect feedback surveys', completed: false, priority: 'high', category: 'postevent' },
      { id: uuidv4(), text: 'Process vendor invoices', completed: false, priority: 'medium', category: 'postevent' },
      { id: uuidv4(), text: 'Create post-event report', completed: false, priority: 'medium', category: 'postevent' },
      { id: uuidv4(), text: 'Archive event assets', completed: false, priority: 'low', category: 'postevent' },
    ],
  },
];

const EventChecklist: React.FC<EventChecklistProps> = ({ eventDate }) => {
  const [categories, setCategories] = useState<ChecklistCategory[]>(DEFAULT_CATEGORIES);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const allItems = categories.flatMap(c => c.items);
  const completedCount = allItems.filter(i => i.completed).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      }
      return cat;
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const addItem = (categoryId: string) => {
    if (!newItemText.trim()) return;

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: [...cat.items, {
            id: uuidv4(),
            text: newItemText,
            completed: false,
            priority: 'medium' as const,
            category: categoryId,
          }],
        };
      }
      return cat;
    }));
    setNewItemText('');
    setShowAddItem(null);
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId),
        };
      }
      return cat;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Event Preparation Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
          <div className="text-3xl font-bold text-primary">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
              {allItems.filter(i => !i.completed && i.priority === 'high').length} urgent
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {allItems.filter(i => !i.completed).length} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map(category => {
          const catCompleted = category.items.filter(i => i.completed).length;
          const catTotal = category.items.length;

          return (
            <div key={category.id} className="rounded-xl border border-border overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {category.isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{category.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {catCompleted}/{catTotal}
                </span>
              </button>

              {/* Items */}
              {category.isExpanded && (
                <div className="p-2 space-y-1">
                  {category.items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                        item.completed ? 'bg-secondary/20' : 'bg-background hover:bg-secondary/20'
                      }`}
                    >
                      <button onClick={() => toggleItem(category.id, item.id)}>
                        {item.completed ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {item.text}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)} opacity-60`} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                        onClick={() => deleteItem(category.id, item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Add Item */}
                  {showAddItem === category.id ? (
                    <div className="flex gap-2 p-2">
                      <Input
                        placeholder="New task..."
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem(category.id)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => addItem(category.id)}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddItem(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddItem(category.id)}
                      className="flex items-center gap-2 p-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add task
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventChecklist;
