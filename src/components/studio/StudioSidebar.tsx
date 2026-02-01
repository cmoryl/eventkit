import React from 'react';
import { motion } from 'framer-motion';
import { StudioDefinition } from '@/types/studio.types';
import { cn } from '@/lib/utils';

interface StudioSidebarProps {
  studio: StudioDefinition;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  studio,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <aside className="w-64 border-r border-border bg-card/30 min-h-[calc(100vh-65px)] hidden lg:block">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Categories
        </h3>
        
        <nav className="space-y-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
              activeCategory === 'all'
                ? `bg-gradient-to-r ${studio.gradient} text-white shadow-md`
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="font-medium">All Assets</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              activeCategory === 'all'
                ? "bg-white/20"
                : "bg-muted"
            )}>
              {studio.assetTypes.length}
            </span>
          </button>
          
          {studio.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
                activeCategory === category.id
                  ? `bg-gradient-to-r ${studio.gradient} text-white shadow-md`
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="font-medium">{category.name}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                activeCategory === category.id
                  ? "bg-white/20"
                  : "bg-muted"
              )}>
                {category.assetTypes.length}
              </span>
            </button>
          ))}
        </nav>
        
        {/* Features Section */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Studio Features
          </h3>
          
          <div className="space-y-2">
            {studio.features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5",
                  feature.enabled ? "bg-emerald-500" : "bg-muted-foreground"
                )} />
                <div>
                  <p className="text-xs font-medium text-foreground">{feature.name}</p>
                  <p className="text-[10px] text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
