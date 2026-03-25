import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { isSidebarCollapsedAtom } from '@/store/chatAtom';

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useAtom(isSidebarCollapsedAtom);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, [setIsCollapsed]);

  return {
    isCollapsed,
    toggleSidebar,
  };
};
