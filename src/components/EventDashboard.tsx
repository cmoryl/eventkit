import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  Users,
  DollarSign,
  Store,
  Clock,
  CheckSquare,
  LayoutDashboard,
  Calendar,
  MapPin,
  TrendingUp,
  Package,
} from 'lucide-react';
import GuestManager from './GuestManager';
import BudgetTracker from './BudgetTracker';
import VendorManager from './VendorManager';
import TimelineBuilder from './TimelineBuilder';
import EventChecklist from './EventChecklist';
import { GuestInfo, BudgetItem, VendorInfo, TimelineItem, EventDetails } from '../types';

interface EventDashboardProps {
  eventDetails: EventDetails;
  onClose: () => void;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ eventDetails, onClose }) => {
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<VendorInfo[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  const stats = {
    guests: {
      total: guests.length,
      confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    },
    budget: {
      total: eventDetails.budget || budgetItems.reduce((sum, i) => sum + i.estimatedCost, 0),
      spent: budgetItems.reduce((sum, i) => sum + (i.actualCost || 0), 0),
    },
    vendors: {
      total: vendors.length,
      confirmed: vendors.filter(v => v.status === 'confirmed').length,
    },
    timeline: {
      events: timelineItems.length,
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{eventDetails.name || 'Event'} Dashboard</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  {eventDetails.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(eventDetails.date).toLocaleDateString()}
                    </span>
                  )}
                  {eventDetails.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {eventDetails.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              Back to Studio
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Guests</p>
                <p className="text-2xl font-bold text-foreground">{stats.guests.total}</p>
                <p className="text-xs text-blue-600">{stats.guests.confirmed} confirmed</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.budget.total)}</p>
                <p className="text-xs text-emerald-600">{formatCurrency(stats.budget.spent)} spent</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendors</p>
                <p className="text-2xl font-bold text-foreground">{stats.vendors.total}</p>
                <p className="text-xs text-purple-600">{stats.vendors.confirmed} confirmed</p>
              </div>
              <Store className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Schedule</p>
                <p className="text-2xl font-bold text-foreground">{stats.timeline.events}</p>
                <p className="text-xs text-amber-600">timeline events</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="checklist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Guests</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Vendors</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="mt-6">
            <EventChecklist eventDate={eventDetails.date} />
          </TabsContent>

          <TabsContent value="guests" className="mt-6">
            <GuestManager
              guests={guests}
              onUpdateGuests={setGuests}
              maxTables={eventDetails.expectedAttendees ? Math.ceil(eventDetails.expectedAttendees / 10) : 50}
            />
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <BudgetTracker
              items={budgetItems}
              onUpdateItems={setBudgetItems}
              totalBudget={eventDetails.budget}
            />
          </TabsContent>

          <TabsContent value="vendors" className="mt-6">
            <VendorManager
              vendors={vendors}
              onUpdateVendors={setVendors}
            />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <TimelineBuilder
              items={timelineItems}
              onUpdateItems={setTimelineItems}
              eventDate={eventDetails.date}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventDashboard;
