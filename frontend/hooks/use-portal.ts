'use client';

import { useState, useCallback } from 'react';

export function usePortalNotification() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(Math.max(0, count));
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
    updateUnreadCount,
    markAllAsRead,
  };
}
