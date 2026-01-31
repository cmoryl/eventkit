import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  HelpCircle, 
  Sparkles, 
  Download, 
  Brain, 
  Settings,
  MessageCircleQuestion
} from 'lucide-react';
import { 
  FAQ_ITEMS, 
  FAQ_CATEGORIES, 
  getFAQByCategory, 
  searchFAQ, 
  getFAQStats,
  type FAQItem,
  type FAQCategory 
} from '@/config/faqConfig';
import { cn } from '@/lib/utils';

const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    HelpCircle: <HelpCircle className="w-4 h-4" />,
    Sparkles: <Sparkles className="w-4 h-4" />,
    Download: <Download className="w-4 h-4" />,
    Brain: <Brain className="w-4 h-4" />,
    Settings: <Settings className="w-4 h-4" />,
  };
  return icons[iconName] || <HelpCircle className="w-4 h-4" />;
};

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <motion.div
      className={cn(
        "border rounded-xl overflow-hidden transition-colors",
        isOpen ? "border-primary/30 bg-primary/5" : "border-border/50 hover:border-border"
      )}
      initial={false}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
      >
        <span className={cn(
          "font-medium transition-colors",
          isOpen ? "text-primary" : "text-foreground"
        )}>
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-shrink-0",
            isOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface FAQSectionProps {
  className?: string;
  maxItems?: number;
  showSearch?: boolean;
  showCategories?: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({ 
  className = '', 
  maxItems,
  showSearch = true,
  showCategories = true,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const stats = useMemo(() => getFAQStats(), []);

  const filteredItems = useMemo(() => {
    let items = FAQ_ITEMS;
    
    if (searchQuery.trim()) {
      items = searchFAQ(searchQuery);
    } else if (selectedCategory) {
      items = getFAQByCategory(selectedCategory as FAQItem['category']);
    }
    
    if (maxItems) {
      items = items.slice(0, maxItems);
    }
    
    return items;
  }, [searchQuery, selectedCategory, maxItems]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className={cn("py-16 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <MessageCircleQuestion className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about generating professional event design kits
          </p>
        </motion.div>

        {/* Search */}
        {showSearch && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedCategory(null);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        {showCategories && !searchQuery && (
          <motion.div 
            className="flex flex-wrap gap-2 mb-8 justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              All ({stats.totalQuestions})
            </button>
            {FAQ_CATEGORIES.map((cat) => {
              const count = getFAQByCategory(cat.id as FAQItem['category']).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.gradient} text-white`
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {getCategoryIcon(cat.icon)}
                  {cat.label} ({count})
                </button>
              );
            })}
          </motion.div>
        )}

        {/* FAQ Items */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index }}
              >
                <FAQAccordionItem
                  item={item}
                  isOpen={openItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No questions found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats Footer */}
        <motion.div 
          className="mt-10 pt-8 border-t border-border/50 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for?{' '}
            <span className="text-primary font-medium">
              Our AI learns from your feedback to improve over time.
            </span>
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
            <span>{stats.totalQuestions} questions</span>
            <span>•</span>
            <span>{stats.assetCategories} asset categories</span>
            <span>•</span>
            <span>50+ asset types</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
