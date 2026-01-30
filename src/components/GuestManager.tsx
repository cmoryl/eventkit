import React, { useState } from 'react';
import { GuestInfo } from '../types';
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Mail, 
  Building2, 
  Utensils, 
  Crown, 
  Check, 
  X, 
  Clock,
  Download,
  Upload,
  Search,
  Filter,
  Users,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { v4 as uuidv4 } from 'uuid';

interface GuestManagerProps {
  guests: GuestInfo[];
  onUpdateGuests: (guests: GuestInfo[]) => void;
  maxTables?: number;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Nut-Free',
  'Dairy-Free',
  'Halal',
  'Kosher',
  'Pescatarian',
];

const GuestManager: React.FC<GuestManagerProps> = ({ 
  guests, 
  onUpdateGuests,
  maxTables = 50 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState<Partial<GuestInfo>>({
    rsvpStatus: 'pending',
    vipStatus: false,
    plusOne: false,
  });

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || guest.rsvpStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    vip: guests.filter(g => g.vipStatus).length,
  };

  const handleAddGuest = () => {
    if (!newGuest.name) return;
    
    const guest: GuestInfo = {
      id: uuidv4(),
      name: newGuest.name,
      email: newGuest.email,
      company: newGuest.company,
      tableNumber: newGuest.tableNumber,
      mealPreference: newGuest.mealPreference,
      dietaryRestrictions: newGuest.dietaryRestrictions,
      rsvpStatus: newGuest.rsvpStatus || 'pending',
      vipStatus: newGuest.vipStatus || false,
      plusOne: newGuest.plusOne || false,
    };

    onUpdateGuests([...guests, guest]);
    setNewGuest({ rsvpStatus: 'pending', vipStatus: false, plusOne: false });
    setShowAddForm(false);
  };

  const handleUpdateGuest = (id: string, updates: Partial<GuestInfo>) => {
    onUpdateGuests(guests.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const handleDeleteGuest = (id: string) => {
    onUpdateGuests(guests.filter(g => g.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Table', 'Meal', 'Dietary', 'RSVP', 'VIP', 'Plus One'];
    const rows = guests.map(g => [
      g.name,
      g.email || '',
      g.company || '',
      g.tableNumber || '',
      g.mealPreference || '',
      g.dietaryRestrictions?.join('; ') || '',
      g.rsvpStatus,
      g.vipStatus ? 'Yes' : 'No',
      g.plusOne ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Total</span>
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
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <X className="w-4 h-4" />
            <span className="text-xs">Declined</span>
          </div>
          <p className="text-2xl font-bold text-rose-600">{stats.declined}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Crown className="w-4 h-4" />
            <span className="text-xs">VIP</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.vip}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Add Guest Form */}
      {showAddForm && (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4 animate-fade-in">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add New Guest
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Full Name *"
              value={newGuest.name || ''}
              onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={newGuest.email || ''}
              onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
            />
            <Input
              placeholder="Company"
              value={newGuest.company || ''}
              onChange={(e) => setNewGuest({ ...newGuest, company: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Table #"
              min={1}
              max={maxTables}
              value={newGuest.tableNumber || ''}
              onChange={(e) => setNewGuest({ ...newGuest, tableNumber: parseInt(e.target.value) || undefined })}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={newGuest.vipStatus || false}
                onChange={(e) => setNewGuest({ ...newGuest, vipStatus: e.target.checked })}
                className="rounded border-border"
              />
              <Crown className="w-4 h-4 text-purple-500" />
              VIP Guest
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={newGuest.plusOne || false}
                onChange={(e) => setNewGuest({ ...newGuest, plusOne: e.target.checked })}
                className="rounded border-border"
              />
              <UserPlus className="w-4 h-4 text-primary" />
              Plus One
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddGuest} disabled={!newGuest.name}>
              Add Guest
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Guest List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No guests found</p>
            <p className="text-sm mt-1">Add your first guest to get started</p>
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                    guest.vipStatus ? 'bg-purple-500' : 'bg-primary'
                  }`}>
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">{guest.name}</h4>
                      {guest.vipStatus && <Crown className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                      {guest.plusOne && <UserPlus className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      {guest.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" />
                          {guest.email}
                        </span>
                      )}
                      {guest.company && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3" />
                          {guest.company}
                        </span>
                      )}
                      {guest.tableNumber && (
                        <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                          Table {guest.tableNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={guest.rsvpStatus}
                    onChange={(e) => handleUpdateGuest(guest.id, { rsvpStatus: e.target.value as GuestInfo['rsvpStatus'] })}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${
                      guest.rsvpStatus === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : guest.rsvpStatus === 'declined'
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteGuest(guest.id)}
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

export default GuestManager;
