'use client';
import { useEffect, useCallback } from 'react';

export function useTabSwitch(onTabSwitch?: () => void) {
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      onTabSwitch?.();
    }
  }, [onTabSwitch]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);
}
