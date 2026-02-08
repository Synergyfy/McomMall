'use client';

import { MenuContent } from './MenuContent';

const SideMenu = () => {
  return (
    <aside className="w-full  p-4 bg-gray-100 rounded-2xl hide-scrollbar">
      <MenuContent />
    </aside>
  );
};

export default SideMenu;
