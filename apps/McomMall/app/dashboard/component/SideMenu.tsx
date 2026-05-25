'use client';

import { MenuContent } from './MenuContent';

interface SideMenuProps {
  isCollapsed?: boolean;
}

const SideMenu = ({ isCollapsed }: SideMenuProps) => {
  return (
    <aside className={`w-full p-4 bg-gray-100 rounded-2xl hide-scrollbar transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
      <MenuContent isCollapsed={isCollapsed} />
    </aside>
  );
};

export default SideMenu;
