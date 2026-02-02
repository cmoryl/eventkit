import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationPermission } from '@/services/notificationService';

interface UseNotificationsResult {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  toggleNotifications: () => void;
  notifyGenerationComplete: (completed: number, failed: number) => void;
  notifyAssetComplete: (title: string, remaining: number) => void;
}

const NOTIFICATIONS_ENABLED_KEY = 'eventkit_notifications_enabled';

export function useNotifications(): UseNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.permissionStatus
  );
  const [isEnabled, setIsEnabled] = useState(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return stored === 'true';
  });

  // Sync permission state
  useEffect(() => {
    setPermission(notificationService.permissionStatus);
  }, []);

  // Save enabled state to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(isEnabled));
  }, [isEnabled]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setIsEnabled(true);
      return true;
    }
    return false;
  }, []);

  // Toggle notifications on/off
  const toggleNotifications = useCallback(() => {
    if (!isEnabled && permission !== 'granted') {
      // Need to request permission first
      requestPermission();
    } else {
      setIsEnabled(prev => !prev);
    }
  }, [isEnabled, permission, requestPermission]);

  // Notify generation complete
  const notifyGenerationComplete = useCallback((completed: number, failed: number) => {
    if (isEnabled && permission === 'granted') {
      notificationService.showGenerationComplete(completed, failed);
    }
  }, [isEnabled, permission]);

  // Notify single asset complete
  const notifyAssetComplete = useCallback((title: string, remaining: number) => {
    if (isEnabled && permission === 'granted') {
      notificationService.showAssetComplete(title, remaining);
    }
  }, [isEnabled, permission]);

  return {
    isSupported: notificationService.supported,
    permission,
    isEnabled: isEnabled && permission === 'granted',
    requestPermission,
    toggleNotifications,
    notifyGenerationComplete,
    notifyAssetComplete,
  };
}
