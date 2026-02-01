import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, FolderOpen, Database, Key, 
  LogOut, ChevronDown, Shield, Palette, Bell,
  CreditCard, HelpCircle, ExternalLink
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface UserAdminDropdownProps {
  user: SupabaseUser;
  onSignOut: () => void;
}

export const UserAdminDropdown: React.FC<UserAdminDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuSections = [
    {
      title: 'Projects',
      items: [
        { icon: FolderOpen, label: 'My Projects', action: () => {}, badge: null },
        { icon: Palette, label: 'Design Templates', action: () => {}, badge: 'New' },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Account Settings', action: () => {}, badge: null },
        { icon: Bell, label: 'Notifications', action: () => {}, badge: '3' },
        { icon: CreditCard, label: 'Billing & Plans', action: () => {}, badge: null },
      ]
    },
    {
      title: 'Administration',
      items: [
        { icon: Database, label: 'Database Connections', action: () => {}, badge: null },
        { icon: Key, label: 'API Keys', action: () => {}, badge: null },
        { icon: Shield, label: 'Admin Panel', action: () => navigate('/admin'), badge: null },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Documentation', action: () => {}, badge: null },
      ]
    }
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/50 border border-border hover:border-primary/50 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
              {initials}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-foreground leading-tight">{displayName}</p>
          <p className="text-xs text-muted-foreground leading-tight truncate max-w-[120px]">{email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-card border border-border shadow-xl overflow-hidden z-50"
          >
            {/* User Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{email}</p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Pro Account
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="max-h-[400px] overflow-y-auto">
              {menuSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  <div className="px-4 py-2 bg-muted/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </p>
                  </div>
                  <div className="py-1">
                    {section.items.map((item, itemIndex) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-border p-2">
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
