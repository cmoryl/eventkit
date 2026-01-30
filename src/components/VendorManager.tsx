import React, { useState } from 'react';
import { VendorInfo } from '../types';
import {
  Store,
  Plus,
  Trash2,
  Mail,
  Phone,
  DollarSign,
  MessageSquare,
  Check,
  Clock,
  FileText,
  Send,
  Building2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { v4 as uuidv4 } from 'uuid';

interface VendorManagerProps {
  vendors: VendorInfo[];
  onUpdateVendors: (vendors: VendorInfo[]) => void;
}

const VENDOR_CATEGORIES = [
  'Venue',
  'Catering',
  'Photography',
  'Videography',
  'DJ / Music',
  'Florist',
  'Decorator',
  'Rentals',
  'Lighting',
  'Sound',
  'Printing',
  'Transportation',
  'Security',
  'Staffing',
  'Entertainment',
  'Other',
];

const VendorManager: React.FC<VendorManagerProps> = ({ vendors, onUpdateVendors }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorInfo | null>(null);
  const [newVendor, setNewVendor] = useState<Partial<VendorInfo>>({
    status: 'contacted',
    category: VENDOR_CATEGORIES[0],
  });

  const stats = {
    total: vendors.length,
    confirmed: vendors.filter(v => v.status === 'confirmed').length,
    quoted: vendors.filter(v => v.status === 'quoted').length,
    booked: vendors.filter(v => v.status === 'booked').length,
    totalCost: vendors.reduce((sum, v) => sum + (v.cost || 0), 0),
  };

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.category) return;

    const vendor: VendorInfo = {
      id: uuidv4(),
      name: newVendor.name,
      category: newVendor.category,
      contactName: newVendor.contactName,
      email: newVendor.email,
      phone: newVendor.phone,
      cost: newVendor.cost,
      status: newVendor.status || 'contacted',
      notes: newVendor.notes,
    };

    onUpdateVendors([...vendors, vendor]);
    setNewVendor({ status: 'contacted', category: VENDOR_CATEGORIES[0] });
    setShowAddForm(false);
  };

  const handleUpdateVendor = (id: string, updates: Partial<VendorInfo>) => {
    onUpdateVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const handleDeleteVendor = (id: string) => {
    onUpdateVendors(vendors.filter(v => v.id !== id));
    if (selectedVendor?.id === id) setSelectedVendor(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: VendorInfo['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'booked': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'quoted': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Store className="w-4 h-4" />
            <span className="text-xs">Total Vendors</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Check className="w-4 h-4" />
            <span className="text-xs">Confirmed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs">Booked</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.booked}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Quoted</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.quoted}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Total Cost</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalCost)}</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-foreground">Vendor Directory</h3>
        <Button size="sm" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Vendor
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Company Name *"
              value={newVendor.name || ''}
              onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
            />
            <select
              value={newVendor.category}
              onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              {VENDOR_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Input
              placeholder="Contact Name"
              value={newVendor.contactName || ''}
              onChange={(e) => setNewVendor({ ...newVendor, contactName: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={newVendor.email || ''}
              onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              type="tel"
              placeholder="Phone"
              value={newVendor.phone || ''}
              onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Quoted Price"
              value={newVendor.cost || ''}
              onChange={(e) => setNewVendor({ ...newVendor, cost: parseFloat(e.target.value) || undefined })}
            />
            <select
              value={newVendor.status}
              onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value as VendorInfo['status'] })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="booked">Booked</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>
          <Textarea
            placeholder="Notes..."
            value={newVendor.notes || ''}
            onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
            rows={2}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddVendor} disabled={!newVendor.name}>
              Add Vendor
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Vendor List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {vendors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No vendors added yet</p>
            <p className="text-sm mt-1">Add your first vendor to start managing contracts</p>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{vendor.name}</h4>
                      <span className="text-xs text-muted-foreground">{vendor.category}</span>
                    </div>
                  </div>
                  
                  {vendor.contactName && (
                    <p className="text-sm text-muted-foreground mb-1">{vendor.contactName}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {vendor.email && (
                      <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Mail className="w-3 h-3" />
                        {vendor.email}
                      </a>
                    )}
                    {vendor.phone && (
                      <a href={`tel:${vendor.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Phone className="w-3 h-3" />
                        {vendor.phone}
                      </a>
                    )}
                  </div>

                  {vendor.cost && (
                    <p className="text-lg font-semibold text-foreground mt-2">
                      {formatCurrency(vendor.cost)}
                    </p>
                  )}

                  {vendor.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 p-2 bg-secondary/30 rounded">
                      {vendor.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <select
                    value={vendor.status}
                    onChange={(e) => handleUpdateVendor(vendor.id, { status: e.target.value as VendorInfo['status'] })}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(vendor.status)}`}
                  >
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteVendor(vendor.id)}
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

export default VendorManager;
