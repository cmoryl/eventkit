import { useState, useEffect, useCallback } from 'react';

interface RecentVenue {
  name: string;
  city: string;
  country: string;
  type: string;
  searchedAt: number;
}

const STORAGE_KEY = 'event-design-kit-recent-venues';
const MAX_RECENT_VENUES = 5;

export const useRecentVenues = () => {
  const [recentVenues, setRecentVenues] = useState<RecentVenue[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentVenue[];
        // Sort by most recent first
        setRecentVenues(parsed.sort((a, b) => b.searchedAt - a.searchedAt));
      }
    } catch (error) {
      console.warn('Failed to load recent venues:', error);
    }
  }, []);

  const addRecentVenue = useCallback((venue: Omit<RecentVenue, 'searchedAt'>) => {
    setRecentVenues(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        v => !(v.name === venue.name && v.city === venue.city)
      );
      
      // Add new venue at the beginning
      const updated = [
        { ...venue, searchedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_VENUES);
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save recent venues:', error);
      }
      
      return updated;
    });
  }, []);

  const clearRecentVenues = useCallback(() => {
    setRecentVenues([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear recent venues:', error);
    }
  }, []);

  return {
    recentVenues,
    addRecentVenue,
    clearRecentVenues,
  };
};

export type { RecentVenue };
