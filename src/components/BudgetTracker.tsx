import React, { useState } from 'react';
import { BudgetItem } from '../types';
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Check,
  Clock,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { v4 as uuidv4 } from 'uuid';

interface BudgetTrackerProps {
  items: BudgetItem[];
  onUpdateItems: (items: BudgetItem[]) => void;
  totalBudget?: number;
}

const BUDGET_CATEGORIES = [
  'Venue',
  'Catering',
  'Entertainment',
  'Decor',
  'Photography',
  'Videography',
  'Printing',
  'Staffing',
  'Equipment',
  'Marketing',
  'Transportation',
  'Accommodation',
  'Gifts & Favors',
  'Contingency',
  'Other',
];

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  items,
  onUpdateItems,
  totalBudget,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    status: 'pending',
    category: BUDGET_CATEGORIES[0],
  });

  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = items.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const totalPaid = items.filter(i => i.status === 'paid').reduce((sum, item) => sum + (item.actualCost || item.estimatedCost), 0);
  const remaining = (totalBudget || totalEstimated) - totalActual;
  const variance = totalEstimated - totalActual;

  const categoryTotals = BUDGET_CATEGORIES.map(cat => ({
    category: cat,
    estimated: items.filter(i => i.category === cat).reduce((sum, i) => sum + i.estimatedCost, 0),
    actual: items.filter(i => i.category === cat).reduce((sum, i) => sum + (i.actualCost || 0), 0),
  })).filter(c => c.estimated > 0 || c.actual > 0);

  const handleAddItem = () => {
    if (!newItem.description || !newItem.estimatedCost) return;

    const item: BudgetItem = {
      id: uuidv4(),
      category: newItem.category || BUDGET_CATEGORIES[0],
      description: newItem.description,
      estimatedCost: newItem.estimatedCost,
      actualCost: newItem.actualCost,
      vendor: newItem.vendor,
      status: newItem.status || 'pending',
    };

    onUpdateItems([...items, item]);
    setNewItem({ status: 'pending', category: BUDGET_CATEGORIES[0] });
    setShowAddForm(false);
  };

  const handleUpdateItem = (id: string, updates: Partial<BudgetItem>) => {
    onUpdateItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter(item => item.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Total Budget</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBudget || totalEstimated)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalBudget ? 'Set budget' : 'Estimated total'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs">Actual Spent</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalActual)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((totalActual / (totalBudget || totalEstimated)) * 100).toFixed(0)}% of budget
          </p>
        </div>

        <div className={`p-4 rounded-xl ${remaining >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} border`}>
          <div className={`flex items-center gap-2 ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'} mb-2`}>
            {remaining >= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            <span className="text-xs">{remaining >= 0 ? 'Remaining' : 'Over Budget'}</span>
          </div>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Check className="w-4 h-4" />
            <span className="text-xs">Paid</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {items.filter(i => i.status === 'paid').length} of {items.length} items
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="p-4 rounded-xl bg-secondary/20 border border-border">
          <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {categoryTotals.map(cat => {
              const percentage = ((cat.actual || cat.estimated) / (totalBudget || totalEstimated)) * 100;
              const isOverBudget = cat.actual > cat.estimated;
              
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{cat.category}</span>
                    <span className={isOverBudget ? 'text-rose-500' : 'text-muted-foreground'}>
                      {formatCurrency(cat.actual || cat.estimated)} / {formatCurrency(cat.estimated)}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${isOverBudget ? 'bg-rose-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-foreground">Budget Items</h3>
        <Button size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              {BUDGET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Input
              placeholder="Description *"
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Estimated Cost *"
              value={newItem.estimatedCost || ''}
              onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) || 0 })}
            />
            <Input
              placeholder="Vendor (optional)"
              value={newItem.vendor || ''}
              onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddItem} disabled={!newItem.description || !newItem.estimatedCost}>
              Add Item
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No budget items yet</p>
            <p className="text-sm mt-1">Add your first expense to start tracking</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-secondary text-xs font-medium text-muted-foreground">
                      {item.category}
                    </span>
                    {item.vendor && (
                      <span className="text-xs text-muted-foreground truncate">
                        via {item.vendor}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-foreground">{item.description}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Est: {formatCurrency(item.estimatedCost)}
                    </span>
                    <Input
                      type="number"
                      placeholder="Actual"
                      className="w-24 h-7 text-xs"
                      value={item.actualCost || ''}
                      onChange={(e) => handleUpdateItem(item.id, { actualCost: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateItem(item.id, { status: e.target.value as BudgetItem['status'] })}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${
                      item.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : item.status === 'approved'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
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
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;
