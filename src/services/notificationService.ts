// Browser notification service for generation completion alerts

export type NotificationPermission = 'granted' | 'denied' | 'default';

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission as NotificationPermission;
    }
  }

  // Check if notifications are supported
  get supported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  get permissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Check if tab is in background
  get isTabHidden(): boolean {
    return document.hidden;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result as NotificationPermission;
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // Show a notification
  show(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported || this.permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Focus window on click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Show generation complete notification (only if tab is hidden)
  showGenerationComplete(completedCount: number, failedCount: number): void {
    if (!this.isTabHidden) return;

    const title = failedCount > 0
      ? `Generation Complete (${failedCount} failed)`
      : 'Generation Complete!';

    const body = failedCount > 0
      ? `${completedCount} assets generated successfully, ${failedCount} failed.`
      : `All ${completedCount} assets generated successfully!`;

    this.show(title, {
      body,
      tag: 'generation-complete',
      requireInteraction: false,
    });
  }

  // Show single asset complete notification
  showAssetComplete(assetTitle: string, remaining: number): void {
    if (!this.isTabHidden) return;

    this.show('Asset Generated', {
      body: `${assetTitle} complete. ${remaining} remaining.`,
      tag: 'asset-complete',
      silent: true,
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService();
