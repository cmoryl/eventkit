import { useEffect, useCallback, useRef } from 'react';

export interface PresenterSyncMessage {
  type: 'slide_change' | 'ping' | 'pong' | 'close';
  slideIndex?: number;
  timestamp?: number;
}

const CHANNEL_NAME = 'edk-presenter-sync';

export function usePresenterSync(
  onSlideChange?: (index: number) => void,
  onAudienceConnected?: () => void,
  onAudienceDisconnected?: () => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isConnectedRef = useRef(false);
  const onSlideChangeRef = useRef(onSlideChange);
  const onAudienceConnectedRef = useRef(onAudienceConnected);
  const onAudienceDisconnectedRef = useRef(onAudienceDisconnected);

  useEffect(() => {
    onSlideChangeRef.current = onSlideChange;
    onAudienceConnectedRef.current = onAudienceConnected;
    onAudienceDisconnectedRef.current = onAudienceDisconnected;
  });

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    const handleMessage = (event: MessageEvent<PresenterSyncMessage>) => {
      const { type, slideIndex } = event.data;
      switch (type) {
        case 'slide_change':
          if (slideIndex !== undefined) onSlideChangeRef.current?.(slideIndex);
          break;
        case 'ping':
          channelRef.current?.postMessage({ type: 'pong' });
          break;
        case 'pong':
          if (!isConnectedRef.current) {
            isConnectedRef.current = true;
            onAudienceConnectedRef.current?.();
          }
          break;
        case 'close':
          isConnectedRef.current = false;
          onAudienceDisconnectedRef.current?.();
          break;
      }
    };
    channelRef.current.addEventListener('message', handleMessage);
    return () => {
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
    };
  }, []);

  const broadcastSlideChange = useCallback((index: number) => {
    channelRef.current?.postMessage({ type: 'slide_change', slideIndex: index, timestamp: Date.now() });
  }, []);

  return { broadcastSlideChange };
}
